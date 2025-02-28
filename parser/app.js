import express from "express";

const PORT = 3000;

const app = express();

app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://lib.social/api/faq/questions"
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Ошибка запроса" });
  }
});

app.listen(PORT, () => console.log(`Паресер запущен на порту ${PORT}`));
