module.exports.config = {
  name: "note",
  aliases: ["noti", "notification"],
  version: "1.0.6",
  hasPermssion: 2,
  credits: "ZIHAD ✨",
  description: "Send a stylish note to all groups + unlimited two-way reply relay",
  commandCategory: "system",
  usages: "[your message]",
  cooldowns: 5,
};

global.noteRelayData = {
  originalGroup: null,      // The group where note was sent from
  senderName: null,         // Name of sender
  replyThreads: new Map(),  // Map<groupID, messageID> to track note message per group
  lastReplyFromGroup: null, // To track last replying group for sender reply
};

module.exports.run = async ({ api, event, args, Users }) => {
  const msg = args.join(" ");
  if (!msg)
    return api.sendMessage(
      `📌 𝗡𝗢𝗧𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 ✨

➤ Please type your note message to send to ALL groups.

📥 Example:
/note [your msg]
`,
      event.threadID
    );

  const senderName = await Users.getNameUser(event.senderID);
  const allThreads = global.data.allThreadID || [];

  // Reset relay data for new note
  global.noteRelayData.originalGroup = event.threadID;
  global.noteRelayData.senderName = senderName;
  global.noteRelayData.replyThreads.clear();
  global.noteRelayData.lastReplyFromGroup = null;

  const styledNote = `╭───✦〔 📢 𝐍𝐄𝐖 𝐍𝐎𝐓𝐄 〕✦───╮
┃ 👤 Sender: ${senderName}
┃ 💬 Message:
┃ ${msg}
╰────────────────────╯

📩 *Reply to this message to send your reply back to the sender’s group.*`;

  for (const tid of allThreads) {
    try {
      const sent = await api.sendMessage(styledNote, tid);
      // Track note message ID per group for reply recognition
      global.noteRelayData.replyThreads.set(tid, sent.messageID);
    } catch (e) {
      // Ignore errors per group (e.g. bot kicked)
    }
  }

  return api.sendMessage("✅ Note sent to all groups successfully!", event.threadID);
};

module.exports.handleEvent = async ({ api, event, Users }) => {
  if (!event.messageReply) return;

  const { originalGroup, senderName, replyThreads } = global.noteRelayData;

  // Identify which group’s note message this reply belongs to
  let repliedGroup = null;
  for (const [groupID, msgID] of replyThreads.entries()) {
    if (event.messageReply.messageID === msgID) {
      repliedGroup = groupID;
      break;
    }
  }
  if (!repliedGroup) return; // Not a reply to a note message

  const fromGroup = event.threadID;
  const replyText = event.body || "💬 (No message content)";

  // If reply comes from a group other than original group
  if (fromGroup !== originalGroup) {
    // Forward reply to original sender group with stylish box
    const toOriginal = `📨 𝗥𝗘𝗣𝗟𝗬 𝗢𝗡 𝗬𝗢𝗨𝗥 𝗡𝗢𝗧𝗘! ✉️
━━━━━━━━━━━━━━━
💭 Message:
${replyText}

📍 From Group: ${fromGroup}
━━━━━━━━━━━━━━━`;

    await api.sendMessage(toOriginal, originalGroup);
    // Track last replying group for sender reply
    global.noteRelayData.lastReplyFromGroup = fromGroup;
  } 
  // If reply comes from original sender group (sender replying back)
  else {
    const toGroup = global.noteRelayData.lastReplyFromGroup;
    if (!toGroup) return;

    const toGroupMsg = `🔁 𝗥𝗘𝗣𝗟𝗬 𝗙𝗥𝗢𝗠 𝗦𝗘𝗡𝗗𝗘𝗥 ✨
━━━━━━━━━━━━━━━
💌 ${replyText}
━━━━━━━━━━━━━━━`;

    await api.sendMessage(toGroupMsg, toGroup);
  }
};
