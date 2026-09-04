import { PALETTE } from "./palette.js";

/**
 * 3 Difficulty Truck Pixel Art Sprites with 5-Level Flatbed Loading Progress
 */

export const TRUCK_TYPES = {
  KEI_TRUCK: "KEI_TRUCK",
  CRANE_4T: "CRANE_4T",
  CRANE_15T: "CRANE_15T"
};

/**
 * Metadata for each truck type
 */
export const TRUCK_METADATA = {
  [TRUCK_TYPES.KEI_TRUCK]: {
    name: "軽トラック",
    width: 130,
    height: 75,
    collisionContactX: 620,
    visualYOffset: 0,
    missDrop: {
      deltaX: 20,
      deltaY: 28,
      rotation: 30
    }
  },
  [TRUCK_TYPES.CRANE_4T]: {
    name: "4tユニック車",
    width: 190,
    height: 85,
    collisionContactX: 620,
    visualYOffset: 0,
    missDrop: {
      deltaX: 14,
      deltaY: 30,
      rotation: 35
    }
  },
  [TRUCK_TYPES.CRANE_15T]: {
    name: "15t大型ユニック車",
    width: 250,
    height: 95,
    collisionContactX: 620,
    visualYOffset: -6,
    missDrop: {
      deltaX: 8,
      deltaY: 32,
      rotation: 25
    }
  }
};

/**
 * Maps difficulty level to Truck type
 * @param {string} difficulty - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
 * @returns {string} truck type
 */
export function getTruckTypeForDifficulty(difficulty = "BEGINNER") {
  const d = String(difficulty).toUpperCase();
  if (d === "ADVANCED" || d === "上級") return TRUCK_TYPES.CRANE_15T;
  if (d === "INTERMEDIATE" || d === "中級") return TRUCK_TYPES.CRANE_4T;
  return TRUCK_TYPES.KEI_TRUCK;
}

/**
 * Generates SVG markup for Kei Truck load stages (0 to 5)
 */
