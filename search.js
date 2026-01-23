// ===== GET KEYWORD =====
const params = new URLSearchParams(location.search);
const keywordRaw = params.get("q") || "";
const keyword = keywordRaw.trim().toLowerCase();

const titleEl = document.getElementById("searchTitle");
const box = document.getElementById("searchResults");

if (!keyword) {
  titleEl.innerText = "Please enter a search keyword.";
  throw new Error("No keyword");
}

titleEl.innerText = `Search result for "${keywordRaw}"`;

// ===== FIREBASE =====
const db = firebase.database();

// ค้นหาเฉพาะหมวดที่มีจริง
const SOURCES = [
  { path: "news",    title: "News",    fields: ["title", "desc"] },
  { path: "fanarts", title: "Fanarts", fields: ["credit", "desc"] }
];

let total = 0;
let loaded = 0;
const NEED = SOURCES.length;

// ===== SMART MATCH =====
function matchText(text) {
  if (!text) return false;

  const t = text.toLowerCase();

  // แยกคำที่ผู้ใช้พิมพ์ เช่น "el game web"
  const words = keyword.split(/\s+/);

  // ถ้ามีคำใดคำหนึ่งตรง → ถือว่าผ่าน
  return words.some(w => t.includes(w));
}

// ===== RENDER =====
function renderSection(title, items) {
  if (items.length === 0) return;

  total += items.length;

  let html = `<div class="search-category"><h3>${title}</h3>`;

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
  box.insertAdjacentHTML("beforeend", html);
}

// ===== DONE =====
function done() {
  loaded++;
  if (loaded === NEED) {
    titleEl.innerText = `"${keywordRaw}" (${total}) result found`;
    if (total === 0) {
      box.innerHTML = "<p style='margin:10px'>No results found.</p>";
    }
  }
}

// ===== LOAD DATA =====
SOURCES.forEach(src => {
  db.ref(src.path).once("value")
    .then(snapshot => {
      const arr = [];

      snapshot.forEach(c => {
        const d = c.val();

        // ถ้า field ใด field หนึ่งตรง → เก็บ
        if (src.fields.some(f => matchText(d[f]))) {
          arr.push(d);
        }
      });

      renderSection(src.title, arr);
      done();
    })
    .catch(() => done());
});

function openZoom(src){
  const z = document.getElementById("zoom");
  const img = document.getElementById("zoomImg");
  img.src = src;
  z.style.display = "flex";
}

function closeZoom(){
  document.getElementById("zoom").style.display = "none";
}
