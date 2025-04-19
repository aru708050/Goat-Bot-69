const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "nijijourney",
    version: "1.2",
    author: "Redwan",
    aliases: ["niji", "nijiv8", "njourney"],
    countDown: 20,
    longDescription: {
      en: "Generate anime art using Niijourney AI.",
    },
    category: "image",
    role: 2,
    guide: {
      en: "{pn} <prompt>",
    },
  },

  onStart: async function ({ api, event, args, message }) {
    let prompt = args.join(' ').trim();
    if (!prompt) return message.reply("Please provide a prompt to generate an image.");

    // Auto append "--niji 6" if not present
    if (!/--niji\s*6/.test(prompt)) {
      prompt += " --niji 6";
    }

    message.reply("Processing request. Please wait...", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `https://redwans-midjourneyv5.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&api_key=xemon`;
        const response = await axios.get(apiUrl);
        const { combined_img, original_images, success } = response.data;

        if (!success || !combined_img || !original_images || !original_images.length) {
          return message.reply("Image generation failed. Try a different prompt.");
        }

        message.reply(
          {
            body: "Niijourney process completed ✨\n\n❏ Action: U1, U2, U3, U4",
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
        message.reply("Failed to process the request. Please try again.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const input = event.body.trim().toUpperCase();
    const { author, images } = Reply;

    if (event.senderID !== author) {
      return message.reply("Only the original requester can use this option.");
    }

    const match = input.match(/^U([1-4])$/);
    if (!match) {
      return message.reply("Invalid input. Please reply with U1, U2, U3, or U4.");
    }

    const selectedIndex = parseInt(match[1]) - 1;
    try {
      const selectedImage = images[selectedIndex];
      const imageStream = await getStreamFromURL(selectedImage, `niji_U${selectedIndex + 1}.jpg`);
      message.reply({
        body: `Output (U${selectedIndex + 1})`,
        attachment: imageStream,
      });
    } catch (error) {
      console.error(error);
      message.reply("Error retrieving the selected image.");
    }
  },
};
