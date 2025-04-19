const fs = require("fs");
const path = require("path");
const axios = require("axios");

const requestCache = {};

module.exports = {
  config: {
    name: "animagine",
    aliases: ["anix", "anigen", "anx"],
    author: "Redwan",
    version: "2.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generate anime-style AI images with Animagine.",
    longDescription: "Animagine creates stunning, high-quality AI-generated anime-style illustrations based on your prompt.",
    category: "ai",
    guide: "{p}animemix <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | Animagine needs a creative prompt! Describe your scene.", event.threadID, event.messageID);
    }

    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | Hold on! You can only generate 2 images every 10 minutes. Try again later.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    api.sendMessage("🌸 | Animagine is bringing your vision to life... Please wait!", event.threadID, (err, info) => {
      if (err) return;
      generateImage(prompt, message, api, event, info.messageID, userId);
    });
  },
};

async function generateImage(prompt, message, api, event, waitMessageID, userId) {
  try {
    const apiUrl = `https://renzsuperb.onrender.com/api/animaginexl?prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response.data || response.data.length === 0) {
      throw new Error("Anime Mix couldn't create your scene. Try again!");
    }

    const cacheDir = "cache";
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = `${cacheDir}/${Date.now()}_animemix.png`;
    fs.writeFileSync(imagePath, response.data);

    const stream = fs.createReadStream(imagePath);

    api.unsendMessage(waitMessageID, (err) => {});

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    message.reply({
      body: "🎨 | Your Animagine masterpiece is ready! Enjoy your AI-powered anime creation! 🌟",
      attachment: stream,
    });

    logRequest(userId);

    setTimeout(() => {
      fs.unlink(imagePath, (err) => {});
    }, 60000);
  } catch (error) {
    api.sendMessage("❌ | Anime Mix encountered an issue. Try again later!", event.threadID, event.messageID);
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
