import { Mesh } from "./mesh";

export class GLTFLoader {
    public static async loadFile(fileName: string): Promise<Mesh> {
        const file = await fetch(fileName);
        const gltf = await file.json();
        
        return new Promise((resolve, reject) => {
            resolve(gltf);
        });

    }
}
