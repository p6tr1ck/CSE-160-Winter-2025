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
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    }  else {
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
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
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

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sample1");
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sample2");
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
  if (!u_Sampler3) {
    console.log("Failed to get the storage location of u_Sample3");
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
  canvas.addEventListener("mouseenter", () => {
    isMouseInsideCanvas = true;
  });

  canvas.addEventListener("mouseleave", () => {
    isMouseInsideCanvas = false;
    prevMouseX = null;
    prevMouseY = null;
  });
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseenter", () => {
    isMouseInsideCanvas = true;
  });
  canvas.addEventListener("mouseleave", () => {
    isMouseInsideCanvas = false;
    prevMouseX = null;
    prevMouseY = null;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "c") {
      addBlock();
    } else if (event.key === "v") {
      removeBlock();
    }
  });
}
let g_explosion = false;

function initTextures() {
  loadTexture("grass.jpg", 0);
  loadTexture("sky.png", 1);
  loadTexture("diamond.png", 2);
  loadTexture("grass_texture.jpg", 3);
}

// Generic function to load textures
function loadTexture(src, texUnit) {
  var image = new Image();
  image.onload = function () {
    sendImageToTexture(image, texUnit);
  };
  image.src = src;
}

function sendImageToTexture(image, texUnit) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + texUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (texUnit === 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (texUnit === 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (texUnit === 2) {
    gl.uniform1i(u_Sampler2, 2);
  } else if (texUnit === 3) {
    gl.uniform1i(u_Sampler3, 3);
  }
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

var g_map = [
  [1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 3, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 5, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 2, 0],
  [1, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0],
  [2, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3],
];

let worldBlocks = [];
function drawDiamondBlocks() {
  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map.length; y++) {
      if (g_map[x][y] == 1) {
        var body = new Cube();
        body.textureNum = 2;
        body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.translate(x - 4, -0.75, y - 4);
        body.renderFast();
      }
    }
  }
}

function drawMap() {
  for (let i = 0; i < worldBlocks.length; i++) {
    let block = worldBlocks[i];
    var cube = new Cube();
    cube.textureNum = 2;
    cube.matrix.translate(block.x, block.y, block.z);
    cube.renderFast();
  }
}

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
  drawDiamondBlocks();
  drawMap();
  drawRain();
  drawGrassBiome();

  // draw floor
  for (let i = -16; i <= 16; i++) {
    for (let j = -16; j <= 16; j++) {
      var floor = new Cube();
      floor.color = [1.0, 0.0, 0.0, 1.0];
      floor.textureNum = 0;
      floor.matrix.translate(i, -0.75, j);
      floor.matrix.scale(1, 0, 1);
      floor.renderFast();
    }
  }

  // draw sky
  var sky = new Cube();
  sky.color = [0.0, 0.0, 1.0, 1.0];
  sky.textureNum = 1;
  sky.matrix.scale(1000, 1000, 1000);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var body = new Cube();
  body.color = [0.6, 0.3, 0.0, 1.0];
  body.textureNum = -2;
  body.matrix.setTranslate(-0.2, -0.4, 0.0);
  body.matrix.scale(0.6, 0.3, 0.3);
  body.render();

  var head = new Cube();
  head.color = [0.6, 0.3, 0.0, 1.0];
  head.textureNum = -2;
  head.matrix.setTranslate(0.25, -0.2, 0);
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  var snout = new Cube();
  snout.color = [0.4, 0.2, 0.0, 1.0];
  snout.textureNum = -2;
  snout.matrix.setTranslate(0.5, -0.1, 0.08);
  snout.matrix.scale(0.12, 0.1, 0.12);
  snout.render();

  var leftEar = new Cube();
  leftEar.color = [0.5, 0.2, 0.0, 1.0];
  leftEar.textureNum = -2;
  leftEar.matrix.setTranslate(0.4, 0.1, 0.25);
  leftEar.matrix.scale(0.08, 0.15, 0.05);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = [0.5, 0.2, 0.0, 1.0];
  rightEar.textureNum = -2;
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
    upperLeg.textureNum = -2;
    upperLeg.color = [0.5, 0.2, 0.0, 1.0];
    upperLeg.matrix.setTranslate(
      legPositions[i][0],
      legPositions[i][1],
      legPositions[i][2]
    );
    upperLeg.matrix.scale(0.1, 0.2, 0.1);
    upperLeg.render();

    let lowerLeg = new Cube();
    lowerLeg.textureNum = -2;
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
  tail.textureNum = -2;
  tail.color = [0.5, 0.2, 0.0, 1.0];
  tail.matrix.setTranslate(-0.2, -0.1, 0.05);
  tail.matrix.rotate(15 * Math.sin(g_seconds), 0, 0, 1); // wagging
  tail.matrix.scale(0.08, 0.3, 0.08);
  tail.render();

  var leftEye = new Cube();
  leftEye.textureNum = -2;
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix.setTranslate(0.53, 0.02, 0.2);
  leftEye.matrix.scale(0.03, 0.05, 0.05);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.textureNum = -2;
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
  // canvas.onmousedown = click;
  // canvas.onmousemove = function (ev) {
  //   if (ev.buttons == 1) click(ev);
  // };
  camera = new Camera();
  document.onkeydown = keydown;
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
  generateRain();
  generateGrassBiome();
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
  updateRain();
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

