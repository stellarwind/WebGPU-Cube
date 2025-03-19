import vertexShaderCode from "./shaders/core_v.wgsl?raw";
import fragmentShaderCode from "./shaders/core_f.wgsl?raw";
import { getDevice } from "./GPU";

class ShaderProperties {
    baseColor: [number, number, number];
    metalness: [number, number, number];
    roughness: [number, number, number];
    specular: number;
    emissiveColor: [number, number, number];

    constructor(
        baseColor: [number, number, number] = [0, 0, 0],
        metalness: [number, number, number] = [0, 0, 0],
        roughness: [number, number, number] = [0, 0, 0],
        specular: number = 1,
        emissiveColor: [number, number, number] = [0, 0, 0]
    ) {
        this.baseColor = baseColor;
        this.metalness = metalness;
        this.roughness = roughness;
        this.specular = specular;
        this.emissiveColor = emissiveColor;
    }
}

export class Material {
    private pipeline!: GPURenderPipeline;
    private bindGroupLayout!: GPUBindGroupLayout;
    private bindGroup!: GPUBindGroup;

    private assembledShaderModule!: GPUShaderModule;

    public readonly properties: ShaderProperties;

    constructor(props: ShaderProperties) {
        let device = getDevice();

        this.properties = props;
        this.compileShader();
    }

    compileShader = () => {
        const bindgroupsHeader = " ";
        const vertfrag =
            bindgroupsHeader +
            "\n" +
            vertexShaderCode +
            "\n" +
            fragmentShaderCode;
    };
}
