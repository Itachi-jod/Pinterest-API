const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

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
    await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, { waitUntil: "networkidle2" });

    const imageUrl = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      for (let img of imgs) {
        if (img.src.includes("pinimg")) return img.src;
      }
      return null;
    });

    await browser.close();

    if (!imageUrl) return res.status(404).json({ error: "No image found." });

    return res.json({ type: "image", url: imageUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch image." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Pinterest API is running...");
});
