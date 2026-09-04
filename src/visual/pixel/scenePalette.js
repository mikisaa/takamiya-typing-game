/**
 * Realistic Gameplay Scene Visual Palette
 * Reference: Phase 13 Specification (Realistic Gameplay Colors Contract)
 *
 * This palette governs exclusively the 2D gameplay world (forklift, scaffold materials,
 * trucks, background city, landmarks, sky, effects, and dynamic extras).
 * UI elements (menus, HUD containers, buttons, cards, ranking, results) remain strictly
 * governed by the TTG Botanical 5-Color Palette.
 */

export const SCENE_PALETTE = {
  // Outlines, Shadows & Structural Charcoal
  OUTLINE_DARK: "#1E293B",
  OUTLINE_MED: "#334155",
  SHADOW: "rgba(15, 23, 42, 0.35)",

  // Forklift (Realistic Industrial Yellow / Orange & Dark Steel)
  FORK_BODY_LIGHT: "#FDE047",
  FORK_BODY_MAIN: "#F59E0B",
  FORK_BODY_DARK: "#D97706",
  FORK_CABIN: "#334155",
  FORK_SEAT: "#1E293B",
  FORK_MAST: "#334155",
  FORK_FORKS: "#475569",

  // Wheels, Tires & Hardware (Realistic Rubber & Metallic Rims)
  TIRE_BLACK: "#0F172A",
  TIRE_DARK: "#1E293B",
  RIM_LIGHT: "#E2E8F0",
  RIM_DARK: "#64748B",

  // Scaffold Materials & Steel (Galvanized Steel / Metallic Grays)
  STEEL_HIGHLIGHT: "#F8FAFC",
  STEEL_LIGHT: "#E2E8F0",
  STEEL_MAIN: "#94A3B8",
  STEEL_DARK: "#64748B",
  STEEL_BLUE: "#475569",
  WOOD_PALLET: "#D97706",
  WOOD_DARK: "#78350F",
  BAND_STRAP: "#1E3A8A",

  // Trucks (Realistic Commercial White Cabs, Cranes & Chassis)
  TRUCK_CAB_WHITE: "#F8FAFC",
  TRUCK_CAB_SHADOW: "#CBD5E1",
  TRUCK_CHASSIS: "#1E293B",
  TRUCK_BED: "#64748B",
  CRANE_BLUE: "#2563EB",
  CRANE_RED: "#DC2626",
  CRANE_ORANGE: "#EA580C",
  GLASS_BLUE: "#38BDF8",
  GLASS_TINT: "#BAE6FD",

  // Effects (Visual Sparks & Hits)
  SPARK_YELLOW: "#FACC15",
  SPARK_WHITE: "#FFFFFF",
  BURST_ORANGE: "#F97316",
  MISS_RED: "#DC2626",

  // Construction & Background Ground (Asphalt & Concrete Yard)
  CONCRETE_LIGHT: "#E2E8F0",
  CONCRETE_MAIN: "#94A3B8",
  CONCRETE_DARK: "#475569",
  WOOD_FRAME: "#B45309",

  // Container Facility (Industrial Teal/Blue & Shadow)
  CONTAINER_TEAL: "#0284C7",
  CONTAINER_DARK: "#0F172A",
  CONTAINER_BLUE: "#2563EB",
  CONTAINER_RED: "#DC2626",
  CONTAINER_GREEN: "#16A34A",

  // Residential House (Warm Beige Walls & Terracotta Roof)
  HOUSE_WALL: "#FEF3C7",
  HOUSE_ROOF: "#991B1B",
  HOUSE_DOOR: "#78350F",

  // Mid-Rise Office Building (Realistic Slate / Concrete & Glass)
  BUILDING_WALL: "#CBD5E1",
  BUILDING_WINDOW: "#38BDF8",
  BUILDING_DARK: "#334155",

  // Highrise Skyscraper (Modern Commercial Blue Glass)
  HIGHRISE_GLASS: "#0284C7",
  HIGHRISE_DARK: "#1E293B",
  HIGHRISE_ACCENT: "#38BDF8",

  // Tokyo Tower (Realistic International Orange/Red & White)
  TOWER_RED: "#DC2626",
  TOWER_WHITE: "#FFFFFF",
  TOWER_LIGHT: "#F59E0B",

  // Skytree (Silver / Pale Steel & Illumination Cyan)
  SKYTREE_WHITE: "#F1F5F9",
  SKYTREE_STEEL: "#94A3B8",
  SKYTREE_CYAN: "#0284C7",

  // Atmosphere, Sky & Vegetation
  SKY_BLUE: "#BAE6FD",
  SKY_BLUE_LIGHT: "#E0F2FE",
  VEGETATION_GREEN: "#16A34A",
  VEGETATION_LIGHT: "#22C55E",
  VEGETATION_DARK: "#15803D",

  // Authentic 7-Color Rainbow
  RAINBOW: {
    RED: "#EF4444",
    ORANGE: "#F97316",
    YELLOW: "#FACC15",
    GREEN: "#22C55E",
    CYAN: "#06B6D4",
    BLUE: "#3B82F6",
    VIOLET: "#8B5CF6"
  }
};
