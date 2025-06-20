import { getDevice } from "./global-resources";

const buffers: Map<string, GPUBuffer> = new Map();

export const createBuffer = (name: string, size: number, usage: GPUFlagsConstant = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST) => {
    if (buffers.has(name)) { 
        console.log("Buffer already exists");
        return;
    }
    buffers.set(name, getDevice().createBuffer({
        size: size,
        usage: usage
    }))
}

export const destroyBuffer = (name: string) => {
    buffers.get(name)?.destroy();
}

export const getBuffer = (name: string): GPUBuffer | undefined => {
    return buffers.get(name);
}

export interface BindingGroupResource {
    name: string,
    wgsl: string
}

export const globalUniform: BindingGroupResource = {
    name: "Global Uniforms",
    wgsl: `
        struct Uniforms {
            mvpMatrix: mat4x4f,
            modelMatrix: mat4x4f
        }
        @binding(0) @group(0) var<uniform> uniforms: Uniforms;
    `
};

export const dirLightUniform: BindingGroupResource = {
    name: "Directional Light Uniform",
    wgsl: `
    struct DirLight {
        forward: vec3f,
        intensity: f32,
        color: vec3f,
        pad0: f32
        };
        @group(0) @binding(1) var<uniform> dirLight: DirLight;
        `
    };
    
export const cameraUniform: BindingGroupResource = {
    name: "Camera Uniforms",
    wgsl: `
        struct Camera {
            forward: vec3f,
            position: vec3f
        }
        @group(0) @binding(2) var<uniform> mainCam: Camera;
    `
};

export const albedoBindGroup: BindingGroupResource = {
    name: "Albedo Texture Sampler",
    wgsl: `
        @group(1) @binding(0) var albedoSampler: sampler;
        @group(1) @binding(1) var albedo: texture_2d<f32>;
    `
};




