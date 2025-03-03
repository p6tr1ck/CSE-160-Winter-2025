var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  attribute vec3 a_Normal;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position; 
  }`;

var FSHADER_SOURCE = `
  precision mediump float; 
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
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

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    float specular = pow(max(dot(E, R), 0.0), 100.0);

    float attenuation = 1.0 / (1.0 + 0.02 * r + 0.002 * r * r);

    vec3 lightIntensity = vec3(2.0, 2.0, 2.0); // Stronger light

    vec3 diffuse = lightIntensity * vec3(gl_FragColor) * nDotL * 0.9;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    vec3 specularLight = lightIntensity * vec3(1.0, 1.0, 1.0) * specular * 5.0;
    vec3 finalColor = (specularLight + diffuse + ambient) * attenuation;
    
    if (u_lightOn) {
      if (u_whichTexture == -2) {
        gl_FragColor = vec4(finalColor, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }
  }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
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
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_NormalMatrix;

function setupWebGL() {
  canvas = document.getElementById("webgl");
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

  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storgae location fo a_Normal");
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

  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get the storage location of u_lightPos");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get the storage location of u_cameraPos");
    return;
  }

  // u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  // if (!u_NormalMatrix) {
  //   console.log("Failed to get the storage location of u_NormalMatrix");
  //   return;
  // }
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

  u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
  if (!u_lightOn) {
    console.log("Failed to get the storage location of u_lightOn");
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
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0, 1, -2];

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

  document.getElementById("normalOn").onclick = function () {
    g_normalOn = true;
  };

  document.getElementById("normalOff").onclick = function () {
    g_normalOn = false;
  };

  document.getElementById("lightOn").onclick = function () {
    g_lightOn = true;
  };

  document.getElementById("lightOff").onclick = function () {
    g_lightOn = false;
  };

  document
    .getElementById("lightSlideX")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[0] = this.value / 100;
        renderScene();
      }
    });
  document
    .getElementById("lightSlideY")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[1] = this.value / 100;
        renderScene();
      }
    });
  document
    .getElementById("lightSlideZ")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_lightPos[2] = this.value / 100;
        renderScene();
      }
    });

  // canvas.addEventListener("mouseleave", () => {
  //   isMouseInsideCanvas = false;
  //   prevMouseX = null;
  //   prevMouseY = null;
  // });
  // canvas.addEventListener("mousemove", onMouseMove);
  // canvas.addEventListener("mouseenter", () => {
  //   isMouseInsideCanvas = true;
  // });
  // canvas.addEventListener("mouseleave", () => {
  //   isMouseInsideCanvas = false;
  //   prevMouseX = null;
  //   prevMouseY = null;
  // });
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

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.x, camera.eye.y, camera.eye.z);
  gl.uniform1i(u_lightOn, g_lightOn);

  // draw sky
  var sky = new Cube();
  sky.color = [0.2, 0.2, 0.2, 1];
  sky.textureNum = -2;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-12, -12, -12);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  // sky.normalMatrix.setInverseOf(body.matrix).transpose();

  sky.render();

  var light = new Cube();
  light.textureNum = -2;
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(0.3, 0.3, 0.3);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  var sphere = new Sphere();
  sphere.color = [1.0, 0.0, 0.0, 1.0];
  sphere.matrix.translate(-1, -1.5, -1.5);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  sphere.matrix.translate(2, 0, 2);
  if (g_normalOn) sphere.textureNum = -3;
  sphere.render();

  var body = new Cube();
  body.color = [0.6, 0.3, 0.0, 1.0];
  body.textureNum = -2;
  body.matrix.setTranslate(-0.2, -0.4, 0.0);
  body.matrix.scale(0.6, 0.3, 0.3);
  body.normalMatrix.setInverseOf(body.matrix).transpose();
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
  // renderScene();
  requestAnimationFrame(tick);
  // generateRain();
  // generateGrassBiome();
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
  // if (g_tailAnimation) {
  //   g_tail = 45 * Math.sin(g_seconds);
  // } else {
  //   g_tail = 0;
  // }
  g_lightPos[0] = Math.cos(g_seconds);
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

// function onMouseMove(event) {
//   if (!isMouseInsideCanvas) return;

//   if (prevMouseX === null || prevMouseY === null) {
//     prevMouseX = event.clientX;
//     prevMouseY = event.clientY;
//     return;
//   }

//   let dx = event.clientX - prevMouseX; // left and right movement
//   let dy = event.clientY - prevMouseY; // up and down movement

//   prevMouseX = event.clientX;
//   prevMouseY = event.clientY;

//   camera.rotateYaw(-dx * mouseSensitivity); // horizontal rotation
//   camera.rotatePitch(-dy * mouseSensitivity); // vertical rotation

//   renderScene();
// }
