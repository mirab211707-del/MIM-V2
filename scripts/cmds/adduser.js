const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "adduser",
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Thêm thành viên vào box chat của bạn",
			en: "Add user to box chat of you"
		},
		category: "box chat",
		guide: {
			en: "   {pn} [link profile | uid]"
		}
	},

	langs: {
		vi: {
			alreadyInGroup: "╭─ℹ INFO ─╮\n│ 👀 Người dùng đã có trong nhóm.\n╰──────────╯",
			successAdd: "╭─✅ SUCCESS ─╮\n│ 🎉 Đã thêm thành công %1 thành viên!\n╰──────────────╯",
			failedAdd: "╭─❌ FAILED ─╮\n│ 😢 Không thể thêm %1 thành viên!\n│ Chi tiết:\n%2\n╰──────────  ──╯",
			approve: "╭─🕓 AWAITING APPROVAL ─╮\n│ ✅ Đã thêm %1 thành viên vào danh sách phê duyệt.\n╰────────────────────╯",
			invalidLink: "╭─⚠ INVALID LINK ─╮\n│ ❗ Vui lòng nhập link Facebook hợp lệ.\n╰────────────────────╯",
			cannotGetUid: "╭─❌ UID ERROR ─╮\n│ ❗ Không thể lấy UID của người dùng này.\n╰───────────────╯",
			linkNotExist: "╭─❌ LINK NOT FOUND ─╮\n│ 🔗 Link profile không tồn tại.\n╰─────────────────╯",
			cannotAddUser: "╭─🚫 ADD FAILED ─╮\n│ ❗ Bot bị chặn hoặc người dùng giới hạn thêm vào nhóm.\n╰───────────────────╯"
		},
		en: {
			alreadyInGroup: "╭─ℹ INFO ─╮\n│ 👀 User already in the group.\n╰──────────╯",
			successAdd: "╭─✅ SUCCESS ─╮\n│ 🎉 Successfully added %1 member(s)!\n╰──────────────╯",
			failedAdd: "╭─❌ FAILED ─╮\n│ 😢 Couldn't add %1 member(s)!\n│ Details:\n%2\n╰──────────  ──╯",
			approve: "╭─🕓 AWAITING APPROVAL ─╮\n│ ✅ Added %1 member(s) to approval list.\n╰────────────────────╯",
			invalidLink: "╭─⚠ INVALID LINK ─╮\n│ ❗ Please enter a valid Facebook profile link.\n╰────────────────────╯",
			cannotGetUid: "╭─❌ UID ERROR ─╮\n│ ❗ Cannot fetch UID for this user.\n╰───────────────╯",
			linkNotExist: "╭─❌ LINK NOT FOUND ─╮\n│ 🔗 This profile URL does not exist.\n╰─────────────────╯",
			cannotAddUser: "╭─🚫 ADD FAILED ─╮\n│ ❗ Bot blocked or user restricted adding.\n╰───────────────────╯"
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, getLang }) {
		const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();

		const success = [
			{
				type: "success",
				uids: []
			},
			{
				type: "waitApproval",
				uids: []
			}
		];
		const failed = [];

		function checkErrorAndPush(messageError, item) {
			item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
			const findType = failed.find(error => error.type == messageError);
			if (findType)
				findType.uids.push(item);
			else
				failed.push({
					type: messageError,
					uids: [item]
				});
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

		let detailErrorMsg = "";
		for (const error of failed) {
			for (const uid of error.uids) {
				detailErrorMsg += `│ + ${uid}:\n${error.type}\n`;
			}
		}

		let msg = "";
		if (lengthUserSuccess)
			msg += getLang("successAdd", lengthUserSuccess) + "\n";
		if (lengthUserWaitApproval)
			msg += getLang("approve", lengthUserWaitApproval) + "\n";
		if (lengthUserError)
			msg += getLang("failedAdd", lengthUserError, detailErrorMsg);

		await message.reply(msg);
	}
};
