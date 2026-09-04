import { PALETTE } from "../palette.js";

/**
 * Rainbow Background Overlay Event Pixel Art
 * Realistic 7-Color Rainbow spanning across the sky behind buildings
 * Band colors: Red, Orange, Yellow, Green, Cyan, Blue, Violet
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
        <!-- Authentic 7-Color Spectral Arcs (Center at x=450, y=140) -->
        <circle cx="450" cy="140" r="132" fill="none" stroke="${PALETTE.RAINBOW.RED}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="129" fill="none" stroke="${PALETTE.RAINBOW.ORANGE}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="126" fill="none" stroke="${PALETTE.RAINBOW.YELLOW}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="123" fill="none" stroke="${PALETTE.RAINBOW.GREEN}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="120" fill="none" stroke="${PALETTE.RAINBOW.CYAN}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="117" fill="none" stroke="${PALETTE.RAINBOW.BLUE}" stroke-width="3" opacity="0.8" />
        <circle cx="450" cy="140" r="114" fill="none" stroke="${PALETTE.RAINBOW.VIOLET}" stroke-width="3" opacity="0.8" />
      </g>
    </svg>
  `;
}
