import { Entity } from "./entity";
import { getDevice } from "./global-resources";
import { Mesh } from "./mesh";
import { getBuffer } from "./shader-resources";

export class MeshEntity extends Entity {
    private mesh_: Mesh | null = null;

    public get mesh(): Mesh | null {
        return this.mesh_;
    }

    public setMesh(mesh: Mesh): Mesh {
        this.mesh_ = mesh;
        return this.mesh_;
    }

    private mvpBindGroup_!: GPUBindGroup;

    public get mvpBindGroup() {
        return this.mvpBindGroup_;
    }

    public generateMVPBindGroup(offset: number) {
        const mvpBuffer = getBuffer("mvp");
        if (this.mesh_ && mvpBuffer) {
            this.mvpBindGroup_ = getDevice().createBindGroup({
                layout: this.mesh_.material.getPipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: mvpBuffer,
                            offset: offset,
                            size: 4 * 16 * 2, // todo standardize sizes somewhere
                        },
                    },
                ],
            });
        }
    }

    constructor(mesh: Mesh | null = null, name: string = "New Mesh") {
        super(name);
        this.setMesh(mesh!);
    }

    public get shaderData(): Float32Array {
        return Float32Array.of(...this.transform.mvpMatrix, ...this.transform.modelMatrix);
    }
}