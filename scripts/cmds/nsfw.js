const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const requestCache = {};
let generatedImages = [];

module.exports = {
  config: {
    name: "nsfw",
    aliases: ["umh", "sex"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generate images with AI.",
    longDescription: "Generate stunning images using AI.",
    category: "ai",
    guide: "{p} hf <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    if (!canGenerateImage(userId)) {
      return api.sendMessage("⛔ | You've reached the limit of 2 image requests every 10 minutes. Try again later.", event.threadID, event.messageID);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠️ | Please provide a prompt to generate images.", event.threadID, event.messageID);
    }

    api.sendMessage("💋✨ | Wait Let Me Make You Horny. Hold your dick tightly!", event.threadID, event.messageID);

    try {
      const hfApiUrl = `https://global-redwan-nsfw-api.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
      const hfResponse = await axios.get(hfApiUrl);
      const imageUrls = hfResponse.data.images || [];

      while (imageUrls.length < 4) {
        imageUrls.push("[Empty Slot]");
      }

      const collagePath = await createCollage(imageUrls);
      const stream = fs.createReadStream(collagePath);

      const collageMessage = await message.reply({
        body: `🌟 | **Your Dick Is Ready**\n\n1️⃣ ${imageUrls[0]}\n2️⃣ ${imageUrls[1]}\n3️⃣ ${imageUrls[2]}\n4️⃣ ${imageUrls[3]}\n\n🎨 **Reply with a number (1, 2, 3, or 4) to select an image.**`,
        attachment: stream,
      });

      logRequest(userId);
      generatedImages = imageUrls;

      setTimeout(() => fs.unlinkSync(collagePath), 2 * 60 * 1000);

      global.GoatBot.onReply.set(collageMessage.messageID, {
        commandName: this.config.name,
        messageID: collageMessage.messageID,
        author: event.senderID,
        imageUrls: imageUrls.filter(url => url !== "[Empty Slot]"),
      });
    } catch (error) {
      console.error("Error:", error.message || error);
      api.sendMessage("❌ | An error occurred while generating your images. Please try again.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const selectedNumber = parseInt(args[0]);
    const { author, imageUrls } = Reply;

    if (event.senderID !== author) return;

    if (selectedNumber >= 1 && selectedNumber <= 4) {
      const selectedImageUrl = imageUrls[selectedNumber - 1];
      if (!selectedImageUrl) {
        return message.reply("⚠️ | That slot is empty. Please choose a valid image number.");
      }
      const buffer = await axios.get(selectedImageUrl, { responseType: "arraybuffer" }).then(res => res.data);
      return message.reply({
        body: `👀 | Feels Like You-re Too Horny!`,
        attachment: Buffer.from(buffer),
      });
    } else {
      message.reply("⚠️ | Invalid number. Please reply with a number between 1 and 4.");
    }
  },
};

function canGenerateImage(userId) {
  const now = Date.now();
  if (!requestCache[userId]) {
    requestCache[userId] = [];
  }
  requestCache[userId] = requestCache[userId].filter(timestamp => now - timestamp < 10 * 60 * 1000);
  return requestCache[userId].length < 2;
}

function logRequest(userId) {
  const now = Date.now();
  if (!requestCache[userId]) {
    requestCache[userId] = [];
  }
  requestCache[userId].push(now);
}

async function createCollage(imageUrls) {
  const canvasWidth = 800;
  const canvasHeight = 800;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const positions = [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 0, y: 400 },
    { x: 400, y: 400 },
  ];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    if (imageUrl !== "[Empty Slot]") {
      const imgBuffer = await axios.get(imageUrl, { responseType: "arraybuffer" }).then(res => res.data);
      const image = await loadImage(Buffer.from(imgBuffer));
      ctx.drawImage(image, positions[i].x, positions[i].y, 400, 400);
    } else {
      ctx.fillStyle = "#cccccc";
      ctx.fillRect(positions[i].x, positions[i].y, 400, 400);
      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      ctx.fillText("Empty Slot", positions[i].x + 140, positions[i].y + 200);
    }
  }

  const collagePath = path.join(__dirname, "collage.png");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(collagePath, buffer);
  return collagePath;
}
