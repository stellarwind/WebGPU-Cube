import { Material, ShaderProperties } from "./material";
import { loadImageBitmap } from "./util";
import { getDevice } from "./global-resources";

import coreVertex from "./shaders/base/core_vert.wgsl?raw";
import litMaterialFragment from "./shaders/lit_frag.wgsl?raw";
import unlitMaterialFragment from "./shaders/unlit_frag.wgsl?raw";
import { Scalar } from "./scalar";
import { vec3, vec4 } from "wgpu-matrix";

export const createLitMaterial = async (): Promise<Material> => {
    const img = await loadImageBitmap("uv1.png");
    const texture = getDevice().createTexture({
        size: [img.width, img.height],
        format: "rgba8unorm",
        usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const litProperties: ShaderProperties = {
        textures: {
            albedo: {
                image: img,
                uri: "uv1.png",
                textureHandle: texture,
            },
        },
        scalars: undefined
    };

    return new Material(
        litProperties,
        coreVertex,
        litMaterialFragment
    );
};

export const createUnlitMaterial = async (): Promise<Material> => {
    const img = await loadImageBitmap("uv1.png");
    const texture = getDevice().createTexture({
        size: [img.width, img.height],
        format: "rgba8unorm",
        usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const unlitProperties: ShaderProperties = {
        textures: {
            albedo: {
                image: img,
                uri: "uv1.png",
                textureHandle: texture,
            },
        },
        scalars: [...exampleScalars],
    };

    return new Material(
        unlitProperties,
        coreVertex,
        unlitMaterialFragment
    );
};


// Test scalars!!
// Todo santize names so they're usable in WGSL
export const exampleScalars: Scalar[] = [
    {
        name: "Float scalar",
        type: "f32",
        value: new Float32Array([6.66]),
    },
    {
        name: "Vec4_scalar",
        type: "vec4f",
        value: vec4.create(Math.random(), Math.random(), Math.random(), 1.0),
    },
    {
        name: "Another float scalar",
        type: "f32",
        value: new Float32Array([1666]),
    },
    {
        name: "Vec3_scalar",
        type: "vec3f",
        value: new Float32Array([Math.random() * 10, Math.random() * 10, Math.random() * 10]),
    },
    {
        name: "Vec2_scalar",
        type: "vec2f",
        value: new Float32Array([1920, 1080]),
    },
];
