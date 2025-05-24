const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/download", async (req, res) => {
  const pinterestUrl = req.query.url;
  if (!pinterestUrl) return res.status(400).json({ error: "Missing URL" });

  try {
    const form = qs.stringify({ url: pinterestUrl });

    const response = await axios.post("https://indown.io/download/", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);
    const media = [];

    $("a.downloadbtn").each((i, el) => {
      const link = $(el).attr("href");
      const type = link.includes(".mp4") ? "video" : "image";
      media.push({ type, url: link });
    });

    if (media.length === 0) {
      return res.status(404).json({ error: "No media found" });
    }

    res.json({ success: true, media });
  } catch (err) {
    console.error("Pinterest scrape error:", err.message);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
