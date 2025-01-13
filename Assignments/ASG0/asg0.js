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
  const v1 = new Vector3([2.25,2.25,0]);
  drawVector(v1, "red");
}


function drawVector(v, color) {
  var canvas = document.getElementById("example");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  var ctx = canvas.getContext("2d");
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - (v.elements[0] * 20), cy + (v.elements[1] * 20));
  ctx.stroke();

}



main()