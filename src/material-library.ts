import { Material, ShaderProperties } from "./material";
import { loadImageBitmap } from "./util";
import { getDevice } from "./global-resources";
import { vec3 } from "wgpu-matrix";

import coreVertex from "./shaders/base/core_vert.wgsl?raw";
import litMaterialFragment from "./shaders/lit_frag.wgsl?raw";
import unlitMaterialFragment from "./shaders/unlit_frag.wgsl?raw";

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
        scalars: {
            baseColor: { value: vec3.fromValues(1, 1, 1), type: "vec3" },
        },
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
        scalars: undefined,
    };

    return new Material(
        unlitProperties,
        coreVertex,
        unlitMaterialFragment
    );
};
