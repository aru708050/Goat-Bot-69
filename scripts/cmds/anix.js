const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "anix",
    version: "1.0",
    author: "Upol | Redwan",
    countDown: 0,
    longDescription: {
      en: "Transform your imagination into stunning anime art."
    },
    category: "image",
    role: 0,
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return message.reply("🌌 Dive into creativity: Provide a prompt to bring your anime vision to life.");
    }

    message.reply("🎨 Crafting your masterpiece... Stay tuned for the magic! ✨", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `http://upol-dai-v3.onrender.com/api/dai2?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const { combineUrl, Images } = response.data;

        if (!combineUrl || !Images) {
          return message.reply("⚠️ The artistic process encountered an issue. Please refine your prompt and try again.");
        }

        message.reply(
          {
            body: "✨ Your anime artwork is ready! Reply with a number (1, 2, 3, or 4) to explore individual pieces.",
            attachment: await getStreamFromURL(combineUrl, "combined.png"),
          },
          (err, info) => {
            if (err) return console.error(err);

            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              Images,
            });
          }
        );
      } catch (error) {
        console.error(error);
        message.reply("🔥 An unexpected error disrupted the process. Please try again.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const userChoice = parseInt(event.body.trim());
    const { author, Images } = Reply;

    if (event.senderID !== author) {
      return message.reply("🚫 Access restricted: Only the original creator of the command can interact here.");
    }

    if (isNaN(userChoice) || userChoice < 1 || userChoice > 4) {
      return message.reply("❌ Invalid choice! Reply with a number between 1 and 4 to view your selected artwork.");
    }

    try {
      const selectedImage = Images[`image${userChoice}`];
      if (!selectedImage) {
        return message.reply("❌ Unable to retrieve the selected artwork. Please try again.");
      }

      const imageStream = await getStreamFromURL(selectedImage, `anime_image${userChoice}.png`);
      message.reply({
        body: `🌟 Here is your selected anime artwork (${userChoice}). Enjoy the creation!`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("⚠️ An error occurred while fetching your artwork. Please try again.");
    }
  },
};
