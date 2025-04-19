const axios = require('axios');
const fs = require('fs');
const { resolve } = require("path");

module.exports = {
	config: {
		name: "gist",
		aliases: ["gist"],
		version: "1.2",
		author: "Redwan",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "",
			en: "Upload code to Gist"
		},
		longDescription: {
			vi: "",
			en: "Upload replied code or a local file to GitHub Gist"
		},
		category: "Bot account",
		guide: {
			en: "{pn} <filename> (or reply to a message with code)"
		}
	},

	onStart: async function ({ api, event, args }) {
		const GITHUB_TOKEN = "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"; // Your test token

		const permission = ["100094189827824"]; // List of allowed user IDs
		if (!permission.includes(event.senderID))
			return api.sendMessage("❌ | You are not allowed to use this command.", event.threadID, event.messageID);

		const { messageReply, threadID, messageID, type } = event;
		let filename = args[0] || "untitled.js";
		let codeContent = "";

		if (type === "message_reply" && messageReply.body) {
			codeContent = messageReply.body;
		} else if (args[0]) {
			try {
				codeContent = fs.readFileSync(resolve(__dirname, args[0] + ".js"), "utf-8");
			} catch (err) {
				return api.sendMessage(`❌ | File "${args[0]}.js" not found.`, threadID, messageID);
			}
		} else {
			return api.sendMessage("❌ | Please reply to a message with code or specify a filename.", threadID, messageID);
		}

		try {
			const response = await axios.post(
				"https://api.github.com/gists",
				{
					description: "Uploaded via Bot",
					public: true,
					files: {
						[filename]: { content: codeContent }
					}
				},
				{
					headers: {
						Authorization: `token ${GITHUB_TOKEN}`,
						Accept: "application/vnd.github.v3+json"
					}
				}
			);

			api.sendMessage(`✅ | Gist created: ${response.data.html_url}`, threadID, messageID);
		} catch (error) {
			api.sendMessage(`❌ | Failed to upload to Gist: ${error.response ? error.response.data.message : error.message}`, threadID, messageID);
		}
	}
};
