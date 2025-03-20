@fragment
fn main_frag(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f
    ) -> @location(0) vec4f {
    return textureSample(albedo, albedoSampler, uvs);
}