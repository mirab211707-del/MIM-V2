const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "chor",
    version: "1.0.1",
    author: "Gok",
    countDown: 5,
    role: 0,
    shortDescription: "scooby doo template memes",
    longDescription: "scooby doo template memes with user avatar",
    category: "image",
    guide: "{pn} [@mention]",
  },

  circle: async (imageBuffer) => {
    const image = await jimp.read(imageBuffer);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const id = Object.keys(event.mentions)[0] || event.senderID;
      const name = (await usersData.getName(id)) || "User";
      const backgroundUrl = "https://i.imgur.com/ES28alv.png";
      const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      const bg = await loadImage(backgroundUrl);
      const avatarRaw = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
      const avatar = await this.circle(avatarRaw);

      const canvas = createCanvas(500, 670);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(await loadImage(avatar), 48, 410, 111, 111);

      const imagePath = path.join(__dirname, "chor_temp.png");
      fs.writeFileSync(imagePath, canvas.toBuffer());

      await message.reply({
        body: `●❯────────────────❮●         -♦𝐓𝐀𝐍𝐕𝐈𝐑-𝐁𝐎𝐓♦-         ●❯────────────────❮●\nমুরগী'র ডিম চুরি করতে গিয়ে ধরা খাই'ছে__🐣🐸👻\n●❯────────────────❮●`,
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);
    } catch (e) {
      message.reply(`❌ Error: ${e.message}`);
    }
  }
};
