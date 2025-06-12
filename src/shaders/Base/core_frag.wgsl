@fragment
fn main_frag(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f
    ) -> @location(0) vec4f {
        var color: vec4f;
        let ambientColor: vec3f = vec3f(0.2, 0.2, 0.2);
        // let phongTerm: vec3f = dot(DirLight)

        color = textureSample(albedo, albedoSampler, uvs);
    return color;
}