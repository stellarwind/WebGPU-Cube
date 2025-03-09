import { Mesh } from "./mesh";

export function generateTriangle(colors?: Array<number>): Mesh {
    const positions = [
      1.0, -1.0, 0.0, 
      -1.0, -1.0, 0.0, 
      0.0, 1.0, 0.0
    ];
    const indices = [0, 1, 2];
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
    0, 2, 1,  0, 3, 2, //front
    4, 5, 6,  4, 6, 7, //back
    3, 6, 2,  3, 7, 6, //top
    0, 1, 5,  0, 5, 4, //right
    1, 2, 6,  1, 6, 5, //right
    0, 3, 7,  0, 7, 4  //left
  ];

  return new Mesh(positions, indices, colors);
}