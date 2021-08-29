import App from "../App/App";
import RendererHTML from "../Rendering/RendererHTML";
import Mouse from "../Input/Mouse";
import Keyboard from "../Input/Keyboard";
import Vector2 from "../Structures/Vector2";
import ComponentHTML from "../Mesh/ComponentHTML";
import FrameComponentHTML from "../Mesh/FrameComponentHTML";

class CanvasHTML {
  canvasElement: HTMLCanvasElement;
  app: App;
  rendererHTML: RendererHTML;
  mouse: Mouse;
  keyboard: Keyboard;
  autoMouseZoom: boolean;
  autoMousePan: boolean;
  defaultRootTreeNode: ComponentHTML;

  constructor(app: App, canvasID: string) {
    this.app = app;
    this.canvasElement = document.querySelector(canvasID)!;
    this.mouse = new Mouse(this.canvasElement);
    this.keyboard = new Keyboard();
    this.rendererHTML = new RendererHTML(this);
    this.autoMouseZoom = false;
    this.autoMousePan = false;
    this.setupDefaultTreeRoot(); 

    this.mouse.addEvent("MouseWheel", this.onMouseWheel);
    this.mouse.addEvent("MouseDown", this.onMouseDown);
    this.mouse.addEvent("MouseMove", this.onMouseMove);
    this.mouse.addEvent("MouseUp", this.onMouseUp);

    this.fitCanvasSize();
    window.onresize = this.screenSizeRefresh;
  }

  setupDefaultTreeRoot() {
    this.defaultRootTreeNode = new ComponentHTML(new Vector2(0, 0), 0, 0, "ROOT");
    this.defaultRootTreeNode.isRoot = true;
  }

  onMouseWheel = (ev: WheelEvent) => {
    if(this.keyboard.altHold && this.autoMouseZoom) this.zoomAt(new Vector2(ev.clientX, ev.clientY), ev.deltaY);
    else if (ev.ctrlKey && this.autoMouseZoom) this.zoomAt(new Vector2(ev.clientX, ev.clientY), ev.deltaY);
    else if (this.autoMousePan) this.panAt(new Vector2(ev.deltaX, ev.deltaY));
  }

  onMouseDown = (ev: MouseEvent) => {
    
  }

  onMouseMove = (ev: MouseEvent) => {
    if(this.mouse.middleDown && this.autoMousePan) {
      this.mouse.deltaMovement.multiply(-1);
      this.panAt(this.mouse.deltaMovement);
    }
  }

  onMouseUp = (ev: MouseEvent) => {
    
  }

  getScreenPosition = (position: Vector2) : Vector2 => {
    const rect = this.canvasElement.getBoundingClientRect();
    const mouseX = position.x - rect.left;
    const mouseY = position.y - rect.top;
    const transformMatrix: DOMMatrix = this.rendererHTML.ctx.getTransform();
    const transformMatrixInverse: DOMMatrix = transformMatrix.invertSelf();
    const x = mouseX * transformMatrixInverse.a + mouseY * transformMatrixInverse.c + transformMatrixInverse.e;
    const y = mouseX * transformMatrixInverse.b + mouseY * transformMatrixInverse.d + transformMatrixInverse.f;
    return new Vector2(x,y);
  }

  panAt = (position: Vector2) => {
    this.rendererHTML.panCamera(position);
    this.update();
  }

  zoomAt = (position: Vector2, zoomFactor: number) => {
    this.rendererHTML.zoomCamera(position, zoomFactor);
    this.update();
  }

  fitCanvasSize = () => {
    const transformMatrix = this.saveContextTransform(this.rendererHTML.ctx);
    let width : number  = this.canvasElement.clientWidth;
    let height : number = this.canvasElement.clientHeight;
    if (this.canvasElement.width !== width ||  this.canvasElement.height !== height) {
      this.canvasElement.width  = width;
      this.canvasElement.height = height;
    }
    this.restoreContextTransform(this.rendererHTML.ctx, transformMatrix);
  }

