const fs = require("fs");

module.exports = {
  config: {
    name: "🫦",
    version: "1.0",
    author: "ZIHAD", //Don't change the credit because I made it. Any problems to contact me. https://facebook.com/xxn.zihad
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "voice",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    if (event.body) {
      const body = event.body.toLowerCase();
      const keywords = ["🫦", "👄","👅"]; 

      if (keywords.includes(body)) {
        return message.reply({
          body: " ",
          attachment: fs.createReadStream("./scripts/cmds/S1LK2/valo-hobi.mp3"),
        });
      }
    }
  },
};