const express = require("express");
const googleTTS = require("google-tts-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Text to Voice API is running!");
});

app.get("/api/tts", async (req, res) => {
  const text = req.query.text;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' query parameter." });
  }

  try {
    const url = googleTTS.getAudioUrl(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com"
    });

    const response = await axios.get(url, { responseType: "arraybuffer" });

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename="voice.mp3"`
    });
    res.send(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to convert text to voice." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
