const express = require("express"); const axios = require("axios"); const cheerio = require("cheerio"); const cors = require("cors"); const app = express();

app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));

const resolvePinterestRedirect = async (shortUrl) => { try { const response = await axios.get(shortUrl, { maxRedirects: 0, validateStatus: (status) => status >= 300 && status < 400, }); return response.headers.location; } catch (err) { console.error("Redirect resolve error:", err.message); return null; } };

app.get("/api/download", async (req, res) => { let pinterestUrl = req.query.url; if (!pinterestUrl) { return res.status(400).json({ error: "Missing Pinterest URL." }); }

if (pinterestUrl.includes("pin.it")) { const resolvedUrl = await resolvePinterestRedirect(pinterestUrl); if (!resolvedUrl) { return res.status(400).json({ error: "Could not resolve shortened URL." }); } pinterestUrl = resolvedUrl; }

try { const response = await axios.post( "https://indown.io/download/", new URLSearchParams({ url: pinterestUrl }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36", Referer: "https://indown.io/", }, } );

const $ = cheerio.load(response.data);
const media = [];

$("a.downloadbtn").each((_, el) => {
  const link = $(el).attr("href");
  if (link) {
    const type = link.includes(".mp4") ? "video" : "image";
    media.push({ type, url: link });
  }
});

if (!media.length) {
  return res.status(404).json({ error: "Failed to download media." });
}

res.json({ success: true, media });

} catch (err) { console.error("Download error:", err.message); res.status(500).json({ error: "Failed to download media." }); } });

app.get("/", (req, res) => { res.send("Pinterest Media Downloader API is running"); });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(Server running on port ${PORT}));

