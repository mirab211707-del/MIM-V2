module.exports = {
  config: {
    name: "everyone-tag",
    version: "1.0",
    author: "ZIHAD",
    countDown: 5,
    role: 0,
    shortDescription: "@everyone tag reply",
    longDescription: "Replies if someone tags @everyone",
    category: "reply"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const body = event.body?.toLowerCase();

    const everyoneResponses = [
      "হ্যাঁ ভাই, সবাইকেই ডাক দিছো? আমি তো আগেই আইছি 😎",
      "আবার @everyone? কই সবাই? আমি তো একাই এলাম 😏",
      "সবাইকে একসাথে ডাকা, ব্যাপারটা দারুন! কিন্তু আমি আলাদা 😌",
      "তুমি যখন @everyone লেখো, মনে হয় তুমি আমারেই খুঁজতেছো 🤭",
      "এই নামটা যতবার দেখি, ততবার প্রেমে পড়ে যাই নতুন করে 🥺"
    ];

    if (body?.includes("@everyone")) {
      const msg = everyoneResponses[Math.floor(Math.random() * everyoneResponses.length)];
      return message.reply(msg);
    }
  }
};