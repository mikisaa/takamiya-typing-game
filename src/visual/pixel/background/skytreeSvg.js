import { PALETTE } from "../palette.js";

/**
 * Tokyo Skytree Pixel Landmark
 * Positioned in the right-center background: x=460, y=6
 * Tallest landmark in the game (~124px height)
 * @param {number} step - 0 (hidden) or 8 (completed)
 * @returns {string} SVG markup
 */
export function getSkytreeSvg(step = 0) {
  if (step < 8) return "";

  return `
    <!-- Skytree Deep Underground Piles & Tripod Foundation -->
    <rect x="466" y="125" width="52" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="468" y="126" width="48" height="3" fill="${PALETTE.CONCRETE_MAIN}" />

    <!-- 1. Lower Triangular Tripod Base (Wide splay tapering upward) -->
    <polygon points="470,125 514,125 500,92 484,92" fill="${PALETTE.SKYTREE_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
    <!-- Steel Lattice Ribbons -->
    <line x1="472" y1="124" x2="499" y2="93" stroke="${PALETTE.SKYTREE_STEEL}" stroke-width="1.5" />
    <line x1="512" y1="124" x2="485" y2="93" stroke="${PALETTE.SKYTREE_STEEL}" stroke-width="1.5" />
    <line x1="492" y1="124" x2="492" y2="92" stroke="${PALETTE.SKYTREE_CYAN}" stroke-width="1.5" />

    <!-- 2. Cylindrical Mid Lattice Shaft -->
    <polygon points="484,92 500,92 497,66 487,66" fill="${PALETTE.SKYTREE_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
    <line x1="485" y1="91" x2="496" y2="67" stroke="${PALETTE.SKYTREE_STEEL}" stroke-width="1" />
    <line x1="499" y1="91" x2="488" y2="67" stroke="${PALETTE.SKYTREE_STEEL}" stroke-width="1" />
    <line x1="492" y1="91" x2="492" y2="66" stroke="${PALETTE.SKYTREE_CYAN}" stroke-width="1" />

    <!-- 3. Lower Tembo Deck (Wide circular observation deck) -->
    <rect x="480" y="56" width="24" height="10" fill="${PALETTE.OUTLINE_DARK}" rx="2" />
    <rect x="481" y="57" width="22" height="8" fill="${PALETTE.SKYTREE_WHITE}" />
    <!-- Observation Glass Ribbon -->
    <rect x="482" y="59" width="20" height="3" fill="${PALETTE.GLASS_BLUE}" />
    <rect x="482" y="57" width="20" height="1" fill="${PALETTE.SKYTREE_CYAN}" />

    <!-- 4. Upper Cylindrical Shaft -->
    <polygon points="487,56 497,56 495,42 489,42" fill="${PALETTE.SKYTREE_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
    <line x1="492" y1="55" x2="492" y2="42" stroke="${PALETTE.SKYTREE_CYAN}" stroke-width="1" />

    <!-- 5. Upper Tembo Galleria Deck -->
    <rect x="484" y="34" width="16" height="8" fill="${PALETTE.OUTLINE_DARK}" rx="1.5" />
    <rect x="485" y="35" width="14" height="6" fill="${PALETTE.SKYTREE_WHITE}" />
    <rect x="486" y="36" width="12" height="2" fill="${PALETTE.GLASS_BLUE}" />

    <!-- 6. Narrowing Mast -->
    <polygon points="489,34 495,34 493,18 491,18" fill="${PALETTE.SKYTREE_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1" />

    <!-- 7. Antenna Spire & Peak Beacon -->
    <rect x="491" y="6" width="2" height="12" fill="${PALETTE.SPARK_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="0.75" />
    <!-- Cyan & White Beacon Light -->
    <circle cx="492" cy="5" r="2.5" fill="${PALETTE.SKYTREE_CYAN}" opacity="0.85" />
    <circle cx="492" cy="5" r="1.5" fill="${PALETTE.SPARK_WHITE}" />
  `;
}
