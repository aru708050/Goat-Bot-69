const axios = require("axios");

module.exports = {
  config: {
    name: "suno",
    aliases: [],
    version: "1.3",
    author: "@Renz Mansueto | Rifat | Redwan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate a song with Suno AI"
    },
    longDescription: {
      en: "Generate and get a song with cover and lyrics using Suno V3. Api Credit Renz"
    },
    category: "ai",
    guide: {
      en: "{pn} [prompt]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt.\nExample: /suno a song about friendship", event.threadID, event.messageID);

    const key = "exclusive_key"; // Replace with your actual API key
    const apiUrl = `https://zaikyoov3-up.up.railway.app/api/sunov3?prompt=${encodeURIComponent(prompt)}&key=${key}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!Array.isArray(data) || !data[0]?.song_url) {
        return api.sendMessage("Failed to generate song. Please try again later.", event.threadID, event.messageID);
      }

      const song = data[0];

      const messageText = 
`Title: ${song.title || "Untitled"}
Tags: ${song.tags || "Unknown"}
Duration: ${song.duration || "Unknown"}
Lyrics:

${song.lyrics || "No lyrics found."}`;

      // First, send the text message with lyrics
      await api.sendMessage(messageText, event.threadID);

      // Then send the audio
      const audioFile = await axios.get(song.song_url, { responseType: "stream" });
      await api.sendMessage({
        body: "🎶 Here's your song 🎶",
        attachment: audioFile.data
      }, event.threadID);

      // Finally send the cover photo
      if (song.image_url) {
        const coverPhoto = await axios.get(song.image_url, { responseType: "stream" }).catch(() => null);
        if (coverPhoto) {
          await api.sendMessage({
            body: "🖼️ Cover Image",
            attachment: coverPhoto.data
          }, event.threadID);
        }
      }

    } catch (error) {
      console.error("Suno CMD Error:", error);
      return api.sendMessage("An error occurred while generating the song.", event.threadID, event.messageID);
    }
  }
};
