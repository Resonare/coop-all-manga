let mangaData = JSON.parse(JSON.parse(document.getElementById('mangaData').textContent));
let url_for_get_manga = 'http://127.0.0.1:8000/api/titles/?'
let currentPage = 1;
setupPagination()
mangaData = mangaData.map(manga => {
    return {
        id: manga.pk,
        ...manga.fields
    }
})
function renderCatalog(data, filter = "") {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;

    catalog.innerHTML = "";  
    const fragment = document.createDocumentFragment();
    console.log(data)
    data.forEach(manga => {
        if (manga.name.toLowerCase().includes(filter.toLowerCase())) {
            const itemContainer = document.createElement("div");
            itemContainer.className = "item-container";

            const item = document.createElement("img");
            item.className = "item";
            item.src = manga.thumbnail;
            item.dataset.id = manga.id;
            item.addEventListener("click", () => {
                window.location.href = `${manga.id}`;
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
        const types = Array.from(document.querySelectorAll("input[name='type']:checked"))
            .map(input => input.value);
        const statuses = Array.from(document.querySelectorAll("input[name='status']:checked"))
            .map(input => input.value);
    
        // порядок сортировки
        let ordering = "";
        if (document.getElementById("desc")?.checked) ordering = "-";

        // сортировка по году и рейтингу    
        let order_by = "";
        if (document.getElementById("year")?.checked) order_by = "year";
        if (document.getElementById("rating")?.checked) order_by = "rating";
    
        const params = new URLSearchParams();
        
        if (order_by) params.append("order_by",  ordering + order_by);
    
        types.forEach(type => params.append("type", type));
        statuses.forEach(status => params.append("status", status));
    
        url_for_get_manga = `http://127.0.0.1:8000/api/titles/?${params.toString()}&`;
        console.log("Формируемый URL:", url_for_get_manga);
        currentPage = 1
        setupPagination()

        fetch(url_for_get_manga, { method: "GET" })
            .then(response => response.json())
            .then(data => {
                renderCatalog(data.results);
            })
            .catch(error => console.error("Ошибка при получении данных:", error));
    });

    


    resetFiltersBtn?.addEventListener("click", () => {
        document.querySelectorAll(".sidebar input, .sidebar select").forEach(input => {
            if (input.type === "checkbox") input.checked = false;
            else input.value = "";

            if (input.type === "radio") input.checked = false;
            else input.value = "";
        });
        currentPage = 1
        setupPagination()
        let url_for_get_manga = 'http://127.0.0.1:8000/api/titles/?'
        fetch(url_for_get_manga + `page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                renderCatalog(data.results);
            })
            .catch(error => {
                console.error("Ошибка при получении страницы:", error);
            });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query !== "") {
                const params = new URLSearchParams();
                params.append("search", query);

                url_for_get_manga = `http://127.0.0.1:8000/api/titles/?${params.toString()}&`;
                console.log("Поисковый URL:", url_for_get_manga);
                currentPage = 1
                setupPagination()

                fetch(url_for_get_manga, { method: "GET" })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Ошибка запроса");
                        }
                        return response.json();
                    })
                    .then(data => {
                        renderCatalog(data.results); 
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

function setupPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    renderPagination();

    function renderPagination() {
        paginationContainer.innerHTML = "";

        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "←";
            prevButton.addEventListener("click", () => {
                currentPage--;
                fetchPage();
            });
            paginationContainer.appendChild(prevButton);
        }

        const currentSpan = document.createElement("span");
        currentSpan.textContent = currentPage;
        paginationContainer.appendChild(currentSpan);

        const nextPage = currentPage + 1;
        const nextButton = document.createElement("button");
        nextButton.textContent = nextPage;
        nextButton.addEventListener("click", () => {
            currentPage++;
            fetchPage();
        });
        paginationContainer.appendChild(nextButton);

        const nextArrow = document.createElement("button");
        nextArrow.textContent = "→";
        nextArrow.addEventListener("click", () => {
            currentPage++;
            fetchPage();
        });
        paginationContainer.appendChild(nextArrow);
    }

    function fetchPage() {
        fetch(url_for_get_manga + `page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                renderCatalog(data.results);
                renderPagination();
            })
            .catch(error => {
                console.error("Ошибка при получении страницы:", error);
            });
    }
}
