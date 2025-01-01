const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const requestCache = {};

module.exports = {
  config: {
    name: "hf",
    aliases: ["huggingface", "imagegen"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generate a collage of images based on a prompt using Hugging Face models.",
    longDescription: "Generates multiple images, creates a collage, and sends it to the user.",
    category: "ai",
    guide: "{p} hf <prompt>",
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

    api.sendMessage("Please wait, we're generating your images...", event.threadID, event.messageID);

    try {
      const hfApiUrl = `https://global-redwan-free-hf-apis.onrender.com/api/gen?prompt=${encodeURIComponent(prompt)}&apikey=redwan`;

      const hfResponse = await axios.get(hfApiUrl, { responseType: "json" });

      const images = hfResponse.data.images;
      if (!images || images.length === 0) {
        return api.sendMessage("❌ | No images were generated. Please try again later.", event.threadID, event.messageID);
      }

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const selectedImages = images.slice(0, 4).map((image, index) => {
        const base64Image = image.image;
        const imageFormat = base64Image.match(/^data:image\/(.*?);base64,/);
        
        if (!imageFormat) {
          return null;
        }

        const format = imageFormat[1];
        const allowedFormats = ["png", "jpg", "jpeg", "gif", "bmp"];
        if (!allowedFormats.includes(format)) {
          return null;
        }

        const imagePath = path.join(cacheFolderPath, `${Date.now()}_${index}_generated_image.${format}`);
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));

        return imagePath;
      }).filter(Boolean);

      const collagePath = await createCollage(selectedImages);
      const stream = fs.createReadStream(collagePath);
      
      message.reply({
        body: "✨ | Here is your generated image collage! Please reply with the image number (1, 2, 3, 4) to get the corresponding image in high resolution.",
        attachment: stream,
      }, async (err, info) => {
        let id = info.messageID;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          imageUrls: selectedImages,
        });
      });

      logRequest(userId);
    } catch (error) {
      console.error("Error generating image:", error.message || error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData, args, message }) {
    const reply = parseInt(args[0]);
    const { author, messageID, imageUrls } = Reply;

    if (event.senderID !== author) return;

    try {
      if (reply >= 1 && reply <= 4) {
        const selectedImagePath = imageUrls[reply - 1];
        const imgBuffer = fs.readFileSync(selectedImagePath);

        message.reply({
          body: `Here is the image you selected (Image ${reply})`,
          attachment: imgBuffer,
        });
      } else {
        message.reply("❌ | Invalid number. Please reply with a number between 1 and 4.");
      }
    } catch (error) {
      console.error(error);
      message.reply(`${error}`, event.threadID);
    }

    await message.unsend(Reply.messageID);
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

async function createCollage(imagePaths) {
  const canvasWidth = 800;
  const canvasHeight = 800;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  let x = 0;
  let y = 0;
  const imageSize = 400;

  for (const imagePath of imagePaths) {
    const image = await loadImage(imagePath);
    ctx.drawImage(image, x, y, imageSize, imageSize);

    x += imageSize;
    if (x >= canvasWidth) {
      x = 0;
      y += imageSize;
    }
  }

  const collagePath = path.join(__dirname, "cache", `${Date.now()}_collage.png`);
  const out = fs.createWriteStream(collagePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  await new Promise((resolve, reject) => {
    out.on("finish", resolve);
    out.on("error", reject);
  });

  return collagePath;
        }
