const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "install",
    aliases: ["installfile", "i"],
    version: "1.0.0",
    author: "redwan",
    role: 0,
    countDown: 0,
    shortDescription: {
      en: "Installs a file from a URL to a specific directory"
    },
    category: "utility",
    guide: {
      en: "{prefix} install <command> <fileName> <url>"
    }
  },

  async execute(message, args) {
    const command = args[0];
    const fileName = args[1];
    const url = args[2];

    let directory;

    function isURL(str) {
      try {
        new URL(str);
        return true;
      } catch (e) {
        return false;
      }
    }

    if (!fileName.endsWith(".js")) {
      return sendMessages(message, "❌ File name must end with .js");
    }

    if (!isURL(url)) {
      return sendMessages(message, "❌ Invalid URL");
    }

    if (!args[0] || !args[1] || !args[2]) {
      return sendMessages(message, "❌ Usage: `-c|-e <fileName> <url>`");
    }

    switch (command) {
      case "-c":
        directory = "./scripts/cmds";
        break;
      case "-e":
        directory = "./scripts/events";
        break;
      default:
        return sendMessages(message, "❌ Invalid command. Use `-c` for cmds or `-e` for events.");
    }

    try {
      const savePath = path.join(directory, fileName);

      if (fs.existsSync(savePath)) {
        return sendMessages(message, `❌ File "${fileName}" already exists in "${directory}"`);
      }

      const response = await axios.get(url);
      const rawCode = response.data;

      fs.ensureDirSync(directory);

      fs.writeFileSync(savePath, rawCode);

      return sendMessages(message, `✅ Installed file "${fileName}" successfully! Saved at: ${savePath}`);
    } catch (error) {
      return sendMessages(message, `❌ Failed to install file: ${error.message}`);
    }
  }
};

function sendMessages(message, text) {
  return message.channel.send(text);
}
