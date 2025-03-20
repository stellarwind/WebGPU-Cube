import vertexShaderCode from "./shaders/core_v.wgsl?raw";
import unlitFragmentShaderCode from "./shaders/core_f.wgsl?raw";
import { getDevice, primitive, depthStencil } from "./globalresources";
import { Vec2, Vec3, Vec4, vec3 } from "wgpu-matrix";
import { loadImageBitmap } from "./util";

interface ShaderProperties {
    textures: Record<string, GPUTexture>;
    scalars: Record<string, number | Vec2 | Vec3 | Vec4>;
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

    generateCommonBindGroup = async () => {
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
    };

    generateMaterialBindGroup = async () => {
        // TODO remove default texture
        const img = await loadImageBitmap("uv1.png");
        const texture = getDevice().createTexture({
            size: [img.width, img.height],
            format: "rgba8unorm",
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        getDevice().queue.copyExternalImageToTexture(
            { source: img },
            { texture: texture },
            [img.width, img.height]
        );
        const texView = texture.createView();
        const sampler = getDevice().createSampler({
            magFilter: "linear",
            minFilter: "linear",
        });
        img.close();

        this.materialBindGroup = getDevice().createBindGroup({
            layout: this.pipeline.getBindGroupLayout(1),
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
    };

    generatePipeline = () => {
        const [vertex, fragment] = this.generateStates();

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout: "auto",
            vertex,
            fragment,
            primitive,
            depthStencil,
        };

        this.pipeline = getDevice().createRenderPipeline(pipelineDesc);
    };

    compileShader = () => {
        const bindGroupHeader0 = `@binding(0) @group(0) var<uniform> uniforms : Uniforms;`;

        //TODO this one should be generated
        const bindGroupHeader1 = `
            @group(1) @binding(0) var albedoSampler: sampler;
            @group(1) @binding(1) var albedo: texture_2d<f32>;
            `;

        const shaderSource = `
        ${bindGroupHeader0}
        ${bindGroupHeader1}

        
        ${this.vertexCode}
        

        ${this.fragmentCode}
        `;

        console.log(shaderSource);

        try {
            this.assembledShaderModule = getDevice().createShaderModule({
                code: shaderSource,
            });
        } catch (error) {
            console.error(error);
        }
    };
}


export const createUnlitMaterial = (): Material => {
    const unlitProperties: ShaderProperties = {
        textures: {
            albedo: getDevice().createTexture({
                size: [512, 512, 1],
                format: "rgba8unorm",
                usage: GPUTextureUsage.TEXTURE_BINDING,
            }),
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

