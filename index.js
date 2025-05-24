const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");

// Create client with your service account key JSON file path
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, "service-account.json"),
});

async function convertTextToSpeech(text) {
  try {
    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);

    const outputFile = path.join(__dirname, "output.mp3");
    fs.writeFileSync(outputFile, response.audioContent, "binary");
    console.log(`Audio content written to file: ${outputFile}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example usage
const text = process.argv.slice(2).join(" ") || "Hello, this is a test from ChatGPT!";
convertTextToSpeech(text);
