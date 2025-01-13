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
  ctx.fillStyle = "black"; // set a blue color
  ctx.fillRect(0, 0, 400, 400); // fill a rectangle with the color
  const v1 = new Vector3([1,2,0]);
  drawVector(v1, "red");
}


function drawVector(v, color) {
  console.log(v, color);
  var canvas = document.getElementById("example");
  var ctx = canvas.getContext("2d");
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, canvas.height / 2);
  ctx.lineTo(220, 220);
  ctx.stroke();

}

main();