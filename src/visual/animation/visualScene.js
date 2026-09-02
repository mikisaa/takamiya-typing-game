import { PALETTE } from "../pixel/palette.js";
import { getForkliftSvg } from "../pixel/forkliftSvg.js";
import { getTruckSvg, getTruckTypeForDifficulty, TRUCK_METADATA } from "../pixel/trucksSvg.js";
import { getScaffoldLoadSvg, getRandomScaffoldLoad } from "../pixel/scaffoldLoadsSvg.js";
import { getSuccessSparkSvg, getCollisionBurstSvg } from "../pixel/effectsSvg.js";
import { getCityCompositionSvg } from "../pixel/background/cityComposition.js";
import { ExtraEventManager } from "./extraEventManager.js";

/**
 * Visual Scene Coordinator
 * Manages the visual rendering layer, background city progression, vehicle sprites,
 * scaffold loads, EXTRA Stage visual events, and feedback animations.
 * Completely decoupled from game timers and scoring logic.
 */

export const VISUAL_STATES = {
  IDLE: "IDLE",
  RUN: "RUN",
  SUCCESS_LOAD: "SUCCESS_LOAD",
  COLLISION: "COLLISION",
  RESET: "RESET"
};

export class GameVisualScene {
  /**
   * @param {HTMLElement} containerElement - DOM container for the visual scene
   */
  constructor(containerElement) {
    this.container = containerElement;
    this.visualState = VISUAL_STATES.IDLE;
    this.difficulty = "BEGINNER";
    this.truckType = getTruckTypeForDifficulty(this.difficulty);
    this.truckLoadStage = 0; // 0 to 5

    // Coordinate constants
    this.START_X = 15;
    this.CONTACT_X = 580; // Contact point where forklift touches truck rear
    this.GROUND_Y = 135;

    // Animation variables
    this.currentProgress = 0;
    this.wheelFrame = 0;
    this.wheelTimer = 0;
    this.bodyBobY = 0;
    this.forkLiftY = 0;
    this.currentLoadType = getRandomScaffoldLoad();

    // Feedback animation timing
    this.animElapsed = 0;
    this.isForkliftShaking = false;
    this.isTruckShaking = false;
    this.truckPopScale = 1.0;
    this.truckPopFloatY = 0;
    this.activeEffect = null; // { type: 'SPARK'|'BURST', x, y }

    // Falling load state during MISS
    this.fallingLoad = null; // { type, x, y, rotation }

    // Background progressive city tracking
    this.currentCorrectCount = 0;
    this.lastRenderedCorrectCount = -1;

    // EXTRA Stage Event Manager (Phase 5)
    this.extraManager = new ExtraEventManager();

    this.initDOM();
  }

  /**
   * Initializes the SVG visual scene structure inside the container
   */
  initDOM() {
    this.container.innerHTML = `
      <div class="visual-scene-viewport">
        <!-- Background Sky Layer -->
        <div class="scene-sky-layer"></div>

        <!-- Rainbow Background Overlay Layer (Phase 5) -->
        <div id="visualRainbowLayer" class="scene-rainbow-layer"></div>

        <!-- Progressive City Panorama Layer (Phase 4) -->
        <div id="visualCityPanoramaLayer" class="scene-city-panorama-layer"></div>

        <!-- Ground Yard & Horizon Fence -->
        <div class="scene-horizon-fence"></div>

        <!-- Airborne Dynamic EXTRA Events Layer (Phase 5) -->
        <div id="visualExtraDynamicLayer" class="scene-extra-dynamic-layer"></div>

        <div class="scene-road-ground">
          <div class="road-lane-stripes"></div>
        </div>

        <!-- Truck Container (Right docked) -->
        <div id="visualTruckLayer" class="scene-truck-layer"></div>

        <!-- Forklift Container -->
        <div id="visualForkliftLayer" class="scene-forklift-layer"></div>

        <!-- Active Load on Forklift / In Flight -->
        <div id="visualActiveLoadLayer" class="scene-active-load-layer"></div>

        <!-- Effects Overlay (Sparkles, Collisions) -->
        <div id="visualEffectsLayer" class="scene-effects-layer"></div>
      </div>
    `;

    this.rainbowLayer = this.container.querySelector("#visualRainbowLayer");
    this.cityPanoramaLayer = this.container.querySelector("#visualCityPanoramaLayer");
    this.extraDynamicLayer = this.container.querySelector("#visualExtraDynamicLayer");
    this.truckLayer = this.container.querySelector("#visualTruckLayer");
    this.forkliftLayer = this.container.querySelector("#visualForkliftLayer");
    this.activeLoadLayer = this.container.querySelector("#visualActiveLoadLayer");
    this.effectsLayer = this.container.querySelector("#visualEffectsLayer");

    this.renderCityPanorama(0);
  }

  /**
   * Renders the progressive city panorama SVG when correctCount updates
   * @param {number} correctCount
   */
  renderCityPanorama(correctCount = 0) {
    if (!this.cityPanoramaLayer) return;
    if (correctCount === this.lastRenderedCorrectCount) return;

    this.cityPanoramaLayer.innerHTML = getCityCompositionSvg(correctCount);
    this.lastRenderedCorrectCount = correctCount;
    this.currentCorrectCount = correctCount;
  }

