 const axios = require("axios");

const OPENAI_API_KEY = "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";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

module.exports.config = {
  name: "gpt",
  version: "1.0.0",
  usePrefix: true,
  role: 0,
  author: "ariyan",
  description: "Simple GPT-4o-mini AI chat command",
  category: "ai",
  coolDowns: 5,
};

const conversationHistory = new Map();

function getConversationHistory(uid) {
  if (!conversationHistory.has(uid)) conversationHistory.set(uid, []);
  return conversationHistory.get(uid);
}

function updateConversationHistory(uid, role, content) {
  const history = getConversationHistory(uid);
  history.push({ role, content });
  if (history.length > 20) history.shift();
}

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author !== event.senderID) return;

  const uid = event.senderID;
  const userMsg = event.body;

  try {
    const history = getConversationHistory(uid);
    updateConversationHistory(uid, "user", userMsg);

    const res = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: history,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const aiReply = res.data.choices[0].message.content;
    updateConversationHistory(uid, "assistant", aiReply);

    await api.sendMessage(aiReply, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
        });
      }
    }, event.messageID);
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    api.sendMessage(`❌ GPT Error: ${errMsg}`, event.threadID, event.messageID);
  }
};

module.exports.onStart = async function ({ api, args, event }) {
  const uid = event.senderID;
  const userMsg = args.join(" ");

  if (!userMsg) {
    return api.sendMessage(
      "❗ Please ask something.\nExample:\n`gpt What is AI?`",
      event.threadID,
      event.messageID
    );
  }

  try {
    conversationHistory.set(uid, []);
    updateConversationHistory(uid, "user", userMsg);

    const res = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: getConversationHistory(uid),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const aiReply = res.data.choices[0].message.content;
    updateConversationHistory(uid, "assistant", aiReply);

    await api.sendMessage(aiReply, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
        });
      }
    }, event.messageID);
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    api.sendMessage(`❌ GPT Error: ${errMsg}`, event.threadID, event.messageID);
  }
};