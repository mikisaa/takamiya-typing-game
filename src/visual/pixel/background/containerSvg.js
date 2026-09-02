import { PALETTE } from "../palette.js";

/**
 * Container Office / Facility Progressive Pixel Art
 * Positioned on the left midground: x=40, y=92
 * @param {number} step - 0 (slab), 1 (frame), 2 (walls), 3 (complete)
 * @returns {string} SVG markup
 */
export function getContainerSvg(step = 0) {
  if (step < 0) return "";

  let content = `
    <!-- Container Foundation Footing -->
    <rect x="40" y="125" width="64" height="5" fill="${PALETTE.OUTLINE_DARK}" />
    <rect x="41" y="126" width="62" height="3" fill="${PALETTE.CONCRETE_MAIN}" />
    <rect x="41" y="126" width="62" height="1" fill="${PALETTE.CONCRETE_LIGHT}" />
  `;

  if (step >= 1) {
    content += `
      <!-- Container Steel Skeleton Frame -->
      <rect x="42" y="96" width="60" height="29" fill="none" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="2" />
      <rect x="43" y="97" width="4" height="27" fill="${PALETTE.STEEL_DARK}" />
      <rect x="97" y="97" width="4" height="27" fill="${PALETTE.STEEL_DARK}" />
      <rect x="43" y="97" width="58" height="3" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="43" y="122" width="58" height="3" fill="${PALETTE.STEEL_DARK}" />
    `;
  }

  if (step >= 2) {
    content += `
      <!-- Corrugated Wall Panels & Roof -->
      <rect x="46" y="99" width="52" height="24" fill="${PALETTE.CONTAINER_TEAL}" />
      <!-- Corrugation grooves -->
      <rect x="52" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="58" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="64" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="70" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="76" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="82" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="88" y="99" width="2" height="24" fill="${PALETTE.CONTAINER_DARK}" />
      <rect x="42" y="95" width="60" height="2" fill="${PALETTE.STEEL_LIGHT}" />
    `;
  }

  if (step >= 3) {
    content += `
      <!-- Door & Window Details (Completed Facility) -->
      <!-- Office Entrance Door -->
      <rect x="48" y="105" width="12" height="18" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="49" y="106" width="10" height="17" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="51" y="108" width="6" height="5" fill="${PALETTE.GLASS_BLUE}" />
      <rect x="57" y="114" width="1" height="3" fill="${PALETTE.OUTLINE_DARK}" /> <!-- Handle -->

      <!-- Office Window with Glazing -->
      <rect x="66" y="104" width="22" height="12" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="67" y="105" width="20" height="10" fill="${PALETTE.GLASS_TINT}" />
      <rect x="76" y="105" width="2" height="10" fill="${PALETTE.OUTLINE_DARK}" /> <!-- Frame -->
      <rect x="67" y="110" width="20" height="1" fill="${PALETTE.OUTLINE_DARK}" />

      <!-- Rooftop Vent & Small Sign -->
      <rect x="50" y="91" width="16" height="4" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="51" y="92" width="14" height="2" fill="${PALETTE.SPARK_WHITE}" />
      <rect x="86" y="92" width="8" height="3" fill="${PALETTE.STEEL_DARK}" />
    `;
  }

  return content;
}
