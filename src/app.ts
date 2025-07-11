import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { MeshEntity } from "./mesh-entity";
import { LightEntity, LightType } from "./light";
import { vec3, vec4 } from "wgpu-matrix";
import { createLitMaterial, createUnlitMaterial } from "./material-library";

const DEBUG = false;
const renderer = new WebGPURenderer();

const run = async () => {
    await renderer.init("viewport");

    const cubeMesh = generateCube();
    const cubeEntity = new MeshEntity(cubeMesh);
    cubeMesh.material = await createUnlitMaterial();
    cubeEntity.transform.translate(3.5, 0, 1);
    renderer.addEntity(cubeEntity);
    cubeMesh.material.setScalar("testcolor", vec4.create(1.0, 0, 1.0, 1.0));


    const gltfMesh2 = await GLTFLoader.loadFile("./mesh/octo.gltf");
    const gltfEntity2 = new MeshEntity(gltfMesh2); 
    const mesh = gltfEntity2.mesh!;
    mesh.material = await createLitMaterial();
    await mesh.material.setTexture("albedo", "./mesh/octo.png");
    gltfEntity2.transform.setScale(3, 3, 3);
    renderer.addEntity(gltfEntity2);

    const dirLight = new LightEntity({
        type: LightType.Directional,
        intensity: 1.0,
        color: vec3.create(1, 1 ,1)
    });
    dirLight.transform.rotate(45, -45, 0);
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
