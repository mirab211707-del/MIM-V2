const axios = require("axios");
const fs = require("fs");

const dataPath = __dirname + "/janData.json";

// ensure janData.json file exists
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

function getJanData() {
  return JSON.parse(fs.readFileSync(dataPath));
}
function saveJanData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.jan;
};

async function getBotResponse(message) {
  try {
    const base = await baseApiUrl();
    const response = await axios.get(
      `${base}/jan/font2/${encodeURIComponent(message)}`
    );
    return response.data?.message || "try Again";
  } catch (error) {
    console.error("API Error:", error.message || error);
    return "error janu 🥲";
  }
}

const responses = [
  "babu khuda lagse🥺",
  "Hop beda😾, Boss বল boss😼",
  "আমাকে ডাকলে, আমি কিন্তূ কিস করে দেবো😘",
  "🐒🐒🐒",
  "bye",
  "naw message daw m.me/xxn.zihad",
  "mb ney bye",
  "meww",
  "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
  "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
  "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
  "তুই না বললে চলেই না জান🥺",
  "জান খাইছো? আমারে তো খাইলা না 😼",
  "ঘুমায় পড়ো, স্বপ্নে আসবো 😴💖",
];

module.exports = {
  config: {
    name: "chat",
    version: "2.0",
    author: "MahMUD + Modified by Mim",
    role: 0,
    description: { en: "Auto jan bot with toggle" },
    category: "ai",
    guide: { en: "/chat on: Enable auto reply\n/chat off: Disable auto reply" },
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const data = getJanData();

    const action = args[0]?.toLowerCase();
    if (action === "on") {
      data[threadID] = true;
      saveJanData(data);
      return api.sendMessage("✅ চ্যাট মোড অন করা হয়েছে", threadID);
    } else if (action === "off") {
      delete data[threadID];
      saveJanData(data);
      return api.sendMessage("❌ চ্যাট মোড বন্ধ করা হয়েছে", threadID);
    } else {
      return api.sendMessage("ℹ ব্যবহার: /chat on | /chat off", threadID);
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const message = event.body?.toLowerCase() || "";
    const data = getJanData();
    const chatOn = !!data[threadID];

    const triggers = ["বট"];

    let shouldReply = false;

    if (chatOn) {
      // /chat on → reply to all messages (except commands)
      if (!message.startsWith("/") && message.length > 1) shouldReply = true;
    } else {
      // /chat off → only reply to trigger words
      if (triggers.some((word) => message.startsWith(word))) shouldReply = true;
    }

    if (shouldReply) {
      const userText = triggers.some((word) => message.startsWith(word))
        ? message.split(" ").slice(1).join(" ") || null
        : message;

      const replyText = userText
        ? await getBotResponse(userText)
        : responses[Math.floor(Math.random() * responses.length)];

      api.sendMessage(
        replyText,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "chat",
              type: "reply",
              messageID: info.messageID,
              author: senderID,
              text: replyText,
            });
          }
        },
        event.messageID
      );
    }
  },

  onReply: async function ({ api, event }) {
    const message = event.body?.toLowerCase() || "kire jaan";
    const replyText = await getBotResponse(message);

    api.sendMessage(
      replyText,
      event.threadID,
      (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "chat",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: replyText,
          });
        }
      },
      event.messageID
    );
  },
};
