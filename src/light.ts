import { Vec3, vec3 } from "wgpu-matrix";
import { Entity } from "./entity";
import { getDevice } from "./global-resources";
export enum LightType {
    Directional,
    Point
}

export interface LightDescriptor {
    type: LightType;
    color: Vec3;
    intensity: number;
    faloff: number;
    radius: number;
}

export class LightEntity extends Entity implements LightDescriptor {
    public readonly type: LightType;
    public color: Vec3;
    public intensity: number;
    public faloff: number;
    public radius: number;

    private static dirLightBuffer_: GPUBuffer;

    public static get dirLightBuffer() {
        return LightEntity.dirLightBuffer_ ?? LightEntity.generateBuffers();
    }

    public constructor(descriptor: Partial<LightDescriptor> = {}) {
        super();
        this.type = descriptor.type ?? LightType.Directional;
        this.color = descriptor.color ?? vec3.create(1, 1, 1);
        this.intensity = descriptor.intensity?? 1.0;
        this.faloff = descriptor.faloff?? 4.0;
        this.radius = descriptor.radius?? 8.0;

    }

    private static generateBuffers(): GPUBuffer {

        LightEntity.dirLightBuffer_ = getDevice().createBuffer({
            size:  16 * 2, //vec3 + float32 + vec3 + pad 
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
         return LightEntity.dirLightBuffer_;
    }

    public get shaderData() {
        const forward = this.transform.forward;
        return new Float32Array([
            forward[0], forward[1], forward[2], this.intensity,
            this.color[0], this.color[1], this.color[2], 0.0
        ]);
    }
}

