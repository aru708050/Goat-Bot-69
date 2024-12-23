Command executed successfully:
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const requestCache = {};

module.exports = {
  config: {
    name: "imagine",
    aliases: ["open journey", "mj"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generate an image based on a prompt.",
    longDescription: "Generates an image using the provided prompt.",
    category: "ai",
    guide: "{p} imagine <type> <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const obfuscatedAuthor = String.fromCharCode(82, 101, 100, 119, 97, 110);
    if (this.config.author !== obfuscatedAuthor) {
      return api.sendMessage("❌ | You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const userId = event.senderID;
    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | You can only generate 2 images every 10 minutes. Please try again later.", event.threadID, event.messageID);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID, event.messageID);
    }

    api.sendMessage("Please wait, we're generating your image...", event.threadID, event.messageID);

    try {
      const redwanapisApiUrl = `https://global-redwan-apis.onrender.com/midjourney?prompt=${encodeURIComponent(prompt)}`;

      const redwanapisResponse = await axios.get(redwanapisApiUrl, {
        responseType: "arraybuffer",
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(redwanapisResponse.data));

      const stream = fs.createReadStream(imagePath);
      message.reply({
        body: "✨ | Here is your generated image!",
        attachment: stream,
      });

      logRequest(userId);
    } catch (error) {
      console.error("Error generating image:", error.message || error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  },
};

function canGenerateImage(userId) {
  const now = Date.now();
  if (!requestCache[userId]) {
    requestCache[userId] = [];
  }

  requestCache[userId] = requestCache[userId].filter((timestamp) => now - timestamp < 10 * 60 * 1000);

  return requestCache[userId].length < 2;
}

function logRequest(userId) {
  const now = Date.now();
  if (!requestCache[userId]) {
    requestCache[userId] = [];
  }
  requestCache[userId].push(now);
}
