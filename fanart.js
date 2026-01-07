var fanarts = [];
var page = 1;
var perPage = 9;

var db = firebase.database();

db.ref("fanarts").on("value", function(snapshot){
  fanarts = [];
  snapshot.forEach(function(child){
    fanarts.push(child.val());
  });
  render();
});

function render(){
  var grid = document.getElementById("fanart-grid");
  if (!grid) return;

  grid.innerHTML = "";

  var reversed = fanarts.slice().reverse();
  var totalPage = Math.max(1, Math.ceil(reversed.length / perPage));

  var start = (page - 1) * perPage;
  var items = reversed.slice(start, start + perPage);

  items.forEach(function(item){
    var box = document.createElement("div");
    box.className = "fanart-box";

    var img = document.createElement("img");
    img.src = item.img;
    img.className = "fanart-thumb";
    img.loading = "lazy";

    img.onclick = function(){
      openModal(item.img, item.credit || "");
    };

    box.appendChild(img);
    grid.appendChild(box);
  });

  document.getElementById("page-info").innerText =
    "Page " + page + " / " + totalPage;
}

function nextPage(){
  if (page < Math.ceil(fanarts.length / perPage)) {
    page++;
    render();
  }
}

function prevPage(){
  if (page > 1) {
    page--;
    render();
  }
}

function openModal(src, credit){
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-img").src = src;
  document.getElementById("modal-credit").innerText = credit;
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}
