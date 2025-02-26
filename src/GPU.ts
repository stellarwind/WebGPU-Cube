let device: GPUDevice;
let queue: GPUQueue;

export async function initializeGPU() {
    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPU Adapter found!");
    }
    device = await adapter.requestDevice();
    queue = device.queue;
}

export function getDevice(): GPUDevice {
    return device;
}

export function getQueue(): GPUQueue {
    return queue;
}
