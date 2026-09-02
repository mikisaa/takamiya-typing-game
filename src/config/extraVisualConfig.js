/**
 * EXTRA Stage Visual Events Configuration (EXTRA_CONFIG)
 * Centralizes all parameters, durations, weights, and concurrency rules.
 * Reference: Implementation Phase 5 Specification
 */

export const EXTRA_EVENT_TYPES = {
  AIRPLANE: "AIRPLANE",
  HELICOPTER: "HELICOPTER",
  BALLOONS: "BALLOONS",
  SKYDIVER: "SKYDIVER",
  RAINBOW: "RAINBOW"
};

export const EXTRA_CONFIG = {
  // Concurrency rules
  maxConcurrentDynamicEvents: 3, // Max simultaneous moving aircraft/balloons/skydivers (excluding rainbow overlay)
  allowDuplicateDynamicTypes: false, // At most one instance of each dynamic type active simultaneously

  // Probabilities & Weights
  skydiverProbability: 0.12, // 12% rare chance to spawn skydiver instead of standard dynamic event
  rainbowProbability: 0.25, // 25% chance on EXTRA success to trigger / refresh background rainbow
  dynamicEventWeights: {
    [EXTRA_EVENT_TYPES.AIRPLANE]: 35,
    [EXTRA_EVENT_TYPES.HELICOPTER]: 30,
    [EXTRA_EVENT_TYPES.BALLOONS]: 35
  },

  // Event Durations (seconds)
  durations: {
    airplane: 8.0,
    helicopter: 9.0,
    balloons: 8.0,
    skydiver: 7.0,
    skydiverFreefall: 1.5,
    rainbow: 14.0,
    rainbowFade: 0.8
  },

  // Airspace Altitude Zones (Y coordinates within 900x180 visual viewport)
  airspace: {
    airplaneY: 22,
    helicopterBaseY: 34,
    balloonsStartY: 130,
    balloonsTargetY: -40,
    skydiverStartY: 10,
    skydiverLandY: 122
  }
};
