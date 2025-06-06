import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { createUnlitMaterial } from "./material";
import { MeshEntity } from "./mesh-entity";

const DEBUG = false;
const renderer = new WebGPURenderer();

const run = async () => {
    await renderer.init("viewport");

    // const entity = renderer.addEntity();
    // const entitymesh = entity.addMesh(generateCube());
    // entitymesh.material = await createUnlitMaterial();
    // entitymesh.material.setTexture("albedo", "./test.jpg");
    // entity.transform.translate(-3.3, 0, -1);
    // entity.transform.rotate(90, 0, 0);

    // const entity2 = renderer.addEntity();
    // const entity2mesh = entity2.addMesh(generateCube());
    // entity2mesh.material = await createUnlitMaterial();
    // entity2mesh.material.setTexture("albedo", "./test.jpg");
    // entity2.transform.translate(3.5, 0, 1);
    // entity2.transform.rotate(0, 0, 0);

    // const gltfMesh = await GLTFLoader.loadFile("./mesh/suzanne.gltf");
    // const gltfEntity = renderer.addEntity();
    // const gltfEntityMesh = gltfEntity.addMesh(gltfMesh);
    // gltfEntityMesh.material = await createUnlitMaterial();
    // gltfEntity.transform.setScale(1, 1, 1);
    // gltfEntity.transform.rotate(0, 45, 0);
    // gltfEntity.transform.translate(-3, 2.5, 0);

    const gltfMesh2 = await GLTFLoader.loadFile("./mesh/octo.gltf");
    const gltfEntity2 = new MeshEntity(gltfMesh2); 

    const mesh = gltfEntity2.mesh!;
    mesh.material = await createUnlitMaterial();
    await mesh.material.setTexture("albedo", "./mesh/octo.png");
    gltfEntity2.transform.setScale(3, 3, 3);
    gltfEntity2.transform.translate(0, 0, 0);
    renderer.addEntity(gltfEntity2);
};

export default () => {
    run();
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
