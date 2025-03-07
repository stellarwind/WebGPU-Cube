import { vec3, mat4 } from "gl-matrix";
import { Mesh } from "./mesh";

export class Entity {
    public readonly position: vec3 = vec3.create();
    public readonly rotation: vec3 = vec3.create();
    public readonly scale: vec3 = vec3.fromValues(1.0, 1.0, 1.0);

    private mvpMatrix: mat4 = mat4.identity(mat4.create());

    public readonly meshList: Mesh[] | null = null;

    public get renderable(): boolean {
        return this.meshList != null && this.meshList?.length > 0;
    }

    public calculateMVPMatrix(viewMatrix: mat4, projectionMatrix: mat4): mat4 {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, this.position);
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, this.scale);

        mat4.multiply(this.mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(this.mvpMatrix, projectionMatrix, this.mvpMatrix);

        return this.mvpMatrix;
    }
}
