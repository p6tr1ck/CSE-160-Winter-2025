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
let g_jointAngle = 0;
let g_magentaAngle = 0;
let g_tail = 0;
let g_tailAnimation = false;
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

function addActionsForHtmlUI() {
  document.getElementById("animationYellowOffButton").onclick = function () {
    g_tailAnimation = false;
  };
  document.getElementById("animationYellowOnButton").onclick = function () {
    g_tailAnimation = true;
  };

  document
    .getElementById("jointSlide")
    .addEventListener("mousemove", function () {
      g_jointAngle = this.value;
      renderScene();
    });

  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderScene();
    });
}
let g_explosion = false;

var g_shapesList = [];
function click(ev) {
  if (ev.shiftKey) {
    g_explosion = !g_explosion;
    renderScene();
    return;
  }

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

  renderScene();
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
function renderScene() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var offset = g_explosion ? 0.5 : 0;

  var body = new Cube();
  body.color = [0.6, 0.3, 0.0, 1.0];
  body.matrix.setTranslate(-0.2, -0.4 + offset, 0.0);
  body.matrix.scale(0.6, 0.3, 0.3);
  body.render();

  var head = new Cube();
  head.color = [0.6, 0.3, 0.0, 1.0];
  head.matrix.setTranslate(0.25, -0.2 + offset * 0.4, 0);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  var snout = new Cube();
  snout.color = [0.4, 0.2, 0.0, 1.0];
  snout.matrix.setTranslate(0.5, -0.1 + offset, 0.08);
  snout.matrix.scale(0.12, 0.1, 0.12);
  snout.render();

  var leftEar = new Cone(0.05, 0.1, 20);
  leftEar.color = [0.5, 0.2, 0.0, 1.0];
  leftEar.matrix.setTranslate(0.5, 0.1 + offset, 0.25);
  leftEar.render();

  var rightEar = new Cone(0.05, 0.1, 20);
  rightEar.color = [0.5, 0.2, 0.0, 1.0];
  rightEar.matrix.setTranslate(0.5, 0.1 + offset, 0.05);
  rightEar.render();

  let legPositions = [
    [-0.2, -0.6, 0.2], // bottom right
    [0.3, -0.6, 0.2], // top right
    [-0.2, -0.6, 0], // bottom left
    [0.3, -0.6, 0], // top left
  ];
  for (let i = 0; i < 4; i++) {
    let upperLeg = new Cube();
    upperLeg.color = [0.5, 0.2, 0.0, 1.0];
    upperLeg.matrix.setTranslate(
      legPositions[i][0] + (g_explosion ? (i % 2 === 0 ? -0.3 : 0.3) : 0),
      legPositions[i][1] + offset,
      legPositions[i][2]
    );
    upperLeg.matrix.scale(0.1, 0.2, 0.1);
    upperLeg.render();

    let lowerLeg = new Cube();
    lowerLeg.color = [0.5, 0.2, 0.0, 1.0];

    lowerLeg.matrix.setTranslate(
      legPositions[i][0],
      legPositions[i][1] - 0.2,
      legPositions[i][2]
    );

    lowerLeg.matrix.rotate(g_jointAngle, 0, 0, 1);

    lowerLeg.matrix.scale(0.1, 0.2, 0.1);
    lowerLeg.render();

    let paw = new Cube();
    paw.color = [0.4, 0.2, 0.0, 1.0];
    paw.matrix.setTranslate(
      legPositions[i][0] + 0.02,
      legPositions[i][1] - 0.2,
      legPositions[i][2]
    );
    paw.matrix.rotate(g_jointAngle, 0, 0, 1);
    paw.matrix.scale(0.12, 0.05, 0.12);
    paw.render();
  }

  var tail = new Cube();
  tail.color = [0.5, 0.2, 0.0, 1.0];

  tail.matrix.setTranslate(-0.2 - offset, -0.1, 0.05);
  tail.matrix.rotate(-g_tail, 0, 0, 1);

  tail.matrix.scale(0.08, 0.3, 0.08);
  tail.render();

  var leftEye = new Cube();
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix.setTranslate(0.53, 0.02, 0.2);
  leftEye.matrix.scale(0.03, 0.05, 0.05);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0, 0, 0, 1];
  rightEye.matrix.setTranslate(0.53, 0.02, 0.05);
  rightEye.matrix.scale(0.03, 0.05, 0.05);
  rightEye.render();

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
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_tailAnimation) {
    g_tail = 45 * Math.sin(g_seconds);
  } else {
    g_tail = 0;
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
