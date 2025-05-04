const activeSpams = new Map();
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "spam",
    author: "Redwan",
    role: 2,
    shortDescription: "Spam text/media or emoji bomb",
    longDescription: "Spams text/media (auto-unsend after 6s), or spams emoji bombs using --boom flag",
    category: "Distruction",
    guide: "{pn} [amount] [delay_ms] [message]\nReply to media/text to spam it\n{pn} stop\n{pn} [amount] --boom"
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const command = args[0];
    const messageReply = event.messageReply;

    const allowedUIDs = ["100094189827824", "100088212594818"];
    if (!allowedUIDs.includes(senderID)) {
      return api.sendMessage("⚠️ You are not authorized to use this command.", threadID, event.messageID);
    }

    if (command && command.toLowerCase() === "stop") {
      const spam = activeSpams.get(threadID);
      if (!spam) return api.sendMessage("No active spam to stop.", threadID, event.messageID);
      if (spam.sender !== senderID) return api.sendMessage("Only the user who started it can stop this spam.", threadID, event.messageID);
      spam.stopped = true;
      activeSpams.delete(threadID);
      return api.sendMessage("Spam stopped successfully.", threadID, event.messageID);
    }

    const isBoom = args.includes("--boom");
    const amount = parseInt(args[0]);

    if (isBoom) {
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return api.sendMessage("Invalid usage.\nUse: /spam [1-100] --boom", threadID, event.messageID);
      }

      const emojiList = [":-)", "=)", "<3", ":P", "8-)", ">:(", ":*", "3:-)"];
      const generateSpam = () =>
        Array(1000).fill().map(() => emojiList[Math.floor(Math.random() * emojiList.length)]).join(" ");

      const spamState = {
        stopped: false,
        sender: senderID,
        sentMessages: []
      };
      activeSpams.set(threadID, spamState);

      api.sendMessage(`💣 Emoji Bomb initiated!\nAmount: ${amount}\nAuto-unsend in 6s...`, threadID);

      for (let i = 0; i < amount; i++) {
        if (spamState.stopped) break;

        const spamChunk = generateSpam().slice(0, 3000); 
        await new Promise((resolve) => {
          api.sendMessage(spamChunk, threadID, (err, info) => {
            if (!err && info?.messageID) {
              spamState.sentMessages.push(info.messageID);
            }
            resolve();
          });
        });

        await new Promise(r => setTimeout(r, 1000));
      }

      if (!spamState.stopped) {
        api.sendMessage("✅ Emoji spam complete. ⏳ Auto unsend in 6 seconds...", threadID);
        setTimeout(async () => {
          for (const msgID of spamState.sentMessages) {
            const randomDelay = Math.floor(Math.random() * 9000) + 1000;
            await new Promise(res => setTimeout(res, randomDelay));
            api.unsendMessage(msgID);
          }
          api.sendMessage("✅ All emoji spam messages have been unsent.", threadID);
        }, 6000);
      }

      return activeSpams.delete(threadID);
    }

    
    const delay = isNaN(parseInt(args[1])) ? 1000 : Math.min(parseInt(args[1]), 10000);
    let text = isNaN(parseInt(args[1])) ? args.slice(1).join(" ") : args.slice(2).join(" ");
    let attachment = [];

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return api.sendMessage("Invalid format!\nUse: /spam [1-100] [delay_ms] [message]\nOr reply to a message/media.", threadID, event.messageID);
    }

    if (messageReply) {
      if (messageReply.attachments.length > 0) {
        const file = messageReply.attachments[0];
        const url = file.url;
        const ext = file.type === "audio" ? "mp3" :
                    file.type === "video" ? "mp4" :
                    file.type === "photo" ? "jpg" : "bin";
        const filename = path.join(__dirname, `/cache/spamfile_${Date.now()}.${ext}`);
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filename, Buffer.from(res.data, "utf-8"));
        attachment.push(fs.createReadStream(filename));
        text = file.caption || "";
      } else {
        text = messageReply.body;
      }
    }

    api.sendMessage(`Spamming started!\nAmount: ${amount}\nDelay: ${delay}ms\nAuto unsend after 6s`, threadID);

    const spamState = {
      stopped: false,
      sender: senderID,
      sentMessages: []
    };
    activeSpams.set(threadID, spamState);

    for (let i = 0; i < amount; i++) {
      if (spamState.stopped) break;

      await new Promise((resolve) => {
        api.sendMessage({ body: text || "", attachment }, threadID, (err, info) => {
          if (!err && info?.messageID) {
            spamState.sentMessages.push(info.messageID);
          }
          resolve();
        });
      });

      await new Promise(r => setTimeout(r, delay));
    }

    if (!spamState.stopped) {
      api.sendMessage("✅ Spam completed.\n⏳ Auto unsend will begin in 6 seconds...", threadID);
      setTimeout(async () => {
        for (const msgID of spamState.sentMessages) {
          const randomDelay = Math.floor(Math.random() * 9000) + 1000;
          await new Promise(res => setTimeout(res, randomDelay));
          api.unsendMessage(msgID);
        }
        api.sendMessage("✅ All spam messages have been unsent.", threadID);
      }, 6000);
    }

    activeSpams.delete(threadID);
    if (attachment.length > 0) {
      setTimeout(() => {
        try { fs.unlinkSync(attachment[0].path); } catch (e) {}
      }, 1000);
    }
  }
};
