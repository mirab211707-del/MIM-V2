const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "add",
    aliases: ["owneradd", "addowner", "adminadd", "addadmin"],
    version: "1.0",
    author: "Mahi--",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Add the owner to this group chat"
    },
    longDescription: {
      en: "Send the owner an invite and add them to this group if they’re not here yet"
    },
    category: "box chat",
    guide: {
      en: "Just type {pn} to add the owner to the group — easy!"
    }
  },

  langs: {
    en: {
      successAdd: 
`╭─────✦〔 ✅ SUCCESS 〕✦─────╮
┃ 🎉 Owner has joined the group! 
┃    Let the party begin! 🎊
╰─────────────────────────╯`,

      failedAdd:
`╭─────✦〔 ❌ FAILED 〕✦─────╮
┃ ⚠️ Can't add the owner, sorry!
┃    Maybe blocked or restricted.
┃
┃ 🔗 Profile:
┃ https://www.facebook.com/profile.php?id=100067540204855
╰─────────────────────────╯`,

      alreadyInGroup:
`╭─────✦〔 ℹ️ INFO 〕✦─────╮
┃ 👀 Owner’s already here,
┃    no need to add again!
╰─────────────────────────╯`,

      cannotAddUser:
`╭─────✦〔 ⛔️ ERROR 〕✦─────╮
┃ 🤚 Bot can’t add the owner.
┃    Either blocked or owner prefers no random adds.
┃
┃ 🔗 Owner profile:
┃ https://www.facebook.com/profile.php?id=100067540204855
╰─────────────────────────╯`
    }
  },

  onStart: async function ({ message, api, event, threadsData, getLang }) {
    const ownerUid = "100067540204855";
    const { members } = await threadsData.get(event.threadID);

    if (members.some(m => m.userID === ownerUid && m.inGroup)) {
      return message.reply(getLang("alreadyInGroup"));
    }

    try {
      await api.addUserToGroup(ownerUid, event.threadID);
      return message.reply(getLang("successAdd"));
    } catch (error) {
      return message.reply(getLang("cannotAddUser"));
    }
  }
};
