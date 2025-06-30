import vertexShaderCode from "./shaders/lit_vert.wgsl?raw";
import unlitFragmentShaderCode from "./shaders/lit_frag.wgsl?raw";
import commonShaderHeader from "./shaders/common.wgsl?raw"
import { getDevice, primitive, depthStencil } from "./global-resources";
import { Vec2, Vec3, Vec4, vec3 } from "wgpu-matrix";
import { loadImageBitmap } from "./util";
import { albedoBindGroup, cameraUniform, dirLightUniform, getBuffer, globalUniform } from "./shader-resources";

interface ShaderProperties {
    textures: Record<string, TextureDef>;
    scalars: Record<string, number | Vec2 | Vec3 | Vec4>;
}

interface TextureDef {
    image: ImageBitmap;
    textureHandle: GPUTexture;
    uri: String;
}

export class Material {
    private pipeline!: GPURenderPipeline;

    public get getPipeline(): GPURenderPipeline {
        return this.pipeline;
    }

    private assembledShaderModule!: GPUShaderModule;

    private vertexCode: string = "";
    private fragmentCode: string = "";

    public readonly properties: ShaderProperties;
    
    private lightsBindGroup!: GPUBindGroup;

    get getLightsBindGroup() {
        return this.lightsBindGroup;
    }

    private materialBindGroup!: GPUBindGroup;

    get getMaterialBindGroup() {
        return this.materialBindGroup;
    }

    get ready() {
        return (
            this.lightsBindGroup != undefined &&
            this.materialBindGroup != undefined
        );
    }

    constructor(props: ShaderProperties, vert: string, frag: string) {
        this.properties = props;
        this.fragmentCode = frag;
        this.vertexCode = vert;

        this.compileShader();

        this.generatePipeline();

        this.generateCommonBindGroup();
        this.generateMaterialBindGroup();
    }

    generateStates = (): [GPUVertexState, GPUFragmentState] => {
        const positionBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 3 * 4,
            attributes: [
                {
                    format: "float32x3",
                    offset: 0,
                    shaderLocation: 0,
                },
            ],
        };
        const colorBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 3 * 4,
            attributes: [
                {
                    format: "float32x3",
                    offset: 0,
                    shaderLocation: 1,
                },
            ],
        };
        const nrmBufferLayour: GPUVertexBufferLayout = {
            arrayStride: 3 * 4,
            attributes: [
                {
                    shaderLocation: 2,
                    format: "float32x3",
                    offset: 0,
                },
            ],
        };
        const uvBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 2 * 4,
            attributes: [
                {
                    shaderLocation: 3,
                    format: "float32x2",
                    offset: 0,
                },
            ],
        };

        const vertex: GPUVertexState = {
            module: this.assembledShaderModule,
            entryPoint: "main_vert",
            buffers: [
                positionBufferLayout,
                colorBufferLayout,
                nrmBufferLayour,
                uvBufferLayout,
            ],
        };

        const fragment: GPUFragmentState = {
            module: this.assembledShaderModule,
            entryPoint: "main_frag",
            targets: [{ format: "bgra8unorm" }],
        };

        return [vertex, fragment];
    };

    async setTexture(propertyName: string, value: string) {
        const img = await loadImageBitmap(value);
        const texture = getDevice().createTexture({
            size: [img.width, img.height],
            format: "rgba8unorm",
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.properties.textures[propertyName] = {
            image: img,
            textureHandle: texture,
            uri: value,
        };

        this.generateMaterialBindGroup();
        img.close();
    }

    async generateCommonBindGroup() {
        const camBuffer = getBuffer("camera");
        const dirlightBuffer = getBuffer("dirLight");
        
        if (camBuffer && dirlightBuffer) {
            this.lightsBindGroup = getDevice().createBindGroup({
                layout: this.pipeline.getBindGroupLayout(1),
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: dirlightBuffer },
                    },
                    {
                        binding: 1,
                        resource: { buffer: camBuffer },
                    },
                ],
            });
        } else {
            throw new Error("Camera buffer not initialized");
        }

    }

    async generateMaterialBindGroup() {
        Object.entries(this.properties.textures).forEach(([_, texturedef]) => {
            const texture = texturedef;

            getDevice().queue.copyExternalImageToTexture(
                { source: texture.image },
                { texture: texture.textureHandle },
                [texture.image.width, texture.image.height]
            );
            const texView = texture.textureHandle.createView();
            const sampler = getDevice().createSampler({
                magFilter: "linear",
                minFilter: "linear",
            });
            this.materialBindGroup = getDevice().createBindGroup({
                layout: this.pipeline.getBindGroupLayout(2),
                entries: [
                    {
                        binding: 0,
                        resource: sampler,
                    },
                    {
                        binding: 1,
                        resource: texView,
                    },
                ],
            });
        });
    }

    generatePipeline() {
        const matricesBindGroupLayout = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" },
                },
            ],
        });

        const lightsBindGroupLayout = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                }
            ],
        });

        const materialBindGroupLayout = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: "filtering" },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: "float" },
                },
            ],
        });

        const [vertex, fragment] = this.generateStates();

        const pipelineLayout = getDevice().createPipelineLayout({
            bindGroupLayouts: [matricesBindGroupLayout, lightsBindGroupLayout, materialBindGroupLayout],
        });

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout: pipelineLayout,
            vertex,
            fragment,
            primitive,
            depthStencil,
        };

        this.pipeline = getDevice().createRenderPipeline(pipelineDesc);
    }

    compileShader() {
        const shaderSource = `
        ${globalUniform.wgsl}
        ${dirLightUniform.wgsl}
        ${cameraUniform.wgsl}
        ${albedoBindGroup.wgsl}

        ${commonShaderHeader}

        ${this.vertexCode}
        
        ${this.fragmentCode}
        `;
        try {
            this.assembledShaderModule = getDevice().createShaderModule({
                code: shaderSource,
            });
        } catch (error) {
            console.error(error);
        }
    }
}

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
    const unlitProperties: ShaderProperties = {
        textures: {
            albedo: {
                image: img,
                uri: "uv1.png",
                textureHandle: texture,
            },
        },
        scalars: {
            baseColor: vec3.fromValues(1, 1, 1),
        },
    };

    return new Material(
        unlitProperties,
        vertexShaderCode,
        unlitFragmentShaderCode
    );
};
