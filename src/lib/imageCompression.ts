/**
 * Compress any image to WebP format with aggressive compression.
 * Target: extremely small file sizes (< 100KB for most images).
 */

const MAX_DIMENSION = 1200; // max width or height
const WEBP_QUALITY = 0.55; // aggressive compression
const AVATAR_MAX_DIM = 256;
const AVATAR_QUALITY = 0.5;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function drawToCanvas(
  img: HTMLImageElement,
  maxDim: number
): HTMLCanvasElement {
  let { width, height } = img;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height / width) * maxDim);
      width = maxDim;
    } else {
      width = Math.round((width / height) * maxDim);
      height = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/webp",
      quality
    );
  });
}

export type CompressionMode = "default" | "avatar";

/**
 * Compress an image file to WebP.
 * Returns a { blob, fileName } ready for upload.
 */
export async function compressImage(
  file: File,
  mode: CompressionMode = "default"
): Promise<{ blob: Blob; fileName: string }> {
  const img = await loadImage(file);

  const maxDim = mode === "avatar" ? AVATAR_MAX_DIM : MAX_DIMENSION;
  const quality = mode === "avatar" ? AVATAR_QUALITY : WEBP_QUALITY;

  const canvas = drawToCanvas(img, maxDim);
  const blob = await canvasToBlob(canvas, quality);

  // Clean up object URL
  URL.revokeObjectURL(img.src);

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const fileName = `${baseName}.webp`;

  return { blob, fileName };
}
