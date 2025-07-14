const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const Canvas = require("canvas");
const GIFEncoder = require("gifencoder");

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

const W = 1000, H = 500, G = 10, FRAME_COUNT = 30;

const COLOR_PALETTE = [
  "#00ffae", "#00b7ff", "#ff0055", "#ffaa00"
];

async function avatar(uid, size = 256) {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?height=${size}&width=${size}&redirect=false&access_token=${FB_ACCESS_TOKEN}`;
    const res = await axios.get(url);
    const imageUrl = res.data?.data?.url;
    if (!imageUrl) return null;
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return await Canvas.loadImage(imgRes.data);
  } catch {
    return null;
  }
}

function getTimeStr(offsetSec = 0) {
  const date = new Date(Date.now() + offsetSec * 1000 + (6 * 60 * 60 * 1000));
  const timeStr = date.toTimeString().split(" ")[0].slice(0, 8);
  const dateStr = date.toLocaleDateString("en-GB");
  return { timeStr, dateStr };
}

function drawRotatingRing(ctx, cx, cy, radius, step, color) {
  for (let i = 0; i < 360; i += 45) {
    let startAngle = ((i + step * 20) % 360) * Math.PI / 180;
    let endAngle = startAngle + (20 * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

async function generateAnimatedCard(uid, name) {
  const avatarImg = await avatar(uid);
  const encoder = new GIFEncoder(W, H);
  const outDir = path.join(__dirname, "cache");
  await fs.ensureDir(outDir);
  const outPath = path.join(outDir, `uptime_${uid}.gif`);
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(150);
  encoder.setQuality(10);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const canvas = Canvas.createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background color cycling
    const bgColor = COLOR_PALETTE[i % COLOR_PALETTE.length];
    ctx.fillStyle = bgColor + "22"; // adding transparency for soft bg
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = COLOR_PALETTE[(i + 1) % COLOR_PALETTE.length];
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 30;
    ctx.fillText("⚡ SYSTEM STATUS", G * 4, G * 8);
    ctx.shadowBlur = 0;

    // Time & Date animated color
    const { timeStr, dateStr } = getTimeStr(i * 2);
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = COLOR_PALETTE[(i + 2) % COLOR_PALETTE.length];
    ctx.fillText(`🕒 ${timeStr}`, G * 25, G * 14);
    ctx.font = "28px Arial";
    ctx.fillText(`📅 ${dateStr}`, G * 25, G * 18);

    // System info text color cycling
    ctx.fillStyle = COLOR_PALETTE[(i + 3) % COLOR_PALETTE.length];
    ctx.font = "26px Arial";
    ctx.fillText("🖥️ Node " + process.version.replace("v", ""), G * 25, G * 22);
    ctx.fillText(`${process.platform()} • ${process.arch()}`, G * 25, G * 25.5);

    // Rotating ring near avatar
    const cx = W - 180, cy = 130;
    const radius = 60;
    const ringColor = COLOR_PALETTE[i % COLOR_PALETTE.length];
    drawRotatingRing(ctx, cx, cy, radius, i, ringColor);

    // Avatar circle
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.closePath();
    if (avatarImg) {
      ctx.save();
      ctx.clip();
      ctx.drawImage(avatarImg, cx - 40, cy - 40, 80, 80);
      ctx.restore();
    } else {
      ctx.fillStyle = "#444466";
      ctx.fill();
    }

    encoder.addFrame(ctx);
  }

  encoder.finish();
  return outPath;
}

module.exports = {
  config: {
    name: "upt",
    version: "3.0",
    author: "Zihad",
    cooldown: 5,
    role: 0,
    shortDescription: "Animated uptime card with color cycling",
    longDescription: "Shows uptime GIF with animated time and color changes",
    category: "uptime",
    guide: "{p}uptime"
  },

  onStart: async ({ api, event }) => {
    try {
      const info = await api.getUserInfo(event.senderID);
      const name = info[event.senderID]?.name || "user";
      const img = await generateAnimatedCard(event.senderID, name);
      await api.sendMessage({
        body: `🌀 Animated System Status for ${name}`,
        attachment: fs.createReadStream(img)
      }, event.threadID, () => fs.unlinkSync(img));
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Could not generate animated uptime card.", event.threadID);
    }
  }
};
