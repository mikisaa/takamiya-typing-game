import { PALETTE } from "./palette.js";

/**
 * Forklift Pixel Art Sprite Generator (SVG)
 * Logical dimensions: 96px width x 56px height
 * Counterbalance industrial forklift facing right with multi-frame wheels.
 */

/**
 * Returns SVG markup string for Forklift at given wheel frame and vertical lift offset
 * @param {object} options
 * @param {number} [options.wheelFrame=0] - 0, 1, 2 for wheel rotation animation
 * @param {number} [options.forkLiftY=0] - vertical lift offset in pixels
 * @param {boolean} [options.isShaking=false] - collision shake effect
 * @returns {string} SVG HTML
 */
export function getForkliftSvg({ wheelFrame = 0, forkLiftY = 0, isShaking = false } = {}) {
  // Wheel spoke rotation variants based on wheelFrame (0, 1, 2)
  const spokeOffsets = [
    { fX: 4, fY: 2, rX: 3, rY: 2 },
    { fX: 2, fY: 4, rX: 2, rY: 3 },
    { fX: 3, fY: 2, rX: 3, rY: 2 }
  ];
  const spoke = spokeOffsets[wheelFrame % 3];

  return `
    <svg class="forklift-svg ${isShaking ? 'shake' : ''}" viewBox="0 0 96 56" width="96" height="56" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <rect x="8" y="52" width="76" height="4" fill="${PALETTE.SHADOW}" rx="2" />

      <!-- Rear Counterweight & Body -->
      <!-- Outline base -->
      <rect x="4" y="24" width="48" height="24" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="8" y="20" width="28" height="6" fill="${PALETTE.OUTLINE_DARK}" />
      
      <!-- Body Yellow/Orange Panels -->
      <rect x="6" y="26" width="16" height="20" fill="${PALETTE.FORK_BODY_MAIN}" />
      <rect x="6" y="26" width="16" height="4" fill="${PALETTE.FORK_BODY_LIGHT}" />
      <rect x="6" y="42" width="44" height="4" fill="${PALETTE.FORK_BODY_DARK}" />
      
      <!-- Engine Hood & Battery Base -->
      <rect x="22" y="26" width="28" height="16" fill="${PALETTE.FORK_BODY_MAIN}" />
      <rect x="22" y="26" width="28" height="4" fill="${PALETTE.FORK_BODY_LIGHT}" />
      
      <!-- Counterweight Accent Stripe -->
      <rect x="6" y="32" width="4" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="12" y="32" width="4" height="8" fill="${PALETTE.OUTLINE_DARK}" />

      <!-- Driver Compartment & Seat -->
      <rect x="22" y="16" width="6" height="12" fill="${PALETTE.FORK_SEAT}" />
      <rect x="24" y="22" width="10" height="6" fill="${PALETTE.FORK_SEAT}" />
      <rect x="36" y="20" width="4" height="8" fill="${PALETTE.FORK_CABIN}" />
      <rect x="38" y="16" width="6" height="4" fill="${PALETTE.OUTLINE_DARK}" /> <!-- Steering Wheel -->

      <!-- Overhead Guard (Roll Cage) -->
      <!-- Rear pillar -->
      <rect x="16" y="4" width="4" height="24" fill="${PALETTE.FORK_CABIN}" />
      <!-- Front pillar -->
      <rect x="44" y="4" width="4" height="24" fill="${PALETTE.FORK_CABIN}" />
      <!-- Roof guard -->
      <rect x="14" y="2" width="36" height="4" fill="${PALETTE.FORK_CABIN}" />
      <rect x="20" y="2" width="4" height="4" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="30" y="2" width="4" height="4" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="40" y="2" width="4" height="4" fill="${PALETTE.OUTLINE_DARK}" />

      <!-- Vertical Mast -->
      <rect x="52" y="0" width="8" height="50" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="54" y="2" width="4" height="46" fill="${PALETTE.FORK_MAST}" />
      <rect x="54" y="2" width="2" height="46" fill="${PALETTE.STEEL_LIGHT}" />

      <!-- Moving Fork Carriage & Forks (Liftable via forkLiftY) -->
      <g transform="translate(0, ${-forkLiftY})">
        <!-- Fork Carriage on Mast -->
        <rect x="50" y="30" width="12" height="18" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="52" y="32" width="8" height="14" fill="${PALETTE.FORK_FORKS}" />
        
        <!-- Forks (Projecting forward to the right) -->
        <!-- Vertical fork backplate -->
        <rect x="58" y="34" width="4" height="16" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="59" y="36" width="2" height="12" fill="${PALETTE.STEEL_HIGHLIGHT}" />
        <!-- Horizontal fork blades -->
        <rect x="62" y="46" width="30" height="4" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="62" y="47" width="28" height="2" fill="${PALETTE.STEEL_LIGHT}" />
        <!-- Fork tips -->
        <rect x="90" y="48" width="4" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      </g>

      <!-- Rear Steering Wheel (Smaller, Left) -->
      <circle cx="16" cy="46" r="8" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="16" cy="46" r="7" fill="${PALETTE.TIRE_BLACK}" />
      <circle cx="16" cy="46" r="4" fill="${PALETTE.RIM_DARK}" />
      <rect x="${16 - spoke.rX}" y="${46 - spoke.rY}" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />

      <!-- Front Drive Wheel (Larger, Right) -->
      <circle cx="44" cy="45" r="9" fill="${PALETTE.OUTLINE_DARK}" />
      <circle cx="44" cy="45" r="8" fill="${PALETTE.TIRE_BLACK}" />
      <circle cx="44" cy="45" r="5" fill="${PALETTE.RIM_DARK}" />
      <rect x="${44 - spoke.fX}" y="${45 - spoke.fY}" width="4" height="4" fill="${PALETTE.RIM_LIGHT}" />
    </svg>
  `;
}
