const { getStreamsFromAttachment } = global.utils;

const anikUID = "100078769420993";
const reportThreadID = "10040738582655152";

module.exports = {
  config: {
    name: "notification_a",
    aliases: ["noti_a", "note_a"],
    version: "2.0",
    author: "Zihad Ahmed",
    countDown: 5,
    role: 2,
    description: "Anik Ahmed এর পক্ষ থেকে সব গ্রুপে নোটিফিকেশন পাঠায়",
    category: "owner"
  },

  onStart: async function ({ message, api, event, args }) {
    if (event.senderID !== anikUID)
      return message.reply("⛔ শুধু Anik Ahmed এই কমান্ড চালাতে পারবে।");

    if (!args[0]) return message.reply("📌 কিছু লিখতে হবে ভাই, Notification-er message koi?");

    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const groupThreads = allThreads.filter(t => t.isGroup && t.name);

    const formSend = {
      body: `📣 𝗔𝗻𝗶𝗸 𝗔𝗵𝗺𝗲𝗱 থেকে একটি বার্তা:\n\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(a => ["photo", "png", "animated_image", "video", "audio"].includes(a.type))
      )
    };

    message.reply(`📤 Anik এর নামে ${groupThreads.length} টা গ্রুপে পাঠানো শুরু হল...`);

    let success = 0;
    for (const thread of groupThreads) {
      try {
        const sent = await api.sendMessage(formSend, thread.threadID);
        global.GoatBot.onReply.set(sent.messageID, {
          commandName: "notification_a",
          author: anikUID,
          threadID: thread.threadID,
          type: "noti-reply"
        });
        success++;
        await new Promise(r => setTimeout(r, 250));
      } catch {}
    }

    message.reply(`✅ Done! সফলভাবে ${success} টা গ্রুপে পাঠানো হয়েছে।`);
  },

  onReply: async function ({ message, event, api, Reply }) {
    if (Reply.type !== "noti-reply") return;
    const userInfo = await api.getUserInfo(event.senderID);
    const name = userInfo[event.senderID]?.name || "Facebook User";
    const text = event.body || "[📎 Attachment]";

    const reportMsg = `📩 [𝗔𝗻𝗶𝗸 𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝗥𝗲𝗽𝗹𝘆]\n━━━━━━━━━━━━━━\n👤 From: ${name} (${event.senderID})\n🧵 Group: ${event.threadID}\n\n💬 ${text}`;
    await api.sendMessage(reportMsg, reportThreadID);
  }
};
