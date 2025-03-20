import { getDevice, getQueue, getDepthTextureView, initResources} from "./globalresources";
import { Entity } from "./entity";
import { mat4, } from "wgpu-matrix";
import { defaultSettings } from "./settings";
import { Camera } from "./camera";

export class WebGPURenderer {
    private context: GPUCanvasContext | null = null;
    private canvasFormat!: GPUTextureFormat;

    private readonly entityList: Array<Entity> = [];

    private mainCam: Camera = new Camera;

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

        let [viewMatrix, projectionMatrix] = this.mainCam.update();

        for (let i = 0; i < this.entityList.length; i++) {
            const mesh = this.entityList[i].mesh;

            if (mesh === null) continue;

            const pipe = mesh.getMaterial.getPipeline;

            if (pipe === undefined) return;

            pass.setPipeline(pipe);

            this.entityList[i].calculateMVPMatrix(viewMatrix, projectionMatrix);

            const mvpArray = new Float32Array(this.entityList[i].mvpMatrix);
            getQueue().writeBuffer(
                mesh.getMaterial.getMVPUniformBuffer,
                0,
                mvpArray.buffer,
                mvpArray.byteOffset,
                mvpArray.byteLength
            );

            
            const commondBindGrp = mesh.getMaterial.getCommonBindGroup;
            const matBindGrp = mesh.getMaterial.getMaterialBindGroup;

            pass.setBindGroup(0, commondBindGrp);
            pass.setBindGroup(1, matBindGrp);

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
