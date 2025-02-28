import express from "express";

const PORT = 3000;
const HOW_MANY_PAGES_TO_PARSE = 30;

const app = express();

const fetchListPage = async (pageNumber) => {
  try {
    const response = await fetch(
      `https://api.lib.social/api/manga?site_id[]=1&page=${pageNumber}`
    );

    const mangaList = (await response.json())["data"];

    const finalList = [];

    for (let i = 0; i < mangaList.length; i++) {
      const mangaObject = {
        name: mangaList[i]["name"],
        slug_url: mangaList[i]["slug_url"],
        cover: mangaList[i]["cover"]["default"],
        thumbnail: mangaList[i]["cover"]["thumbnail"],
      };

      finalList.push(mangaObject);
    }

    return finalList;
  } catch (error) {
    console.error(error);
  }
};

app.get("/", async (req, res) => {
  const startTime = new Date();

  let finalList = [];

  for (let i = 0; i < HOW_MANY_PAGES_TO_PARSE; i++) {
    finalList = (await fetchListPage(i)).concat(finalList);
  }

  console.log(
    `Времени затрачено на общий парсинг ${new Date() - startTime}мс.`
  );

  res.json(finalList);
});

app.listen(PORT, () => console.log(`Паресер запущен на порту ${PORT}`));
