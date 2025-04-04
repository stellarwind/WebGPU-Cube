import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";

const DEBUG = false;

const renderer = new WebGPURenderer();
await renderer.init("viewport");

const entity = renderer.addEntity();
entity.addMesh(generateCube());
entity.translate(-5, 0, -1);

// const entity2 = renderer.addEntity();
// entity2.addMesh(generateCube());
// entity.setScale(1, 2, 1);

const gltfMesh = await GLTFLoader.loadFile("./mesh/suzanne.gltf");
const gltfEntity = renderer.addEntity();
gltfEntity.addMesh(gltfMesh);
// gltfEntity.setScale(0.1, 0.1, 0.1);
gltfEntity.setScale(2, 2, 2);

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
