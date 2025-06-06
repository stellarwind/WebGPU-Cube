import { mat4, Mat4, utils, vec3 } from "wgpu-matrix";

export class Transform {
    private position_ = vec3.fromValues(0, 0, 0);
    private rotation_ = vec3.fromValues(0, 0, 0);
    private scale_ = vec3.fromValues(1, 1, 1);

    private dirty: boolean = true;

    public setScale(x = 1, y = 1, z = 1) {
        if (x * y * z === 0) return;
        this.scale_ = vec3.fromValues(x, y, z);
        this.dirty = true;
    }

    public translate(x = 0, y = 0, z = 0) {
        this.position_ = vec3.fromValues(x, y, z);
        this.dirty = true;
    }

    public rotate(x = 0, y = 0, z = 0) {
        const x_ = utils.degToRad(x);
        const y_ = utils.degToRad(y);
        const z_ = utils.degToRad(z);
        this.rotation_ = vec3.fromValues(x_, y_, z_);
        this.dirty = true;
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

    public calculateMVPMatrix(viewMatrix: Mat4, projectionMatrix: Mat4): Mat4 {
        if (!this.dirty) return this.mvpMatrix_;

        mat4.identity(this.modelMatrix);

        mat4.translate( this.modelMatrix, this.position, this.modelMatrix);

        mat4.rotateX( this.modelMatrix, this.rotation[0], this.modelMatrix);
        mat4.rotateY( this.modelMatrix, this.rotation[1], this.modelMatrix);
        mat4.rotateZ( this.modelMatrix, this.rotation[2], this.modelMatrix);

        mat4.scale(this.modelMatrix, this.scale, this.modelMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, this.mvpMatrix_);
        mat4.multiply(this.mvpMatrix_, this.modelMatrix, this.mvpMatrix_);

        // this.dirty = false;
        return this.mvpMatrix_;
    }
}
