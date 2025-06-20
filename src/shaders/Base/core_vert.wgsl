struct VSOut {
    @builtin(position) Position: vec4f,
    @location(0) color: vec3f,
    @location(1) uv: vec2f
 };

@vertex
fn main_vert(@location(0) inPos: vec4f,
        @location(1) inColor: vec3f,
        @location(2) inNrm: vec3f,
        @location(3) inUV: vec2f) -> VSOut {
    var vsOut: VSOut;

    var col: vec4f;
    vsOut.uv = inUV;
    vsOut.Position =  uniforms.mvpMatrix * inPos;
    vsOut.color = col.xyz;
    return vsOut;
}

