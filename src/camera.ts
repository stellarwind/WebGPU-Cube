//All copyrights go to https://github.com/webgpu/webgpu-samples/tree/main/sample/cameras

import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import Input from "./input";

export class ArcballCamera {
    private matrix_ = mat4.identity();
    private view_ = mat4.create();
    private distance = 0;
    private angularVelocity = 0;
    private axis_ = vec3.create();

    rotationSpeed = 1;
    zoomSpeed = 0.1;
    frictionCoefficient = 0.999;

    constructor(options?: { position?: Vec3 }) {
        if (options?.position) {
            this.position = options.position;
            this.distance = vec3.len(this.position);
            this.back = vec3.normalize(this.position);
            this.recalculateAxes();
        }
    }

    get matrix(): Mat4 {
        return this.matrix_;
    }

    set matrix(mat: Mat4) {
        mat4.copy(mat, this.matrix_);
        this.distance = vec3.len(this.position);
    }

    get view(): Mat4 {
        return this.view_;
    }

    get right(): Vec3 {
        return vec3.create(this.matrix_[0], this.matrix_[1], this.matrix_[2]);
    }

    get up(): Vec3 {
        return vec3.create(this.matrix_[4], this.matrix_[5], this.matrix_[6]);
    }

    get back(): Vec3 {
        return vec3.create(this.matrix_[8], this.matrix_[9], this.matrix_[10]);
    }

    set back(vec: Vec3) {
        vec3.copy(vec, this.matrix_.subarray(8, 11));
    }

    get position(): Vec3 {
        return vec3.create(
            this.matrix_[12],
            this.matrix_[13],
            this.matrix_[14]
        );
    }

    set position(vec: Vec3) {
        vec3.copy(vec, this.matrix_.subarray(12, 15));
    }

    get axis(): Vec3 {
        return this.axis_;
    }

    set axis(vec: Vec3) {
        vec3.copy(vec, this.axis_);
    }

    update(deltaTime: number, input: Input): Mat4 {
        if (input.analog.touching) {
            this.angularVelocity = 0;
        } else {
            this.angularVelocity *= Math.pow(
                1 - this.frictionCoefficient,
                deltaTime
            );
        }

        const movement = vec3.create();
        vec3.addScaled(movement, this.right, input.analog.x, movement);
        vec3.addScaled(movement, this.up, -input.analog.y, movement);

        const crossProduct = vec3.cross(movement, this.back);
        const magnitude = vec3.len(crossProduct);

        if (magnitude > 1e-7) {
            this.axis = vec3.scale(crossProduct, 1 / magnitude);
            this.angularVelocity = magnitude * this.rotationSpeed;
        }

        const rotationAngle = this.angularVelocity * deltaTime;
        if (rotationAngle > 1e-7) {
            this.back = vec3.normalize(
                rotate(this.back, this.axis, rotationAngle)
            );
            this.recalculateAxes();
        }

        if (input.analog.zoom !== 0) {
            this.distance *= 1 + input.analog.zoom * this.zoomSpeed;
        }
        this.position = vec3.scale(this.back, this.distance);

        this.view_ = mat4.invert(this.matrix_);
        return this.view_;
    }

    private recalculateAxes() {
        const right = vec3.normalize(
            vec3.cross(vec3.create(0, 1, 0), this.back)
        );
        const up = vec3.normalize(vec3.cross(this.back, right));

        this.matrix_[0] = right[0];
        this.matrix_[1] = right[1];
        this.matrix_[2] = right[2];

        this.matrix_[4] = up[0];
        this.matrix_[5] = up[1];
        this.matrix_[6] = up[2];

        this.matrix_[8] = this.back[0];
        this.matrix_[9] = this.back[1];
        this.matrix_[10] = this.back[2];
    }
}

function rotate(vec: Vec3, axis: Vec3, angle: number): Vec3 {
    return vec3.transformMat4Upper3x3(vec, mat4.rotation(axis, angle));
}
