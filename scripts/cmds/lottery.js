const fs = require("fs-extra");
const path = require("path");

const DATA_PATH = path.join(__dirname, "lottery_data.json");
const STATUS_PATH = path.join(__dirname, "lottery_status.json");

const MAX_TICKETS = 20;
const MAX_PER_USER = 3;
const TICKET_PRICE = 1_000_000;

module.exports = {
  config: {
    name: "lottery",
    version: "2.3.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Lottery game system",
    longDescription: "Buy tickets, check info, and draw winner.",
    category: "game",
    guide: {
      en: "{pn} buy 1-3 | draw | info | status"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    await fs.ensureFile(DATA_PATH);
    await fs.ensureFile(STATUS_PATH);

    let data = await fs.readJson(DATA_PATH).catch(() => ({ tickets: [] }));
    let status = await fs.readJson(STATUS_PATH).catch(() => ({}));

    const userId = event.senderID;
    const userData = await usersData.get(userId);
    const userName = userData?.name || "Unknown";
    const subcmd = args[0];

    // BUY command
    if (subcmd === "buy") {
      const count = parseInt(args[1]);
      if (isNaN(count) || count < 1 || count > MAX_PER_USER) {
        return message.reply(`❌ | You can only buy between 1 and ${MAX_PER_USER} tickets.`);
      }

      const userTickets = data.tickets.filter(t => t.userId === userId);
      if (userTickets.length + count > MAX_PER_USER) {
        return message.reply(`⚠️ | You already have ${userTickets.length} ticket(s). Max allowed is ${MAX_PER_USER}.`);
      }

      if (data.tickets.length + count > MAX_TICKETS) {
        return message.reply(`🎫 | Only ${MAX_TICKETS - data.tickets.length} ticket(s) left.`);
      }

      const userBalance = userData?.money || 0;
      const cost = count * TICKET_PRICE;
      if (userBalance < cost) {
        return message.reply(`💸 | You need ₦${cost.toLocaleString()}, but have ₦${userBalance.toLocaleString()}.`);
      }

      // Deduct balance
      await usersData.set(userId, {
        ...userData,
        money: userBalance - cost
      });

      for (let i = 0; i < count; i++) {
        data.tickets.push({
          userId,
          ticketNumber: data.tickets.length + 1
        });
      }

      await fs.writeJson(DATA_PATH, data);
      return message.reply(`✅ | ${userName}, you bought ${count} ticket(s) for ₦${cost.toLocaleString()}.`);
    }

    // DRAW command
    else if (subcmd === "draw") {
      if (data.tickets.length < MAX_TICKETS) {
        return message.reply(`⏳ | Only ${data.tickets.length}/${MAX_TICKETS} tickets sold. Cannot draw yet.`);
      }

      const winnerTicket = data.tickets[Math.floor(Math.random() * data.tickets.length)];
      const winnerData = await usersData.get(winnerTicket.userId);
      const prize = TICKET_PRICE * MAX_TICKETS;
      const winnerBalance = winnerData?.money || 0;

      await usersData.set(winnerTicket.userId, {
        ...winnerData,
        money: winnerBalance + prize
      });

      const resultMsg = `🎉 | Lottery Draw Complete!\n\n🏆 Winner: ${winnerData.name}\n🎫 Ticket: #${winnerTicket.ticketNumber}\n💰 Prize: ₦${prize.toLocaleString()}`;

      await fs.writeJson(STATUS_PATH, {
        name: winnerData.name,
        ticketNumber: winnerTicket.ticketNumber,
        userId: winnerTicket.userId,
        prize
      });

      await fs.writeJson(DATA_PATH, { tickets: [] });

      return message.reply(resultMsg);
    }

    // INFO command
    else if (subcmd === "info") {
      if (data.tickets.length === 0) {
        return message.reply("📭 | No tickets have been bought yet.");
      }

      const usersMap = {};
      for (const ticket of data.tickets) {
        if (!usersMap[ticket.userId]) usersMap[ticket.userId] = [];
        usersMap[ticket.userId].push(ticket.ticketNumber);
      }

      let infoText = `🎫 Lottery Info (${data.tickets.length}/${MAX_TICKETS} tickets sold):\n\n`;
      for (const [uid, ticketNums] of Object.entries(usersMap)) {
        const uData = await usersData.get(uid);
        const name = uData?.name || uid;
        const ticketsList = ticketNums.map(n => `#${n}`).join(", ");
        infoText += `👤 ${name}: ${ticketNums.length} ticket(s) → ${ticketsList}\n`;
      }

      return message.reply(infoText.trim());
    }

    // STATUS command
    else if (subcmd === "status") {
      if (!status.name) {
        return message.reply("ℹ️ | No previous winner yet.");
      }

      return message.reply(
        `🏆 Last Winner:\n👤 ${status.name}\n🎫 Ticket: #${status.ticketNumber}\n💰 Prize: ₦${status.prize.toLocaleString()}`
      );
    }

    // HELP fallback
    else {
      return message.reply(`🎲 | Lottery Command Usage:
• Buy: lottery buy [1-3]
• Info: lottery info
• Draw: lottery draw
• Status: lottery status`);
    }
  }
};