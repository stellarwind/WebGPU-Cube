import { Mesh } from "./mesh";
import { mat4, Mat4, vec3 } from "wgpu-matrix";

export class Entity {
    private position_ = vec3.fromValues(0, 0, 0);
    private rotation_ = vec3.fromValues(0, 0, 0);
    private scale_ = vec3.fromValues(1, 1, 1);

    public setScale(x = 1, y = 1, z = 1) {
        if (x * y * z === 0) return;
        this.scale_ = vec3.fromValues(x, y, z);
    }

    public translate(x = 0, y = 0, z = 0) {
        this.position_ = vec3.fromValues(x, y, z);
    }

    public rotate(x = 0, y = 0, z = 0) {
        this.rotation_ = vec3.fromValues(x, y, z);
    }

    public get scale() {
        return [...this.scale_];
    }

    public get position() {
        return [...this.position_];
    }

    public get rotation() {
        return [...this.rotation_];
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

        mat4.translate(this.modelMatrix, this.position_, this.modelMatrix);

        mat4.rotateX(this.modelMatrix, this.rotation_[0], this.modelMatrix);
        mat4.rotateY(this.modelMatrix, this.rotation_[1], this.modelMatrix);
        mat4.rotateZ(this.modelMatrix, this.rotation_[2], this.modelMatrix);

        mat4.scale(this.modelMatrix, this.scale_, this.modelMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, this.mvpMatrix_);
        mat4.multiply(this.mvpMatrix_, this.modelMatrix, this.mvpMatrix_);

        return this.mvpMatrix_;
    }
}
