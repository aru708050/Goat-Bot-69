const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'Exxa',
    category: 'cheating with talk AI',
    author: "Redwan",
  },

  onStart: function({ global }) {
    global.GoatBot = global.GoatBot || {};
    global.GoatBot.onReply = global.GoatBot.onReply || new Map();
  },

  async onChat({ api, event, args }) {
    const q = args.join(' ');
    if (!q.toLowerCase().startsWith("exxa")) return;

    const { threadID, messageID, senderID } = event;
    const apiUrl = `https://global-redwans-apis.onrender.com/api/vai?prompt=${encodeURIComponent(q)}`;

    try {
      let audioBuffer = await fetchWithRetry(apiUrl);
      if (!audioBuffer) throw new Error("Audio generation failed.");

      const tempFilePath = path.join(__dirname, `./temp_audio_${Date.now()}.mp3`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      api.sendMessage({
        body: '',
        attachment: fs.createReadStream(tempFilePath),
      }, threadID, function(error, info) {
        if (error) {
          console.error("Error sending message:", error);
          return;
        }
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: senderID,
        });

        setTimeout(() => fs.unlink(tempFilePath, err => {
          if (err) console.error("Error deleting temp file:", err);
        }), 5000);
      }, messageID);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      api.sendMessage(`Error: ${e.message}`, threadID, messageID);
    }
  },

  async onReply({ api, event }) {
    const reply = event.body.toLowerCase();
    const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);
    if (!replyData || replyData.author !== event.senderID) return;

    const apiUrl = `https://global-redwans-apis.onrender.com/api/vai?prompt=${encodeURIComponent(reply)}`;

    try {
      let audioBuffer = await fetchWithRetry(apiUrl);
      if (!audioBuffer) throw new Error("Audio generation failed.");

      const tempFilePath = path.join(__dirname, `./temp_audio_${Date.now()}.mp3`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      api.sendMessage({
        body: '',
        attachment: fs.createReadStream(tempFilePath),
      }, event.threadID, function(error, info) {
        if (error) {
          console.error("Error sending message:", error);
          return;
        }
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
        });

        setTimeout(() => fs.unlink(tempFilePath, err => {
          if (err) console.error("Error deleting temp file:", err);
        }), 5000);
      }, event.messageID);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
  }
};

async function fetchWithRetry(url, retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      let response = await fetch(url);
      if (response.ok) return await response.buffer();
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed: ${error.message}`);
    }
    await new Promise(res => setTimeout(res, delay));
  }
  return null;
}
