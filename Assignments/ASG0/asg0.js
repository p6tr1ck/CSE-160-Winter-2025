import { Vector3 } from './lib/cuon-matrix-cse160.js';
let v1, v2;

function main() {
  // retrieve <canvas> element
  var canvas = document.getElementById("example");

  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // // get rendering context for 2d
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // fill a rectangle with the color
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

function createVectors() {
  const x1 = document.getElementById("x1");
  const y1 = document.getElementById("y1");
  const x2 = document.getElementById("x2");
  const y2 = document.getElementById("y2");
  v1 = new Vector3([x1.value, y1.value, 0]);
  v2 = new Vector3([x2.value, y2.value, 0]);
}


function handleDrawEvent() {
  clearRect();
  createVectors();
  drawVector(v1, "red");
  drawVector(v2, "blue");
}
function handleDrawOperationEvent() {
  createVectors();
  const operation = document.getElementById('operation').value;
  if (operation === 'add' || operation === 'sub' || operation === 'normalize') {
    handleDrawEvent();
    drawVector(v1[operation](v2), "green")
  } else if (operation === 'magnitude'){
    console.log(`Magnitude v1: ${v1.magnitude()}`)
    console.log(`Magnitude v2: ${v2.magnitude()}`)
  } else if (operation == 'angleBetween') {
    console.log(`Angle: ${Vector3.dot(v1, v2)}`);
  } else {
    clearRect();
    const scalar = document.getElementById("scalar").value;
    drawVector(v1[operation](scalar), "green");
    drawVector(v2[operation](scalar), "green");
  }
}


main();
const draw1 = document.getElementById("draw1");
const draw2 = document.getElementById("draw2");
draw1.addEventListener("click", handleDrawEvent);
draw2.addEventListener("click", handleDrawOperationEvent)