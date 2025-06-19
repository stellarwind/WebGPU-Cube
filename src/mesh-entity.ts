import { Entity } from "./entity";
import { Mesh } from "./mesh";

export class MeshEntity extends Entity {
    private mesh_: Mesh | null = null;

    public get mesh(): Mesh | null {
        return this.mesh_;
    }

    public setMesh(mesh: Mesh): Mesh {
        this.mesh_ = mesh;
        return this.mesh_;
    }

    constructor( mesh: Mesh | null = null, name: string = "New Mesh") {
        super(name);
        this.setMesh(mesh!);
    }

    public get shaderData(): Float32Array {
        return new Float32Array(this.transform.mvpMatrix); // Instancing data
    }
}