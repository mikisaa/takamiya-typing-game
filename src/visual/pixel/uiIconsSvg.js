import { UI_PALETTE as PALETTE } from "./palette.js";

/**
 * Recognizable UI Vector Inline SVG Icons for TakamiyaTypingGame (v1.2.0)
 * Designed for immediate visual clarity and semantic recognition (inspired by Lucide / Material Icons / React Icons)
 * Strictly conforms to TTG UI Botanical Palette:
 * #FFFFFF, #F5FBDA, #D9EFBD, #B9D175, #450C3F
 * Zero OS emojis. Zero external icon dependencies.
 */

/**
 * Returns recognizable inline SVG for Mode Cards
 * @param {"PRODUCTION" | "PRACTICE"} mode
 * @returns {string} SVG markup
 */
export function getModeCardIconSvg(mode) {
  if (mode === "PRODUCTION") {
    // Recognizable Commercial Delivery Truck (Lucide-style clean vector)
    return `
      <svg class="ui-icon-svg mode-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <!-- Cargo Bed Box -->
        <rect x="1.5" y="4" width="13" height="11" rx="1.5" fill="${PALETTE.ACCENT}" fill-opacity="0.35" stroke="${PALETTE.DARK}" />
        <!-- Truck Cab -->
        <path d="M14.5 7.5 H18 L21.5 11.5 V15 H14.5 V7.5 Z" fill="${PALETTE.PALE_2}" stroke="${PALETTE.DARK}" />
        <!-- Windshield -->
        <path d="M15.5 9 H17.8 L20 12 H15.5 V9 Z" fill="${PALETTE.WHITE}" stroke="${PALETTE.DARK}" stroke-width="1.2" />
        <!-- Chassis Line -->
        <line x1="1" y1="15" x2="22.5" y2="15" stroke="${PALETTE.DARK}" stroke-width="1.8" />
        <!-- Left Wheel -->
        <circle cx="5.5" cy="17.5" r="2.8" fill="${PALETTE.DARK}" stroke="${PALETTE.DARK}" stroke-width="1" />
        <circle cx="5.5" cy="17.5" r="1" fill="${PALETTE.WHITE}" stroke="none" />
        <!-- Right Wheel -->
        <circle cx="17.5" cy="17.5" r="2.8" fill="${PALETTE.DARK}" stroke="${PALETTE.DARK}" stroke-width="1" />
        <circle cx="17.5" cy="17.5" r="1" fill="${PALETTE.WHITE}" stroke="none" />
      </svg>
    `;
  }

  // PRACTICE: Recognizable Keyboard Icon
  return `
    <svg class="ui-icon-svg mode-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Keyboard Body Frame -->
      <rect x="2" y="5" width="20" height="14" rx="2.5" fill="${PALETTE.PALE_1}" stroke="${PALETTE.DARK}" />
      <!-- Top Row Keys -->
      <rect x="5" y="8" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="9" y="8" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="13" y="8" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="17" y="8" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <!-- Middle Row Keys -->
      <rect x="5" y="11.5" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="9" y="11.5" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="13" y="11.5" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <rect x="17" y="11.5" width="2.2" height="2" rx="0.5" fill="${PALETTE.DARK}" stroke="none" />
      <!-- Bottom Spacebar Row -->
      <rect x="7" y="15" width="10" height="1.8" rx="0.6" fill="${PALETTE.ACCENT}" stroke="${PALETTE.DARK}" stroke-width="0.8" />
    </svg>
  `;
}

/**
 * Returns recognizable inline SVG for Ranking Button (Leaderboard / Podium Bars)
 * @returns {string} SVG markup
 */
export function getRankingIconSvg() {
  return `
    <svg class="ui-icon-svg ranking-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Ground Baseline -->
      <line x1="2" y1="20" x2="22" y2="20" stroke="${PALETTE.DARK}" stroke-width="1.8" />
      <!-- 2nd Place Bar (Left, Rank 2) -->
      <rect x="3.5" y="10" width="5" height="10" rx="1" fill="${PALETTE.PALE_2}" stroke="${PALETTE.DARK}" />
      <path d="M5 13.5 H7" stroke="${PALETTE.DARK}" stroke-width="1.2" />
      <!-- 1st Place Bar (Center, Rank 1 Highest) -->
      <rect x="9.5" y="5.5" width="5" height="14.5" rx="1" fill="${PALETTE.ACCENT}" stroke="${PALETTE.DARK}" />
      <!-- Star on 1st Place -->
      <polygon points="12,2.5 12.8,4.2 14.5,4.3 13.2,5.4 13.6,7 12,6.1 10.4,7 10.8,5.4 9.5,4.3 11.2,4.2" fill="${PALETTE.DARK}" stroke="none" />
      <!-- 3rd Place Bar (Right, Rank 3) -->
      <rect x="15.5" y="13" width="5" height="7" rx="1" fill="${PALETTE.PALE_1}" stroke="${PALETTE.DARK}" />
      <path d="M17 15.5 H19" stroke="${PALETTE.DARK}" stroke-width="1.2" />
    </svg>
  `;
}

