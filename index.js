const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/download', async (req, res) => {
  let { url } = req.query;
  if (!url) return res.json({ error: 'Missing URL' });

  // Resolve shortened URLs
  try {
    const response = await axios.get(url, { maxRedirects: 5 });
    url = response.request.res.responseUrl;
  } catch (e) {
    return res.json({ error: 'Failed to resolve URL' });
  }

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);

    const metaVideo = $('meta[property="og:video"]').attr('content');
    const metaImage = $('meta[property="og:image"]').attr('content');

    if (metaVideo) {
      return res.json({ type: 'video', url: metaVideo });
    } else if (metaImage) {
      return res.json({ type: 'image', url: metaImage });
    } else {
      return res.json({ error: 'No media found on page' });
    }
  } catch (err) {
    return res.json({ error: 'Failed to fetch media' });
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest downloader running on port ${PORT}`);
});
