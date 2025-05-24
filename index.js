const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const RAPIDAPI_HOST = "pinterest-scraper5.p.rapidapi.com";
const RAPIDAPI_KEY = "3641222daamsh414c9dca6784a8ep1f9b60jsn92b32450ebbf";

app.get("/api/followings", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/api/users/followings?username=${username}`,
      {
        headers: {
          "x-rapidapi-host": RAPIDAPI_HOST,
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Pinterest API error:", error.message);
    res.status(500).json({ error: "Failed to fetch data from Pinterest" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
