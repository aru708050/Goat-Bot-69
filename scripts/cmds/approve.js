const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "approve",
    version: "1.0",
    role: "2",
    author: "redwan",
    cooldown: "5",
    longDescription: {
      en: "Group Approve and Disapproved Command",
    },
    category: "Developer",
    guide: {
      en: "{pn} (add/remove) [thread ID]"
    }
  },
  onStart: async function ({ api, event, threadsData, message, args }) {
    const threadsFile = 'threads.json';
    const githubFilePath = 'threads.json';

    const githubRepo = 'Forkkorlechudbo/_____Creation-Redwan';
    const githubToken = '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';

    if (args.length < 1) {
      message.reply("You must provide an action: !approve (add/remove) [thread ID]");
      return;
    }
    if (!args || args.length < 2) {
      return message.reply("You must provide the following action: !approve (add/remove) [thread ID]");
    }

    const action = args[0];
    const groupId = args[1];
    const threadData = await threadsData.get(groupId);
    const name = threadData.threadName;

    let threads = [];
    try {
      threads = JSON.parse(fs.readFileSync(threadsFile));
    } catch (err) {
      console.error(err);
    }

    if (action === "add") {
      if (!threads.includes(groupId)) {
        threads.push(groupId);
        fs.writeFileSync(threadsFile, JSON.stringify(threads));
        await uploadToGitHub(threadsFile, githubToken, githubRepo, githubFilePath);
        message.reply(`🍁 | Group: ${name}\n🆔 | TID: ${groupId}\n✅ | Status: Approved!`);
      } else {
        message.reply(`🍁 | Group: ${name}\n🆔 | TID: ${groupId}\n✅ | Status: Already Approved!`);
      }
    } else if (action === "remove") {
      const index = threads.indexOf(groupId);
      if (index >= 0) {
        threads.splice(index, 1);
        fs.writeFileSync(threadsFile, JSON.stringify(threads));
        await uploadToGitHub(threadsFile, githubToken, githubRepo, githubFilePath);
        message.reply(`🍁 | Group: ${name}\n🆔 | TID: ${groupId}\n❎ | Status: Disapproved!`);
      } else {
        message.reply(`🍁 | Group: ${name}\n🆔 | TID: ${groupId}\n❎ | Status: Not Approved Before!`);
      }
    }
  }
};

async function uploadToGitHub(filePath, token, repo, repoPath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const base64Content = Buffer.from(fileContent).toString('base64');

    const getResponse = await axios.get(`https://api.github.com/repos/${repo}/contents/${repoPath}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const sha = getResponse.data.sha;
    await axios.put(`https://api.github.com/repos/${repo}/contents/${repoPath}`, {
      message: `Update ${path.basename(filePath)}`,
      content: base64Content,
      sha: sha
    }, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await axios.put(`https://api.github.com/repos/${repo}/contents/${repoPath}`, {
        message: `Create ${path.basename(filePath)}`,
        content: base64Content
      }, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
    } else {
      console.error(error.message);
    }
  }
        }
