class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 3]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
  }

  moveForward() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);

    this.eye.add(f);
    this.at.add(f);
  }

  moveBackwards() {
    var f = this.at.sub(this.eye);
    f = f.div(f.length());
    var s = f.cross(this.up);
    s = s.divide(s.length());
    this.at = this.at.add(s);
    this.eye = this.eye.add(s);
  }
}
