import { PALETTE } from "../palette.js";

/**
 * Skydiver Pixel Art Sprite
 * Freefall figure or open parachute descent (~32x36 px)
 * @param {object} [options]
 * @param {boolean} [options.isParachuteOpen=false]
 * @returns {string} SVG markup
 */
export function getSkydiverSvg({ isParachuteOpen = false } = {}) {
  if (!isParachuteOpen) {
    // 1. Freefalling Figure (Arms & legs spread, facing down)
    return `
      <svg class="extra-skydiver-freefall" viewBox="0 0 20 20" width="20" height="20" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <!-- Helmet -->
        <circle cx="10" cy="5" r="3" fill="${PALETTE.OUTLINE_DARK}" />
        <circle cx="10" cy="5" r="2" fill="${PALETTE.SPARK_YELLOW}" />
        <rect x="9" y="4" width="2" height="1" fill="${PALETTE.GLASS_BLUE}" /> <!-- Goggles -->

        <!-- Jumpsuit Body & Rig -->
        <rect x="8" y="7" width="4" height="6" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="9" y="8" width="2" height="4" fill="${PALETTE.CRANE_BLUE}" />
        <rect x="8" y="7" width="4" height="2" fill="${PALETTE.TOWER_RED}" /> <!-- Backpack Rig -->

        <!-- Arms Outspread -->
        <rect x="4" y="6" width="4" height="2" fill="${PALETTE.CRANE_BLUE}" />
        <rect x="12" y="6" width="4" height="2" fill="${PALETTE.CRANE_BLUE}" />

        <!-- Legs Trailing -->
        <rect x="7" y="13" width="2" height="4" fill="${PALETTE.CRANE_BLUE}" />
        <rect x="11" y="13" width="2" height="4" fill="${PALETTE.CRANE_BLUE}" />
      </svg>
    `;
  }

  // 2. Parachute Deployed Descent
  return `
    <svg class="extra-skydiver-parachute" viewBox="0 0 32 36" width="32" height="36" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Parachute Canopy (Round striped dome) -->
      <polygon points="4,10 28,10 24,2 8,2" fill="${PALETTE.OUTLINE_DARK}" />
      <!-- Colored Canopy Gores / Ribs -->
      <polygon points="5,9 10,9 9,3 6,3" fill="${PALETTE.TOWER_RED}" />
      <polygon points="10,9 15,9 14,3 9,3" fill="${PALETTE.SPARK_WHITE}" />
      <polygon points="15,9 19,9 18,3 14,3" fill="${PALETTE.CRANE_BLUE}" />
      <polygon points="19,9 23,9 22,3 18,3" fill="${PALETTE.SPARK_YELLOW}" />
      <polygon points="23,9 27,9 26,3 22,3" fill="${PALETTE.TOWER_RED}" />
      <!-- Vent hole rim -->
      <rect x="14" y="2" width="4" height="1" fill="${PALETTE.OUTLINE_DARK}" />

      <!-- Suspension Lines -->
      <line x1="5" y1="10" x2="16" y2="24" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.75" />
      <line x1="12" y1="10" x2="16" y2="24" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.75" />
      <line x1="20" y1="10" x2="16" y2="24" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.75" />
      <line x1="27" y1="10" x2="16" y2="24" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="1" opacity="0.75" />

      <!-- Skydiver Figure Suspended -->
      <!-- Helmet -->
      <circle cx="16" cy="22" r="2.5" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="16" cy="22" r="1.5" fill="${PALETTE.SPARK_YELLOW}" />
      <!-- Jumpsuit Body -->
      <rect x="14" y="24" width="4" height="6" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="15" y="25" width="2" height="4" fill="${PALETTE.CRANE_BLUE}" />
      <!-- Legs Hanging -->
      <rect x="14" y="30" width="2" height="3" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="16" y="30" width="2" height="3" fill="${PALETTE.HIGHRISE_DARK}" />
    </svg>
  `;
}
