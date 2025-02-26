import "gl-matrix";
import { mat4, vec3 } from "gl-matrix";
import { getDevice, getQueue } from "./GPU";

export class Mesh {
  public readonly positionBuffer!: GPUBuffer;
  public readonly colorBuffer!: GPUBuffer;
  public readonly indexBuffer!: GPUBuffer;
  public readonly normalBuffer!: GPUBuffer;

  private positions!: Float32Array;
  private colors!: Float32Array;
  private indices!: Uint16Array;
  private normals!: Float32Array;

  public readonly passIndex: number = 0;

  public readonly position: vec3 = vec3.create();
  public readonly rotation: vec3 = vec3.create();
  public readonly scale: vec3 = vec3.fromValues(1.0, 1.0, 1.0);

  private transformMatrix: mat4 = mat4.identity(mat4.create());

  constructor(
    verts: Array<number>,
    indices: Array<number>,
    colors: Array<number> | null = null
  ) {
    this.positions = new Float32Array(verts);
    this.positionBuffer = getDevice().createBuffer({
      label: "Positions",
      size: this.positions.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    getQueue().writeBuffer(this.positionBuffer, 0, this.positions);

    // this.indices = new Uint16Array(indices);
    // this.indexBuffer = getDevice().createBuffer({
    //   label: "Indices",
    //   size: this.indices.byteLength,
    //   usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    // });
    // getQueue().writeBuffer(this.indexBuffer, 0, this.indices);

    let vertexCount = this.positions.length / 3.0;
    if (colors === null) {
      const defaultColors = new Float32Array(vertexCount * 3);
      for (let i = 0; i < vertexCount; i++) {
        defaultColors[i * 3] = 1.0;
        defaultColors[i * 3 + 1] = 1.0;
        defaultColors[i * 3 + 2] = 1.0;
      }
      this.colors = defaultColors;
    } else {
      this.colors = new Float32Array(colors);
    }

    this.colorBuffer = getDevice().createBuffer({
      label: "Colors",
      size: this.colors.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    getQueue().writeBuffer(this.colorBuffer, 0, this.colors);
  }
}
