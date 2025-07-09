export type ScalarType = "bool" | "f32" | "i32" | "vec2f" | "vec3f" | "vec4f";

export interface Scalar {
    name: string,
    type: ScalarType,
    value: Float32Array
}

export interface ScalarMemoryLayout {
    size: number,
    alignment: number,
}

export const scalarMemoryLayout: Record<ScalarType, ScalarMemoryLayout> = {
    bool: { size: 4, alignment: 4 },
    f32: { size: 4, alignment: 4 },
    i32: { size: 4, alignment: 4 },
    vec2f: { size: 8, alignment: 8 },
    vec3f: { size: 12, alignment: 16 },
    vec4f: { size: 16, alignment: 16 },
};
