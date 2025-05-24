import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

app.get("/api/download", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "No query provided." });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Wait for images to load
    await page.waitForSelector('img[src*="pinimg"]', { timeout: 15000 });

    // Get first valid Pinterest image
    const imageUrl = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
      const pinImgs = imgs.filter(url => url.includes("pinimg.com") && !url.includes("data:"));
      return pinImgs.length > 0 ? pinImgs[0] : null;
    });

    await browser.close();

    if (!imageUrl) return res.status(404).json({ error: "No image found." });

    res.json({ type: "image", url: imageUrl });

  } catch (err) {
    console.error("Error scraping Pinterest:", err.message);
    res.status(500).json({ error: "Failed to fetch image." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pinterest API running on port ${PORT}`);
});
