const axios = require("axios");

module.exports = {
  config: {
    name: "sukuna",
    aliases: ["sukunaai", "sukuna-chat"],
    version: "1.0",
    author: "Redwan",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with Sukuna AI",
    longDescription: "Get AI-generated responses from Sukuna, the King of Curses.",
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

    const uid = event.senderID;
    const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/sukuna?prompt=${encodeURIComponent(query)}&uid=${uid}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 10000 });
      if (!response.data?.reply) {
        throw new Error("Invalid response structure");
      }

      const aiResponse = response.data.reply.trim();
      const finalResponse = `𝙎𝙐𝙆𝙐𝙉𝘼 - 𝙏𝙃𝙀 𝙆𝙄𝙉𝙂 𝙊𝙁 𝘾𝙐𝙍𝙎𝙀𝙎\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: this.config.name,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Sukuna AI API Error:", error.message);
      api.sendMessage("❌ Sukuna AI service is currently unavailable!", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event }) {
    try {
      const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
      if (!replyData || replyData.author !== event.senderID) return;

      const userAnswer = event.body.trim();
      const uid = event.senderID;
      const apiUrl = `https://global-redwans-rest-apis.onrender.com/api/sukuna?prompt=${encodeURIComponent(userAnswer)}&uid=${uid}`;

      const response = await axios.get(apiUrl, { timeout: 10000 });
      if (!response.data?.reply) {
        throw new Error("Invalid response structure");
      }

      const aiResponse = response.data.reply.trim();
      const finalResponse = `𝙎𝙐𝙆𝙐𝙉𝘼 - 𝙏𝙃𝙀 𝙆𝙄𝙉𝙂 𝙊𝙁 𝘾𝙐𝙍𝙎𝙀𝙎\n\n${aiResponse}`;

      api.sendMessage(finalResponse, event.threadID, (err, msgInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(msgInfo.messageID, {
            commandName: replyData.commandName,
            author: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Sukuna AI Reply Error:", error.message);
      api.sendMessage("❌ Sukuna AI service is currently unavailable!", event.threadID, event.messageID);
    }
  }
};
