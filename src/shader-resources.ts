interface BindingGroupResource {
    name: string,
    wgsl: string
}

export const globalUniforms: BindingGroupResource = {
    name: "Global Uniforms",
    wgsl: `
        struct Uniforms {
            mvpMatrix: mat4x4f
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
        @group(2) @binding(0) var<uniform> dirLight: DirLight;
    `
};

export const albedoBindGroup: BindingGroupResource = {
    name: "Albedo Texture Sampler",
    wgsl: `
        @group(1) @binding(0) var albedoSampler: sampler;
        @group(1) @binding(1) var albedo: texture_2d<f32>;
    `
};




