let mangaData = JSON.parse(JSON.parse(document.getElementById('mangaData').textContent));
function renderCatalog(data, filter = "") {
    const catalog = document.getElementById("catalog");
    if (!catalog) return;

    catalog.innerHTML = "";  
    const fragment = document.createDocumentFragment();

    data.forEach(object => {
        manga = object.fields
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
        // const popular = document.getElementById("popular").checked;
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
                // popular
            },
            // filter:{
            //     genres: genres !== "Выбрать..." ? genres : null,
            //     tags: tags !== "Выбрать..." ? tags : null,
            // },
            // ageRatings,
            types,
            statuses
        };

        const requestData = {
            ...filters,
            page: currentPage 
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

let currentPage = 1;
const pageSize = 10; // количество манги на одной странице 

// добавлена функция пагинации   
function setupPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    renderPagination();

    function renderPagination() {
        paginationContainer.innerHTML = "";
        // ниже логика создания стрелочек и цифр страниц

        // стрелка назад
        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "←";
            prevButton.addEventListener("click", () => {
                currentPage--;
                fetchPage();
            });
            paginationContainer.appendChild(prevButton);
        }

        // текущая страница
        const currentSpan = document.createElement("span");
        currentSpan.textContent = currentPage;
        paginationContainer.appendChild(currentSpan);

        // следующая страница, только если впереди еще есть страницы
        const nextPage = currentPage + 1;
        const nextButton = document.createElement("button");
        nextButton.textContent = nextPage;
        nextButton.addEventListener("click", () => {
            currentPage++;
            fetchPage();
        });
        paginationContainer.appendChild(nextButton);

        // стрелка вперед
        const nextArrow = document.createElement("button");
        nextArrow.textContent = "→";
        nextArrow.addEventListener("click", () => {
            currentPage++;
            fetchPage();
        });
        paginationContainer.appendChild(nextArrow);
    }

    //добавлена функция для получения текущей страницы
    function fetchPage() {
        fetch(`http://127.0.0.1:8000/api/?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                renderCatalog(data);
                renderPagination();
            })
            .catch(error => {
                console.error("Ошибка при получении страницы:", error);
            });
    }
}