/**
 * Returns recognizable inline SVG for HUD Stage Badge (16x16 Building / City Milestone)
 * @param {string} [stageId="GROUND"]
 * @returns {string} SVG markup
 */
export function getStageIconSvg(stageId = "GROUND") {
  return `
    <svg class="stage-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Highrise Silhouette -->
      <rect x="4" y="2" width="8" height="13" rx="1" fill="${PALETTE.PALE_1}" stroke="${PALETTE.DARK}" />
      <!-- Window grid -->
      <line x1="6.5" y1="5" x2="6.5" y2="6.5" stroke="${PALETTE.DARK}" stroke-width="1.2" />
      <line x1="9.5" y1="5" x2="9.5" y2="6.5" stroke="${PALETTE.DARK}" stroke-width="1.2" />
      <line x1="6.5" y1="8.5" x2="6.5" y2="10" stroke="${PALETTE.DARK}" stroke-width="1.2" />
      <line x1="9.5" y1="8.5" x2="9.5" y2="10" stroke="${PALETTE.DARK}" stroke-width="1.2" />
      <!-- Low Side Wing -->
      <rect x="1" y="7" width="3" height="8" rx="0.5" fill="${PALETTE.PALE_2}" stroke="${PALETTE.DARK}" />
      <rect x="12" y="9" width="3" height="6" rx="0.5" fill="${PALETTE.ACCENT}" stroke="${PALETTE.DARK}" />
    </svg>
  `;
}

/**
 * Returns unmistakable check-circle inline SVG for SUCCESS Feedback
 * @returns {string} SVG markup
 */
export function getSuccessIconSvg() {
  return `
    <svg class="feedback-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle -->
      <circle cx="12" cy="12" r="10" fill="${PALETTE.PALE_2}" stroke="${PALETTE.DARK}" stroke-width="2" />
      <!-- Bold Checkmark -->
      <path d="M7 12.5 L10.5 16 L17.5 8.5" stroke="${PALETTE.DARK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

/**
 * Returns unmistakable x-circle inline SVG for MISS Feedback
 * @returns {string} SVG markup
 */
export function getMissIconSvg() {
  return `
    <svg class="feedback-icon-svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle -->
      <circle cx="12" cy="12" r="10" fill="${PALETTE.PALE_1}" stroke="${PALETTE.DARK}" stroke-width="2" />
      <!-- Bold X Cross -->
      <path d="M8 8 L16 16 M16 8 L8 16" stroke="${PALETTE.DARK}" stroke-width="2.6" stroke-linecap="round" />
    </svg>
  `;
}

/**
 * Returns recognizable compact UI vector inline SVG for Result Metrics
 * @param {"SCORE" | "ACCURACY" | "COMBO" | "STAGE"} metricKey
 * @returns {string} SVG markup
 */
export function getResultMetricIconSvg(metricKey) {
  switch (metricKey) {
    case "SCORE":
      // Gauge / Speedometer Score Icon
      return `
        <svg class="metric-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.5 12 A6.5 6.5 0 1 1 13.5 12" fill="${PALETTE.PALE_2}" fill-opacity="0.3" stroke="${PALETTE.DARK}" />
          <line x1="8" y1="9.5" x2="11.5" y2="6" stroke="${PALETTE.DARK}" stroke-width="1.8" />
          <circle cx="8" cy="9.5" r="1.5" fill="${PALETTE.DARK}" stroke="none" />
        </svg>
      `;
    case "ACCURACY":
      // Bullseye Target Icon
      return `
        <svg class="metric-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="6.5" fill="${PALETTE.PALE_1}" stroke="${PALETTE.DARK}" />
          <circle cx="8" cy="8" r="3.5" fill="${PALETTE.ACCENT}" stroke="${PALETTE.DARK}" />
          <circle cx="8" cy="8" r="1.2" fill="${PALETTE.DARK}" stroke="none" />
        </svg>
      `;
    case "COMBO":
      // Flame / Streak Icon
      return `
        <svg class="metric-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="${PALETTE.ACCENT}" stroke="${PALETTE.DARK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 1.5 C7 4.5 4.5 6.5 4.5 9.5 A4 4 0 0 0 12.5 9.5 C12.5 7.5 11 5.5 8.5 1.5 Z" />
          <circle cx="8.5" cy="10" r="1.5" fill="${PALETTE.DARK}" stroke="none" />
        </svg>
      `;
    case "STAGE":
      // City Building Landmark Icon
      return `
        <svg class="metric-icon-svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="${PALETTE.DARK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="8" height="12" rx="1" fill="${PALETTE.PALE_2}" stroke="${PALETTE.DARK}" />
          <line x1="6.5" y1="5" x2="6.5" y2="7" stroke="${PALETTE.DARK}" stroke-width="1.2" />
          <line x1="9.5" y1="5" x2="9.5" y2="7" stroke="${PALETTE.DARK}" stroke-width="1.2" />
          <line x1="6.5" y1="9" x2="6.5" y2="11" stroke="${PALETTE.DARK}" stroke-width="1.2" />
          <line x1="9.5" y1="9" x2="9.5" y2="11" stroke="${PALETTE.DARK}" stroke-width="1.2" />
        </svg>
      `;
    default:
      return "";
  }
}
