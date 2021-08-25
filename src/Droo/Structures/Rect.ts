import Vector2 from "../Structures/Vector2"

class Rect {
  topLeft: Vector2;
  topRight: Vector2;
  bottomLeft: Vector2;
  bottomRight: Vector2;
  width: number;
  height: number;

  constructor(topLeft: Vector2, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.topLeft = new Vector2(topLeft.x, topLeft.y);
    this.bottomRight = new Vector2(topLeft.x+width, topLeft.y+height);
    this.topRight = new Vector2(this.bottomRight.x, this.topLeft.y);
    this.bottomLeft = new Vector2(this.topLeft.x, this.bottomRight.y);
  }

  isPositionInside = (position: Vector2) : boolean => {
    if ((position.x >= this.topLeft.x) && (position.x <= this.topRight.x) && (position.y >= this.topLeft.y) && (position.y <= this.bottomRight.y)) return true;
    return false;
  }

  getMidPoint = () : Vector2 => {
    return new Vector2((this.topLeft.x + this.topRight.x)/2, (this.topLeft.y + this.bottomLeft.y)/2);
  }
}

export default Rect;