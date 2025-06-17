fn computeDiffuse(normal: vec3f, lightDir: vec3f, albedoColor: vec3f, lightColor: vec3f, intensity: f32) -> vec3f {
    let n = normalize(normal);
    let l = normalize(lightDir);
    let diff = saturate(dot(n, l));
    return albedoColor * lightColor * diff * intensity;
}