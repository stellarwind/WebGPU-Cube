import { Mat4, mat4, quat, utils, vec3, Vec3 } from "wgpu-matrix";
import { defaultSettings } from "./settings";

export class Camera {
    private pitchAngle: number = 0;
    private yawAngle: number = 0;

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
    ); // Actually [-zNear -> -zFar]

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

    public orbitEuler(yaw: number, pitch: number, distance: number) {
        const cameraMatrix = mat4.identity();
        mat4.rotateY(cameraMatrix, yaw, cameraMatrix);
        mat4.rotateX(cameraMatrix, pitch, cameraMatrix);
        mat4.translate(cameraMatrix, [0, 0, distance], cameraMatrix);
        this.viewMatrix = mat4.invert(cameraMatrix);
    }

    public orbitQuat(yaw: number, pitch: number, distance: number) {
        this.yawAngle += utils.degToRad(utils.degToRad(yaw));
        this.pitchAngle += utils.degToRad(utils.degToRad(pitch));

        const quatYaw = quat.fromAxisAngle(this.up, this.yawAngle);
        const quatPitch = quat.fromAxisAngle([1, 0, 0], this.pitchAngle);
        const transformQuat = quat.multiply(quatYaw, quatPitch);

        const cameraMatrix = mat4.fromQuat(transformQuat);
        mat4.translate(cameraMatrix, [0, 0, distance], cameraMatrix);
        this.viewMatrix = mat4.invert(cameraMatrix);
    }

    public update(): [Mat4, Mat4] {
        return [this.projectionMatrix, this.viewMatrix];
    }
}
