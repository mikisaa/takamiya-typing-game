import { PALETTE } from "../palette.js";

/**
 * Balloons Cluster Pixel Art Sprite
 * 5 colorful balloons bundled with string tails (~28x38 px)
 * @returns {string} SVG markup
 */
export function getBalloonsSvg() {
  return `
    <svg class="extra-balloons-svg" viewBox="0 0 28 38" width="28" height="38" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Balloon Strings -->
      <line x1="6" y1="14" x2="14" y2="34" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.6" />
      <line x1="14" y1="10" x2="14" y2="34" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.6" />
      <line x1="22" y1="12" x2="14" y2="34" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.6" />
      <line x1="10" y1="16" x2="14" y2="34" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.6" />
      <line x1="18" y1="18" x2="14" y2="34" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.6" />
      <!-- String Tie Ribbon -->
      <rect x="13" y="34" width="3" height="3" fill="${PALETTE.TOWER_RED}" />

      <!-- Balloon 1: Top Center (Yellow) -->
      <circle cx="14" cy="6" r="5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="14" cy="6" r="4" fill="${PALETTE.SPARK_YELLOW}" />
      <rect x="13" y="4" width="2" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="13,10 15,10 14,11" fill="${PALETTE.SPARK_YELLOW}" />

      <!-- Balloon 2: Left High (Red) -->
      <circle cx="6" cy="10" r="5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="6" cy="10" r="4" fill="${PALETTE.TOWER_RED}" />
      <rect x="5" y="8" width="2" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="5,14 7,14 6,15" fill="${PALETTE.TOWER_RED}" />

      <!-- Balloon 3: Right High (Cyan) -->
      <circle cx="22" cy="8" r="5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="22" cy="8" r="4" fill="${PALETTE.HIGHRISE_GLASS}" />
      <rect x="21" y="6" width="2" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="21,12 23,12 22,13" fill="${PALETTE.HIGHRISE_GLASS}" />

      <!-- Balloon 4: Mid Left (Green) -->
      <circle cx="10" cy="15" r="4.5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="10" cy="15" r="3.5" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="9" y="13" width="2" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="9,18 11,18 10,19" fill="${PALETTE.GLASS_BLUE}" />

      <!-- Balloon 5: Mid Right (Orange) -->
      <circle cx="18" cy="16" r="4.5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="18" cy="16" r="3.5" fill="${PALETTE.BURST_ORANGE}" />
      <rect x="17" y="14" width="2" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="17,19 19,19 18,20" fill="${PALETTE.BURST_ORANGE}" />
    </svg>
  `;
}
