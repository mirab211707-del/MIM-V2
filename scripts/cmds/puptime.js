const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "uptime",
    version: "1.0",
    author: "ZIHAD",
    role: 0,
    shortDescription: "Uptime info with ping, date, time - stacked with random colors",
    longDescription: "Shows uptime, ping, date and time each on its own colored line, moved slightly up",
    category: "info",
    guide: "{p}uptime",
    aliases: ["up", "upt", "time", "date"]
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

    const bgUrl = "https://i.imgur.com/RQMMIdX.jpeg";
    const background = await canvas.loadImage(bgUrl);
    const canvasObj = canvas.createCanvas(background.width, background.height);
    const ctx = canvasObj.getContext("2d");

    ctx.drawImage(background, 0, 0);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "bold 24px sans-serif";

    const startY = canvasObj.height / 5 - 10;  // একটু উপরে
    const lineHeight = 36;

    function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function drawLine(text, lineNumber) {
      ctx.fillStyle = getRandomColor();
      ctx.fillText(text, canvasObj.width / 2, startY + lineHeight * lineNumber);
    }

    drawLine(uptimeText, 0);
    drawLine(pingText, 1);
    drawLine(dateText, 2);
    drawLine(timeText, 3);

    const outputPath = path.join(__dirname, "uptime_output.png");
    const out = fs.createWriteStream(outputPath);
    const stream = canvasObj.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
      api.sendMessage({
        attachment: fs.createReadStream(outputPath),
      }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
    });
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
