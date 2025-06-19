fn reflect(ray: vec3f, normal: vec3f) -> vec3f {
    let R = ray - 2 * dot(normal, ray) * normal;
    return normalize(R);
}

fn computeDiffuse(normal: vec3f, lightDir: vec3f, lightColor: vec3f, intensity: f32) -> vec3f {
    let N = normalize(normal);
    let L = normalize(lightDir);
    let lightMagnitude = dot(N, -L);
    let diffuseFinal = intensity * saturate(lightMagnitude) * lightColor;
    return diffuseFinal;
}

fn computeSpecular(viewDir: vec3f, normal: vec3f, lightDir: vec3f, exponent: f32) -> f32 {
    let N = normalize(normal);
    let L = normalize(lightDir);
    let V = normalize(viewDir);

    let R = reflect(N, -L);
    let specBase = saturate(dot(R, V));
    return pow(specBase, exponent);
}

