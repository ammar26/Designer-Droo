import Vector2 from "../Structures/Vector2";
import Rect from "../Structures/Rect";
import ComponentHTML from "./ComponentHTML";
import RendererHTML from "../Rendering/RendererHTML";

class FrameComponentHTML extends ComponentHTML {
  shape: Rect;
  fillColor: string;
  
  layout: string;
  direction: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  spacing: number;

  isParentable: boolean;

  constructor(localPosition: Vector2, width: number, height: number, fillColor: string = "#000000", layout: string = "FREE", direction: string = "NONE") {
    super(localPosition, width, height, "FRAME");
    this.fillColor = fillColor;

    this.layout = layout;
    this.direction = direction;
    this.paddingTop = 10;
    this.paddingBottom = 10;
    this.paddingLeft = 10;
    this.paddingRight = 10;
    this.spacing = 20;

    this.isParentable = true;
    this.refreshBoundingRect();
    this.refreshShape();
  }

  addChild = (component: ComponentHTML) => {
    if(component.parent) component.parent.removeChild(component);
    component.parent = this;
    this.children.push(component);
    if(this.layout == "FREE") {
      component.localPosition.x -= this.position.x;
      component.localPosition.y -= this.position.y;
    } 
    else if (this.layout == "AUTO") {
      component.localPosition.x -= this.position.x;
      component.localPosition.y -= this.position.y;
      component.autoMode = true;
    }
    this.refreshPropertiesAllBelow();
    this.refreshPropertiesAllAbove();
  }

  removeChild = (component: ComponentHTML) => {
    this.children = this.children.filter(x => x.id !== component.id);
    component.parent = null;
    if(this.layout == "FREE") {
      component.localPosition.x += this.position.x;
      component.localPosition.y += this.position.y;
    }
    else if (this.layout == "AUTO") {
      component.localPosition.x += this.position.x;
      component.localPosition.y += this.position.y;
      component.autoMode = false;   
    }
    this.refreshPropertiesAllBelow();
    this.refreshPropertiesAllAbove();
  }

  moveChild = (deltaPosition : Vector2, component: ComponentHTML) : boolean => {
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;
    if(this.layout == "FREE") {
      component.localPosition.x += (deltaPosition.x * zoomAdjustment);
      component.localPosition.y += (deltaPosition.y * zoomAdjustment);
    }
    else if (this.layout == "AUTO") {
      component.localPosition.x += (deltaPosition.x * zoomAdjustment);
      component.localPosition.y += (deltaPosition.y * zoomAdjustment);
    }
    this.refreshPropertiesAllBelow();
    this.refreshPropertiesAllAbove();
    return true;
  }

  resizeChild = (x:number, y:number, edge: string, component: ComponentHTML) => {
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;
    x *= zoomAdjustment;
    y *= zoomAdjustment;
    if(this.layout == "FREE") {
      if(x) {
        if(edge == "LEFT") {
          component.localPosition.x += x;
          component.width -= x;
        }
        else if(edge == "RIGHT") {
          component.width += x;
        }
      }
      if(y) {
        if(edge == "TOP") {
          component.localPosition.y += y;
          component.height -= y;
        }
        else if(edge == "BOTTOM") {
          component.height += y;
        }
      }
    }
    else if (this.layout == "AUTO") {
      
    }
    component.refreshPropertiesAllBelow();
  }

  calculateChildren = () => {
    if(this.layout == "AUTO") {
      let positionX = 0;
      let positionY = 0;
      let lastWidth = 0;
      let lastHeight = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      let totalWidth = this.paddingLeft;
      let totalHeight = this.paddingTop;
      let count = 0;

      for (let i = 0; i < this.children.length; i++) {
        if(this.children[i].active) {
          if(this.direction == "HORIZONTAL") {
            totalWidth += this.children[i].width + (count? this.spacing: 0);
          }
          else if(this.direction == "VERTICAL") {
            totalHeight += this.children[i].height + (count? this.spacing: 0);
          }
          if(this.children[i].width >= maxWidth) maxWidth = this.children[i].width;
          if(this.children[i].height >= maxHeight) maxHeight = this.children[i].height;
          count++;
        }
      }
      if(this.direction == "HORIZONTAL") {
        totalWidth += this.paddingRight;
        totalHeight += maxHeight + this.paddingBottom;
      }
      else if(this.direction == "VERTICAL") {
        totalWidth += maxWidth + this.paddingRight;
        totalHeight += this.paddingBottom;
      }

      count = 0;
      for (let i = 0; i < this.children.length; i++) {
        if(this.children[i].active) {
          if(count == 0) {
            positionX = this.paddingLeft;
            positionY = this.paddingTop;
          }
          else {
            if(this.direction == "HORIZONTAL") {
              positionX += lastWidth + this.spacing;
            }
            else if(this.direction == "VERTICAL") {
              positionY += lastHeight + this.spacing;
            }
          }
          this.children[i].autoLocalPosition.x = positionX;
          this.children[i].autoLocalPosition.y = positionY;
          lastWidth = this.children[i].width;
          lastHeight = this.children[i].height;
          count++;
        }
      }
      if(count > 0) {
        this.width = totalWidth;
        this.height = totalHeight;
      }
    }
  }

  refreshShape = () => {
    this.shape = new Rect(this.boundingRect.topLeft, this.boundingRect.width, this.boundingRect.height);
  }

  render = (renderer: RendererHTML) => {
    if(!this.active) return;
    this.lastRenderer = renderer;
    const zoomAdjustment = 1/renderer.cameraZoom;
    const outlineWidthZoomed = this.outlineWidth * zoomAdjustment;

    if(this.fillMode) {
      renderer.ctx.fillStyle = this.fillColor;
      renderer.ctx.fillRect(this.shape.topLeft.x, this.shape.topLeft.y, this.shape.width, this.shape.height);
    }
    
    if(this.outlineMode) {
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

  calculateIndexForAutoLayout = (position: Vector2) => {
    if(this.layout !== "AUTO") return;
    let minDistanceIndex = 0;
    let minDistance = 0;
    let distance = 0;
    let lastActiveIndex = 0;
    let count = 0;
    for(let i = 0; i < this.children.length; i++) {
      if(this.children[i].active) {
        if(this.direction == "HORIZONTAL") {
          distance = Math.abs(position.x - this.children[i].boundingRect.topLeft.x);
        }
        else if(this.direction == "VERTICAL") {
          distance = Math.abs(position.y - this.children[i].boundingRect.topLeft.y);
        }
        if(count == 0 || distance < minDistance) {
          minDistance = distance;
          minDistanceIndex = i;
        }
        lastActiveIndex = i;
        count++;
      }
    }
    if(count !== 0) {
      if(this.direction == "HORIZONTAL") {
        distance = Math.abs(position.x - this.children[lastActiveIndex].boundingRect.topRight.x);
      }
      else if(this.direction == "VERTICAL") {
        distance = Math.abs(position.y - this.children[lastActiveIndex].boundingRect.bottomLeft.y);
      }
      if(distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = lastActiveIndex + 1;
      } 
    }
    return minDistanceIndex;
  }
}

export default FrameComponentHTML;