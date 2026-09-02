import { PALETTE } from "../palette.js";

/**
 * Mid-Rise Office Building Progressive Pixel Art
 * Positioned on the center-left: x=210, y=52
 * Sized significantly taller than House (~78px height)
 * @param {number} step - 0 (2F frame), 1 (3F), 2 (4F), 3 (5F walls), 4 (windows), 5 (completed)
 * @returns {string} SVG markup
 */
export function getBuildingSvg(step = 0) {
  if (step < 0) return "";

  let content = `
    <!-- Building Deep Concrete Foundation -->
    <rect x="210" y="125" width="64" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="211" y="126" width="62" height="3" fill="${PALETTE.CONCRETE_MAIN}" />
  `;

  if (step >= 0) {
    // Base 2 Floors Frame
    content += `
      <rect x="212" y="100" width="60" height="25" fill="${PALETTE.BUILDING_DARK}" opacity="0.6" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="214" y="112" width="56" height="2" fill="${PALETTE.CONCRETE_MAIN}" />
      <rect x="226" y="100" width="2" height="25" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="242" y="100" width="2" height="25" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="258" y="100" width="2" height="25" fill="${PALETTE.CONCRETE_DARK}" />
    `;
  }

  if (step >= 1) {
    // 3rd Floor Frame
    content += `
      <rect x="212" y="86" width="60" height="15" fill="${PALETTE.BUILDING_DARK}" opacity="0.7" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="214" y="86" width="56" height="2" fill="${PALETTE.CONCRETE_MAIN}" />
      <rect x="226" y="86" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="242" y="86" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="258" y="86" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
    `;
  }

  if (step >= 2) {
    // 4th Floor Frame
    content += `
      <rect x="212" y="72" width="60" height="15" fill="${PALETTE.BUILDING_DARK}" opacity="0.8" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="214" y="72" width="56" height="2" fill="${PALETTE.CONCRETE_MAIN}" />
      <rect x="226" y="72" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="242" y="72" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
      <rect x="258" y="72" width="2" height="15" fill="${PALETTE.CONCRETE_DARK}" />
    `;
  }

  if (step >= 3) {
    // 5th Floor & Full Facade Wall Cladding
    content += `
      <rect x="212" y="58" width="60" height="67" fill="${PALETTE.BUILDING_WALL}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <!-- Floor band trims -->
      <rect x="212" y="72" width="60" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="212" y="86" width="60" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="212" y="100" width="60" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="212" y="114" width="60" height="2" fill="${PALETTE.OUTLINE_DARK}" />
    `;
  }

  if (step >= 4) {
    // Repeating Office Glass Windows
    for (let f = 0; f < 4; f++) {
      const rowY = 62 + f * 14;
      content += `
        <rect x="218" y="${rowY}" width="10" height="8" fill="${PALETTE.BUILDING_WINDOW}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1" />
        <rect x="234" y="${rowY}" width="10" height="8" fill="${PALETTE.BUILDING_WINDOW}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1" />
        <rect x="250" y="${rowY}" width="10" height="8" fill="${PALETTE.BUILDING_WINDOW}" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="1" />
      `;
    }
  }

  if (step >= 5) {
    // Completed Building with Rooftop Elevator Housing & HVAC
    content += `
      <!-- Rooftop Structures -->
      <rect x="218" y="48" width="16" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="219" y="49" width="14" height="8" fill="${PALETTE.CONCRETE_MAIN}" />
      <rect x="244" y="52" width="14" height="6" fill="${PALETTE.STEEL_DARK}" />
      <rect x="246" y="53" width="10" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <!-- Small Rooftop Communication Mast -->
      <rect x="225" y="40" width="2" height="8" fill="${PALETTE.STEEL_LIGHT}" />
      <circle cx="226" cy="40" r="1.5" fill="${PALETTE.TOWER_RED}" />

      <!-- 1st Floor Entrance Lobby -->
      <rect x="232" y="116" width="14" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="233" y="117" width="12" height="8" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="239" y="117" width="1" height="8" fill="${PALETTE.OUTLINE_DARK}" />
    `;
  }

  return content;
}
