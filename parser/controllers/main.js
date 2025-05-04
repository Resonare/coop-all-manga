import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HOW_MANY_MANGALIB_PAGES_TO_PARSE = 20;
const HOW_MANY_REMANGA_PAGES_TO_PARSE = 20;

const fetchTitle = async (mangalibUrl) => {
    try {
        console.log(`Парсим конкретную мангу: ${mangalibUrl}`);

        const mangaSavedData = await prisma.manga.findUnique({
            where: {
                mangalib_url: mangalibUrl,
            },
        });

        // https://api2.mangalib.me/api/manga/147206--korekara-dandan-shiawase-ni-natte-iku-kowai-onna-joshi?fields[]=background&fields[]=eng_name&fields[]=otherNames&fields[]=summary&fields[]=releaseDate&fields[]=type_id&fields[]=caution&fields[]=views&fields[]=close_view&fields[]=rate_avg&fields[]=rate&fields[]=genres&fields[]=tags&fields[]=teams&fields[]=user&fields[]=franchise&fields[]=authors&fields[]=publisher&fields[]=userRating&fields[]=moderated&fields[]=metadata&fields[]=metadata.count&fields[]=metadata.close_comments&fields[]=manga_status_id&fields[]=chap_count&fields[]=status_id&fields[]=artists&fields[]=format
        const titleDataResponse = await fetch(
            `https://api2.mangalib.me/api/manga/${mangaSavedData.mangalib_url}?fields[]=summary&fields[]=authors&fields[]=genres&fields[]=tags`
        );

        if (!titleDataResponse.ok) throw new Error(`Ошибка запроса: ${response.status}`);

        const foundTitleData = (await titleDataResponse.json())["data"];

        const resData = {
            name: mangaSavedData.name,
            description: foundTitleData["summary"],
            author: foundTitleData["authors"].map((author) => author.name).join(", "),
            year: mangaSavedData.year,
            status: mangaSavedData.status,
            type: mangaSavedData.type,
            rating: mangaSavedData.rating,
            genres: foundTitleData["genres"].map((genre) => genre.name),
            tags: foundTitleData["tags"].map((tag) => tag.name),
            thumbnail: mangaSavedData.thumbnail,
            cover: mangaSavedData.cover,
            mangalib_url: mangaSavedData.mangalib_url,
            remanga_url: mangaSavedData.remanga_url,
            sources: {
                mangalib: []
            }
        };

        const chaptersMangalibResponse = await fetch(
            `https://api2.mangalib.me/api/manga/${mangaSavedData.mangalib_url}/chapters`
        );

        if (!chaptersMangalibResponse.ok) throw new Error(`Ошибка запроса к главам Mangalib: ${chaptersMangalibResponse.status}`);

        const foundChaptersData = (await chaptersMangalibResponse.json())["data"];
        const mangalibChapters = [];

        foundChaptersData.forEach(chapterData => {
            const chapterName = `Том ${chapterData["volume"]} Глава ${chapterData["number"]}${chapterData["name"] ? ` - ${chapterData["name"]}` : ``}`;

            chapterData["branches"].forEach(translate => {
                mangalibChapters.push({
                    name: chapterName,
                    release: translate["created_at"].split("T")[0],
                    translator: translate["teams"].map(team => team["name"]).join(", "),
                    link: `${mangaSavedData.mangalib_url}/read/v${chapterData["volume"]}/c${chapterData["number"]}${chapterData["branches"].length > 1 ? `?bid=` + translate["branch_id"] : ``}`
                });
            });
        });

        resData.sources.mangalib = mangalibChapters;

        if (mangaSavedData.remanga_url != "") {
            const titleRemangaResponse = await fetch(
                `https://api.remanga.org/api/titles/${mangaSavedData.remanga_url}`
            );

            if (!titleRemangaResponse.ok) throw new Error(`Ошибка запроса к тайтлу Remanga: ${titleRemangaResponse.status}`);

            const responseJSON = await titleRemangaResponse.json();

            const branches = responseJSON["content"]["branches"];
            const remangaChapters = [];

            for (const branchKey in branches) {
                const translate = branches[branchKey];

                let pageCounter = 0;

                while (true) {
                    const chaptersRemangaResponse = await fetch(
                        `https://api.remanga.org/api/titles/chapters/?branch_id=${translate["id"]}&ordering=-index&count=10000&page=${pageCounter + 1}`
                    );
                    
                    if (!chaptersRemangaResponse.ok) throw new Error(`Ошибка запроса к главам Remanga: ${chaptersRemangaResponse.status}`);
                    
                    const chaptersData = (await chaptersRemangaResponse.json())["content"];

                    if (chaptersData.length < 1)
                        break;

                    chaptersData.forEach(chapter => {
                        const chapterName = `Том ${chapter["tome"]} Глава ${chapter["chapter"]}${chapter["name"] ? ` - ${chapter["name"]}` : ``}`;

                        remangaChapters.push({
                            name: chapterName,
                            release: chapter["upload_date"].split("T")[0],
                            translator: translate["publishers"].map(publisher => publisher["name"]).join(", "),
                            link: `${mangaSavedData.remanga_url}/${chapter["id"]}`
                        });
                    });

                    pageCounter++;
                }
            }

            resData.sources.remanga = remangaChapters;
        }

        return resData;
    } catch (error) {
        console.error("Ошибка при парсинге:", error);
        return null;
    }
};

