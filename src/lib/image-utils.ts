import { stripAiAndInjectRealMetadata } from '@/lib/metadata-cleaner';

export type CameraGradeStyle = 'natural' | 'editorial' | 'cinematic' | 'none';

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  ratioLabel: string;
}

export function getImageDimensions(src: string): Promise<ImageMetadata> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || 1080;
      const height = img.naturalHeight || 1080;
      const aspectRatio = width / height;

      let ratioLabel = '1:1 Square';
      if (aspectRatio <= 0.65) {
        ratioLabel = '9:16 Tall / Story';
      } else if (aspectRatio <= 0.88) {
        ratioLabel = '4:5 Portrait';
      } else if (aspectRatio >= 1.7) {
        ratioLabel = '16:9 Landscape';
      } else if (aspectRatio >= 1.2) {
        ratioLabel = '1.91:1 Horizontal';
      }

      resolve({
        width,
        height,
        aspectRatio,
        ratioLabel,
      });
    };
    img.onerror = () => {
      resolve({
        width: 1080,
        height: 1080,
        aspectRatio: 1,
        ratioLabel: '1:1 Square',
      });
    };
    img.src = src;
  });
}

/**
 * Adaptive Photographic Tone & Sensor Response Engine:
 * - Content-aware luminance and dynamic range evaluation.
 * - Gentle S-curve contrast expansion (+12% to +15%).
 * - Midtone & highlight expansion (shifts pixels out of synthetic diffusion clusters).
 * - Soft highlight roll-off (emulates optical lens highlight compression).
 * - Film black point lift (prevents dead digital zeros).
 */
export function applyPhotographicTone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: CameraGradeStyle = 'natural',
  intensity: number = 0.75
): void {
  if (style === 'none' || intensity <= 0) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Content-aware luminance sampling
  let sumLum = 0;
  const sampleStep = 8;
  let sampleCount = 0;
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    sumLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sampleCount++;
  }
  const avgLum = sumLum / sampleCount;
  const isDark = avgLum < 110;

  const contrastK = 1.0 + 0.14 * intensity;
  const midLift = isDark ? 18 * intensity : 10 * intensity;
  const shadowLift = 6 * intensity;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const normLum = lum / 255.0;

    // A. Film black point lift (soft floor)
    const shadowFactor = Math.max(0, 1.0 - normLum * 3.0);
    r += shadowLift * shadowFactor;
    g += shadowLift * shadowFactor;
    b += shadowLift * shadowFactor;

    // B. Contrast expansion around midpoint 118
    r = (r - 118) * contrastK + 118;
    g = (g - 118) * contrastK + 118;
    b = (b - 118) * contrastK + 118;

    // C. Midtone & highlight lift
    const bell = Math.sin(normLum * Math.PI) * midLift;
    r += bell;
    g += bell;
    b += bell;

    // D. Style-specific color harmony
    if (style === 'natural') {
      // Warm golden highlights, gentle warmth in mid-highs (Portra film vibe)
      const warmFactor = Math.pow(normLum, 1.4) * (12 * intensity);
      r += warmFactor;
      g += warmFactor * 0.4;
      b -= warmFactor * 0.2;
    } else if (style === 'editorial') {
      // Crisp, high clarity
      r = (r - 128) * 1.03 + 128;
      g = (g - 128) * 1.03 + 128;
      b = (b - 128) * 1.03 + 128;
    } else if (style === 'cinematic') {
      // Teal shadows, amber highlights
      const shadowCool = (1.0 - normLum) * (8 * intensity);
      const highWarm = normLum * (10 * intensity);
      r += highWarm;
      b += shadowCool;
    }

    // E. Soft Highlight Roll-off (prevents harsh 255 burn)
    if (r > 240) r = 240 + (r - 240) * 0.45;
    if (g > 240) g = 240 + (g - 240) * 0.45;
    if (b > 240) b = 240 + (b - 240) * 0.45;

    data[i] = Math.min(253, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(253, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(253, Math.max(0, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Converts image to standard JPEG format, applies photographic tone response,
 * strips C2PA manifests, and injects authentic camera EXIF + GPS metadata.
 */
export async function convertToOriginalJpeg(
  fileOrUrl: File | Blob | string,
  style: CameraGradeStyle = 'natural',
  intensity: number = 0.75
): Promise<File> {
  return new Promise((resolve, reject) => {
    let objectUrl = '';
    if (typeof fileOrUrl === 'string') {
      objectUrl = fileOrUrl;
    } else {
      objectUrl = URL.createObjectURL(fileOrUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (typeof fileOrUrl !== 'string') {
        URL.revokeObjectURL(objectUrl);
      }

      const origW = img.naturalWidth || 1080;
      const origH = img.naturalHeight || 1080;
      const ratio = origW / origH;

      // Meta Instagram Graph API requires aspect ratio >= 9:16 (0.5625) and <= 1.91:1 (1.91)
      let targetW = origW;
      let targetH = origH;
      let srcX = 0;
      let srcY = 0;
      let srcW = origW;
      let srcH = origH;

      if (ratio < 0.5625) {
        // Clamp height to exact 9:16 (0.5626 margin safety for Meta)
        targetW = origW;
        targetH = Math.floor(origW / 0.5626);
        srcW = origW;
        srcH = targetH;
        srcX = 0;
        srcY = Math.round((origH - targetH) / 2);
      } else if (ratio > 1.91) {
        targetH = origH;
        targetW = Math.floor(origH * 1.91);
        srcW = targetW;
        srcH = origH;
        srcX = Math.round((origW - targetW) / 2);
        srcY = 0;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        if (fileOrUrl instanceof File) return resolve(fileOrUrl);
        return reject(new Error('Canvas context unavailable'));
      }

      // 1. Draw with safety clamping applied
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      // 2. Apply Adaptive Photographic Tone Grading Engine
      applyPhotographicTone(ctx, targetW, targetH, style, intensity);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            if (fileOrUrl instanceof File) return resolve(fileOrUrl);
            return reject(new Error('Failed to convert to JPEG'));
          }

          try {
            // Read raw bytes, strip all C2PA / AI markers, and inject rich camera + GPS EXIF
            const rawBytes = await blob.arrayBuffer();
            const cleanBytes = stripAiAndInjectRealMetadata(new Uint8Array(rawBytes));
            const cleanBlob = new Blob([cleanBytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
            const jpegFile = new File([cleanBlob], `photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            resolve(jpegFile);
          } catch {
            const fallbackFile = new File([blob], `photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            resolve(fallbackFile);
          }
        },
        'image/jpeg',
        0.98
      );
    };

    img.onerror = () => {
      if (typeof fileOrUrl !== 'string') {
        URL.revokeObjectURL(objectUrl);
      }
      if (fileOrUrl instanceof File) return resolve(fileOrUrl);
      reject(new Error('Failed to load image for JPEG conversion'));
    };

    img.src = objectUrl;
  });
}
