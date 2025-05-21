module.exports = {
  config: {
    name: "botcheck",
    version: "1.0",
    author: "Zihad",
    description: "Auto detect other bots in groups and leave immediately",
    role: 0,
    category: "system"
  },

  onStart: async function({ api }) {
    const botID = api.getCurrentUserID();
    const targetUIDs = ["61574558282971", "61573003302026", "100003493778403","61575900475866","100090696921210","100094086843454","100077154655350"];
    const adminUID = "100067540204855";

    const threadList = await api.getThreadList(100, null, ["INBOX"]);

    for (const thread of threadList) {
      if (!thread.isGroup) continue;

      const info = await api.getThreadInfo(thread.threadID);
      const memberIDs = info.participantIDs || [];

      const foundBots = targetUIDs.filter(uid => memberIDs.includes(uid));

      if (foundBots.length > 0) {
        const userInfo = await api.getUserInfo(foundBots);
        const botNames = foundBots.map(uid => `${userInfo[uid]?.name || "Unknown"} (${uid})`).join("\n");

        // Send message to the group
        await api.sendMessage(
          `⚠️ Alert! Other bots detected in the group "${info.threadName}":\n${botNames}\n\nTo avoid conflicts, I am leaving the group now. Goodbye!\n\nMy Owner https://www.facebook.com/xxn.zihad `,
          thread.threadID
        );

        // Send private message to admin
        await api.sendMessage(
          `🤖 Alert: Other bots detected in the group "${info.threadName}":\n${botNames}`,
          adminUID
        );

        // Leave the group
        await api.removeUserFromGroup(botID, thread.threadID);
      }
    }
  }
};
