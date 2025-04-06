import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { createUnlitMaterial } from "./material";

const DEBUG = false;

const renderer = new WebGPURenderer();
await renderer.init("viewport");

const entity = renderer.addEntity();
entity.addMesh(generateCube());
if (entity.mesh) {
    entity.mesh.material = await createUnlitMaterial();
    entity.mesh.material.setTexture("albedo", "./test.jpg");
    entity.translate(-3.3, 0, -1);
}
const entity2 = renderer.addEntity();
entity2.addMesh(generateCube());
if (entity2.mesh) {
    entity2.mesh.material = await createUnlitMaterial();
    entity2.mesh.material.setTexture("albedo", "./test.jpg");
    entity2.translate(3.5, 0, 1);
}
const gltfMesh = await GLTFLoader.loadFile("./mesh/suzanne.gltf");
const gltfEntity = renderer.addEntity();
gltfEntity.addMesh(gltfMesh);
if (gltfEntity.mesh) {
    gltfEntity.mesh.material = await createUnlitMaterial();
    gltfEntity.mesh.material.setTexture("albedo", "./uv1.jpg");
    gltfEntity.setScale(2, 2, 2);
}
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