  /**
   * Configures scene for new game difficulty and resets truck loading stage to 0
   * @param {string} difficulty - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   */
  setDifficulty(difficulty = "BEGINNER") {
    this.difficulty = difficulty.toUpperCase();
    this.truckType = getTruckTypeForDifficulty(this.difficulty);
    this.truckLoadStage = 0;
    this.resetForNewQuestion();
    this.renderTruck();
    this.renderCityPanorama(0);
    this.extraManager.reset();
    if (this.rainbowLayer) this.rainbowLayer.innerHTML = "";
    if (this.extraDynamicLayer) this.extraDynamicLayer.innerHTML = "";
  }

  /**
   * Resets scene elements for the next question (preserves truckLoadStage, background & active extra events)
   */
  resetForNewQuestion() {
    this.visualState = VISUAL_STATES.RUN;
    this.currentProgress = 0;
    this.animElapsed = 0;
    this.forkLiftY = 0;
    this.isForkliftShaking = false;
    this.isTruckShaking = false;
    this.truckPopScale = 1.0;
    this.truckPopFloatY = 0;
    this.activeEffect = null;
    this.fallingLoad = null;
    this.currentLoadType = getRandomScaffoldLoad(this.currentLoadType);
    this.render();
  }

  /**
   * Triggers SUCCESS animation sequence:
   * - Increments truck flatbed loadStage (up to max 5)
   * - Keeps load on forklift (REMAINS_ON_FORK, no arc flying)
   * - Triggers truck pop & pixel sparkle
   * - Notifies EXTRA Event Manager if in EXTRA stage (correctCount >= 34)
   * @param {number} correctCount
   */
  triggerSuccess(correctCount = 0) {
    this.visualState = VISUAL_STATES.SUCCESS_LOAD;
    this.animElapsed = 0;
    this.truckLoadStage = Math.min(5, this.truckLoadStage + 1);

    // Sparkle effect position near truck flatbed
    const sparkX = this.difficulty === "ADVANCED" ? 690 : this.difficulty === "INTERMEDIATE" ? 730 : 760;
    this.activeEffect = {
      type: "SPARK",
      x: sparkX,
      y: 60
    };

    // Trigger EXTRA Stage Event if applicable (count >= 34)
    if (correctCount >= 34) {
      this.extraManager.onExtraSuccess(correctCount);
    }
  }

  /**
   * Triggers MISS collision animation sequence:
   * - Resets truck flatbed loadStage to 0 (empty)
   * - Shakes forklift and truck
   * - Drops scaffold load from forklift
   */
  triggerMiss() {
    this.visualState = VISUAL_STATES.COLLISION;
    this.animElapsed = 0;
    this.isForkliftShaking = true;
    this.isTruckShaking = true;
    this.truckLoadStage = 0; // Reset truck flatbed loadStage to 0 on MISS

    // Forklift position at collision
    const forkliftX = this.START_X + this.currentProgress * (this.CONTACT_X - this.START_X);
    this.fallingLoad = {
      type: this.currentLoadType,
      startX: forkliftX + 54,
      startY: this.GROUND_Y - 22,
      x: forkliftX + 54,
      y: this.GROUND_Y - 22,
      rotation: 0
    };
    this.activeEffect = {
      type: "BURST",
      x: this.CONTACT_X + 45,
      y: this.GROUND_Y - 25
    };
  }

