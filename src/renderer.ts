import {
    getDevice,
    getQueue,
    getDepthTextureView,
    initResources,
    projectionMatrix,
} from "./globalresources";
import { Entity } from "./entity";
import { defaultSettings } from "./settings";
import { ArcballCamera } from "./camera";
import { createInputHandler, InputHandler } from "./input";
import { utils, vec3 } from "wgpu-matrix";
import { CameraSimple } from "./CamSImple";

export class WebGPURenderer {
    private context: GPUCanvasContext | null = null;
    private canvasFormat!: GPUTextureFormat;

    private readonly entityList: Array<Entity> = [];

    private mainCam!: ArcballCamera;

    private lastFrameMS: number = Date.now();

    private inputHandler!: InputHandler;

    private camSimpleLol!: CameraSimple;

    public async init(canvasId: string) {
        await initResources();
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            canvas.width = defaultSettings.resolution.width;
            canvas.height = defaultSettings.resolution.height;
        } else return;

        this.inputHandler = createInputHandler(window, canvas);

        console.log("GPU Device initialized", getDevice());

        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context = canvas.getContext("webgpu");
        if (this.context == null) return;

        this.context.configure({
            device: getDevice(),
            format: this.canvasFormat,
        });

        this.mainCam = new ArcballCamera({ position: vec3.create(6, 6, 6) });

        this.camSimpleLol = new CameraSimple();
    }

    public renderFrame() {
        if (this.context == null) return;

        const now = Date.now();
        const deltaTime = (now - this.lastFrameMS) / 1000;
        this.lastFrameMS = now;

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

        // const viewMatrix = this.mainCam.update(deltaTime, this.inputHandler());
        this.camSimpleLol.orbit(utils.degToRad(65), 0, 5);
        const [projectionMatrix, viewMatrix] = this.camSimpleLol.update(); 

        for (let i = 0; i < this.entityList.length; i++) {
            const mesh = this.entityList[i]?.mesh;
            const material = mesh?.getMaterial;
            const pipe = material?.getPipeline;

            if (!mesh || !pipe || !material.ready) continue;

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
