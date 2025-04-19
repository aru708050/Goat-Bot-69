const fs = require("fs");
const dataFile = "./scheduleData.json";

let data = {};
if (fs.existsSync(dataFile)) {
  try {
    data = JSON.parse(fs.readFileSync(dataFile));
  } catch (error) {
    console.error("Error loading schedule data:", error);
  }
}

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "schedule",
    version: 2.1,
    author: "Upol X Redwan",
    longDescription: "Manage personalized reminders with timezone, snooze, repeat options, and persistent storage.",
    category: "utility",
    guide: {
      en: `📌 **Commands:**
- **{p}{n} add <time> <date (optional)> <message> [repeat: daily/weekly/monthly] [timezone: UTC±X]**
- **{p}{n} list**
- **{p}{n} edit <id> <new time> <new date (optional)> <new message>**
- **{p}{n} delete <id>**
- **{p}{n} pause <id>**
- **{p}{n} resume <id>**
- **{p}{n} snooze <id> <minutes>**
- **{p}{n} on/off**`,
    },
  },

  onStart: async function ({ args, message, event }) {
    const option = args[0]?.toLowerCase();
    const senderID = event.senderID;

    if (!option || !["add", "edit", "delete", "list", "pause", "resume", "snooze", "on", "off"].includes(option)) {
      return message.reply(this.config.guide.en.replace(/{p}{n}/g, `${global.config.prefix}${this.config.name}`));
    }

    if (option === "list") {
      const userSchedules = Object.values(data).filter(schedule => schedule.userID === senderID);
      if (userSchedules.length === 0) return message.reply("📌 You have no scheduled reminders.");

      let scheduleList = "📜 **Your Scheduled Reminders:**\n";
      userSchedules.forEach(schedule => {
        scheduleList += `\n🆔 **ID:** ${schedule.id}\n🕒 **Time:** ${schedule.time}\n📅 **Date:** ${schedule.date}\n🌍 **Timezone:** ${schedule.timezone}\n📌 **Message:** ${schedule.message}\n🔄 **Repeat:** ${schedule.repeat || "No"}\n`;
      });

      return message.reply(scheduleList);
    }

    if (option === "add") {
      if (args.length < 3) return message.reply("Usage: schedule add <time> <date (optional)> <message> [repeat: daily/weekly/monthly] [timezone: UTC±X]");

      const time = args[1];
      let date = new Date().toISOString().split("T")[0]; 
      let timezone = "UTC+0";
      let repeat = null;
      let reminderMessage = args.slice(2).join(" ");

      if (!isNaN(Date.parse(args[2]))) {
        date = args[2];
        reminderMessage = args.slice(3).join(" ");
      }

      args.forEach(arg => {
        if (arg.startsWith("UTC")) timezone = arg;
        if (["daily", "weekly", "monthly"].includes(arg)) repeat = arg;
      });

      const id = `${senderID}-${Date.now()}`;
      data[id] = { id, time, date, timezone, message: reminderMessage, userID: senderID, active: true, repeat };
      saveData();

      return message.reply(`✅ Schedule added!\n🕒 Time: ${time}\n📅 Date: ${date}\n🌍 Timezone: ${timezone}\n📌 Message: ${reminderMessage}\n🔄 Repeat: ${repeat || "No"}`);
    }

    if (option === "delete") {
      const id = args[1];
      if (!data[id] || data[id].userID !== senderID) return message.reply("❌ Schedule not found.");
      delete data[id];
      saveData();
      return message.reply("🗑️ Schedule deleted!");
    }
  },
};

setInterval(() => {
  const now = new Date();
  Object.values(data).forEach(schedule => {
    if (schedule.active && isTimeToRemind(schedule.time, schedule.date, now, schedule.timezone)) {
      sendReminders(schedule);
      handleRepetition(schedule);
    }
  });
}, 60000);

function isTimeToRemind(scheduleTime, scheduleDate, now, timezone) {
  const offset = parseInt(timezone.replace("UTC", "")) || 0;
  const [hour, minute] = scheduleTime.split(":").map(Number);
  const scheduledDate = new Date(scheduleDate);
  scheduledDate.setUTCHours(hour - offset, minute, 0, 0);

  return now.getTime() >= scheduledDate.getTime() && now.getTime() < scheduledDate.getTime() + 60000;
}

async function sendReminders(schedule) {
  const userID = schedule.userID;
  const reminderMessage = `⏰ Reminder: ${schedule.message}\n🕒 Time: ${schedule.time}\n📅 Date: ${schedule.date}\n🌍 Timezone: ${schedule.timezone}`;

  try {
    const threadList = await global.GoatBot.api.getThreadList(10, null, ["INBOX", "GROUP"]);
    threadList.forEach(thread => {
      if (thread.participantIDs.includes(userID)) {
        global.GoatBot.api.sendMessage(
          { body: reminderMessage, mentions: [{ tag: "@User", id: userID }] },
          thread.threadID
        );
      }
    });

    global.GoatBot.api.sendMessage(
      { body: `${reminderMessage}\n\nReply 'snooze <minutes>' to delay or 'stop' to cancel.` },
      schedule.threadID
    );
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
}

function handleRepetition(schedule) {
  if (!schedule.repeat) return;

  let newDate = new Date(schedule.date);
  if (schedule.repeat === "daily") newDate.setDate(newDate.getDate() + 1);
  if (schedule.repeat === "weekly") newDate.setDate(newDate.getDate() + 7);
  if (schedule.repeat === "monthly") newDate.setMonth(newDate.getMonth() + 1);

  schedule.date = newDate.toISOString().split("T")[0];
  saveData();
  }
