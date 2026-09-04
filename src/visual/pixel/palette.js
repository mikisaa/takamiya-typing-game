import { SCENE_PALETTE } from "./scenePalette.js";

/**
 * Authoritative 5-Color Unified UI Design Palette
 * Reference: TTG Botanical UI Palette Contract
 *
 * WHITE:  #FFFFFF (Global Background)
 * PALE_1: #F5FBDA (Large Panel Background / Light Highlight)
 * PALE_2: #D9EFBD (Secondary Panel / Hover / Sub Area / Medium Tone)
 * ACCENT: #B9D175 (Main Accent / Progress / Active Decoration)
 * DARK:   #450C3F (Primary Text / Border / Icon / Outline / Error)
 */
export const AUTHORITATIVE_PALETTE = {
  WHITE: "#FFFFFF",
  PALE_1: "#F5FBDA",
  PALE_2: "#D9EFBD",
  ACCENT: "#B9D175",
  DARK: "#450C3F"
};

export const UI_PALETTE = {
  ...AUTHORITATIVE_PALETTE
};

/**
 * Unified Gameplay Scene Palette
 * Combines UI root tokens with realistic gameplay world tokens from scenePalette.js
 */
export const PALETTE = {
  // Core Botanical Tokens (for UI fallback & reference)
  WHITE: AUTHORITATIVE_PALETTE.WHITE,
  PALE_1: AUTHORITATIVE_PALETTE.PALE_1,
  PALE_2: AUTHORITATIVE_PALETTE.PALE_2,
  ACCENT: AUTHORITATIVE_PALETTE.ACCENT,
  DARK: AUTHORITATIVE_PALETTE.DARK,

  // Realistic Gameplay Scene Tokens
  ...SCENE_PALETTE
};
