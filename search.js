const params = new URLSearchParams(location.search);
const keywordRaw = params.get("q") || "";
const keyword = keywordRaw.trim().toLowerCase();

const titleEl = document.getElementById("searchTitle");
const box = document.getElementById("searchResults");

if (!keyword) {
  titleEl.innerText = "Please enter a search keyword.";
  box.innerHTML = "";
  throw new Error("No keyword");
}

titleEl.innerText = `Search result for "${keywordRaw}"`;

const db = firebase.database();

let total = 0;
let loaded = 0;
const NEED = 4; // news, comics, games, fanarts

/* ---------- helpers ---------- */

function match(...txt) {
  return txt.some(t =>
    typeof t === "string" && t.toLowerCase().includes(keyword)
  );
}

function renderSection(title, items) {
  if (!items || items.length === 0) return;

  total += items.length;

  let html = `
    <div class="search-category">
      <h3>${title}</h3>
  `;

  items.forEach(d => {
    html += `
      <div class="search-item">
        ${d.img ? `<img src="${d.img}" onclick="openZoom(this.src)">` : ""}
        <div class="search-text">
          <b>${d.title || d.credit || ""}</b><br>
          ${d.desc || ""}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  box.innerHTML += html;
}

function done() {
  loaded++;
  if (loaded === NEED) {
    titleEl.innerText = `"${keywordRaw}" (${total}) result found`;
    if (total === 0) {
      box.innerHTML = `<p style="margin:10px">No results found.</p>`;
    }
  }
}

/* ---------- fetch functions ---------- */

function fetchCategory(refName, title, matcher) {
  db.ref(refName).once("value")
    .then(snap => {
      const arr = [];
      snap.forEach(c => {
        const d = c.val();
        if (matcher(d)) arr.push(d);
      });
      renderSection(title, arr);
      done();
    })
    .catch(err => {
      console.error(refName, err);
      done(); // กันหน้าไม่ค้าง
    });
}

/* ---------- run search ---------- */

fetchCategory(
  "news",
  "News",
  d => match(d.title, d.desc)
);

fetchCategory(
  "comics",
  "Comics",
  d => match(d.title, d.desc)
);

fetchCategory(
  "games",
  "Games",
  d => match(d.title, d.desc)
);

fetchCategory(
  "fanarts",
  "Fanarts",
  d => match(d.credit, d.desc)
);
