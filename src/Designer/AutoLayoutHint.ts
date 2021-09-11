import Vector2 from "../Droo/Structures/Vector2";
import FrameComponentHTML from "../Droo/Mesh/FrameComponentHTML";
import ComponentHTML from "../Droo/Mesh/ComponentHTML";
import CanvasHTML from "../Droo/Canvas/CanvasHTML";

class AutoLayoutHint {
  canvasHTML: CanvasHTML;
  color: string;
  hintMarkerSize: number;
  hintMarker: ComponentHTML;
  hintMarkerFrameContainer: FrameComponentHTML;
  hintOutline: ComponentHTML;
  hintMarkerEnabled: boolean;
  hintOutlineEnabled: boolean;

  constructor(canvasHTML: CanvasHTML, color: string) {
    this.canvasHTML = canvasHTML;
    this.color = color;
    this.hintMarkerSize = 5;

    this.hintMarker = null;
    this.hintMarker = new FrameComponentHTML(new Vector2(0, 0), this.hintMarkerSize, this.hintMarkerSize, this.color);
    (<FrameComponentHTML>this.hintMarker).isParentable = false;

    this.hintOutline = new FrameComponentHTML(new Vector2(0, 0), 1, 1);
    this.hintOutline.fillMode = false;
    this.hintOutline.outlineMode = true;
    this.hintOutline.outlineStyle = "DOTTED";
    this.hintOutline.outlineColor = this.color;
    (<FrameComponentHTML>this.hintOutline).isParentable = false;

    this.hintMarkerEnabled = false;
    this.hintOutlineEnabled = false;
  }

  enableHintOutline = (localPosition: Vector2, width:number, height: number) => {
    if(!this.hintOutlineEnabled) {
      this.hintOutline.localPosition = localPosition;
      this.hintOutline.width = width;
      this.hintOutline.height = height;
      this.hintOutline.active = true;
      this.canvasHTML.addComponent(this.hintOutline);
      this.hintOutline.refreshProperties();
      this.hintOutlineEnabled = true;
    }
  }

  disableHintOutline = () => {
    if(this.hintOutlineEnabled) {
      this.canvasHTML.removeComponent(this.hintOutline);
      this.hintOutlineEnabled = false;
    }
  }

  moveHintOutline = (deltaMovement: Vector2) => {
    if(this.hintOutlineEnabled) {
      this.hintOutline.move(deltaMovement);
    }
  }

  enableHintMarker = (componentFrameContainer: FrameComponentHTML, position: Vector2, width:number, height: number) => {
    if(!this.hintMarkerEnabled) {
      let hintMarkerWidth = 0;
      let hintMarkerHeight = 0;
      this.hintMarkerFrameContainer = componentFrameContainer;
      if(this.hintMarkerFrameContainer.direction == "HORIZONTAL") {
        hintMarkerWidth = this.hintMarkerSize;
        hintMarkerHeight = height;
      }
      else if(this.hintMarkerFrameContainer.direction == "VERTICAL") {
        hintMarkerWidth = width;
        hintMarkerHeight = this.hintMarkerSize;
      }
      const hintMarkerPosition = this.getHintMarkerPosition(this.hintMarkerFrameContainer, position);
      this.hintMarker.localPosition = hintMarkerPosition;
      this.hintMarker.width = hintMarkerWidth;
      this.hintMarker.height = hintMarkerHeight;
      this.hintMarker.active = true;
      this.canvasHTML.addComponent(this.hintMarker);
      this.hintMarker.refreshProperties();
      this.hintMarkerEnabled = true;
    }
  }

  updateHintMarker = (position: Vector2) => {
    if(this.hintMarkerEnabled) {
      const hintMarkerPosition = this.getHintMarkerPosition(this.hintMarkerFrameContainer, position);
      this.hintMarker.localPosition = hintMarkerPosition;
      this.hintMarker.refreshProperties();
      this.hintMarkerEnabled = true;
    }
  }

  disableHintMarker = () => {
    if(this.hintMarkerEnabled) {
      this.canvasHTML.removeComponent(this.hintMarker);
      this.hintMarkerEnabled = false;
    }
  }

  getHintMarkerPosition = (component: FrameComponentHTML, position: Vector2) : Vector2 => {
    const index = component.getChildIndexForAutoLayout(position);
    // If frame is empty
    if(index == 0 && !component.children[0].active) {
      return new Vector2(component.boundingRect.topLeft.x + component.paddingLeft, component.boundingRect.topLeft.y + component.paddingTop);
    }
    // If insertion is at first index
    else if(index == 0) {
      if(component.direction == "HORIZONTAL") {
        return new Vector2((component.boundingRect.topLeft.x + (component.paddingLeft/2)) - (this.hintMarkerSize/2), component.boundingRect.topLeft.y + component.paddingTop);
      }
      else if(component.direction == "VERTICAL") {
        return new Vector2(component.boundingRect.topLeft.x + component.paddingLeft, (component.boundingRect.topLeft.y + (component.paddingTop/2)) - (this.hintMarkerSize/2));
      }
    }
    // If insertion is at last index
    else if (index >= component.children.length || !component.children[index].active) {
      if(component.direction == "HORIZONTAL") {
        return new Vector2((component.boundingRect.topRight.x - (component.paddingRight/2)) - (this.hintMarkerSize/2), component.boundingRect.topRight.y + component.paddingTop);
      }
      else if(component.direction == "VERTICAL") {
        return new Vector2(component.boundingRect.bottomLeft.x + component.paddingLeft, (component.boundingRect.bottomLeft.y - (component.paddingBottom/2)) - (this.hintMarkerSize/2));
      }
    }
    // If insertion is at middle index
    else {
      if(component.direction == "HORIZONTAL") {
        return new Vector2((component.children[index].boundingRect.topLeft.x - (component.spacing/2)) - (this.hintMarkerSize/2), component.children[index].boundingRect.topLeft.y);
      }
      else if(component.direction == "VERTICAL") {
        return new Vector2(component.children[index].boundingRect.topLeft.x, (component.children[index].boundingRect.topLeft.y- (component.spacing/2)) - (this.hintMarkerSize/2));
      }
    }
  }
}

export default AutoLayoutHint;