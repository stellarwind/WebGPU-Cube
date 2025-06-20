import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { createLitMaterial } from "./material";
import { MeshEntity } from "./mesh-entity";
import { LightEntity, LightType } from "./light";
import { vec3 } from "wgpu-matrix";

const DEBUG = false;
const renderer = new WebGPURenderer();

const run = async () => {
    await renderer.init("viewport");

    const cubeMesh = generateCube();
    const cubeEntity = new MeshEntity(cubeMesh);
    cubeMesh.material = await createLitMaterial();
    cubeMesh.material.setTexture("albedo", "./test.jpg");
    cubeEntity.transform.translate(3.5, 0, 1);
    renderer.addEntity(cubeEntity);

    const gltfMesh2 = await GLTFLoader.loadFile("./mesh/octo.gltf");
    const gltfEntity2 = new MeshEntity(gltfMesh2); 

    const mesh = gltfEntity2.mesh!;
    mesh.material = await createLitMaterial();
    await mesh.material.setTexture("albedo", "./mesh/octo.png");
    gltfEntity2.transform.setScale(3, 3, 3);
    gltfEntity2.transform.translate(0, 0, 0);
    renderer.addEntity(gltfEntity2);

    const dirLight = new LightEntity({
        type: LightType.Directional,
        intensity: 1.0,
        color: vec3.create(1, 1 ,0)
    });
    dirLight.transform.rotate(45, 45, 0);
    renderer.addEntity(dirLight);
};

export default async () => {
    await run();
    let lastFrameTime = performance.now();
    const renderLoop = () => {
        const currentFrame = performance.now() - lastFrameTime;
        lastFrameTime = performance.now();
        if (DEBUG) console.log(currentFrame + " ms");

        renderer.renderFrame();
        requestAnimationFrame(renderLoop);
    };

    renderLoop();
};
