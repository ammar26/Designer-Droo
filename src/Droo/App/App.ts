import CanvasGL from "../Canvas/CanvasGL";
import CanvasHTML from "../Canvas/CanvasHTML";

class App {
  bodyElement: HTMLBodyElement;
  canvasGL: CanvasGL[];
  canvasHTML: CanvasHTML[];

  constructor() { 
    this.canvasGL = [];
    this.canvasHTML = [];
  }

  createCanvasGL = (canvasID: string) => {
    this.bodyElement = document.querySelector("body")!;
    const canvasGL = new CanvasGL(this, canvasID);
    this.canvasGL.push(canvasGL);
    return canvasGL;
  }

  createCanvasHTML = (canvasID: string) => {
    this.bodyElement = document.querySelector("body")!;
    const canvasHTML = new CanvasHTML(this, canvasID);
    this.canvasHTML.push(canvasHTML);
    return canvasHTML;
  }
}

export default App;
