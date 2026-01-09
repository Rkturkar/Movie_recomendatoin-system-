const API_BASE = "https://movie-rec-466x.onrender.com"; 
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const content = document.getElementById("content");
const searchBox = document.getElementById("searchBox");
const suggestionsDiv = document.getElementById("suggestions");

// Load home feed on startup
loadHome();

// ------------------ ROUTING ------------------

function goHome() {
    loadHome();
    history.pushState({}, "", "/");
}

// ------------------ HOME FEED ------------------

async function loadHome() {
    const category = document.getElementById("category").value;
    const res = await fetch(`${API_BASE}/home?category=${category}&limit=24`);
    const data = await res.json();
    renderGrid(data);
}

// ------------------ SEARCH ------------------

searchBox.addEventListener("keyup", async () => {
    const q = searchBox.value.trim();
    if (q.length < 2) return;

    const res = await fetch(`${API_BASE}/tmdb/search?query=${q}`);
    const data = await res.json();

    suggestionsDiv.innerHTML = "";

    data.results.slice(0, 6).forEach(m => {
        const div = document.createElement("div");
        div.innerText = m.title;
        div.className = "suggestion";
        div.onclick = () => loadDetails(m.id);
        suggestionsDiv.appendChild(div);
    });
});

// ------------------ GRID ------------------

function renderGrid(movies) {
    content.innerHTML = `<div class="grid">
        ${movies.map(m => `
            <div class="card">
                <img src="${m.poster_url || ''}">
                <h4>${m.title}</h4>
                <button onclick="loadDetails(${m.tmdb_id})">Open</button>
            </div>
        `).join("")}
    </div>`;
}

// ------------------ DETAILS ------------------

async function loadDetails(tmdb_id) {
    const res = await fetch(`${API_BASE}/movie/id/${tmdb_id}`);
    const movie = await res.json();

    content.innerHTML = `
        <div class="details-container">

            <div class="details-poster">
                <img src="${movie.poster_url}">
            </div>

            <div class="details-info">
                <h2>${movie.title}</h2>
                <p><b>Release:</b> ${movie.release_date}</p>
                <p><b>Genres:</b> ${(movie.genres || []).map(g => g.name).join(", ")}</p>
                <p class="overview">${movie.overview}</p>
            </div>

        </div>

        <h2 style="margin-top:30px;">Recommendations</h2>
        <div id="reco"></div>
    `;

    loadRecommendations(movie.title);
}

// ------------------ RECOMMENDATIONS ------------------

async function loadRecommendations(title) {
    const res = await fetch(`${API_BASE}/movie/search?query=${title}&tfidf_top_n=12&genre_limit=12`);
    const data = await res.json();

    const recoDiv = document.getElementById("reco");

    const cards = data.genre_recommendations || [];

    recoDiv.innerHTML = `<div class="grid">
        ${cards.map(m => `
            <div class="card">
                <img src="${m.poster_url}">
                <h4>${m.title}</h4>
                <button onclick="loadDetails(${m.tmdb_id})">Open</button>
            </div>
        `).join("")}
    </div>`;
}
