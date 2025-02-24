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

    // Separate position and color data into different arrays
    const positions = new Float32Array([
      1.0, -1.0, 0.0,  // Vertex 1
      -1.0, -1.0, 0.0, // Vertex 2
      0.0, 1.0, 0.0,   // Vertex 3
    ]);

    const colors = new Float32Array([
      1.0, 0.0, 0.0,  // Vertex 1
      0.0, 1.0, 0.0,  // Vertex 2
      0.0, 0.0, 1.0,  // Vertex 3
    ]);

    const indices = new Uint16Array([0, 1, 2]);

    const positionBuffer = device.createBuffer({
      label: "Positions",
      size: positions.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(positionBuffer, 0, positions);

    const colorBuffer = device.createBuffer({
      label: "Colors",
      size: colors.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(colorBuffer, 0, colors);

    const positionBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3 * 4, // 3 floats for position
      attributes: [
        {
          format: "float32x3",
          offset: 0,
          shaderLocation: 0,
        },
      ],
    };

    const colorBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 3 * 4, // 3 floats for color
      attributes: [
        {
          format: "float32x3",
          offset: 0,
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
      buffers: [positionBufferLayout, colorBufferLayout],
    };

    const fragmentShaderModule = device.createShaderModule({
      code: fragmentShaderCode,
    });
    const fragment: GPUFragmentState = {
      module: fragmentShaderModule,
      entryPoint: "main",
      targets: [{ format: canvasFormat }],
    };

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
        depthClearValue: 1.0,
        stencilClearValue: 0,
      },
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, positionBuffer);
    pass.setVertexBuffer(1, colorBuffer);
    pass.draw(positions.length / 3);

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