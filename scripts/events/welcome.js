const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.8",
		author: "NTKhang + Modified by You",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "👤 𝚃𝚑𝚊̀𝚗𝚑 𝚟𝚒𝚎̂𝚗 mới: {userName}\n📥 Được thêm bởi: {addedBy}\nChào mừng {multiple} đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝚖𝚘𝚛𝚗𝚒𝚗𝚐",
			session2: "𝚗𝚘𝚘𝚗",
			session3: "𝚊𝚏𝚝𝚎𝚛𝚗𝚘𝚘𝚗",
			session4: "𝚎𝚟𝚎𝚗𝚒𝚗𝚐",
			welcomeMessage: "𝚃𝚑𝚊𝚗𝚔 𝚢𝚘𝚞 𝚏𝚘𝚛 𝚒𝚗𝚟𝚒𝚝𝚒𝚗𝚐 𝚖𝚎 𝚝𝚘 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙!\n𝙱𝚘𝚝 𝚙𝚛𝚎𝚏𝚒𝚡: %1\n𝚃𝚘 𝚟𝚒𝚎𝚠 𝚝𝚑𝚎 𝚕𝚒𝚜𝚝 𝚘𝚏 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛: %1𝚑𝚎𝚕𝚙",
			multiple1: "𝚢𝚘𝚞",
			multiple2: "𝚢𝚘𝚞 𝚐𝚞𝚢𝚜",
			defaultWelcomeMessage: "╭──────────────────╮\n☺️𝙰𝚜𝚜𝚊𝚕𝚊𝚖𝚞𝚊𝚕𝚊𝚒𝚔𝚞𝚖\n╰──────────────────╯ \n𝙳𝚎𝚊𝚛✨{userName}✨\n.𝚆𝚎𝚕𝚌𝚘𝚖𝚎 {multiple} 𝚝𝚘 𝚝𝚑𝚎 𝚌𝚑𝚊𝚝 𝚐𝚛𝚘𝚞𝚙:{boxName}!\n𝙷𝚊𝚟𝚎 𝚊 𝚗𝚒𝚌𝚎 {session}!\n\n╭──────────────────╮\n    ℹ️ 𝙱𝙾𝚃 𝙰𝙳𝙼𝙸𝙽 : 𝚉𝚒𝚑𝚊𝚍 𝙰𝚑𝚊𝚖𝚍\n╰──────────────────╯"
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}

				// store participants temporarily
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					if (userName.length == 0) return;

					// Get addedBy name
					const addedByID = event.logMessageData?.author || null;
					let addedByName = "{AddedByName}";
					if (addedByID) {
						try {
							const info = await api.getUserInfo(addedByID);
							addedByName = info[addedByID]?.name || [threadID].dataAddedParticipants.push(...dataAddedParticipants).name;
						} catch (e) {
							console.error("Failed to fetch addedBy user info:", e);
						}
					}

					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(/\{session\}/g,
							hours <= 10 ? getLang("session1") :
							hours <= 12 ? getLang("session2") :
							hours <= 18 ? getLang("session3") :
							getLang("session4"))
						.replace(/\{addedBy\}/g, addedByName);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
