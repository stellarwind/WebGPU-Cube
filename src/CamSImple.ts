import { Mat4, mat4, quat, vec3, Vec3 } from "wgpu-matrix";
import { defaultSettings } from "./settings";

export class CameraSimple {
    private yawAngle = 0;

    private fov: number = (60 * Math.PI) / 180;

    public set setFOV(value: number) {
        this.fov = (value * Math.PI) / 180;
    }

    private aspect =
        defaultSettings.resolution.width / defaultSettings.resolution.height;

    private near = 0.1;

    public set setNear(value: number) {
        this.near = Math.max(0.001, value);
    }

    private far = 1000.0;

    public set setFar(value: number) {
        this.far = Math.max(this.near + 0.001, value);
    }

    private projectionMatrix = mat4.perspective(
        this.fov,
        this.aspect,
        this.near,
        this.far
    );

    private cameraPos: Vec3 = vec3.fromValues(0, 0, 0);

    public set setCameraPos(value: Vec3) {
        if (value != this.targetPos) this.cameraPos = value;
    }

    private targetPos: Vec3 = vec3.fromValues(0, 0, -1);

    public set setTargetPos(value: Vec3) {
        if (value != this.cameraPos) this.targetPos = value;
    }

    private readonly up = vec3.fromValues(0, 1, 0);

    private viewMatrix = mat4.identity();

    // public orbitQuat(yaw: number, pitch: number, distance: number) {
    //     const initOffset = vec3.fromValues(0, 0, distance);
    //     const yawQuat = quat.fromAxisAngle([0, 1, 0], yaw);
    //     const pitchQuat = quat.fromAxisAngle([1, 0, 0], pitch);
    //     const combinedQuat = quat.multiply(yawQuat, pitchQuat);
    //     const transformedOffset = vec3.transformQuat(initOffset, combinedQuat);
    //     this.cameraPos = vec3.add(this.targetPos, transformedOffset);
    //     this.viewMatrix = mat4.lookAt(this.cameraPos, this.targetPos, this.up);
    // }
    public orbit(yaw: number, pitch: number, distance: number) {

        const cameraMatrix = mat4.identity();
        mat4.rotateY(cameraMatrix, yaw, cameraMatrix);
        mat4.translate(cameraMatrix, [0, 0, distance], cameraMatrix);
        this.viewMatrix = mat4.invert(cameraMatrix);
    }

    private rotate(vec: Vec3, axis: Vec3, angle: number): Vec3 {
        return vec3.transformMat4Upper3x3(vec, mat4.rotation(axis, angle));
    }

    public update(): [Mat4, Mat4] {
        return [this.projectionMatrix, this.viewMatrix];
    }
}