  addComponent = (component: ComponentHTML, parentComponent: ComponentHTML = null) => {
    if(!parentComponent) {
      this.defaultRootTreeNode.addChild(component);
    }
    else {
      parentComponent.addChild(component);
    }
  }

  removeComponent = (component: ComponentHTML) => {
    component.parent.removeChild(component);
  }

  pickComponentByShape = (position: Vector2, treeNode: ComponentHTML = null) : ComponentHTML => {
    if(!treeNode) treeNode = this.defaultRootTreeNode
    if(!treeNode.active) return;
    
    const queue = [];
    let pickedComponent = null;
    for (let i = 0; i < treeNode.children.length; i++) if(treeNode.children[i].active) queue.unshift(treeNode.children[i]);
    while (queue.length > 0) {
      let currentNode: ComponentHTML = queue.pop();
      if(currentNode.isPositionInsideShape(position)) {
        if(currentNode.isPickable) {
          pickedComponent = currentNode;
        }
      }
      for (let i = 0; i < currentNode.children.length; i++) if(currentNode.children[i].active) queue.unshift(currentNode.children[i]);
    }
    return pickedComponent;
  }

  pickComponentByBoundedRect = (position: Vector2, treeNode: ComponentHTML = null) : ComponentHTML => {
    if(!treeNode) treeNode = this.defaultRootTreeNode;
    if(!treeNode.active) return;

    const queue = [];
    let pickedComponent = null;
    for (let i = 0; i < treeNode.children.length; i++) if(treeNode.children[i].active) queue.unshift(treeNode.children[i]);
    while (queue.length > 0) {
      let currentNode: ComponentHTML = queue.pop();
      if(currentNode.isPositionInsideBoundedRect(position)) {
        if(currentNode.isPickable) {
          pickedComponent = currentNode;
        }
      }
      for (let i = 0; i < currentNode.children.length; i++) if(currentNode.children[i].active) queue.unshift(currentNode.children[i]);
    }
    return pickedComponent;
  }

  pickComponentFrameContainer = (position: Vector2, component: ComponentHTML, treeNode: ComponentHTML = null) : ComponentHTML => {
    if(!treeNode) treeNode = this.defaultRootTreeNode;
    if(!treeNode.active) return;

    const queue = [];
    let pickedComponent = null;
    for (let i = 0; i < treeNode.children.length; i++) {
      if(treeNode.children[i].active) {
        const frameNode = treeNode.children[i] as FrameComponentHTML;
        if(frameNode.isParentableAllBelow) queue.unshift(treeNode.children[i]);
      }
    }
    while (queue.length > 0) {
      let currentNode: ComponentHTML = queue.pop();
      if(currentNode.id !== component.id && currentNode.type == "FRAME") {
        const currentFrameNode = currentNode as FrameComponentHTML;
        if(currentFrameNode.isParentable) {
          if(currentFrameNode.layout == "FREE") {
            if(currentNode.isRectInsideBoundedRect(component.boundingRect)) {
              pickedComponent = currentNode;
            }
          }
          else if(currentFrameNode.layout == "AUTO") {
            if(currentNode.isPositionInsideBoundedRect(position)) {
              pickedComponent = currentNode;
            }
          }
        }
      }
      for (let i = 0; i < currentNode.children.length; i++) {
        if(currentNode.children[i].active) {
          const frameNode = currentNode.children[i] as FrameComponentHTML;
          if(frameNode.isParentableAllBelow) queue.unshift(currentNode.children[i]);
        }
      }
    }
    return pickedComponent;
  }

  saveContextTransform = (ctx: CanvasRenderingContext2D) => {
    return ctx.getTransform();
  }

  restoreContextTransform = (ctx: CanvasRenderingContext2D, transformMatrix: DOMMatrix) => {
    ctx.setTransform(transformMatrix);
  }

  screenSizeRefresh = () => {
    this.fitCanvasSize();
    this.update();
  }

  update = () => {
    this.rendererHTML.render(this.defaultRootTreeNode);
  }
}

export default CanvasHTML;