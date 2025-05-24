const axios = require("axios");
const googleTTS = require("google-tts-api");

module.exports = {
  config: {
    name: "tts",
    aliases: ["text2voice", "say"],
    version: "1.0.0",
    author: "Lord Itachi",
    role: 0,
    countDown: 5,
    shortDescription: { en: "Convert text to voice" },
    category: "audio",
    guide: { en: "{prefix}tts <text>" }
  },

  onStart: async function({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("Please provide the text to convert to voice.", event.threadID, event.messageID);
    }

    const text = args.join(" ");

    try {
      const url = googleTTS.getAudioUrl(text, {
        lang: "en",
        slow: false,
        host: "https://translate.google.com"
      });

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const audioBuffer = Buffer.from(response.data, "binary");

      await api.sendMessage(
        {
          body: `Here is the voice for: "${text}"`,
          attachment: audioBuffer
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Failed to convert text to voice.", event.threadID, event.messageID);
    }
  }
};
