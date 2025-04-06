import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { createUnlitMaterial } from "./material";

const DEBUG = false;

const renderer = new WebGPURenderer();
await renderer.init("viewport");

const entity = renderer.addEntity();
const entitymesh = entity.addMesh(generateCube());
entitymesh.material = await createUnlitMaterial();
entitymesh.material.setTexture("albedo", "./test.jpg");
entity.translate(-3.3, 0, -1);

const entity2 = renderer.addEntity();
const entity2mesh = entity2.addMesh(generateCube());
entity2mesh.material = await createUnlitMaterial();
entity2mesh.material.setTexture("albedo", "./test.jpg");
entity2.translate(3.5, 0, 1);

const gltfMesh = await GLTFLoader.loadFile("./mesh/suzanne.gltf");
const gltfEntity = renderer.addEntity();
const gltfEntityMesh = gltfEntity.addMesh(gltfMesh);
gltfEntityMesh.material = await createUnlitMaterial();
gltfEntityMesh.material.setTexture("albedo", "./muscle.jpg");
gltfEntity.setScale(1.25, 1.25, 1.25);
gltfEntity.rotate(0, 45, 0);
gltfEntity.translate(0, 1.5, 0);

export default () => {
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
