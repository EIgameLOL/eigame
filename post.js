var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var drawing = false;
var tool = "pen";

// ป้องกันหน้าจอเลื่อนบนมือถือ
canvas.style.touchAction = "none";

// พื้นหลังขาว
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// ===== POINTER EVENTS (เมาส์ + นิ้ว + ปากกา) =====
canvas.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  drawing = true;
  ctx.beginPath();
  var p = getPos(e);
  ctx.moveTo(p.x, p.y);
});

canvas.addEventListener("pointermove", function (e) {
  if (!drawing) return;
  e.preventDefault();

  ctx.globalCompositeOperation = "source-over";

  if (tool === "eraser") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 30;
  } else {
    ctx.strokeStyle = document.getElementById("color").value;
    ctx.lineWidth = 5;
  }

  var p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

canvas.addEventListener("pointerup", stopDraw);
canvas.addEventListener("pointercancel", stopDraw);
canvas.addEventListener("pointerleave", stopDraw);

function stopDraw() {
  drawing = false;
}

function setTool(t) {
  tool = t;
}

// ===== NAME INPUT =====
document.getElementById("artistName").addEventListener("input", function () {
  document.getElementById("postBtn").disabled =
    this.value.trim() === "";
});

// ===== IMPORT IMAGE =====
document.getElementById("fileInput").onchange = function (e) {
  var file = e.target.files[0];
  if (!file) return;

  var img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var s = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );

    ctx.drawImage(
      img,
      (canvas.width - img.width * s) / 2,
      (canvas.height - img.height * s) / 2,
      img.width * s,
      img.height * s
    );
  };
  img.src = URL.createObjectURL(file);
};

// ===== FIREBASE =====
var db = firebase.database();
var storage = firebase.storage();

function postImage() {
  var name = document.getElementById("artistName").value.trim();
  if (!name) return;

  canvas.toBlob(function (blob) {
    var filename = "fanart_" + Date.now() + ".png";
    var ref = storage.ref("fanarts/" + filename);

    ref.put(blob).then(function () {
      ref.getDownloadURL().then(function (url) {
        db.ref("fanarts").push({
          img: url,
          credit: "By " + name,
          time: Date.now()
        });

        window.location.href = "fanarts.html";
      });
    });
  });
}
