function updateDescriptionPage() {
    const mangaId = new URLSearchParams(window.location.search).get("id");
    const manga = mangaData[mangaId];
    if (!manga) {
        document.querySelector("h1").textContent = "Манга не найдена";
        return;
    }

    document.querySelector("h1").textContent = manga.title;
    setupSourceButtons(mangaId);
    updateChaptersList(mangaId, "Mangalibchapters"); 
}

function updateChaptersList(mangaId, source) {
    const manga = mangaData[mangaId];
    const chaptersContainer = document.querySelector("#chapters ul");
    if (!chaptersContainer) return;

    chaptersContainer.innerHTML = "";
    const chapters = manga[source];
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
            chapter.translators.forEach(translator => {
                const p = document.createElement("p");
                const a = document.createElement("a");
                a.href = translator.link;
                a.target = "_blank";
                a.textContent = translator.name;
                p.appendChild(a);
                translationContainer.appendChild(p);
            });

            link.addEventListener("click", () => {
                const isVisible = translationContainer.style.display === "block";
                translationContainer.style.display = isVisible ? "none" : "block";
            });

            li.appendChild(link);
            li.appendChild(translationContainer);
            fragment.appendChild(li);
        });

        chaptersContainer.appendChild(fragment);
    }
}

function setupSourceButtons(mangaId) {
    const mangalibBtn = document.getElementById("mangalib");
    const remangaBtn = document.getElementById("remanga");

    if (!mangalibBtn || !remangaBtn) return;

    const switchSource = (source) => {
        updateChaptersList(mangaId, source);
        toggleActiveSource(source === "Mangalibchapters" ? mangalibBtn : remangaBtn, 
                           source === "Mangalibchapters" ? remangaBtn : mangalibBtn);
    };

    mangalibBtn.addEventListener("click", () => switchSource("Mangalibchapters"));
    remangaBtn.addEventListener("click", () => switchSource("Remangachapters"));
}

function toggleActiveSource(activeBtn, inactiveBtn) {
    activeBtn.classList.add("active");
    inactiveBtn.classList.remove("active");
}

function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => renderCatalog(e.target.value));
    }

    updateDescriptionPage();
    setupTabs();
});