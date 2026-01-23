const params = new URLSearchParams(location.search);
const keywordRaw = params.get("q") || "";
const keyword = keywordRaw.toLowerCase();

const titleEl = document.getElementById("searchTitle");
const box = document.getElementById("searchResults");

if (!keyword) {
  titleEl.innerText = "Please enter a search keyword.";
  throw "";
}

titleEl.innerText = `Search result for "${keywordRaw}"`;

const db = firebase.database();
let total = 0;
let loaded = 0;
const NEED = 2; // 🔥 เหลือแค่ news + fanarts

function match(...txt) {
  return txt.some(t => t && t.toLowerCase().includes(keyword));
}

function renderSection(title, items) {
  if (items.length === 0) return;

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
      box.innerHTML = "<p style='margin:10px'>No results found.</p>";
    }
  }
}

/* ===== NEWS ===== */
db.ref("news").once("value", s => {
  const arr = [];
  s.forEach(c => {
    const d = c.val();
    if (match(d.title, d.desc)) arr.push(d);
  });
  renderSection("News", arr);
  done();
});

/* ===== FANARTS ===== */
db.ref("fanarts").once("value", s => {
  const arr = [];
  s.forEach(c => {
    const d = c.val();
    if (match(d.credit, d.desc)) arr.push(d);
  });
  renderSection("Fanarts", arr);
  done();
});
