@fragment
fn main_frag(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f,
    @location(2) fragNrm: vec3f
    ) -> @location(0) vec4f {
        let ambient: vec3f = vec3f (0.1, 0.1, 0.1);
        var finalColor: vec4f;
        let diffuse: vec3f = computeDiffuse(fragNrm, dirLight.forward, vec3f(1, 1, 1), 1);
        finalColor = textureSample(albedo, albedoSampler, uvs) * vec4f(diffuse + ambient, 1);

        return finalColor;
}

