class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 3]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 0.5;
    this.alpha = 15;
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

  panLeft() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(
      this.alpha,
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
  }

  panRight() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(
      -this.alpha,
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
  }
}
