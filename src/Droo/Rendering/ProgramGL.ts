import ShaderGL from "./ShaderGL";
class ProgramGL {
  gl: WebGL2RenderingContext;
  glProgram: WebGLProgram;
  vertexShader: ShaderGL;
  fragmentShader: ShaderGL;
  
  constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    this.gl = gl;
    this.vertexShader = new ShaderGL(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    this.fragmentShader = new ShaderGL(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    const newProgram = this.gl.createProgram();
    if (newProgram) {
      this.gl.attachShader(newProgram, this.vertexShader.glShader);
      this.gl.attachShader(newProgram, this.fragmentShader.glShader);
      this.gl.linkProgram(newProgram);
      const result = this.gl.getProgramParameter(newProgram, this.gl.LINK_STATUS);
      if (!result) {
        const log = this.gl.getProgramInfoLog(newProgram);
        this.gl.deleteProgram(newProgram);
        this.glProgram = null;
        console.error("Program cannot be linked", log);
      }
      else {
        this.glProgram = newProgram;
        console.log("Program linked successfully");
      }
    }
  }

  use = () => {
    this.gl.useProgram(this.glProgram);
  }
}

export default ProgramGL;