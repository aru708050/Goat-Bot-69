const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "imaginev8",
    version: "1.2",
    author: "Redwan - Iconic Innovator",
    aliases: ["gen8", "cord", "imaginexx"],
    countDown: 20,
    longDescription: {
      en: "Bring your imagination to life with ultra-realistic AI-generated images.",
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
      return message.reply("🔮 *The world of imagination awaits.* Provide a prompt to unleash ultra-realistic creations.");
    }

    message.reply("✨ *Igniting the engines of creativity...* Hold tight as your masterpiece is born!", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `https://redwans-midjourneyv5.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&api_key=xemon`;
        const response = await axios.get(apiUrl);
        const { combined_img, original_images, success } = response.data;

        if (!success || !combined_img || !original_images || !original_images.length) {
          return message.reply("🚫 *Imagination failed.* The AI couldn’t grasp your vision. Try a new prompt.");
        }

        message.reply(
          {
            body: "🎨 *Your ultra-realistic creation has arrived!*\nReply with a number (1, 2, 3, or 4) to view individual details.",
            attachment: await getStreamFromURL(combined_img, "collage.png"),
          },
          (err, info) => {
            if (err) return console.error(err);

            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              images: original_images,
            });
          }
        );
      } catch (error) {
        console.error(error);
        message.reply("💥 *The AI took a wrong turn.* Something went wrong. Try again to fuel your imagination.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userChoice = parseInt(event.body.trim());
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ *Hold on!* Only the dreamer who started this can reply.");
    }

    if (isNaN(userChoice) || userChoice < 1 || userChoice > images.length) {
      return message.reply(`❌ *Imagination misaligned.* Please choose a number between 1 and ${images.length}.`);
    }

    try {
      const selectedImage = images[userChoice - 1];
      const imageStream = await getStreamFromURL(selectedImage, `imagination_${userChoice}.jpg`);
      message.reply({
        body: `✨ *Here is your ultra-realistic vision (${userChoice}).* Witness creativity in its purest form.`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("💥 *The imagination faltered.* Something went wrong fetching the image. Try again.");
    }
  },
};
