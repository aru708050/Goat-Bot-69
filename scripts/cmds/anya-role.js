const axios = require("axios");

module.exports = {
  config: {
    name: "anya",
    aliases: ["anyaai", "anya-chat"],
    version: "1.5",
    author: "Redwan",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with Anya AI",
    longDescription: "Get AI-generated responses from Anya AI.",
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

    const uid = event.senderID; // Get user ID
    const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/anya?prompt=${encodeURIComponent(query)}&uid=${uid}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 10000 });
      if (!response.data?.reply) {
        throw new Error("Invalid response structure");
      }

      const aiResponse = response.data.reply.trim();
      const finalResponse = `𝘼𝙉𝙔𝘼\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: this.config.name,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Anya AI API Error:", error.message);
      api.sendMessage("❌ Anya AI service is currently unavailable!", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event }) {
    try {
      const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
      if (!replyData || replyData.author !== event.senderID) return;

      const userAnswer = event.body.trim();
      const uid = event.senderID; // Get user ID
      const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/anya?prompt=${encodeURIComponent(userAnswer)}&uid=${uid}`;

      const response = await axios.get(apiUrl, { timeout: 10000 });
      if (!response.data?.reply) {
        throw new Error("Invalid response structure");
      }

      const aiResponse = response.data.reply.trim();
      const finalResponse = `𝘼𝙉𝙔𝘼\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: replyData.commandName,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Anya AI Reply Error:", error.message);
      api.sendMessage("❌ Anya AI service is currently unavailable!", event.threadID, event.messageID);
    }
  }
};