function getKeiTruckLoadSvg(loadStage) {
  if (!loadStage || loadStage <= 0) return "";

  let content = "";

  // Stage 1: Front flatbed light load
  if (loadStage >= 1) {
    content += `
      <!-- Stage 1: Front Planks Stack -->
      <rect x="52" y="28" width="24" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="53" y="29" width="22" height="3" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="53" y="33" width="22" height="3" fill="${PALETTE.STEEL_MAIN}" />
    `;
  }

  // Stage 2: Front-to-mid stacked pipes
  if (loadStage >= 2) {
    content += `
      <!-- Stage 2: Mid Pipe Bundle -->
      <rect x="30" y="26" width="26" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="31" y="27" width="24" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="31" y="32" width="24" height="3" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="42" y="26" width="2" height="10" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 3: Full length bottom layer
  if (loadStage >= 3) {
    content += `
      <!-- Stage 3: Rear Planks & Mid Elevation -->
      <rect x="10" y="28" width="22" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="11" y="29" width="20" height="3" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="11" y="33" width="20" height="3" fill="${PALETTE.STEEL_LIGHT}" />
      <!-- Upper Front Bundle -->
      <rect x="48" y="20" width="26" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="49" y="21" width="24" height="3" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="49" y="25" width="24" height="3" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="60" y="20" width="2" height="8" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 4: High volume stacked scaffold
  if (loadStage >= 4) {
    content += `
      <!-- Stage 4: Top Tier Pipes & Frames -->
      <rect x="22" y="18" width="30" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="23" y="19" width="28" height="3" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="23" y="23" width="28" height="3" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="36" y="18" width="2" height="8" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 5: Fully loaded, strapped neat scaffold load
  if (loadStage >= 5) {
    content += `
      <!-- Stage 5: Full Master Stack & Tie-down Straps -->
      <rect x="12" y="14" width="62" height="6" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="13" y="15" width="60" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="13" y="17" width="60" height="2" fill="${PALETTE.STEEL_BLUE}" />
      <!-- Vertical Tie-down Straps -->
      <rect x="20" y="14" width="3" height="22" fill="${PALETTE.BAND_STRAP}" />
      <rect x="44" y="14" width="3" height="22" fill="${PALETTE.BAND_STRAP}" />
      <rect x="66" y="14" width="3" height="22" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  return content;
}

/**
 * Generates SVG markup for 4t Crane Truck load stages (0 to 5)
 */
function get4tCraneTruckLoadSvg(loadStage) {
  if (!loadStage || loadStage <= 0) return "";

  let content = "";

  // Stage 1: Front section (near crane post)
  if (loadStage >= 1) {
    content += `
      <!-- Stage 1: Front Heavy Stack -->
      <rect x="80" y="28" width="36" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="81" y="29" width="34" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="81" y="34" width="34" height="4" fill="${PALETTE.STEEL_MAIN}" />
    `;
  }

  // Stage 2: Front-to-mid section
  if (loadStage >= 2) {
    content += `
      <!-- Stage 2: Mid Long Pipe Bundle -->
      <rect x="46" y="26" width="40" height="12" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="47" y="27" width="38" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="47" y="32" width="38" height="5" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="64" y="26" width="3" height="12" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 3: Half flatbed distributed load
  if (loadStage >= 3) {
    content += `
      <!-- Stage 3: Rear Planks & Frames -->
      <rect x="12" y="28" width="38" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="13" y="29" width="36" height="4" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="13" y="34" width="36" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <!-- Upper Front Frame Bundle -->
      <rect x="74" y="18" width="40" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="75" y="19" width="38" height="4" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="75" y="24" width="38" height="4" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="94" y="18" width="3" height="10" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 4: 80% loaded multi-tier stack
  if (loadStage >= 4) {
    content += `
      <!-- Stage 4: Mid-Rear Upper Tier -->
      <rect x="30" y="16" width="50" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="31" y="17" width="48" height="4" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="31" y="22" width="48" height="4" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="52" y="16" width="3" height="10" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 5: Full heavy load across 4t bed with straps
  if (loadStage >= 5) {
    content += `
      <!-- Stage 5: Master Stack Across Full 4t Flatbed -->
      <rect x="14" y="10" width="102" height="8" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="15" y="11" width="100" height="3" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="15" y="15" width="100" height="3" fill="${PALETTE.STEEL_BLUE}" />
      <!-- Heavy Straps -->
      <rect x="26" y="10" width="3" height="28" fill="${PALETTE.BAND_STRAP}" />
      <rect x="58" y="10" width="3" height="28" fill="${PALETTE.BAND_STRAP}" />
      <rect x="90" y="10" width="3" height="28" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  return content;
}

/**
 * Generates SVG markup for 15t Large Crane Truck load stages (0 to 5)
 */
function get15tCraneTruckLoadSvg(loadStage) {
  if (!loadStage || loadStage <= 0) return "";

  let content = "";

  // Stage 1: Front section
  if (loadStage >= 1) {
    content += `
      <!-- Stage 1: Front Palletized Materials -->
      <rect x="112" y="28" width="50" height="12" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="113" y="29" width="48" height="5" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="113" y="35" width="48" height="5" fill="${PALETTE.STEEL_MAIN}" />
    `;
  }

  // Stage 2: Front-to-mid section
  if (loadStage >= 2) {
    content += `
      <!-- Stage 2: Mid Section Heavy Pipes -->
      <rect x="68" y="26" width="50" height="14" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="69" y="27" width="48" height="5" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="69" y="33" width="48" height="6" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="92" y="26" width="4" height="14" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 3: Distributed across 60% of long flatbed
  if (loadStage >= 3) {
    content += `
      <!-- Stage 3: Rear Long Scaffolding Planks -->
      <rect x="12" y="28" width="60" height="12" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="13" y="29" width="58" height="5" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="13" y="35" width="58" height="5" fill="${PALETTE.STEEL_LIGHT}" />
      <!-- Upper Tier Front Bundle -->
      <rect x="105" y="18" width="55" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="106" y="19" width="53" height="4" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="106" y="24" width="53" height="4" fill="${PALETTE.STEEL_BLUE}" />
      <rect x="132" y="18" width="4" height="10" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 4: High capacity double tier
  if (loadStage >= 4) {
    content += `
      <!-- Stage 4: Mid-Rear High Volume Bundle -->
      <rect x="36" y="16" width="75" height="12" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="37" y="17" width="73" height="5" fill="${PALETTE.STEEL_LIGHT}" />
      <rect x="37" y="23" width="73" height="5" fill="${PALETTE.STEEL_MAIN}" />
      <rect x="70" y="16" width="4" height="12" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  // Stage 5: Full 15t maximum volume neat strapped load
  if (loadStage >= 5) {
    content += `
      <!-- Stage 5: Maximum Volume Top Tier & Multi Straps -->
      <rect x="14" y="8" width="148" height="10" fill="${PALETTE.OUTLINE_DARK}" />
      <rect x="15" y="9" width="146" height="4" fill="${PALETTE.STEEL_HIGHLIGHT}" />
      <rect x="15" y="14" width="146" height="4" fill="${PALETTE.STEEL_BLUE}" />
      <!-- Heavy Duty Tie-Down Straps -->
      <rect x="30" y="8" width="4" height="32" fill="${PALETTE.BAND_STRAP}" />
      <rect x="72" y="8" width="4" height="32" fill="${PALETTE.BAND_STRAP}" />
      <rect x="114" y="8" width="4" height="32" fill="${PALETTE.BAND_STRAP}" />
      <rect x="148" y="8" width="4" height="32" fill="${PALETTE.BAND_STRAP}" />
    `;
  }

  return content;
}

/**
 * Generates SVG markup for a Truck at a given load stage (0 to 5)
 * @param {string} truckType - One of TRUCK_TYPES
 * @param {object} [options]
 * @param {number} [options.loadStage=0] - 0 to 5
 * @param {boolean} [options.isShaking=false]
 * @returns {string} SVG HTML
 */
export function getTruckSvg(truckType = TRUCK_TYPES.KEI_TRUCK, { loadStage = 0, isShaking = false } = {}) {
  const meta = TRUCK_METADATA[truckType] || TRUCK_METADATA[TRUCK_TYPES.KEI_TRUCK];
  const safeStage = Math.min(5, Math.max(0, loadStage));

  switch (truckType) {
    case TRUCK_TYPES.KEI_TRUCK:
      return `
        <svg class="truck-svg kei-truck ${isShaking ? 'shake-mild' : ''}" viewBox="0 0 130 75" width="${meta.width}" height="${meta.height}" shape-rendering="crispEdges">
          <!-- Shadow -->
          <rect x="8" y="70" width="116" height="5" fill="${PALETTE.SHADOW}" rx="2" />

          <!-- Flatbed Loading Stage Layer -->
          <g class="truck-load-stage">
            ${getKeiTruckLoadSvg(safeStage)}
          </g>

          <!-- Chassis & Underbody -->
          <rect x="8" y="52" width="114" height="8" fill="${PALETTE.TRUCK_CHASSIS}" />

          <!-- Flatbed Body (Left/Rear area) -->
          <rect x="6" y="36" width="76" height="18" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="8" y="38" width="72" height="14" fill="${PALETTE.TRUCK_BED}" />
          <!-- Flatbed floor top edge -->
          <rect x="6" y="36" width="76" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- Drop-side side gate dividers -->
          <rect x="28" y="38" width="2" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="52" y="38" width="2" height="14" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Cab Over (Right/Front) -->
          <rect x="78" y="16" width="46" height="38" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="80" y="18" width="42" height="34" fill="${PALETTE.TRUCK_CAB_WHITE}" />
          <rect x="80" y="18" width="42" height="4" fill="${PALETTE.TRUCK_CAB_SHADOW}" />

          <!-- Cab Windshield & Windows -->
          <rect x="84" y="22" width="20" height="14" fill="${PALETTE.GLASS_TINT}" />
          <rect x="106" y="22" width="14" height="14" fill="${PALETTE.GLASS_BLUE}" />
          <!-- Door line -->
          <rect x="104" y="22" width="2" height="30" fill="${PALETTE.OUTLINE_DARK}" />
          <!-- Door handle -->
          <rect x="98" y="38" width="4" height="2" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Front Bumper & Headlight -->
          <rect x="122" y="44" width="6" height="12" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="124" y="46" width="4" height="6" fill="${PALETTE.SPARK_YELLOW}" />

          <!-- Rear Axle Wheel -->
          <circle cx="34" cy="58" r="10" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="34" cy="58" r="9" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="34" cy="58" r="5" fill="${PALETTE.RIM_DARK}" />
          <rect x="33" y="57" width="2" height="2" fill="${PALETTE.RIM_LIGHT}" />

          <!-- Front Axle Wheel -->
          <circle cx="106" cy="58" r="10" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="106" cy="58" r="9" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="106" cy="58" r="5" fill="${PALETTE.RIM_DARK}" />
          <rect x="105" y="57" width="2" height="2" fill="${PALETTE.RIM_LIGHT}" />
        </svg>
      `;

    case TRUCK_TYPES.CRANE_4T:
      return `
        <svg class="truck-svg crane-4t-truck ${isShaking ? 'shake-mild' : ''}" viewBox="0 0 190 85" width="${meta.width}" height="${meta.height}" shape-rendering="crispEdges">
          <!-- Shadow -->
          <rect x="10" y="80" width="172" height="5" fill="${PALETTE.SHADOW}" rx="2" />

          <!-- Flatbed Loading Stage Layer -->
          <g class="truck-load-stage">
            ${get4tCraneTruckLoadSvg(safeStage)}
          </g>

          <!-- Chassis -->
          <rect x="10" y="58" width="170" height="10" fill="${PALETTE.TRUCK_CHASSIS}" />

          <!-- Long Flatbed -->
          <rect x="8" y="38" width="116" height="22" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="10" y="40" width="112" height="18" fill="${PALETTE.TRUCK_BED}" />
          <rect x="8" y="38" width="116" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- Gate dividers -->
          <rect x="38" y="40" width="2" height="18" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="68" y="40" width="2" height="18" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="98" y="40" width="2" height="18" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Loader Crane (Mounted Behind Cab) -->
          <!-- Crane Base Post -->
          <rect x="122" y="24" width="10" height="36" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="123" y="26" width="8" height="32" fill="${PALETTE.CRANE_BLUE}" />
          <!-- Crane Folded Boom (Pointing Rearward over Flatbed) -->
          <rect x="80" y="20" width="50" height="8" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="82" y="22" width="46" height="4" fill="${PALETTE.CRANE_BLUE}" />
          <rect x="82" y="22" width="46" height="1" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- Crane Pivot Joint & Small Hook -->
          <circle cx="127" cy="24" r="5" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="127" cy="24" r="3" fill="${PALETTE.CRANE_ORANGE}" />
          <rect x="82" y="28" width="3" height="5" fill="${PALETTE.STEEL_LIGHT}" /> <!-- Hook -->

          <!-- Cab (Right/Front) -->
          <rect x="132" y="14" width="52" height="46" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="134" y="16" width="48" height="42" fill="${PALETTE.TRUCK_CAB_WHITE}" />
          <rect x="134" y="16" width="48" height="6" fill="${PALETTE.TRUCK_CAB_SHADOW}" />

          <!-- Cab Windows -->
          <rect x="138" y="22" width="20" height="16" fill="${PALETTE.GLASS_TINT}" />
          <rect x="160" y="22" width="18" height="16" fill="${PALETTE.GLASS_BLUE}" />
          <rect x="158" y="22" width="2" height="36" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="148" y="42" width="5" height="2" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Bumper & Headlight -->
          <rect x="180" y="48" width="8" height="14" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="182" y="50" width="6" height="8" fill="${PALETTE.SPARK_YELLOW}" />

          <!-- Rear Dual Wheels -->
          <circle cx="50" cy="68" r="12" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="50" cy="68" r="11" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="50" cy="68" r="6" fill="${PALETTE.RIM_DARK}" />
          <rect x="49" y="67" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />

          <!-- Front Wheel -->
          <circle cx="158" cy="68" r="12" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="158" cy="68" r="11" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="158" cy="68" r="6" fill="${PALETTE.RIM_DARK}" />
          <rect x="157" y="67" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />
        </svg>
      `;

    case TRUCK_TYPES.CRANE_15T:
    default:
      return `
        <svg class="truck-svg crane-15t-truck ${isShaking ? 'shake-mild' : ''}" viewBox="0 0 250 95" width="${meta.width}" height="${meta.height}" shape-rendering="crispEdges">
          <!-- Shadow -->
          <rect x="10" y="90" width="232" height="5" fill="${PALETTE.SHADOW}" rx="2" />

          <!-- Flatbed Loading Stage Layer -->
          <g class="truck-load-stage">
            ${get15tCraneTruckLoadSvg(safeStage)}
          </g>

          <!-- Heavy Duty Long Chassis -->
          <rect x="8" y="64" width="232" height="14" fill="${PALETTE.TRUCK_CHASSIS}" />

          <!-- Extended Flatbed -->
          <rect x="6" y="40" width="164" height="26" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="8" y="42" width="160" height="22" fill="${PALETTE.TRUCK_BED}" />
          <rect x="6" y="40" width="164" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <!-- Gate dividers -->
          <rect x="48" y="42" width="2" height="22" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="88" y="42" width="2" height="22" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="128" y="42" width="2" height="22" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Heavy Loader Crane (Behind High Cab) -->
          <!-- Heavy Post -->
          <rect x="170" y="20" width="14" height="46" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="172" y="22" width="10" height="42" fill="${PALETTE.CRANE_ORANGE}" />
          <!-- Heavy Hexagonal Boom (Folded Backwards) -->
          <rect x="100" y="16" width="76" height="12" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="102" y="18" width="72" height="8" fill="${PALETTE.CRANE_ORANGE}" />
          <rect x="102" y="18" width="72" height="2" fill="${PALETTE.STEEL_HIGHLIGHT}" />
          <circle cx="177" cy="22" r="6" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="177" cy="22" r="4" fill="${PALETTE.STEEL_LIGHT}" />
          <rect x="104" y="28" width="4" height="8" fill="${PALETTE.STEEL_LIGHT}" /> <!-- Heavy Hook -->

          <!-- Tall Heavy Commercial Cab (Right/Front) -->
          <rect x="184" y="10" width="58" height="56" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="186" y="12" width="54" height="52" fill="${PALETTE.TRUCK_CAB_WHITE}" />
          <rect x="186" y="12" width="54" height="6" fill="${PALETTE.TRUCK_CAB_SHADOW}" />

          <!-- High Cab Windows -->
          <rect x="190" y="18" width="24" height="20" fill="${PALETTE.GLASS_TINT}" />
          <rect x="216" y="18" width="20" height="20" fill="${PALETTE.GLASS_BLUE}" />
          <rect x="214" y="18" width="2" height="46" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="200" y="44" width="6" height="2" fill="${PALETTE.OUTLINE_DARK}" />

          <!-- Heavy Bumper & Grille -->
          <rect x="238" y="48" width="10" height="20" fill="${PALETTE.OUTLINE_DARK}" />
          <rect x="240" y="52" width="6" height="10" fill="${PALETTE.SPARK_YELLOW}" />

          <!-- Rear 2-Axle Wheels (Tandem Duals) -->
          <circle cx="46" cy="76" r="14" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="46" cy="76" r="13" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="46" cy="76" r="7" fill="${PALETTE.RIM_DARK}" />
          <rect x="45" y="75" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />

          <circle cx="78" cy="76" r="14" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="78" cy="76" r="13" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="78" cy="76" r="7" fill="${PALETTE.RIM_DARK}" />
          <rect x="77" y="75" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />

          <!-- Front Steer Wheel -->
          <circle cx="212" cy="76" r="14" fill="${PALETTE.OUTLINE_DARK}" />
          <circle cx="212" cy="76" r="13" fill="${PALETTE.TIRE_BLACK}" />
          <circle cx="212" cy="76" r="7" fill="${PALETTE.RIM_DARK}" />
          <rect x="211" y="75" width="3" height="3" fill="${PALETTE.RIM_LIGHT}" />
        </svg>
      `;
  }
}
