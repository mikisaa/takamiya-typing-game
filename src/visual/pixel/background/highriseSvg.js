import { PALETTE } from "../palette.js";

/**
 * High-Rise Skyscraper Progressive Pixel Art
 * Positioned in the central-right midground: x=290, y=28
 * Substantially taller than mid-rise building (~102px height)
 * @param {number} step - 0 (core), 1 (lower tier), 2 (mid tier), 3 (upper tier), 4 (crown), 5 (glazing), 6 (completed)
 * @returns {string} SVG markup
 */
export function getHighriseSvg(step = 0) {
  if (step < 0) return "";

  let content = `
    <!-- Deep Foundation Caissons -->
    <rect x="290" y="125" width="60" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="291" y="126" width="58" height="3" fill="${PALETTE.CONCRETE_DARK}" />
  `;

  if (step >= 0) {
    // Base Core Framework
    content += `
      <rect x="294" y="98" width="52" height="27" fill="${PALETTE.HIGHRISE_DARK}" opacity="0.6" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="306" y="98" width="28" height="27" fill="${PALETTE.CONCRETE_MAIN}" opacity="0.4" />
      <rect x="306" y="98" width="2" height="27" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="332" y="98" width="2" height="27" fill="${PALETTE.STEEL_LIGHT}" />
    `;
  }

  if (step >= 1) {
    // Lower Tier Rising
    content += `
      <rect x="294" y="78" width="52" height="21" fill="${PALETTE.HIGHRISE_DARK}" opacity="0.75" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="306" y="78" width="28" height="21" fill="${PALETTE.CONCRETE_MAIN}" opacity="0.4" />
      <rect x="306" y="78" width="2" height="21" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="332" y="78" width="2" height="21" fill="${PALETTE.STEEL_LIGHT}" />
    `;
  }

  if (step >= 2) {
    // Mid Tier Rising
    content += `
      <rect x="296" y="58" width="48" height="21" fill="${PALETTE.HIGHRISE_DARK}" opacity="0.85" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="308" y="58" width="24" height="21" fill="${PALETTE.CONCRETE_MAIN}" opacity="0.4" />
      <rect x="308" y="58" width="2" height="21" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="330" y="58" width="2" height="21" fill="${PALETTE.STEEL_LIGHT}" />
    `;
  }

  if (step >= 3) {
    // Upper Tier Rising High
    content += `
      <rect x="298" y="38" width="44" height="21" fill="${PALETTE.HIGHRISE_DARK}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="310" y="38" width="20" height="21" fill="${PALETTE.HIGHRISE_ACCENT}" opacity="0.5" />
    `;
  }

  if (step >= 4) {
    // Architectural Crown & Setback Spire Frame
    content += `
      <rect x="304" y="24" width="32" height="15" fill="${PALETTE.HIGHRISE_DARK}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="314" y="14" width="12" height="11" fill="${PALETTE.HIGHRISE_DARK}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="319" y="8" width="2" height="7" fill="${PALETTE.STEEL_LIGHT}" />
    `;
  }

  if (step >= 5) {
    // Blue-glass Curtain Wall & Vertical Mullions
    content += `
      <!-- Lower Body Curtain Wall -->
      <rect x="295" y="79" width="50" height="46" fill="${PALETTE.HIGHRISE_DARK}" />
      <!-- Vertical Glass Ribbons -->
      <rect x="298" y="80" width="8" height="44" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.85" />
      <rect x="310" y="80" width="8" height="44" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.85" />
      <rect x="322" y="80" width="8" height="44" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.85" />
      <rect x="334" y="80" width="8" height="44" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.85" />

      <!-- Mid-Upper Tier Curtain Wall -->
      <rect x="299" y="39" width="42" height="39" fill="${PALETTE.HIGHRISE_DARK}" />
      <rect x="303" y="40" width="7" height="37" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.9" />
      <rect x="314" y="40" width="7" height="37" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.9" />
      <rect x="325" y="40" width="7" height="37" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.9" />
      <rect x="336" y="40" width="4" height="37" fill="${PALETTE.HIGHRISE_GLASS}" opacity="0.9" />
    `;
  }

  if (step >= 6) {
    // Completed Skyscraper with Beacon & Lighting Strips
    content += `
      <!-- Crown Illumination & Architectural Top -->
      <rect x="305" y="25" width="30" height="13" fill="${PALETTE.HIGHRISE_ACCENT}" />
      <rect x="315" y="15" width="10" height="9" fill="${PALETTE.HIGHRISE_GLASS}" />
      <rect x="319" y="6" width="2" height="9" fill="${PALETTE.SPARK_WHITE}" />
      <circle cx="320" cy="5" r="2" fill="${PALETTE.TOWER_RED}" />
      <circle cx="320" cy="5" r="1" fill="${PALETTE.SPARK_YELLOW}" /> <!-- Red Aviation Beacon -->

      <!-- Base Entrance Portal -->
      <rect x="312" y="116" width="16" height="9" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="313" y="117" width="14" height="8" fill="${PALETTE.HIGHRISE_GLASS}" />
    `;
  }

  return content;
}
