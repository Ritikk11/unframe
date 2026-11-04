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
 * Ensures the image is in standard JPEG format without altering any dimensions or aspect ratio.
 * Instagram Graph API requires standard JPEG for image containers.
 * Retains 100% of the original image exactly as uploaded.
 */
export async function convertToOriginalJpeg(fileOrUrl: File | Blob | string): Promise<File> {
  return new Promise((resolve, reject) => {
    let objectUrl = '';
    if (typeof fileOrUrl === 'string') {
      objectUrl = fileOrUrl;
    } else {
      // If it's already a JPEG File or Blob, return it directly
      if (fileOrUrl.type === 'image/jpeg' && fileOrUrl instanceof File) {
        return resolve(fileOrUrl);
      }
      objectUrl = URL.createObjectURL(fileOrUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (typeof fileOrUrl !== 'string') {
        URL.revokeObjectURL(objectUrl);
      }

      // Preserve EXACT original dimensions
      const width = img.naturalWidth || 1080;
      const height = img.naturalHeight || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        if (fileOrUrl instanceof File) return resolve(fileOrUrl);
        return reject(new Error('Canvas context unavailable'));
      }

      // Draw original image exactly 1:1 with no padding or aspect changes
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            if (fileOrUrl instanceof File) return resolve(fileOrUrl);
            return reject(new Error('Failed to convert to JPEG'));
          }
          const jpegFile = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          resolve(jpegFile);
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


