const axios = require("axios");
const request = require("request");

module.exports = {
  config: {
    name: "imgen",
    aliases: [],
    version: "1.2",
    author: "@RI F AT",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI images",
    longDescription: "Generate 4 images from a prompt and reply with U1–U4 to choose",
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Please provide a prompt.", event.threadID, event.messageID);

    const waiting = await api.sendMessage("🔄 Generating image, please wait...", event.threadID);

    try {
      const res = await axios.get(`https://imagine-eabg.onrender.com/imagine?prompt=${encodeURIComponent(prompt)}`);
      const images = res.data.data;

      if (!images || images.length < 4) {
        return api.sendMessage("❌ Failed to retrieve 4 images.", event.threadID, waiting.messageID);
      }

      const attachments = images.map(img => request(img.url));

      api.sendMessage({
        body: `🖼 Images for: "${prompt}"\nReply with:\nU1 for Image 1\nU2 for Image 2\nU3 for Image 3\nU4 for Image 4`,
        attachment: attachments
      }, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "imagine",
          messageID: info.messageID,
          prompt,
          images
        });
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Error fetching images.", event.threadID, waiting.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const choice = event.body.trim().toUpperCase();
    const match = choice.match(/^U([1-4])$/);

    if (!match) return api.sendMessage("❌ Invalid choice. Please reply with U1, U2, U3, or U4.", event.threadID);

    const index = parseInt(match[1]) - 1;
    const image = Reply.images[index];

    if (!image) return api.sendMessage("❌ Image not found.", event.threadID);

    try {
      const imgStream = request(image.url);
      api.sendMessage({
        body: `✅ Here is Image ${index + 1} for: "${Reply.prompt}"`,
        attachment: imgStream
      }, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to send image.", event.threadID);
    }
  }
};