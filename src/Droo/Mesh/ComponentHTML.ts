import Vector2 from "../Structures/Vector2";
import Rect from "../Structures/Rect";
import identifier from "../Utils/Identifier";
import RendererHTML from "../Rendering/RendererHTML";

class ComponentHTML {
  id: number;
  type: string;
  localPosition: Vector2;
  autoLocalPosition: Vector2;
  width: number;
  height: number;
  position: Vector2;
  boundingRect: Rect;
  xConstraint: string;
  yConstraint: string;
  outlineMode: boolean;
  outlineWidth: number;
  outlineColor: string;
  outlineStyle: string;
  fillMode: boolean;
  autoMode: boolean;
  active: boolean;

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
    this.autoLocalPosition = new Vector2(0,0);
    this.width = width;
    this.height = height;
    this.position = new Vector2(0,0);
    this.xConstraint = "LEFT";
    this.yConstraint = "TOP";
    this.outlineMode = false;
    this.outlineWidth = 2;
    this.outlineColor = "#0096FF";
    this.outlineStyle = "SOLID";
    this.fillMode = true;
    this.autoMode = false;
    this.active = true;

    this.isPickable = true;
    this.isResizable = true;
    this.isMovable = true;

    if(type !== "ROOT") this.isRoot = false;
    else this.isRoot = true;
    this.parent = null;
    this.children = [];
    this.lastRenderer = null;
  }

  getChildIndex = (childComponent: ComponentHTML) => {
    for(let i = 0; i < this.children.length; i++) {
      if(childComponent.id == this.children[i].id) return i;
    }
    return -1;
  }

  changeChildIndex = (childComponent: ComponentHTML, newIndex: number) : boolean=> {
    let currentIndex = this.getChildIndex(childComponent);
    if(currentIndex == newIndex) return false;
    this.children.splice(currentIndex, 1);
    this.children.splice(newIndex, 0, childComponent);
    return true;
  }

  addChild = (childComponent: ComponentHTML) => {
    if(childComponent.parent) childComponent.parent.removeChild(childComponent);
    childComponent.parent = this;
    this.children.push(childComponent);
    childComponent.localPosition.x -= this.position.x;
    childComponent.localPosition.y -= this.position.y;
    childComponent.calculateChildren();
    childComponent.refreshPropertiesAllBelow();
  }

  removeChild = (childComponent: ComponentHTML) => {
    this.children = this.children.filter(x => x.id !== childComponent.id);
    childComponent.parent = null;
    childComponent.localPosition.x += this.position.x;
    childComponent.localPosition.y += this.position.y;
    childComponent.calculateChildren();
    childComponent.refreshPropertiesAllBelow();
  }

  moveChild = (deltaPosition : Vector2, childComponent: ComponentHTML) : boolean => {
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;
    childComponent.localPosition.x += (deltaPosition.x * zoomAdjustment);
    childComponent.localPosition.y += (deltaPosition.y * zoomAdjustment);
    childComponent.calculateChildren();
    childComponent.refreshPropertiesAllBelow();
    return true;
  }

  resizeChild = (x:number, y:number, edge: string, childComponent: ComponentHTML) => {
    let zoomAdjustment = 1; if(this.lastRenderer) zoomAdjustment = 1/this.lastRenderer.cameraZoom;
    x *= zoomAdjustment;
    y *= zoomAdjustment;
    if(x) {
      if(edge == "LEFT") {
        childComponent.localPosition.x += x;
        childComponent.width -= x;
      }
      else if(edge == "RIGHT") {
        childComponent.width += x;
      }
    }

    if(y) {
      if(edge == "TOP") {
        childComponent.localPosition.y += y;
        childComponent.height -= y;
      }
      else if(edge == "BOTTOM") {
        childComponent.height += y;
      }
    }
    childComponent.calculateChildren();
    childComponent.refreshPropertiesAllBelow();
  }

  calculateChildren = () => {
    
  }

  move = (deltaPosition : Vector2) : boolean => {
    if(!this.isMovable) return null;
    return this.parent.moveChild(deltaPosition, this);
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
    this.parent.resizeChild(leftChange/zoomAdjustment, 0, "LEFT", this);
    if(rightChange) {
      this.parent.resizeChild(rightChange/zoomAdjustment, 0, "RIGHT", this);
      return false;
    } 
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
    this.parent.resizeChild(rightChange/zoomAdjustment, 0, "RIGHT", this);
    if(leftChange) {
      this.parent.resizeChild(leftChange/zoomAdjustment, 0, "LEFT", this);
      return false;
    }
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
    this.parent.resizeChild(0, topChange/zoomAdjustment, "TOP", this);
    if(bottomChange) {
      this.parent.resizeChild(0, bottomChange/zoomAdjustment, "BOTTOM", this);
      return false;
    }
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
    this.parent.resizeChild(0, bottomChange/zoomAdjustment, "BOTTOM", this);
    if(topChange) {
      this.parent.resizeChild(0, topChange/zoomAdjustment, "TOP", this);
      return false;
    }
    else return true;
  }

  refreshPosition = () => {
    let x = 0;
    let y = 0;
    if(this.autoMode && this.active) {
      x = this.parent.position.x + this.autoLocalPosition.x;
      y = this.parent.position.y + this.autoLocalPosition.y;
    }
    else {
      x = this.parent.position.x + this.localPosition.x;
      y = this.parent.position.y + this.localPosition.y;
    }
    this.position = new Vector2(x, y);
  }

  refreshBoundingRect = () => {
    this.boundingRect = new Rect(this.position, this.width, this.height);
  }

  refreshShape = () => {}

  refreshProperties = () => {
    if(!this.parent) return;
    if(this.type == "FRAME") this.calculateChildren();
    this.refreshPosition();
    this.refreshBoundingRect();
    this.refreshShape();
  }

  refreshPropertiesAllBelow = () => {
    this.refreshProperties();
    const queue = [];
    for (let i = 0; i < this.children.length; i++) queue.unshift(this.children[i]);
    while (queue.length > 0) {
      let currentNode: ComponentHTML = queue.pop();
      currentNode.refreshProperties();
      for (let i = 0; i < currentNode.children.length; i++) queue.unshift(currentNode.children[i]);
    }
  }

  refreshPropertiesAllAboveAndBelow = () => {
    this.refreshProperties();
    let currentNode: ComponentHTML = this;
    let nodeAfterRoot: ComponentHTML = null;
    while (currentNode.parent !== null) {
      currentNode.refreshProperties();
      nodeAfterRoot = currentNode;
      currentNode = currentNode.parent;
    }
    nodeAfterRoot.refreshPropertiesAllBelow();
  }

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

  setLocalFromAuto = () => {
    this.parent.refreshPropertiesAllBelow();
    this.localPosition.x = this.autoLocalPosition.x;
    this.localPosition.y = this.autoLocalPosition.y;
    this.refreshPropertiesAllBelow();
    this.refreshPropertiesAllAboveAndBelow();
  }

  isPositionInsideShape = (position: Vector2) : boolean => { return false; }

  isRectInsideShape = (rect: Rect) : boolean => { return false; }

  render = (renderer: RendererHTML) => {
    if(!this.active) return;
    this.lastRenderer = renderer;
  }
}
export default ComponentHTML;