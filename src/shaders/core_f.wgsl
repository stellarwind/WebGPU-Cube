@group(0) @binding(1) var albedoSampler: sampler;
@group(0) @binding(2) var albedo: texture_2d<f32>;

@fragment
fn main(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f
    ) -> @location(0) vec4f {
    return textureSample(albedo, albedoSampler, uvs);
}