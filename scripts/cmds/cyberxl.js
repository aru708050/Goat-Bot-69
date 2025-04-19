const fs = require("fs");
const path = require("path");
const axios = require("axios");

const requestCache = {};

module.exports = {
  config: {
    name: "cyberxl",
    aliases: ["cxl", "cyberx", "cybergen", "cybercreate"],
    author: "Redwan",
    version: "2.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Cyber XL unleashes AI-powered futuristic image generation.",
    longDescription: "Cyber XL creates ultra-detailed, next-level AI-generated visuals based on your imagination.",
    category: "ai",
    guide: "{p}cyberxl <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | Cyber XL needs a vision! Provide a prompt to generate an extraordinary image.", event.threadID, event.messageID);
    }

    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | Whoa! You can only generate 2 images every 10 minutes. Please wait before trying again!", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    api.sendMessage("⚡ | Cyber XL is processing your futuristic masterpiece... Please wait!", event.threadID, (err, info) => {
      if (err) return;
      generateImage(prompt, message, api, event, info.messageID, userId);
    });
  },
};

async function generateImage(prompt, message, api, event, waitMessageID, userId) {
  try {
    const apiUrl = `https://global-redwans-apis.onrender.com/api/xemon?model=cyberxl&prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response.data || response.data.length === 0) {
      throw new Error("Cyber XL couldn't generate your vision this time. Try again!");
    }

    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = path.join(cacheDir, `${Date.now()}_cyberxl_image.png`);
    fs.writeFileSync(imagePath, response.data);

    const stream = fs.createReadStream(imagePath);

    api.unsendMessage(waitMessageID, (err) => {});

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    message.reply({
      body: "🌟 | Cyber XL has forged your futuristic artwork! Enjoy your AI-generated vision! 🚀",
      attachment: stream,
    });

    logRequest(userId);

    setTimeout(() => {
      fs.unlink(imagePath, (err) => {});
    }, 60000);
  } catch (error) {
    api.sendMessage("❌ | Cyber XL encountered an issue while generating your image. Try again later!", event.threadID, event.messageID);
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
