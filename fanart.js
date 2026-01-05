var fanarts = [];
var page = 1;
var perPage = 9;

var db = firebase.database();

// โหลดข้อมูล public
db.ref("fanarts").on("value", function(snapshot){
  fanarts = [];
  snapshot.forEach(function(child){
    fanarts.push(child.val());
  });
  render();
});

function render() {
  var grid = document.getElementById("fanart-grid");
  grid.innerHTML = "";

  var reversed = fanarts.slice().reverse();
  var totalPage = Math.ceil(reversed.length / perPage);

  var start = (page - 1) * perPage;
  var items = reversed.slice(start, start + perPage);

  for (var i = 0; i < items.length; i++) {
    var img = document.createElement("img");
    img.src = items[i].img;
    img.className = "fanart-thumb";

    img.onclick = (function(src, credit){
      return function(){
        openModal(src, credit);
      };
    })(items[i].img, items[i].credit);

    grid.appendChild(img);
  }

  document.getElementById("page-info").innerHTML =
    "Page " + page + " / " + totalPage;
}

function nextPage() {
  if (page < Math.ceil(fanarts.length / perPage)) {
    page++;
    render();
  }
}

function prevPage() {
  if (page > 1) {
    page--;
    render();
  }
}

function openModal(src, credit) {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-img").src = src;
  document.getElementById("modal-credit").innerHTML = credit;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

document.getElementById("postBtn").onclick = function () {
  window.location.href = "post.html";
};