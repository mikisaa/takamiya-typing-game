import { PALETTE } from "./palette.js";

/**
 * Bespoke Pixel Inline SVG Icons for TakamiyaTypingGame (v1.1.0)
 * Strictly conforms to the 5-color botanical palette:
 * #FFFFFF, #F5FBDA, #D9EFBD, #B9D175, #450C3F
 * Zero OS emojis.
 */

/**
 * Returns pixel inline SVG for Mode Cards (Production Truck or Practice Keyboard)
 * @param {"PRODUCTION" | "PRACTICE"} mode
 * @returns {string} SVG markup
 */
export function getModeCardIconSvg(mode) {
  if (mode === "PRODUCTION") {
    // Loaded Delivery Truck Icon
    return `
      <svg class="ui-icon-svg mode-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <!-- Bed & Chassis -->
        <rect x="2" y="10" width="12" height="6" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="3" y="11" width="10" height="4" fill="${PALETTE.STEEL_LIGHT}" />
        <!-- Loaded Material -->
        <rect x="4" y="6" width="8" height="4" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="5" y="7" width="6" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
        <!-- Cab -->
        <rect x="14" y="8" width="8" height="8" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="15" y="9" width="6" height="6" fill="${PALETTE.STEEL_MAIN}" />
        <rect x="17" y="10" width="3" height="3" fill="${PALETTE.GLASS_BLUE}" />
        <!-- Wheels -->
        <rect x="4" y="16" width="4" height="4" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="5" y="17" width="2" height="2" fill="${PALETTE.RIM_LIGHT}" />
        <rect x="16" y="16" width="4" height="4" fill="${PALETTE.OUTLINE_DARK}" />
        <rect x="17" y="17" width="2" height="2" fill="${PALETTE.RIM_LIGHT}" />
      </svg>
    `;
  }

  // PRACTICE: Pixel Keyboard Icon
  return `
    <svg class="ui-icon-svg mode-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Keyboard Frame -->
      <rect x="2" y="5" width="20" height="14" rx="1" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="3" y="6" width="18" height="12" fill="${PALETTE.CREAM_BG}" />
      <!-- Row 1 Keys -->
      <rect x="5" y="8" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="8" y="8" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="11" y="8" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="14" y="8" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="17" y="8" width="2" height="2" fill="${PALETTE.ACCENT_GREEN}" />
      <!-- Row 2 Keys -->
      <rect x="5" y="11" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="8" y="11" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="11" y="11" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="14" y="11" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="17" y="11" width="2" height="2" fill="${PALETTE.ACCENT_GREEN}" />
      <!-- Spacebar -->
      <rect x="7" y="14" width="10" height="2" fill="${PALETTE.ACCENT_GREEN}" />
    </svg>
  `;
}

/**
 * Returns pixel inline SVG for Ranking Button (Podium / Ranking Bars)
 * @returns {string} SVG markup
 */
export function getRankingIconSvg() {
  return `
    <svg class="ui-icon-svg ranking-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- 2nd Place Bar (Left) -->
      <rect x="3" y="10" width="5" height="11" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="4" y="11" width="3" height="9" fill="${PALETTE.ACCENT_GREEN}" />
      <rect x="5" y="12" width="1" height="3" fill="${PALETTE.WHITE}" />
      <!-- 1st Place Bar (Center, Highest) -->
      <rect x="9" y="5" width="6" height="16" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="10" y="6" width="4" height="14" fill="${PALETTE.PALE_MINT}" />
      <rect x="11" y="7" width="2" height="4" fill="${PALETTE.WHITE}" />
      <!-- 3rd Place Bar (Right) -->
      <rect x="16" y="13" width="5" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="17" y="14" width="3" height="6" fill="${PALETTE.CREAM_BG}" />
      <!-- Ground Baseline -->
      <rect x="2" y="21" width="20" height="2" fill="${PALETTE.OUTLINE_DARK}" />
    </svg>
  `;
}

/**
 * Returns pixel inline SVG for HUD Stage Badge (16x16)
 * @param {string} stageId - "GROUND" | "CONTAINER" | "HOUSE" | "BUILDING" | "HIGHRISE" | "TOKYO_TOWER" | "SKYTREE" | "EXTRA"
 * @returns {string} SVG markup
 */
