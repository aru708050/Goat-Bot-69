const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "gpt",
    version: "1.3",
    author: "Redwan",
    countDown: 0,
    longDescription: {
      en: "Chat with AI, generate images, or convert AI responses to speech."
    },
    category: "ai",
    role: 0,
    guide: {
      en: "{pn} <text>\n{pn} imagine <prompt>\n{pn} say <text>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    if (args.length === 0) {
      return message.reply("Provide a message, image prompt, or text for TTS.");
    }

    const text = args.join(" ").trim();
    const isImageGen = /^imagine/i.test(args[0]);
    const isTTS = /^say/i.test(args[0]);

    if (isImageGen) {
      const prompt = text.replace(/^imagine\s+/i, "");
      if (!prompt) return message.reply("Please provide a prompt for image generation.");

      message.reply("🖼️ Generating image...", async () => {
        try {
          const apiUrl = `https://global-redwans-apis.onrender.com/api/flux?p=${encodeURIComponent(prompt)}&mode=flux`;
          const response = await axios.get(apiUrl);
          const { html } = response.data.data;
          const imageUrl = html.match(/https:\/\/aicdn\.picsart\.com\/[a-zA-Z0-9-]+\.jpg/);

          if (!imageUrl) {
            return message.reply("❌ Failed to generate the image. Please try again.");
          }

          const imageStream = await getStreamFromURL(imageUrl[0], "generated_image.png");
          message.reply({
            body: `✅ Image generated successfully!`,
            attachment: imageStream
          });
        } catch (error) {
          console.error(error);
          message.reply("❌ An error occurred while generating the image. Please try again.");
        }
      });
    } else if (isTTS) {
      const query = text.replace(/^say\s+/i, "");
      if (!query) return message.reply("Please provide a query for AI speech generation.");

      try {
        const aiRes = await axios.get(`https://www.noobz-api.rf.gd/api/llama?query=${encodeURIComponent(query)}`);
        const aiText = aiRes.data?.data || "No response from AI.";

        const ttsUrl = `https://tts-siam-apiproject.vercel.app/speech?text=${encodeURIComponent(aiText)}`;

        message.reply({
          body: `🎤 AI says: "${aiText}"`,
          attachment: await getStreamFromURL(ttsUrl)
        });
      } catch (error) {
        console.error("AI TTS Error:", error);
        message.reply("❌ Failed to generate AI speech. Try again.");
      }
    } else {
      try {
        const aiResponse = await axios.get(`https://www.noobz-api.rf.gd/api/llama?query=${encodeURIComponent(text)}`);
        const reply = aiResponse.data?.data || "❌ No response from AI.";

        message.reply(reply);
      } catch (error) {
        console.error("AI Error:", error);
        message.reply("❌ An error occurred while fetching AI response.");
      }
    }
  }
};
