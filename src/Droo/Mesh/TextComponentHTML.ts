import Vector2 from "../Structures/Vector2";
import Rect from "../Structures/Rect";
import ComponentHTML from "./ComponentHTML";
import RendererHTML from "../Rendering/RendererHTML";

class TextComponentHTML extends ComponentHTML {
  shape: Rect;
  fillColor: string;
  text: string;
  size: number;

  constructor(localPosition: Vector2, width: number, height: number, text: string, size: number, fillColor: string = "#000000") {
    super(localPosition, width, height, "TEXT");
    this.fillColor = fillColor;
    this.text = text;
    this.size = size;

    this.refreshBoundingRect();
    this.refreshShape();
  }

  refreshShape = () => {
    this.shape = new Rect(this.boundingRect.topLeft, this.boundingRect.width, this.boundingRect.height);
  }

  render = (renderer: RendererHTML) => {
    if(!this.active) return;
    this.lastRenderer = renderer;

    if(this.fillMode) {
      renderer.ctx.font = this.size.toString()+"px Arial";
      renderer.ctx.fillText(this.text, this.shape.topLeft.x, this.shape.topLeft.y);
    }
  }
}
export default TextComponentHTML;