@fragment
fn main_frag(
    @location(0) vertColor: vec3f,
    @location(1) uvs: vec2f,
    @location(2) fragNrm: vec3f
    ) -> @location(0) vec4f {
        let ambient: vec3f = vec3f (0.15, 0.15, 0.15);

        var finalColor: vec4f;
        let L: vec3f = dirLight.forward;
        let lightMagnitude = dot(fragNrm, -L);
        let diffuseFinal: f32 = dirLight.intensity * saturate(lightMagnitude);

        finalColor = textureSample(albedo, albedoSampler, uvs) * diffuseFinal;

        return finalColor;
}
