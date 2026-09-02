import { PALETTE } from "./palette.js";

/**
 * 7 Scaffold Load Pixel Art Sprites
 * Sized to fit comfortably on forklift forks (approx 36px wide x 24px high)
 */

export const SCAFFOLD_LOAD_TYPES = {
  POST_BUNDLE: "POST_BUNDLE",
  HANDRAIL_BUNDLE: "HANDRAIL_BUNDLE",
  FRAME_STACK: "FRAME_STACK",
  PLANK_STACK: "PLANK_STACK",
  BRACE_BUNDLE: "BRACE_BUNDLE",
  JACK_BASE_PALLET: "JACK_BASE_PALLET",
  SMALL_PARTS_PALLET: "SMALL_PARTS_PALLET"
};

export const SCAFFOLD_LOAD_LIST = Object.values(SCAFFOLD_LOAD_TYPES);

/**
 * Generates SVG markup for a specific scaffold load type
 * @param {string} loadType - One of SCAFFOLD_LOAD_TYPES
 * @param {object} [options]
 * @param {number} [options.width=40]
 * @param {number} [options.height=24]
 * @returns {string} SVG HTML
 */
export function getScaffoldLoadSvg(loadType = SCAFFOLD_LOAD_TYPES.POST_BUNDLE, { width = 40, height = 24 } = {}) {
  switch (loadType) {
    case SCAFFOLD_LOAD_TYPES.POST_BUNDLE:
      // 支柱 (Long bundled pipes with banding straps & pin joints)
      return `
        <svg class="scaffold-load-svg load-post" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Pipe 1 (Top) -->
          <rect x="2" y="4" width="36" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="5" width="34" height="2" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Pipe 2 (Middle) -->
          <rect x="1" y="9" width="38" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="10" width="36" height="3" fill="${PALETTE.STEEL_MAIN}" />
          <rect x="2" y="10" width="36" height="1" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- Pipe 3 (Bottom) -->
          <rect x="2" y="15" width="36" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="16" width="34" height="3" fill="${PALETTE.STEEL_BLUE}" />
          <!-- End pin joints -->
          <rect x="0" y="7" width="2" height="9" fill="${PALETTE.STEEL_DARK}" />
          <rect x="38" y="7" width="2" height="9" fill="${PALETTE.STEEL_DARK}" />
          <!-- Bundle Straps -->
          <rect x="10" y="3" width="3" height="18" fill="${PALETTE.BAND_STRAP}" />
          <rect x="27" y="3" width="3" height="18" fill="${PALETTE.BAND_STRAP}" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.HANDRAIL_BUNDLE:
      // 手摺 (Thinner horizontal tube bundle)
      return `
        <svg class="scaffold-load-svg load-handrail" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="32" height="3" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="5" y="7" width="30" height="1" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="3" y="10" width="34" height="3" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="4" y="11" width="32" height="1" fill="${PALETTE.STEEL_MAIN}" />
          <rect x="4" y="14" width="32" height="3" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="5" y="15" width="30" height="1" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="3" y="18" width="34" height="3" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="4" y="19" width="32" height="1" fill="${PALETTE.STEEL_BLUE}" />
          <!-- End hook tabs -->
          <rect x="2" y="8" width="2" height="11" fill="${PALETTE.STEEL_DARK}" />
          <rect x="36" y="8" width="2" height="11" fill="${PALETTE.STEEL_DARK}" />
          <!-- Straps -->
          <rect x="12" y="5" width="2" height="17" fill="${PALETTE.BAND_STRAP}" />
          <rect x="26" y="5" width="2" height="17" fill="${PALETTE.BAND_STRAP}" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.FRAME_STACK:
      // 建枠 (Stacked portal frames)
      return `
        <svg class="scaffold-load-svg load-frame" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Base outline stack -->
          <rect x="2" y="4" width="36" height="18" fill="${PALETTE.OUTLINE_DARK}" />
          <!-- Outer posts -->
          <rect x="4" y="5" width="4" height="16" fill="${PALETTE.STEEL_MAIN}" />
          <rect x="32" y="5" width="4" height="16" fill="${PALETTE.STEEL_MAIN}" />
          <!-- Top horizontal beam -->
          <rect x="4" y="5" width="32" height="4" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Mid cross rung -->
          <rect x="4" y="13" width="32" height="3" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Inner cutout -->
          <rect x="10" y="9" width="20" height="4" fill="#0b1120" />
          <rect x="10" y="16" width="20" height="5" fill="#0b1120" />
          <!-- Corner gusset brackets -->
          <rect x="8" y="8" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <rect x="30" y="8" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <!-- Highlight line -->
          <rect x="4" y="5" width="32" height="1" fill="${PALETTE.STEEL_HIGHLIGHT}" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.PLANK_STACK:
      // 布板 (Stacked flat steel planks with perforated pattern)
      return `
        <svg class="scaffold-load-svg load-plank" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Plank 1 (Top) -->
          <rect x="2" y="6" width="36" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="7" width="34" height="2" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="8" y="7" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <rect x="16" y="7" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <rect x="24" y="7" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <rect x="32" y="7" width="2" height="2" fill="${PALETTE.STEEL_DARK}" />
          <!-- Plank 2 -->
          <rect x="1" y="10" width="38" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="11" width="36" height="2" fill="${PALETTE.STEEL_MAIN}" />
          <!-- Plank 3 -->
          <rect x="2" y="14" width="36" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="15" width="34" height="2" fill="${PALETTE.STEEL_MAIN}" />
          <!-- Plank 4 (Bottom) -->
          <rect x="1" y="18" width="38" height="4" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="2" y="19" width="36" height="2" fill="${PALETTE.STEEL_BLUE}" />
          <!-- End hook brackets -->
          <rect x="0" y="8" width="2" height="12" fill="${PALETTE.STEEL_DARK}" />
          <rect x="38" y="8" width="2" height="12" fill="${PALETTE.STEEL_DARK}" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.BRACE_BUNDLE:
      // 筋交 (Diagonal cross braces bundle)
      return `
        <svg class="scaffold-load-svg load-brace" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Crossed diagonal tubes -->
          <line x1="4" y1="20" x2="36" y2="6" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="5" />
          <line x1="4" y1="20" x2="36" y2="6" stroke="${PALETTE.STEEL_MAIN}" stroke-width="3" />
          <line x1="4" y1="6" x2="36" y2="20" stroke="${PALETTE.OUTLINE_DARK}" stroke-width="5" />
          <line x1="4" y1="6" x2="36" y2="20" stroke="${PALETTE.STEEL_LIGHT}" stroke-width="3" />
          <!-- Center pivot hinge pin -->
          <circle cx="20" cy="13" r="3" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="20" cy="13" r="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- End flattened connection plates -->
          <rect x="2" y="4" width="4" height="4" fill="${PALETTE.STEEL_DARK}" />
          <rect x="34" y="4" width="4" height="4" fill="${PALETTE.STEEL_DARK}" />
          <rect x="2" y="18" width="4" height="4" fill="${PALETTE.STEEL_DARK}" />
          <rect x="34" y="18" width="4" height="4" fill="${PALETTE.STEEL_DARK}" />
          <!-- Binding strap -->
          <rect x="18" y="4" width="4" height="18" fill="${PALETTE.BAND_STRAP}" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.JACK_BASE_PALLET:
      // ジャッキベース (Pallet with base plates & threaded stems)
      return `
        <svg class="scaffold-load-svg load-jack" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Threaded vertical stems -->
          <rect x="8" y="2" width="4" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="9" y="3" width="2" height="12" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="18" y="0" width="4" height="16" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="19" y="1" width="2" height="14" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <rect x="28" y="2" width="4" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="29" y="3" width="2" height="12" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Wing nuts / Handles -->
          <rect x="6" y="8" width="8" height="2" fill="${PALETTE.FORK_BODY_MAIN}" />
          <rect x="16" y="6" width="8" height="2" fill="${PALETTE.FORK_BODY_MAIN}" />
          <rect x="26" y="8" width="8" height="2" fill="${PALETTE.FORK_BODY_MAIN}" />
          <!-- Base Plates -->
          <rect x="4" y="14" width="32" height="3" fill="${PALETTE.STEEL_DARK}" />
          <rect x="4" y="14" width="32" height="1" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Wooden Pallet Base -->
          <rect x="2" y="17" width="36" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="18" width="34" height="3" fill="${PALETTE.WOOD_PALLET}" />
          <!-- Pallet Fork Openings -->
          <rect x="8" y="19" width="7" height="3" fill="#000000" />
          <rect x="25" y="19" width="7" height="3" fill="#000000" />
        </svg>
      `;

    case SCAFFOLD_LOAD_TYPES.SMALL_PARTS_PALLET:
    default:
      // 小物パーツパレット (Pallet with clamp fittings in mesh box)
      return `
        <svg class="scaffold-load-svg load-parts" viewBox="0 0 40 24" width="${width}" height="${height}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
          <!-- Wire mesh cage box -->
          <rect x="4" y="6" width="32" height="12" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="5" y="7" width="30" height="10" fill="${PALETTE.STEEL_BLUE}" />
          <!-- Clamps & Coupler blocks inside -->
          <rect x="8" y="9" width="6" height="4" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="16" y="8" width="7" height="5" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <rect x="25" y="10" width="6" height="4" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="11" y="12" width="8" height="4" fill="${PALETTE.STEEL_DARK}" />
          <rect x="21" y="12" width="7" height="4" fill="${PALETTE.STEEL_DARK}" />
          <!-- Mesh Grid Wire Pattern -->
          <rect x="4" y="6" width="32" height="1" fill="${PALETTE.STEEL_MAIN}" />
          <rect x="14" y="6" width="1" height="12" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="24" y="6" width="1" height="12" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="4" y="12" width="32" height="1" fill="${PALETTE.STEEL_LIGHT}" />
          <!-- Wooden Pallet Base -->
          <rect x="2" y="18" width="36" height="5" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="3" y="19" width="34" height="3" fill="${PALETTE.WOOD_PALLET}" />
          <rect x="8" y="20" width="7" height="2" fill="#000000" />
          <rect x="25" y="20" width="7" height="2" fill="#000000" />
        </svg>
      `;
  }
}

/**
 * Selects a random scaffold load, avoiding immediate duplicate if possible
 * @param {string} [lastType]
 * @returns {string} load type
 */
export function getRandomScaffoldLoad(lastType = "") {
  const choices = SCAFFOLD_LOAD_LIST.filter((t) => t !== lastType);
  if (choices.length === 0) return SCAFFOLD_LOAD_LIST[0];
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}
