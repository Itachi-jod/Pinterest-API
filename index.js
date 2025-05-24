const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Go to Pinterest search page for the query
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Wait for image elements to load
    await page.waitForSelector('img[srcset]', { timeout: 10000 });

    // Scrape image URLs from page
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img[srcset]'));
      // Extract highest-res src from srcset attribute
      return imgElements
        .map(img => {
          const srcset = img.getAttribute('srcset');
          if (!srcset) return null;
          // srcset is like "url1 236w, url2 472w, url3 736w"
          const parts = srcset.split(',').map(part => part.trim());
          const last = parts[parts.length - 1].split(' ')[0]; // biggest image url
          return last;
        })
        .filter(url => url !== null);
    });

    if (images.length === 0) {
      return res.json({ error: 'No pins found.' });
    }

    // Return first 20 images max
    res.json({ query, images: images.slice(0, 20) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Pinterest images.' });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest scraper API running on port ${PORT}`);
});
