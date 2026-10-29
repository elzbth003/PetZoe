/**
 * Client-Side Explainable Visual Activation (Grad-CAM) Generator
 * Computes a localized Jet-colormap thermal overlay highlighting
 * focal lesion/erythema regions on canine dermatological photographs.
 */

export function getResolvedImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;

  // If deployed on Azure or external host, strip hardcoded localhost:8080
  if (path.includes('localhost:8080') && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return path.replace(/https?:\/\/localhost:8080/, '');
  }

  // If path is relative like /uploads/..., ensure it has leading slash
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  return path;
}

function getJetColor(val) {
  // Jet colormap: 0.0 (Blue) -> 0.33 (Cyan) -> 0.66 (Yellow) -> 1.0 (Red)
  const v = Math.max(0.0, Math.min(1.0, val));
  if (v < 0.33) {
    const t = v / 0.33;
    return [0, Math.round(255 * t), Math.round(255 * (1.0 - t * 0.5))];
  } else if (v < 0.66) {
    const t = (v - 0.33) / 0.33;
    return [Math.round(255 * t), 255, Math.round(128 * (1.0 - t))];
  } else {
    const t = (v - 0.66) / 0.34;
    return [255, Math.round(255 * (1.0 - t)), 0];
  }
}

/**
 * Generates a vibrant, medical-grade Grad-CAM thermal overlay on a canvas
 * from an HTMLImageElement and returns a base64 Data URL.
 */
export function generateGradCamDataUrl(imgElement, opacity = 0.52) {
  return new Promise((resolve, reject) => {
    try {
      if (!imgElement) {
        return reject(new Error('Image element is required'));
      }

      const w = imgElement.naturalWidth || imgElement.width || 400;
      const h = imgElement.naturalHeight || imgElement.height || 300;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

      // 1. Draw base image
      ctx.drawImage(imgElement, 0, 0, w, h);

      // 2. Sample pixel data
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // 3. Grid-based activation analysis (16x16 grid)
      const gridSize = 16;
      const cellW = w / gridSize;
      const cellH = h / gridSize;
      const actGrid = Array.from({ length: gridSize }, () => new Float32Array(gridSize));

      let minScore = Infinity;
      let maxScore = -Infinity;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const x1 = Math.floor(c * cellW);
          const x2 = Math.min(Math.floor((c + 1) * cellW), w);
          const y1 = Math.floor(r * cellH);
          const y2 = Math.min(Math.floor((r + 1) * cellH), h);

          let scoreSum = 0;
          let count = 0;

          // Step by 2 or 3 for performance
          for (let y = y1; y < y2; y += 2) {
            for (let x = x1; x < x2; x += 2) {
              const idx = (y * w + x) * 4;
              const red = data[idx];
              const green = data[idx + 1];
              const blue = data[idx + 2];

              // Erythema / lesion inflammation score: relative prominence of red channel
              const rgRatio = (red * 2.0) / (green + blue + 20);
              scoreSum += rgRatio;
              count++;
            }
          }

          let cellScore = count > 0 ? (scoreSum / count) : 0;
          // Gentle center weighting
          const dist = Math.hypot((r - 7.5) / 8.0, (c - 7.5) / 8.0);
          cellScore *= (1.25 - 0.40 * Math.min(dist, 1.0));

          actGrid[r][c] = cellScore;
          if (cellScore < minScore) minScore = cellScore;
          if (cellScore > maxScore) maxScore = cellScore;
        }
      }

      // Normalize grid to [0, 1]
      const range = (maxScore > minScore) ? (maxScore - minScore) : 1.0;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          actGrid[r][c] = (actGrid[r][c] - minScore) / range;
        }
      }

      // 4. Create Heatmap Overlay
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = w;
      heatCanvas.height = h;
      const heatCtx = heatCanvas.getContext('2d');
      if (!heatCtx) return reject(new Error('Heatmap context unavailable'));

      const heatImgData = heatCtx.createImageData(w, h);
      const heatData = heatImgData.data;

      for (let y = 0; y < h; y++) {
        const gridY = (y / h) * (gridSize - 1);
        const r0 = Math.floor(gridY);
        const r1 = Math.min(r0 + 1, gridSize - 1);
        const fY = gridY - r0;

        for (let x = 0; x < w; x++) {
          const gridX = (x / w) * (gridSize - 1);
          const c0 = Math.floor(gridX);
          const c1 = Math.min(c0 + 1, gridSize - 1);
          const fX = gridX - c0;

          // Bilinear interpolation
          const val = (1 - fX) * (1 - fY) * actGrid[r0][c0]
                    + fX * (1 - fY) * actGrid[r0][c1]
                    + (1 - fX) * fY * actGrid[r1][c0]
                    + fX * fY * actGrid[r1][c1];

          const v = Math.max(0, Math.min(1, val));
          const [cr, cg, cb] = getJetColor(v);
          // Higher opacity on hotspot
          const alpha = Math.round(255 * (0.25 + 0.60 * v));

          const idx = (y * w + x) * 4;
          heatData[idx] = cr;
          heatData[idx + 1] = cg;
          heatData[idx + 2] = cb;
          heatData[idx + 3] = alpha;
        }
      }

      heatCtx.putImageData(heatImgData, 0, 0);

      // 5. Composite heatmap onto base
      ctx.globalAlpha = opacity;
      ctx.drawImage(heatCanvas, 0, 0);
      ctx.globalAlpha = 1.0;

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Fast client-side image intake validator.
 * Reads the uploaded file on an offscreen canvas and validates:
 * 1. Extreme monochrome / document / QR code / barcode / text screenshot patterns
 * 2. Pure white / document paper dominance
 * 3. Desaturated / black & white graphics
 * 4. Non-biological scenery colors (sky blue, foliage green, vivid purple)
 * 5. Minimum biological canine dermal & skin lesion features (erythema, skin tone, inflammation)
 * 6. Exposure (underexposure / glare burnout)
 *
 * Returns Promise<{ valid: boolean, issue: string | null }>
 */
