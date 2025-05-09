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
      en: "Mock a user globally"
    },
    longDescription: {
      en: "The bot will mock the user everywhere when they chat"
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

  onChat: async function ({ event, message }) {
    const { senderID, body } = event;
    if (!body || !mockedUsers[senderID]) return;

    const delay = Math.floor(Math.random() * 6) + 10;

    setTimeout(async () => {
      try {
        const res = await axios.get("https://global-redwans-rest-apis.onrender.com/api/mock", {
          params: {
            text: body,
            uid: senderID
          }
        });

        const reply = res.data?.aizen_reply;
        if (reply) message.reply(reply);
      } catch {}
    }, delay * 1000);
  }
};
