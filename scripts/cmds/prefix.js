const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.5",
    author: "Edit By Zihad",
    countDown: 5,
    role: 0,
    description: "Change bot's prefix locally or globally (admin only)",
    category: "config",
    guide: {
      en: "   {pn} <new prefix>\n   {pn} <new prefix> -g\n   {pn} reset"
    }
  },

  langs: {
    en: {
      reset: "🔁 Your prefix has been reset to default: %1",
      onlyAdmin: "❌ Only bot admin can change system prefix!",
      confirmGlobal: "⚠ React to confirm system prefix change!",
      confirmThisThread: "⚠ React to confirm chat prefix change!",
      successGlobal: "✅ System prefix changed to: %1",
      successThisThread: "✅ Chat prefix changed to: %1",
      myPrefix:
        "╭━━ [ 𝐌𝐈𝐌-𝐁𝐎𝐓📌 ] ━━╮\n" +
        "┃🔰 𝐇ᴇʏ {userName} বেবি 😗\n" +
        "┃🔰 𝐒ʏsᴛᴇᴍ 𝐏ʀᴇғɪx: ❏ [  %1  ]\n" +
        "┃🔰 𝐂ʜᴀᴛ 𝐏ʀᴇғɪx: ❏ [  %2  ]\n" +
        "┃🔰 𝐌ʏ 𝐍ᴀᴍᴇ: 🎀 𝐌ɪᴍ 𝐁ᴀʙᴇ\n" +
        "┃🔰 𝐎ᴡɴᴇʀ: ⚜️ Z𝗂𝗁𝖺𝖽 𝖠𝗁𝗆𝖾𝖽 \n" +
        "┃🔰www.facebook.com/xxn.zihad\n" +
        "╰━━━━━━━━━━━━━━╯"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) return message.reply(getLang("onlyAdmin"));
      formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(
      args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"),
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang, usersData }) {
    if (event.body?.toLowerCase() === "prefix") {
      const userName = (await usersData.getName(event.senderID)) || "User";
      const prefixMsg = getLang(
        "myPrefix",
        global.GoatBot.config.prefix,
        await utils.getPrefix(event.threadID)
      ).replace("{userName}", userName);

      const userPic = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      return message.reply({
        body: prefixMsg,
        attachment: await global.utils.getStreamFromURL(userPic)
      });
    }
  }
};
