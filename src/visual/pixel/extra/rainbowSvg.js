/**
 * Rainbow Background Overlay Event Pixel Art
 * Semi-transparent 5-color arc spanning across the sky behind buildings
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
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <g mask="url(#rainbowFade)">
        <!-- 5 Concentric Color Arcs (Center at x=450, y=140) -->
        <!-- Red Band -->
        <circle cx="450" cy="140" r="132" fill="none" stroke="#ef4444" stroke-width="4" opacity="0.65" />
        <!-- Orange Band -->
        <circle cx="450" cy="140" r="128" fill="none" stroke="#f97316" stroke-width="4" opacity="0.65" />
        <!-- Yellow Band -->
        <circle cx="450" cy="140" r="124" fill="none" stroke="#eab308" stroke-width="4" opacity="0.65" />
        <!-- Green Band -->
        <circle cx="450" cy="140" r="120" fill="none" stroke="#22c55e" stroke-width="4" opacity="0.65" />
        <!-- Blue / Cyan Band -->
        <circle cx="450" cy="140" r="116" fill="none" stroke="#06b6d4" stroke-width="4" opacity="0.65" />
      </g>
    </svg>
  `;
}
