module.exports = {
  config: {
    name: "op",
    version: "1.0.0",
    author: "your-name",
    role: 0,
    shortDescription: {
      en: "Say hi"
    },
    description: {
      en: "Bot replies hi"
    },
    category: "fun",
    guide: {
      en: "-op"
    }
  },

  onStart: async ({ api, event }) => {
    return api.sendMessage(
      "hi",
      event.threadID,
      event.messageID
    );
  }
};
