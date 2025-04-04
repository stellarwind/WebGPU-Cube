import { Mesh } from "./mesh";

export class GLTFLoader {
    public static async loadFile(fileName: string): Promise<Mesh> {
        const file = await fetch(fileName);
        const gltf = await file.json();

        const mesh = gltf.meshes[0];
        const primitive = mesh.primitives[0];
        const positionAccessorIndex = primitive.attributes.POSITION;
        const positionAccessor = gltf.accessors[positionAccessorIndex];
        
        const bufferView = gltf.bufferViews[positionAccessor.bufferView];
        const buffer = gltf.buffers[bufferView.buffer];
        
        const binResponse = await fetch("./mesh/" + buffer.uri);
        const arrayBuffer = await binResponse.arrayBuffer();

        // console.log(await binResponse.text());
        // console.log(`byte length ${arrayBuffer.byteLength}`);

        const byteOffset = bufferView.byteOffset;
        const byteLength = bufferView.byteLength;
        const numComponents = positionAccessor.type === "VEC3" ? 3 : 2;
        
        // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessor-data-types
        // 5126 for Float 32
        const vertexData = new Float32Array(
            arrayBuffer,
            byteOffset,
            bufferView.count * numComponents
        );

        return new Promise((resolve, reject) => {
            resolve(gltf);
        });
    }
}
