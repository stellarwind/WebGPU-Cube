import {vec3, mat4} from "gl-matrix"
import { Mesh } from "./mesh";

export class Entity {

    public readonly position: vec3 = vec3.create();
    public readonly rotation: vec3 = vec3.create();
    public readonly scale: vec3 = vec3.fromValues(1.0, 1.0, 1.0);

    private transformMatrix: mat4 = mat4.identity(mat4.create());

    private meshList: Mesh[] | null = null;

    public get renderable(): boolean {
        return this.meshList != null && this.meshList?.length > 0 
    }
}