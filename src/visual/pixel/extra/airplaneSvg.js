import { PALETTE } from "../palette.js";

/**
 * Airplane Pixel Art Sprite
 * Compact side-view civilian aircraft (~48x16 px)
 * @param {object} [options]
 * @param {boolean} [options.beaconOn=false]
 * @returns {string} SVG markup
 */
export function getAirplaneSvg({ beaconOn = false } = {}) {
  return `
    <svg class="extra-airplane-svg" viewBox="0 0 48 16" width="48" height="16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Fuselage Outline -->
      <polygon points="12,4 40,4 44,8 40,12 12,12 8,8" fill="${PALETTE.OUTLINE_DARK}" />
      <!-- Fuselage White Body -->
      <polygon points="13,5 39,5 43,8 39,11 13,11 9,8" fill="${PALETTE.TRUCK_CAB_WHITE}" />
      <!-- Underbelly Shadow -->
      <rect x="14" y="9" width="25" height="2" fill="${PALETTE.CONCRETE_MAIN}" />

      <!-- Cockpit Windshield (Right facing) -->
      <polygon points="38,6 41,7 41,8 38,8" fill="${PALETTE.GLASS_BLUE}" />

      <!-- Passenger Cabin Windows -->
      <rect x="18" y="7" width="2" height="2" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="22" y="7" width="2" height="2" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="26" y="7" width="2" height="2" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="30" y="7" width="2" height="2" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="34" y="7" width="2" height="2" fill="${PALETTE.HIGHRISE_DARK}" />

      <!-- Main Wing (Swept) -->
      <polygon points="20,10 28,10 24,15 18,15" fill="${PALETTE.OUTLINE_DARK}" />
      <polygon points="21,10 27,10 24,14 19,14" fill="${PALETTE.STEEL_LIGHT}" />

      <!-- Vertical Tail Fin (Left / Rear) -->
      <polygon points="8,4 14,4 10,0 6,0" fill="${PALETTE.OUTLINE_DARK}" />
      <polygon points="9,4 13,4 10,1 7,1" fill="${PALETTE.TOWER_RED}" />

      <!-- Red Navigation Light on Wingtip / Tail -->
      <rect x="6" y="0" width="2" height="2" fill="${beaconOn ? PALETTE.SPARK_WHITE : PALETTE.TOWER_RED}" />
      <rect x="23" y="14" width="2" height="2" fill="${beaconOn ? PALETTE.SPARK_YELLOW : PALETTE.TOWER_RED}" />
    </svg>
  `;
}
