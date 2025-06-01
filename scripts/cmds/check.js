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
      en: "Use to scan all groups and auto-leave inactive ones"
    }
  },

  onStart: async function ({ api, event }) {
    const threadList = await api.getThreadList(100, null, ["INBOX"]);
    let leftCount = 0;
    let failed = 0;

    const currentTime = Date.now();
    const maxInactiveTime = 12 * 60 * 60 * 1000; // 12 hours in ms
    const userID = event.senderID;
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "User";

    await api.sendMessage({
      body: `🔍 Checking all groups for activity...\nCommand used by: ${userName}`,
      mentions: [{
        tag: userName,
        id: userID
      }]
    }, event.threadID);

    for (const thread of threadList) {
      if (!thread.isGroup) continue;

      try {
        const history = await api.getThreadHistory(thread.threadID, 1, undefined);
        const lastMsgTime = history[0]?.timestamp || 0;
        const lastMsgDate = new Date(lastMsgTime);
        const gap = currentTime - lastMsgTime;

        await api.sendMessage({
          body: `👤 Requested by: ${userName}\n📅 Last message time: ${lastMsgDate.toLocaleString()}`,
          mentions: [{
            tag: userName,
            id: userID
          }]
        }, thread.threadID);

        if (gap > maxInactiveTime) {
          await api.sendMessage({
            body: `⚠️ No messages in the last 12 hours.\n👋 Leaving this group as requested by: ${userName}`,
            mentions: [{
              tag: userName,
              id: userID
            }]
          }, thread.threadID);
          await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
          leftCount++;
        } else {
          await api.sendMessage({
            body: `✅ This group is active.\n🧍‍♂️ Command by: ${userName}`,
            mentions: [{
              tag: userName,
              id: userID
            }]
          }, thread.threadID);
        }

        await delay(2000);
      } catch (err) {
        failed++;
      }
    }

    return api.sendMessage({
      body: `✅ Done!\nLeft ${leftCount} inactive groups.\n❌ Failed to leave ${failed} groups.\n👤 Requested by: ${userName}`,
      mentions: [{
        tag: userName,
        id: userID
      }]
    }, event.threadID);
  }
};
