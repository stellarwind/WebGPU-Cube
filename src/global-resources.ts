import { mat4 } from "wgpu-matrix";
import { defaultSettings } from "./settings";

let device: GPUDevice;
let queue: GPUQueue;
let depthTexture: GPUTexture;
let depthTextureView: GPUTextureView;

export async function initResources() {
    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();

    if (!adapter) {
        throw new Error("No appropriate GPU Adapter found!");
    }

    device = await adapter.requestDevice();
    queue = device.queue;

    initDepthTexture();
}

export function getDevice(): GPUDevice {
    return device;
}

export function getQueue(): GPUQueue {
    return queue;
}
export const primitive: GPUPrimitiveState = {
    cullMode: "none",
    topology: "triangle-list",
};

export const projectionMatrix = mat4.perspective(
    (2 * Math.PI) / 5,
    defaultSettings.resolution.width / defaultSettings.resolution.height,
    1,
    100.0
);

export const depthStencil: GPUDepthStencilState = {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus-stencil8",
};

function initDepthTexture() {
    depthTexture = device.createTexture({
        size: [
            defaultSettings.resolution.width,
            defaultSettings.resolution.height,
            1,
        ],
        dimension: "2d",
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    depthTextureView = depthTexture.createView();
}

export function getDepthTextureView(): GPUTextureView {
    return depthTexture.createView();
}
