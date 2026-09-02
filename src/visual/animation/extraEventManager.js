import { EXTRA_CONFIG, EXTRA_EVENT_TYPES } from "../../config/extraVisualConfig.js";
import { getAirplaneSvg } from "../pixel/extra/airplaneSvg.js";
import { getHelicopterSvg } from "../pixel/extra/helicopterSvg.js";
import { getBalloonsSvg } from "../pixel/extra/balloonsSvg.js";
import { getSkydiverSvg } from "../pixel/extra/skydiverSvg.js";
import { getRainbowSvg } from "../pixel/extra/rainbowSvg.js";

/**
 * EXTRA Stage Visual Event Manager
 * Manages active airborne animation events (Airplane, Helicopter, Balloons, Skydiver, Rainbow).
 * Completely decoupled from game scoring, timers, and combo logic.
 */
export class ExtraEventManager {
  /**
   * @param {object} [options]
   * @param {function} [options.randomFn] - Deterministic random function for testing
   * @param {object} [options.config] - Override configuration
   */
  constructor({ randomFn = Math.random, config = EXTRA_CONFIG } = {}) {
    this.randomFn = randomFn;
    this.config = config;

    this.activeEvents = []; // Array of active dynamic event objects
    this.nextEventId = 1;
    this.lastEventType = null;

    // Rainbow Overlay State
    this.rainbowState = {
      active: false,
      elapsed: 0,
      duration: this.config.durations.rainbow,
      opacity: 0
    };
  }

  /**
   * Resets all active events and state on session end or replay
   */
  reset() {
    this.activeEvents = [];
    this.nextEventId = 1;
    this.lastEventType = null;
    this.rainbowState = {
      active: false,
      elapsed: 0,
      duration: this.config.durations.rainbow,
      opacity: 0
    };
  }

  /**
   * Checks if an event of the given type is currently active
   * @param {string} type
   * @returns {boolean}
   */
  isTypeActive(type) {
    return this.activeEvents.some((e) => e.type === type);
  }

  /**
   * Notification of a question success in EXTRA stage (correctCount >= 34)
   * @param {number} correctCount
   */
  onExtraSuccess(correctCount = 34) {
    if (correctCount < 34) return;

    // 1. Check Rainbow activation / renewal
    if (this.randomFn() < this.config.rainbowProbability) {
      this.triggerRainbow();
    }

    // 2. First EXTRA Entry Celebration (Count 34)
    if (correctCount === 34) {
      // Guaranteed first celebration event (Balloons)
      if (!this.isTypeActive(EXTRA_EVENT_TYPES.BALLOONS)) {
        this.spawnEvent(EXTRA_EVENT_TYPES.BALLOONS);
      }
      return;
    }

    // 3. Check concurrency limits for dynamic airborne events
    if (this.activeEvents.length >= this.config.maxConcurrentDynamicEvents) {
      return;
    }

    // 4. Check Rare Skydiver Event
    if (this.randomFn() < this.config.skydiverProbability && !this.isTypeActive(EXTRA_EVENT_TYPES.SKYDIVER)) {
      this.spawnEvent(EXTRA_EVENT_TYPES.SKYDIVER);
      return;
    }

    // 5. Select from available dynamic events with weighted distribution
    const availableTypes = [
      EXTRA_EVENT_TYPES.AIRPLANE,
      EXTRA_EVENT_TYPES.HELICOPTER,
      EXTRA_EVENT_TYPES.BALLOONS
    ].filter((t) => !this.isTypeActive(t));

    if (availableTypes.length === 0) return;

    const selectedType = this.pickWeightedEvent(availableTypes);
    if (selectedType) {
      this.spawnEvent(selectedType);
    }
  }

  /**
   * Triggers or refreshes the background rainbow overlay
   */
  triggerRainbow() {
    this.rainbowState.active = true;
    this.rainbowState.elapsed = 0;
  }

  /**
   * Weighted random event selection among available types
   * @param {string[]} candidates
   * @returns {string}
   */
  pickWeightedEvent(candidates) {
    if (candidates.length === 1) return candidates[0];

    let totalWeight = 0;
    for (const type of candidates) {
      totalWeight += this.config.dynamicEventWeights[type] || 30;
    }

    let rnd = this.randomFn() * totalWeight;
    for (const type of candidates) {
      const w = this.config.dynamicEventWeights[type] || 30;
      if (rnd <= w) return type;
      rnd -= w;
    }

    return candidates[0];
  }

  /**
   * Spawns a new dynamic event instance
   * @param {string} type
   */
  spawnEvent(type) {
    const id = this.nextEventId++;
    const duration = this.config.durations[type.toLowerCase()] || 8.0;

    let initialX = 0;
    let initialY = 0;

    switch (type) {
      case EXTRA_EVENT_TYPES.AIRPLANE:
        initialX = -50;
        initialY = this.config.airspace.airplaneY;
        break;
      case EXTRA_EVENT_TYPES.HELICOPTER:
        initialX = -50;
        initialY = this.config.airspace.helicopterBaseY;
        break;
      case EXTRA_EVENT_TYPES.BALLOONS:
        // Random horizontal start within midground yard
        initialX = 140 + this.randomFn() * 450;
        initialY = this.config.airspace.balloonsStartY;
        break;
      case EXTRA_EVENT_TYPES.SKYDIVER:
        // Spawns from high sky
        initialX = 200 + this.randomFn() * 350;
        initialY = this.config.airspace.skydiverStartY;
        break;
    }

    const eventObj = {
      id,
      type,
      elapsed: 0,
      duration,
      x: initialX,
      y: initialY,
      startX: initialX,
      startY: initialY
    };

    this.activeEvents.push(eventObj);
    this.lastEventType = type;
  }

