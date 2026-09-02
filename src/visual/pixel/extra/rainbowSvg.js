import { PALETTE } from "../palette.js";

/**
 * Rainbow Background Overlay Event Pixel Art
 * Botanical / Unified Palette Rainbow spanning across the sky behind buildings
 * Band colors: #450C3F, #B9D175, #D9EFBD, #F5FBDA
 * @param {object} [options]
 * @param {number} [options.opacity=1.0] - Fade-in/fade-out opacity (0.0 to 1.0)
 * @returns {string} SVG markup
 */
export function getRainbowSvg({ opacity = 1.0 } = {}) {
  const safeOpacity = Math.max(0, Math.min(1.0, opacity));

  return `
    <svg class="extra-rainbow-svg" viewBox="0 0 900 135" width="900" height="135" shape-rendering="crispEdges" opacity="${safeOpacity.toFixed(2)}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Soft clipping mask for semi-circular sky arc -->
        <linearGradient id="rainbowFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <g mask="url(#rainbowFade)">
        <!-- Botanical Palette Arcs (Center at x=450, y=140) -->
        <!-- Band 1: DARK Plum Outermost Band -->
        <circle cx="450" cy="140" r="132" fill="none" stroke="${PALETTE.DARK}" stroke-width="4" opacity="0.4" />
        <!-- Band 2: ACCENT Green Band -->
        <circle cx="450" cy="140" r="128" fill="none" stroke="${PALETTE.ACCENT}" stroke-width="4" opacity="0.65" />
        <!-- Band 3: PALE_2 Soft Green Band -->
        <circle cx="450" cy="140" r="124" fill="none" stroke="${PALETTE.PALE_2}" stroke-width="4" opacity="0.75" />
        <!-- Band 4: PALE_1 Cream Band -->
        <circle cx="450" cy="140" r="120" fill="none" stroke="${PALETTE.PALE_1}" stroke-width="4" opacity="0.85" />
        <!-- Band 5: Innermost Accent Stroke -->
        <circle cx="450" cy="140" r="116" fill="none" stroke="${PALETTE.ACCENT}" stroke-width="3" opacity="0.5" />
      </g>
    </svg>
  `;
}
