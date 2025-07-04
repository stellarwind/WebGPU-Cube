import { getDevice, getQueue, getDepthTextureView, initResources } from "./global-resources";
import { Entity } from "./entity";
import { defaultSettings } from "./settings";
import { Camera } from "./camera";
import { Input } from "./input";
import { MeshEntity } from "./mesh-entity";
import { LightEntity, LightType } from "./light";
import { dummyDirLight } from "./light-manager";
import { createBuffer, getBuffer } from "./shader-resources";

export class WebGPURenderer {
    private context: GPUCanvasContext | null = null;
    private canvasFormat!: GPUTextureFormat;

    private readonly entityList: Array<Entity> = [];
    private readonly meshEntityList: Array<MeshEntity> = [];

    private readonly lightEntityList: Array<LightEntity> = [];

    private get dirLight() {
        return this.lightEntityList.find((e) => e.type === LightType.Directional) ?? dummyDirLight;
    }

    private lastFrameMS: number = Date.now();

    private simpleOrbitCam!: Camera;

    private input!: Input;

    public async init(canvasId: string) {
        await initResources();
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            canvas.width = defaultSettings.resolution.width;
            canvas.height = defaultSettings.resolution.height;
        } else return;

        console.log("GPU Device initialized", getDevice());

        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.input = new Input("viewport");

        this.context = canvas.getContext("webgpu");
        if (this.context == null) return;

        this.context.configure({
            device: getDevice(),
            format: this.canvasFormat,
        });

        this.simpleOrbitCam = new Camera();

        createBuffer("camera", 32); // vec3 + pad0 + vec3 + pad1
        createBuffer("dirLight", 32); // vec3 + float32 + vec3 + pad0
        createBuffer("mvp", defaultSettings.maxStaticObjects * 256); // 256 byte align for bind group offsets
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

        this.simpleOrbitCam.orbitQuat(this.input.x * deltaTime, this.input.y * deltaTime, this.input.scrollDelta);
        const [projectionMatrix, viewMatrix] = this.simpleOrbitCam.update();

        const dirlightBuffer = getBuffer("dirLight");
        getQueue().writeBuffer(dirlightBuffer!, 0, this.dirLight.shaderData);

        const camBuffer = getBuffer("camera");
        getQueue().writeBuffer(camBuffer!, 0, this.simpleOrbitCam.shaderData);

        // Render meshes
        for (let i = 0; i < this.meshEntityList.length; i++) {
            const meshEntity = this.meshEntityList[i];
            const mesh = meshEntity.mesh;
            const material = mesh?.material;
            const pipe = material?.getPipeline;
            const mvpBuffer = getBuffer("mvp");

            if (!mesh || !pipe || !material.ready || !mvpBuffer) continue;

            pass.setPipeline(pipe);

            meshEntity.transform.calculateMVPMatrix(viewMatrix, projectionMatrix);

            const mvpBindGroup = meshEntity.mvpBindGroup;
            const lightsBindGroup = mesh.material.getLightsBindGroup;
            const matBindGroup = mesh.material.getMaterialBindGroup;
            const offset = i * 256;

            getDevice().queue.writeBuffer(mvpBuffer, offset, meshEntity.shaderData);

            pass.setBindGroup(0, mvpBindGroup);
            pass.setBindGroup(1, lightsBindGroup);
            pass.setBindGroup(2, matBindGroup);

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

    public addEntity(entity: Entity) {
        if (entity instanceof MeshEntity) {
            this.meshEntityList.push(entity);
            const offset = (this.meshEntityList.length - 1) * 256; // Todo refactor the naive approach that all entites are stacked nicely
            entity.generateMVPBindGroup(offset);
        } else if (entity instanceof LightEntity) {
            this.lightEntityList.push(entity);
        } else {
            this.entityList.push(entity);
        }
    }
}
