import { utils, vec3 } from "wgpu-matrix";
export class Transform {
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
        const x_ = utils.degToRad(x);
        const y_ = utils.degToRad(y);
        const z_ = utils.degToRad(z);
        this.rotation_ = vec3.fromValues(x_, y_, z_);
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
}
