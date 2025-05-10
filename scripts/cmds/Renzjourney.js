const axios = require('axios');
const { getStreamFromURL } = global.utils;
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "Renzjourney",
    version: "1.0",
    author: "Redwan x Renz",
    aliases: ["rj"],
    countDown: 20,
    longDescription: {
      en: "Generate AI images with Midjourney prompt using Renz's public proxy.",
    },
    category: "image",
    role: 2,
    guide: {
      en: "{pn} <your prompt>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply("Enter a prompt to generate a Renzjourney image.");

    api.setMessageReaction("⌛", event.messageID, () => {}, true);
    message.reply("Renz Niqqa is dreaming your art. Please wait...", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiKey = "gaywan_api"; // You can store this in env later
        const apiUrl = `https://renzweb.onrender.com/api/mj-proxy-pub?prompt=${encodeURIComponent(prompt)}&key=${apiKey}`;
        const response = await axios.get(apiUrl);
        const { message: statusMsg, results } = response.data;

        if (!Array.isArray(results) || results.length !== 4) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply("Image generation failed. Try again later.");
        }

        const images = await Promise.all(results.map(url => loadImage(url)));
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(images[0], 0, 0, 512, 512);
        ctx.drawImage(images[1], 512, 0, 512, 512);
        ctx.drawImage(images[2], 0, 512, 512, 512);
        ctx.drawImage(images[3], 512, 512, 512, 512);

        const timestamp = Date.now();
        const outputPath = path.join(__dirname, 'cache', `rj_collage_${event.senderID}_${timestamp}.png`);
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", async () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);

          const msg = {
            body: `*Renzjourney has completed your prompt!*\n\n${statusMsg}\nSelect: U1, U2, U3, U4`,
            attachment: fs.createReadStream(outputPath),
          };

          message.reply(msg, (err, info) => {
            if (err) return console.error(err);
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              images: results
            });
          });

          // Auto cleanup after 1 minute
          setTimeout(() => fs.unlink(outputPath, () => {}), 60 * 1000);
        });

      } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        console.error(error);
        message.reply("Renzjourney failed to generate the image. Please try again.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("Only the original requester can select a Renzjourney image.");
    }

    const input = event.body.trim().toUpperCase();
    const match = input.match(/^U([1-4])$/);

    if (!match) {
      return message.reply("Invalid input. Please reply with U1, U2, U3, or U4.");
    }

    const index = parseInt(match[1]) - 1;
    const selectedImage = images[index];

    try {
      const imageStream = await getStreamFromURL(selectedImage, `Renz_U${index + 1}.jpg`);
      message.reply({
        body: `Here is your selected Renzjourney image (U${index + 1}).`,
        attachment: imageStream
      });
    } catch (error) {
      console.error(error);
      message.reply("Failed to retrieve the image. Please try again.");
    }
  },
};
