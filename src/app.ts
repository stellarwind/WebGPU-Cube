import { WebGPURenderer } from "./renderer";
import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";

const DEBUG = false;

const mesh = await GLTFLoader.loadFile("./mesh/test.gltf");
console.log(mesh);

const renderer = new WebGPURenderer();
await renderer.init("viewport");

const entity = renderer.addEntity();
entity.addMesh(generateCube());

const entity2 = renderer.addEntity();
entity2.addMesh(generateCube());
entity.translate(-1.5, 0, -1);
entity.setScale(1, 2, 1);

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
