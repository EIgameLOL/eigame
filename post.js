var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var drawing = false;
var tool = "pen";
var mode = "draw";
var brushSize = 9;

canvas.style.touchAction = "none";

/* ===== ??????????? ===== */
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

/* ===== MODE ===== */
function setMode(m) {
  mode = m;
  document.getElementById("draw-area").style.display =
    m === "draw" ? "block" : "none";
  document.getElementById("import-area").style.display =
    m === "import" ? "block" : "none";
}

/* ===== TOOL ===== */
function setTool(t) {
  tool = t;
}

/* ===== BRUSH SIZE ===== */
document.getElementById("brushSize").addEventListener("input", function () {
  brushSize = parseInt(this.value);
});

/* ===== POSITION ===== */
function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(e.clientX - rect.left),
    y: Math.floor(e.clientY - rect.top)
  };
}

/* ===== POINTER DOWN ===== */
canvas.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  var p = getPos(e);

  if (tool === "fill") {
    floodFill(
      p.x,
      p.y,
      hexToRgba(document.getElementById("color").value)
    );
    return;
  }

  drawing = true;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});

/* ===== POINTER MOVE ===== */
canvas.addEventListener("pointermove", function (e) {
  if (!drawing) return;
  e.preventDefault();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushSize;

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = document.getElementById("color").value;
  }

  var p = getPos(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

/* ===== STOP DRAW ===== */
canvas.addEventListener("pointerup", stopDraw);
canvas.addEventListener("pointerleave", stopDraw);
canvas.addEventListener("pointercancel", stopDraw);

function stopDraw() {
  drawing = false;
  ctx.globalCompositeOperation = "source-over";
}

/* ===== FLOOD FILL (?????) ===== */
function floodFill(x, y, fillColor) {
  var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = img.data;
  var w = canvas.width;
  var h = canvas.height;

  var index = (y * w + x) * 4;
  var target = [
    data[index],
    data[index + 1],
    data[index + 2],
    data[index + 3]
  ];

  if (colorsMatch(target, fillColor)) return;

  var stack = [[x, y]];

  while (stack.length) {
    var [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;

    var i = (cy * w + cx) * 4;
    var cur = [
      data[i],
      data[i + 1],
      data[i + 2],
      data[i + 3]
    ];

    if (!colorsMatch(cur, target)) continue;

    data[i] = fillColor[0];
    data[i + 1] = fillColor[1];
    data[i + 2] = fillColor[2];
    data[i + 3] = 255;

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  ctx.putImageData(img, 0, 0);
}

/* ===== COLOR UTILS ===== */
function colorsMatch(a, b) {
  return (
    a[0] === b[0] &&
    a[1] === b[1] &&
    a[2] === b[2] &&
    a[3] === b[3]
  );
}

function hexToRgba(hex) {
  return [
    parseInt(hex.substr(1, 2), 16),
    parseInt(hex.substr(3, 2), 16),
    parseInt(hex.substr(5, 2), 16),
    255
  ];
}

/* ===== NAME CHECK ===== */
document.getElementById("artistName").onkeyup = function () {
  document.getElementById("postBtn").disabled =
    this.value.trim() === "";
};

/* ===== IMPORT IMAGE ===== */
document.getElementById("fileInput").onchange = function (e) {
  var file = e.target.files[0];
  if (!file) return;

  var img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

/* ===== POST ===== */
function postImage() {
  var name = document.getElementById("artistName").value.trim();
  var desc = document.getElementById("artDesc").value.trim();

  if (!name) {
    alert("Please enter your name");
    return;
  }

  var imgData = canvas.toDataURL("image/png");

  firebase.database().ref("fanarts").push({
    img: imgData,
    credit: "Art by: " + name,
    desc: desc || "",
    time: Date.now()
  }, function (err) {
    if (err) {
      alert("Post failed");
    } else {
      window.location.href = "fanarts.html";
    }
  });
}
