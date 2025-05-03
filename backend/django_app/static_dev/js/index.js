let mangaData = JSON.parse(JSON.parse(document.getElementById('mangaData').textContent));
function renderCatalog(data, filter = "") {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;

    catalog.innerHTML = "";  
    const fragment = document.createDocumentFragment();

    data.forEach(object => {
        manga = object.fields
        console.log(manga)
        if (manga.name.toLowerCase().includes(filter.toLowerCase())) {
            const itemContainer = document.createElement("div");
            itemContainer.className = "item-container";

            const item = document.createElement("img");
            item.className = "item";
            item.src = manga.thumbnail;
            item.dataset.id = object.pk;
            item.addEventListener("click", () => {
                window.location.href = `${object.pk}`;
            });
            item.title = manga.name

            const title = document.createElement("p");
            title.className = "title";
            const maxTitleLength = 15; // Максимальное количество символов для отображения
            if (manga.name.length > maxTitleLength) {
                title.textContent = manga.name.slice(0, maxTitleLength) + '...'; // Обрезаем название и добавляем многоточие
            } else {
                title.textContent = manga.name;
            }
            title.title = manga.name;

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
        const year = document.getElementById("year").checked;
        const rating = document.getElementById("rating").checked;
        const popular = document.getElementById("popular").checked;
        // const genres = document.getElementById("genres").value;
        // const tags = document.getElementById("tags").value;

        // const ageRatings = Array.from(document.querySelectorAll("input[name='age']:checked"))
        //     .map(input => input.value);
    
        const types = Array.from(document.querySelectorAll("input[name='type']:checked"))
            .map(input => input.value);
    
        const statuses = Array.from(document.querySelectorAll("input[name='status']:checked"))
            .map(input => input.value);

        const filters = {
            sorting:{
                year,
                rating,
                popular
            },
            // filter:{
            //     genres: genres !== "Выбрать..." ? genres : null,
            //     tags: tags !== "Выбрать..." ? tags : null,
            // },
            // ageRatings,
            types,
            statuses
        };

        fetch("http://127.0.0.1:8000/api/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"  
            },
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
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.trim();
            console.log('клик')
            if (query !== "") {
                fetch(``)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Ошибка запроса");
                        }
                        return response.json();
                    })
                    .then(data => {
                        renderCatalog(data); 
                    })
                    .catch(error => {
                        console.error("Ошибка при поиске:", error);
                    });
            }
        });
    }

    renderCatalog(mangaData); 
    setupFilterButtons();
});
