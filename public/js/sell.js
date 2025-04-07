"use strict";

const queryElement = document.querySelector(".search-bar");
let search_results = document.querySelector(".search-results-container");
let prevBtn = document.getElementById("prev-btn");
let nextBtn = document.getElementById("next-btn");

const resultsPerPage = 10;
let currentPage = 0;
let totalResults = 0;

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q");

  if (query) {
    queryElement.value = query;
    fetchBooks(query, 0);
  }
});

const validateQuery = () => {
  let isValid = true;
  if (queryElement.value.trim() === "") {
    queryElement.classList.add("flash");
    setTimeout(() => {
      queryElement.classList.remove("flash");
    }, 1000);
    isValid = false;
  }
  return isValid;
};

const fetchBooks = async (query, page) => {
  const startIndex = page * resultsPerPage;
  const searchURL = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${resultsPerPage}`;

  try {
    const response = await fetch(searchURL);
    const data = await response.json();

    totalResults = data.totalItems || 0;

    if (data.items) {
      displayResults(data.items);
    } else {
      search_results.innerHTML = `<p style="text-align: center; margin: 5rem 0;">Nothing found</p>`;
    }

    updatePaginationButtons();
  } catch (err) {
    console.error("Error fetching books:", err);
  }
};

const displayResults = books => {
  search_results.innerHTML = "";

  books.forEach(book => {
    const img = book.volumeInfo.imageLinks?.smallThumbnail || "img/default.jpg";
    const ISBN_10 =
      book.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")
        ?.identifier || "N/A";
    const ISBN_13 =
      book.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")
        ?.identifier || "N/A";
    const title = book.volumeInfo.title || "Title unknown";
    const subtitle = book.volumeInfo.subtitle || "";
    const authors = book.volumeInfo.authors?.join(", ") || "Author(s) unknown";
    const publisher = book.volumeInfo.publisher || "Publisher unknown";
    const published = book.volumeInfo.publishedDate || "N/A";
    const saleability = book.saleInfo?.saleability || "N/A";
    const mrp = Math.ceil(book.saleInfo?.listPrice?.amount) || "N/A";
    const costPrice = Math.ceil(book.saleInfo?.retailPrice?.amount) || "N/A";
    const vbuyPrice = costPrice === "N/A" ? "N/A" : Math.ceil(costPrice * 0.3);

    let searchCard = document.createElement("div");
    searchCard.classList.add("search-card-container");

    searchCard.innerHTML = `
      <div class="book-img-container">
        <img src="${img}" alt="Book Image" class="book-image"/>
      </div>

      <div class="book-info-container">
        <div class="isbn-10-container info-container">
          <label class="isbn-10-label">ISBN-10</label>
          <p class="isbn-10">${ISBN_10}</p>
        </div>

        <div class="isbn-13-container info-container">
          <label class="isbn-13-label">ISBN-13</label>
          <p class="isbn-13">${ISBN_13}</p>
        </div>

        <div class="title-container info-container">
          <label class="title-label">Title</label>
          <p class="title">${title}, ${subtitle}</p>
        </div>

        <div class="author-container info-container">
          <label class="author-label">Author(s)</label>
          <p class="author">${authors}</p>
        </div>

        <div class="publisher-container info-container">
          <label class="publisher-label">Publisher</label>
          <p class="publisher">${publisher}</p>
        </div>

        <div class="published-container info-container">
          <label class="published-label">Published</label>
          <p class="published">${published}</p>
        </div>

        <div class="sale-info-container">
          <div class="saleability-container info-container">
            <label class="saleability-label">Saleability</label>
            <p class="saleability">${saleability}</p>
          </div>

          <div class="mrp-container info-container">
            <label class="mrp-label">MRP</label>
            <p class="mrp">${mrp === "N/A" ? "N/A" : `Rs. ${mrp}`}</p>
          </div>

          <div class="cost-price-container info-container">
            <label class="cost-price-label">Market price</label>
            <p class="cost-price">${
              costPrice === "N/A" ? "N/A" : `Rs. ${costPrice}`
            }</p>
          </div>
        </div>
      </div>

      <div class="vbuy-price-container">
        <p class="vbuy-price-text">VBuy price</p>
        <a href="#" class="add-to-cart" data-isbn="${ISBN_13}" data-price=${vbuyPrice}>
          <span class="vbuy-price">${
            vbuyPrice === "N/A" ? "N/A" : `Rs. ${vbuyPrice}/-`
          }</span>
          <span class="add-text">Add to cart</span>
        </a>
      </div>`;

    search_results.appendChild(searchCard);
  });

  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", async function (event) {
      event.preventDefault();
      const isbn = this.getAttribute("data-isbn");
      const vbuy_price = this.getAttribute("data-price");
      await addToCart(isbn, vbuy_price);
    });
  });
};

document.querySelector(".search-btn").addEventListener("click", async e => {
  e.preventDefault();

  if (!validateQuery()) {
    return;
  }

  currentPage = 0;
  fetchBooks(queryElement.value.trim(), currentPage);
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    fetchBooks(queryElement.value.trim(), currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  if ((currentPage + 1) * resultsPerPage < totalResults) {
    currentPage++;
    fetchBooks(queryElement.value.trim(), currentPage);
  }
});

const updatePaginationButtons = () => {
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = (currentPage + 1) * resultsPerPage >= totalResults;
};

const addToCart = async (isbn, vbuy_price) => {
  const token = getTokenFromCookies();

  if (!isTokenValid(token)) {
    alert("Unauthorized! Please login first!");
    window.location.href = "/login";
  }

  if (vbuy_price === "N/A") {
    alert("Price not available! Contact support!");
    return;
  }

  const body = {
    isbn,
    quantity: 1,
    costPrice: vbuy_price,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/carts/additem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      alert("Something went wrong!");
      throw new Error("Error");
    }

    const data = await response.json();

    window.location.href = "/cart";
  } catch (e) {
    console.error(e);
  }
};
