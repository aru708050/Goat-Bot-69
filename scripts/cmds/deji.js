const fs = require("fs");
const path = require("path");
const axios = require("axios");

const dailyRequestCache = {};

module.exports = {
  config: {
    name: "deji",
    aliases: ["deji journey", "animagine"],
    author: "Redwan",
    version: "1.1",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generate an anima image based on a prompt.",
    longDescription: "Generates an image using the provided prompt.",
    category: "ai",
    guide: "{p} imagine <type> <prompt>",
  },

  onStart: async function ({ message, args, api, event, role }) {
    const obfuscatedAuthor = String.fromCharCode(82, 101, 100, 119, 97, 110);
    if (this.config.author !== obfuscatedAuthor) {
      return api.sendMessage("❌ | You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const userId = event.senderID;
    const isAdmin = role >= 1;

    if (!isAdmin && !canGenerateImage(userId)) {
      return api.sendMessage("❌ | Normal users can generate only 4 images per day. Please try again tomorrow.", event.threadID, event.messageID);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID, event.messageID);
    }

    api.sendMessage("✨ Creating your magical anime-inspired image. Hold tight!", event.threadID, event.messageID);

    try {
      const redwanapisApiUrl = `https://global-redwan-paid-anime-apis.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
      const redwanapisResponse = await axios.get(redwanapisApiUrl, { responseType: "arraybuffer" });

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

      if (!isAdmin) logRequest(userId);
    } catch (error) {
      console.error("Error generating image:", error.message || error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  },
};

function canGenerateImage(userId) {
  const today = new Date().toISOString().slice(0, 10);
  if (!dailyRequestCache[userId]) {
    dailyRequestCache[userId] = { date: today, count: 0 };
  }

  const userCache = dailyRequestCache[userId];
  if (userCache.date !== today) {
    userCache.date = today;
    userCache.count = 0;
  }

  return userCache.count < 4;
}

function logRequest(userId) {
  const today = new Date().toISOString().slice(0, 10);
  if (!dailyRequestCache[userId]) {
    dailyRequestCache[userId] = { date: today, count: 0 };
  }

  dailyRequestCache[userId].count++;
}
