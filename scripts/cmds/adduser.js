const { findUid } = global.utils; const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { config: { name: "adduser", version: "1.4", author: "NTKhang", countDown: 5, role: 1, shortDescription: { vi: "Thêm thành viên vào box chat", en: "Add user to box chat" }, longDescription: { vi: "Thêm thành viên vào box chat của bạn", en: "Add user to box chat of you" }, category: "box chat", guide: { en: "   {pn} [link profile | uid]" } },

langs: { en: { alreadyInGroup: ╭──❍「 ℹ️ INFO 」❍──╮ │ 👀 This user is already in the group! ╰────────────────────╯,

successAdd:

╭──❍「 ✅ SUCCESS 」❍──╮ │ 🎉 Successfully added %1 member(s) to the group! ╰────────────────────────────╯,

failedAdd:

╭──❍「 ❌ FAILED 」❍──╮ │ 😢 Couldn't add %1 member(s) to the group. ╰────────────────────────────╯,

approve:

╭──❍「 🕓 AWAITING APPROVAL 」❍──╮ │ ✅ Added %1 member(s) to the approval list. ╰────────────────────────────╯,

invalidLink:

╭──❍「 ⚠️ INVALID LINK 」❍──╮ │ ❗ Please enter a valid Facebook profile link. ╰────────────────────────────╯,

cannotGetUid:

╭──❍「 ❌ UID ERROR 」❍──╮ │ ❗ Cannot fetch UID for this user. ╰────────────────────────────╯,

linkNotExist:

╭──❍「 ❌ LINK NOT FOUND 」❍──╮ │ 🔗 This profile URL does not exist! ╰────────────────────────────╯,

cannotAddUser:

╭──❍「 🚫 ADD FAILED 」❍──╮ │ ❗ Bot is blocked or user has restricted │ being added by strangers. ╰────────────────────────────╯ } },

onStart: async function ({ message, api, event, args, threadsData, getLang }) { const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID); const botID = api.getCurrentUserID();

const success = [
  { type: "success", uids: [] },
  { type: "waitApproval", uids: [] }
];
const failed = [];

function checkErrorAndPush(messageError, item) {
  item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
  const findType = failed.find(error => error.type == messageError);
  if (findType)
    findType.uids.push(item);
  else
    failed.push({ type: messageError, uids: [item] });
}

const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
for (const item of args) {
  let uid;
  let continueLoop = false;

  if (isNaN(item) && regExMatchFB.test(item)) {
    for (let i = 0; i < 10; i++) {
      try {
        uid = await findUid(item);
        break;
      }
      catch (err) {
        if (err.name == "SlowDown" || err.name == "CannotGetData") {
          await sleep(1000);
          continue;
        }
        else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
          checkErrorAndPush(
            err.name == "InvalidLink" ? getLang('invalidLink') :
            err.name == "CannotGetData" ? getLang('cannotGetUid') :
            err.name == "LinkNotExist" ? getLang('linkNotExist') :
            err.message,
            item
          );
          continueLoop = true;
          break;
        }
      }
    }
  }
  else if (!isNaN(item))
    uid = item;
  else
    continue;

  if (continueLoop == true)
    continue;

  if (members.some(m => m.userID == uid && m.inGroup)) {
    checkErrorAndPush(getLang("alreadyInGroup"), item);
  }
  else {
    try {
      await api.addUserToGroup(uid, event.threadID);
      if (approvalMode === true && !adminIDs.includes(botID))
        success[1].uids.push(uid);
      else
        success[0].uids.push(uid);
    }
    catch (err) {
      checkErrorAndPush(getLang("cannotAddUser"), item);
    }
  }
}

const lengthUserSuccess = success[0].uids.length;
const lengthUserWaitApproval = success[1].uids.length;
const lengthUserError = failed.length;

let msg = "";
if (lengthUserSuccess)
  msg += `${getLang("successAdd", lengthUserSuccess)}\n`;
if (lengthUserWaitApproval)
  msg += `${getLang("approve", lengthUserWaitApproval)}\n`;
if (lengthUserError)
  msg += `${getLang("failedAdd", failed.reduce((a, b) => a + b.uids.length, 0))} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n       ')}: ${b.type}`, "")}`;

await message.reply(msg);

} };