  /**
   * Updates visual animations on frame tick
   * @param {number} deltaSeconds
   * @param {number} normalizedProgress - Forklift travel progress (0.0 to 1.0)
   * @param {string} gameState - Current GameSession state
   * @param {number} correctCount - Current session correct count for background
   */
  update(deltaSeconds, normalizedProgress = 0, gameState = "PLAYING", correctCount = 0) {
    // 0. Update background city panorama if correct count updated
    this.renderCityPanorama(correctCount);

    // 0.5 Update EXTRA Stage Visual Events Manager
    this.extraManager.update(deltaSeconds);
    if (this.rainbowLayer) {
      this.rainbowLayer.innerHTML = this.extraManager.renderRainbow();
    }
    if (this.extraDynamicLayer) {
      this.extraDynamicLayer.innerHTML = this.extraManager.renderDynamicEvents();
    }

    // 1. Synchronize progress during active PLAYING state
    if (gameState === "PLAYING" && this.visualState === VISUAL_STATES.RUN) {
      this.currentProgress = Math.min(1.0, Math.max(0, normalizedProgress));

      // Update wheel animation (2-3 frames per sec relative to movement)
      this.wheelTimer += deltaSeconds;
      if (this.wheelTimer >= 0.08) {
        this.wheelTimer = 0;
        this.wheelFrame = (this.wheelFrame + 1) % 3;
        // Subtle 1px body bob
        this.bodyBobY = this.wheelFrame % 2 === 0 ? 1 : 0;
      }
    }

    // 2. Handle SUCCESS animation sequence (~350-450ms)
    if (this.visualState === VISUAL_STATES.SUCCESS_LOAD) {
      this.animElapsed += deltaSeconds;
      const t = this.animElapsed;

      // Truck gentle pop & float motion
      if (t <= 0.35) {
        const p = t / 0.35;
        const popFactor = Math.sin(p * Math.PI);
        this.truckPopScale = 1.0 + popFactor * 0.035;
        this.truckPopFloatY = -popFactor * 3;
      } else {
        this.truckPopScale = 1.0;
        this.truckPopFloatY = 0;
      }

      // Sparkle fades out after 350ms
      if (t >= 0.35) {
        this.activeEffect = null;
      }
    }

    // 3. Handle MISS collision animation sequence (~450ms)
    if (this.visualState === VISUAL_STATES.COLLISION) {
      this.animElapsed += deltaSeconds;
      const t = this.animElapsed;

      // Shake expires after 180ms
      if (t >= 0.18) {
        this.isForkliftShaking = false;
        this.isTruckShaking = false;
      }

      // Falling load physics (falls forward to ground with rotation)
      if (this.fallingLoad) {
        const fallProgress = Math.min(1.0, t / 0.35);
        this.fallingLoad.x = this.fallingLoad.startX + fallProgress * 18;
        this.fallingLoad.y = this.fallingLoad.startY + fallProgress * fallProgress * 30;
        this.fallingLoad.rotation = fallProgress * 35;
      }
    }

    this.render();
  }

  /**
   * Renders the complete scene DOM
   */
  render() {
    this.renderTruck();
    this.renderForklift();
    this.renderActiveLoad();
    this.renderEffects();
  }

  /**
   * Renders Truck SVG with current loadStage (0 to 5) and pop transform
   */
  renderTruck() {
    if (!this.truckLayer) return;

    this.truckLayer.style.transform = `translate(0px, ${this.truckPopFloatY}px) scale(${this.truckPopScale})`;
    this.truckLayer.innerHTML = getTruckSvg(this.truckType, {
      loadStage: this.truckLoadStage,
      isShaking: this.isTruckShaking
    });
  }

  /**
   * Renders Forklift SVG at current position
   */
  renderForklift() {
    if (!this.forkliftLayer) return;

    const forkliftX = this.START_X + this.currentProgress * (this.CONTACT_X - this.START_X);
    const forkliftY = this.GROUND_Y - 44 + this.bodyBobY;

    this.forkliftLayer.style.transform = `translate(${forkliftX}px, ${forkliftY}px)`;
    this.forkliftLayer.innerHTML = getForkliftSvg({
      wheelFrame: this.wheelFrame,
      forkLiftY: this.forkLiftY,
      isShaking: this.isForkliftShaking
    });
  }

  /**
   * Renders active scaffold load:
   * In SUCCESS state: REMAINS ON FORKLIFT (no flying arc)!
   * In MISS state: Falls forward to ground.
   * In PLAYING state: Follows forklift.
   */
  renderActiveLoad() {
    if (!this.activeLoadLayer) return;

    // If during MISS collision, render falling load
    if (this.visualState === VISUAL_STATES.COLLISION && this.fallingLoad) {
      this.activeLoadLayer.style.display = "block";
      this.activeLoadLayer.style.transform = `translate(${this.fallingLoad.x}px, ${this.fallingLoad.y}px) rotate(${this.fallingLoad.rotation}deg)`;
      this.activeLoadLayer.innerHTML = getScaffoldLoadSvg(this.fallingLoad.type);
      return;
    }

    // Default & SUCCESS: Load remains comfortably on forklift forks
    const forkliftX = this.START_X + this.currentProgress * (this.CONTACT_X - this.START_X);
    const loadX = forkliftX + 54;
    const loadY = this.GROUND_Y - 22 - this.forkLiftY + this.bodyBobY;

    this.activeLoadLayer.style.display = "block";
    this.activeLoadLayer.style.transform = `translate(${loadX}px, ${loadY}px)`;
    this.activeLoadLayer.innerHTML = getScaffoldLoadSvg(this.currentLoadType);
  }

  /**
   * Renders active pixel effects (Sparkles / Bursts)
   */
  renderEffects() {
    if (!this.effectsLayer) return;

    if (!this.activeEffect) {
      this.effectsLayer.innerHTML = "";
      return;
    }

    if (this.activeEffect.type === "SPARK") {
      this.effectsLayer.innerHTML = `
        <div class="effect-container" style="position: absolute; left: ${this.activeEffect.x}px; top: ${this.activeEffect.y}px;">
          ${getSuccessSparkSvg()}
        </div>
      `;
    } else if (this.activeEffect.type === "BURST") {
      this.effectsLayer.innerHTML = `
        <div class="effect-container" style="position: absolute; left: ${this.activeEffect.x}px; top: ${this.activeEffect.y}px;">
          ${getCollisionBurstSvg()}
        </div>
      `;
    }
  }
}
