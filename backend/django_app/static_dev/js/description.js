let manga = JSON.parse(JSON.parse(document.getElementById('title_json').textContent))[0];
let tags = JSON.parse(JSON.parse(document.getElementById('tags_json').textContent));
let genres = JSON.parse(JSON.parse(document.getElementById('genres_json').textContent));
let chapters = JSON.parse(JSON.parse(document.getElementById('chapters_json').textContent));
console.log(chapters)
function updateDescriptionPage() {
    if (!manga) {
        document.querySelector("h1").textContent = "Манга не найдена";
        return;
    }

    
    document.querySelector("h1").textContent = manga.fields.name;
    document.querySelector(".description-box p").textContent = manga.fields.description;
    document.querySelector("#manga-author").textContent = manga.fields.author; 
    document.querySelector("#manga-year").textContent = manga.fields.year; 
    document.querySelector("#manga-status").textContent = manga.fields.status; 
    document.querySelector("#manga-rating").textContent = manga.fields.rating;

   
    document.querySelector("#manga-type").textContent = manga.fields.type;

    
    const genresContainer = document.querySelector(".tags");
    genresContainer.innerHTML = ""; 
    genres.forEach(genre => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = genre.fields.name;
        genresContainer.appendChild(span);
    });


    const tagsContainer = document.querySelector(".tags");
    tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = `#${tag.fields.name}`;
        tagsContainer.appendChild(span);
    });


    const coverImage = document.querySelector("aside img");
    coverImage.src = manga.fields.cover;
    coverImage.alt = `${manga.fields.name} cover`;

 
    setupSourceButtons();
    updateChaptersList("mangalib");
}

function setupSourceButtons() {
    const mangalibBtn = document.getElementById("mangalib");
    const remangaBtn = document.getElementById("remanga");

    if (!mangalibBtn || !remangaBtn) return;

    
    const switchSource = (source) => {
        updateChaptersList(source);
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

function updateChaptersList() {
    const chaptersContainer = document.querySelector("#chapters ul");
    if (!chaptersContainer) return;

    
    chaptersContainer.innerHTML = "";
    if (Array.isArray(chapters)) {
        const fragment = document.createDocumentFragment();

        chapters.forEach((chapter, index) => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.className = "chapter-link";
            link.textContent = chapter.fields.name;

            const translationContainer = document.createElement("div");
            translationContainer.classList.add("translations-container");
            translationContainer.id = `translations-${index}`;
            translationContainer.style.display = "none";

            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = chapter.fields.link;
            a.target = "_blank";
            a.textContent = chapter.fields.translator;
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
                <p><strong>Название:</strong> ${chapter.fields.name}</p>
                <p><strong>Дата выхода:</strong> ${chapter.fields.release}</p>
                <p><strong>Переводчик:</strong> <a href="${chapter.fields.link}" target="_blank">${chapter.fields.translator}</a></p>
                <p><strong>Ссылка:</strong> <a href="${chapter.fields.link}" target="_blank">${chapter.fields.link}</a></p>
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