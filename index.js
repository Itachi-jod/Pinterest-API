const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/download', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing search query.' });

  try {
    const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = response.data;

    // Pinterest embeds initial state in <script> tag as JSON, extract it:
    const jsonDataMatch = html.match(/<script id="__PWS_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!jsonDataMatch) return res.status(404).json({ error: 'No data found in page.' });

    const jsonData = JSON.parse(jsonDataMatch[1]);
    const pins = jsonData?.props?.initialReduxState?.pins || {};

    // pins is an object with pin IDs as keys, values have images property
    const pinEntries = Object.values(pins);
    if (!pinEntries.length) return res.status(404).json({ error: 'No pins found.' });

    // Pick the first pin's images.orig.url as the image URL
    for (const pin of pinEntries) {
      if (pin?.images?.orig?.url) {
        return res.json({ type: 'image', url: pin.images.orig.url });
      }
    }

    return res.status(404).json({ error: 'No image URL found in pins.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch image.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
