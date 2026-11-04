/**
 * Client-Side Forensic Heatmap & Synthetic Gradient Analyzer
 * 
 * Analyzes local spatial gradient variance to identify diffusion model
 * smoothness patterns (the flat, uniform gradients that vision classifiers flag).
 */

export interface HeatmapAnalysisResult {
  riskScore: number; // 0 to 100
  riskLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  heatmapDataUrl: string;
}

export function generateClientHeatmap(
  img: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): HeatmapAnalysisResult {
  if (typeof document === 'undefined') {
    return { riskScore: 0, riskLabel: 'LOW', heatmapDataUrl: '' };
  }

  // Draw downscaled version to analysis canvas for fast processing
  const normW = 240;
  const normH = Math.max(100, Math.round((height / width) * normW));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = normW;
  offCanvas.height = normH;
  const ctx = offCanvas.getContext('2d');
  if (!ctx) {
    return { riskScore: 0, riskLabel: 'LOW', heatmapDataUrl: '' };
  }

  ctx.drawImage(img, 0, 0, normW, normH);
  const imgData = ctx.getImageData(0, 0, normW, normH);
  const data = imgData.data;

  // Compute grayscale luminance
  const lum = new Float32Array(normW * normH);
  for (let i = 0; i < lum.length; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Compute local variance in 5x5 window
  const heatData = ctx.createImageData(normW, normH);
  const out = heatData.data;
  let totalRisk = 0;
  let analyzedPixels = 0;

  for (let y = 2; y < normH - 2; y++) {
    for (let x = 2; x < normW - 2; x++) {
      let mean = 0;
      let count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          mean += lum[(y + dy) * normW + (x + dx)];
          count++;
        }
      }
      mean /= count;

      let variance = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const diff = lum[(y + dy) * normW + (x + dx)] - mean;
          variance += diff * diff;
        }
      }
      const stdDev = Math.sqrt(variance / count);

      // Midtones with unnaturally low variance represent diffusion flatness
      const isMidtone = mean > 35 && mean < 220;
      let risk = 0;
      if (isMidtone && stdDev < 16) {
        risk = Math.min(1.0, Math.pow(1.0 - (stdDev / 16), 1.5));
      }

      totalRisk += risk;
      analyzedPixels++;

      const pIdx = (y * normW + x) * 4;
      if (risk > 0.25) {
        // Red / Amber hotspot
        out[pIdx] = 239;     // R
        out[pIdx + 1] = 68;  // G
        out[pIdx + 2] = 68;  // B
        out[pIdx + 3] = Math.round(risk * 190);
      } else {
        // Green authentic zone
        out[pIdx] = 16;      // R
        out[pIdx + 1] = 185; // G
        out[pIdx + 2] = 129; // B
        out[pIdx + 3] = 45;  // Subtle green tint
      }
    }
  }

  ctx.putImageData(heatData, 0, 0);

  const rawRisk = analyzedPixels > 0 ? (totalRisk / analyzedPixels) : 0;
  const riskScore = Math.min(99, Math.round(rawRisk * 300));
  const riskLabel = riskScore >= 60 ? 'HIGH' : riskScore >= 35 ? 'MEDIUM' : 'LOW';

  return {
    riskScore,
    riskLabel,
    heatmapDataUrl: offCanvas.toDataURL('image/png'),
  };
}

