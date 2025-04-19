const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "file",
    aliases: ["ls", "browse"],
    version: "1.3",
    author: "Redwan",
    countDown: 3,
    role: 1,
    shortDescription: "Browse or upload files from the bot directory",
    longDescription: "Explore folders and files like a terminal 'ls' command and upload any file to Gist",
    category: "system",
    guide: "{pn} [optional: path/to/folder or file.js]"
  },

  onStart: async function ({ api, event, args, message }) {
    const allowedUIDs = ["100094189827824", "61573881892585"];
    const senderID = event.senderID;

    function uidCheck(uid) {
      return allowedUIDs.includes(uid);
    }

    if (!uidCheck(senderID)) {
      return message.reply("❌ You are not authorized to use this command.");
    }

    const GITHUB_TOKEN = "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";
    const rootPath = path.resolve(__dirname, "../../..");
    const userPath = args.join(" ");
    const targetPath = path.join(rootPath, userPath || "");

    if (!fs.existsSync(targetPath)) {
      return api.sendMessage(`❌ Path not found:\n\`${userPath}\``, event.threadID, event.messageID);
    }

    const stat = fs.statSync(targetPath);

    if (stat.isDirectory()) {
      const contents = fs.readdirSync(targetPath);
      if (contents.length === 0) {
        return api.sendMessage(`📂 Repository Browser: \`${userPath || "root"}\`\n(empty folder)`, event.threadID, event.messageID);
      }

      let msg = `📂 Repository Browser: \`${userPath || "root"}\`\n`;
      let count = 1;

      const folders = contents.filter(item => fs.statSync(path.join(targetPath, item)).isDirectory());
      const files = contents.filter(item => fs.statSync(path.join(targetPath, item)).isFile());

      folders.forEach(folder => {
        msg += `${count++}. 📁 ${folder}\n`;
      });

      files.forEach(file => {
        msg += `${count++}. 📄 ${file}\n`;
      });

      return api.sendMessage(msg.trim(), event.threadID, event.messageID);
    }

    try {
      const content = fs.readFileSync(targetPath, "utf-8");
      const fileName = path.basename(targetPath);

      const response = await axios.post(
        "https://api.github.com/gists",
        {
          description: `Uploaded via GoatBot by Redwan`,
          public: true,
          files: {
            [fileName]: { content }
          }
        },
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json"
          }
        }
      );

      return api.sendMessage(`✅ File \`${fileName}\` uploaded to Gist:\n${response.data.html_url}`, event.threadID, event.messageID);
    } catch (err) {
      return api.sendMessage(`❌ Failed to upload:\n${err.response?.data?.message || err.message}`, event.threadID, event.messageID);
    }
  }
};
