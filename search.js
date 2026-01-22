const params = new URLSearchParams(window.location.search);
const keyword = (params.get("q") || "").toLowerCase();

const titleEl = document.getElementById("searchTitle");
const resultBox = document.getElementById("searchResults");

let totalFound = 0;

// helper
function match(...texts){
  return texts.some(t => t && t.toLowerCase().includes(keyword));
}

function section(title, html){
  if(!html) return;
  resultBox.innerHTML += `<h3>${title}</h3>` + html;
}

const db = firebase.database();

/* ---------- NEWS ---------- */
db.ref("news").once("value", snap => {
  let html = "";
  snap.forEach(c => {
    const d = c.val();
    if(match(d.title, d.desc)){
      totalFound++;
      html += `
      <div class="search-item">
        <img src="${d.img}">
        <div>
          <b>${d.title}</b><br>
          ${d.desc || ""}
        </div>
      </div>`;
    }
  });
  section("News", html);
  updateTitle();
});

/* ---------- FANARTS ---------- */
db.ref("fanarts").once("value", snap => {
  let html = "";
  snap.forEach(c => {
    const d = c.val();
    if(match(d.credit, d.desc)){
      totalFound++;
      html += `
      <div class="search-item">
        <img src="${d.img}">
        <div>
          <b>${d.credit}</b><br>
          ${d.desc || "No description."}
        </div>
      </div>`;
    }
  });
  section("Fanarts", html);
  updateTitle();
});

/* ---------- COMICS ---------- */
db.ref("comics").once("value", snap => {
  let html = "";
  snap.forEach(c => {
    const d = c.val();
    if(match(d.title, d.desc)){
      totalFound++;
      html += `
      <div class="search-item">
        <a href="${d.link}">
          <img src="${d.img}">
        </a>
        <div>
          <b>${d.title}</b><br>
          ${d.desc || ""}
        </div>
      </div>`;
    }
  });
  section("Comics", html);
  updateTitle();
});

/* ---------- GAMES ---------- */
db.ref("games").once("value", snap => {
  let html = "";
  snap.forEach(c => {
    const d = c.val();
    if(match(d.title, d.desc)){
      totalFound++;
      html += `
      <div class="search-item">
        <a href="${d.link}">
          <img src="${d.img}">
        </a>
        <div>
          <b>${d.title}</b><br>
          ${d.desc || ""}
        </div>
      </div>`;
    }
  });
  section("Games", html);
  updateTitle();
});

/* ---------- RESULT TITLE ---------- */
function updateTitle(){
  titleEl.innerText = `"${keyword}" (${totalFound}) result found`;
}