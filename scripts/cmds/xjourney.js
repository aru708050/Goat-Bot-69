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
    aliases: ["mjv7", "xjourney", "xj"],
    author: "Redwan",
    version: "2.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generat images using Midjourney",
    longDescription: "",
    category: "ai",
    guide: "{p}mjx <prompt>",
  },

  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return message.reply("❌ | Please provide a prompt to generate an image.");
    }

    if (!canGenerateImage(userId)) {
      return message.reply("❌ | You can generate a maximum of 2 images every 10 minutes. Please try again later.");
    }

    const waitMessage = await message.reply("✨ | Initiating MidJourney's magical process... Please be patient, this might take a moment.");
    await generateCollage(prompt, message, api, event, waitMessage.messageID, userId);
  },

  onReply: async function ({ event, api, replyData, message }) {
    const userId = event.senderID;
    const selection = event.body.trim().toUpperCase();

    if (!['U1', 'U2', 'U3', 'U4'].includes(selection)) {
      return message.reply("❌ | Invalid selection. Please choose from U1, U2, U3, U4.");
    }

    if (!userSelections[userId]) {
      return message.reply("❌ | No image found. Please generate a new one first.");
    }

    const collagePath = userSelections[userId];
    const waitMessage = await message.reply("⏫ | Upscaling your selected image...");
    await upscaleAndSendImage(collagePath, selection, event, api, waitMessage.messageID);
  },
};

async function generateCollage(prompt, message, api, event, waitMessageID, userId) {
  const cacheDir = path.resolve(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  try {
    const apiUrl = `https://zaikyoov3-up.up.railway.app/api/mj-7?prompt=${encodeURIComponent(prompt)}&key=exclusive_key`;
    const initRes = await axios.get(apiUrl);

    if (!initRes.data || initRes.data.status !== "processing" || !initRes.data.pollingUrl) {
      throw new Error("❌ | Failed to initiate generation.");
    }

    const pollingUrl = initRes.data.pollingUrl;
    let completed = false;
    let imageUrl = "";

    for (let i = 0; i < 150; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pollRes = await axios.get(pollingUrl);
      if (pollRes.data.status === "completed" && pollRes.data.imageUrl) {
        imageUrl = pollRes.data.imageUrl;
        completed = true;
        break;
      }
    }

    if (!completed) {
      throw new Error("❌ | Image generation timed out. Please try again later.");
    }

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const collagePath = path.join(cacheDir, `${Date.now()}_midjourneyx_collage.png`);
    await fs.promises.writeFile(collagePath, imageRes.data);

    const stream = fs.createReadStream(collagePath);

    setTimeout(async () => {
      try {
        await fs.promises.unlink(collagePath);
      } catch (err) {
        console.error("❌ Error deleting file:", err);
      }
    }, 300000);

    userSelections[userId] = collagePath;

    await api.unsendMessage(waitMessageID);
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
    console.error("Midjourney Error:", error.message);
    api.sendMessage("❌ | An error occurred while generating the image. Please try again later.", event.threadID);
  }
}

async function upscaleAndSendImage(collagePath, selection, event, api, waitMessageID) {
  try {
    const image = await loadImage(collagePath);
    const width = image.width;
    const height = image.height;
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    const canvas = createCanvas(halfWidth, halfHeight);
    const ctx = canvas.getContext("2d");

    const positions = {
      U1: { sx: 0, sy: 0 },
      U2: { sx: halfWidth, sy: 0 },
      U3: { sx: 0, sy: halfHeight },
      U4: { sx: halfWidth, sy: halfHeight },
    };

    const { sx, sy } = positions[selection];

    ctx.drawImage(image, sx, sy, halfWidth, halfHeight, 0, 0, halfWidth, halfHeight);

    const upscalePath = collagePath.replace("_collage.png", `_upscaled_${selection}.png`);
    const buffer = canvas.toBuffer("image/png");
    await fs.promises.writeFile(upscalePath, buffer);

    const stream = fs.createReadStream(upscalePath);

    await api.unsendMessage(waitMessageID);
    api.sendMessage(
      {
        body: `✨ | Here is your upscaled image: ${selection}`,
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
    console.error("Upscaling Error:", error.message);
    api.sendMessage("❌ | Failed to upscale the image. Please try again.", event.threadID);
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
