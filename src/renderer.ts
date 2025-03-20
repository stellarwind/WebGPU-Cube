import { getDevice, getQueue, getDepthTextureView, initResources} from "./globalresources";
import { Entity } from "./entity";
import { mat4, } from "wgpu-matrix";
import { defaultSettings } from "./settings";

export class WebGPURenderer {
    private context: GPUCanvasContext | null = null;
    private canvasFormat!: GPUTextureFormat;
    private uniformBuffer!: GPUBuffer;
    private uniformBufferBindGroup!: GPUBindGroup;

    private readonly entityList: Array<Entity> = [];

    public async init(canvasId: string) {
        await initResources();

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            canvas.width = defaultSettings.resolution.width;
            canvas.height = defaultSettings.resolution.height;
        } else {
            return;
        }

        console.log("GPU Device initialized", getDevice());

        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context = canvas.getContext("webgpu");
        if (this.context == null) return;

        this.context.configure({
            device: getDevice(),
            format: this.canvasFormat,
        });
    }

    public renderFrame() {
        if (this.context == null) return;
        const encoder: GPUCommandEncoder = getDevice().createCommandEncoder();

        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
            depthStencilAttachment: {
                view: getDepthTextureView(),
                depthLoadOp: "clear",
                depthStoreOp: "store",
                stencilLoadOp: "clear",
                stencilStoreOp: "store",
                depthClearValue: 1.0,
                stencilClearValue: 0,
            },
        });

        
        // TODO Move to Camera class
        const fov = (60 * Math.PI) / 180;
        const aspect =
        defaultSettings.resolution.width /
        defaultSettings.resolution.height;
        const near = 0.1;
        const far = 1000.0;
        
        const projectionMatrix = mat4.perspective(fov, aspect, near, far);
        
        const viewMat = mat4.lookAt(
            [0, 0, 0], //eye
            [0, 0, -1], //target
            [0, 1, 0] //up
        );
        // ENDTODO
        
        for (let i = 0; i < this.entityList.length; i++) {
            const pipe = this.entityList[i].mesh?.getMaterial.getPipeline;

            if (pipe === undefined) return;

            pass.setPipeline(pipe);

            this.entityList[i].calculateMVPMatrix(viewMat, projectionMatrix);

            const mvpArray = new Float32Array(this.entityList[i].mvpMatrix);
            getQueue().writeBuffer(
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
        getQueue().submit([commandBuffer]);
    }

    public addEntity(): Entity {
        const entity = new Entity();
        this.entityList.push(entity);
        return entity;
    }
}
