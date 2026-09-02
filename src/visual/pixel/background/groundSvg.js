import { PALETTE } from "../palette.js";

/**
 * Ground Stage Progressive Pixel Art (Survey markers, stakes, construction pallets)
 * @param {number} step - 0 (empty), 1 (survey markers), 2 (stakes & pallets)
 * @returns {string} SVG markup
 */
export function getGroundSvg(step = 0) {
  let content = `
    <!-- Distant Horizon Line & Yard Border -->
    <rect x="0" y="128" width="900" height="2" fill="${PALETTE.OUTLINE_MED}" />
    <rect x="0" y="130" width="900" height="5" fill="${PALETTE.STEEL_DARK}" opacity="0.4" />
  `;

  if (step >= 1) {
    content += `
      <!-- Survey Flags & Stakes -->
      <!-- Left Survey Post -->
      <rect x="80" y="118" width="2" height="12" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="82" y="118" width="8" height="5" fill="${PALETTE.TOWER_RED}" />
      <rect x="83" y="119" width="6" height="3" fill="${PALETTE.SPARK_WHITE}" />

      <!-- Center Survey Post -->
      <rect x="320" y="120" width="2" height="10" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="322" y="120" width="7" height="4" fill="${PALETTE.SPARK_YELLOW}" />

      <!-- Right Survey Marker -->
      <rect x="540" y="119" width="2" height="11" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="542" y="119" width="7" height="4" fill="${PALETTE.CRANE_BLUE}" />
    `;
  }

  if (step >= 2) {
    content += `
      <!-- Ground Chalk Markings & Material Pallet Base -->
      <rect x="110" y="127" width="40" height="2" fill="${PALETTE.SPARK_WHITE}" opacity="0.6" stroke-dasharray="4,3" />
      <rect x="220" y="127" width="50" height="2" fill="${PALETTE.SPARK_WHITE}" opacity="0.6" stroke-dasharray="4,3" />

      <!-- Small Wooden Staging Pallet on Ground -->
      <rect x="180" y="123" width="24" height="6" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="181" y="124" width="22" height="2" fill="${PALETTE.WOOD_PALLET}" />
      <rect x="181" y="127" width="22" height="2" fill="${PALETTE.WOOD_DARK}" />
      <rect x="186" y="121" width="12" height="2" fill="${PALETTE.CONCRETE_LIGHT}" />
    `;
  }

  return content;
}
