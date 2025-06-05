const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "ai",
    version: "1.8",
    author: "ZIHAD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} on/off or {pn} <question>"
  },

  autoReplyStatus: {}, // threadID: true/false

  onStart: async function({ api, event, args, threadsData }) {
    if (!args.length) {
      return api.sendMessage("Please provide a question or use 'on/off' to toggle auto-reply.", event.threadID, event.messageID);
    }

    const threadID = event.threadID;
    const firstArg = args[0].toLowerCase();

    if (firstArg === "on") {
      this.autoReplyStatus[threadID] = true;
      await threadsData.set(threadID, true, "data.aiAuto");
      return api.sendMessage("✅ AI Auto Reply is now ON! I will reply to all messages automatically.", threadID);
    } else if (firstArg === "off") {
      this.autoReplyStatus[threadID] = false;
      await threadsData.set(threadID, false, "data.aiAuto");
      return api.sendMessage("📛 AI Auto Reply is now OFF! I will only reply when using the /ai command.", threadID);
    }

    // If not toggling auto, treat input as question
    const query = args.join(" ");
    const apiUrl = `${await baseApiUrl()}/api/ai`;

    try {
      const response = await axios.post(
        apiUrl,
        { question: query },
        {
          headers: {
            "Content-Type": "application/json",
            author: module.exports.config.author
          }
        }
      );

      if (response.data.error) {
        return api.sendMessage(response.data.error, threadID, event.messageID);
      }

      api.sendMessage(response.data.response || "Sorry, I couldn't understand your question.", threadID, event.messageID);
    } catch (error) {
      api.sendMessage("There was a problem fetching a response from AI.", threadID, event.messageID);
    }
  },

  onChat: async function({ api, event, threadsData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const message = (event.body || "").trim();

    if (!message) return;
    if (senderID == api.getCurrentUserID()) return;

    // Check if auto-reply is enabled
    let isAutoOn = this.autoReplyStatus[threadID];
    if (typeof isAutoOn === "undefined") {
      isAutoOn = await threadsData.get(threadID, "data.aiAuto");
      this.autoReplyStatus[threadID] = isAutoOn || false;
    }

    if (!isAutoOn) return;

    // Ignore if message starts with /ai
    if (message.toLowerCase().startsWith("/ai")) return;

    const apiUrl = `${await baseApiUrl()}/api/ai`;

    try {
      const response = await axios.post(
        apiUrl,
        { question: message },
        {
          headers: {
            "Content-Type": "application/json",
            author: module.exports.config.author
          }
        }
      );

      if (response.data.error) return;

      api.sendMessage(response.data.response || "Sorry, I couldn't understand that.", threadID);
    } catch (error) {
      // Silent fail
    }
  }
};
