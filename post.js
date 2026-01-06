var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var drawing = false;
var tool = "pen";
var mode = "draw";

canvas.style.touchAction = "none";

// พื้นหลังขาว
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 🔹 ตำแหน่ง pointer (เมาส์ / ปากกา / นิ้ว)
function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// ===== POINTER EVENTS =====
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

  if (tool === "eraser") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 30;
  } else {
    ctx.strokeStyle = document.getElementById("color").value;
    ctx.lineWidth = 5;
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  var p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

canvas.addEventListener("pointerup", stopDraw);
canvas.addEventListener("pointerleave", stopDraw);
canvas.addEventListener("pointercancel", stopDraw);

function stopDraw() {
  drawing = false;
}

function setTool(t) {
  tool = t;
}

// ===== NAME =====
document.getElementById("artistName").onkeyup = function () {
  document.getElementById("postBtn").disabled =
    this.value.trim() === "";
};

// ===== IMPORT IMAGE =====
document.getElementById("fileInput").onchange = function(e){
  var file = e.target.files[0];
  if (!file) return;

  var img = new Image();
  img.onload = function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var s = Math.min(canvas.width/img.width, canvas.height/img.height);
    ctx.drawImage(
      img,
      (canvas.width-img.width*s)/2,
      (canvas.height-img.height*s)/2,
      img.width*s,
      img.height*s
    );
  };
  img.src = URL.createObjectURL(file);
};

// ===== POST =====
function postImage() {
  var name = document.getElementById("artistName").value.trim();
  if (!name) {
    alert("Please enter your name");
    return;
  }

  var imgData = canvas.toDataURL("image/png");

  firebase.database().ref("fanarts").push({
    img: imgData,
    credit: "By " + name,
    time: Date.now()
  }, function (err) {
    if (err) {
      alert("Post failed");
    } else {
      window.location.href = "fanarts.html";
    }
  });
}

