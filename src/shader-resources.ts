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
            modelMatrix: mat4x4f,
            normalMatrix: mat4x4f
        }
        @group(0) @binding(0) var<uniform> matrices: Uniforms;
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
        @group(1) @binding(0) var<uniform> dirLight: DirLight;
        `
    };
    
export const cameraUniform: BindingGroupResource = {
    name: "Camera Uniforms",
    wgsl: `
        struct Camera {
            forward: vec3f,
            position: vec3f
        }
        @group(1) @binding(1) var<uniform> mainCam: Camera;
    `
};

export const scalarsUniformTemplate: BindingGroupResource = {
    name: "Scalars Uniform Template",
    wgsl: `
        struct Scalars {
            {{SCALAR_BLOCK}}
        };
        @group(2) @binding(0) var<uniform> scalars: Scalars;
    `
};

export const textureBindGroupTemplate: BindingGroupResource = {
    name: "Texture Binding Group Template",
    wgsl: `
        @group(2) @binding({{TEXTURE_INDEX}}) var {{TEXTURE_NAME}}: texture_2d<f32>;
        @group(2) @binding({{SAMPLER_INDEX}}) var {{SAMPLER_NAME}}: sampler;
    `
};





