const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "deji",
    version: "1.0",
    author: "Redwan - Iconic Innovator",
    aliases: ["animegen", "animeart", "dejiart"],
    countDown: 0,
    longDescription: {
      en: "Dive into the realm of anime and bring your imagination to life with iconic anime-style image generation.",
    },
    category: "image",
    role: 0,
    guide: {
      en: "{pn} <prompt>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return message.reply("🌟 *A world of anime awaits.* Share your prompt to summon iconic creations from another realm.");
    }

    message.reply("✨ *Bringing your anime dream to life...* Hold tight as the magic unfolds!", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `https://global-redwan-paid-anime-apis.onrender.com/generate?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const { collage, images } = response.data;

        if (!collage || !images || !images.length) {
          return message.reply("🚫 *Summoning failed.* The anime gods couldn’t interpret your vision. Try a new prompt.");
        }

        message.reply(
          {
            body: "🎨 *Your anime masterpiece has arrived!*\nReply with a number (1, 2, 3, or 4) to explore individual details.",
            attachment: await getStreamFromURL(collage, "anime_collage.png"),
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
        message.reply("💥 *The anime summoning spell failed.* Something went wrong. Please try again.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userChoice = parseInt(event.body.trim());
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ *Only the summoner may respond.* Please respect the magic!");
    }

    if (isNaN(userChoice) || userChoice < 1 || userChoice > images.length) {
      return message.reply(`❌ *Magic misfire.* Choose a number between 1 and ${images.length} to reveal an image.`);
    }

    try {
      const selectedImage = images[userChoice - 1][`Image ${userChoice}`];
      if (!selectedImage) {
        return message.reply("❌ *Vision blurred.* Unable to fetch the selected image. Try again.");
      }

      const imageStream = await getStreamFromURL(selectedImage, `anime_image${userChoice}.png`);
      message.reply({
        body: `✨ *Behold your anime creation (${userChoice}).* Dive deeper into the art!`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("💥 *The anime magic faltered.* Something went wrong fetching the image. Please try again.");
    }
  },
};
