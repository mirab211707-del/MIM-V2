const axios = require('axios');
const apiUrl = "https://www.noobs-api.top/dipto" 
module.exports.config ={
    name: "bomber",
    version: "6.9",
    author: "dipto", 
    countDown: 5,
    role: 2,
    category: "admin",
    description: "call & sms bomber",
    usages: "{pn} number",
    premium: true 
  },

module.exports.onStart = async ({ api, args , message ,}) => {
try{
const number = args[0]
const limit = args[1]
const ok = message.reply("Please wait.....")
const { data } = await axios.get(`${apiUrl}/bomber?number=${number}&limit=${limit || 1}&key=dipto00869`)
message.unsend(ok.messageID)
message.reply(data.message)
    } catch (error) {
      console.error(error);
      message.reply(error.message)
    }
  };
