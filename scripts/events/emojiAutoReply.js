module.exports = async function ({ api, event }) {
  // Regex to detect pure emojis (including ZWJ + variation selectors)
  const emojiRegex = /^[\p{Emoji}\u200d\uFE0F\s]+$/u;

  // Check if the message is only emoji(s), max 5 characters
  if (
    event.body &&
    emojiRegex.test(event.body.trim()) &&
    event.body.trim().length <= 5
  ) {
    // Echo the same emoji(s) back
    return api.sendMessage(event.body, event.threadID, event.messageID);
  }
};
