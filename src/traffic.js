import * as BABYLON from '@babylonjs/core';
import { sound } from './audio.js';

export class TrafficManager {
  constructor(scene, playerVehicle) {
    this.scene = scene;
    this.player = playerVehicle;
    this.vehicles = [];
    this.lanes = [-5.8, 0.0, 5.8]; // Left, Middle, Right (Fast Lane)
    this.totalYields = 0;
    this.score = 0;
    this.onYieldCallback = null;

    this.initMaterials();
  }

  initMaterials() {
    this.sedanMat = new BABYLON.StandardMaterial('sedanMat', this.scene);
    this.sedanMat.diffuseColor = new BABYLON.Color3(0.15, 0.35, 0.75); // Blue Malaysian Sedan

    this.vanMat = new BABYLON.StandardMaterial('vanMat', this.scene);
    this.vanMat.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.85); // Silver Van

    this.lorryMat = new BABYLON.StandardMaterial('lorryMat', this.scene);
    this.lorryMat.diffuseColor = new BABYLON.Color3(0.9, 0.45, 0.05); // Orange Lorry

    this.wheelMat = new BABYLON.StandardMaterial('trafficWheel', this.scene);
    this.wheelMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.12);

    this.blinkerMat = new BABYLON.StandardMaterial('blinkerMat', this.scene);
    this.blinkerMat.emissiveColor = new BABYLON.Color3(1, 0.6, 0); // Amber turn signal
  }

  spawnVehicle(zOffset) {
    // Pick lane (bias towards right fast lane so player has cars to flash!)
    const laneIndex = Math.random() < 0.55 ? 2 : (Math.random() < 0.5 ? 1 : 0);
    const laneX = this.lanes[laneIndex];
    const type = Math.floor(Math.random() * 3); // 0: Sedan, 1: Van, 2: Lorry

    const rootNode = new BABYLON.TransformNode(`traffic_${Date.now()}_${Math.random()}`, this.scene);
    const zPos = this.player.position.z + zOffset;
    rootNode.position.set(laneX, 0.45, zPos);

    let bodyMesh;
    let blinkerL = null;

    if (type === 0) {
      // Classic Sedan
      bodyMesh = BABYLON.MeshBuilder.CreateBox('sedan_body', { width: 1.7, height: 0.8, depth: 3.8 }, this.scene);
      bodyMesh.position.y = 0.45;
      bodyMesh.material = this.sedanMat;
      bodyMesh.parent = rootNode;
    } else if (type === 1) {
      // Delivery Van
      bodyMesh = BABYLON.MeshBuilder.CreateBox('van_body', { width: 1.8, height: 1.4, depth: 4.2 }, this.scene);
      bodyMesh.position.y = 0.75;
      bodyMesh.material = this.vanMat;
      bodyMesh.parent = rootNode;
    } else {
      // PLUS Highway Lorry
      bodyMesh = BABYLON.MeshBuilder.CreateBox('lorry_body', { width: 2.1, height: 1.8, depth: 5.5 }, this.scene);
      bodyMesh.position.y = 0.95;
      bodyMesh.material = this.lorryMat;
      bodyMesh.parent = rootNode;
    }

    // Left indicator light for yielding
    blinkerL = BABYLON.MeshBuilder.CreateBox('blinkerL', { width: 0.15, height: 0.15, depth: 0.1 }, this.scene);
    blinkerL.position.set(-0.85, 0.5, -1.8);
    blinkerL.material = this.blinkerMat;
    blinkerL.setEnabled(false);
    blinkerL.parent = rootNode;

    const vehicleObj = {
      root: rootNode,
      mesh: bodyMesh,
      blinkerL: blinkerL,
      laneIndex: laneIndex,
      currentX: laneX,
      targetX: laneX,
      speedKmh: 75 + Math.random() * 20, // 75-95 km/h cruising speed
      state: 'CRUISING', // CRUISING, SIGNALING, YIELDING, YIELDED
      reactionTimer: 0,
      blinkTimer: 0,
      isBlinking: false
    };

    this.vehicles.push(vehicleObj);
  }

  update(deltaTime) {
    const playerPos = this.player.position;

    // 1. Maintain pool of traffic ahead (keep ~10-14 vehicles spawned between 40m and 350m ahead)
    const forwardVehicles = this.vehicles.filter(v => v.root.position.z > playerPos.z);
    if (forwardVehicles.length < 10) {
      const highestZ = this.vehicles.reduce((max, v) => Math.max(max, v.root.position.z), playerPos.z + 40);
      this.spawnVehicle(highestZ - playerPos.z + 30 + Math.random() * 25);
    }

    // 2. Update each vehicle
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      const speedMs = (v.speedKmh * 1000) / 3600;
      v.root.position.z += speedMs * deltaTime;

      const dz = v.root.position.z - playerPos.z;
      const dx = Math.abs(v.root.position.x - playerPos.x);

      // Check Despawn (far behind player)
      if (dz < -40) {
        v.root.dispose();
        this.vehicles.splice(i, 1);
        continue;
      }

      // USP 1: High Beam Detection State Machine
      if (v.laneIndex === 2 && v.state === 'CRUISING') {
        // Vehicle is in right (fast) lane ahead of player
        if (dz > 4 && dz < 42 && this.player.isHighBeamActive && Math.abs(playerPos.x - v.currentX) < 2.5) {
          // Trigger reaction!
          v.state = 'SIGNALING';
          v.reactionTimer = 0.28; // brief panic reaction delay
          v.blinkerL.setEnabled(true);
        }
      }

      // Handle Signaling state
      if (v.state === 'SIGNALING') {
        // Blinking indicator light
        v.blinkTimer += deltaTime;
        if (v.blinkTimer > 0.12) {
          v.blinkTimer = 0;
          v.isBlinking = !v.isBlinking;
          v.blinkerL.setEnabled(v.isBlinking);
        }

        v.reactionTimer -= deltaTime;
        if (v.reactionTimer <= 0) {
          v.state = 'YIELDING';
          v.targetX = this.lanes[1]; // Shift to middle lane
          v.laneIndex = 1;
        }
      }

      // Handle Yielding state (lateral move)
      if (v.state === 'YIELDING') {
        v.currentX = BABYLON.Scalar.Lerp(v.currentX, v.targetX, 0.08);
        v.root.position.x = v.currentX;

        // Visual banking during lane shift
        v.root.rotation.z = 0.05;

        if (Math.abs(v.currentX - v.targetX) < 0.1) {
          v.currentX = v.targetX;
          v.root.position.x = v.currentX;
          v.root.rotation.z = 0;
          v.blinkerL.setEnabled(false);
          v.state = 'YIELDED';

          // Success rewards!
          this.totalYields += 1;
          this.score += 250;
          sound.playYieldSuccess();
          if (this.onYieldCallback) {
            this.onYieldCallback(this.totalYields, this.score);
          }
        }
      }

      // 3. Collision Detection with Player Myvi
      // Myvi size ~ 1.75 x 3.6; traffic size ~ 1.8 x 4.0
      if (Math.abs(dz) < 3.2 && dx < 1.65 && !this.player.isAirborne) {
        // Impact!
        sound.playCrash();
        this.player.speedKmh = Math.max(this.player.speedKmh * 0.3, 25);
        this.player.wobbleTimer = 1.0;

        // Push traffic forward and slightly lateral
        v.root.position.z += 5;
        v.currentX += (v.currentX > playerPos.x ? 1.5 : -1.5);
      }
    }
  }

  reset() {
    this.vehicles.forEach(v => v.root.dispose());
    this.vehicles = [];
    this.totalYields = 0;
    this.score = 0;
  }
}
