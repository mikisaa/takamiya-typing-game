import { PALETTE } from "../palette.js";

/**
 * Helicopter Pixel Art Sprite
 * Compact side-view civilian helicopter (~42x20 px)
 * @param {object} [options]
 * @param {number} [options.rotorFrame=0] - 0, 1, 2 for rotor animation
 * @returns {string} SVG markup
 */
export function getHelicopterSvg({ rotorFrame = 0 } = {}) {
  // Main Rotor Blades (animated by frame)
  let mainRotor = "";
  if (rotorFrame % 3 === 0) {
    // Wide horizontal disk
    mainRotor = `
      <rect x="2" y="1" width="38" height="2" fill="${PALETTE.STEEL_LIGHT}" opacity="0.85" />
      <rect x="18" y="1" width="6" height="2" fill="${PALETTE.OUTLINE_DARK}" />
    `;
  } else if (rotorFrame % 3 === 1) {
    // Tilted blade perspective
    mainRotor = `
      <polygon points="6,0 34,2 34,3 6,1" fill="${PALETTE.STEEL_LIGHT}" opacity="0.85" />
      <rect x="18" y="1" width="6" height="2" fill="${PALETTE.OUTLINE_DARK}" />
    `;
  } else {
    // Reverse tilted blade
    mainRotor = `
      <polygon points="6,3 34,0 34,1 6,2" fill="${PALETTE.STEEL_LIGHT}" opacity="0.85" />
      <rect x="18" y="1" width="6" height="2" fill="${PALETTE.OUTLINE_DARK}" />
    `;
  }

  // Tail Rotor Blades (2 frames)
  const tailRotor = (rotorFrame % 2 === 0)
    ? `<rect x="0" y="5" width="2" height="8" fill="${PALETTE.STEEL_LIGHT}" />`
    : `<rect x="0" y="8" width="8" height="2" fill="${PALETTE.STEEL_LIGHT}" />`;

  return `
    <svg class="extra-helicopter-svg" viewBox="0 0 42 20" width="42" height="20" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Rotor Mast Shaft -->
      <rect x="20" y="2" width="2" height="4" fill="${PALETTE.OUTLINE_DARK}" />
      ${mainRotor}

      <!-- Cabin Pod (Right side) -->
      <rect x="14" y="6" width="16" height="9" fill="${PALETTE.OUTLINE_DARK}" rx="2" />
      <rect x="15" y="7" width="14" height="7" fill="${PALETTE.CRANE_BLUE}" />
      <!-- Cockpit Glass Window (Facing Right) -->
      <rect x="23" y="7" width="5" height="4" fill="${PALETTE.GLASS_BLUE}" />

      <!-- Tail Boom (Extends Left) -->
      <rect x="2" y="8" width="14" height="3" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="3" y="9" width="12" height="1" fill="${PALETTE.CRANE_BLUE}" />
      <!-- Tail Fin -->
      <polygon points="1,6 4,6 4,11 1,11" fill="${PALETTE.OUTLINE_DARK}" />
      <polygon points="2,7 3,7 3,10 2,10" fill="${PALETTE.TOWER_RED}" />
      ${tailRotor}

      <!-- Landing Skids Underbody -->
      <rect x="18" y="15" width="2" height="3" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="26" y="15" width="2" height="3" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="14" y="17" width="18" height="2" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="31" y="16" width="2" height="2" fill="${PALETTE.STEEL_LIGHT}" /> <!-- Curved skid tip -->
    </svg>
  `;
}
