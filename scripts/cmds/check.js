const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "check",
    aliases: ["ck", "ckk", "boxck"],
    version: "2.0",
    author: "Zihad",
    role: 2,
    description: {
      en: "Leave inactive groups after checking activity"
    },
    category: "system",
    guide: {
      en: "outall"
    }
  },

  onStart: async function ({ api, event }) {
    const threadList = await api.getThreadList(100, null, ["INBOX"]);
    let leftCount = 0;
    let failed = 0;

    const currentTime = Date.now();
    const maxInactiveTime = 12 * 60 * 60 * 1000; // 12 hours in ms
    const userName = event.senderID;
    const userInfo = await api.getUserInfo(userName);
    const name = userInfo[userName]?.name || "User";

    await api.sendMessage({
      body: `🔍 Checking all groups for activity, please wait...\nRequested by: ${name}`,
      mentions: [{
        tag: name,
        id: userName
      }]
    }, event.threadID);

    for (const thread of threadList) {
      if (!thread.isGroup) continue;

      try {
        const history = await api.getThreadHistory(thread.threadID, 1, undefined);
        const lastMsgTime = history[0]?.timestamp || 0;
        const lastMsgDate = new Date(lastMsgTime);
        const gap = currentTime - lastMsgTime;

        await api.sendMessage(`📅 Last message was at: ${lastMsgDate.toLocaleString()}`, thread.threadID);

        if (gap > maxInactiveTime) {
          await api.sendMessage("⚠️ No messages in the last 12 hours. Leaving this group...", thread.threadID);
          await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
          leftCount++;
        } else {
          await api.sendMessage("✅ This group is active. Staying here!", thread.threadID);
        }

        await delay(2000); // To avoid spam rate limits
      } catch (err) {
        failed++;
      }
    }

    return api.sendMessage(
      `✅ Left ${leftCount} inactive groups.\n❌ Failed to leave ${failed} groups.`,
      event.threadID
    );
  }
};
