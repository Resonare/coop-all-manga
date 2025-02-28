import express from "express";
import fs from 'fs';

const PORT = 3000;

const app = express();

// const data = JSON.parse(fs.readFileSync('./page.json', 'utf-8'));
// console.log(data["data"].length);

app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.lib.social/api/manga?fields[]=rate&fields[]=rate_avg&fields[]=userBookmark&site_id[]=1&page=8"
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Ошибка запроса" });
  }
});

app.listen(PORT, () => console.log(`Паресер запущен на порту ${PORT}`));