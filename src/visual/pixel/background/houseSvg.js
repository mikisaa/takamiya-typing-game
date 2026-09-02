import { PALETTE } from "../palette.js";

/**
 * Residential House Progressive Pixel Art
 * Positioned on the left-center midground: x=120, y=74
 * @param {number} step - 0 (footings), 1 (1F frame), 2 (2F frame), 3 (sheathing), 4 (completed)
 * @returns {string} SVG markup
 */
export function getHouseSvg(step = 0) {
  if (step < 0) return "";

  let content = `
    <!-- House Foundation Concrete Footing -->
    <rect x="120" y="125" width="72" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="121" y="126" width="70" height="3" fill="${PALETTE.CONCRETE_MAIN}" />
    <rect x="121" y="126" width="70" height="1" fill="${PALETTE.CONCRETE_LIGHT}" />
  `;

  if (step >= 1) {
    content += `
      <!-- 1st Floor Timber Framing -->
      <rect x="122" y="108" width="68" height="17" fill="none" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="123" y="109" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="144" y="109" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="165" y="109" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="186" y="109" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="123" y="108" width="66" height="2" fill="${PALETTE.WOOD_DARK}" />
    `;
  }

  if (step >= 2) {
    content += `
      <!-- 2nd Floor Timber Framing & Roof Trusses -->
      <rect x="126" y="92" width="60" height="16" fill="none" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="127" y="93" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="155" y="93" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <rect x="182" y="93" width="3" height="15" fill="${PALETTE.WOOD_FRAME}" />
      <!-- Gable Roof Trusses -->
      <polygon points="120,92 156,76 192,92" fill="none" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <polygon points="122,92 156,78 190,92" fill="${PALETTE.WOOD_FRAME}" opacity="0.35" />
      <rect x="155" y="78" width="2" height="14" fill="${PALETTE.WOOD_DARK}" />
    `;
  }

  if (step >= 3) {
    content += `
      <!-- Wall Sheathing & Roof Decking Panels -->
      <rect x="122" y="92" width="68" height="33" fill="${PALETTE.HOUSE_WALL}" />
      <polygon points="118,93 156,75 194,93" fill="${PALETTE.OUTLINE_DARK}" />
      <polygon points="120,92 156,76 192,92" fill="${PALETTE.HOUSE_ROOF}" />
      <polygon points="122,92 156,78 190,92" fill="${PALETTE.HOUSE_ROOF}" opacity="0.8" />
    `;
  }

  if (step >= 4) {
    content += `
      <!-- Completed House with Windows, Door, Balcony, Chimney -->
      <!-- Pitched Roof Eaves & Texture -->
      <rect x="116" y="92" width="80" height="3" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="118" y="92" width="76" height="1" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="174" y="70" width="8" height="12" fill="${PALETTE.OUTLINE_DARK}" /> <!-- Chimney -->
      <rect x="175" y="71" width="6" height="10" fill="${PALETTE.CONCRETE_MAIN}" />

      <!-- 2nd Floor Windows -->
      <rect x="132" y="96" width="14" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="133" y="97" width="12" height="8" fill="${PALETTE.GLASS_TINT}" />
      <rect x="138" y="97" width="2" height="8" fill="${PALETTE.OUTLINE_DARK}" />

      <rect x="164" y="96" width="14" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="165" y="97" width="12" height="8" fill="${PALETTE.GLASS_TINT}" />
      <rect x="170" y="97" width="2" height="8" fill="${PALETTE.OUTLINE_DARK}" />

      <!-- 1st Floor Entrance Door -->
      <rect x="132" y="112" width="12" height="13" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="133" y="113" width="10" height="12" fill="${PALETTE.HOUSE_DOOR}" />
      <rect x="140" y="118" width="2" height="2" fill="${PALETTE.SPARK_YELLOW}" /> <!-- Knob -->

      <!-- 1st Floor Living Window & Balcony Rail -->
      <rect x="154" y="112" width="24" height="11" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="155" y="113" width="22" height="9" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="165" y="113" width="2" height="9" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="152" y="119" width="28" height="2" fill="${PALETTE.STEEL_LIGHT}" /> <!-- Rail -->
    `;
  }

  return content;
}
