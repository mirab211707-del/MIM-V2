const fs = require("fs");
const filePath = __dirname + "/../kamlalist.json";

module.exports = {
  config: {
    name: "kamlalist",
    version: "1.2",
    author: "rifat",
    role: 1,
    shortDescription: "Manage kamla users list",
    longDescription: "Add, remove, or view users from kamlalist by mention or UID",
    category: "fun",
    guide: {
      en: "{p}kamlalist [uid/@mention]\n{p}kamlalist remove [uid/@mention]\n{p}kamlalist list"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    const kamlas = JSON.parse(fs.readFileSync(filePath));
    const mentions = Object.keys(event.mentions);
    const input = args[0]?.toLowerCase();

    // Show list with names
    if (input === "list") {
      if (kamlas.length === 0) return api.sendMessage("⚠️ | কামলা তালিকায় কেউ নেই।", event.threadID, event.messageID);

      let listMsg = "📄 | কামলা তালিকা:\n\n";
      let count = 1;

      for (const uid of kamlas) {
        try {
          const userInfo = await api.getUserInfo(uid);
          const name = userInfo[uid]?.name || "Unknown";
          listMsg += `${count++}. ${name} (${uid})\n`;
        } catch (e) {
          listMsg += `${count++}. (খুঁজে পাওয়া যায়নি) (${uid})\n`;
        }
      }

      return api.sendMessage(listMsg, event.threadID, event.messageID);
    }

    // Remove user
    if (input === "remove" || input === "rm") {
      const target = mentions[0] || args[1];
      if (!target) return api.sendMessage("⚠️ | একজন UID দিন বা কাউকে মেনশন করুন মুছতে।", event.threadID, event.messageID);

      const index = kamlas.indexOf(target);
      if (index === -1) return api.sendMessage("❌ | এই UID তালিকায় নেই।", event.threadID, event.messageID);

      kamlas.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(kamlas));
      return api.sendMessage(`✅ | UID ${target} কে তালিকা থেকে সরানো হয়েছে।`, event.threadID, event.messageID);
    }

    // Add user
    const target = mentions[0] || args[0];
    if (!target) return api.sendMessage("⚠️ | একজন UID দিন বা কাউকে মেনশন করুন যোগ করতে।", event.threadID, event.messageID);

    if (kamlas.includes(target)) return api.sendMessage("ℹ️ | UID ইতিমধ্যে তালিকায় আছে।", event.threadID, event.messageID);

    kamlas.push(target);
    fs.writeFileSync(filePath, JSON.stringify(kamlas));
    return api.sendMessage(`✅ | UID ${target} কে কামলা তালিকায় যোগ করা হয়েছে।`, event.threadID, event.messageID);
  }
};
