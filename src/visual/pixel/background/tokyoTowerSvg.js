import { PALETTE } from "../palette.js";

/**
 * Tokyo Tower Pixel Landmark Progressive Pixel Art
 * Positioned in the center-right background: x=370, y=16
 * Iconic red & white lattice framework (~114px height)
 * @param {number} step - 0 to 7 (anchor legs to completed landmark)
 * @returns {string} SVG markup
 */
export function getTokyoTowerSvg(step = 0) {
  if (step < 0) return "";

  let content = `
    <!-- Tower Foundation Anchor Pads -->
    <rect x="372" y="125" width="16" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="373" y="126" width="14" height="3" fill="${PALETTE.CONCRETE_DARK}" />
    <rect x="420" y="125" width="16" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="421" y="126" width="14" height="3" fill="${PALETTE.CONCRETE_DARK}" />
  `;

  if (step >= 0) {
    // Splayed Anchor Base Legs
    content += `
      <!-- Left Splayed Leg -->
      <polygon points="378,125 382,125 396,104 392,104" fill="${PALETTE.TOWER_RED}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
      <!-- Right Splayed Leg -->
      <polygon points="426,125 430,125 416,104 412,104" fill="${PALETTE.TOWER_RED}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
      <!-- Cross Bracing -->
      <line x1="380" y1="122" x2="428" y2="122" stroke="${PALETTE.TOWER_RED}" stroke-width="2" />
    `;
  }

  if (step >= 1) {
    // Lower Arch Lattice & Lower Red Tower Section
    content += `
      <!-- Inverted Arch Truss -->
      <path d="M 388 120 Q 404 106 420 120" fill="none" stroke="${PALETTE.TOWER_RED}" stroke-width="2.5" />
      <!-- Lower Body Frame -->
      <polygon points="390,105 418,105 414,86 394,86" fill="${PALETTE.TOWER_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
      <!-- Internal Red Cross Lattice -->
      <line x1="392" y1="104" x2="414" y2="87" stroke="${PALETTE.TOWER_RED}" stroke-width="2" />
      <line x1="416" y1="104" x2="394" y2="87" stroke="${PALETTE.TOWER_RED}" stroke-width="2" />
    `;
  }

  if (step >= 2) {
    // Mid Lattice Framework (Red & White Banding)
    content += `
      <polygon points="394,86 414,86 411,68 397,68" fill="${PALETTE.TOWER_RED}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
      <!-- White Mid Band -->
      <polygon points="395,78 413,78 412,72 396,72" fill="${PALETTE.TOWER_WHITE}" />
      <line x1="395" y1="85" x2="411" y2="69" stroke="${PALETTE.TOWER_RED}" stroke-width="1.5" />
      <line x1="413" y1="85" x2="397" y2="69" stroke="${PALETTE.TOWER_RED}" stroke-width="1.5" />
    `;
  }

  if (step >= 3) {
    // Main Lower Observation Deck
    content += `
      <!-- Main Deck Housing -->
      <rect x="393" y="60" width="22" height="9" fill="${PALETTE.OUTLINE_DARK}" rx="1" />
      <rect x="394" y="61" width="20" height="7" fill="${PALETTE.TOWER_WHITE}" />
      <!-- Deck Windows -->
      <rect x="395" y="63" width="18" height="3" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="396" y="63" width="3" height="3" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="401" y="63" width="3" height="3" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="406" y="63" width="3" height="3" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="410" y="63" width="3" height="3" fill="${PALETTE.GLASS_BLUE}" />
    `;
  }

  if (step >= 4) {
    // Upper Lattice Shaft (Narrowing Tower)
    content += `
      <polygon points="399,60 409,60 407,38 401,38" fill="${PALETTE.TOWER_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1.5" />
      <!-- Red Banding Stripes -->
      <polygon points="400,54 408,54 407,46 401,46" fill="${PALETTE.TOWER_RED}" />
      <line x1="400" y1="59" x2="407" y2="39" stroke="${PALETTE.TOWER_RED}" stroke-width="1" />
      <line x1="408" y1="59" x2="401" y2="39" stroke="${PALETTE.TOWER_RED}" stroke-width="1" />
    `;
  }

  if (step >= 5) {
    // Special Upper Observation Deck
    content += `
      <rect x="398" y="32" width="12" height="7" fill="${PALETTE.OUTLINE_DARK}" rx="1" />
      <rect x="399" y="33" width="10" height="5" fill="${PALETTE.TOWER_WHITE}" />
      <!-- Small Deck Window -->
      <rect x="400" y="34" width="8" height="2" fill="${PALETTE.GLASS_BLUE}" />
    `;
  }

  if (step >= 6) {
    // Antenna Mast Structure
    content += `
      <rect x="403" y="16" width="2" height="16" fill="${PALETTE.TOWER_WHITE}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="0.75" />
      <!-- Red Bands on Antenna -->
      <rect x="403" y="24" width="2" height="4" fill="${PALETTE.TOWER_RED}" />
      <rect x="403" y="16" width="2" height="3" fill="${PALETTE.TOWER_RED}" />
    `;
  }

  if (step >= 7) {
    // Completed Tokyo Tower with Beacon & Illumination Accents
    content += `
      <!-- Top Beacon -->
      <circle cx="404" cy="14" r="2" fill="${PALETTE.TOWER_LIGHT}" />
      <circle cx="404" cy="14" r="1" fill="${PALETTE.SPARK_WHITE}" />
      <!-- Night/Dusk Light Accents -->
      <circle cx="395" cy="64" r="1" fill="${PALETTE.TOWER_LIGHT}" />
      <circle cx="413" cy="64" r="1" fill="${PALETTE.TOWER_LIGHT}" />
      <circle cx="404" cy="35" r="1" fill="${PALETTE.TOWER_LIGHT}" />
    `;
  }

  return content;
}
