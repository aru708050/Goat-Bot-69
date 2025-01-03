const axios = require('axios');

module.exports = {
  config: {
    name: "unc",
    version: "1.0",
    author: "Redwan | Alan",
    role: 0,
    longDescription: "Unleash the power of your savage AI for unparalleled interactions.",
    category: "ai",
    guide: {
      en: "{p}unc [your prompt here]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    if (!args.length) {
      return api.sendMessage("🤖 You expect me to guess your thoughts? Give me a prompt, genius!", threadID, messageID);
    }

    const prompt = args.join(' ');

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(prompt)}&uid=${senderID}`);
      const content = response.data.response;

      const sentMessage = await api.sendMessage("⚡ Processing... Stay tuned, legend!", threadID, () => {
        api.sendMessage(content, threadID, messageID);
      });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        senderID: senderID,
        threadID: threadID
      });
    } catch (err) {
      console.error(err);
      api.sendMessage(`💥 Whoops! Something went wrong: ${err.message}`, threadID, messageID);
    }
  },

  onReply: async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    if (!body) {
      return api.sendMessage("🌀 Still waiting... Type something, superstar!", threadID, messageID);
    }

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gemini-pro?q=${encodeURIComponent(body)}&uid=${senderID}`);
      const content = response.data.response;

      const sentMessage = await api.sendMessage("🔥 On it! Let me blow your mind.", threadID, () => {
        api.sendMessage(content, threadID, messageID);
      });

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        senderID: senderID,
        threadID: threadID
      });
    } catch (err) {
      console.error(err);
      api.sendMessage(`⚠️ Error! Seems like something exploded: ${err.message}`, threadID, messageID);
    }
  }
};
