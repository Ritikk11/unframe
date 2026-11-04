import { stripAiAndInjectRealMetadata } from '@/lib/metadata-cleaner';

export interface PhotographicAdjustments {
  // Tone & Exposure
  exposure: number;    // -50 to +50 (default: 0)
  brightness: number;  // -30 to +30 (default: 8)
  contrast: number;    // -20 to +40 (default: 12)
  highlights: number;  // -30 to +30 (default: 6)

  // White Balance & Color
  warmth: number;      // -50 (cool) to +50 (warm), default: 0 (neutral)
  tint: number;        // -50 (green) to +50 (magenta), default: 0
  saturation: number;  // -50 (muted) to +50 (vibrant), default: 0

  // Optics & Texture
  sharpness: number;   // 0 to 50 (default: 10)
  smooth: number;      // 0 to 50 (default: 0)
  grain: number;       // 0 to 50 (default: 12)

  // Boundary & Targeting
  borderCrop: number;  // 0 to 5% (default: 2.5%, cuts edge padding lines)
  targetHotspots: boolean; // concentrates adjustments on detected AI zones
}

export const DEFAULT_ADJUSTMENTS: PhotographicAdjustments = {
  exposure: 0,
  brightness: 0,
  contrast: 0,
  highlights: 0,
  warmth: 0,
  tint: 0,
  saturation: 0,
  sharpness: 0,
  smooth: 0,
  grain: 14,
  borderCrop: 2.5,
  targetHotspots: true,
};

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
 * Heatmap-Targeted Photographic Tone, Optics & Sensor Response Engine:
 * - Content-aware luminance evaluation & local variance risk mapping.
 * - Targeted adjustments concentrated on detected flat AI diffusion areas.
 * - Full photographic controls: Exposure, Brightness, Contrast, Highlights.
 * - True White Balance: Warmth (Temp) and Tint (Green/Magenta).
 * - Saturation & Vibrance control.
 * - Texture & Optics: Film Grain (sensor shot noise), Sharpness (clarity), Smooth (softening).
 * - Highlight roll-off & film black point preservation.
 */
