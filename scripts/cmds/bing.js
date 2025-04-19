const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { getStreamFromURL } = global.utils;
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bing",
    version: "2.0",
    author: "Redwan - Iconic Innovator",
    aliases: ["binggen", "bingai", "bingimage"],
    countDown: 20,
    longDescription: {
      en: "Generate high-quality AI images based on your prompt.",
    },
    category: "image",
    role: 2,
    guide: {
      en: "{pn} <prompt>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return message.reply("🔍 Provide a prompt to generate an AI image.");
    }

    message.reply("✨ Creating your AI-generated image...", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `https://global-redwans-apis.onrender.com/api/bing?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const { imgUrls } = response.data;

        if (!imgUrls || imgUrls.length < 4) {
          return message.reply("⚠️ Not enough images generated. Try refining your prompt.");
        }

        const collagePath = await generateCollage(imgUrls);
        const collageStream = fs.createReadStream(collagePath);

        message.reply(
          {
            body: "🖼 AI-generated image is ready! Reply with 1, 2, 3, or 4 to view individual images.",
            attachment: collageStream,
          },
          (err, info) => {
            if (err) return console.error(err);

            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              images: imgUrls,
            });

            setTimeout(() => fs.unlinkSync(collagePath), 60000);
          }
        );
      } catch (error) {
        console.error(error);
        message.reply("❌ Failed to generate the image. Try again later.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userChoice = parseInt(event.body.trim());
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ Only the original requester can view the images.");
    }

    if (isNaN(userChoice) || userChoice < 1 || userChoice > images.length) {
      return message.reply(`❌ Invalid choice. Choose a number between 1 and ${images.length}.`);
    }

    try {
      const selectedImage = images[userChoice - 1];
      const imageStream = await getStreamFromURL(selectedImage, `image${userChoice}.png`);

      message.reply({
        body: `✨ Here’s your selected AI-generated image (${userChoice}).`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Couldn't retrieve the image. Try again.");
    }
  },
};

async function generateCollage(imgUrls) {
  const canvasSize = 512;
  const imgSize = canvasSize / 2;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  const images = await Promise.all(imgUrls.map((url) => loadImage(url)));

  ctx.drawImage(images[0], 0, 0, imgSize, imgSize);
  ctx.drawImage(images[1], imgSize, 0, imgSize, imgSize);
  ctx.drawImage(images[2], 0, imgSize, imgSize, imgSize);
  ctx.drawImage(images[3], imgSize, imgSize, imgSize, imgSize);

  const collagePath = path.join(__dirname, "collage.png");
  const out = fs.createWriteStream(collagePath);
  const stream = canvas.createPNGStream();

  return new Promise((resolve, reject) => {
    stream.pipe(out);
    out.on("finish", () => resolve(collagePath));
    out.on("error", reject);
  });
                    }
