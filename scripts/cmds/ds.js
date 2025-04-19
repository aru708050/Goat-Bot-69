const fs = require("fs");
const path = require("path");
const axios = require("axios");

const requestCache = {};

module.exports = {
  config: {
    name: "dreamgen",
    aliases: ["dreamshaper", "ds", "dreamai", "dreamcreate"],
    author: "Redwan",
    version: "1.5",
    cooldowns: 20,
    role: 2,
    shortDescription: "Transform dreams into reality with Dream Shaper AI.",
    longDescription: "Let Dream Shaper craft breathtaking AI-generated artworks based on your imagination.",
    category: "ai",
    guide: "{p}dreamgen <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | Dream Shaper awaits your inspiration! Provide a prompt to create your masterpiece.", event.threadID, event.messageID);
    }

    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | Dream Shaper needs a little rest! You can generate only 2 images every 10 minutes. Try again soon!", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    api.sendMessage("🌟 | Dream Shaper is weaving your vision into reality... Hold tight!", event.threadID, (err, info) => {
      if (err) return;
      generateImage(prompt, message, api, event, info.messageID, userId);
    });
  },
};

async function generateImage(prompt, message, api, event, waitMessageID, userId) {
  try {
    const apiUrl = `https://renzsuperb.onrender.com/api/dreamshaper?prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response.data || response.data.length === 0) {
      throw new Error("Dream Shaper couldn't bring your vision to life this time. Try again!");
    }

    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = path.join(cacheDir, `${Date.now()}_dreamshaper_image.png`);
    fs.writeFileSync(imagePath, response.data);

    const stream = fs.createReadStream(imagePath);

    api.unsendMessage(waitMessageID, (err) => {});

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    message.reply({
      body: "🎨 | Dream Shaper has completed your masterpiece! Behold your AI-generated artwork! ✨",
      attachment: stream,
    });

    logRequest(userId);

    setTimeout(() => {
      fs.unlink(imagePath, (err) => {});
    }, 60000);
  } catch (error) {
    api.sendMessage("❌ | Dream Shaper encountered an error in its magic. Try again later!", event.threadID, event.messageID);
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
