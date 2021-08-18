class ShaderGL {
  gl: WebGL2RenderingContext;
  glShader : WebGLShader;
  
  constructor(gl: WebGL2RenderingContext, type: GLenum, source: string) {
    this.gl = gl;
    const newShader = this.gl.createShader(type);
    if (newShader) {
      this.gl.shaderSource(newShader, source);
      this.gl.compileShader(newShader);
      const result = this.gl.getShaderParameter(newShader, this.gl.COMPILE_STATUS);
      if (!result) {
        const log = this.gl.getShaderInfoLog(newShader);
        this.gl.deleteShader(newShader);
        this.glShader = null;
        console.error("Shader cannot be compiled",log);
      }
      else {
        this.glShader = newShader;
        console.log("Shader compiled successfully");
      }
    }
  }
}

export default ShaderGL;
