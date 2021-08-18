import BufferGL from "./BufferGL";
import VertexArrayObjectGL from "./VertexArrayObjectGL";
import ProgramGL from "./ProgramGL";
import CanvasGL from "../Canvas/CanvasGL";
import Matrix3 from "../Structures/Matrix3";
import Vector2 from "../Structures/Vector2";
import gridVert from "../Shaders/Grid.vert";
import gridFrag from "../Shaders/Grid.frag";
import componentVert from "../Shaders/Component.vert";
import componentFrag from "../Shaders/Component.frag";
import ComponentGL from "../Mesh/ComponentGL";

class RendererGL {
  canvasGL: CanvasGL;
  gl: WebGL2RenderingContext;
  viewProjMatrix: number[];
  uniformViewProjMatrix: WebGLUniformLocation;
  gridPoints: number;
  
  programGrid: ProgramGL;
  vertexBufferGrid: BufferGL;
  vertexArrayObjectGrid: VertexArrayObjectGL;

  programComponent: ProgramGL;
  vertexBufferComponent: BufferGL;
  colorBufferComponent: BufferGL;
  vertexArrayObjectComponent: VertexArrayObjectGL;

  programPick: ProgramGL;
  vertexBufferPick: BufferGL;
  vertexArrayObjectPick: VertexArrayObjectGL;

  targetTexture: WebGLTexture;
  depthBuffer: WebGLRenderbuffer;
  framebuffer: WebGLFramebuffer;

  constructor(canvas: CanvasGL) {
    this.canvasGL = canvas;
    this.gl = this.canvasGL.canvasElement.getContext("webgl2") as WebGL2RenderingContext;
    if (!this.gl) throw new Error("WebGL 2 is not supported");
    else console.log("WebGL 2 context initialized successfully");

    this.initProgramsAndVAOs();
    this.initFrameBuffer();
  }

  initProgramsAndVAOs = () => {
    this.programGrid = new ProgramGL(this.gl, gridVert, gridFrag);
    this.vertexBufferGrid = new BufferGL(this.gl, this.gl.FLOAT);
    this.vertexArrayObjectGrid = new VertexArrayObjectGL(this.gl);
    this.vertexArrayObjectGrid.setupVertexAttribute(this.programGrid, this.vertexBufferGrid, "a_position", 2, false, 0, 0);
    
    this.programComponent = new ProgramGL(this.gl, componentVert, componentFrag);
    this.vertexBufferComponent = new BufferGL(this.gl, this.gl.FLOAT);
    this.colorBufferComponent = new BufferGL(this.gl, this.gl.UNSIGNED_BYTE);
    this.vertexArrayObjectComponent = new VertexArrayObjectGL(this.gl);
    this.vertexArrayObjectComponent.setupVertexAttribute(this.programComponent, this.vertexBufferComponent, "a_position", 2, false, 0, 0);
    this.vertexArrayObjectComponent.setupVertexAttribute(this.programComponent, this.colorBufferComponent, "a_color", 4, true, 0, 0);

    this.programPick = new ProgramGL(this.gl, gridVert, gridFrag);
    this.vertexBufferPick = new BufferGL(this.gl, this.gl.FLOAT);
    this.vertexArrayObjectPick = new VertexArrayObjectGL(this.gl);
    this.vertexArrayObjectPick.setupVertexAttribute(this.programPick, this.vertexBufferPick, "a_position", 2, false, 0, 0);
  }

