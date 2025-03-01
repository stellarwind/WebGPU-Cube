import "gl-matrix";
import { Mesh } from "./mesh";

export function generateTriangle(colors?: Array<number>): Mesh {
    const positions = new Array(1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0);
    const indices = new Array(0, 1, 2);
    const mesh = new Mesh(positions, indices, colors);

    return mesh;
}

export function generateQuad(colors?: Array<number>): Mesh {
  const positions = [
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0,  1.0, 0.0,
    -1.0,  1.0, 0.0,
  ];

  const indices = [0, 1, 2, 0, 2, 3];

  const mesh = new Mesh(positions, indices, colors);

  return mesh;
}

export function generateCube(colors?: Array<number>): Mesh {
  const positions = [
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
  ];

  const indices = [
    0, 1, 2,  0, 2, 3,
    4, 5, 6,  4, 6, 7,
    3, 2, 6,  3, 6, 7,
    0, 1, 5,  0, 5, 4,
    1, 2, 6,  1, 6, 5,
    0, 3, 7,  0, 7, 4,
  ];

  const mesh = new Mesh(positions, indices, colors);

  return mesh;
}