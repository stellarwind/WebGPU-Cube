import { Mat4, mat4, vec3, Vec3 } from "wgpu-matrix";
import { defaultSettings } from "./settings";

export class Camera {
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

    public set setFar (value: number) {
        this.far = Math.max(this.near + 0.001, value);
    }
    
    private projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far);

    private cameraPos: Vec3 = vec3.fromValues(0, 0 , 0);
    private targetPos: Vec3 = vec3.fromValues(0, 0, -1);
    
    private viewMatrix = mat4.lookAt(
        this.cameraPos,
        this.targetPos,
        [0, 1, 0] //up
    );

    public update(): [Mat4, Mat4] {
        return [this.projectionMatrix, this.viewMatrix];
    }
}