export function applyPhotographicTone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: PhotographicAdjustments = DEFAULT_ADJUSTMENTS
): void {
  const {
    exposure = 0,
    brightness = 8,
    contrast = 12,
    highlights = 6,
    warmth = 0,
    tint = 0,
    saturation = 0,
    sharpness = 10,
    smooth = 0,
    grain = 12,
    targetHotspots = true,
  } = adjustments;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  // 1. Luminance map
  const lum = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // 2. Pre-calculate local variance risk map for targeted weighting
  const riskMap = new Float32Array(totalPixels);
  if (targetHotspots) {
    const step = 2;
    for (let y = 2; y < height - 2; y += step) {
      for (let x = 2; x < width - 2; x += step) {
        let mean = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            mean += lum[(y + dy) * width + (x + dx)];
          }
        }
        mean /= 25;

        let variance = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const diff = lum[(y + dy) * width + (x + dx)] - mean;
            variance += diff * diff;
          }
        }
        const stdDev = Math.sqrt(variance / 25);
        const isMid = mean > 35 && mean < 220;
        const r = (isMid && stdDev < 16) ? Math.min(1.0, (16 - stdDev) / 16) : 0;

        for (let dy = 0; dy < step && y + dy < height; dy++) {
          for (let dx = 0; dx < step && x + dx < width; dx++) {
            riskMap[(y + dy) * width + (x + dx)] = r;
          }
        }
      }
    }
  }

  const contrastK = 1.0 + (contrast / 100.0);
  const expScale = 1.0 + (exposure / 100.0);
  const satScale = 1.0 + (saturation / 100.0);

  for (let y = 0; y < height; y++) {
    const yOffset = y * width;
    const upOffset = Math.max(0, y - 1) * width;
    const downOffset = Math.min(height - 1, y + 1) * width;

    for (let x = 0; x < width; x++) {
      const i = yOffset + x;
      const pIdx = i * 4;
      let r = data[pIdx];
      let g = data[pIdx + 1];
      let b = data[pIdx + 2];

      const l = lum[i];
      const normLum = l / 255.0;

      // Weight factor: If targetHotspots is on, concentrate adjustments on flat AI zones
      const weight = targetHotspots ? (0.35 + 0.65 * riskMap[i]) : 1.0;

      // A. Sharpness & Optical Smooth
      if (sharpness > 0 || smooth > 0) {
        const leftX = Math.max(0, x - 1);
        const rightX = Math.min(width - 1, x + 1);
        const neighborAvg = (lum[upOffset + x] + lum[downOffset + x] + lum[yOffset + leftX] + lum[yOffset + rightX]) * 0.25;

        if (sharpness > 0) {
          const edgeDelta = (l - neighborAvg) * (sharpness / 50.0);
          r += edgeDelta;
          g += edgeDelta;
          b += edgeDelta;
        }

        if (smooth > 0) {
          const smoothDelta = (neighborAvg - l) * (smooth / 100.0) * weight;
          r += smoothDelta;
          g += smoothDelta;
          b += smoothDelta;
        }
      }

      // B. Exposure EV adjustment
      if (exposure !== 0) {
        const effExp = 1.0 + (expScale - 1.0) * weight;
        r *= effExp;
        g *= effExp;
        b *= effExp;
      }

      // C. Film black point lift
      const shadowFactor = Math.max(0, 1.0 - normLum * 3.0);
      const sLift = 5.0 * shadowFactor * weight;
      r += sLift;
      g += sLift;
      b += sLift;

      // D. Contrast expansion around midpoint 118
      const effContrast = 1.0 + (contrastK - 1.0) * weight;
      r = (r - 118) * effContrast + 118;
      g = (g - 118) * effContrast + 118;
      b = (b - 118) * effContrast + 118;

      // E. Midtone Brightness & Highlight lift
      const midLift = Math.sin(normLum * Math.PI) * (brightness * weight);
      const highLift = Math.pow(normLum, 1.5) * (highlights * weight);
      r += midLift + highLift;
      g += midLift + highLift;
      b += midLift + highLift;

      // F. White Balance: Warmth (Temperature)
      if (warmth > 0) {
        // Warm golden amber
        const wFactor = Math.pow(normLum, 1.3) * (warmth * 0.45 * weight);
        r += wFactor;
        g += wFactor * 0.3;
        b -= wFactor * 0.25;
      } else if (warmth < 0) {
        // Cool cyan / blue
        const cFactor = Math.pow(normLum, 1.2) * (Math.abs(warmth) * 0.45 * weight);
        b += cFactor;
        g += cFactor * 0.2;
        r -= cFactor * 0.3;
      }

      // G. White Balance: Tint (Green <-> Magenta)
      if (tint > 0) {
        // Magenta
        const mFactor = (tint * 0.35 * weight);
        r += mFactor;
        b += mFactor * 0.75;
        g -= mFactor * 0.85;
      } else if (tint < 0) {
        // Green
        const gFactor = (Math.abs(tint) * 0.35 * weight);
        g += gFactor;
        r -= gFactor * 0.5;
        b -= gFactor * 0.5;
      }

      // H. Saturation & Vibrance
      if (saturation !== 0) {
        const curLum = 0.299 * r + 0.587 * g + 0.114 * b;
        const effSat = 1.0 + (satScale - 1.0) * weight;
        r = curLum + (r - curLum) * effSat;
        g = curLum + (g - curLum) * effSat;
        b = curLum + (b - curLum) * effSat;
      }

      // I. Film Grain (Photographic Sensor Shot Noise)
      // Destroys synthetic flat diffusion uniformity (stdDev < 16)
      if (grain > 0) {
        const grainIntensity = (grain / 100.0) * (1.2 - normLum * 0.5) * (targetHotspots ? (0.4 + 0.6 * riskMap[i]) : 1.0);
        // Fast deterministic PRNG for organic grain distribution
        const noise = (((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) * 2 - 1) * grainIntensity * 26.0;
        r += noise;
        g += noise;
        b += noise;
      }

      // J. Hardware Bayer CFA (Color Filter Array) Micro-Grid Simulation
      // Injects the microscopic sub-pixel PRNU demosaicing harmonic of physical CMOS silicon.
      // Completely imperceptible to human eyes (±0.4 levels), authentic to frequency classifiers.
      const cfaMod = ((x % 2) ^ (y % 2)) === 1 ? 0.45 : -0.45;
      r -= cfaMod * 0.4;
      g += cfaMod * 0.5;
      b -= cfaMod * 0.4;

      // K. Soft optical highlight compression (prevents digital clipping)
      if (r > 240) r = 240 + (r - 240) * 0.45;
      if (g > 240) g = 240 + (g - 240) * 0.45;
      if (b > 240) b = 240 + (b - 240) * 0.45;

      data[pIdx] = Math.min(253, Math.max(0, Math.round(r)));
      data[pIdx + 1] = Math.min(253, Math.max(0, Math.round(g)));
      data[pIdx + 2] = Math.min(253, Math.max(0, Math.round(b)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Converts image to standard JPEG format, applies photographic adjustments,
 * crops telltale edge padding artifacts, strips C2PA manifests,
 * and injects authentic camera EXIF + GPS metadata.
 */
export async function convertToOriginalJpeg(
  fileOrUrl: File | Blob | string,
  adjustments: PhotographicAdjustments = DEFAULT_ADJUSTMENTS,
  applyShield: boolean = true
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

      // Border Edge Trim (slices off telltale diffusion perimeter padding lines)
      const borderCropPercent = (applyShield && adjustments.borderCrop > 0) ? (adjustments.borderCrop / 100.0) : 0;
      if (borderCropPercent > 0) {
        const borderTrimX = Math.round(srcW * borderCropPercent);
        const borderTrimY = Math.round(srcH * borderCropPercent);
        srcX += borderTrimX;
        srcY += borderTrimY;
        srcW -= borderTrimX * 2;
        srcH -= borderTrimY * 2;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        if (fileOrUrl instanceof File) return resolve(fileOrUrl);
        return reject(new Error('Canvas context unavailable'));
      }

      // 1. Draw with border edge trim & safety clamping applied
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      // 2. Apply Heatmap-Targeted Photographic Adjustments
      if (applyShield) {
        applyPhotographicTone(ctx, targetW, targetH, adjustments);
      }

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
