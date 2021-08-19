import CanvasHTML from "../Canvas/CanvasHTML";
import ComponentHTML from "../Mesh/ComponentHTML";
import Vector2 from "../Structures/Vector2";

class RendererHTML {
  canvasHTML: CanvasHTML;
  ctx: CanvasRenderingContext2D;
  cameraPosition: Vector2;
  cameraZoom : number;
  cameraZoomFactor : number;

  constructor(canvas: CanvasHTML) {
    this.canvasHTML = canvas;
    this.ctx = this.canvasHTML.canvasElement.getContext("2d") as CanvasRenderingContext2D;
    this.cameraPosition = new Vector2(0,0);
    this.cameraZoom = 1;
    this.cameraZoomFactor = 0.05;
  }

  render = (renderComponent: ComponentHTML) => {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(this.cameraPosition.x, this.cameraPosition.y, this.canvasHTML.canvasElement.clientWidth / this.cameraZoom, this.canvasHTML.canvasElement.clientHeight / this.cameraZoom);
    this.renderAllBelow(renderComponent);
  }

  renderAllBelow = (renderComponent: ComponentHTML) => {
    if(!renderComponent.active) return;
    renderComponent.render(this);
    const queue = [];
    for (let i = 0; i < renderComponent.children.length; i++) if(renderComponent.children[i].active) queue.unshift(renderComponent.children[i]);
    while (queue.length > 0) {
      let currentNode: ComponentHTML = queue.pop();
      currentNode.render(this);
      for (let i = 0; i < currentNode.children.length; i++) if(currentNode.children[i].active) queue.unshift(currentNode.children[i]);
    }
  }

  panCamera = (position: Vector2) => {
    this.ctx.translate(this.cameraPosition.x, this.cameraPosition.y);
    this.cameraPosition.x += position.x * (1/this.cameraZoom);
    this.cameraPosition.y += position.y * (1/this.cameraZoom);
    this.ctx.translate(-this.cameraPosition.x, -this.cameraPosition.y);
  }

  zoomCamera = (position: Vector2, zoomFactor: number) => {
    const x = position.x - this.canvasHTML.canvasElement.offsetLeft;
    const y = position.y - this.canvasHTML.canvasElement.offsetTop;

    const scroll = zoomFactor < 0 ? 1 : -1;
    const zoom = Math.exp(scroll * this.cameraZoomFactor);

    this.ctx.translate(this.cameraPosition.x, this.cameraPosition.y);
    this.cameraPosition.x -= x / (this.cameraZoom * zoom) - x / this.cameraZoom;
    this.cameraPosition.y -= y / (this.cameraZoom * zoom) - y / this.cameraZoom;
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-this.cameraPosition.x, -this.cameraPosition.y);
    this.cameraZoom *= zoom;
  }
}

export default RendererHTML;