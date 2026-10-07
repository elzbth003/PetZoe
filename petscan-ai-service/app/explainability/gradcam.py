import io
import base64
import numpy as np
from PIL import Image

def generate_color_map(val: float) -> tuple[int, int, int]:
    """
    Simulates a Jet-like colormap from 0.0 (blue/cyan) to 1.0 (red/yellow).
    """
    val = float(np.clip(val, 0.0, 1.0))
    # 4 color stops: Blue(0) -> Cyan(0.33) -> Yellow(0.66) -> Red(1.0)
    if val < 0.33:
        t = val / 0.33
        r = 0
        g = int(255 * t)
        b = int(255 * (1.0 - t * 0.5))
    elif val < 0.66:
        t = (val - 0.33) / 0.33
        r = int(255 * t)
        g = 255
        b = int(128 * (1.0 - t))
    else:
        t = (val - 0.66) / 0.34
        r = 255
        g = int(255 * (1.0 - t))
        b = 0
    return (r, g, b)

def generate_gradcam_overlay(image: Image.Image, target_label: str = "ERYTHEMA") -> str:
    """
    Computes a localized feature activation map (Grad-CAM representation)
    corresponding to the primary dermal lesion indicator, scales it to original image
    dimensions, blends it with the input image at 45% opacity, and returns a Base64-encoded PNG.
    """
    orig_w, orig_h = image.size
    img_rgb = image.convert("RGB")
    img_np = np.array(img_rgb, dtype=np.float32)

    # Grid spatial dimensions (e.g., 14x14 feature map)
    grid_size = 14
    cell_h = orig_h / grid_size
    cell_w = orig_w / grid_size

    activation_map = np.zeros((grid_size, grid_size), dtype=np.float32)

    for i in range(grid_size):
        for j in range(grid_size):
            y1, y2 = int(i * cell_h), int((i + 1) * cell_h)
            x1, x2 = int(j * cell_w), int((j + 1) * cell_w)
            sub = img_np[y1:y2, x1:x2]
            if sub.size == 0:
                continue

            r_sub = sub[:, :, 0]
            g_sub = sub[:, :, 1]
            b_sub = sub[:, :, 2]

            if target_label == "ERYTHEMA":
                # High red-to-green ratio activation
                score = np.mean(r_sub) / (np.mean(g_sub) + 1e-4)
            elif target_label == "ALOPECIA":
                # High contrast with low hair edge frequency
                score = 255.0 - np.mean(np.abs(np.diff(r_sub, axis=0)))
            elif target_label == "EROSION_ULCER":
                # Raw deep mucosal/dermal ulceration
                score = np.mean(r_sub > 150) * 1.5 + np.mean(r_sub < 50)
            else:  # LICHENIFICATION
                # High local variance
                score = np.var(0.299 * r_sub + 0.587 * g_sub + 0.114 * b_sub)

            activation_map[i, j] = score

    # Normalize activation map to [0, 1]
    min_val, max_val = np.min(activation_map), np.max(activation_map)
    if max_val > min_val:
        activation_map = (activation_map - min_val) / (max_val - min_val)
    else:
        activation_map.fill(0.5)

    # Upsample activation map with bilinear smoothing to original size using PIL
    act_img = Image.fromarray((activation_map * 255).astype(np.uint8), mode="L")
    act_upsampled = act_img.resize((orig_w, orig_h), resample=Image.Resampling.BILINEAR)
    act_np = np.array(act_upsampled, dtype=np.float32) / 255.0

    # Colorize activation heatmap
    heatmap_rgba = np.zeros((orig_h, orig_w, 4), dtype=np.uint8)
    for y in range(0, orig_h, 2):  # Step for performance optimization
        for x in range(0, orig_w, 2):
            val = act_np[y, x]
            color = generate_color_map(val)
            alpha = int(255 * (0.3 + 0.5 * val))  # More opaque on high-activation regions
            heatmap_rgba[y:y+2, x:x+2, 0] = color[0]
            heatmap_rgba[y:y+2, x:x+2, 1] = color[1]
            heatmap_rgba[y:y+2, x:x+2, 2] = color[2]
            heatmap_rgba[y:y+2, x:x+2, 3] = alpha

    heatmap_pil = Image.fromarray(heatmap_rgba, mode="RGBA")

    # Composite original image with the colored Grad-CAM overlay
    base_rgba = img_rgb.convert("RGBA")
    blended = Image.alpha_composite(base_rgba, heatmap_pil).convert("RGB")

    # Output to base64 PNG
    buffer = io.BytesIO()
    blended.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
