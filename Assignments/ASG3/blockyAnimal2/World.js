var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;
let camera;

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

  // u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  // if (!u_FragColor) {
  //   console.log("Failed to get the storage location of u_FragColor");
  //   return;
  // }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    return false;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
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
  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderScene();
    });
}
let g_explosion = false;

function initTextures() {
  // var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  // if (!u_Sampler0) {
  //   console.log("Failed to get the storage location of u_Sampler");
  //   return false;
  // }
  var image = new Image();
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function () {
    sendImageToTEXTURE0(image);
  };
  image.src = "sky.jpg";
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log("Finished loadTexture");
}

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

var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

// draw all the cubes in one place here
function renderScene() {
  var startTime = performance.now();
  var projMat = new Matrix4();
  projMat.setPerspective(camera.fov, canvas.width / canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    camera.eye.elements[0],
    camera.eye.elements[1],
    camera.eye.elements[2],
    camera.at.elements[0],
    camera.at.elements[1],
    camera.at.elements[2],
    camera.up.elements[0],
    camera.up.elements[1],
    camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw floor
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.translate(0, -0.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  var body = new Cube();
  body.color = [0.6, 0.3, 0.0, 1.0];
  body.matrix.setTranslate(-0.2, -0.4, 0.0);
  body.matrix.scale(0.6, 0.3, 0.3);
  body.render();

  // var body = new Cube();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.textureNum = 0;
  // body.matrix.setTranslate(-0.25, -0.75, 0.0);
  // body.matrix.rotate(-5, 1, 0, 0);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.render();

  var head = new Cube();
  head.color = [0.6, 0.3, 0.0, 1.0];
  head.matrix.setTranslate(0.25, -0.2, 0);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  var snout = new Cube();
  snout.color = [0.4, 0.2, 0.0, 1.0];
  snout.matrix.setTranslate(0.5, -0.1, 0.08);
  snout.matrix.scale(0.12, 0.1, 0.12);
  snout.render();

  var leftEar = new Cube();
  leftEar.color = [0.5, 0.2, 0.0, 1.0];
  leftEar.matrix.setTranslate(0.4, 0.1, 0.25);
  leftEar.matrix.scale(0.08, 0.15, 0.05);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = [0.5, 0.2, 0.0, 1.0];
  rightEar.matrix.setTranslate(0.4, 0.1, 0);
  rightEar.matrix.scale(0.08, 0.15, 0.05);
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
      legPositions[i][0],
      legPositions[i][1],
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
    lowerLeg.matrix.rotate(0, 1, 0, 0);
    lowerLeg.matrix.scale(0.1, 0.2, 0.1);
    lowerLeg.render();
  }

  var tail = new Cube();
  tail.color = [0.5, 0.2, 0.0, 1.0];
  tail.matrix.setTranslate(-0.2, -0.1, 0.05);
  tail.matrix.rotate(15 * Math.sin(g_seconds), 0, 0, 1); // wagging
  tail.matrix.scale(0.08, 0.3, 0.08);
  tail.render();

  var leftEye = new Cube();
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix.setTranslate(0.53, 0.02, 0.2);
  leftEye.matrix.scale(0.03, 0.05, 0.05);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0, 0, 0, 1]; // Black
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
  // canvas.onmousedown = click;
  // canvas.onmousemove = function (ev) {
  //   if (ev.buttons == 1) click(ev);
  // };
  camera = new Camera();
  document.onkeydown = keydown;
  initTextures();
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

function keydown(ev) {
  if (ev.keyCode == 87) {
    camera.moveForward();
  } else if (ev.keyCode == 83) {
    camera.moveBackwards();
  } else if (ev.keyCode == 65) {
    camera.moveLeft();
  } else if (ev.keyCode == 68) {
    camera.moveRight();
  } else if (ev.keyCode == 81) {
    camera.panLeft();
  } else if (ev.keyCode == 69) {
    camera.panRight();
  }
  renderScene();
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
