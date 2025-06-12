@fragment
fn main_frag(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f,
    @location(2) fragNrm: vec3f
    ) -> @location(0) vec4f {
        var color: vec4f;
        color = textureSample(albedo, albedoSampler, uvs);
    return color;
}
