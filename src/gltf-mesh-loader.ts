import { Mesh } from "./mesh";

export class GLTFLoader {
    public static async loadFile(fileName: string): Promise<Mesh> {
        const file = await fetch(fileName);

        if (!file.ok)
            return Promise.reject(
                new Error(`Failed to load file:${file.statusText}`)
            );

        const gltf = await file.json();

        const mesh = gltf.meshes[0];
        const primitive = mesh.primitives[0];
        const positionAccessorIndex = primitive.attributes.POSITION;
        const positionAccessor = gltf.accessors[positionAccessorIndex];

        const bufferView = gltf.bufferViews[positionAccessor.bufferView];
        const buffer = gltf.buffers[bufferView.buffer];

        const binResponse = await fetch("./mesh/" + buffer.uri);
        const arrayBuffer = await binResponse.arrayBuffer();

        const byteOffset = bufferView.byteOffset;
        // const byteLength = bufferView.byteLength;
        const numComponents = positionAccessor.type === "VEC3" ? 3 : 2;

        // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessor-data-types
        // 5126 for Float32
        const vertexData = new Float32Array(
            arrayBuffer,
            byteOffset,
            positionAccessor.count * numComponents
        );

        // UVs
        const uvAccessorIndex = primitive.attributes.TEXCOORD_0;
        const uvAccessor = gltf.accessors[uvAccessorIndex];
        const uvBufferView = gltf.bufferViews[uvAccessor.bufferView];

        const uvByteOffset = uvBufferView.byteOffset;
        const uvNumComponents = 2;

        const uvData = new Float32Array(
            arrayBuffer,
            uvByteOffset,
            uvAccessor.count * uvNumComponents
        );

        // INDICES
        const indexPrimitive = primitive.indices;

        const indexAccessor = gltf.accessors[indexPrimitive];
        const indexBufferView = gltf.bufferViews[indexAccessor.bufferView];
        const indexByteOffset = indexBufferView.byteOffset;

        // const componentType = indexAccessor.componentType;

        // 5123 ushort, 5125 = uint
        const indexData = new Uint16Array(
            arrayBuffer,
            indexByteOffset,
            indexAccessor.count
        );

        const meshData = new Mesh(vertexData, indexData, null, null, uvData);

        return new Promise((resolve, reject) => {
            resolve(meshData);
        });
    }
}
