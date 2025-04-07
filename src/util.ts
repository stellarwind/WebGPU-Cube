export async function loadImageBitmap(url: string): Promise<ImageBitmap> {
    const response = await fetch(url);
    const blob = await response.blob();
    return await createImageBitmap(blob);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}