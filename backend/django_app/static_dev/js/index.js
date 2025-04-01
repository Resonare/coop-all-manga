let mangaData = JSON.parse(JSON.parse(document.getElementById('mangaData').textContent));
function renderCatalog(data, filter = "") {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;

    catalog.innerHTML = "";  
    const fragment = document.createDocumentFragment();

    data.forEach(manga => {
        if (manga.fields.name.toLowerCase().includes(filter.toLowerCase())) {
            const itemContainer = document.createElement("div");
            itemContainer.className = "item-container";

            const item = document.createElement("img");
            item.className = "item";
            item.src = manga.fields.thumbnail;
            item.dataset.id = manga.pk;
            item.addEventListener("click", () => {
                window.location.href = `titles/${manga.pk}`;
            });

            const title = document.createElement("p");
            title.className = "title";
            title.textContent = manga.fields.name;

            itemContainer.appendChild(item);
            itemContainer.appendChild(title);
            fragment.appendChild(itemContainer);
        }
    });

    catalog.appendChild(fragment);
}

function setupFilterButtons() {
    const applyFiltersBtn = document.getElementById("applyFilters");
    const resetFiltersBtn = document.getElementById("resetFilters");

    applyFiltersBtn.addEventListener("click", () => {
        const yearFrom = document.getElementById("yearFrom").value;
        const yearTo = document.getElementById("yearTo").value;
        const ratingMin = document.getElementById("ratingMin").value;
        const ratingMax = document.getElementById("ratingMax").value;
        const popular = document.getElementById("popular").checked;
        const genres = document.getElementById("genres").value;
        const tags = document.getElementById("tags").value;

        const ageRatings = Array.from(document.querySelectorAll("input[name='age']:checked"))
            .map(input => input.value);
    
        const types = Array.from(document.querySelectorAll("input[name='type']:checked"))
            .map(input => input.value);
    
        const statuses = Array.from(document.querySelectorAll("input[name='status']:checked"))
            .map(input => input.value);

        const filters = {
            sorting:{
                yearFrom: yearFrom || null,
                yearTo: yearTo || null,
                ratingMin: ratingMin || null,
                ratingMax: ratingMax || null,
                popular
            },
            filter:{
                genres: genres !== "Выбрать..." ? genres : null,
                tags: tags !== "Выбрать..." ? tags : null,
                ageRatings,
                types,
                statuses
            }
        };

        fetch("", {
            method: "POST",
            body: JSON.stringify(filters)
        })
        .then(response => response.json())
    })


    resetFiltersBtn?.addEventListener("click", () => {
        document.querySelectorAll(".sidebar input, .sidebar select").forEach(input => {
            if (input.type === "checkbox") input.checked = false;
            else input.value = "";
        });
        renderCatalog(mangaData);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => renderCatalog(mangaData, e.target.value));
    }

    renderCatalog(mangaData); 
    setupFilterButtons();
});
