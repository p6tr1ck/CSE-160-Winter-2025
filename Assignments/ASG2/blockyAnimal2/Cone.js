class Cone {
  constructor(radius = 0.05, height = 0.1, segments = 20) {
    this.radius = radius;
    this.height = height;
    this.segments = segments;
    this.color = [0.5, 0.2, 0.0, 1.0]; // brown for ears
    this.matrix = new Matrix4();
  }

  render() {
    gl.uniform4f(
      u_FragColor,
      this.color[0],
      this.color[1],
      this.color[2],
      this.color[3]
    );
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let angleStep = (2 * Math.PI) / this.segments;

    for (let i = 0; i < this.segments; i++) {
      let theta1 = i * angleStep;
      let theta2 = (i + 1) * angleStep;

      let x1 = Math.cos(theta1) * this.radius;
      let z1 = Math.sin(theta1) * this.radius;
      let x2 = Math.cos(theta2) * this.radius;
      let z2 = Math.sin(theta2) * this.radius;

      drawTriangle3D([0, 0, 0, x1, 0, z1, x2, 0, z2]);

      drawTriangle3D([0, this.height, 0, x1, 0, z1, x2, 0, z2]);
    }
  }
}
