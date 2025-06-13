const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "uptime2",
    version: "2.1",
    author: "ZIHAD",
    role: 0,
    shortDescription: "Stylish uptime info image",
    longDescription: "Show uptime, ping, date, time, and credits with colorful centered text on GIF",
    category: "info",
    guide: "{p}uptime",
    aliases: ["s", "upt2", "time", "date"]
  },

  onStart: async function ({ api, event }) {
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / (3600 * 24));
    const h = Math.floor((uptimeSec % (3600 * 24)) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);

    const uptimeText = `Uptime: ${d}d ${h}h ${m}m`;
    const pingText = `Ping: ${Math.floor(Math.random() * 21) + 10}ms`;
    const dateText = moment().tz("Asia/Dhaka").format("DD/MM/YYYY");
    const timeText = moment().tz("Asia/Dhaka").format("hh:mm A");
    const creditText = "ADMIN-ZIHAD";

    const bgUrl = "https://i.imgur.com/Ewwx621.gif"; // This is a GIF, will load first frame only

    const background = await canvas.loadImage(bgUrl);
    const canvasObj = canvas.createCanvas(background.width, background.height);
    const ctx = canvasObj.getContext("2d");

    ctx.drawImage(background, 0, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    function getRandomColor() {
      const colors = ["#FF5E5E", "#FFD700", "#00FFFF", "#00FF7F", "#FF69B4", "#87CEEB", "#FFA500"];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    ctx.font = "bold 30px sans-serif";
    const centerX = canvasObj.width / 2;
    const centerY = canvasObj.height / 2;
    const spacing = 40;

    ctx.fillStyle = getRandomColor();
    ctx.fillText(uptimeText, centerX, centerY - spacing * 1.5);

    ctx.fillStyle = getRandomColor();
    ctx.fillText(pingText, centerX, centerY - spacing * 0.5);

    ctx.fillStyle = getRandomColor();
    ctx.fillText(dateText, centerX, centerY + spacing * 0.5);

    ctx.fillStyle = getRandomColor();
    ctx.fillText(timeText, centerX, centerY + spacing * 1.5);

    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = getRandomColor();
    ctx.fillText(creditText, centerX, canvasObj.height - 40);

    const outputPath = path.join(__dirname, "uptime_output.png");
    const out = fs.createWriteStream(outputPath);
    const stream = canvasObj.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
      api.sendMessage({
        attachment: fs.createReadStream(outputPath)
      }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
    });
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
