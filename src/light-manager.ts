import { vec3 } from "wgpu-matrix";
import { LightEntity, LightType } from "./light";

export class LightManager {
}

export const dummyDirLight = new LightEntity({
    type: LightType.Directional,
    intensity: 0.0,
    color: vec3.create(0, 0, 0),
});