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
  gl = getWebGLContext(canvas);
  
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


let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;

function addActionsForHtmlUI() {
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0,0.0,0.0,1.0]; };

  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value });
}



var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);

  g_points.push([x,y]);
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selectedSize);
  // if (x >= 0.0 && y >= 0.0) {
  //   g_colors.push([1.0, 0.0, 0.0, 1.0])
  // } else if (x < 0.0 && y < 0.0) {
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);
  // } else {
  //   g_colors.push([1.0,1.0,1.0,1.0]);
  // }
  
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
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for (var i = 0; i < len; i++) {
    var xy = g_points[i];
    var rgba = g_colors[i];
    var size = g_sizes[i];

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  canvas.onmousedown = click;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

