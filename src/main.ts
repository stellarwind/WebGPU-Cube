import { initializeGPU } from "./GPU.ts";
import vertexShaderCode from "./shaders/core_v.wgsl?raw";
import fragmentShaderCode from "./shaders/core_f.wgsl?raw";

export async function main() {
  try {
    const device: GPUDevice = await initializeGPU();

    console.log("GPU Device initialized", device);

    const canvas = document.querySelector("#viewport") as HTMLCanvasElement;
    const context = canvas.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const encoder: GPUCommandEncoder = device.createCommandEncoder();
    let queue: GPUQueue = device.queue;

    if (context == null) return;

    context.configure({
      device: device,
      format: canvasFormat,
    });

    let depthTexture: GPUTexture;
    let depthTextureView: GPUTextureView;

    let colorTexture: GPUTexture;
    let colorTextureView: GPUTextureView;

    const depthTextureDsc: GPUTextureDescriptor = {
      size: [canvas.width, canvas.height, 1],
      dimension: "2d",
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    };

    depthTexture = device.createTexture(depthTextureDsc);
    depthTextureView = depthTexture.createView();

    //position - 3 float + color - 3 floats
    const verts = new Float32Array([
      1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
       -1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
    ]);

    const indices = new Uint16Array([0, 1, 2]);

    const vertexBuffer = device.createBuffer({
      label: "Vertices",
      size: verts.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, 0, verts);

    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 6 * 4,
      attributes: [
        {
          format: "float32x3",
          offset: 0,
          shaderLocation: 0,
        },
        {
          format: "float32x3",
          offset: 3 * 4,
          shaderLocation: 1,
        },
      ],
    };

    const vertexShaderModule = device.createShaderModule({
      code: vertexShaderCode,
    });

    const vertex: GPUVertexState = {
      module: vertexShaderModule,
      entryPoint: "main",
      buffers: [vertexBufferLayout],
    };

    const fragmentShaderModule = device.createShaderModule({
      code: fragmentShaderCode,
    });
    const fragment: GPUFragmentState = {
      module: fragmentShaderModule,
      entryPoint: "main",
      targets: [{ format: canvasFormat }],
    }

    const primitive: GPUPrimitiveState = {
      frontFace: "cw",
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
    const pipeline = device.createRenderPipeline(pipelineDesc);

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTextureView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        stencilLoadOp: "clear",
        stencilStoreOp: "store",
        depthClearValue: 1.0
      },
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(verts.length / 6);

    pass.end();

    const commandBuffer = encoder.finish();
    queue.submit([commandBuffer]);

    colorTexture = context.getCurrentTexture();
    colorTextureView = colorTexture.createView();

    console.log("frame delivered in X ms");
  } catch (error) {
    console.error("Failed to initialize GPU in main.ts:", error);
  }
}