let prevMouseX = null;
let prevMouseY = null;
let mouseSensitivity = 0.2;
let isMouseInsideCanvas = false;

function onMouseMove(event) {
  if (!isMouseInsideCanvas) return;

  if (prevMouseX === null || prevMouseY === null) {
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
    return;
  }

  let dx = event.clientX - prevMouseX; // left and right movement
  let dy = event.clientY - prevMouseY; // up and down movement

  prevMouseX = event.clientX;
  prevMouseY = event.clientY;

  camera.rotateYaw(-dx * mouseSensitivity); // horizontal rotation
  camera.rotatePitch(-dy * mouseSensitivity); // vertical rotation

  renderScene();
}

function addBlock() {
  let pos = camera.getBlockInFront();

  let maxHeight = -0.75;
  for (let i = 0; i < worldBlocks.length; i++) {
    if (worldBlocks[i].x === pos.x && worldBlocks[i].z === pos.z) {
      maxHeight = Math.max(maxHeight, worldBlocks[i].y);
    }
  }

  worldBlocks.push({ x: pos.x, y: maxHeight + 1, z: pos.z });
  renderScene();
}

function removeBlock() {
  let pos = camera.getBlockInFront();

  let maxHeight = -0.75; // Default ground height
  let maxIndex = -1;

  for (let i = 0; i < worldBlocks.length; i++) {
    if (worldBlocks[i].x === pos.x && worldBlocks[i].z === pos.z) {
      if (worldBlocks[i].y > maxHeight) {
        maxHeight = worldBlocks[i].y;
        maxIndex = i;
      }
    }
  }

  if (maxIndex !== -1) {
    worldBlocks.splice(maxIndex, 1);
    renderScene();
  }
}

let rainDrops = [];

function generateRain() {
  for (let i = 0; i < 30; i++) {
    rainDrops.push({
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 10 + 5,
      z: (Math.random() - 0.5) * 20,
      speed: Math.random() * 0.1 + 0.1,
    });
  }
}

function updateRain() {
  for (let drop of rainDrops) {
    drop.y -= drop.speed;
    if (drop.y < -0.7) {
      // Reset when hitting the ground
      drop.y = Math.random() * 10 + 5;
      drop.x = (Math.random() - 0.5) * 20;
      drop.z = (Math.random() - 0.5) * 20;
    }
  }
}

function drawRain() {
  for (let drop of rainDrops) {
    let rain = new Cube();
    rain.color = [0.5, 0.5, 1.0, 0.8];
    rain.textureNum = -2;
    rain.matrix.translate(drop.x, drop.y, drop.z);
    rain.matrix.scale(0.05, 0.3, 0.05);
    rain.render();
  }
}
let grassBlocks = []; // Store static grass blocks

function generateGrassBiome() {
  let biomeSize = 4; // Defines a 4x4 area
  let startX = -8;
  let startZ = -8;

  for (let x = startX; x < startX + biomeSize; x++) {
    for (let z = startZ; z < startZ + biomeSize; z++) {
      let grassHeight = Math.floor(Math.random() * 3) + 1; // Random height (1-3 blocks)

      for (let h = 0; h < grassHeight; h++) {
        grassBlocks.push({ x, y: -0.75 + h, z }); // Store in array
      }
    }
  }
}

function drawGrassBiome() {
  for (let block of grassBlocks) {
    let grassBlock = new Cube();
    grassBlock.textureNum = 3; // Assuming texture 3 is grass
    grassBlock.matrix.translate(block.x, block.y, block.z);
    grassBlock.renderFast();
  }
}
