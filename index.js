const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/download', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing search query.' });
  }

  try {
    const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const html = response.data;
    const match = html.match(/"url":"(https:\/\/i\.pinimg\.com[^"]+)"/);
    
    if (match && match[1]) {
      const imageUrl = match[1].replace(/\\u002F/g, '/');
      return res.json({ type: 'image', url: imageUrl });
    } else {
      return res.status(404).json({ error: 'No image found.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch image.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pinterest image API is running on port ${PORT}`);
});
