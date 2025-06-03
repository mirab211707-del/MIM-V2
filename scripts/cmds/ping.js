const fs = require("fs");
const path = require("path");
const https = require("https");

const imageUrl = "https://i.imgur.com/CbScwwJ.jpeg";
const localPath = path.join(__dirname, "ping_image.jpg");

module.exports = {
  config: {
    name: "ping",
    version: "1.0",
    author: "Rex",
    countDown: 5,
    role: 0,
    shortDescription: "Check bot speed!",
    longDescription: "Check bot response & uptime with a cute image.",
    category: "Utility",
  },

  // Required by GoatBot even if empty
  onStart: async function () {
    // Nothing needed here for now
  },

  onChat: async function ({ event, message }) {
    if ((event.body || "").toLowerCase() === "ping") {
      const start = Date.now();
      const systemUptime = process.uptime();
      const botUptime = global.botStartTime
        ? Math.floor((Date.now() - global.botStartTime) / 1000)
        : systemUptime;

      const file = fs.createWriteStream(localPath);
      https.get(imageUrl, (response) => {
        response.pipe(file);

        file.on("finish", async () => {
          file.close();

          const ping = Date.now() - start;
          const uptimeFormatted = formatTime(botUptime);

          const body = `
╭━━━⌈ ✨ 𝙿𝙸𝙽𝙶 ✨ ⌋━━━╮

⏳ 𝙿𝙸𝙽𝙶 𝚃𝙸𝙼𝙴: ${ping}ms
🕒 𝚄𝙿𝚃𝙸𝙼𝙴: ${uptimeFormatted}

     (ZIHAD)

╰━━━━━━━━━━━━━━━━━━━━╯
          `.trim();

          await message.reply({
            body,
            attachment: fs.createReadStream(localPath),
          });

          fs.unlink(localPath, () => {});
        });

        file.on("error", (err) => {
          console.error("File download error:", err);
          message.reply("😿 ইমেজ ডাউনলোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করো।");
        });
      }).on("error", (err) => {
        console.error("HTTP error:", err);
        message.reply("🚫 ছবি লোড করতে পারলাম না। লিংক চেক করো!");
      });
    }
  },
};

function formatTime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const h = Math.floor(seconds / 3600);
  seconds %= 3600;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
	      }
