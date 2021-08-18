import Vector2 from "../Structures/Vector2";
import InputManager from "./InputManager";

class Mouse extends InputManager<MouseEvent> {

  insideCanvas: boolean;
  currentPosition: Vector2;
  lastPosition: Vector2;
  deltaMovement: Vector2;
  leftDown: boolean;
  rightDown: boolean;
  middleDown: boolean;
  lastLeftDown: Vector2;
  lastRightDown: Vector2;
  lastMiddleDown: Vector2;
  lastLeftUp: Vector2;
  lastRightUp: Vector2;
  lastMiddleUp: Vector2;
  lastLeftDrag: Vector2;
  lastRightDrag: Vector2;
  lastMiddleDrag: Vector2;

  constructor(canvas: HTMLCanvasElement) {
    super();
    window.addEventListener("mousedown", this.onMouseDownWindow);
    window.addEventListener("mouseup", this.onMouseUpWindow);

    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mousewheel", this.onMouseWheel);
    canvas.addEventListener("mouseleave", this.onMouseLeave);
    canvas.addEventListener("mouseenter", this.onMouseEnter);

    this.insideCanvas = true;
    this.currentPosition = null;
    this.lastPosition = null;
    this.deltaMovement = new Vector2(0,0);
    this.leftDown = false;
    this.rightDown = false;
    this.middleDown = false;
    this.lastLeftDown = null;
    this.lastRightDown = null;
    this.lastMiddleDown = null;
    this.lastLeftUp = null;
    this.lastRightUp = null;
    this.lastMiddleUp = null;
    this.lastLeftDrag = null;
    this.lastRightDrag = null;
    this.lastMiddleDrag = null;
  }

  onMouseDownWindow = (ev: MouseEvent) => {
    if(!this.insideCanvas) {
      if(ev.button === 0) {
        this.leftDown = true;
        this.lastLeftDown = null;
      }
      else if(ev.button === 1) {
        this.middleDown = true;
        this.lastMiddleDown = null;
      }
      else if(ev.button === 2) {
        this.rightDown = true;
        this.lastRightDown = null;
      }
    }
  }

  onMouseUpWindow = (ev: MouseEvent) => {
    if(!this.insideCanvas) {
      if(ev.button === 0) {
        this.leftDown = false;
        this.lastLeftUp = null;
        this.lastLeftDrag = null;
      }
      else if(ev.button === 1) {
        this.middleDown = false;
        this.lastMiddleUp = null;
        this.lastMiddleDrag = null;
      }
      else if(ev.button === 2) {
        this.rightDown = false;
        this.lastRightUp = null;
        this.lastRightDrag = null;
      }
    }
  }

  onMouseDown = (ev: MouseEvent) => {
    if(ev.button === 0) {
      this.leftDown = true;
      this.lastLeftDown = new Vector2(ev.clientX, ev.clientY);
    }
    else if(ev.button === 1) {
      this.middleDown = true;
      this.lastMiddleDown = new Vector2(ev.clientX, ev.clientY);
    }
    else if(ev.button === 2) {
      this.rightDown = true;
      this.lastRightDown = new Vector2(ev.clientX, ev.clientY);
    }
    this.fireEvent("MouseDown", ev);
  };

  onMouseMove = (ev: MouseEvent) => {
    if(this.currentPosition !== null) {
      this.lastPosition = new Vector2(this.currentPosition.x, this.currentPosition.y);
    }
    this.currentPosition = new Vector2(ev.clientX, ev.clientY);
    if(this.currentPosition !== null && this.lastPosition !== null) {
      this.deltaMovement = Vector2.getSubtractedVector(this.currentPosition, this.lastPosition);
    }
    else {
      this.deltaMovement = new Vector2(0,0);
    }
    this.fireEvent("MouseMove", ev);
  };

  onMouseUp = (ev: MouseEvent) => {
    if(ev.button === 0) {
      this.leftDown = false;
      this.lastLeftUp = new Vector2(ev.clientX, ev.clientY);
      if(this.lastLeftUp !== null && this.lastLeftDown !== null)
        this.lastLeftDrag = Vector2.getSubtractedVector(this.lastLeftUp, this.lastLeftDown);
    }
    else if(ev.button === 1) {
      this.middleDown = false;
      this.lastMiddleUp = new Vector2(ev.clientX, ev.clientY);
      if(this.lastMiddleUp !== null && this.lastMiddleDown !== null)
        this.lastMiddleDrag = Vector2.getSubtractedVector(this.lastMiddleUp, this.lastMiddleDown);
    }
    else if(ev.button === 2) {
      this.rightDown = false;
      this.lastRightUp = new Vector2(ev.clientX, ev.clientY);
      if(this.lastRightUp !== null && this.lastRightDown !== null)
        this.lastRightDrag = Vector2.getSubtractedVector(this.lastRightUp, this.lastRightDown);
    }
    this.fireEvent("MouseUp", ev);
  };

  onMouseWheel = (ev: WheelEvent) => {
    this.fireEvent("MouseWheel", ev);
  };

  onMouseEnter = (ev: MouseEvent) => {
    this.insideCanvas = true;
    this.currentPosition = null;
    this.lastPosition = null;
    this.fireEvent("MouseEnter", ev);
  }

  onMouseLeave = (ev: MouseEvent) => {
    this.insideCanvas = false;
    this.currentPosition = null;
    this.lastPosition = null;
    this.fireEvent("MouseLeave", ev);
  }
}

export default Mouse;
