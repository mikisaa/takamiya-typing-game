import { getGroundSvg } from "./groundSvg.js";
import { getContainerSvg } from "./containerSvg.js";
import { getHouseSvg } from "./houseSvg.js";
import { getBuildingSvg } from "./buildingSvg.js";
import { getHighriseSvg } from "./highriseSvg.js";
import { getTokyoTowerSvg } from "./tokyoTowerSvg.js";
import { getSkytreeSvg } from "./skytreeSvg.js";
import { getConstructionDetails } from "../../../engine/backgroundProgression.js";

/**
 * City Panorama Composition Generator
 * Combines all active and completed background buildings into a layered SVG.
 * Ensures completed buildings persist, providing cumulative progressive growth.
 *
 * @param {number} correctCount - Number of correct questions answered
 * @returns {string} Complete Background SVG markup
 */
export function getCityCompositionSvg(correctCount = 0) {
  const details = getConstructionDetails(correctCount);

  // 1. Distant Horizon Silhouette Elements (Subtle distant city skyline)
  let distantSilhouette = "";
  if (details.correctCount >= 7) {
    distantSilhouette = `
      <g class="distant-skyline" opacity="0.45">
        <rect x="180" y="105" width="22" height="23" fill="#94a3b8" />
        <rect x="250" y="100" width="18" height="28" fill="#94a3b8" />
        <rect x="340" y="95" width="26" height="33" fill="#94a3b8" />
        <rect x="440" y="98" width="20" height="30" fill="#94a3b8" />
        <rect x="520" y="102" width="24" height="26" fill="#94a3b8" />
      </g>
    `;
  }

  // 2. Individual Building Layers (Determined by cumulative sub-steps)
  // Ground (0-2)
  const groundContent = getGroundSvg(details.groundStep);

  // Container (starts at 3, completes at 6, PERSISTS afterwards at step 3)
  const containerContent = details.correctCount >= 3 ? getContainerSvg(details.containerStep) : "";

  // House (starts at 7, completes at 11, PERSISTS afterwards at step 4)
  const houseContent = details.correctCount >= 7 ? getHouseSvg(details.houseStep) : "";

  // Mid-rise Building (starts at 12, completes at 17, PERSISTS afterwards at step 5)
  const buildingContent = details.correctCount >= 12 ? getBuildingSvg(details.buildingStep) : "";

  // Highrise (starts at 18, completes at 24, PERSISTS afterwards at step 6)
  const highriseContent = details.correctCount >= 18 ? getHighriseSvg(details.highriseStep) : "";

  // Tokyo Tower (starts at 25, completes at 32, PERSISTS afterwards at step 7)
  const tokyoTowerContent = details.correctCount >= 25 ? getTokyoTowerSvg(details.tokyoTowerStep) : "";

  // Skytree (completed landmark at 33+, PERSISTS afterwards)
  const skytreeContent = details.correctCount >= 33 ? getSkytreeSvg(details.skytreeStep) : "";

  return `
    <svg class="city-panorama-svg" viewBox="0 0 900 135" width="900" height="135" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <!-- Layer 1: Distant Skyline Silhouette -->
      ${distantSilhouette}

      <!-- Layer 2: Deep Background Tall Landmarks (Skytree & Tokyo Tower) -->
      <g class="landmarks-layer">
        ${tokyoTowerContent}
        ${skytreeContent}
      </g>

      <!-- Layer 3: Highrise Skyscraper -->
      <g class="highrise-layer">
        ${highriseContent}
      </g>

      <!-- Layer 4: Midground Buildings (Building, House, Container) -->
      <g class="midground-buildings-layer">
        ${buildingContent}
        ${houseContent}
        ${containerContent}
      </g>

      <!-- Layer 5: Ground Survey, Stakes, and Yard Perimeter -->
      <g class="ground-layer">
        ${groundContent}
      </g>
    </svg>
  `;
}