  /**
   * Updates all active event positions and animations on frame tick
   * @param {number} deltaSeconds
   */
  update(deltaSeconds) {
    // 1. Update Rainbow Overlay State
    if (this.rainbowState.active) {
      this.rainbowState.elapsed += deltaSeconds;
      const t = this.rainbowState.elapsed;
      const fadeDur = this.config.durations.rainbowFade;

      if (t < fadeDur) {
        // Fade in
        this.rainbowState.opacity = t / fadeDur;
      } else if (t < this.rainbowState.duration - fadeDur) {
        // Full visibility
        this.rainbowState.opacity = 1.0;
      } else if (t < this.rainbowState.duration) {
        // Fade out
        const remaining = this.rainbowState.duration - t;
        this.rainbowState.opacity = Math.max(0, remaining / fadeDur);
      } else {
        // Expired
        this.rainbowState.active = false;
        this.rainbowState.opacity = 0;
      }
    }

    // 2. Update Dynamic Events
    for (let i = this.activeEvents.length - 1; i >= 0; i--) {
      const ev = this.activeEvents[i];
      ev.elapsed += deltaSeconds;
      const p = Math.min(1.0, ev.elapsed / ev.duration);

      switch (ev.type) {
        case EXTRA_EVENT_TYPES.AIRPLANE:
          // Smooth cross from left (-50) to right (950)
          ev.x = -50 + p * 1000;
          break;

        case EXTRA_EVENT_TYPES.HELICOPTER:
          // Enters from left, hovers briefly mid-flight with slight vertical bob, exits right
          if (p < 0.4) {
            // Approaching center
            ev.x = -50 + (p / 0.4) * 400;
            ev.y = this.config.airspace.helicopterBaseY;
          } else if (p < 0.7) {
            // Hovering near center with 2px vertical bob
            const hoverP = (p - 0.4) / 0.3;
            ev.x = 350 + Math.sin(hoverP * Math.PI * 4) * 8;
            ev.y = this.config.airspace.helicopterBaseY + Math.sin(hoverP * Math.PI * 8) * 2;
          } else {
            // Exiting right
            const exitP = (p - 0.7) / 0.3;
            ev.x = 350 + exitP * 600;
            ev.y = this.config.airspace.helicopterBaseY;
          }
          break;

        case EXTRA_EVENT_TYPES.BALLOONS:
          // Floats upward with sine-wave horizontal sway
          ev.y = ev.startY + p * (this.config.airspace.balloonsTargetY - ev.startY);
          ev.x = ev.startX + Math.sin(ev.elapsed * 2.2) * 12;
          break;

        case EXTRA_EVENT_TYPES.SKYDIVER:
          // Freefall (first 1.5s) -> Parachute descent (remaining time)
          const freefallDur = this.config.durations.skydiverFreefall;
          if (ev.elapsed < freefallDur) {
            const fp = ev.elapsed / freefallDur;
            ev.y = ev.startY + fp * 30;
          } else {
            const dp = (ev.elapsed - freefallDur) / (ev.duration - freefallDur);
            ev.y = ev.startY + 30 + dp * (this.config.airspace.skydiverLandY - (ev.startY + 30));
            ev.x = ev.startX + Math.sin(ev.elapsed * 1.5) * 6; // gentle sway in chute
          }
          break;
      }

      // Remove event once duration has elapsed
      if (ev.elapsed >= ev.duration) {
        this.activeEvents.splice(i, 1);
      }
    }
  }

  /**
   * Generates SVG/HTML for Rainbow overlay
   * @returns {string}
   */
  renderRainbow() {
    if (!this.rainbowState.active || this.rainbowState.opacity <= 0) return "";
    return getRainbowSvg({ opacity: this.rainbowState.opacity });
  }

  /**
   * Generates DOM markup for all active moving dynamic events
   * @returns {string}
   */
  renderDynamicEvents() {
    if (this.activeEvents.length === 0) return "";

    let markup = "";
    for (const ev of this.activeEvents) {
      let spriteSvg = "";

      switch (ev.type) {
        case EXTRA_EVENT_TYPES.AIRPLANE:
          const beaconOn = Math.floor(ev.elapsed * 2) % 2 === 0;
          spriteSvg = getAirplaneSvg({ beaconOn });
          break;
        case EXTRA_EVENT_TYPES.HELICOPTER:
          const rotorFrame = Math.floor(ev.elapsed * 15) % 3;
          spriteSvg = getHelicopterSvg({ rotorFrame });
          break;
        case EXTRA_EVENT_TYPES.BALLOONS:
          spriteSvg = getBalloonsSvg();
          break;
        case EXTRA_EVENT_TYPES.SKYDIVER:
          const isParachuteOpen = ev.elapsed >= this.config.durations.skydiverFreefall;
          spriteSvg = getSkydiverSvg({ isParachuteOpen });
          break;
      }

      markup += `
        <div class="extra-dynamic-item" style="position: absolute; left: ${ev.x.toFixed(1)}px; top: ${ev.y.toFixed(1)}px;">
          ${spriteSvg}
        </div>
      `;
    }

    return markup;
  }
}
