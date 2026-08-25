// Resizes and re-encodes an image client-side before upload, to cut storage
// and bandwidth usage. Caps the longest side at maxDimension and re-encodes
// as JPEG at the given quality — more than sufficient for card-sized admin
// photos, and shrinks typical phone-camera originals dramatically.
export async function compressImage(
  file: File,
  { maxDimension = 1200, quality = 0.8 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  // Skip already-tiny files or non-image types — nothing to gain.
  if (!file.type.startsWith("image/") || file.size < 100_000) {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  // Only use the compressed version if it's actually smaller.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}