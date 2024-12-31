const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "install",
    aliases: ["installfile", "fileinstall"],
    version: "1.0.0",
    author: "Redwan",
    role: 0,
    countDown: 0,
    shortDescription: {
      en: "Installs a file from a URL or raw code to a specific directory"
    },
    category: "utility",
    guide: {
      en: "{prefix} install <command> <fileName> <url/rawCode>"
    }
  },

  onStart(message) {
    return message.channel.send("The install command is ready to be executed!");
  },

  async onCall(message, args) {
    const command = args[0];
    const fileName = args[1];
    const input = args[2];

    const author = "Redwan";

    function isURL(str) {
      try {
        new URL(str);
        return true;
      } catch (e) {
        return false;
      }
    }

    function isValidJS(code) {
      try {
        new Function(code);
        return true;
      } catch (e) {
        return false;
      }
    }

    function checkAuthor() {
      if (message.author.username !== author) {
        sendMessages(message, `❌ You are not authorized to use this command. Only ${author} can execute this command.`);
        return false;
      }
      return true;
    }

    if (!checkAuthor()) return;

    if (!fileName.endsWith(".js")) {
      return sendMessages(message, "❌ File name must end with .js");
    }

    if (!args[0] || !args[1] || !args[2]) {
      return sendMessages(message, "❌ Usage: `{prefix} install <command> <fileName> <url/rawCode>`");
    }

    let directory;

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

    let fileContent;

    if (isURL(input)) {
      try {
        const response = await axios.get(input, { responseType: 'stream' });
        fileContent = response.data;
      } catch (error) {
        return sendMessages(message, `❌ Failed to fetch the file from the URL: ${error.message}`);
      }
    } else {
      if (!isValidJS(input)) {
        return sendMessages(message, "❌ Invalid JavaScript code.");
      }
      fileContent = input;
    }

    try {
      const savePath = path.join(directory, fileName);

      if (fs.existsSync(savePath)) {
        const promptMessage = await sendMessages(message, `❌ A file named "${fileName}" already exists in "${directory}". Do you want to overwrite it? (Yes/No)`);

        const filter = (response) => response.author.id === message.author.id && (response.content.toLowerCase() === "yes" || response.content.toLowerCase() === "no");
        const collector = message.channel.createMessageCollector({ filter, time: 30000 });

        collector.on("collect", async (response) => {
          if (response.content.toLowerCase() === "yes") {
            const writeStream = fs.createWriteStream(savePath);
            if (isURL(input)) {
              // Stream content from URL
              fileContent.pipe(writeStream);
            } else {
              // Write raw JS code
              writeStream.write(fileContent);
              writeStream.end();
            }
            sendMessages(message, `✅ Installed file "${fileName}" successfully! Saved at: ${savePath}`);
          } else {
            sendMessages(message, `❌ Installation canceled. The file was not overwritten.`);
          }
          collector.stop();
        });

        collector.on("end", () => {
          if (!collector.collected.size) {
            sendMessages(message, `❌ You took too long to respond. Installation canceled.`);
          }
        });

      } else {
        const writeStream = fs.createWriteStream(savePath);
        if (isURL(input)) {
          fileContent.pipe(writeStream);
        } else {
          writeStream.write(fileContent);
          writeStream.end();
        }
        sendMessages(message, `✅ Installed file "${fileName}" successfully! Saved at: ${savePath}`);
      }
    } catch (error) {
      return sendMessages(message, `❌ Failed to install file: ${error.message}`);
    }
  }
};

function sendMessages(message, text) {
  return message.channel.send(text);
}
