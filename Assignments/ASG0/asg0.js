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
  ctx.fillRect(120, 10, 150, 150); // fill a rectangle with the color
  const v1 = new Vector3([1,2,0]);

}


// function drawVector(v, color) {

// }

main();