import express from "express";

import mainRouter from "./routes/main.js";

const PORT = 3000;
const app = express();

app.use(mainRouter);

app.listen(PORT, () => console.log(`Парсер запущен на порту ${PORT}`));
