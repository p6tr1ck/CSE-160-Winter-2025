class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 3]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 1;
    this.yaw = 0; // Left/Right rotation
    this.pitch = 0; // Up/Down rotation
    this.sensitivity = 0.2; // Mouse sensitivity
  }

  moveForward() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);

    this.eye.add(f);
    this.at.add(f);
  }

  moveBackwards() {
    let f = new Vector3();
    f.set(this.eye);
    f.sub(this.at);
    f.normalize();
    f.mul(this.speed);

    this.eye.add(f);
    this.at.add(f);
  }

  moveLeft() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);
  }

  moveRight() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);
  }

  getBlockInFront() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let frontX = Math.round(this.eye.elements[0] + f.elements[0]); // Round to grid
    let frontZ = Math.round(this.eye.elements[2] + f.elements[2]);

    return { x: frontX, z: frontZ };
  }

  rotateYaw(angle) {
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(angle, 0, 1, 0);

    let direction = new Vector3();
    direction.set(this.at);
    direction.sub(this.eye);
    direction = rotationMatrix.multiplyVector3(direction);

    this.at.set(this.eye);
    this.at.add(direction);
  }

  rotatePitch(angle) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let right = Vector3.cross(f, this.up);
    right.normalize();

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(
      angle,
      right.elements[0],
      right.elements[1],
      right.elements[2]
    );

    let newDirection = rotationMatrix.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(newDirection);
  }
}
