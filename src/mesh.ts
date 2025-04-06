import { getDevice, getQueue } from "./global-resources";
import { Material } from "./material";

export class Mesh {
    public readonly positionBuffer!: GPUBuffer;
    public readonly colorBuffer!: GPUBuffer;
    public readonly indexBuffer!: GPUBuffer;
    public readonly normalBuffer!: GPUBuffer;
    public readonly uvBuffer!: GPUBuffer;

    private positions!: Float32Array;
    private colors!: Float32Array;
    private indices!: Uint16Array;
    private normals!: Float32Array;
    private uvs!: Float32Array;

    private material_!: Material;

    public get material() {
        return this.material_;
    }

    public set  material(value) {
        this.material_ = value;
    }

    public get indexCount(): number {
        return this.indices.length;
    }

    public readonly passIndex: number = 0;

    constructor(
        verts: Float32Array,
        indices: Uint16Array,
        colors: Float32Array | null = null,
        normals: Float32Array | null = null,
        uvs: Float32Array 
    ) {
        // Positions
        this.positions = verts;
        this.positionBuffer = getDevice().createBuffer({
            label: "Positions",
            size: this.positions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        getQueue().writeBuffer(this.positionBuffer, 0, this.positions);

        // Indices
        this.indices = indices;
        this.indexBuffer = getDevice().createBuffer({
            label: "Indices",
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        getQueue().writeBuffer(this.indexBuffer, 0, indices);

        // Vertices
        let vertexCount = verts.length / 3.0;
        if (colors === null) {
            const defaultColors = new Float32Array(vertexCount * 3);
            for (let i = 0; i < vertexCount; i++) {
                defaultColors[i * 3] = 1.0;
                defaultColors[i * 3 + 1] = 0.0;
                defaultColors[i * 3 + 2] = 1.0;
            }
            this.colors = defaultColors;
        } else {
            this.colors = colors;
        }

        this.colorBuffer = getDevice().createBuffer({
            label: "Colors",
            size: this.colors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        getQueue().writeBuffer(this.colorBuffer, 0, this.colors);

        // Normals
        if (normals === null) {
            this.normals = new Float32Array(vertexCount * 3).fill(0);
        } else {
            this.normals = normals;
        }

        this.normalBuffer = getDevice().createBuffer({
            label: "Normals",
            size: this.normals.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        getQueue().writeBuffer(this.normalBuffer, 0, this.normals);

        // UVs
        if (uvs === null) {
            this.uvs = new Float32Array(vertexCount * 2).fill(0);
        } else {
            this.uvs = uvs;
        }

        this.uvBuffer = getDevice().createBuffer({
            label: "UVs",
            size: this.uvs.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        getQueue().writeBuffer(this.uvBuffer, 0, this.uvs);
    }
}
