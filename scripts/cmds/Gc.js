const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "gc",
    version: "1.0",
    author: "Zihad Ahmed",
    countDown: 5,
    role: 1,
    shortDescription: "Group settings changer",
    longDescription: "Change group name, emoji, color, approval, nickname, image easily",
    category: "group",
    guide: {
      en: "{pn} name <new name>\n{pn} emoji <emoji>\n{pn} color <hex/color>\n{pn} approval <on/off>\n{pn} nick @user | nickname\n{pn} image (reply to image)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, mentions, type, messageReply } = event;
    const command = args[0];
    const value = args.slice(1).join(" ");

    if (!command)
      return message.reply("⚙️ | Use:\nname, emoji, color, approval, nick, image");

    switch (command.toLowerCase()) {
      case "name":
        await api.setTitle(value, threadID);
        return message.reply(`✅ | Group name changed to: ${value}`);

      case "emoji":
        await api.changeThreadEmoji(value, threadID);
        return message.reply(`✅ | Emoji changed to: ${value}`);

      case "color":
        await api.changeThreadColor(value, threadID);
        return message.reply(`✅ | Color changed to: ${value}`);

      case "approval":
        const approve = value.toLowerCase();
        if (approve !== "on" && approve !== "off")
          return message.reply("⚠️ | Use 'on' or 'off' only.");
        await api.changeApprovalMode(threadID, approve === "on");
        return message.reply(`✅ | Approval mode set to ${approve}`);

      case "nick":
        if (!mentions || Object.keys(mentions).length === 0 || !value.includes("|"))
          return message.reply("⚠️ | Use like:\n{pn} nick @user | nickname");
        const uid = Object.keys(mentions)[0];
        const nickname = value.split("|")[1].trim();
        await api.changeNickname(nickname, threadID, uid);
        return message.reply(`✅ | Nickname set to "${nickname}"`);

      case "image":
        if (type !== "message_reply" || !messageReply.attachments[0])
          return message.reply("⚠️ | Reply to an image to set as group photo!");
        const imgUrl = messageReply.attachments[0].url;
        const imgPath = __dirname + "/cache/gcimg.jpg";
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
        await api.changeGroupImage(fs.createReadStream(imgPath), threadID);
        fs.unlinkSync(imgPath);
        return message.reply("✅ | Group photo updated!");

      default:
        return message.reply("❌ | Invalid command.\nTry: name, emoji, color, approval, nick, image");
    }
  }
};
