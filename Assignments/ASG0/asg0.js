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


function drawVector(v, color) {
  var canvas = document.getElementById("example");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  var ctx = canvas.getContext("2d");

  // draw the first vector
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (v.elements[0] * 20), cy - (v.elements[1] * 20));
  ctx.stroke();

}


function handleDrawEvent() {
  clearRect();
  const x1 = document.getElementById("x1");
  const y1 = document.getElementById("y1");
  const x2 = document.getElementById("x2");
  const y2 = document.getElementById("y2");
  const v1 = new Vector3([x1.value, y1.value, 0]);
  const v2 = new Vector3([x2.value, y2.value, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

}



main()
const draw = document.getElementById("draw")
draw.addEventListener("click", handleDrawEvent)