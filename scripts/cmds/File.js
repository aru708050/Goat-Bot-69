const fs = require('fs-extra');
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: 'file',
    version: '1.0',
    role: 0,
    coolDown: 5,
    author: 'Redwan',
    category: 'Admin',
    shortDescription: {
      en: 'sending file'
    },
    longDescription: {
      en: 'Sending file from bot scripts',
    },
  },
  onStart: async function ({ api, event, args, message }) {
    const permission = ['100094189827824'];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage('এই কমান্ডটি শুধু অ্যাডমিনরা ব্যবহার করতে পারবেন।', event.threadId, event.messageId);
    }

    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);
    const commandName = this.config.name;
    const command = prefix + commandName;

    if (args.length === 0) {
      return message.reply(`আমি ${commandName} ফাইলটি খুঁজে দেখব।`);
    }

    const fileName = args.length > 0 ? args[0] : this.config.name;
    const filePath = `${__dirname}/${fileName}`;

    if (!fs.existsSync(filePath)) {
      return message.reply(`ফাইল ${fileName} পাওয়া যায়নি। নামটি সঠিক আছে তো?`);
    }

    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      api.sendMessage(fileData, threadID, messageID);
    } catch (error) {
      console.error(error);
      message.reply(`ফাইলে সমস্যা হয়েছে। আবার চেক করুন।`);
    }
  }
};
