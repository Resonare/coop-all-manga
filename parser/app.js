import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = 3000;
const HOW_MANY_PAGES_TO_PARSE = 3; // Уменьши для теста

const app = express();

const fetchListPage = async (pageNumber) => {
  try {
    console.log(`Парсим страницу: ${pageNumber}`);
    
    const response = await fetch(
      `https://api.lib.social/api/manga?site_id[]=1&page=${pageNumber}`
    );

    if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

    const mangaList = (await response.json())["data"];

    for (const manga of mangaList) {
      const mangaObject = {
        name: manga["name"],
        mangalib_url: manga["slug_url"],
        cover: manga["cover"]["default"],
        thumbnail: manga["cover"]["thumbnail"],
      };

      console.log(`Сохраняем в БД: ${mangaObject.name}`);

      await prisma.manga.upsert({
        where: { mangalib_url: mangaObject.mangalib_url },
        update: { ...mangaObject },
        create: { ...mangaObject },
      });
    }

    return mangaList;
  } catch (error) {
    console.error("Ошибка при парсинге:", error);
    return [];
  }
};

app.get("/", async (req, res) => {
  const startTime = new Date();

  let finalList = [];

  for (let i = 1; i <= HOW_MANY_PAGES_TO_PARSE; i++) {
    finalList = finalList.concat(await fetchListPage(i));
  }

  await prisma.$disconnect(); // Закрываем соединение с БД

  console.log(`Времени затрачено: ${new Date() - startTime} мс`);
  res.json(finalList);
});

app.listen(PORT, () => console.log(`Парсер запущен на порту ${PORT}`));
