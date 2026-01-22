const params = new URLSearchParams(location.search);
const keyword = (params.get("q") || "").toLowerCase();

const titleEl = document.getElementById("searchTitle");
const box = document.getElementById("searchResults");

if(!keyword){
  titleEl.innerText = "Please enter a search keyword.";
  throw "";
}

let total = 0;

titleEl.innerText = `Search result for "${keyword}"`;

function match(...txt){
  return txt.some(t => t && t.toLowerCase().includes(keyword));
}

function addSection(title, html){
  if(!html) return;
  box.innerHTML += `<h3 class="page-title">${title}</h3>` + html;
}

const db = firebase.database();

/* ===== NEWS ===== */
db.ref("news").once("value", s=>{
  let html="";
  s.forEach(c=>{
    const d=c.val();
    if(match(d.title,d.desc)){
      total++;
      html+=`
      <div class="search-item">
        ${d.img?`<img src="${d.img}">`:""}
        <div class="search-text">
          <b>${d.title||""}</b><br>
          ${d.desc||""}
        </div>
      </div>`;
    }
  });
  addSection("News",html);
  update();
});

/* ===== FANARTS ===== */
db.ref("fanarts").once("value", s=>{
  let html="";
  s.forEach(c=>{
    const d=c.val();
    if(match(d.credit,d.desc)){
      total++;
      html+=`
      <div class="search-item">
        <img src="${d.img}">
        <div class="search-text">
          <b>${d.credit||""}</b><br>
          ${d.desc||""}
        </div>
      </div>`;
    }
  });
  addSection("Fanarts",html);
  update();
});

/* ===== COMICS ===== */
db.ref("comics").once("value", s=>{
  let html="";
  s.forEach(c=>{
    const d=c.val();
    if(match(d.title,d.desc)){
      total++;
      html+=`
      <div class="search-item">
        <img src="${d.img}">
        <div class="search-text">
          <b>${d.title||""}</b><br>
          ${d.desc||""}
        </div>
      </div>`;
    }
  });
  addSection("Comics",html);
  update();
});

/* ===== GAMES ===== */
db.ref("games").once("value", s=>{
  let html="";
  s.forEach(c=>{
    const d=c.val();
    if(match(d.title,d.desc)){
      total++;
      html+=`
      <div class="search-item">
        <img src="${d.img}">
        <div class="search-text">
          <b>${d.title||""}</b><br>
          ${d.desc||""}
        </div>
      </div>`;
    }
  });
  addSection("Games",html);
  update();
});

function update(){
  titleEl.innerText = `"${keyword}" (${total}) result found`;
}
