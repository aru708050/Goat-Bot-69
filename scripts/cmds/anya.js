const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "Redwan",
    version: "3.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Chat with Anya Forger",
    },
    longDescription: {
      en: "Chat with Anya Forger. This is not Vex's version, okay?",
    },
    category: "ai",
    guide: {
      en: "{p}{n} [text]",
    },
  },
  onStart: async function ({ api, event, args, message }) {
    try {
      const { createReadStream, unlinkSync } = fs;
      const { resolve } = path;
      const { messageID, threadID, senderID } = event;

      const getUserInfo = async (api, userID) => {
        try {
          const userInfo = await api.getUserInfo(userID);
          return userInfo[userID].firstName;
        } catch (error) {
          console.error(`Error fetching user info: ${error}`);
          return "User";
        }
      };

      const [a, b] = ["Konichiwa", "senpai"];
      const userName = await getUserInfo(api, senderID);
      const greeting = `${a} ${userName} ${b}`;

      const chat = args.join(" ");
      if (!args[0]) return message.reply(greeting);

      const translateResponse = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(chat)}`
      );
      const translatedText = translateResponse.data[0][0][0];

      const audioPath = resolve(__dirname, "cache", `${threadID}_${senderID}.wav`);
      const ttsResponse = await axios.get(
        `https://golbal-redwan-anya-voice-api.onrender.com/anya?text=${encodeURIComponent(translatedText)}`
      );

      if (!ttsResponse.data.success) {
        return message.reply("Failed to generate Anya's voice. Please try again later.");
      }

      const audioUrl = ttsResponse.data.data.mp3StreamingUrl;

      await global.utils.downloadFile(audioUrl, audioPath);

      const audioStream = createReadStream(audioPath);
      message.reply(
        {
          body: translatedText,
          attachment: audioStream,
        },
        threadID,
        () => unlinkSync(audioPath)
      );
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while processing your request. Please try again later.");
    }
  },
};
