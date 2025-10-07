document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const materialFilter = document.getElementById("materialFilter");
  const table = document.getElementById("priceTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  let currentSort = { column: null, direction: "asc" };

  // Функция поиска
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedMaterial = materialFilter.value;

    rows.forEach((row) => {
      const article = row.querySelector(".article").textContent.toLowerCase();
      const name = row.querySelector(".name").textContent.toLowerCase();
      const category = row.dataset.category || "";
      const material = row.dataset.material || "";

      const matchesSearch =
        article.includes(searchTerm) || name.includes(searchTerm);
      const matchesCategory =
        !selectedCategory || category === selectedCategory;
      const matchesMaterial =
        !selectedMaterial || material === selectedMaterial;

      if (matchesSearch && matchesCategory && matchesMaterial) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });
  }

  // Функция сортировки
  function sortTable(column, direction) {
    const sortedRows = [...rows].sort((a, b) => {
      let aVal, bVal;

      switch (column) {
        case "article":
          aVal = a.querySelector(".article").textContent;
          bVal = b.querySelector(".article").textContent;
          break;
        case "name":
          aVal = a.querySelector(".name").textContent;
          bVal = b.querySelector(".name").textContent;
          break;
        case "price":
          aVal = parseInt(a.querySelector(".price").dataset.price) || 0;
          bVal = parseInt(b.querySelector(".price").dataset.price) || 0;
          break;
        default:
          return 0;
      }

      if (column === "price") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const comparison = aVal.localeCompare(bVal, "ru");
        return direction === "asc" ? comparison : -comparison;
      }
    });

    // Удаляем все строки и добавляем отсортированные
    tbody.innerHTML = "";
    sortedRows.forEach((row) => tbody.appendChild(row));

    // Обновляем визуальные индикаторы сортировки
    document.querySelectorAll(".sortable").forEach((th) => {
      th.classList.remove("asc", "desc");
    });

    const activeHeader = document.querySelector(`[data-sort="${column}"]`);
    if (activeHeader) {
      activeHeader.classList.add(direction);
    }
  }

  // Обработчики событий
  searchInput.addEventListener("input", performSearch);
  categoryFilter.addEventListener("change", performSearch);
  materialFilter.addEventListener("change", performSearch);

  // Обработчики сортировки
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", function () {
      const column = this.dataset.sort;

      if (currentSort.column === column) {
        currentSort.direction =
          currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.direction = "asc";
      }

      sortTable(column, currentSort.direction);
    });
  });

  // Функция для форматирования цен с разделителями тысяч
  function formatPrices() {
    const priceCells = document.querySelectorAll(".price-table .price");
    priceCells.forEach((cell) => {
      const price = cell.dataset.price;
      if (price) {
        const formattedPrice = parseInt(price).toLocaleString("ru-RU");
        cell.textContent = formattedPrice;
      }
    });
  }

  // Функция подсветки результатов поиска
  function highlightSearchResults() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    rows.forEach((row) => {
      const articleCell = row.querySelector(".article");
      const nameCell = row.querySelector(".name");

      // Убираем предыдущие выделения
      [articleCell, nameCell].forEach((cell) => {
        const text = cell.textContent;
        cell.innerHTML = text; // Убираем HTML теги
      });

      if (searchTerm && searchTerm.length > 1) {
        [articleCell, nameCell].forEach((cell) => {
          const text = cell.textContent;
          const regex = new RegExp(
            `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi"
          );
          const highlightedText = text.replace(regex, "<mark>$1</mark>");
          cell.innerHTML = highlightedText;
        });
      }
    });
  }

  // Обновляем поиск с подсветкой
  const originalPerformSearch = performSearch;
  performSearch = function () {
    originalPerformSearch();
    highlightSearchResults();
  };

  // Инициализация
  formatPrices();

  // Добавляем стили для подсветки поиска
  const style = document.createElement("style");
  style.textContent = `
        .price-table mark {
            background-color: #fff3cd;
            padding: 1px 2px;
            border-radius: 2px;
        }
        
        .price-table tbody tr:hover mark {
            background-color: #ffeaa7;
        }
    `;
  document.head.appendChild(style);

  console.log("Прайс-лист инициализирован");
  console.log(`Загружено товаров: ${rows.length}`);
});
