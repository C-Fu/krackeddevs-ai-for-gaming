import * as BABYLON from '@babylonjs/core';
import { sound } from './audio.js';

export class MyviVehicle {
  constructor(scene) {
    this.scene = scene;

    // Movement & Arcade Physics parameters
    this.speedKmh = 0;
    this.topSpeedKmh = 180;
    this.boostTopSpeed = 240;
    this.accelRate = 42; // km/h per sec
    this.brakeRate = 75; // km/h per sec
    this.friction = 12; // km/h per sec natural roll off
    this.steerSpeed = 24; // lateral m/s
    this.laneLimit = 8.8; // half width of highway road

    // State
    this.position = new BABYLON.Vector3(0, 0.45, 0); // start at KM 0
    this.lateralTilt = 0;
    this.isHighBeamActive = false;
    this.highBeamCooldown = 0;
    this.isBoosting = false;
    this.boostTimer = 0;
    this.wobbleTimer = 0;

    // Airborne physics for SmartTAG ramp jumps
    this.isAirborne = false;
    this.verticalVelocity = 0;
    this.gravity = -28;

    // Inputs
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      highBeam: false,
      horn: false
    };

    this.createCarMesh();
    this.setupHeadlights();
  }

  createCarMesh() {
    this.rootNode = new BABYLON.TransformNode('myvi_root', this.scene);
    this.rootNode.position = this.position;

    // Materials
    const whitePaint = new BABYLON.StandardMaterial('myviWhite', this.scene);
    whitePaint.diffuseColor = new BABYLON.Color3(0.96, 0.96, 0.98);
    whitePaint.specularColor = new BABYLON.Color3(0.8, 0.8, 0.9);
    whitePaint.specularPower = 32;

    const darkTrim = new BABYLON.StandardMaterial('myviDark', this.scene);
    darkTrim.diffuseColor = new BABYLON.Color3(0.08, 0.08, 0.09);

    const glassMat = new BABYLON.StandardMaterial('myviGlass', this.scene);
    glassMat.diffuseColor = new BABYLON.Color3(0.12, 0.15, 0.2);
    glassMat.specularColor = new BABYLON.Color3(1, 1, 1);
    glassMat.alpha = 0.85;

    const wheelMat = new BABYLON.StandardMaterial('myviTire', this.scene);
    wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const rimMat = new BABYLON.StandardMaterial('myviRim', this.scene);
    rimMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.75);

    // Main lower body (chassis)
    const chassis = BABYLON.MeshBuilder.CreateBox('chassis', {
      width: 1.75,
      height: 0.65,
      depth: 3.6
    }, this.scene);
    chassis.position.y = 0.35;
    chassis.material = whitePaint;
    chassis.parent = this.rootNode;

    // Cabin / Roof (hatchback curve)
    const cabin = BABYLON.MeshBuilder.CreateBox('cabin', {
      width: 1.5,
      height: 0.55,
      depth: 2.1
    }, this.scene);
    cabin.position.set(0, 0.9, -0.2);
    cabin.material = glassMat;
    cabin.parent = this.rootNode;

    // Roof cover
    const roof = BABYLON.MeshBuilder.CreateBox('roof', {
      width: 1.48,
      height: 0.08,
      depth: 1.8
    }, this.scene);
    roof.position.set(0, 1.2, -0.25);
    roof.material = whitePaint;
    roof.parent = this.rootNode;

    // Iconic King Myvi Roof Spoiler
    const spoiler = BABYLON.MeshBuilder.CreateBox('spoiler', {
      width: 1.5,
      height: 0.06,
      depth: 0.35
    }, this.scene);
    spoiler.position.set(0, 1.25, -1.25);
    spoiler.material = darkTrim;
    spoiler.parent = this.rootNode;

    // Front Grille & Bumper
    const grille = BABYLON.MeshBuilder.CreateBox('grille', {
      width: 1.3,
      height: 0.25,
      depth: 0.15
    }, this.scene);
    grille.position.set(0, 0.3, 1.8);
    grille.material = darkTrim;
    grille.parent = this.rootNode;

    // 4 Wheels
    this.wheels = [];
    const wheelPositions = [
      { x: -0.9, y: 0.22, z: 1.1 },
      { x: 0.9, y: 0.22, z: 1.1 },
      { x: -0.9, y: 0.22, z: -1.1 },
      { x: 0.9, y: 0.22, z: -1.1 }
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(`wheel_${idx}`, {
        diameter: 0.65,
        height: 0.28,
        tessellation: 20
      }, this.scene);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.material = wheelMat;
      wheel.parent = this.rootNode;

      // Rim center
      const rim = BABYLON.MeshBuilder.CreateCylinder(`rim_${idx}`, {
        diameter: 0.42,
        height: 0.29,
        tessellation: 12
      }, this.scene);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(pos.x, pos.y, pos.z);
      rim.material = rimMat;
      rim.parent = this.rootNode;

      this.wheels.push(wheel);
    });

    // Rear Brake Lights
    this.brakeMat = new BABYLON.StandardMaterial('brakeMat', this.scene);
    this.brakeMat.diffuseColor = new BABYLON.Color3(0.8, 0, 0);
    this.brakeMat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);

    const brakeL = BABYLON.MeshBuilder.CreateBox('brakeL', { width: 0.3, height: 0.15, depth: 0.08 }, this.scene);
    brakeL.position.set(-0.65, 0.5, -1.8);
    brakeL.material = this.brakeMat;
    brakeL.parent = this.rootNode;

    const brakeR = BABYLON.MeshBuilder.CreateBox('brakeR', { width: 0.3, height: 0.15, depth: 0.08 }, this.scene);
    brakeR.position.set(0.65, 0.5, -1.8);
    brakeR.material = this.brakeMat;
    brakeR.parent = this.rootNode;
  }

  setupHeadlights() {
    // Left & Right normal low-beam headlights
    this.headlightMat = new BABYLON.StandardMaterial('headlightMat', this.scene);
    this.headlightMat.emissiveColor = new BABYLON.Color3(1, 1, 0.9);

    const hlL = BABYLON.MeshBuilder.CreateBox('hlL', { width: 0.32, height: 0.18, depth: 0.08 }, this.scene);
    hlL.position.set(-0.65, 0.45, 1.8);
    hlL.material = this.headlightMat;
    hlL.parent = this.rootNode;

    const hlR = BABYLON.MeshBuilder.CreateBox('hlR', { width: 0.32, height: 0.18, depth: 0.08 }, this.scene);
    hlR.position.set(0.65, 0.45, 1.8);
    hlR.material = this.headlightMat;
    hlR.parent = this.rootNode;

    // Spotlights for High Beam Projection
    this.highBeamLightL = new BABYLON.SpotLight(
      'highBeamL',
      new BABYLON.Vector3(-0.65, 0.5, 1.85),
      new BABYLON.Vector3(0, -0.05, 1),
      Math.PI / 4.5,
      8,
      this.scene
    );
    this.highBeamLightL.diffuse = new BABYLON.Color3(0.8, 0.95, 1);
    this.highBeamLightL.intensity = 0.5; // low beam default
    this.highBeamLightL.range = 35;
    this.highBeamLightL.parent = this.rootNode;

    this.highBeamLightR = new BABYLON.SpotLight(
      'highBeamR',
      new BABYLON.Vector3(0.65, 0.5, 1.85),
      new BABYLON.Vector3(0, -0.05, 1),
      Math.PI / 4.5,
      8,
      this.scene
    );
    this.highBeamLightR.diffuse = new BABYLON.Color3(0.8, 0.95, 1);
    this.highBeamLightR.intensity = 0.5;
    this.highBeamLightR.range = 35;
    this.highBeamLightR.parent = this.rootNode;
  }

  triggerHighBeam(active) {
    if (active && !this.isHighBeamActive) {
      sound.playHighBeam();
    }
    this.isHighBeamActive = active;

    const intensity = active ? 4.5 : 0.5;
    const range = active ? 55 : 35;
    const emissive = active ? new BABYLON.Color3(1, 1, 1) : new BABYLON.Color3(0.8, 0.8, 0.5);

    this.highBeamLightL.intensity = intensity;
    this.highBeamLightR.intensity = intensity;
    this.highBeamLightL.range = range;
    this.highBeamLightR.range = range;
    this.headlightMat.emissiveColor = emissive;
  }

  triggerSmartTagBoost() {
    this.isBoosting = true;
    this.boostTimer = 3.5;
    this.speedKmh = Math.max(this.speedKmh + 50, 190);
    this.isAirborne = true;
    this.verticalVelocity = 12; // ramp jump launch
    sound.playBoost();
  }

  triggerPotholeHit() {
    this.speedKmh = Math.max(this.speedKmh * 0.55, 30);
    this.wobbleTimer = 1.2;
    sound.playPotholeThud();
  }

  update(deltaTime) {
    // 1. Throttle & Braking
    const currentMaxSpeed = this.isBoosting ? this.boostTopSpeed : this.topSpeedKmh;

    if (this.inputs.forward) {
      this.speedKmh += this.accelRate * deltaTime;
      if (this.speedKmh > currentMaxSpeed) {
        this.speedKmh = currentMaxSpeed;
      }
      this.brakeMat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
    } else if (this.inputs.backward) {
      this.speedKmh -= this.brakeRate * deltaTime;
      if (this.speedKmh < 0) this.speedKmh = 0;
      this.brakeMat.emissiveColor = new BABYLON.Color3(1, 0, 0); // bright brake light
    } else {
      // Natural rolling friction
      if (this.speedKmh > 0) {
        this.speedKmh -= this.friction * deltaTime;
        if (this.speedKmh < 0) this.speedKmh = 0;
      }
      this.brakeMat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
    }

    // Boost timer decay
    if (this.isBoosting) {
      this.boostTimer -= deltaTime;
      if (this.boostTimer <= 0) {
        this.isBoosting = false;
      }
    }

    // 2. Lateral Steering with banking tilt
    let steerDir = 0;
    if (this.inputs.left) steerDir -= 1;
    if (this.inputs.right) steerDir += 1;

    // Apply erratic steering wobble if recently hit pothole
    if (this.wobbleTimer > 0) {
      this.wobbleTimer -= deltaTime;
      steerDir += Math.sin(this.wobbleTimer * 25) * 0.5;
    }

    const steerEffort = (this.speedKmh / this.topSpeedKmh);
    const lateralDelta = steerDir * this.steerSpeed * steerEffort * deltaTime;
    this.position.x += lateralDelta;

    // Clamp inside highway barriers
    if (this.position.x < -this.laneLimit) this.position.x = -this.laneLimit;
    if (this.position.x > this.laneLimit) this.position.x = this.laneLimit;

    // Visual chassis lean into the turn
    const targetTilt = -steerDir * 0.08 * (this.speedKmh / 100);
    this.lateralTilt = BABYLON.Scalar.Lerp(this.lateralTilt, targetTilt, 0.15);
    this.rootNode.rotation.z = this.lateralTilt;

    // 3. Forward Movement
    const speedMs = (this.speedKmh * 1000) / 3600;
    this.position.z += speedMs * deltaTime;

    // 4. Airborne jump handling (SmartTAG ramps)
    if (this.isAirborne) {
      this.position.y += this.verticalVelocity * deltaTime;
      this.verticalVelocity += this.gravity * deltaTime;

      // Slight nose-up pitch during jump
      this.rootNode.rotation.x = -this.verticalVelocity * 0.02;

      if (this.position.y <= 0.45) {
        this.position.y = 0.45;
        this.isAirborne = false;
        this.verticalVelocity = 0;
        this.rootNode.rotation.x = 0;
      }
    } else {
      this.position.y = 0.45;
      this.rootNode.rotation.x = 0;
    }

    // Rotate wheels
    const wheelAngularSpeed = (speedMs / 0.325) * deltaTime;
    this.wheels.forEach(w => {
      w.rotation.x += wheelAngularSpeed;
    });

    // Update audio engine
    sound.updateEngine(this.speedKmh, this.isBoosting);

    // Apply position to Babylon transform
    this.rootNode.position.copyFrom(this.position);
  }
}
