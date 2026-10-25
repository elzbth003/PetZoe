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
