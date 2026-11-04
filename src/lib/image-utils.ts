import { stripAiAndInjectRealMetadata } from '@/lib/metadata-cleaner';

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
 * Converts image to standard JPEG format and applies Automatic 9:16 Safety Clamping:
 * - If an image is within 1-2% of 9:16 (such as 748x1340, ratio 0.558), it micro-fits
 *   the height to exact 9:16 (0.5625) by trimming microscopic extra pixels (~5px) from top/bottom.
 * - If an image is already within Instagram's allowed aspect ratios [0.5625, 1.91],
 *   it retains 100% of the original dimensions and pixels untouched.
 * - Always ensures output is 100% compliant standard sRGB `image/jpeg` format for Meta's API.
 */
export async function convertToOriginalJpeg(fileOrUrl: File | Blob | string): Promise<File> {
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
        // Taller than 9:16 limit (e.g. 748x1340 where ratio is 0.5582)
        // Clamp height to exact 9:16 (0.5626 ensures rounding margin safety for Meta)
        targetW = origW;
        targetH = Math.floor(origW / 0.5626);
        srcW = origW;
        srcH = targetH;
        srcX = 0;
        srcY = Math.round((origH - targetH) / 2);
      } else if (ratio > 1.91) {
        // Wider than 1.91:1 limit
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

      // Draw with safety clamping applied
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            if (fileOrUrl instanceof File) return resolve(fileOrUrl);
            return reject(new Error('Failed to convert to JPEG'));
          }

          try {
            // Read raw bytes, strip all C2PA / AI markers, and inject authentic camera EXIF
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


