struct Uniforms {
    mvpMatrix: mat4x4f
}

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VSOut {
    @builtin(position) Position: vec4f,
    @location(0) color: vec3f,
 };

@vertex
fn main(@location(0) inPos: vec3f,
        @location(1) inColor: vec3f) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = vec4(inPos, 1) * uniforms.mvpMatrix;
    vsOut.color = inColor;
    return vsOut;
}

