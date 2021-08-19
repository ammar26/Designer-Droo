class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  toArray = () => {
    return [this.x, this.y];
  }

  length = () => {
    const x = Math.pow(this.x, 2);
    const y = Math.pow(this.y, 2);

    return Math.sqrt(x + y);
  }

  multiply = (v: number) => {
    this.x *= v;
    this.y *= v;
  }

  equals = (a: Vector2) => {
    return this.x === a.x && this.y === a.y;
  }

  update = (x = 0, y = 0) => {
    this.x = x;
    this.y = y;
  }

  clone = () => {
    return new Vector2(this.x, this.y);
  }

  rotate = (angle: number) => {
    const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);

    this.x = x;
    this.y = y;
  }

  static getSubtractedVector = (a: Vector2, b: Vector2) => {
    const x = a.x - b.x;
    const y = a.y - b.y;

    return new Vector2(x, y);
  }

  static getAddedVector = (a: Vector2, b: Vector2) => {
    const x = a.x + b.x;
    const y = a.y + b.y;

    return new Vector2(x, y);
  }
}

export default Vector2;