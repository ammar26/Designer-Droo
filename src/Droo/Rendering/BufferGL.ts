class BufferGL {
  gl: WebGL2RenderingContext
  type: number;
  glBuffer : WebGLBuffer;
  length: number;
  
  constructor(gl: WebGL2RenderingContext, type: number) {
    this.gl = gl;
    this.type = type;
    const newBuffer = this.gl.createBuffer();
    if (!newBuffer) {
      console.error("Buffer cannot be created");
    }
    else {
      this.glBuffer = newBuffer;
      console.log("Buffer created successfully");
    }
  }

  use = () => {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glBuffer);
  }

  copyData = (data: number[]) => {
    this.use();
    let bufferDataCasted = null;
    this.length = data.length;
    if(this.type == this.gl.FLOAT) bufferDataCasted = new Float32Array(data);
    else if(this.type == this.gl.UNSIGNED_BYTE) bufferDataCasted = new Uint8Array(data);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferDataCasted, this.gl.STATIC_DRAW);
  }
}

export default BufferGL;