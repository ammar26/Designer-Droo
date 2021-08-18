import BufferGL from "./BufferGL";
import ProgramGL from "./ProgramGL";

class VertexArrayObjectGL {
  gl: WebGL2RenderingContext;
  glVertexArrayObject : WebGLVertexArrayObject;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const newVertexArrayObject = this.gl.createVertexArray();
    if (!newVertexArrayObject) {
      console.log("Vertex Array Object cannot be created");
    }
    else {
      this.glVertexArrayObject = newVertexArrayObject;
      console.log("Vertex Array Object created successfully");
    }
  }

  setupVertexAttribute = (program: ProgramGL, buffer: BufferGL, attributeName: string, size: number, normalized: boolean, stride: number, offset: number) => {
    this.use();
    buffer.use();
    const attributeLocation = this.gl.getAttribLocation(program.glProgram, attributeName);
    this.gl.enableVertexAttribArray(attributeLocation);
    this.gl.vertexAttribPointer(attributeLocation, size, buffer.type, normalized, stride, offset);
  }

  copyUniformMat3 = (program: ProgramGL, uniformName: string, data: number[]) => {
    this.use();
    const uniformLocation = this.gl.getUniformLocation(program.glProgram, uniformName);
    this.gl.uniformMatrix3fv(uniformLocation, false, data);
  }

  copyUniformVec4 = (program: ProgramGL, uniformName: string, data: number[]) => {
    this.use();
    const uniformLocation = this.gl.getUniformLocation(program.glProgram, uniformName);
    this.gl.uniform4fv(uniformLocation, data);
  }

  use = () => {
    this.gl.bindVertexArray(this.glVertexArrayObject);
  }
}

export default VertexArrayObjectGL;