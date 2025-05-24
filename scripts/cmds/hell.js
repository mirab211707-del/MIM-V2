const axios = require("axios");

module.exports = {
  config: {
    name: "mb",
    version: "1.5",
    author: "Zihad",
    countDown: 5,
    role: 0,
    shortDescription: "MB + sim validation + bomber + SMS or reply support",
    category: "fun",
  },

  onStart: async function ({ message, event }) {
    if (!global._mbData) global._mbData = {};
    global._mbData[event.senderID] = { step: 1 };
    return message.reply(
      `👉 আপনি কোন সিম ব্যবহার করেন?\n\n1️⃣ GP\n2️⃣ Banglalink\n3️⃣ Robi\n4️⃣ Airtel\n5️⃣ Teletalk\n\n✍️ একটি সংখ্যা দিন (১-৫), অথবা সরাসরি আপনার ১১ সংখ্যার নাম্বার লিখে পাঠান:`
    );
  },

  onChat: async function ({ event, message }) {
    const sender = event.senderID;
    if (!global._mbData) global._mbData = {};
    let user = global._mbData[sender];

    const text = event.body.trim();

    // যদি ইউজার ডেটা না থাকে, নতুন শুরু
    if (!user) {
      // যদি নাম্বার মনে হয়, সিম ডিডাক্ট কর
      const foundSimID = guessSimByNumber(text);
      if (foundSimID) {
        const simName = getSimName(foundSimID);
        global._mbData[sender] = { step: 3, sim: foundSimID, number: text };
        return message.reply(
          `আপনি ${simName} সিম দিয়েছেন। কত এমবি চান? (যেমন: 500, 1000, 3000)`
        );
      } else {
        global._mbData[sender] = { step: 1 };
        return message.reply(
          `দয়া করে প্রথমে সিম সিলেক্ট করুন:\n\n1️⃣ GP\n2️⃣ Banglalink\n3️⃣ Robi\n4️⃣ Airtel\n5️⃣ Teletalk\n\n✍️ একটি সংখ্যা দিন (১-৫):`
        );
      }
    }

    // Step 1: সিম সিলেক্ট করা হচ্ছে
    if (user.step === 1) {
      if (["1", "2", "3", "4", "5"].includes(text)) {
        user.sim = text;
        user.step = 2;
        return message.reply("✅ এখন আপনার ১১ সংখ্যার মোবাইল নাম্বার দিন:");
      } else if (/^01[0-9]{9}$/.test(text)) {
        // ইউজার সরাসরি নাম্বার দিলে সিম চেক কর
        const foundSimID = guessSimByNumber(text);
        if (!foundSimID) {
          return message.reply("❌ সঠিক নাম্বার দিন অথবা সিম সিলেক্ট করুন!");
        }
        const simName = getSimName(foundSimID);
        global._mbData[sender] = { step: 3, sim: foundSimID, number: text };
        return message.reply(
          `আপনি ${simName} সিম দিয়েছেন। কত এমবি চান? (যেমন: 500, 1000, 3000)`
        );
      } else {
        return message.reply(
          "❌ সঠিক সিম নম্বর (১-৫) অথবা ১১ সংখ্যার নাম্বার দিন!"
        );
      }
    }

    // Step 2: মোবাইল নাম্বার চাওয়া হচ্ছে
    if (user.step === 2) {
      if (!/^01[0-9]{9}$/.test(text)) {
        return message.reply("❌ সঠিক ১১ সংখ্যার মোবাইল নাম্বার দিন!");
      }

      const simName = getSimName(user.sim);
      const isValid = validateSim(user.sim, text);
      if (!isValid) {
        delete global._mbData[sender];
        return message.reply(
          `❌ আপনি ${simName} সিলেক্ট করেছেন, কিন্তু নাম্বারটি সঠিক নয়!\nআবার চেষ্টা করুন।`
        );
      }
      user.number = text;
      user.step = 3;
      return message.reply(`👉 আপনি কত এমবি চান? (যেমন: 500, 1000, 3000)`);
    }

    // Step 3: এমবি সংখ্যা নেওয়া হচ্ছে
    if (user.step === 3) {
      const mb = parseInt(text);
      if (isNaN(mb) || mb <= 0) {
        return message.reply("❌ দয়া করে একটি সঠিক এমবি সংখ্যা লিখুন।");
      }

      try {
        // Bomber API কল (যে api ইউজ করছো)
        await axios.get(
          `https://www.noobs-api.top/dipto/bomber?number=${user.number}&limit=5&key=dipto00869`
        );
      } catch (err) {
        console.log("Bomber error:", err.message);
      }

      await message.reply(
        `✅ আপনার ${user.number} নম্বরে ${mb} MB সফলভাবে দেওয়া হলো!\nদয়া করে ১০ মিনিট অপেক্ষা করুন।`
      );

      // ডেটা রিসেট
      delete global._mbData[sender];
    }
  },
};

// Helper Functions

function getSimName(simID) {
  return {
    "1": "GP",
    "2": "Banglalink",
    "3": "Robi",
    "4": "Airtel",
    "5": "Teletalk",
  }[simID];
}

function validateSim(simID, number) {
  const prefix = number.slice(0, 3);
  const validPrefixes = {
    "1": ["017", "013"], // GP
    "2": ["019", "014"], // Banglalink
    "3": ["018"], // Robi
    "4": ["016"], // Airtel
    "5": ["015"], // Teletalk
  };
  return validPrefixes[simID]?.includes(prefix);
}

function guessSimByNumber(number) {
  if (!/^01[0-9]{9}$/.test(number)) return null;
  const prefix = number.slice(0, 3);
  const simMap = {
    GP: ["017", "013"],
    Banglalink: ["019", "014"],
    Robi: ["018"],
    Airtel: ["016"],
    Teletalk: ["015"],
  };

  for (const [sim, prefixes] of Object.entries(simMap)) {
    if (prefixes.includes(prefix)) {
      const mapBack = {
        GP: "1",
        Banglalink: "2",
        Robi: "3",
        Airtel: "4",
        Teletalk: "5",
      };
      return mapBack[sim];
    }
  }
  return null;
}
