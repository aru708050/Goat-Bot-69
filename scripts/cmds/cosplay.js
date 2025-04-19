const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "cosplay",
    version: "1.0",
    author: "Redwan - Iconic Innovator",
    aliases: ["cos", "animecos", "cosplaygen"],
    countDown: 20,
    longDescription: {
      en: "Create anime-inspired cosplay images based on your prompt and imagination.",
    },
    category: "image",
    role: 2,
    guide: {
      en: "{pn} <prompt>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return message.reply("🎨 *Please describe the anime cosplay you want to see.* Provide a detailed prompt.");
    }

    message.reply("✨ *Processing your request...* The AI is working on bringing your idea to life.", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `https://global-redwans-apis-hgen.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const { collage, images } = response.data;

        if (!collage || !images || !images.length) {
          return message.reply("⚠️ *No result found.* Try modifying your prompt for better results.");
        }

        message.reply(
          {
            body: "🖼 *Your anime-inspired cosplay is ready!*\nReply with a number (1, 2, 3, or 4) to view the individual images.",
            attachment: await getStreamFromURL(collage, "collage.png"),
          },
          (err, info) => {
            if (err) return console.error(err);

            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              images,
            });
          }
        );
      } catch (error) {
        console.error(error);
        message.reply("❌ *Something went wrong.* Please try again later.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userChoice = parseInt(event.body.trim());
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ *You cannot view this image.* Only the person who requested it can reply.");
    }

    if (isNaN(userChoice) || userChoice < 1 || userChoice > images.length) {
      return message.reply(`❌ *Invalid selection.* Please choose a number between 1 and ${images.length}.`);
    }

    try {
      const selectedImageKey = `Image ${userChoice}`;
      const selectedImage = images[userChoice - 1][selectedImageKey];

      if (!selectedImage) {
        return message.reply("⚠️ *Image not found.* Please select a valid image number.");
      }

      const imageStream = await getStreamFromURL(selectedImage, `image${userChoice}.png`);
      message.reply({
        body: `✨ *Here is your selected anime cosplay image (${userChoice}).*`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ *Error fetching the image.* Please try again.");
    }
  },
};
