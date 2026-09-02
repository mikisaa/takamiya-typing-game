import { PALETTE } from "./palette.js";

/**
 * Pixel Art Effects (SVG)
 * Lightweight inline pixel bursts and floating badges.
 */

/**
 * Generates Sparkle Pixel Effect SVG (for SUCCESS load)
 * @returns {string} SVG HTML
 */
export function getSuccessSparkSvg() {
  return `
    <svg class="effect-spark-svg" viewBox="0 0 48 48" width="48" height="48" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Central Spark Star -->
      <rect x="22" y="14" width="4" height="20" fill="${PALETTE.SPARK_WHITE}" />
      <rect x="14" y="22" width="20" height="4" fill="${PALETTE.SPARK_WHITE}" />
      <rect x="20" y="20" width="8" height="8" fill="${PALETTE.SPARK_YELLOW}" />
      <!-- Outer sparkle pixels -->
      <rect x="10" y="10" width="4" height="4" fill="${PALETTE.SPARK_YELLOW}" />
      <rect x="34" y="10" width="4" height="4" fill="${PALETTE.SPARK_WHITE}" />
      <rect x="8" y="32" width="4" height="4" fill="${PALETTE.SPARK_WHITE}" />
      <rect x="34" y="32" width="4" height="4" fill="${PALETTE.SPARK_YELLOW}" />
    </svg>
  `;
}

/**
 * Generates Collision Impact Burst SVG (for MISS timeout)
 * @returns {string} SVG HTML
 */
export function getCollisionBurstSvg() {
  return `
    <svg class="effect-collision-svg" viewBox="0 0 48 48" width="48" height="48" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Impact Star Burst -->
      <polygon points="24,4 28,18 42,16 32,26 40,38 26,32 20,44 18,30 4,28 16,20 10,8 22,16" fill="${PALETTE.BURST_ORANGE}" />
      <circle cx="24" cy="24" r="8" fill="${PALETTE.SPARK_YELLOW}" />
      <circle cx="24" cy="24" r="4" fill="${PALETTE.SPARK_WHITE}" />
    </svg>
  `;
}
