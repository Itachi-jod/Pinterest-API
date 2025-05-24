const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/download", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`);
    const $ = cheerio.load(response.data);
    const matches = $("img").map((i, el) => $(el).attr("src")).get().filter(x => x?.includes("pinimg"));

    if (matches.length === 0) return res.status(404).json({ error: "No pins found." });

    return res.json({ type: "image", url: matches[0] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch media" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
