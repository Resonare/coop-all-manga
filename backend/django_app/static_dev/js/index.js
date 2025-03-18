let mangaData = JSON.parse(JSON.parse(document.getElementById('mangaData').textContent));
function renderCatalog(filter = "") {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;

    catalog.innerHTML = "";  
    const fragment = document.createDocumentFragment();

    mangaData.forEach(manga => {
        if (manga.fields.name.toLowerCase().includes(filter.toLowerCase())) {
            const item = document.createElement("div");
            item.className = "item";
            item.textContent = manga.fields.name;
            item.dataset.id = manga.fields.name;
            item.addEventListener("click", () => {
                window.location.href = `description.html?id=${key}`;
            });
            fragment.appendChild(item);
        }
    });

    catalog.appendChild(fragment);
}

function setupFilterButtons() {
    const applyFiltersBtn = document.getElementById("applyFilters");
    const resetFiltersBtn = document.getElementById("resetFilters");

    applyFiltersBtn?.addEventListener("click", () => alert("Фильтры применены!"));
    
    resetFiltersBtn?.addEventListener("click", () => {
        document.querySelectorAll(".sidebar input, .sidebar select").forEach(input => {
            if (input.type === "checkbox") input.checked = false;
            else input.value = "";
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => renderCatalog(e.target.value));
    }

    renderCatalog();
    setupFilterButtons();
});