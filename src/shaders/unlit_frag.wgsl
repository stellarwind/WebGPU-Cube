@fragment
fn main_frag(
    @builtin(position) fragPos: vec4f,
    @location(0) vertColor: vec3f,
    @location(1) uv: vec2f,
    @location(2) fragNrm: vec3f,
    @location(3) worldPos: vec3f
    ) -> @location(0) vec4f {
        var finalColor: vec4f;

        finalColor = textureSample(albedo, albedo_sampler, uv);

        return finalColor;
}
