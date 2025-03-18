export async function loadImageBitmap(url: string): Promise<ImageBitmap> {
    const response = await fetch(url);
    const blob = await response.blob();
    return await createImageBitmap(blob);
}