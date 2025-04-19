const fs = require("fs");
const path = require("path");
const axios = require("axios");

const requestCache = {};

module.exports = {
  config: {
    name: "animexl",
    aliases: ["axl", "animegen", "animagine", "animecreate"],
    author: "Redwan",
    version: "2.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Unleash the power of AnimeXL to create stunning anime-style images.",
    longDescription: "AnimeXL transforms your imagination into high-quality anime-style AI-generated artwork.",
    category: "ai",
    guide: "{p}animexl <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | AnimeXL is waiting for your creativity! Provide a prompt to generate an anime masterpiece.", event.threadID, event.messageID);
    }

    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | Whoa! Slow down, artist! You can generate only 2 images every 10 minutes. Try again later!", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    api.sendMessage("🎨 | AnimeXL is bringing your anime vision to life... Hang tight!", event.threadID, (err, info) => {
      if (err) return;
      generateImage(prompt, message, api, event, info.messageID, userId);
    });
  },
};

async function generateImage(prompt, message, api, event, waitMessageID, userId) {
  try {
    const apiUrl = `https://global-redwans-apis.onrender.com/api/xemon?model=animaginexl&prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response.data || response.data.length === 0) {
      throw new Error("AnimeXL couldn't generate your artwork this time. Try again!");
    }

    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = path.join(cacheDir, `${Date.now()}_animexl_image.png`);
    fs.writeFileSync(imagePath, response.data);

    const stream = fs.createReadStream(imagePath);

    api.unsendMessage(waitMessageID, (err) => {});

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    message.reply({
      body: "✨ | AnimeXL has completed your anime-style masterpiece! Enjoy your stunning AI-generated artwork! 🌸",
      attachment: stream,
    });

    logRequest(userId);

    setTimeout(() => {
      fs.unlink(imagePath, (err) => {});
    }, 60000);
  } catch (error) {
    api.sendMessage("❌ | AnimeXL encountered an issue while generating your anime vision. Try again later!", event.threadID, event.messageID);
  }
}

function canGenerateImage(userId) {
  const now = Date.now();
  if (!requestCache[userId]) requestCache[userId] = [];
  requestCache[userId] = requestCache[userId].filter((timestamp) => now - timestamp < 10 * 60 * 1000);
  return requestCache[userId].length < 2;
}

function logRequest(userId) {
  if (!requestCache[userId]) requestCache[userId] = [];
  requestCache[userId].push(Date.now());
}
