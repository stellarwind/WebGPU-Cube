import { getDevice, getQueue, initializeGPU } from "./GPU.ts";
import vertexShaderCode from "./shaders/core_v.wgsl?raw";
import fragmentShaderCode from "./shaders/core_f.wgsl?raw";
import { Mesh } from "./mesh.ts";

export class WebGPURenderer {
  private device!: GPUDevice;
  private queue!: GPUQueue;
  private pipeline!: GPURenderPipeline;
  // private positionBuffer!: GPUBuffer;
  // private colorBuffer!: GPUBuffer;
  private depthTextureView!: GPUTextureView;
  private canvasFormat!: GPUTextureFormat;
  private context: GPUCanvasContext | null = null;

  private readonly meshList: Array<Mesh> = [];

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

    const vertexShaderModule = this.device.createShaderModule({
      code: vertexShaderCode,
    });

    const vertex: GPUVertexState = {
      module: vertexShaderModule,
      entryPoint: "main",
      buffers: [positionBufferLayout, colorBufferLayout],
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

    this.pipeline = this.device.createRenderPipeline(pipelineDesc);
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
    for (let i = 0; i < this.meshList.length; i++) {
      const mesh = this.meshList[i];
      pass.setVertexBuffer(0, mesh.positionBuffer);
      pass.setVertexBuffer(1, mesh.colorBuffer);
  
      // 3 Floats - 4 bytes per vertex
      pass.draw(mesh.positionBuffer.size / 12);
    }

    pass.end();

    const commandBuffer = encoder.finish();
    this.queue.submit([commandBuffer]);
  }

  public createTriangle(colors?: Array<number>) {
    const positions = new Array(1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0);
    const indices = new Array(0, 1, 2);

    const mesh = new Mesh(positions, indices, colors);

    this.meshList.push(mesh);
  }
}
