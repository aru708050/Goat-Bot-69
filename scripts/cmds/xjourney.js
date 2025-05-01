const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const requestCache = {};
const userSelections = {};
const adminIds = ["100094189827824", "100088212594818"];

module.exports = {
  config: {
    name: "midjourney",
    aliases: [ "mjv7", "xjourney", "xj"],
    author: "Redwan",
    version: "2.0",
    cooldowns: 20,
    role: 2,
    shortDescription: "Generat images using Midjourney",
    longDescription: "",
    category: "ai",
    guide: "{p}mjx <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | Please provide a prompt to generate an image.", event.threadID, event.messageID);
    }

    if (!canGenerateImage(userId)) {
      return api.sendMessage("❌ | You can generate a maximum of 2 images every 10 minutes. Please try again later.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    api.sendMessage("✨ | Initiating MidJourney's magical process... Please be patient, this might take a moment.", event.threadID, async (err, info) => {
      if (err) return;
      await generateCollage(prompt, message, api, event, info.messageID, userId);
    });
  },

  onReply: async function ({ event, api, replyData }) {
    const userId = event.senderID;
    const selection = event.body.trim().toUpperCase();

    if (selection === "UALL") {
      if (!userSelections[userId]) {
        return api.sendMessage("❌ | No image found. Please generate a new one first.", event.threadID, event.messageID);
      }
      const collagePath = userSelections[userId];
      api.sendMessage("Upscale request added, please wait...", event.threadID, async (err, info) => {
        if (err) return;
        await cropAllImages(collagePath, event, api);
      });
      return;
    }

    if (!['U1', 'U2', 'U3', 'U4'].includes(selection)) {
      return api.sendMessage("❌ | Invalid selection. Please choose from U1, U2, U3, U4, or UALL.", event.threadID, event.messageID);
    }

    if (!userSelections[userId]) {
      return api.sendMessage("❌ | No image found. Please generate a new one first.", event.threadID, event.messageID);
    }

    const collagePath = userSelections[userId];

    api.sendMessage("Upscaling your selected image...", event.threadID, async (err, info) => {
      if (err) return;
      await upscaleAndSendImage(collagePath, selection, event, api);
    });
  },
};

async function generateCollage(prompt, message, api, event, waitMessageID, userId) {
  let collagePath;
  try {
    const apiUrl = `https://renzweb.onrender.com/api/mj-7?prompt=${encodeURIComponent(prompt)}&key=exclusive_key`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data || response.data.length === 0) {
      throw new Error("❌ | Image generation failed. Please try again.");
    }

    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    collagePath = path.join(cacheDir, `${Date.now()}_midjourneyx_collage.png`);
    await fs.promises.writeFile(collagePath, response.data);

    const stream = fs.createReadStream(collagePath);

    
    setTimeout(async () => {
      try {
        await fs.promises.unlink(collagePath);
      } catch (err) {
        console.error("❌ Error deleting file:", err);
      }
    }, 300000);

    api.unsendMessage(waitMessageID, (err) => {});
    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    userSelections[userId] = collagePath;

    message.reply(
      {
        body: "Midjourney process completed ✨\n\n❏ Action: U1, U2, U3, U4",
        attachment: stream,
      },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "midjourney",
          author: userId,
        });
      }
    );

    logRequest(userId);

  } catch (error) {
    api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID, event.messageID);
  }
}

async function upscaleAndSendImage(collagePath, selection, event, api) {
  try {
    const image = await loadImage(collagePath);
    const canvasSize = image.width / 2;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    const positions = {
      U1: { x: 0, y: 0 },
      U2: { x: canvasSize, y: 0 },
      U3: { x: 0, y: canvasSize },
      U4: { x: canvasSize, y: canvasSize },
    };

    const { x, y } = positions[selection];

    ctx.drawImage(image, x, y, canvasSize, canvasSize, 0, 0, canvasSize, canvasSize);

    const upscalePath = collagePath.replace("_collage.png", `_upscaled_${selection}.png`);
    const buffer = canvas.toBuffer("image/png");
    await fs.promises.writeFile(upscalePath, buffer);

    const stream = fs.createReadStream(upscalePath);

    api.sendMessage(
      {
        body: "Upscale request added, please wait...",
        attachment: stream,
      },
      event.threadID,
      async () => {
        try {
          await fs.promises.unlink(upscalePath);
        } catch (err) {
          console.error("❌ Error deleting file:", err);
        }
      }
    );

  } catch (error) {
    api.sendMessage("❌ | Failed to upscale the image. Please try again.", event.threadID, event.messageID);
  }
}

async function cropAllImages(collagePath, event, api) {
  try {
    const image = await loadImage(collagePath);
    const canvasSize = image.width / 2;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    const positions = {
      U1: { x: 0, y: 0 },
      U2: { x: canvasSize, y: 0 },
      U3: { x: 0, y: canvasSize },
      U4: { x: canvasSize, y: canvasSize },
    };

    const croppedPaths = [];
    for (let key in positions) {
      const { x, y } = positions[key];

      canvas.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(image, x, y, canvasSize, canvasSize, 0, 0, canvasSize, canvasSize);

      const cropPath = collagePath.replace("_collage.png", `_cropped_${key}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.promises.writeFile(cropPath, buffer);
      croppedPaths.push(cropPath);
    }

    const streams = croppedPaths.map((path) => fs.createReadStream(path));
    api.sendMessage(
      {
        body: "✨ | All upscaled images are ready.",
        attachment: streams,
      },
      event.threadID,
      async () => {
        for (const path of croppedPaths) {
          try {
            await fs.promises.unlink(path);
          } catch (err) {
            console.error("❌ Error deleting file:", err);
          }
        }
      }
    );

  } catch (error) {
    api.sendMessage("❌ | Failed to upscale the images. Please try again.", event.threadID, event.messageID);
  }
}

function canGenerateImage(userId) {
  if (adminIds.includes(userId)) {
    return true;
  }

  const now = Date.now();
  if (!requestCache[userId]) requestCache[userId] = [];

  requestCache[userId] = requestCache[userId].filter((timestamp) => now - timestamp < 10 * 60 * 1000);

  return requestCache[userId].length < 2;
}

function logRequest(userId) {
  if (!adminIds.includes(userId)) {
    if (!requestCache[userId]) {
      requestCache[userId] = [];
    }
    requestCache[userId].push(Date.now());
  }
}