const fetchMangalibPage = async (pageNumber) => {
    try {
        console.log(`Парсим страницу Mangalib: ${pageNumber}`);

        const response = await fetch(
            `https://api.lib.social/api/manga?site_id[]=1&page=${pageNumber}`
        );

        if (!response.ok) throw new Error(`Ошибка запроса в Мангалиб: ${response.status}`);

        const list = (await response.json())["data"];

        const resList = {};

        for (const manga of list) {
            const mangaObject = {
                name: manga["rus_name"],
                eng_name: manga["eng_name"],
                year: manga["releaseDateString"].substring(0, manga["releaseDateString"].length - 3),
                status: manga["status"]["label"],
                type: manga["type"]["label"],
                rating: manga["rating"]["average"],
                mangalib_url: manga["slug_url"],
                cover: manga["cover"]["default"],
                thumbnail: manga["cover"]["thumbnail"],
            };

            resList[manga["eng_name"].toLowerCase().replaceAll(/[.,\/#!$%\^&\*;:{}=\-_`~()'«»"?]/g, "").replaceAll(/ /g, "_").replaceAll(/_+/g, "_")] = mangaObject;
        }

        return resList;
    } catch (error) {
        console.error("Ошибка при парсинге:", error);
        return [];
    }
};

const fetchRemangaPage = async (pageNumber) => {
    try {
        console.log(`Парсим страницу Remanga: ${pageNumber}`);

        const response = await fetch(
            `https://api.remanga.org/api/search/catalog/?page=${pageNumber}&count=60&ordering=-rating`
        );

        if (!response.ok) throw new Error(`Ошибка запроса в Реманга: ${response.status}`);

        const list = (await response.json())["content"];

        const resList = {};

        for (const manga of list) {
            const mangaObject = {
                name: manga["rus_name"],
                eng_name: manga["en_name"],
                year: manga["issue_year"],
                // status: manga["status"]["name"],
                type: manga["type"],
                rating: manga["avg_rating"],
                remanga_url: manga["dir"],
                cover: manga["cover"]["high"],
                thumbnail: manga["cover"]["low"],
            };

            resList[manga["en_name"].toLowerCase().replaceAll(/[.,\/#!$%\^&\*;:{}=\-_`~()'«»"?]/g, "").replaceAll(/ /g, "_").replaceAll(/_+/g, "_")] = mangaObject;
        }

        return resList;
    } catch (error) {
        console.error("Ошибка при парсинге:", error);
        return [];
    }
};

const mainController = {
    getAll: async (req, res) => {
        const startTime = new Date();

        console.log(`Пытаемся получить список манги`);

        const manga = await prisma.manga.findMany();

        await prisma.$disconnect(); // Закрываем соединение с БД

        console.log(`Времени затрачено: ${new Date() - startTime} мс`);
        res.json(manga);
    },
    getTitle: async (req, res) => {
        const startTime = new Date();

        const mangalibUrl = req.params.mangalibUrl;
        const manga = await fetchTitle(mangalibUrl);

        await prisma.$disconnect(); // Закрываем соединение с БД

        console.log(`Времени затрачено: ${new Date() - startTime} мс`);
        res.json(manga);
    },
    parse: async (req, res) => {
        const startTime = new Date();

        let finalList = {};

        let found = 0, notFound = 0, mangalibCounter = 0;

        for (let i = 1; i <= HOW_MANY_MANGALIB_PAGES_TO_PARSE; i++) {
            const currentList = await fetchMangalibPage(i);

            for (const mangaEngTitle in currentList) {
                finalList[mangaEngTitle] = currentList[mangaEngTitle];
                mangalibCounter++;
            }
        }

        for (let i = 1; i <= HOW_MANY_REMANGA_PAGES_TO_PARSE; i++) {
            const currentList = await fetchRemangaPage(i);

            for (const mangaEngTitle in currentList) {
                if (finalList[mangaEngTitle] != undefined) {
                    finalList[mangaEngTitle].remanga_url = currentList[mangaEngTitle].remanga_url;
                    found++;
                } else {
                    // finalList[mangaEngTitle] = currentList[mangaEngTitle];
                    notFound++;
                }
            }
        }

        console.log(`Найдено на Remanga и Mangalib одновременно: ${found}`);
        console.log(`Найдено только на Remanga: ${notFound}`);
        console.log(`Найдено только на Mangalib: ${mangalibCounter - found}`);

        console.log(`Сохраняем в БД...`);

        for (const key in finalList) {
            const mangaObject = finalList[key];

            // console.log(`Сохраняем в БД: ${mangaObject.name}`);

            await prisma.manga.upsert({
                where: { mangalib_url: mangaObject.mangalib_url },
                update: { ...mangaObject },
                create: { ...mangaObject },
            });
        }
        console.log(`Данные сохранены!`);

        await prisma.$disconnect();

        console.log(`Времени затрачено: ${new Date() - startTime} мс`);
        res.json(finalList);
    }
};

export default mainController;