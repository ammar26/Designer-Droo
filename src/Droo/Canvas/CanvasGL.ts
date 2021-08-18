import App from "../App/App";
import RendererGL from "../Rendering/RendererGL";
import Vector2 from "../Structures/Vector2";
import Mouse from "../Input/Mouse";
import Keyboard from "../Input/Keyboard";
import ComponentGL from "../Mesh/ComponentGL";

class CanvasGL {
  canvasElement: HTMLCanvasElement;
  app: App;
  rendererGL: RendererGL;
  mouse: Mouse;
  keyboard: Keyboard;
  panPosition: Vector2;
  zoomLevel : number;
  mouseZoom: boolean;
  mousePan: boolean;
  grid: boolean;
  components: ComponentGL[];
  moveSelectComponents: boolean;
  selectedID: number;

  constructor(app: App, canvasID: string) {
    this.app = app;
    this.canvasElement = document.querySelector(canvasID)!;
    this.mouse = new Mouse(this.canvasElement);
    this.keyboard = new Keyboard();
    this.panPosition = new Vector2(0,0);
    this.zoomLevel = 1;
    this.rendererGL = new RendererGL(this);
    this.mouseZoom = true;
    this.mousePan = true;
    this.grid = true;
    this.components = [];
    this.moveSelectComponents = true;
    this.selectedID = 16777215;

    this.mouse.addEvent("MouseWheel", this.onMouseWheel);
    this.mouse.addEvent("MouseDown", this.onMouseDown);
    this.mouse.addEvent("MouseUp", this.onMouseUp);
    this.mouse.addEvent("MouseMove", this.onMouseMove);
    this.keyboard.addEvent("KeyDown", this.onKeyDown);
    this.keyboard.addEvent("KeyUp", this.onKeyUp);
    window.onresize = this.update;
  }

  onMouseWheel = (ev: WheelEvent) => {
    if(this.keyboard.altHold && this.mouseZoom) this.zoomAt(new Vector2(ev.clientX, ev.clientY), ev.deltaY);
    else if (ev.ctrlKey && this.mouseZoom) this.zoomAt(new Vector2(ev.clientX, ev.clientY), ev.deltaY);
    else if (this.mousePan) this.panAt(new Vector2(ev.deltaX, ev.deltaY));
  }

  onMouseDown = (ev: MouseEvent) => {
    if(this.moveSelectComponents) {
      const rect = this.canvasElement.getBoundingClientRect();
      const mouseX = ev.clientX - rect.left;
      const mouseY = ev.clientY - rect.top;
      this.rendererGL.hitTestComponent(new Vector2(mouseX, mouseY));
      this.update();
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    if(this.mouse.middleDown && this.mousePan) {
      this.mouse.deltaMovement.multiply(-1);
      this.panAt(this.mouse.deltaMovement);
    }

    if(this.mouse.leftDown && this.selectedID != 16777215) {
      const zoomScale = 1 / this.zoomLevel;
      this.components[this.selectedID].position.x += (this.mouse.deltaMovement.x * zoomScale);
      this.components[this.selectedID].position.y += (this.mouse.deltaMovement.y * zoomScale);
      this.update();
    }
  }

  onMouseUp = (ev: MouseEvent) => {
  }

  onKeyDown = (ev: KeyboardEvent) => {
  }

  onKeyUp = (ev: KeyboardEvent) => {
  }

  panAt = (position: Vector2) => {
    const zoomScale = 1 / this.zoomLevel;
    this.panPosition.x += (position.x * zoomScale);
    this.panPosition.y += (position.y * zoomScale);
    this.update();
  }

  zoomAt = (position: Vector2, zoom: number) => {
    this.rendererGL.cameraZoom(position, zoom);
    this.update();
  }

  fitCanvasSize = () => {
    const width : number  = this.canvasElement.clientWidth;
    const height : number = this.canvasElement.clientHeight;
    if (this.canvasElement.width !== width ||  this.canvasElement.height !== height) {
      this.canvasElement.width  = width;
      this.canvasElement.height = height;
      return true;
    }
    return false;
  }
  
  update = () => {
    this.fitCanvasSize();
    this.rendererGL.render();
  }
}

export default CanvasGL;