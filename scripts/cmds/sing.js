const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = { 
	config: { 
		name: "music",
		aliases: ["audio", "song", "sing"],
		version: "0.0.1",
		author: "ArYAN",
		countDown: 5,
		role: 0,
		shortDescription: "Download audio or video from YouTube",
		longDescription: "Searches YouTube and downloads audio in MP3 format or video in MP4 format.",
		category: "media",
		guide: "{pn} [video]" },

onStart: async function ({ message, args }){
	
	if (!args.length) 
	return message.reply("❌ Please provide a song name.");
	

let videoUrl = args.join(" ");
	let videoTitle = "Unknown Title";
	let isVideo = videoUrl.toLowerCase().endsWith("video");
	if (isVideo) videoUrl = videoUrl.replace(/ video$/i, "");
	try { message.reply("🎀 please wait...");
		const searchResults = await yts(videoUrl);
		
		if (!searchResults.videos.length)
		
		return message.reply("⚠️ No results found.");
		const video = searchResults.videos[0];
		videoUrl = video.url;
		videoTitle = video.title;
		const thumbnail = video.thumbnail;
		console.log(`✅ Fetching ${isVideo ? "MP4" : "MP3"} for: ${videoTitle} (${videoUrl})`);
		const apiUrl = `https://aryan-error-sing-api.onrender.com/download?url=${videoUrl}&type=${isVideo ? "video" : "audio"}`;
		const response = await axios.get(apiUrl);
		
		if (!response.data || !response.data.file_url) 
		{ 
			console.log("❌ API response invalid:",
			response.data); 
			return message.reply("❌ Failed to fetch the file. Try again later.");
			
		} 
		
		const fileUrl = response.data.file_url;
		console.log(`✅ File URL received: ${fileUrl}`);
		await message.reply({ body: `🎀 Title: ${videoTitle}`,
			attachment: await global.utils.getStreamFromURL(thumbnail) });
		const filePath = path.join(__dirname, "cache", `${Date.now()}.${isVideo ? "mp4" : "mp3"}`);
		const fileStream = await global.utils.getStreamFromURL(fileUrl);
		if 
		
		(!fileStream) { 
			console.log("❌ Failed to get file stream.");
			
			return message.reply("❌ Could not download the file.");
			
		}
		
		const writer = fs.createWriteStream(filePath);
		fileStream.pipe(writer);
		writer.on("finish",
		async () => { await message.reply({ attachment: fs.createReadStream(filePath) });
			setTimeout(() => { fs.unlink(filePath, (err) => { 
				
				if (err) console.error("Error deleting file:", err);
				
			});
				
			}, 10000);
			
		});
		
	}
	
	catch (error) { console.error("❌ Music Command Error:",
				
				error);
				return message.reply(`⚠️ Error: ${error.message}`);
				
			} 

}
	
};