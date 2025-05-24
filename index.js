const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // For some hosting environments
    });
    const page = await browser.newPage();

    // Go to Pinterest search page for the query
    await page.goto(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
    });

    // Wait for images to load
    await page.waitForSelector('img[srcset]', { timeout: 15000 });

    // Extract image URLs
    const images = await page.evaluate(() => {
      // Select all images with srcset attribute
      const imgElements = Array.from(document.querySelectorAll('img[srcset]'));
      // Extract src attribute from each img
      const urls = imgElements.map(img => img.src);
      // Remove duplicates and get first 10
      return [...new Set(urls)].slice(0, 10);
    });

    if (!images.length) {
      return res.json({ error: "No pins found." });
    }

    res.json({ pins: images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape Pinterest." });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pinterest Scraper API running on port ${PORT}`);
});