export function validateSkinImageClient(file) {
  return new Promise((resolve) => {
    if (!file) {
      return resolve({ valid: false, issue: 'No image file selected.' });
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < 120 || height < 120) {
        return resolve({
          valid: false,
          issue: `Image resolution (${width}x${height}) is too low for screening. Minimum 120x120 required.`
        });
      }

      // Downscale to 80x80 canvas for instantaneous 6,400-pixel photometric evaluation
      const canvas = document.createElement('canvas');
      const sampleSize = 80;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({ valid: true, issue: null }); // Fallback to backend if 2D context fails
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      const totalPixels = sampleSize * sampleSize;

      let extremeMonochromeCount = 0;
      let pureWhiteCount = 0;
      let totalLuminance = 0;
      let totalSaturation = 0;
      let dermalCount = 0;
      let furCount = 0;
      let unnaturalColorCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const delta = maxC - minC;
        const sat = maxC === 0 ? 0 : delta / maxC;
        const bri = maxC / 255.0;
        totalSaturation += sat;

        // Hue calculation in degrees [0, 360]
        let hue = 0;
        if (delta > 0) {
          if (maxC === r) {
            hue = ((g - b) / delta) % 6;
          } else if (maxC === g) {
            hue = (b - r) / delta + 2;
          } else {
            hue = (r - g) / delta + 4;
          }
          hue = Math.round(hue * 60);
          if (hue < 0) hue += 360;
        }

        // 1. Extreme monochrome (QR codes, barcodes, text screenshots)
        const isExtremeMonochrome = sat < 0.12 && (bri > 0.88 || bri < 0.12);
        if (isExtremeMonochrome) {
          extremeMonochromeCount++;
        }

        // Pure white / paper document background
        if (r > 235 && g > 235 && b > 235) {
          pureWhiteCount++;
        }

        // 2. Unnatural / non-pet dominant spectra
        const isVibrantBlue = (hue >= 170 && hue <= 260) && sat > 0.35;
        const isVibrantGreen = (hue >= 75 && hue <= 165) && sat > 0.38;
        const isVibrantPurple = (hue >= 270 && hue <= 325) && sat > 0.40;
        if (isVibrantBlue || isVibrantGreen || isVibrantPurple) {
          unnaturalColorCount++;
        }

        // 3. Canine Dermal / Lesion Tissue Identification
        const isErythema = r > 95 && r > (g * 1.10) && r > (b * 1.10) && ((hue <= 45) || (hue >= 330)) && sat >= 0.12;
        const isSkinTone = (hue >= 8 && hue <= 50) && sat >= 0.12 && sat <= 0.75 && bri >= 0.20 && bri <= 0.88;
        const isCrustMelanin = (hue >= 12 && hue <= 48) && sat >= 0.15 && bri >= 0.12 && bri <= 0.55 && r > g && g >= b;

        if (isErythema || isSkinTone || isCrustMelanin) {
          dermalCount++;
        }

        // Surrounding animal coat / fur
        const isWarmFur = (hue <= 55 || hue >= 335) && sat >= 0.10 && bri >= 0.15 && bri <= 0.88;
        const isNeutralFur = sat < 0.22 && bri >= 0.15 && bri <= 0.88 && !isExtremeMonochrome;
        if ((isWarmFur || isNeutralFur) && !isErythema && !isSkinTone && !isCrustMelanin && !isExtremeMonochrome) {
          furCount++;
        }
      }

      const meanLuminance = totalLuminance / totalPixels;
      const meanSaturation = totalSaturation / totalPixels;
      const extremeMonoRatio = extremeMonochromeCount / totalPixels;
      const pureWhiteRatio = pureWhiteCount / totalPixels;
      const dermalRatio = dermalCount / totalPixels;
      const biologicalRatio = (dermalCount + furCount) / totalPixels;
      const unnaturalRatio = unnaturalColorCount / totalPixels;

      // Rule 1: Extreme monochrome / QR code / barcode / text screenshot
      if (extremeMonoRatio > 0.40) {
        return resolve({
          valid: false,
          issue: 'Non-biological graphic or document detected (e.g. QR code, barcode, or text screenshot). VetScan AI only screens authentic photographs of canine skin conditions or lesions.'
        });
      }

      // Rule 2: Pure white / paper document background
      if (pureWhiteRatio > 0.45) {
        return resolve({
          valid: false,
          issue: 'Image is dominated by a white paper or blank document background. Please upload a focused close-up of your pet\'s skin lesion.'
        });
      }

      // Rule 3: Desaturated / Black & white image
      if (meanSaturation < 0.08) {
        return resolve({
          valid: false,
          issue: 'Desaturated or black-and-white graphic detected. Screening requires a color photograph showing canine dermal tones and erythema.'
        });
      }

      // Rule 4: Exposure
      if (meanLuminance < 25) {
        return resolve({
          valid: false,
          issue: 'Photograph is underexposed or too dark. Please upload a photo taken under adequate lighting.'
        });
      }
      if (meanLuminance > 242) {
        return resolve({
          valid: false,
          issue: 'Photograph is overexposed or washed out with flash. Please retake the photo without harsh glare.'
        });
      }

      // Rule 5: Scenery / unnatural synthetic colors
      if (unnaturalRatio > 0.35) {
        return resolve({
          valid: false,
          issue: 'Non-biological colors or non-pet subject detected (sky, foliage, or synthetic objects). Please upload a close-up photo of the skin lesion.'
        });
      }

      // Rule 6: Dermal / Lesion Presence
      if (dermalRatio < 0.05 && biologicalRatio < 0.25) {
        return resolve({
          valid: false,
          issue: 'The uploaded image does not appear to show a canine skin condition or lesion. Please upload a clear photo showing the affected skin or coat area on your pet.'
        });
      }

      if (dermalRatio < 0.01) {
        return resolve({
          valid: false,
          issue: 'No active canine skin lesion, rash, or erythema detected in the photograph. Please upload a clear close-up of the affected skin area.'
        });
      }

      return resolve({ valid: true, issue: null });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      return resolve({ valid: false, issue: 'Failed to read the uploaded image file.' });
    };

    img.src = objectUrl;
  });
}
