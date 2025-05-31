module.exports = {
  config: {
    name: "c",
    version: "1.0",
    author: "Zihad",
    description: "Watch for 18+ commands usage in any message and notify owner",
    role: 0,
    category: "system"
  },

  onChat: async function ({ event, api }) {
    try {
      const adultCmdList = ["s3x", "hot", "girl", "sex"];
      const msg = event.body?.trim().toLowerCase();
      if (!msg) return;

      // Check if message starts with / and command is in adultCmdList
      if (msg.startsWith("/")) {
        const cmdName = msg.split(" ")[0].slice(1); // remove "/"
        if (adultCmdList.includes(cmdName)) {
          const targetUID = "10040738582655152"; // your UID
          let senderName = "Unknown";
          try {
            const userInfo = await api.getUserInfo(event.senderID);
            senderName = userInfo[event.senderID]?.name || senderName;
          } catch {}

          const tid = event.threadID;
          const alertMsg = `⚠️ মামা, দেখ \n\n${senderName}এই হালায় /${cmdName}এই কমান্ড ইউজ করছে \n ID: ${tid}`;
          await api.sendMessage(alertMsg, targetUID);
        }
      }
    } catch (e) {
      console.error("Error in watch_18plus_msg:", e);
    }
  }
};
