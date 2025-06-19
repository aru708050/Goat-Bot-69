const axios = require("axios");

const prefixes = ["bby", "janu", "babe", "bot", "Nezuko", "bbu", "nezuko"];

module.exports = {
  config: {
    name: "bot",
    version: "1.6.9",
    author: "Dipto",
    role: 0,
    description: {
      en: "No prefix command.",
    },
    category: "ai",
    guide: {
      en: "Just type a prefix like 'bby' followed by your message.",
    },
  },

  onStart: async function () {
    console.log("Bot command initialized.");
  },

  // Helper function to remove a prefix
  removePrefix: function (str, prefixes) {
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return str.slice(prefix.length).trim();
      }
    }
    return str;
  },

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      try {
        let reply = event.body.toLowerCase();
        reply = this.removePrefix(reply, prefixes) || "bby";

        // Updated URL instead of global.GoatBot.config.api
        const response = await axios.get(
          `https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(reply)}&senderID=${event.senderID}&font=1`
        );

        const message = response.data.reply;
        if (response.data.react) {
          setTimeout(() => {
            api.setMessageReaction(response.data.react, event.messageID, () => {}, true);
          }, 400);
        }

        api.sendMessage(message, event.threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: message,
          });
        }, event.messageID);
      } catch (err) {
        console.error(err.message);
        api.sendMessage(" An error occurred.", event.threadID, event.messageID);
      }
    }
  },

  onChat: async function ({ api, event }) {
    const randomReplies = ["I love you 💝", "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻" , "আমি এখন বস Ariyan এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻","আমাকে না ডেকে আমার বস Ariyan কে একটা tar bow ene দাও-😽🫶🌺","ঝাং থুমালে আইলাপিউ পেপি-💝😽","উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈","জান তোমার নানি রে আমার হাতে তুলে দিবা-🙊🙆‍♂","আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧","ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦","চুনা ও চুনা আমার বস  Ariyan এর  বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭","স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻","জান হাঙ্গা করবা-🙊😝🌻","জান মেয়ে হলে চিপায় আসো ইউটিউব থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽","ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼","আমার বস  ariyan এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস Ariyan এর  জন্য দোয়া করবেন-💝💚🌺🌻","Aha nari koto sundor ovinoy kore re😅","জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽","জান বাল ফালাইবা-🙂🥱🙆‍♂","-আন্টি-🙆-আপনার মেয়ে-👰‍♀️-রাতে আমারে ভিদু কল দিতে বলে🫣-🥵🤤💦","oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂","-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস Ariyan কে দান করেন-🥱🐰🍒","-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧","-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর বস Ariyan কে-🐸😾🔪","-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧","-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸","তাকাই আছো কেন চুমু দিবা-🙄🐸😘","আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇","-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗","কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻","দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧","-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻","-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻","-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস Ariyan ধরতে পারছে না-🐸🥲","-চুমু থাকতে তোরা বিড়ি খাস কেন বুঝা আমারে-😑😒🐸⚒️","—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-�
  " কি গো সোনা আমাকে ডাকছ কেনো","আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱","হুম জান তোমার অইখানে উম্মমাহ😷😘","jang hanga korba",
  "jang bal falaba🙂","iss ato dako keno lojja lage to 🫦🙈", "suna tomare amar valo lage,🙈😽"];
    const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

    const messageBody = event.body ? event.body.toLowerCase() : "";
    const words = messageBody.split(" ");
    const wordCount = words.length;

    if (event.type !== "message_reply") {
      let messageToSend = messageBody;
      messageToSend = this.removePrefix(messageToSend, prefixes);

      if (prefixes.some((prefix) => messageBody.startsWith(prefix))) {
        setTimeout(() => {
          api.setMessageReaction("🐥", event.messageID, () => {}, true);
        }, 400);

        api.sendTypingIndicator(event.threadID, true);

        if (event.senderID === api.getCurrentUserID()) return;

        const msg = { body: rand };

        if (wordCount === 1) {
          setTimeout(() => {
            api.sendMessage(msg, event.threadID, (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "bot",
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                link: msg,
              });
            }, event.messageID);
          }, 400);
        } else {
          words.shift(); // Removing the prefix
          const remainingText = words.join(" ");

          try {
            // Updated URL instead of global.GoatBot.config.api
            const response = await axios.get(
              `https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(remainingText)}&senderID=${event.senderID}&font=1`
            );
            const message = response.data.reply;

            if (response.data.react) {
              setTimeout(() => {
                api.setMessageReaction(
                  response.data.react,
                  event.messageID,
                  () => {},
                  true
                );
              }, 500);
            }

            api.sendMessage({ body: message }, event.threadID, (error, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                link: message,
              });
            }, event.messageID);
          } catch (err) {
            console.error(err.message);
            api.sendMessage(" An error occurred.", event.threadID, event.messageID);
          }
        }
      }
    }

    // Handling reaction triggers based on certain text patterns
    const reactions = ["haha", "😹", "lol", "pro", "gpt", "😹", "hehe"];
    if (reactions.some(reaction => messageBody.includes(reaction))) {
      setTimeout(() => {
        api.setMessageReaction("😹", event.messageID, () => {}, false);
      }, 500);
    }
  }
};
