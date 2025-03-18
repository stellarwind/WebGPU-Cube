import { getDevice, getQueue, initializeGPU } from "./GPU.ts";
import vertexShaderCode from "./shaders/core_v.wgsl?raw";
import fragmentShaderCode from "./shaders/core_f.wgsl?raw";
import { Mesh } from "./mesh.ts";
import { Entity } from "./entity.ts";
import { mat4, } from "wgpu-matrix";

export class WebGPURenderer {
    private context: GPUCanvasContext | null = null;
    private canvasFormat!: GPUTextureFormat;
    private device!: GPUDevice;
    private queue!: GPUQueue;
    private pipeline!: GPURenderPipeline;
    private uniformBuffer!: GPUBuffer;
    private uniformBufferBindGroup!: GPUBindGroup;
    private depthTextureView!: GPUTextureView;

    private readonly entityList: Array<Entity> = [];

    public async init() {
        await initializeGPU();
        this.device = getDevice();
        this.queue = getQueue();

        console.log("GPU Device initialized", this.device);

        const canvas = document.querySelector("#viewport") as HTMLCanvasElement;
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context = canvas.getContext("webgpu");
        if (this.context == null) return;

        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
        });

        const depthTextureDsc: GPUTextureDescriptor = {
            size: [canvas.width, canvas.height, 1],
            dimension: "2d",
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        };

        const depthTexture = this.device.createTexture(depthTextureDsc);
        this.depthTextureView = depthTexture.createView();


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

        const vertexShaderModule = this.device.createShaderModule({
            code: vertexShaderCode,
        });

        const vertex: GPUVertexState = {
            module: vertexShaderModule,
            entryPoint: "main",
            buffers: [positionBufferLayout, colorBufferLayout, nrmBufferLayour, uvBufferLayout],
        };

        const fragmentShaderModule = this.device.createShaderModule({
            code: fragmentShaderCode,
        });

        const fragment: GPUFragmentState = {
            module: fragmentShaderModule,
            entryPoint: "main",
            targets: [{ format: this.canvasFormat }],
        };

        const primitive: GPUPrimitiveState = {
            cullMode: "none",
            topology: "triangle-list",
        };

        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: "less",
            format: "depth24plus-stencil8",
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout: "auto",
            vertex,
            fragment,
            primitive,
            depthStencil,
        };

        this.pipeline = this.device.createRenderPipeline(pipelineDesc);

        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 16, // 4x4 MVP * 4 bytes float
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.uniformBufferBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
            ],
        });
    }

    public renderFrame() {
        if (this.context == null) return;
        const encoder: GPUCommandEncoder = this.device.createCommandEncoder();


        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
            depthStencilAttachment: {
                view: this.depthTextureView,
                depthLoadOp: "clear",
                depthStoreOp: "store",
                stencilLoadOp: "clear",
                stencilStoreOp: "store",
                depthClearValue: 1.0,
                stencilClearValue: 0,
            },
        });

        pass.setPipeline(this.pipeline);

        const fov = 60 * Math.PI / 180; 
        const aspect = 512 / 512;
        const near = 0.1;
        const far = 1000.0;

        const projectionMatrix = mat4.perspective(fov, aspect, near, far);

        const viewMat = mat4.lookAt(
            [0, 0, 0], //eye
            [0, 0, -1],  //target
            [0, 1, 0]   //up
        );

        for (let i = 0; i < this.entityList.length; i++) {
            
            this.entityList[i].calculateMVPMatrix(
                viewMat,
                projectionMatrix
            );
            
            const mvpArray = new Float32Array(this.entityList[i].mvpMatrix);
            this.device.queue.writeBuffer(
                this.uniformBuffer,
                0,
                mvpArray.buffer,
                mvpArray.byteOffset,
                mvpArray.byteLength
            );
            
            const mesh = this.entityList[i].mesh;
            if (mesh === null) continue;

            pass.setBindGroup(0, this.uniformBufferBindGroup);

            pass.setVertexBuffer(0, mesh.positionBuffer);
            pass.setVertexBuffer(1, mesh.colorBuffer);
            pass.setVertexBuffer(2, mesh.normalBuffer);
            pass.setVertexBuffer(3, mesh.uvBuffer);
            pass.setIndexBuffer(mesh.indexBuffer, "uint16");

            pass.drawIndexed(mesh.indexCount);
        }

        pass.end();

        const commandBuffer = encoder.finish();
        this.queue.submit([commandBuffer]);
    }

    public addEntity(): Entity {
        const entity = new Entity();
        this.entityList.push(entity);
        return entity;
    }

    private createTexture(imgBitmap: ImageBitmap): GPUTexture {
        const texture = this.device.createTexture({
            size: { width: imgBitmap.width, height: imgBitmap.height, depthOrArrayLayers: 1 },
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.device.queue.copyExternalImageToTexture({source: imgBitmap}, {texture: texture}, [imgBitmap.width, imgBitmap.height, 1]);

        return texture;

    }

}
