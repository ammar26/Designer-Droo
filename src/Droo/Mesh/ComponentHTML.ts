import Vector2 from "../Structures/Vector2";
import Rect from "../Structures/Rect";
import identifier from "../Utils/Identifier";
import RendererHTML from "../Rendering/RendererHTML";

class ComponentHTML {
  id: number;
  type: string;
  localPosition: Vector2;
  width: number;
  height: number;
  position: Vector2;
  boundingRect: Rect;
  xAnchor: string;
  yAnchor: string;
  outline: boolean;
  outlineWidth: number;
  outlineColor: string;
  outlineStyle: string;

  isPickable: boolean;
  isResizable: boolean;
  isMovable: boolean;

  isRoot: boolean;
  parent: ComponentHTML;
  children: ComponentHTML[];
  lastRenderer: RendererHTML;

  constructor(localPosition: Vector2, width: number = 0, height: number = 0, type: string) {
    this.id = identifier.getNextID();
    this.type = type;
    this.localPosition = new Vector2(localPosition.x, localPosition.y);
    this.width = width;
    this.height = height;
    this.position = new Vector2(0,0);
    this.xAnchor = "LEFT";
    this.yAnchor = "TOP";
    this.outline = false;
    this.outlineWidth = 2;
    this.outlineColor = "#0096FF";
    this.outlineStyle = "SOLID";

    this.isPickable = true;
    this.isResizable = true;
    this.isMovable = true;

    if(type !== "ROOT") this.isRoot = false;
    else this.isRoot = true;
    this.parent = null;
    this.children = [];
    this.lastRenderer = null;
  }

  addChild = (component: ComponentHTML) => {
    if(component.parent) component.parent.removeChild(component);
    component.parent = this;
    this.children.push(component);
    component.refreshPropertiesAllBelow();
  }

  removeChild = (component: ComponentHTML) => {
    this.children = this.children.filter(x => x.id !== component.id);
    component.parent = null;
    component.refreshPropertiesAllBelow();
  }

  move = (deltaPosition : Vector2) : boolean => {
    if(!this.isMovable) return null;
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;

    this.localPosition.x += (deltaPosition.x * zoomAdjustment);
    this.localPosition.y += (deltaPosition.y * zoomAdjustment);
    this.refreshPropertiesAllBelow();
    return true;
  }

  updateBasePropertiesOnResize = (x:number, y:number, direction: string) => {
    if(x)
    if(this.xAnchor == "LEFT") {
      if(direction == "LEFT") {
        this.localPosition.x += x;
        this.width -= x;
      }
      else if(direction == "RIGHT") {
        this.width += x;
      }
    }

    if(y)
    if(this.yAnchor == "TOP") {
      if(direction == "TOP") {
        this.localPosition.y += y;
        this.height -= y;
      }
      else if(direction == "BOTTOM") {
        this.height += y;
      }
    }
  }

  leftResize = (x:number) : boolean => {
    if(!this.isResizable) return null;
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;

    let leftChange = x * zoomAdjustment;
    let rightChange = 0;
    let diff = this.width-leftChange;
    if(diff < 0) {
      leftChange = this.width;
      rightChange = -1 * diff;
    }
    this.updateBasePropertiesOnResize(leftChange, 0, "LEFT");
    if(rightChange) this.updateBasePropertiesOnResize(rightChange, 0, "RIGHT");
    this.refreshPropertiesAllBelow();
    if(rightChange) return false;
    else return true;
  }

  rightResize = (x:number) : boolean  => {
    if(!this.isResizable) return null;
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;

    let leftChange = 0;
    let rightChange = x * zoomAdjustment;
    let diff = this.width+rightChange;
    if(diff < 0) {
      leftChange = diff;
      rightChange = -1 * this.width;
    }
    this.updateBasePropertiesOnResize(rightChange, 0, "RIGHT");
    if(leftChange) this.updateBasePropertiesOnResize(leftChange, 0, "LEFT");
    this.refreshPropertiesAllBelow();
    if(leftChange) return false;
    else return true;
  }

  topResize = (y:number) : boolean => {
    if(!this.isResizable) return null;
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;

    let topChange = y * zoomAdjustment;
    let bottomChange = 0;
    let diff = this.height-topChange;
    if(diff < 0) {
      topChange = this.height;
      bottomChange = -1 * diff;
    }
    this.updateBasePropertiesOnResize(0, topChange, "TOP");
    if(bottomChange) this.updateBasePropertiesOnResize(0, bottomChange, "BOTTOM");
    this.refreshPropertiesAllBelow();
    if(bottomChange) return false;
    else return true;
  }

