module.exports.config = {
  name: "emojiAutoReply",
  eventType: ["message"],
  version: "1.0",
  author: "Mim",
  description: "Auto reply to any emoji",
  role: 0,
  shortDescription: {
    en: "Replies with the same emoji sent by user",
  },
};

module.exports.onStart = async function ({ api, event }) {
  try {
    const { threadID, messageID, body } = event;
    if (!body) return;

    // Emoji regex to detect emojis
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const emojis = body.match(emojiRegex);

    if (!emojis) return;

    // Reply with the same emojis
    await api.sendMessage(emojis.join(""), threadID, messageID);
  } catch (e) {
    console.error("emojiAutoReply error:", e);
  }
};
