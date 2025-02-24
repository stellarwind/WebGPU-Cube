export async function initializeGPU() {
    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPU Adapter found!");
    }
    return await adapter.requestDevice();
}
