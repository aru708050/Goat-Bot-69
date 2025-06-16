 const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    author: "Ariyan",
    category: "fun",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderID = event.senderID;
      const threadID = event.threadID;
      const messageID = event.messageID;

      const senderData = await usersData.get(senderID);
      const senderName = senderData.name;

      const threadData = await api.getThreadInfo(threadID);
      const allUsers = threadData.userInfo;
      const me = allUsers.find((u) => u.id === senderID);

      if (!me?.gender)
        return api.sendMessage("⚠️ Couldn't determine your gender.", threadID, messageID);

      const botID = api.getCurrentUserID();
      const candidates = allUsers.filter(
        (u) => u.gender && u.gender !== me.gender && u.id !== senderID && u.id !== botID
      );

      if (candidates.length === 0)
        return api.sendMessage("❌ No suitable match found in this group.", threadID, messageID);

      const match = candidates[Math.floor(Math.random() * candidates.length)];
      const matchName = match.name;

      // Image URLs
      const avt1URL = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avt2URL = `https://graph.facebook.com/${match.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const bgURL = "https://i.postimg.cc/5tXRQ46D/background3.png";

      // Download all images in parallel
      const [bgData, avt1Data, avt2Data] = await Promise.all([
        axios.get(bgURL, { responseType: "arraybuffer" }),
        axios.get(avt1URL, { responseType: "arraybuffer" }),
        axios.get(avt2URL, { responseType: "arraybuffer" }),
      ]);

      const [bgImg, img1, img2] = await Promise.all([
        loadImage(bgData.data),
        loadImage(avt1Data.data),
        loadImage(avt2Data.data),
      ]);

      // Draw canvas
      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(img1, 100, 150, 300, 300);
      ctx.drawImage(img2, 900, 150, 300, 300);

      const buffer = canvas.toBuffer();
      const filePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      await fs.promises.writeFile(filePath, buffer);

      // Message
      const lovePercent = Math.floor(Math.random() * 31) + 70;
      api.sendMessage(
        {
          body: `🥰𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 𝗽𝗮𝗶𝗿𝗶𝗻𝗴\n・${senderName} 🎀\n・${matchName} 🎀\n💌𝗪𝗶𝘀𝗵 𝘆𝗼𝘂 𝘁𝘄𝗼 𝗵𝘂𝗻𝗱𝗿𝗲𝗱 𝘆𝗲𝗮𝗿𝘀 𝗼𝗳 𝗵𝗮𝗽𝗽𝗶𝗻𝗲𝘀𝘀 ❤️❤️\n\n𝗟𝗼𝘃𝗲 𝗽𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}% 💙`,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => fs.unlink(filePath),
        messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: " + err.message, event.threadID, event.messageID);
    }
  },
};