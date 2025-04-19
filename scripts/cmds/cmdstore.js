const axios = require("axios");

module.exports = {
  config: {
    name: "cmdstore",
    version: "1.4",
    author: "Redwan",
    role: 0,
    shortDescription: "⚡ 𝙏𝙝𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙎𝙩𝙤𝙧𝙚",
    longDescription: "🚀 𝘼 𝙘𝙤𝙡𝙡𝙚𝙘𝙩𝙞𝙤𝙣 𝙤𝙛 𝙪𝙨𝙚𝙛𝙪𝙡 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙗𝙮 𝙍𝙚𝙙𝙬𝙖𝙣.",
    category: "utility",
    guide: {
      en: "📌 𝙐𝙨𝙖𝙜𝙚:\n ├ 📜 𝙑𝙞𝙚𝙬 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨: {p}cmdstore\n ├ 🔄 𝙋𝙖𝙜𝙞𝙣𝙖𝙩𝙚: {p}cmdstore {page}\n ├ 🔍 𝙎𝙚𝙖𝙧𝙘𝙝: {p}cmdstore {command_name}"
    }
  },

  onStart: async function ({ event, args, message }) {
    try {
      const response = await axios.get("https://global-redwans-apisxcmd.onrender.com/cmdstore");
      const commands = response.data;

      if (args.length >= 1 && isNaN(parseInt(args[0]))) {
        const searchQuery = args.join(" ").toLowerCase();
        const matchedCommand = commands.find(cmd => cmd.name.toLowerCase() === searchQuery);

        if (matchedCommand) {
          let replyMessage = `┏━━━━━━━━━━━┓\n┣ 🔹 𝙉𝙖𝙢𝙚: ${matchedCommand.name}\n┣ 🔗 𝙋𝙖𝙨𝙩𝙚𝙗𝙞𝙣: ${matchedCommand.pastebin}\n┣ 📜 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: ${matchedCommand.description}\n┗━━━━━━━━━━━┛`;
          return message.reply(replyMessage);
        } else {
          return message.reply(`⚠️ 𝙉𝙤 𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 "${searchQuery}".`);
        }
      }

      let page = 1;
      if (args.length === 1 && !isNaN(parseInt(args[0]))) {
        page = parseInt(args[0]);
      }

      const commandsPerPage = 5;
      const startIndex = (page - 1) * commandsPerPage;
      const paginatedCommands = commands.slice(startIndex, startIndex + commandsPerPage);

      if (paginatedCommands.length === 0) {
        return message.reply("🚫 𝙉𝙤 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 𝙛𝙤𝙪𝙣𝙙.");
      }

      let replyMessage = `🔥 𝙏𝙝𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙎𝙩𝙤𝙧𝙚 🔥\n📌 𝙋𝙖𝙜𝙚: ${page}\n━━━━━━━━━━━━━\n`;

      replyMessage += paginatedCommands
        .map(cmd => `🔹 𝙉𝙖𝙢𝙚: ${cmd.name}\n   🔗 𝙋𝙖𝙨𝙩𝙚𝙗𝙞𝙣: ${cmd.pastebin}\n   📜 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: ${cmd.description}`)
        .join("\n━━━━━━━━━━━━━\n");

      message.reply(replyMessage, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "cmdstore",
          messageID: info.messageID,
          author: event.senderID,
          commands,
        });
      });
    } catch (error) {
      console.error(error);
      message.reply("🚨 𝙀𝙧𝙧𝙤𝙧: 𝘾𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙛𝙚𝙩𝙘𝙝 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨.");
    }
  }
};
