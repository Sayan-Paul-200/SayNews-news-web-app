const apiKey = "YOUR_API_KEY";
const baseURL = "https://newsapi.org/v2/everything?";
const loader = document.querySelector(".loader-wrapper");
const mainContent = document.querySelector("#container-main");

// Event listener for window load
window.addEventListener("load", () => {
    fetchNews({
        q: "india",
        url: `${baseURL}apiKey=${apiKey}`,
        sortBy: ""
    });
});

// Fetch news based on user input
const fetchNews = async function({ q, url, sortBy }) {
    try {
        mainContent.style.display = "none";
        loader.style.display = "flex";
        setTimeout(load, 2000);

        document.querySelector("#result-query").textContent = capitalize(q);
        let fetchUrl = sortBy ? `${url}&q=${q}&sortBy=${sortBy}` : `${url}&q=${q}`;

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.articles || data.articles.length === 0) {
            throw new Error("No articles found.");
        }
        console.log(data);
        bindData(data.articles);
    } catch (error) {
        console.error("Error: ", error);
        alert(error.message || "Error fetching news. Please try again.");
        load(); // Ensure loader is hidden and main content is shown in case of error
    }
};

// Loader function
const load = function() {
    loader.style.display = "none";
    mainContent.style.display = "block";
};

// Bind news data to the DOM
const bindData = function(articles) {
    const cardsContainer = document.querySelector("#cards-container");
    const cardTemplate = document.querySelector("#template-news-card");
    const resultCount = document.querySelector("#results-count");
    let count = 0;

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) {
            return;
        }
        const cardClone = cardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
        count++;
    });
    resultCount.textContent = count;
};

// Fill data in card template
const fillDataInCard = function(card, article) {
    const newsImg = card.querySelector("#news-img");
    const newsTitle = card.querySelector("#news-title");
    const newsSrc = card.querySelector("#news-source");
    const newsDesc = card.querySelector("#news-desc");
    const newsLink = card.querySelector("#news-url");

    newsImg.src = article.urlToImage;
    newsTitle.textContent = article.title.length > 60 ? `${article.title.substring(0, 60)}...` : article.title;
    newsDesc.textContent = article.description.length > 140 ? `${article.description.substring(0, 140)}...` : article.description;
    newsLink.href = article.url;
    newsLink.target = "_blank";

    const published = new Date(article.publishedAt).toLocaleString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    newsSrc.innerHTML = `${article.source.name}  <span id="date">${published}</span>`;
};

// Search query listener
const searchBtn = document.querySelector("#search-button");
const userInput = document.querySelector("#news-input");
searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (curSeleNav) {
        curSeleNav.classList.remove("active");
    }

    const query = userInput.value.trim();
    if (!query) {
        alert("Please enter a search term");
    } else {
        fetchNews({
            q: query,
            url: `${baseURL}apiKey=${apiKey}`,
            sortBy: ""
        });
    }
    userInput.value = "";
});

// Reload when logo is clicked
const reload = function() {
    window.location.reload();
};

// Navbar links listeners
let curSeleNav = null;
const onNavItemClick = function(id) {
    fetchNews({
        q: id,
        url: `${baseURL}apiKey=${apiKey}`,
        sortBy: ""
    });
    const navItem = document.getElementById(id);
    if (curSeleNav) {
        curSeleNav.classList.remove("active");
    }
    curSeleNav = navItem;
    curSeleNav.classList.add("active");
};

// Sort by listeners
let curSeleSort = null;
const sortBy = function(id) {
    fetchNews({
        q: document.querySelector("#result-query").textContent,
        url: `${baseURL}apiKey=${apiKey}`,
        sortBy: id
    });
    const sortItem = document.getElementById(id);
    if (curSeleSort) {
        curSeleSort.classList.remove("active");
    }
    curSeleSort = sortItem;
    curSeleSort.classList.add("active");
};

// Capitalize function
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Contact form functionality
const contactForm = document.querySelector("#contact-form");
const result = document.querySelector("#result");
contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);
    result.innerHTML = "Please wait...";

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: json
    }).then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
            result.innerHTML = "Submitted successfully!";
        } else {
            console.log(response);
            result.innerHTML = json.message;
        }
    }).catch((error) => {
        console.log(error);
        result.innerHTML = "Something went wrong.";
    }).then(function() {
        contactForm.reset();
        setTimeout(() => {
            result.style.display = "none";
        }, 3000);
    });
});
