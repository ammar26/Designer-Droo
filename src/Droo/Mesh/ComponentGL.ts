import Vector2 from "../Structures/Vector2"

class ComponentGL {
  id: number;
  position: Vector2;
  color: number[];

  constructor(id: number, position: Vector2, color: number[]) {
    this.id = id;
    this.position = position.clone();
    this.color = color;
  }
}
export default ComponentGL;