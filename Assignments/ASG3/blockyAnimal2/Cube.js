class Cube {
  constructor() {
    this.type = "cube";
    // this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    // this.size = 5.0;
    // this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }
  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front
    drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3]
    );

    // Top
    drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
    drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.8,
      rgba[1] * 0.8,
      rgba[2] * 0.8,
      rgba[3]
    );

    // Right
    drawTriangle3D([1, 1, 0, 1, 1, 1, 1, 0, 0]);
    drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.7,
      rgba[1] * 0.7,
      rgba[2] * 0.7,
      rgba[3]
    );

    // Left
    drawTriangle3D([0, 1, 0, 0, 1, 1, 0, 0, 0]);
    drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 0, 1]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.6,
      rgba[1] * 0.6,
      rgba[2] * 0.6,
      rgba[3]
    );

    // Bottom
    drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);
    drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.5,
      rgba[1] * 0.5,
      rgba[2] * 0.5,
      rgba[3]
    );

    // Back
    drawTriangle3D([0, 0, 1, 1, 1, 1, 1, 0, 1]);
    drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);
  }

  // renderFast() {
  //   var rgba = this.color;
  //   gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  //   gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

  //   var allverts = [];

  //   // Front of cube
  //   allverts = allverts.concat([0, 0, 0, 1, 1, 0, 1, 0, 0]);
  //   allverts = allverts.concat([0, 0, 0, 0, 1, 0, 1, 1, 0]);

  //   // Top of cube
  //   allverts = allverts.concat([0, 1, 0, 0, 1, 1, 1, 1, 1]);
  //   allverts = allverts.concat([0, 1, 0, 1, 1, 1, 1, 1, 0]);

  //   // Right of cube
  //   allverts = allverts.concat([1, 1, 0, 1, 1, 1, 1, 0, 0]);
  //   allverts = allverts.concat([1, 0, 0, 1, 1, 1, 1, 0, 1]);

  //   // Left of cube
  //   allverts = allverts.concat([0, 1, 0, 0, 1, 1, 0, 0, 0]);
  //   allverts = allverts.concat([0, 0, 0, 0, 0, 1, 1, 0, 0]);

  //   // Bottom of cube
  //   allverts = allverts.concat([0, 0, 0, 0, 0, 1, 1, 0, 1]);
  //   allverts = allverts.concat([0, 0, 0, 1, 0, 1, 1, 0, 0]);

  //   // Back of cube
  //   allverts = allverts.concat([0, 0, 1, 1, 1, 1, 1, 0, 1]);
  //   allverts = allverts.concat([0, 0, 1, 0, 1, 1, 1, 1, 1]);
  //   drawTriangles3DUV(allverts);
  // }
  renderFast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var allverts = [
      // Front face
      0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1,
      0, 0, 0, 0, 0,

      // Back face
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1,
      0, 0, 1, 0, 0,

      // Top face
      0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1,
      0, 1, 0, 0, 0,

      // Bottom face
      0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0,

      // Left face
      0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0,

      // Right face
      1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1,
      1, 0, 0, 0, 0,
    ];

    drawTriangles3DUV(allverts);
  }
}
