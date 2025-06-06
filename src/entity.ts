import { Mesh } from "./mesh";
import { mat4, Mat4, utils, vec3 } from "wgpu-matrix";
import { Transform } from "./transform";

export class Entity {
    private transform_: Transform = new Transform();

    public get transform() {
        return this.transform_;
    }

    private mvpMatrix_: Mat4 = mat4.create();

    public get mvpMatrix() {
        return mat4.copy(this.mvpMatrix_);
    }

    private modelMatrix: Mat4 = mat4.create();

    private mesh_: Mesh | null = null;

    public get mesh(): Mesh | null {
        return this.renderable ? this.mesh_ : null;
    }

    public get renderable(): boolean {
        return this.mesh_ !== null && this.mesh_.indexCount > 0;
    }

    public addMesh(mesh: Mesh): Mesh {
        this.mesh_ = mesh;
        return this.mesh_;
    }

    public calculateMVPMatrix(viewMatrix: Mat4, projectionMatrix: Mat4): Mat4 {
        mat4.identity(this.modelMatrix);

        mat4.translate(
            this.modelMatrix,
            this.transform.position,
            this.modelMatrix
        );

        mat4.rotateX(
            this.modelMatrix,
            this.transform.rotation[0],
            this.modelMatrix
        );
        mat4.rotateY(
            this.modelMatrix,
            this.transform.rotation[1],
            this.modelMatrix
        );
        mat4.rotateZ(
            this.modelMatrix,
            this.transform.rotation[2],
            this.modelMatrix
        );

        mat4.scale(this.modelMatrix, this.transform.scale, this.modelMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, this.mvpMatrix_);
        mat4.multiply(this.mvpMatrix_, this.modelMatrix, this.mvpMatrix_);

        return this.mvpMatrix_;
    }
}
