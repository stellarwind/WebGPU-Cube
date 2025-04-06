import { Mesh } from "./mesh";

export function generateTriangle(colors?: Float32Array | null): Mesh {
    const positions = new Float32Array([
        1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
    ]);

    const uvs = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.5, 1.0]);
    const indices = new Uint16Array([0, 1, 2]);
    return new Mesh(positions, indices, colors, null, uvs);
}

export function generateQuad(colors?: Float32Array | null): Mesh {
    const positions = new Float32Array([
        -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
    ]);

    const uvs = new Float32Array([0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0]);
    const normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    return new Mesh(positions, indices, colors, normals, uvs);
}

export function generateCube(colors?: Float32Array): Mesh {
    const positions = new Float32Array([
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0,
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
        1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0,
    ]);

    const normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ]);

    const uvs = new Float32Array([
        0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
    ]);

    const indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 7, 6, 4, 6, 5, 8, 9, 10, 8, 10, 11, 12, 14, 13, 12,
        15, 14, 16, 19, 18, 16, 18, 17, 20, 21, 22, 20, 22, 23,
    ]);

    return new Mesh(positions, indices, colors, normals, uvs);
}
