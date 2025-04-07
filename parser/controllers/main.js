import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HOW_MANY_PAGES_TO_PARSE = 10; // Уменьши для теста

const fetchTitle = async (id) => {
    try {
        console.log(`Парсим конкретную мангу: ${id}`);

        const mangaSavedData = await prisma.manga.findUnique({
            where: {
                id: id,
            },
        });

        // https://api2.mangalib.me/api/manga/147206--korekara-dandan-shiawase-ni-natte-iku-kowai-onna-joshi?fields[]=background&fields[]=eng_name&fields[]=otherNames&fields[]=summary&fields[]=releaseDate&fields[]=type_id&fields[]=caution&fields[]=views&fields[]=close_view&fields[]=rate_avg&fields[]=rate&fields[]=genres&fields[]=tags&fields[]=teams&fields[]=user&fields[]=franchise&fields[]=authors&fields[]=publisher&fields[]=userRating&fields[]=moderated&fields[]=metadata&fields[]=metadata.count&fields[]=metadata.close_comments&fields[]=manga_status_id&fields[]=chap_count&fields[]=status_id&fields[]=artists&fields[]=format
        const titleDataResponse = await fetch(
            `https://api2.mangalib.me/api/manga/${mangaSavedData.mangalib_url}?fields[]=summary&fields[]=authors&fields[]=genres&fields[]=tags`
        );

        if (!titleDataResponse.ok) throw new Error(`Ошибка запроса: ${response.status}`);

        const foundTitleData = (await titleDataResponse.json())["data"];

        const resData = {
            id: id,
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
            sources: {
                mangalib: []
            }
        };

        const chaptersDataResponse = await fetch(
            `https://api2.mangalib.me/api/manga/${mangaSavedData.mangalib_url}/chapters`
        );

        if (!chaptersDataResponse.ok) throw new Error(`Ошибка запроса: ${chaptersDataResponse.status}`);

        const foundChaptersData = (await chaptersDataResponse.json())["data"];
        const resChapterData = [];

        foundChaptersData.forEach(chapterData => {
            const chapterName = `Том ${chapterData["volume"]} Глава ${chapterData["number"]}${chapterData["name"] ? ` - ${chapterData["name"]}` : ``}`;

            chapterData["branches"].forEach(translate => {
                resChapterData.push({
                    name: chapterName,
                    release: translate["created_at"].split("T")[0],
                    translator: translate["teams"][0]["name"],
                    link: `${mangaSavedData.mangalib_url}/read/v${chapterData["volume"]}/c${chapterData["number"]}${chapterData["branches"].length > 1 ? `?bid=` + translate["branch_id"] : ``}`
                });
            });
        });

        resData.sources.mangalib = resChapterData;

        return resData;
    } catch (error) {
        console.error("Ошибка при парсинге:", error);
        return null;
    }
};

const fetchListPage = async (pageNumber) => {
    try {
        console.log(`Парсим страницу: ${pageNumber}`);

        const response = await fetch(
            `https://api.lib.social/api/manga?site_id[]=1&page=${pageNumber}`
        );

        if (!response.ok) throw new Error(`Ошибка запроса: ${response.status}`);

        const mangaList = (await response.json())["data"];
        const resList = [];

        for (const manga of mangaList) {
            const mangaObject = {
                name: manga["rus_name"],
                year: manga["releaseDateString"].substring(0, manga["releaseDateString"].length - 3),
                status: manga["status"]["label"],
                type: manga["type"]["label"],
                rating: manga["rating"]["average"],
                mangalib_url: manga["slug_url"],
                cover: manga["cover"]["default"],
                thumbnail: manga["cover"]["thumbnail"],
            };

            resList.push(mangaObject);

            console.log(`Сохраняем в БД: ${mangaObject.name}`);

            await prisma.manga.upsert({
                where: { mangalib_url: mangaObject.mangalib_url },
                update: { ...mangaObject },
                create: { ...mangaObject },
            });
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

        const id = +req.params.titleId;
        const manga = await fetchTitle(id);

        await prisma.$disconnect(); // Закрываем соединение с БД

        console.log(`Времени затрачено: ${new Date() - startTime} мс`);
        res.json(manga);
    },
    parse: async (req, res) => {
        const startTime = new Date();

        let finalList = [];

        for (let i = 1; i <= HOW_MANY_PAGES_TO_PARSE; i++) {
            finalList = finalList.concat(await fetchListPage(i));
        }

        await prisma.$disconnect(); // Закрываем соединение с БД

        console.log(`Времени затрачено: ${new Date() - startTime} мс`);
        res.json(finalList);
    }
};

export default mainController;