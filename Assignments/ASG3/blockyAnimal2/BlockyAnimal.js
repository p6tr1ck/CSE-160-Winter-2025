var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  canvas = document.getElementById("webgl");
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  // u_Size = gl.getUniformLocation(gl.program, "u_Size");
  // if (!u_Size) {
  //   console.log("Failed to get the storage location of u_Size");
  //   return;
  // }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let segments = 10;

function drawTop() {
  const blue = [0.0, 0.0, 1.0, 1.0];
  drawTriangleColor([0.0, 0.6, 0.0, 0.4, 0.1, 0.4], blue);
  drawTriangleColor([0.2, 0.6, 0.1, 0.4, 0.0, 0.6], blue);
  drawTriangleColor([0.2, 0.6, 0.1, 0.4, 0.2, 0.4], blue);

  drawTriangleColor([0.0, 0.6, 0.0, 0.4, -0.1, 0.4], blue);
  drawTriangleColor([0.0, 0.6, -0.2, 0.6, -0.1, 0.4], blue);
  drawTriangleColor([-0.2, 0.4, -0.2, 0.6, -0.1, 0.4], blue);

  drawTriangleColor([0.2, 0.6, 0.2, 0.4, 0.3, 0.4], blue);
  drawTriangleColor([0.4, 0.6, 0.3, 0.4, 0.2, 0.6], blue);
  drawTriangleColor([0.4, 0.6, 0.3, 0.4, 0.4, 0.4], blue);

  drawTriangleColor([-0.2, 0.6, -0.2, 0.4, -0.3, 0.4], blue);
  drawTriangleColor([-0.2, 0.6, -0.4, 0.6, -0.3, 0.4], blue);
  drawTriangleColor([-0.4, 0.4, -0.4, 0.6, -0.3, 0.4], blue);

  drawTriangleColor([-0.6, 0.4, -0.4, 0.4, -0.4, 0.6], blue);
  drawTriangleColor([0.6, 0.4, 0.4, 0.4, 0.4, 0.6], blue);
}

function drawBottom() {
  const blue = [0.0, 0.0, 1.0, 1.0];
  drawTriangleColor([0, 0.4, 0, -0.5, 0.2, 0.4], blue);
  drawTriangleColor([0.4, 0.6, 0, -0.5, 0.2, 0.4], blue);
  drawTriangleColor([0.4, 0.6, 0, -0.5, 0.6, 0.4], blue);

  drawTriangleColor([0, 0.4, 0, -0.5, -0.2, 0.4], blue);
  drawTriangleColor([-0.4, 0.6, 0, -0.5, -0.2, 0.4], blue);
  drawTriangleColor([-0.4, 0.6, 0, -0.5, -0.6, 0.4], blue);
}

function draw() {
  drawTop();
  drawBottom();
}

// function removeActiveColors() {
//   const colors = document.querySelectorAll(".color");
//   colors.forEach((color) => {
//     if ("active" === color.classList[1]) {
//       color.classList.remove("active");
//       color.classList.add("inactive");
//     }
//   });
// }

// function changeCurrent() {
//   const currentColor = document.getElementById("current");
//   currentColor.style.backgroundColor = `rgb(${g_selectedColor[0] * 255}, ${
//     g_selectedColor[1] * 255
//   }, ${g_selectedColor[2] * 255})`;
//   removeActiveColors();
//   currentColor.classList.remove("inactive");
//   currentColor.classList.add("active");
// }

function addActionsForHtmlUI() {
  // const green = document.getElementById("green");
  // const red = document.getElementById("red");
  // const current = document.getElementById("current");
  // green.onclick = function () {
  //   g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  //   removeActiveColors();
  //   this.classList.remove("inactive");
  //   this.classList.add("active");
  // };

  // red.onclick = function () {
  //   g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  //   removeActiveColors();
  //   this.classList.remove("inactive");
  //   this.classList.add("active");
  // };

  // current.onclick = function () {
  //   removeActiveColors();
  //   this.classList.remove("inactive");
  //   this.classList.add("active");
  // };

  // document.getElementById("clearButton").onclick = function () {
  //   g_shapesList = [];
  //   renderAllShapes();
  // };

  // document.getElementById("pointButton").onclick = function () {
  //   g_selectedType = POINT;
  // };
  // document.getElementById("triButton").onclick = function () {
  //   g_selectedType = TRIANGLE;
  // };
  // document.getElementById("circleButton").onclick = function () {
  //   g_selectedType = CIRCLE;
  // };

  // document.getElementById("redSlide").addEventListener("mouseup", function () {
  //   g_selectedColor[0] = this.value / 100;
  //   changeCurrent();
  // });
  // document
  //   .getElementById("greenSlide")
  //   .addEventListener("mouseup", function () {
  //     g_selectedColor[1] = this.value / 100;
  //     changeCurrent();
  //   });
  // document.getElementById("blueSlide").addEventListener("mouseup", function () {
  //   g_selectedColor[2] = this.value / 100;
  //   changeCurrent();
  // });
  // document.getElementById("image").onclick = function () {
  //   draw();
  // };

  // document.getElementById("sizeSlide").addEventListener("mouseup", function () {
  //   g_selectedSize = this.value;
  // });
  // document
  //   .getElementById("segmentSlide")
  //   .addEventListener("mouseup", function () {
  //     segments = this.value;
  //   });
  document.getElementById("animationYellowOffButton").onclick = function () {
    g_yellowAnimation = false;
  };
  document.getElementById("animationYellowOnButton").onclick = function () {
    g_yellowAnimation = true;
  };

  document
    .getElementById("magentaSlide")
    .addEventListener("mousemove", function () {
      g_magentaAngle = this.value;
      renderAllShapes();
    });
  document
    .getElementById("yellowSlide")
    .addEventListener("mousemove", function () {
      g_yellowAngle = this.value;
      renderAllShapes();
    });

  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderAllShapes();
    });
}

var g_shapesList = [];
function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = segments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

// draw all the cubes in one place here
function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  var yellow = new Cube();
  yellow.color = [1, 1, 0, 1];
  yellow.matrix.setTranslate(0, -0.5, 0.0);
  yellow.matrix.rotate(-5, 1, 0, 0);
  yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);

  // if (g_yellowAnimation) {
  //   yellow.matrix.rotate(45 * Math.sin(g_seconds), 0, 0, 1);
  // } else {
  //   yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
  // }

  // leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, 0.7, 0.5);
  yellow.matrix.translate(-0.5, 0, 0);
  yellow.render();

  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  box.matrix.scale(0.3, 0.3, 0.3);
  box.matrix.translate(-0.5, 0, -0.001);
  // box.matrix.translate(-0.1, 0.1, 0.0, 0);
  // box.matrix.rotate(-30, 1, 0, 0);
  // box.matrix.scale(0.2, 0.4, 0.2);
  box.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    `ms: ${Math.floor(duration)} fps: ${Math.floor(10000 / duration) / 10}`,
    "numdot"
  );
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) click(ev);
  };
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = 45 * Math.sin(g_seconds);
  }
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log(`Failed to get ${htmlID} from HTML`);
    return;
  }
  htmlElm.innerHTML = text;
}
