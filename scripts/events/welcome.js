const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.2",
    author: "Ariyan",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening"
    }
  },

  onStart: async function ({ threadsData, message, event, api, getLang, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;
    const adderID = event.logMessageData.author;

    const { nickNameBot } = global.GoatBot.config;
    const botID = api.getCurrentUserID();

    // If bot is added
    if (dataAddedParticipants.some(user => user.userFbId == botID)) {
      if (nickNameBot)
        api.changeNickname(nickNameBot, threadID, botID);

      return message.send(
        `Thank you for inviting me to the group!\nBot prefix: ${prefix}\nTo view all commands: ${prefix}help`
      );
    }

    // If users were added
    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = {
        joinTimeout: null,
        dataAddedParticipants: [],
        adderID
      };
    }

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    global.temp.welcomeEvent[threadID].adderID = adderID;
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
      const threadData = await threadsData.get(threadID);
      if (threadData.settings.sendWelcomeMessage === false) return;

      const { dataAddedParticipants, adderID } = global.temp.welcomeEvent[threadID];
      const dataBanned = threadData.data.banned_ban || [];
      const threadName = threadData.threadName;
      const userName = [];
      const mentions = [];

      for (const user of dataAddedParticipants) {
        if (dataBanned.some(ban => ban.id === user.userFbId)) continue;

        userName.push(user.fullName);
        mentions.push({
          tag: user.fullName,
          id: user.userFbId
        });
      }

      if (userName.length === 0) return;

      // Get thread info and member count
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      // Get adder name and tag
      let adderName = "Someone";
      try {
        adderName = await usersData.getName(adderID) || "Someone";
        mentions.push({ tag: adderName, id: adderID });
      } catch (e) {
        console.error("Failed to get adder name:", e.message);
      }

      // Final message
      const welcomeMsg = `🥰 𝙰𝚂𝚂𝙰𝙻𝙰𝙼𝚄𝙰𝙻𝙰𝙸𝙺𝚄𝙼 ${userName.join(", ")} 𝚠𝚎𝚕𝚌𝚘𝚖𝚎 𝚢𝚘𝚞 𝚃𝚘 𝙾𝚞𝚛 『${threadName}』 😊

• 𝙸 𝙷𝚘𝚙𝚎 𝚈𝚘𝚞 𝚆𝚒𝚕𝚕 𝙵𝚘𝚕𝚕𝚘𝚠 𝙾𝚞𝚛 𝙶𝚛𝚘𝚞𝚙 𝚁𝚞𝚕𝚎𝚜
• !𝚛𝚞𝚕𝚎𝚜 𝚏𝚘𝚛 𝙶𝚛𝚘𝚞𝚙 𝚁𝚞𝚕𝚎𝚜
• !𝚑𝚎𝚕𝚙 𝙵𝚘𝚛 𝙰𝚕𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜

• 𝚈𝚘𝚞 𝙰𝚛𝚎 𝚃𝚑𝚎 ${memberCount}𝚝𝚑 𝙼𝚎𝚖𝚋𝚎𝚛 𝙸𝚗 𝙾𝚞𝚛 𝙶𝚛𝚘𝚞𝚙
• 𝙰𝚍𝚍𝚎𝚍 𝙱𝚢: ${adderName}`;

      const form = {
        body: welcomeMsg,
        mentions
      };

      // Add attachment if available
      if (threadData.data.welcomeAttachment) {
        const files = threadData.data.welcomeAttachment;
        const attachments = files.map(file => drive.getFile(file, "stream"));
        form.attachment = (await Promise.allSettled(attachments))
          .filter(r => r.status === "fulfilled")
          .map(r => r.value);
      }

      message.send(form);
      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
