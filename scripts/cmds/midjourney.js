const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function parseArgs(text) {
  const prompt = text.replace(/--[a-z]+\s*\S*/gi, "").trim();
  return { prompt };
}

module.exports = {
  config: {
    name: "midjourney",
    aliases: [],
    version: "3.7",
    author: "Renz x @Ariyan",
    countDown: 10,
    role: 2,
    shortDescription: "Generate AI images using Midjourney API (no sharp)",
    longDescription: "Use Midjourney API to generate 4 images. Reply with U1–U4 to select.",
    category: "ai",
    guide: `{pn} <prompt>\n\nExample:\n{pn} dragon flying in sky`
  },

  onStart: async function ({ api, event, args }) {
    const rawPrompt = args.join(" ");
    if (!rawPrompt) return api.sendMessage("Enter a prompt.\nExample: midjourney dragon flying", event.threadID, event.messageID);

    const { prompt } = parseArgs(rawPrompt);
    const waitMsg = await api.sendMessage("⚡ Summoning your Midjourney image... Please wait.", event.threadID, event.messageID);

    try {
      const res = await axios.get("https://zaikyoov3.koyeb.app/api/mj-proxy-pub", {
        params: { prompt: rawPrompt }
      });

      const results = res.data?.results;
      if (!results || results.length !== 4)
        return api.sendMessage("❌ Error: API didn't return 4 images.", event.threadID, waitMsg.messageID);

      const attachments = [];
      const filePaths = [];

      for (let i = 0; i < results.length; i++) {
        const url = results[i];
        const filePath = path.join(__dirname, `cache/mj_${event.senderID}_${i}.jpg`);
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));
        attachments.push(fs.createReadStream(filePath));
        filePaths.push(filePath);
      }

      api.sendMessage({
        body: `🖼️ Here are your generated images:\n\nReply with:\n• U1 – Top Left\n• U2 – Top Right\n• U3 – Bottom Left\n• U4 – Bottom Right`,
        attachment: attachments
      }, event.threadID, async (err, info) => {
        if (err) return console.error("Send error:", err);

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "midjourney",
          author: event.senderID,
          images: results
        });

        setTimeout(() => {
          filePaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
        }, 60 * 1000);
      }, waitMsg.messageID);

    } catch (err) {
      console.error("Midjourney error:", err?.response?.data || err);
      return api.sendMessage("⚠️ Failed to generate image. Please try again later.", event.threadID, waitMsg.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim().toUpperCase();
    const index = { U1: 0, U2: 1, U3: 2, U4: 3 }[input];

    if (index === undefined)
      return api.sendMessage("⚠️ Invalid input. Please reply with U1, U2, U3, or U4.", event.threadID, event.messageID);

    try {
      const url = Reply.images[index];
      const filePath = path.join(__dirname, `cache/mj_select_${event.senderID}.jpg`);
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `✨ Here's your selected image (${input})`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.existsSync(filePath) && fs.unlinkSync(filePath));

    } catch (err) {
      console.error("Selection error:", err);
      api.sendMessage("❌ Could not send the image.", event.threadID, event.messageID);
    }
  }
};
