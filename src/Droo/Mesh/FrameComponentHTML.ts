import Vector2 from "../Structures/Vector2";
import Rect from "../Structures/Rect";
import ComponentHTML from "./ComponentHTML";
import RendererHTML from "../Rendering/RendererHTML";

class FrameComponentHTML extends ComponentHTML {
  shape: Rect;
  layout: string;
  direction: string;
  fillColor: string;

  constructor(localPosition: Vector2, width: number, height: number, fillColor: string) {
    super(localPosition, width, height, "FRAME");
    this.fillColor = fillColor;
    this.layout = "FREE";
    this.direction = "NONE";
    this.refreshBoundingRect();
    this.refreshShape();
  }

  addChild = (component: ComponentHTML) => {
    if(component.parent) component.parent.removeChild(component);
    component.parent = this;
    this.children.push(component);
    if(this.layout == "FREE") {
      if(component.xConstraint == "LEFT") {
        component.localPosition.x -= this.position.x;
      }
      if(component.yConstraint == "TOP") {
        component.localPosition.y -= this.position.y;
      }
    }
    component.refreshPropertiesAllBelow();
  }

  removeChild = (component: ComponentHTML) => {
    this.children = this.children.filter(x => x.id !== component.id);
    component.parent = null;
    if(this.layout == "FREE") {
      if(component.xConstraint == "LEFT") {
        component.localPosition.x += this.position.x;
      }
      if(component.yConstraint == "TOP") {
        component.localPosition.y += this.position.y;
      }
    }
    component.refreshPropertiesAllBelow();
  }

  refreshShape = () => {
    this.shape = new Rect(this.boundingRect.topLeft, this.boundingRect.width, this.boundingRect.height);
  }

  render = (renderer: RendererHTML) => {
    this.lastRenderer = renderer;
    renderer.ctx.fillStyle = this.fillColor;
    renderer.ctx.fillRect(this.shape.topLeft.x, this.shape.topLeft.y, this.shape.width, this.shape.height);
    
    const zoomAdjustment = 1/renderer.cameraZoom;
    const outlineWidthZoomed = this.outlineWidth * zoomAdjustment;
    if(this.outline) {
      renderer.ctx.strokeStyle = this.outlineColor;
      renderer.ctx.lineWidth = outlineWidthZoomed;
      if(this.outlineStyle == "SOLID") renderer.ctx.setLineDash([]);
      else if(this.outlineStyle == "DOTTED") renderer.ctx.setLineDash([5]);
      renderer.ctx.strokeRect(this.boundingRect.topLeft.x-(outlineWidthZoomed), this.boundingRect.topLeft.y-(outlineWidthZoomed), this.boundingRect.width+(2*outlineWidthZoomed), this.boundingRect.height+(2*outlineWidthZoomed));
    }
  }

  isPositionInsideShape = (position: Vector2) : boolean => {
    return this.shape.isPositionInside(position);
  }

  isRectInsideShape = (rect: Rect) : boolean => {
    if(this.shape.isPositionInside(rect.topLeft) 
    && this.shape.isPositionInside(rect.topRight)
    && this.shape.isPositionInside(rect.bottomLeft) 
    && this.shape.isPositionInside(rect.bottomRight))
    return true;
    else return false;
  }
}

export default FrameComponentHTML;