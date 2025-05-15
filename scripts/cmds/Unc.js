const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    aliases: ["gaymini", "gai"],
    version: "1.4",
    author: "Redwan",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with Gemini AI",
    longDescription: "Get AI-generated responses using Gemini API.",
    category: "AI",
    guide: "{pn} <your message> or reply to an AI message."
  },

  onStart: async function ({ api, event, args }) {
    let query = args.join(" ");

    if (event.type === "message_reply" && event.messageReply) {
      query = event.messageReply.body;
    }

    if (!query) {
      return api.sendMessage("⚠️ Please enter a message!", event.threadID, event.messageID);
    }

    const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/gemini?value=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const aiResponse = response.data.candidates[0].content.parts[0].text.trim();
      const finalResponse = `𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝘿𝙑𝘼𝙉𝘾𝙀\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: this.config.name,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      api.sendMessage("❌ AI service is currently unavailable!", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event }) {
    try {
      const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
      if (!replyData || replyData.author !== event.senderID) return;

      const userAnswer = event.body.trim();
      const apiUrl = `https://global-redwans-apis.onrender.com/api/gemini?value=${encodeURIComponent(userAnswer)}`;

      const response = await axios.get(apiUrl);
      const aiResponse = response.data.candidates[0].content.parts[0].text.trim();
      const finalResponse = `𝙂𝙀𝙈𝙄𝙉𝙄 𝘼𝙄 𝘼𝘿𝙑𝘼𝙉𝘾𝙀\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: replyData.commandName,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      api.sendMessage("❌ AI service is currently unavailable!", event.threadID, event.messageID);
    }
  }
};