  updateDataGrid = () => {
    this.gridPoints = 0;
    let gridDistance = 100;
    if(this.canvasGL.zoomLevel <0.25) gridDistance = 2000;
    else if(this.canvasGL.zoomLevel <0.5) gridDistance = 1000;
    else if(this.canvasGL.zoomLevel <0.75) gridDistance = 500;
    let OneByZoom = 1/this.canvasGL.zoomLevel;
    const gridStart = new Vector2((Math.floor(this.canvasGL.panPosition.x/gridDistance)*gridDistance), (Math.floor(this.canvasGL.panPosition.y/gridDistance)*gridDistance));
    const gridEnd = new Vector2(Math.ceil((this.canvasGL.panPosition.x + this.canvasGL.canvasElement.clientWidth)/gridDistance)*gridDistance, Math.ceil((this.canvasGL.panPosition.y + this.canvasGL.canvasElement.clientHeight)/gridDistance)*gridDistance);
    if(this.canvasGL.zoomLevel <=1) {
      const zoomXAdjustment = OneByZoom * this.canvasGL.canvasElement.clientWidth;
      const zoomYAdjustment = OneByZoom * this.canvasGL.canvasElement.clientHeight;
      gridEnd.x += zoomXAdjustment;
      gridEnd.y += zoomYAdjustment
    }

    const vertexBufferData = [];
    for(let i = gridStart.x; i <= gridEnd.x; i = i+gridDistance) {
      vertexBufferData.push(i+OneByZoom);
      vertexBufferData.push(gridStart.y);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridStart.y);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridEnd.y);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridEnd.y);
      vertexBufferData.push(i+OneByZoom);
      vertexBufferData.push(gridEnd.y);
      vertexBufferData.push(i+OneByZoom);
      vertexBufferData.push(gridStart.y);
      this.gridPoints +=6;
    }
    for(let i = gridStart.y; i <= gridEnd.y; i = i+gridDistance) {
      vertexBufferData.push(gridStart.x);
      vertexBufferData.push(i+OneByZoom);
      vertexBufferData.push(gridStart.x);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridEnd.x);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridEnd.x);
      vertexBufferData.push(i-OneByZoom);
      vertexBufferData.push(gridEnd.x);
      vertexBufferData.push(i+OneByZoom);
      vertexBufferData.push(gridStart.x);
      vertexBufferData.push(i+OneByZoom);
      this.gridPoints +=6;
    }
    this.vertexBufferGrid.copyData(vertexBufferData);
  }

  updateDataComponent = (component: ComponentGL) => {
    const vertexBufferData = [];

    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(100);
    vertexBufferData.push(100);
    vertexBufferData.push(0);

    vertexBufferData.push(100);
    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(100);
    vertexBufferData.push(100);
    vertexBufferData.push(100);

    this.vertexBufferComponent.copyData(vertexBufferData);

    const colorBufferData = [];
    
    if(this.canvasGL.selectedID == component.id) {
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);

      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(255);
      colorBufferData.push(0);
      colorBufferData.push(255);
    } else {
      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);
      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);
      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);

      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);
      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);
      colorBufferData.push(255*component.color[0]);
      colorBufferData.push(255*component.color[1]);
      colorBufferData.push(255*component.color[2]);
      colorBufferData.push(255*component.color[3]);
    }
    this.colorBufferComponent.copyData(colorBufferData);
  }

  updateDataPick = () => {
    const vertexBufferData = [];

    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(100);
    vertexBufferData.push(100);
    vertexBufferData.push(0);

    vertexBufferData.push(100);
    vertexBufferData.push(0);
    vertexBufferData.push(0);
    vertexBufferData.push(100);
    vertexBufferData.push(100);
    vertexBufferData.push(100);

    this.vertexBufferPick.copyData(vertexBufferData);
  }

  setFramebufferAttachmentSizes = (width:number, height:number) => {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    const level = 0;
    const internalFormat = this.gl.RGBA;
    const border = 0;
    const format = this.gl.RGBA;
    const type = this.gl.UNSIGNED_BYTE;
    this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                  width, height, border,
                  format, type, null);

    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
  }

  initFrameBuffer = () => {
    this.targetTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    this.depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);

    this.framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);

    const attachmentPoint = this.gl.COLOR_ATTACHMENT0;
    const level = 0;
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, this.targetTexture, level);

    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  cameraZoom = (position: Vector2, zoom: number) => {
    const zoomLevel = this.canvasGL.zoomLevel * 0.01;
    const clip = this.getClipSpaceMousePosition(position);

    const [preZoomX, preZoomY] = Matrix3.getTransformPoint(Matrix3.getInverseMatrix(this.viewProjMatrix), [clip.x, clip.y]);
    const newZoom = this.canvasGL.zoomLevel * Math.pow(2, zoom * -0.01);
    this.canvasGL.zoomLevel = Math.max(0.02, Math.min(100, newZoom));

    this.updateViewProjMatrix();

    const [postZoomX, postZoomY] = Matrix3.getTransformPoint(Matrix3.getInverseMatrix(this.viewProjMatrix), [clip.x, clip.y]);
    this.canvasGL.panPosition.x += preZoomX - postZoomX;
    this.canvasGL.panPosition.y += preZoomY - postZoomY;
  };

  getClipSpaceMousePosition = (position: Vector2) => {
    const rect = this.canvasGL.canvasElement.getBoundingClientRect();  
    const cssX = position.x - rect.left;
    const cssY = position.y - rect.top;
    const normalizedX = cssX / this.canvasGL.canvasElement.clientWidth;
    const normalizedY = cssY / this.canvasGL.canvasElement.clientHeight;
    const clipX = normalizedX * 2 - 1;
    const clipY = normalizedY * -2 + 1;
    return new Vector2(clipX, clipY);
  };

  createCameraMatrix = () => {
    const zoomScale = 1 / this.canvasGL.zoomLevel;
    let cameraMatrix = Matrix3.getIdentityMatrix();
    cameraMatrix = Matrix3.getTranslateMatrix(cameraMatrix, this.canvasGL.panPosition.x, this.canvasGL.panPosition.y);
    cameraMatrix = Matrix3.getRotateMatrix(cameraMatrix, 0);
    cameraMatrix = Matrix3.getScaleMatrix(cameraMatrix, zoomScale, zoomScale);
    return cameraMatrix;
  };

  updateViewProjMatrix = () => {
    const projectionMatrix = Matrix3.getProjectionMatrix(this.gl.canvas.width, this.gl.canvas.height);
    const cameraMatrix = this.createCameraMatrix();
    let viewMatrix = Matrix3.getInverseMatrix(cameraMatrix);
    this.viewProjMatrix = Matrix3.getMultipliedMatrix(projectionMatrix, viewMatrix);
  };

  hitTestComponent = (position: Vector2) => {
    const pixelX = position.x * this.gl.canvas.width / this.canvasGL.canvasElement.clientWidth;
    const pixelY = this.gl.canvas.height - position.y * this.gl.canvas.height / this.canvasGL.canvasElement.clientHeight - 1;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    const data = new Uint8Array(4);
    this.gl.readPixels(
      pixelX,
      pixelY,
      1,
      1,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data);
      const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.canvasGL.selectedID = id;
  }

  render = () => {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(255, 255, 255, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.updateViewProjMatrix();

    this.programGrid.use();
    this.vertexArrayObjectGrid.use();
    this.updateDataGrid();
    this.vertexArrayObjectGrid.copyUniformMat3(this.programGrid, "u_matrix", this.viewProjMatrix);
    this.vertexArrayObjectGrid.copyUniformVec4(this.programGrid, "u_color",  [0.5,0.5,0.5,1]);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.gridPoints);

    this.programComponent.use();
    this.vertexArrayObjectComponent.use();
    for(let i = 0; i<this.canvasGL.components.length; i++) {
      this.updateDataComponent(this.canvasGL.components[i]);
      this.vertexArrayObjectComponent.copyUniformMat3(this.programComponent, "u_matrix",  Matrix3.getTranslateMatrix(this.viewProjMatrix, this.canvasGL.components[i].position.x, this.canvasGL.components[i].position.y));
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    {
      this.setFramebufferAttachmentSizes(this.gl.canvas.width, this.gl.canvas.height);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      
      this.gl.enable(this.gl.CULL_FACE);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
      this.programPick.use();
      this.vertexArrayObjectPick.use();
      this.updateDataPick();
      for(let i = 0; i<this.canvasGL.components.length; i++) {
        const id = this.canvasGL.components[i].id;
        this.vertexArrayObjectPick.copyUniformMat3(this.programPick, "u_matrix",  Matrix3.getTranslateMatrix(this.viewProjMatrix, this.canvasGL.components[i].position.x, this.canvasGL.components[i].position.y));
        const colorID = [((id >>  0) & 0xFF) / 0xFF, 
          ((id >>  8) & 0xFF) / 0xFF, 
          ((id >>  16) & 0xFF) / 0xFF, 
          ((id >>  24) & 0xFF) / 0xFF];
        this.vertexArrayObjectPick.copyUniformVec4(this.programPick, "u_color",  colorID);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      }
      this.gl.disable(this.gl.CULL_FACE);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
  }
}

export default RendererGL;