  bottomResize = (y:number) : boolean  => {
    if(!this.isResizable) return null;
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;

    let topChange = 0;
    let bottomChange = y * zoomAdjustment;
    let diff = this.height+bottomChange;
    if(diff < 0) {
      topChange = diff;
      bottomChange = -1 * this.height;
    }
    this.updateBasePropertiesOnResize(0, bottomChange, "BOTTOM");
    if(topChange) this.updateBasePropertiesOnResize(0, topChange, "TOP");
    this.refreshPropertiesAllBelow();
    if(topChange) return false;
    else return true;
  }

  refreshPosition = () => {
    let x = 0;
    let y = 0;

    if(this.xAnchor == "LEFT") {
      x = this.parent.position.x + this.localPosition.x;
    }

    if (this.yAnchor == "TOP") {
      y = this.parent.position.y + this.localPosition.y;
    }

    this.position = new Vector2(x, y);
  }

  refreshBoundingRect = () => {
    this.boundingRect = new Rect(this.position, this.width, this.height);
  }

  refreshShape = () => {}

  refreshProperties = () => {}

  refreshPropertiesAllBelow = () => {}

  isPositionOverOutline = (position: Vector2) : number => {
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;
    const outlineWidthZoomed = (this.outlineWidth * zoomAdjustment) * 2;
  
    const leftRect = new Rect(new Vector2(this.boundingRect.topLeft.x-outlineWidthZoomed, this.boundingRect.topLeft.y+outlineWidthZoomed), 2*outlineWidthZoomed, this.boundingRect.height-outlineWidthZoomed);
    if(leftRect.isPositionInside(position)) return 1;

    const rightRect = new Rect(new Vector2(this.boundingRect.topRight.x-outlineWidthZoomed, this.boundingRect.topRight.y+outlineWidthZoomed), 2*outlineWidthZoomed, this.boundingRect.height-outlineWidthZoomed);
    if(rightRect.isPositionInside(position)) return 3;

    const topRect = new Rect(new Vector2(this.boundingRect.topLeft.x+outlineWidthZoomed, this.boundingRect.topLeft.y-outlineWidthZoomed), this.boundingRect.width-outlineWidthZoomed, 2*outlineWidthZoomed);
    if(topRect.isPositionInside(position)) return 2;

    const botomRect = new Rect(new Vector2(this.boundingRect.bottomLeft.x+outlineWidthZoomed, this.boundingRect.bottomLeft.y-outlineWidthZoomed), this.boundingRect.width-outlineWidthZoomed, 2*outlineWidthZoomed);
    if(botomRect.isPositionInside(position)) return 4;

    const topLeftRect = new Rect(new Vector2(this.boundingRect.topLeft.x-outlineWidthZoomed, this.boundingRect.topLeft.y-outlineWidthZoomed), 2*outlineWidthZoomed, 2*outlineWidthZoomed);
    if(topLeftRect.isPositionInside(position)) return 21;

    const topRightRect = new Rect(new Vector2(this.boundingRect.topRight.x-outlineWidthZoomed, this.boundingRect.topRight.y-outlineWidthZoomed), 2*outlineWidthZoomed, 2*outlineWidthZoomed);
    if(topRightRect.isPositionInside(position)) return 23;

    const bottomLeftRect = new Rect(new Vector2(this.boundingRect.bottomLeft.x-outlineWidthZoomed, this.boundingRect.bottomLeft.y-outlineWidthZoomed), 2*outlineWidthZoomed, 2*outlineWidthZoomed);
    if(bottomLeftRect.isPositionInside(position)) return 41;

    const bottomRightRect = new Rect(new Vector2(this.boundingRect.bottomRight.x-outlineWidthZoomed, this.boundingRect.bottomRight.y-outlineWidthZoomed), 2*outlineWidthZoomed, 2*outlineWidthZoomed);
    if(bottomRightRect.isPositionInside(position)) return 43;

    return 0;
  }
  
  isPositionInsideBoundedRect = (position: Vector2) : boolean => {
    return this.boundingRect.isPositionInside(position);
  }

  isRectInsideBoundedRect = (rect: Rect) : boolean => {
    if(this.boundingRect.isPositionInside(rect.topLeft) 
    && this.boundingRect.isPositionInside(rect.topRight)
    && this.boundingRect.isPositionInside(rect.bottomLeft) 
    && this.boundingRect.isPositionInside(rect.bottomRight))
    return true;
    else return false;
  }

  isPositionInsideShape = (position: Vector2) : boolean => { return false; }

  isRectInsideShape = (rect: Rect) : boolean => { return false; }

  render = (renderer: RendererHTML) => {}
}
export default ComponentHTML;