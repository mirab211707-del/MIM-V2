module.exports = {
  config: {
    name: "mb",
    version: "1.3",
    author: "Mim",
    countDown: 5,
    role: 0,
    shortDescription: "ফেইক MB দেওয়া র‍্যান্ডম এমবি দিয়ে",
    longDescription: "সিম এবং নাম্বার দিয়ে র‍্যান্ডম এমবি অ্যাড করা হয়",
    category: "fun",
    guide: {
      en: "{pn} gp|robi|bl|airtel|teletalk [number]"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2) {
      return message.reply(
        "ব্যবহার: /mb [gp|robi|bl|airtel|teletalk] - [আপনার নাম্বার]\n" +
        "যেমন: /mb gp 017********"
      );
    }

    const simInput = args[0].toLowerCase();
    const number = args[1];

    const simMap = {
      gp: { name: "Grameenphone (GP)", prefixes: ["013", "017"] },
      robi: { name: "Robi", prefixes: ["014", "018"] },
      bl: { name: "Banglalink (BL)", prefixes: ["019"] },
      airtel: { name: "Airtel", prefixes: ["016"] },
      teletalk: { name: "Teletalk", prefixes: ["015"] }
    };

    if (!simMap[simInput]) {
      return message.reply("সঠিক সিম নাম্বার দিন: gp, robi, bl, airtel, teletalk");
    }

    if (!/^01[0-9]{9}$/.test(number)) {
      return message.reply("ভুল নাম্বার! সঠিক ১১ ডিজিটের নাম্বার দিন!");
    }

    const userPrefix = number.substring(0, 3);
    if (!simMap[simInput].prefixes.includes(userPrefix)) {
      return message.reply(`সিম ও নাম্বার মিলে না! আপনি ${simMap[simInput].name} সিলেক্ট করেছেন, কিন্তু নাম্বার ${userPrefix} দিয়ে শুরু!`);
    }

    // র‍্যান্ডম এমবি লিস্ট থেকে সিলেক্ট করা
    const mbList = [500, 1024, 2048, 3072, 4096];
    const randomMB = mbList[Math.floor(Math.random() * mbList.length)];

    return message.reply(
      `✅ সফলভাবে রিচার্জ সম্পন্ন ✅\n\n📱 নাম্বার: ${number}\n🎁 ${randomMB}MB ডাটা অ্যাড হয়েছে\nসিম: ${simMap[simInput].name}\n\⏳ ১০মিনিট আপেক্ষা করুন ধন্যবাদ! ♻️`
    );
  }
};
