module.exports = {
  config: {
    name: "api",
    version: "1.0",
    author: "Zihad Ahmed",
    countDown: 3,
    role: 0,
    shortDescription: "Get API by name",
    longDescription: "Search and get API links by name",
    category: "tools",
    guide: "{pn} [name] | /api all"
  },

  onStart: async function ({ message, args }) {
    const apis = {
      api: "https://www.noobs-api.rf.gd/dipto",
      apis: [
        "https://www.noobs-api.rf.gd/dipto",
        "https://rest-api-2-d3np.onrender.com/dipto",
        "https://www.noobs-api.000.pe/dipto",
        "https://2l8v4r-10000.csb.app/dipto",
        "https://www.noobs-apis.42web.io",
        "https://www.x-noobs-apis.42web.io/mostakim",
        "https://mostakim.onrender.com/mostakim",
        "https://www.x-noobs-apis.000.pe",
        "https://ytb-five.vercel.app"
      ],
      album: "https://album-api-69.onrender.com",
      ytb: "https://ytb-five.vercel.app",
      baby: "https://simma-baby-69.onrender.com",
      baby2: "https://simma-baby-69.onrender.com",
      teach: "https://pf9d5d-3000.csb.app",
      imgur: "https://qwp8w9-3000.csb.app",
      tv: "https://049c-34-100-213-170.ngrok-free.app/dipto",
      xnil: "https://xnilnew404.onrender.com",
      xnil2: "https://xn.xn.xn.kesug.com/xnil",
      mostakim: "https://www.x-noobs-api.42web.io/",
      nazrul: "https://www.x-noobs-apis.000.pe",
      noob: "https://www.noobs-apis.42web.io"
    };

    const key = args[0]?.toLowerCase();

    if (!key) {
      return message.reply("⚠️ | একটি API নাম লিখো ");
    }

    if (key === "all") {
      let reply = "📦 সমস্ত API লিস্ট:\n\n";
      for (const [name, value] of Object.entries(apis)) {
        if (Array.isArray(value)) {
          reply += `🔹 ${name}:\n${value.map((v, i) => `   ${i + 1}. ${v}`).join("\n")}\n\n`;
        } else {
          reply += `🔹 ${name}: ${value}\n`;
        }
      }
      return message.reply(reply);
    }

    if (apis[key]) {
      if (Array.isArray(apis[key])) {
        return message.reply(`🔹 ${key} API গুলো:\n${apis[key].map((v, i) => `${i + 1}. ${v}`).join("\n")}`);
      } else {
        return message.reply(`🔹 ${key} API:\n${apis[key]}`);
      }
    } else {
      return message.reply(`❌ | '${key}' নামে কোনো API পাওয়া যায়নি!`);
    }
  }
};
