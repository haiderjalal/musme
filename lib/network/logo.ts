import type { LogoMask } from "@/lib/network/formations";

/** The logo is sampled at this size at most; dots are placed over its coverage, so more detail is not needed. */
const MAX_SAMPLE_SIZE = 220;

/**
 * Reads the logo's alpha channel so the globe can be shaped by the mark itself.
 * Resolves to null if the image cannot be loaded or has no visible pixels; the caller then uses a plain sphere.
 */
export async function loadLogoMask(src: string): Promise<LogoMask | null> {
  try {
    const image = new Image();
    image.src = src;
    await image.decode();

    const scale = Math.min(1, MAX_SAMPLE_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);

    const pixels = context.getImageData(0, 0, width, height).data;
    const coverage = new Uint8Array(width * height);
    let covered = 0;
    for (let i = 0; i < coverage.length; i++) {
      coverage[i] = pixels[i * 4 + 3];
      if (coverage[i] >= 128) covered += 1;
    }

    return covered > 0 ? { width, height, coverage } : null;
  } catch {
    return null;
  }
}
