const mangaData = {
    "1": {
        "id": 1,
        "name": "Test Manga 1",
        "description": "Test",
        "author": "Test",
        "year": "2025",
        "status": "completed",
        "type": "manhwa",
        "rating": 9.05,
        "genres": [
            "Genre1",
            "Genre2",
            "Genre1",
            "Genre2",
            "Genre1",
            "Genre2"
        ],
        "tags": [
            "Tag1",
            "Tag2"
        ],
        "thumbnail": "link",
        "cover": "https://cover.imglib.info/uploads/cover/player/cover/N1IRpJ7IVIr7_250x350.jpg",
        "sources": {
            "mangalib": [
                {
                    "chapter_title": "Chapter 1",
                    "release": "01/01/2022",
                    "translator": "dsdsd",
                    "link": "testlink"
                },
                {
                    "chapter_title": "Chapter 2",
                    "release": "01/02/2022",
                    "translator": "Test",
                    "link": "testlink"
                }
            ],
            "remanga": [
                {
                    "chapter_title": "Chapter 1",
                    "release": "01/01/2022",
                    "translator": "Test",
                    "link": "testlink"
                },
                {
                    "chapter_title": "Chapter 2",
                    "release": "01/02/2022",
                    "translator": "Test",
                    "link": "testlink"
                }
            ]
        }
    },
    "2": {
        "id": 2,
        "name": "Another Manga",
        "description": "Test 2",
        "author": "Test 2",
        "year": "2077 2",
        "status": "ongoing",
        "type": "manhwa",
        "rating": 9.05,
        "genres": [
            "Genre1",
            "Genre2"
        ],
        "tags": [
            "Tag1",
            "Tag2"
        ],
        "thumbnail": "link",
        "cover": "https://cover.imglib.info/uploads/cover/gadeupaeseu/cover/2502a899-9c47-4673-8dc1-a261583a6957.jpg",
        "sources": {
            "mangalib": [
                {
                    "chapter_title": "Chapter 1",
                    "release": "01/01/2022",
                    "translator": "Test",
                    "link": "testlink"
                },
                {
                    "chapter_title": "Chapter 2",
                    "release": "01/02/2022",
                    "translator": "Test",
                    "link": "testlink"
                }
            ],
            "remanga": [
                {
                    "chapter_title": "Chapter 1",
                    "release": "01/01/2022",
                    "translator": "Test",
                    "link": "testlink"
                },
                {
                    "chapter_title": "Chapter 2",
                    "release": "01/02/2022",
                    "translator": "Test",
                    "link": "testlink"
                }
            ]
        }
    }
};

function updateDescriptionPage() {
    const mangaId = new URLSearchParams(window.location.search).get("id");
    const manga = mangaData[mangaId];
    if (!manga) {
        document.querySelector("h1").textContent = "Манга не найдена";
        return;
    }

    
    document.querySelector("h1").textContent = manga.name;
    document.querySelector(".description-box p").textContent = manga.description;
    document.querySelector("#manga-author").textContent = manga.author; 
    document.querySelector("#manga-year").textContent = manga.year; 
    document.querySelector("#manga-status").textContent = manga.status; 
    document.querySelector("#manga-rating").textContent = manga.rating;

   
    document.querySelector("#manga-type").textContent = manga.type;

    
    const genresContainer = document.querySelector(".tags");
    genresContainer.innerHTML = ""; 
    manga.genres.forEach(genre => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = genre;
        genresContainer.appendChild(span);
    });


    const tagsContainer = document.querySelector(".tags");
    manga.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = `#${tag}`;
        tagsContainer.appendChild(span);
    });


    const coverImage = document.querySelector("aside img");
    coverImage.src = manga.cover;
    coverImage.alt = `${manga.name} cover`;

 
    setupSourceButtons(mangaId);
    updateChaptersList(mangaId, "mangalib");
}
function setupSourceButtons(mangaId) {
    const mangalibBtn = document.getElementById("mangalib");
    const remangaBtn = document.getElementById("remanga");

    if (!mangalibBtn || !remangaBtn) return;

    
    const switchSource = (source) => {
        updateChaptersList(mangaId, source);
        toggleActiveSource(source === "mangalib" ? mangalibBtn : remangaBtn, 
                           source === "mangalib" ? remangaBtn : mangalibBtn);
    };

   
    mangalibBtn.addEventListener("click", () => switchSource("mangalib"));
    remangaBtn.addEventListener("click", () => switchSource("remanga"));
}

function toggleActiveSource(activeBtn, inactiveBtn) {
    activeBtn.classList.add("active");
    inactiveBtn.classList.remove("active");
}

function updateChaptersList(mangaId, source) {
    const manga = mangaData[mangaId];
    const chaptersContainer = document.querySelector("#chapters ul");
    if (!chaptersContainer) return;

    
    chaptersContainer.innerHTML = "";
    const chapters = manga.sources[source];
    if (Array.isArray(chapters)) {
        const fragment = document.createDocumentFragment();

        chapters.forEach((chapter, index) => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.className = "chapter-link";
            link.textContent = chapter.chapter_title;

            const translationContainer = document.createElement("div");
            translationContainer.classList.add("translations-container");
            translationContainer.id = `translations-${index}`;
            translationContainer.style.display = "none";

            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = chapter.link;
            a.target = "_blank";
            a.textContent = chapter.translator;
            p.appendChild(a);
            translationContainer.appendChild(p);

            link.addEventListener("click", () => {
                const chapterInfoContainer = document.getElementById(`chapter-info-${index}`);
                const isVisible = chapterInfoContainer.style.display === "block";
                chapterInfoContainer.style.display = isVisible ? "none" : "block";
            });

            li.appendChild(link);
            li.appendChild(translationContainer);
            fragment.appendChild(li);

            
            const chapterInfoContainer = document.createElement("div");
            chapterInfoContainer.id = `chapter-info-${index}`;
            chapterInfoContainer.classList.add("chapter-info");
            chapterInfoContainer.style.display = "none"; 

            
            chapterInfoContainer.innerHTML = `
                <p><strong>Название:</strong> ${chapter.chapter_title}</p>
                <p><strong>Дата выхода:</strong> ${chapter.release}</p>
                <p><strong>Переводчик:</strong> <a href="${chapter.link}" target="_blank">${chapter.translator}</a></p>
                <p><strong>Ссылка:</strong> <a href="${chapter.link}" target="_blank">${chapter.link}</a></p>
            `;

            
            fragment.appendChild(chapterInfoContainer);
        });

        
        chaptersContainer.appendChild(fragment);
    }
}


// Функция для переключения вкладок
function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");

            // Переключаем активные вкладки
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateDescriptionPage();
    setupTabs(); // Настроим переключение вкладок
});