import { Vector3 } from './lib/cuon-matrix-cse160.js';

function main() {
  // retrieve <canvas> element
  var canvas = document.getElementById("example");

  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // // get rendering context for 2dcg
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400); // fill a rectangle with the color
}

function clearRect() {
  var canvas = document.getElementById("example");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 400, 400)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400);
}


function handleDrawEvent() {
  clearRect();
  const x = document.getElementById("x");
  const y = document.getElementById("y");
  const v1 = new Vector3([x.value, y.value, 0]);
  var canvas = document.getElementById("example");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 400, 400)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400);
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - (v1.elements[0] * 20), cy + (v1.elements[1] * 20));
  ctx.stroke();
}



main()
const draw = document.getElementById("draw")
draw.addEventListener("click", handleDrawEvent)