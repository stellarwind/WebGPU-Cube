import vertexShaderCode from "./shaders/lit_vert.wgsl?raw";
import unlitFragmentShaderCode from "./shaders/lit_frag.wgsl?raw";
import { getDevice, primitive, depthStencil } from "./global-resources";
import { Vec2, Vec3, Vec4, vec3 } from "wgpu-matrix";
import { loadImageBitmap } from "./util";
import { LightEntity } from "./light";

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
    private MVPUniformBuffer!: GPUBuffer;

    get getMVPUniformBuffer() {
        return this.MVPUniformBuffer;
    }
    private commonBindGroup!: GPUBindGroup;

    get getCommonBindGroup() {
        return this.commonBindGroup;
    }

    private materialBindGroup!: GPUBindGroup;

    get getMaterialBindGroup() {
        return this.materialBindGroup;
    }

    private lightsBindGroup!: GPUBindGroup;

    get getLightsBindGroup() {
        return this.lightsBindGroup;
    }

    get ready() {
        return (
            this.commonBindGroup != undefined &&
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
        this.generateLightsBindGroup();
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
        this.MVPUniformBuffer = getDevice().createBuffer({
            size: 4 * 16, // 4x4 MVP * 4 bytes float
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.commonBindGroup = getDevice().createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.MVPUniformBuffer,
                    },
                },
            ],
        });
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
                layout: this.pipeline.getBindGroupLayout(1), //TODO increase layout index for each texture
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

    async generateLightsBindGroup() {
        this.lightsBindGroup = getDevice().createBindGroup({
            layout: this.pipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: LightEntity.dirLightBuffer },
                },
            ],
        });
    }

    generatePipeline() {
        const layout0 = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" },
                },
            ],
        });

        const layout1 = getDevice().createBindGroupLayout({
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

        const layout2 = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
            ],
        });

        const [vertex, fragment] = this.generateStates();

        const pipelineLayout = getDevice().createPipelineLayout({
            bindGroupLayouts: [layout0, layout1, layout2],
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
        const bindGroupHeader0 = `

        struct Uniforms {
            mvpMatrix: mat4x4f
        }
        @binding(0) @group(0) var<uniform> uniforms: Uniforms;`;

        //TODO this one should be generated
        const bindGroupHeader1 = `
            @group(1) @binding(0) var albedoSampler: sampler;
            @group(1) @binding(1) var albedo: texture_2d<f32>;
        `;

        const lightBindGroupHeader0 = `
            struct DirLight {
                forward: vec3f,
                intensity: f32,
                color: vec3f,
                pad0: f32
            }
            @group(2) @binding(0) var<uniform> dirLight: DirLight;
        `;

        const shaderSource = `
        ${bindGroupHeader0}
        ${bindGroupHeader1}
        ${lightBindGroupHeader0}

        
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
