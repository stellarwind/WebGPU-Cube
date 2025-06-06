import { Transform } from "./transform";

export class Entity {
    private transform_: Transform = new Transform();

    public get transform() {
        return this.transform_;
    }

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