export function getStageIconSvg(stageId = "GROUND") {
  const sid = String(stageId).toUpperCase();

  switch (sid) {
    case "CONTAINER":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <rect x="1" y="4" width="14" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="5" width="12" height="3" fill="${PALETTE.STEEL_MAIN}" />
          <rect x="1" y="10" width="14" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="11" width="12" height="3" fill="${PALETTE.STEEL_LIGHT}" />
        </svg>
      `;
    case "HOUSE":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Roof -->
          <polygon points="8,2 2,8 14,8" fill="${PALETTE.OUTLINE_DARK}" />
          <polygon points="8,4 4,8 12,8" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Walls -->
          <rect x="3" y="8" width="10" height="7" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="4" y="9" width="8" height="5" fill="${PALETTE.CREAM_BG}" />
          <rect x="7" y="10" width="2" height="4" fill="${PALETTE.OUTLINE_DARK}" />
        </svg>
      `;
    case "BUILDING":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <rect x="3" y="2" width="10" height="13" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="4" y="3" width="8" height="11" fill="${PALETTE.PALE_MINT}" />
          <rect x="5" y="4" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="9" y="4" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="5" y="7" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="9" y="7" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="5" y="10" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="9" y="10" width="2" height="2" fill="${PALETTE.OUTLINE_DARK}" />
        </svg>
      `;
    case "HIGHRISE":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Tall tower -->
          <rect x="2" y="1" width="7" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="2" width="5" height="12" fill="${PALETTE.STEEL_MAIN}" />
          <!-- Mid tower -->
          <rect x="8" y="5" width="6" height="10" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="9" y="6" width="4" height="8" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Window slits -->
          <rect x="4" y="3" width="3" height="1" fill="${PALETTE.WHITE}" />
          <rect x="4" y="5" width="3" height="1" fill="${PALETTE.WHITE}" />
          <rect x="4" y="7" width="3" height="1" fill="${PALETTE.WHITE}" />
        </svg>
      `;
    case "TOKYO_TOWER":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Spire -->
          <rect x="7" y="1" width="2" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <!-- Main lattice pyramid -->
          <polygon points="8,5 3,15 13,15" fill="${PALETTE.OUTLINE_DARK}" />
          <polygon points="8,6 4,14 12,14" fill="${PALETTE.ACCENT_GREEN}" />
          <rect x="5" y="9" width="6" height="2" fill="${PALETTE.OUTLINE_DARK}" />
        </svg>
      `;
    case "SKYTREE":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Antenna Spire -->
          <rect x="7" y="1" width="2" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <!-- Upper Pod -->
          <rect x="5" y="6" width="6" height="3" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="6" y="7" width="4" height="1" fill="${PALETTE.WHITE}" />
          <!-- Shaft -->
          <polygon points="7,9 9,9 11,15 5,15" fill="${PALETTE.OUTLINE_DARK}" />
          <polygon points="7.5,9 8.5,9 10,14 6,14" fill="${PALETTE.PALE_MINT}" />
        </svg>
      `;
    case "EXTRA":
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Pixel Star / Fireworks -->
          <rect x="7" y="1" width="2" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="1" y="7" width="14" height="2" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="4" y="4" width="8" height="8" fill="${PALETTE.ACCENT_GREEN}" />
          <rect x="6" y="6" width="4" height="4" fill="${PALETTE.WHITE}" />
        </svg>
      `;
    case "GROUND":
    default:
      return `
        <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Ground horizon & dirt -->
          <rect x="1" y="9" width="14" height="6" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="10" width="12" height="4" fill="${PALETTE.ACCENT_GREEN}" />
          <rect x="3" y="11" width="2" height="1" fill="${PALETTE.WHITE}" />
          <rect x="8" y="12" width="3" height="1" fill="${PALETTE.WHITE}" />
        </svg>
      `;
  }
}

/**
 * Returns pixel inline SVG for SUCCESS Feedback (Sparkle / Loaded)
 * @returns {string} SVG markup
 */
export function getSuccessIconSvg() {
  return `
    <svg class="feedback-icon-svg" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" shape-rendering="crispEdges">
      <rect x="9" y="1" width="2" height="18" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="1" y="9" width="18" height="2" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="5" y="5" width="10" height="10" fill="${PALETTE.ACCENT_GREEN}" />
      <rect x="8" y="8" width="4" height="4" fill="${PALETTE.WHITE}" />
      <rect x="9" y="9" width="2" height="2" fill="${PALETTE.PALE_MINT}" />
    </svg>
  `;
}

/**
 * Returns pixel inline SVG for MISS Feedback (Collision / Dropped Burst)
 * @returns {string} SVG markup
 */
export function getMissIconSvg() {
  return `
    <svg class="feedback-icon-svg" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" shape-rendering="crispEdges">
      <!-- Collision burst shape -->
      <polygon points="10,2 12,7 18,5 14,10 19,15 13,14 10,19 7,14 1,15 6,10 2,5 8,7" fill="${PALETTE.OUTLINE_DARK}" />
      <polygon points="10,4 11.5,8 16,6.5 13,10 16.5,14 12,13 10,16.5 8,13 3.5,14 7,10 4,6.5 8.5,8" fill="${PALETTE.ACCENT_GREEN}" />
      <rect x="8" y="8" width="4" height="4" fill="${PALETTE.CREAM_BG}" />
    </svg>
  `;
}

/**
 * Returns compact pixel inline SVG for Result Metrics
 * @param {"SCORE" | "ACCURACY" | "COMBO" | "STAGE"} metricKey
 * @returns {string} SVG markup
 */
export function getResultMetricIconSvg(metricKey) {
  switch (metricKey) {
    case "SCORE":
      return `
        <svg class="metric-icon-svg" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" shape-rendering="crispEdges">
          <circle cx="7" cy="7" r="6" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="7" cy="7" r="4.5" fill="${PALETTE.ACCENT_GREEN}" />
          <rect x="6" y="4" width="2" height="6" fill="${PALETTE.WHITE}" />
        </svg>
      `;
    case "ACCURACY":
      return `
        <svg class="metric-icon-svg" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Target bullseye -->
          <circle cx="7" cy="7" r="6" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="7" cy="7" r="4" fill="${PALETTE.CREAM_BG}" />
          <circle cx="7" cy="7" r="2" fill="${PALETTE.OUTLINE_DARK}" />
        </svg>
      `;
    case "COMBO":
      return `
        <svg class="metric-icon-svg" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Lightning / Flame pixel shape -->
          <polygon points="8,1 3,8 7,8 5,13 11,6 7,6" fill="${PALETTE.OUTLINE_DARK}" />
          <polygon points="7.5,3 4.5,7.5 7,7.5 6,11 9.5,6.5 7,6.5" fill="${PALETTE.ACCENT_GREEN}" />
        </svg>
      `;
    case "STAGE":
      return `
        <svg class="metric-icon-svg" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true" shape-rendering="crispEdges">
          <!-- Flag / Milestone -->
          <rect x="2" y="2" width="2" height="11" fill="${PALETTE.OUTLINE_DARK}" />
          <polygon points="4,2 12,5 4,8" fill="${PALETTE.ACCENT_GREEN}" />
        </svg>
      `;
    default:
      return "";
  }
}
