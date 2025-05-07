const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getStreamFromURL } = global.utils;
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "flux9nm",
    version: "2.0",
    author: "Redwan",
    aliases: ["f9nm", "f9"],
    countDown: 20,
    role: 2,
    category: "image",
    longDescription: {
      en: "Generate images using Flux9nm styled AI"
    },
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("Enter a prompt to generate your Flux9nm image.");

    api.setMessageReaction("⚡", event.messageID, () => {}, true);
    message.reply("🧠 Flux9nm AI is generating your high-voltage imagination...", async (err) => {
      if (err) return;

      try {
        const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/flux9nm?prompt=${encodeURIComponent(prompt)}`;
        const res = await axios.get(apiUrl);
        const result = res.data.result;

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const imageUrls = result.map(img =>
          `https://images.weserv.nl/?url=${img.url.replace(/^https?:\/\//, '')}&output=png`
        );

        while (imageUrls.length < 4) imageUrls.push(null);

        const imageBuffers = await Promise.all(imageUrls.map(async (url, idx) => {
          if (!url) return null;
          const stream = await getStreamFromURL(url, `flux_temp_${idx}.png`);
          const buffers = [];
          for await (const chunk of stream) buffers.push(chunk);
          return Buffer.concat(buffers);
        }));

        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 4; i++) {
          const x = (i % 2) * 512;
          const y = Math.floor(i / 2) * 512;
          if (imageBuffers[i]) {
            const img = await loadImage(imageBuffers[i]);
            ctx.drawImage(img, x, y, 512, 512);
          } else {
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(x, y, 512, 512);
          }
        }

        const outPath = path.join(cacheDir, `flux_collage_${event.senderID}_${Date.now()}.png`);
        const out = fs.createWriteStream(outPath);
        canvas.createPNGStream().pipe(out);

        out.on("error", () => message.reply("Error while creating image file."));

        out.on("finish", () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          message.reply({
            body: `⚡ 𝗙𝗟𝗨𝗫𝟵𝗡𝗠 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 ⚡\n\n『U1』『U2』『U3』『U4』\n• Reply with U1 to U4 to get individual image.`,
            attachment: fs.createReadStream(outPath)
          }, (err, info) => {
            if (err) return;

            global.GoatBot.onReply.set(info.messageID, {
              commandName: "flux9nm",
              author: event.senderID,
              messageID: info.messageID,
              images: imageUrls
            });
          });

          setTimeout(() => {
            try {
              fs.unlinkSync(outPath);
            } catch {}
          }, 60 * 1000);
        });

      } catch (e) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply("Flux9nm failed to generate image. Try again shortly.");
        console.error("Flux9nm error:", e);
      }
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author)
      return message.reply("Only the original user can select the image.");

    const input = event.body.trim().toUpperCase();
    if (!/^U[1-4]$/.test(input)) return message.reply("Use U1, U2, U3, or U4 to select an image.");

    const index = parseInt(input[1]) - 1;
    const imageUrl = Reply.images[index];

    if (!imageUrl) return message.reply("This slot was empty in the collage.");

    try {
      const stream = await getStreamFromURL(imageUrl, `Flux9nm_U${index + 1}.png`);
      message.reply({
        body: `⚡ 𝗙𝗟𝗨𝗫𝟵𝗡𝗠 • 𝗨${index + 1} ⚡\nHere is your selected image.`,
        attachment: stream
      });
    } catch (e) {
      console.error(e);
      message.reply("Couldn't load the image. Try again.");
    }
  }
};
