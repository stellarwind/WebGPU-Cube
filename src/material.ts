import commonShaderHeader from "./shaders/common.wgsl?raw"
import { getDevice, primitive, depthStencil } from "./global-resources";
import { alignByteOffset, loadImageBitmap } from "./util";
import { albedoBindGroup, cameraUniform, dirLightUniform, getBuffer, globalUniform, scalarsUniform } from "./shader-resources";
import { Scalar, scalarMemoryLayout } from "./scalar";

export interface ShaderProperties {
    textures: TextureDef[] | undefined;
    scalars: Scalar[] | undefined,
}

export interface TextureDef {
    name: String,
    image: ImageBitmap,
    textureHandle: GPUTexture,
    uri: String,
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
    private lightsBindGroupLayout!: GPUBindGroupLayout;

    get getLightsBindGroup() {
        return this.lightsBindGroup;
    }

    private materialBindGroup!: GPUBindGroup;

    private scalarBindingShaderChunk: string = "";

    private materialBindGroupEntries: GPUBindGroupEntry[] = [];
    private materialBindGrouplayoutEntries: GPUBindGroupLayoutEntry[] = [];
    private materialBindGroupLayout!: GPUBindGroupLayout;

    private scalarBuffer!: GPUBuffer;

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

        this.generateLightsBindGroup();


        this.generateTextureEntries();
        
        this.compileShader();

        this.generatePipeline();
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
        if (!this.properties.textures) return;

        const img = await loadImageBitmap(value);
        const texture = getDevice().createTexture({
            size: [img.width, img.height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        const index = this.properties.textures?.findIndex((t) => t.name === propertyName);

        if (index !== undefined && index !== -1) {
            const newTexture: TextureDef = {
                name: propertyName,
                image: img,
                textureHandle: texture,
                uri: value,
            };
            this.properties.textures![index] = newTexture;
            this.generateTextureEntries();
            img.close();
        }
    }

    async generateLightsBindGroup() {
        const camBuffer = getBuffer("camera");
        const dirlightBuffer = getBuffer("dirLight");
        
        if (camBuffer && dirlightBuffer) {
            this.lightsBindGroupLayout = getDevice().createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" },
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: { type: "uniform" },
                    },
                ],
            });

            this.lightsBindGroup = getDevice().createBindGroup({
                layout: this.lightsBindGroupLayout,
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

    async generateScalarEntries() {
        this.materialBindGrouplayoutEntries.push({
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform",
            },
        });

        if (this.properties.scalars !== undefined) {
            const scalarData: number[] = [];
            let scalarShaderStruct: string = "";

            // Sorting the array of scalars by their size to avoid extra padding
            this.properties.scalars.sort((scalarA, scalarB): number => {
                if (scalarMemoryLayout[scalarA.type].size < scalarMemoryLayout[scalarB.type].size) return 1;
                if (scalarMemoryLayout[scalarA.type].size > scalarMemoryLayout[scalarB.type].size) return -1;
                return 0;
            });

            let index = 0;
            let offset = 0;

            this.properties.scalars.forEach((scalar) => {
                const final = index + 1 == this.properties.scalars?.length ? true : false;
                const alignment = scalarMemoryLayout[scalar.type].alignment;
                const aligned = offset % alignment == 0;
                const nextAligned = alignByteOffset(offset, alignment);

                if (!aligned) {
                    const padCount = (nextAligned - offset) / 4;

                    for (let i = 0; i < padCount; i++) {
                        scalarData.push(0); // Add pads to reach the alignment
                        offset += 4;
                    }
                }
                scalarData.push(...scalar.value);

                if (scalar.type == "vec3f") {
                    scalarData.push(0);
                    offset += 4;
                } // Padding vec3f to vec4f. Todo smartly check if next scalar is already 4 bytes

                scalarShaderStruct += `${scalar.name} : ${scalar.type} \n`;

                offset += scalarMemoryLayout[scalar.type].size;
                index++;

                if (final) {
                    const finalPad = (alignByteOffset(offset, 16) - offset) / 4;
                    for (let i = 0; i < finalPad; i++) {
                        scalarData.push(0); // Final padding so whole uniform buffer is aligned to 16 bytes
                    }
                }
            });

            const scalarDataRaw = new Float32Array(scalarData); 
            const scalarByteLength = scalarData.length * 4;

            this.scalarBuffer = getDevice().createBuffer({
                size: scalarByteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            getDevice().queue.writeBuffer(
                this.scalarBuffer,
                0,
                scalarDataRaw.buffer,
            );
            this.scalarBindingShaderChunk = scalarsUniform.wgsl.replace("{{SCALAR_BLOCK}}", scalarShaderStruct);

            this.materialBindGroupEntries.push({
                binding: 0,
                resource: {
                    buffer: this.scalarBuffer,
                },
            });
        }
    }

    async generateTextureEntries() { 
         this.materialBindGroupLayout = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: "filtering" },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: "float" },
                },
            ],
        });

        if (this.properties.textures !== undefined) {
            for (let i = 0; i < this.properties.textures.length; i++) {
                const texture = this.properties.textures[i];
    
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
                    layout: this.materialBindGroupLayout,
                    entries: [
                        {
                            binding: 1,
                            resource: sampler,
                        },
                        {
                            binding: 2,
                            resource: texView,
                        },
                    ],
                });
            }
        }

      
    }

    generatePipeline() {
        // TODO Doesn't make sense to it keep here
        const matricesBindGroupLayout = getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" },
                },
            ],
        });

        const [vertex, fragment] = this.generateStates();

        const pipelineLayout = getDevice().createPipelineLayout({
            bindGroupLayouts: [matricesBindGroupLayout, this.lightsBindGroupLayout, this.materialBindGroupLayout],
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

