import { Transform } from "./transform";

export abstract class Entity {
    private transform_: Transform = new Transform();

    public get transform() {
        return this.transform_;
    }

    abstract get shaderData(): Float32Array;

    public name: string = "";

    private static id_: number = 0;
    public get id() {
        return Entity.id_;
    }

    constructor(name: string = "New Entity") {
        Entity.id_++;
        this.name = name;
    }
}
