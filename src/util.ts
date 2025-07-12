export const loadImageBitmap = async (url: string): Promise<ImageBitmap> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return await createImageBitmap(blob);
}

export const clamp = (value: number, min: number, max: number) : number => {
    return Math.max(min, Math.min(value, max));
}

export const alignByteOffset = (offset: number, alignment: number): number => {
    return Math.ceil(offset / alignment) * alignment;
};

export const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
};
