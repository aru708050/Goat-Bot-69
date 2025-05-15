const axios = require("axios");
const mockedUsers = {};

module.exports = {
  config: {
    name: "mock",
    aliases: [],
    version: "1.2",
    author: "Redwan",
    countDown: 3,
    role: 1,
    shortDescription: {
      en: "Enable mock on a user"
    },
    longDescription: {
      en: "Mock a user globally. The bot will reply to them with mocking messages, including images."
    },
    category: "fun",
    guide: {
      en: "{pn} @user or uid\n{pn} off @user or uid\n{pn} list"
    }
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").trim().toLowerCase();

    if (input === "list") {
      const activeMocks = Object.keys(mockedUsers);
      if (activeMocks.length === 0) return message.reply("No users are currently being mocked.");
      const formatted = activeMocks.map((uid, i) => `${i + 1}. UID: ${uid}`).join("\n");
      return message.reply(`Mocked Users:\n${formatted}`);
    }

    const isOff = input.startsWith("off");
    let uid;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      uid = isOff ? args[1] : args[0];
    }

    if (!uid || isNaN(uid)) return message.reply("Please mention a user or provide a valid UID.");

    if (isOff) {
      if (!mockedUsers[uid]) return message.reply("This user is not being mocked.");
      delete mockedUsers[uid];
      return message.reply(`Mocking disabled for UID: ${uid}`);
    } else {
      if (mockedUsers[uid]) return message.reply("This user is already being mocked.");
      mockedUsers[uid] = true;
      return message.reply(`Mocking enabled for UID: ${uid}`);
    }
  },

  onChat: async function ({ event, message, api }) {
    const { senderID, body, messageReply, attachments } = event;
    if (!body && attachments.length === 0) return;
    if (!mockedUsers[senderID]) return;

    let imageUrl = "";

    if (attachments.length > 0 && attachments[0].type === "photo") {
      imageUrl = attachments[0].url;
    } else if (
      messageReply &&
      messageReply.attachments &&
      messageReply.attachments[0] &&
      messageReply.attachments[0].type === "photo"
    ) {
      imageUrl = messageReply.attachments[0].url;
    }

    const delay = Math.floor(Math.random() * 6) + 10;

    setTimeout(async () => {
      try {
        const res = await axios.get(`https://global-redwans-rest-apis.onrender.com/api/mock`, {
          params: {
            text: body || "Image Only",
            uid: senderID,
            img: imageUrl || ""
          }
        });

        const reply = res.data?.aizen_reply;
        if (reply) message.reply(reply);
      } catch {}
    }, delay * 1000);
  }
};
