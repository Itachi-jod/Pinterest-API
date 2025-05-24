import express from "express";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";

const app = express();
const client = new textToSpeech.TextToSpeechClient();

app.use(express.json());

app.post("/tts", async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="output.mp3"`,
    });

    res.send(audioContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "TTS failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
