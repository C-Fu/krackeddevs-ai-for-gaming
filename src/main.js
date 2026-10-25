import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // Enable glTF/GLB loading support
import { MyviVehicle } from './myvi.js';
import { TrafficManager } from './traffic.js';
import { HighwayManager } from './highway.js';
import { ObstacleManager } from './obstacles.js';
import { UIManager } from './ui.js';
import { sound } from './audio.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = null;
    this.camera = null;

    // Game State
    this.state = 'START'; // START, PLAYING, GAMEOVER, VICTORY
    this.totalDistance = 5000; // 5km from Point A to Point B
    this.countdownTimer = 90.0; // 90 seconds
    this.elapsedTime = 0;

    this.ui = new UIManager();
    this.initScene();
    this.initSystems();
    this.bindEvents();
    this.startLoop();
  }

  initScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.06, 0.04, 0.12, 1.0); // Malaysian sunset twilight

    // Atmospheric Fog
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.0022;
    this.scene.fogColor = new BABYLON.Color3(0.18, 0.12, 0.28);

    // Ambient Twilight Light
    const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.65;
    hemiLight.diffuse = new BABYLON.Color3(0.9, 0.7, 0.8);
    hemiLight.groundColor = new BABYLON.Color3(0.15, 0.12, 0.25);

    // Warm Sunset Directional Sun
    const sunLight = new BABYLON.DirectionalLight('sunLight', new BABYLON.Vector3(-0.6, -0.4, 0.8), this.scene);
    sunLight.intensity = 1.2;
    sunLight.diffuse = new BABYLON.Color3(1.0, 0.65, 0.35); // Golden amber sunset rays

    // Chase Camera
    this.camera = new BABYLON.FollowCamera('chaseCam', new BABYLON.Vector3(0, 3, -8), this.scene);
    this.camera.radius = 7.5;
    this.camera.heightOffset = 2.4;
    this.camera.rotationOffset = 0;
    this.camera.cameraAcceleration = 0.12;
    this.camera.maxCameraSpeed = 80;
    this.camera.fov = 0.95;
  }

  initSystems() {
    // 1. Player Myvi
    this.player = new MyviVehicle(this.scene);
    this.camera.lockedTarget = this.player.rootNode;

    // 2. Highway Environment
    this.highway = new HighwayManager(this.scene, this.player);

    // 3. Traffic AI (USP 1)
    this.traffic = new TrafficManager(this.scene, this.player);
    this.traffic.onYieldCallback = (yieldCount, score) => {
      this.ui.triggerBanner('FAST LANE CLEARED! +250 PTS');
    };

    // 4. Hazards & Boosters (USP 2)
    this.obstacles = new ObstacleManager(this.scene, this.player);
  }

  bindEvents() {
    this.ui.bindControls(
      this.player,
      () => this.startGame(),
      () => this.restartGame()
    );

    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    // Press 'I' to toggle Babylon.js Debug Inspector for live workshop teaching
    window.addEventListener('keydown', async (e) => {
      if (e.key === 'i' || e.key === 'I') {
        if (this.scene.debugLayer.isVisible()) {
          this.scene.debugLayer.hide();
        } else {
          try {
            await import('@babylonjs/inspector');
            this.scene.debugLayer.show();
          } catch (err) {
            console.log('Inspector not bundled; running in performance mode.');
          }
        }
      }
    });
  }

  startGame() {
    this.state = 'PLAYING';
    this.ui.showHUD();
    sound.resume();
    sound.startEngineSound();
  }

  restartGame() {
    // Reset positions and states
    this.player.position.set(0, 0.45, 0);
    this.player.speedKmh = 0;
    this.player.isBoosting = false;
    this.traffic.reset();
    this.obstacles.reset();

    this.countdownTimer = 90.0;
    this.elapsedTime = 0;
    this.startGame();
  }

  update(deltaTime) {
    if (this.state === 'START') {
      // Gentle camera orbit preview while on start screen
      const t = Date.now() * 0.0005;
      this.camera.rotationOffset = Math.sin(t) * 15;
      return;
    }

    if (this.state !== 'PLAYING') return;

    // 1. Update Game Timers
    this.elapsedTime += deltaTime;
    this.countdownTimer -= deltaTime;

    // 2. Update Systems
    this.player.update(deltaTime);
    this.traffic.update(deltaTime);
    this.obstacles.update(deltaTime);

    // 3. Dynamic Camera Effects (speed stretch)
    const normSpeed = this.player.speedKmh / 200;
    this.camera.radius = 7.5 + normSpeed * 2.2;
    this.camera.heightOffset = 2.4 + normSpeed * 0.6;
    this.camera.fov = 0.95 + normSpeed * 0.2; // FOV expansion for speed sensation

    // 4. Update HUD
    this.ui.update(
      this.player.speedKmh,
      this.player.position.z,
      this.totalDistance,
      this.countdownTimer,
      this.player.isHighBeamActive
    );

    // 5. Win / Loss Condition Check (Point A to Point B)
    if (this.player.position.z >= this.totalDistance) {
      // Victory: Arrived at Ayer Keroh Toll Plaza!
      this.state = 'VICTORY';
      sound.stopEngineSound();
      sound.playBoost();
      const finalScore = this.traffic.score + Math.floor(this.countdownTimer * 100);
      this.ui.showVictory(this.elapsedTime, this.traffic.totalYields, finalScore);
    } else if (this.countdownTimer <= 0) {
      // Defeat: Time expired!
      this.state = 'GAMEOVER';
      sound.stopEngineSound();
      this.ui.showGameOver(this.player.position.z, this.traffic.totalYields);
    }
  }

  startLoop() {
    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      // Cap dt to prevent massive physics skips on tab switch
      const cappedDt = Math.min(dt, 0.1);
      this.update(cappedDt);
      this.scene.render();
    });
  }
}

// Boot game on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
