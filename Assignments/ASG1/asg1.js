var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

var FSHADER_SOURCE = `
  precision mediump float; 
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`



let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


function setupWebGL() {
  canvas = document.getElementById('webgl');
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}


function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let segments = 10;

function drawTop() {
  const blue = [0.0,0.0,1.0,1.0]
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
  const blue = [0.0,0.0,1.0,1.0]
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

function removeActiveColors() {
  const colors = document.querySelectorAll('.color');
  colors.forEach((color) => {
    if ("active" === color.classList[1]) {
      color.classList.remove("active");
      color.classList.add("inactive");
    }
  })
}


function changeCurrent() {
  const currentColor = document.getElementById("current")
  currentColor.style.backgroundColor = `rgb(${g_selectedColor[0] * 255}, ${g_selectedColor[1] * 255}, ${g_selectedColor[2] * 255})`;
  removeActiveColors();
  currentColor.classList.remove('inactive');
  currentColor.classList.add('active');
}


function addActionsForHtmlUI() {
  const green = document.getElementById('green');
  const red = document.getElementById('red');
  const current = document.getElementById("current");
  green.onclick = function() { 
    g_selectedColor = [0.0,1.0,0.0,1.0]; 
    removeActiveColors();
    this.classList.remove("inactive");
    this.classList.add("active");
  };

  red.onclick = function () { 
    g_selectedColor = [1.0,0.0,0.0,1.0];
    removeActiveColors();
    this.classList.remove("inactive");
    this.classList.add("active");
  };

  current.onclick = function () { 
    removeActiveColors();
    this.classList.remove("inactive");
    this.classList.add("active");
  };

  document.getElementById('clearButton').onclick = function () { g_shapesList = []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE}

  document.getElementById('redSlide').addEventListener('mouseup', function() { 
    g_selectedColor[0] = this.value/100; 
    changeCurrent(); 
  });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { 
    g_selectedColor[1] = this.value/100; 
    changeCurrent(); 
  });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { 
    g_selectedColor[2] = this.value/100; 
    changeCurrent(); 
  });
  document.getElementById('image').onclick = function() { draw() }

  document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value });
  document.getElementById('segmentSlide').addEventListener('mouseup', function () { segments = this.value });
}

var g_shapesList = [];
function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = segments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  
  renderAllShapes();
}


function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}


function renderAllShapes() {
  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  var duration = performance.now() - startTime;
  sendTextToHTML(`numdot: ${len} ms: ${Math.floor(duration)} fps: ${Math.floor(10000/duration)/10}`, 'numdot');
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) (click (ev) )}
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}


function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log(`Failed to get ${htmlID} from HTML`);
    return;
  }
  htmlElm.innerHTML = text;
}