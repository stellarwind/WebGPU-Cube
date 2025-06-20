@fragment
fn main_frag(
    @builtin(position) fragPos: vec4f,
    @location(0) vertColor: vec3f,
    @location(1) uv: vec2f,
    @location(2) fragNrm: vec3f,
    @location(3) worldPos: vec3f
    ) -> @location(0) vec4f {
        let ambient: vec3f = vec3f (0.06, 0.06, 0.06);
        var finalColor: vec4f;

        let viewDir = normalize(mainCam.position - worldPos);
        let diffuse: vec3f = computeDiffuse(fragNrm, dirLight.forward, dirLight.color, dirLight.intensity);

        let specular: f32 = computeSpecular(mainCam.forward, fragNrm, viewDir, 64);

        finalColor = textureSample(albedo, albedoSampler, uv) * vec4f(diffuse + ambient, 1) + specular;

        return finalColor;
}
