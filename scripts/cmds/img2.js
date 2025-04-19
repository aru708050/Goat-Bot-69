const axios = require('axios');

module.exports = {
  config: {
    name: 'img2',
    aliases: ['imgsearch'],
    version: '1.2',
    author: 'Redwan',
    role: 0,
    category: 'utility',
    shortDescription: {
      en: 'Searches images using Redwan\'s API.'
    },
    longDescription: {
      en: 'Fetches and returns image results from Redwan\'s Google Image Search API.'
    },
    guide: {
      en: '{pn} <query>'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(' ');
    if (!query) return message.reply('Please provide a search query.');

    try {
      const res = await axios.get(`https://global-redwans-rest-apis.onrender.com/api/google-image-search?search=${encodeURIComponent(query)}`);
      const images = res.data.images;

      if (!images || images.length === 0) {
        return message.reply(`No image results found for "${query}".`);
      }

      const selected = images.slice(0, 5).map(img => img.url);
      const streams = await Promise.all(selected.map(url => global.utils.getStreamFromURL(url)));

      api.sendMessage({
        body: `Image Results for: ${query}`,
        attachment: streams
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error('Image search error:', err.message || err);
      return message.reply('An error occurred while fetching images. Please try again later.');
    }
  }
};
