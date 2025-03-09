import { Mesh } from "./mesh";
import { mat4, Mat4} from "wgpu-matrix";

export class Entity {
    
    public position = [0, 0, 0];
    public rotation = [0, 0, 0];
    public scale = [1, 1, 1];
 
    public mvpMatrix: Mat4 = mat4.create();
    private modelMatrix: Mat4 = mat4.create();

    private _mesh: Mesh | null = null;

    public get mesh(): Mesh | null {
        return this.renderable? this._mesh: null;
    }
    
    public get renderable(): boolean {
        return this._mesh !== null && this._mesh.indexCount > 0;
    }

    public addMesh(mesh: Mesh) {
        this._mesh = mesh;
    }

    public calculateMVPMatrix(viewMatrix: Mat4, projectionMatrix: Mat4): Mat4 {
        mat4.identity(this.modelMatrix);

        mat4.translate(this.modelMatrix, this.position, this.modelMatrix);

        mat4.rotateX(this.modelMatrix, this.rotation[0], this.modelMatrix);
        mat4.rotateY(this.modelMatrix, this.rotation[1], this.modelMatrix);
        mat4.rotateZ(this.modelMatrix, this.rotation[2], this.modelMatrix);

        mat4.scale(this.modelMatrix, this.scale, this.modelMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, this.mvpMatrix);
        mat4.multiply(this.mvpMatrix, this.modelMatrix, this.mvpMatrix);

        return this.mvpMatrix;
    }

    public setScale (x = 1, y = 1, z = 1) {
        this.scale = [x, y, z];
    }

    public translate (x = 0, y = 0, z = 0) {
        this.position = [x, y, z];
    }

}
