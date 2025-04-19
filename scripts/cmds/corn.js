const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "corn",
    category: "incognito",
    author: "Redwan",
    shortDescription: "Search and download videos with thumbnails.",
    longDescription: "This command allows users to search for videos based on a query. The bot returns a list of videos with thumbnails, allowing users to choose a video (1-4) to download. Upon choosing, the selected video is sent to the user as a downloadable file.",
  },

  onStart: async ({ message, event, args }) => {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please provide a search query.");

    await search(query, event, message);
  },

  onReply: async ({ event, message, Reply }) => {
    const { result } = Reply;
    const userChoice = parseInt(event.body.trim());

    if (isNaN(userChoice) || userChoice < 1 || userChoice > result.length) {
      return message.reply("❌ Invalid choice! Please reply with a number between 1 and 4.");
    }

    await downloadVideo(result[userChoice - 1], event, message);
  },
};

async function search(query, event, message) {
  try {
    const response = await axios.get(`https://global-redwans-apis.onrender.com/api/xnx?query=${encodeURIComponent(query)}`);
    const videos = response.data.videos.slice(0, 4);

    if (!videos.length) {
      return message.reply("❌ No videos found. Try a different search query.");
    }

    let msg = "";
    const imgData = [];
    const cacheDir = path.join(__dirname, "cache");

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      msg += `${i + 1}. ${video.title}\n🔹 Views: ${video.views} | 🕒 Duration: ${video.duration} | 🎥 Quality: ${video.quality}\n\n`;

      try {
        const imgResponse = await axios.get(video.thumbnail, { responseType: "arraybuffer" });
        const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      } catch (error) {
        console.error(`Error fetching thumbnail ${i + 1}:`, error);
      }
    }

    if (imgData.length > 0) {
      message.reply(
        {
          body: `${msg}📌 Please reply with a number (1-4) to choose a video:`,
          attachment: imgData,
        },
        (err, info) => {
          if (err) return console.error(err);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "corn",
            messageID: info.messageID,
            author: event.senderID,
            result: videos,
          });
        }
      );
    } else {
      message.reply(`${msg}\n(Thumbnails couldn't be loaded, but you can still reply with a number to select a video.)`);
    }
  } catch (e) {
    console.error(e);
    message.reply("❌ An error occurred while searching for videos. Please try again.");
  }
}

async function downloadVideo(video, event, message) {
  try {
    console.log("Starting video download...");

    const response = await axios.get(video.downloadUrl, { responseType: "arraybuffer" });
    console.log("Video download successful, processing data...");

    const buffer = Buffer.from(response.data);
    const videoPath = path.join(__dirname, "cache", "video.mp4");

    await fs.outputFile(videoPath, buffer);
    console.log(`Video saved to ${videoPath}`);

    await message.reply({
      body: `✅ Here's your video: ${video.title}\n🔗 [Watch Online](${video.originalUrl})`,
      attachment: fs.createReadStream(videoPath),
    });
    console.log("Video sent successfully.");

    setTimeout(() => {
      fs.unlinkSync(videoPath);
      console.log(`Deleted the video file from ${videoPath}`);
    }, 60000);
  } catch (e) {
    console.error("Error in downloading the video:", e.message);
    message.reply("❌ An error occurred while downloading the video. Please try again.");

    if (e.response) {
      console.error("Response status:", e.response.status);
      console.error("Response headers:", e.response.headers);
      console.error("Response data:", e.response.data);
    } else if (e.request) {
      console.error("Request data:", e.request);
    } else {
      console.error("Error message:", e.message);
    }
  }
}
