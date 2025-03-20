import { Mat4, mat4 } from "wgpu-matrix";
import { defaultSettings } from "./settings";

export class Camera {
    fov = (60 * Math.PI) / 180;
    aspect =
        defaultSettings.resolution.width / defaultSettings.resolution.height;
    near = 0.1;
    far = 1000.0;
    
    projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far);
    
    viewMatrix = mat4.lookAt(
        [0, 0, 0], //eye
        [0, 0, -1], //target
        [0, 1, 0] //up
    );

    public update(): [Mat4, Mat4] {
        return [this.projectionMatrix, this.viewMatrix];
    }
}
