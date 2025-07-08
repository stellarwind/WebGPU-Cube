export type Scalar = "bool" | "f32" | "i32" | "vec2" | "vec3" | "vec4";

export type ScalarMemoryLayout = {
    size: number,
    alignment: number,
}

export const scalarLayout: Record<Scalar, ScalarMemoryLayout> = {
    bool: { size: 4, alignment: 4 },
    f32: { size: 4, alignment: 4 },
    i32: { size: 4, alignment: 4 },
    vec2: { size: 8, alignment: 8 },
    vec3: { size: 12, alignment: 16 },
    vec4: { size: 16, alignment: 16 },
};
