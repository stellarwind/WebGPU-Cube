fn computeDiffuse(normal: vec3f, lightDir: vec3f, lightColor: vec3f, intensity: f32) -> vec3f {
    let N = normalize(normal);
    let L = normalize(lightDir);
    let lightMagnitude = dot(N, -L);
    let diffuseFinal = intensity * saturate(lightMagnitude) * lightColor;
    return diffuseFinal;
}
