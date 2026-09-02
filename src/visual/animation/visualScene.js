import { PALETTE } from "../pixel/palette.js";
import { getForkliftSvg } from "../pixel/forkliftSvg.js";
import { getTruckSvg, getTruckTypeForDifficulty, TRUCK_METADATA } from "../pixel/trucksSvg.js";
import { getScaffoldLoadSvg, getRandomScaffoldLoad } from "../pixel/scaffoldLoadsSvg.js";
import { getSuccessSparkSvg, getCollisionBurstSvg } from "../pixel/effectsSvg.js";

/**
 * Visual Scene Coordinator
 * Manages the visual rendering layer, vehicle sprites, scaffold loads, and animations.
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
    this.truckSettledLoads = []; // Array of { type, x, y, id }
    this.nextLoadId = 1;

    // Feedback animation timing
    this.animElapsed = 0;
    this.isForkliftShaking = false;
    this.isTruckShaking = false;
    this.activeEffect = null; // { type: 'SPARK'|'BURST', x, y }

    // Falling load state during MISS
    this.fallingLoad = null; // { type, x, y, rotation }

    this.initDOM();
  }

  /**
   * Initializes the SVG visual scene structure inside the container
   */
  initDOM() {
    this.container.innerHTML = `
      <div class="visual-scene-viewport">
        <!-- Background Sky & Ground Yard -->
        <div class="scene-sky-layer"></div>
        <div class="scene-horizon-fence"></div>
        <div class="scene-road-ground">
          <div class="road-lane-stripes"></div>
        </div>

        <!-- Truck Container (Right docked) -->
        <div id="visualTruckLayer" class="scene-truck-layer"></div>

        <!-- Settled Loads on Truck -->
        <div id="visualTruckLoadsLayer" class="scene-truck-loads-layer"></div>

        <!-- Forklift Container -->
        <div id="visualForkliftLayer" class="scene-forklift-layer"></div>

        <!-- Active Load on Forklift / In Flight -->
        <div id="visualActiveLoadLayer" class="scene-active-load-layer"></div>

        <!-- Effects Overlay (Sparkles, Collisions) -->
        <div id="visualEffectsLayer" class="scene-effects-layer"></div>
      </div>
    `;

    this.truckLayer = this.container.querySelector("#visualTruckLayer");
    this.truckLoadsLayer = this.container.querySelector("#visualTruckLoadsLayer");
    this.forkliftLayer = this.container.querySelector("#visualForkliftLayer");
    this.activeLoadLayer = this.container.querySelector("#visualActiveLoadLayer");
    this.effectsLayer = this.container.querySelector("#visualEffectsLayer");
  }

  /**
   * Configures scene for new game difficulty
   * @param {string} difficulty - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   */
  setDifficulty(difficulty = "BEGINNER") {
    this.difficulty = difficulty.toUpperCase();
    this.truckType = getTruckTypeForDifficulty(this.difficulty);
    this.truckSettledLoads = [];
    this.resetForNewQuestion();
    this.renderTruck();
  }

  /**
   * Resets scene elements for the next question
   */
  resetForNewQuestion() {
    this.visualState = VISUAL_STATES.RUN;
    this.currentProgress = 0;
    this.animElapsed = 0;
    this.forkLiftY = 0;
    this.isForkliftShaking = false;
    this.isTruckShaking = false;
    this.activeEffect = null;
    this.fallingLoad = null;
    this.currentLoadType = getRandomScaffoldLoad(this.currentLoadType);
    this.render();
  }

  /**
   * Triggers SUCCESS animation sequence
   */
  triggerSuccess() {
    this.visualState = VISUAL_STATES.SUCCESS_LOAD;
    this.animElapsed = 0;
  }

  /**
   * Triggers MISS collision animation sequence
   */
  triggerMiss() {
    this.visualState = VISUAL_STATES.COLLISION;
    this.animElapsed = 0;
    this.isForkliftShaking = true;
    this.isTruckShaking = true;

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
   */
  update(deltaSeconds, normalizedProgress = 0, gameState = "PLAYING") {
    // 1. Synchronize progress during active PLAYING state
    if (gameState === "PLAYING" && this.visualState === VISUAL_STATES.RUN) {
      this.currentProgress = Math.min(1.0, Math.max(0, normalizedProgress));

      // Update wheel animation (2 frames per sec relative to movement)
      this.wheelTimer += deltaSeconds;
      if (this.wheelTimer >= 0.08) {
        this.wheelTimer = 0;
        this.wheelFrame = (this.wheelFrame + 1) % 3;
        // Subtle 1px body bob
        this.bodyBobY = this.wheelFrame % 2 === 0 ? 1 : 0;
      }
    }

    // 2. Handle SUCCESS animation sequence (~450ms)
    if (this.visualState === VISUAL_STATES.SUCCESS_LOAD) {
      this.animElapsed += deltaSeconds;
      const t = this.animElapsed;

      // Stage 1: 0 - 120ms (Fork lift up 6px)
      if (t <= 0.12) {
        this.forkLiftY = (t / 0.12) * 6;
      }
      // Stage 2: 120ms - 350ms (Arc transfer load to truck flatbed)
      else if (t <= 0.35) {
        this.forkLiftY = 6;
      }
      // Stage 3: 350ms+ (Settle on truck flatbed with spark effect)
      else {
        if (!this.activeEffect) {
          const meta = TRUCK_METADATA[this.truckType];
          this.activeEffect = {
            type: "SPARK",
            x: meta.loadTarget.x - 20,
            y: meta.loadTarget.y - 15
          };
          // Add to truck settled loads (keep max 3)
          this.truckSettledLoads.push({
            id: this.nextLoadId++,
            type: this.currentLoadType,
            x: meta.loadTarget.x - 15 + (this.truckSettledLoads.length % 2) * 8,
            y: meta.loadTarget.y - Math.min(16, this.truckSettledLoads.length * 6)
          });
          if (this.truckSettledLoads.length > 3) {
            this.truckSettledLoads.shift();
          }
        }
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
    this.renderForklift();
    this.renderActiveLoad();
    this.renderSettledLoads();
    this.renderEffects();
  }

  /**
   * Renders Truck SVG
   */
  renderTruck() {
    this.truckLayer.innerHTML = getTruckSvg(this.truckType, { isShaking: this.isTruckShaking });
  }

  /**
   * Renders Forklift SVG at current position
   */
  renderForklift() {
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
   * Renders active scaffold load (on fork or during transfer/fall)
   */
  renderActiveLoad() {
    // If during MISS collision, render falling load
    if (this.visualState === VISUAL_STATES.COLLISION && this.fallingLoad) {
      this.activeLoadLayer.style.display = "block";
      this.activeLoadLayer.style.transform = `translate(${this.fallingLoad.x}px, ${this.fallingLoad.y}px) rotate(${this.fallingLoad.rotation}deg)`;
      this.activeLoadLayer.innerHTML = getScaffoldLoadSvg(this.fallingLoad.type);
      return;
    }

    // If during SUCCESS transfer (120ms - 350ms), interpolate arc to truck target
    if (this.visualState === VISUAL_STATES.SUCCESS_LOAD && this.animElapsed > 0.12 && this.animElapsed <= 0.35) {
      const forkliftX = this.START_X + this.currentProgress * (this.CONTACT_X - this.START_X);
      const startX = forkliftX + 54;
      const startY = this.GROUND_Y - 22 - this.forkLiftY;
      const target = TRUCK_METADATA[this.truckType].loadTarget;

      const progress = (this.animElapsed - 0.12) / (0.35 - 0.12);
      const curX = startX + progress * (target.x - startX);
      // Arc curve (lifts upward in middle)
      const arcY = Math.sin(progress * Math.PI) * 12;
      const curY = startY + progress * (target.y - startY) - arcY;

      this.activeLoadLayer.style.display = "block";
      this.activeLoadLayer.style.transform = `translate(${curX}px, ${curY}px)`;
      this.activeLoadLayer.innerHTML = getScaffoldLoadSvg(this.currentLoadType);
      return;
    }

    // If settled on truck, hide active load
    if (this.visualState === VISUAL_STATES.SUCCESS_LOAD && this.animElapsed > 0.35) {
      this.activeLoadLayer.style.display = "none";
      return;
    }

    // Default: On Forklift Forks
    const forkliftX = this.START_X + this.currentProgress * (this.CONTACT_X - this.START_X);
    const loadX = forkliftX + 54;
    const loadY = this.GROUND_Y - 22 - this.forkLiftY + this.bodyBobY;

    this.activeLoadLayer.style.display = "block";
    this.activeLoadLayer.style.transform = `translate(${loadX}px, ${loadY}px)`;
    this.activeLoadLayer.innerHTML = getScaffoldLoadSvg(this.currentLoadType);
  }

  /**
   * Renders loads accumulated on the truck flatbed
   */
  renderSettledLoads() {
    this.truckLoadsLayer.innerHTML = this.truckSettledLoads
      .map(
        (load, idx) => `
          <div class="settled-load-item" style="position: absolute; left: ${load.x}px; top: ${load.y}px; z-index: ${20 + idx};">
            ${getScaffoldLoadSvg(load.type, { width: 34, height: 20 })}
          </div>
        `
      )
      .join("");
  }

  /**
   * Renders active pixel effects (Sparkles / Bursts)
   */
  renderEffects() {
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
