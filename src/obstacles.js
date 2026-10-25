import * as BABYLON from '@babylonjs/core';

export class ObstacleManager {
  constructor(scene, playerVehicle) {
    this.scene = scene;
    this.player = playerVehicle;
    this.potholes = [];
    this.boostPads = [];
    this.lanes = [-5.8, 0.0, 5.8];

    this.initMaterials();
    this.generateHazards();
    this.generateBoostPads();
  }

  initMaterials() {
    // Dark rough pothole crater material
    this.potholeMat = new BABYLON.StandardMaterial('potholeMat', this.scene);
    this.potholeMat.diffuseColor = new BABYLON.Color3(0.04, 0.04, 0.04);
    this.potholeMat.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);

    // Neon Green Glowing SmartTAG Pad
    this.smartTagMat = new BABYLON.StandardMaterial('smartTagMat', this.scene);
    this.smartTagMat.diffuseColor = new BABYLON.Color3(0.0, 0.9, 0.4);
    this.smartTagMat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 0.35);

    this.chevronMat = new BABYLON.StandardMaterial('chevronMat', this.scene);
    this.chevronMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  }

  generateHazards() {
    // Distribute potholes every 70-110m along the 5,000m track
    for (let z = 120; z < 4800; z += (75 + Math.random() * 45)) {
      // Pick random lane (favor left and middle lanes so fast lane is rewarded)
      const laneIdx = Math.random() < 0.45 ? 0 : (Math.random() < 0.6 ? 1 : 2);
      const x = this.lanes[laneIdx] + (Math.random() * 1.2 - 0.6);

      const pothole = BABYLON.MeshBuilder.CreateCylinder(`pothole_${z}`, {
        diameter: 2.2 + Math.random() * 0.8,
        height: 0.05,
        tessellation: 12
      }, this.scene);
      pothole.position.set(x, 0.03, z);
      pothole.material = this.potholeMat;
      pothole.freezeWorldMatrix();

      this.potholes.push({
        mesh: pothole,
        x: x,
        z: z,
        radius: 1.4,
        active: true
      });
    }
  }

  generateBoostPads() {
    // SmartTAG Boost Pads at key sprint corridors
    const padLocations = [
      { x: 5.8, z: 280 },   // Right lane early sprint
      { x: 0.0, z: 950 },   // Middle lane gantry approach
      { x: 5.8, z: 1850 },  // Fast lane bridge
      { x: -5.8, z: 2750 }, // Left lane diversion
      { x: 5.8, z: 3600 },  // Highway climax
      { x: 0.0, z: 4550 }   // Final sprint to Ayer Keroh Toll
    ];

    padLocations.forEach((loc, idx) => {
      const padGroup = new BABYLON.TransformNode(`smarttag_${idx}`, this.scene);
      padGroup.position.set(loc.x, 0.04, loc.z);

      // Main glowing green pad
      const padMesh = BABYLON.MeshBuilder.CreateBox(`padMesh_${idx}`, {
        width: 3.2,
        height: 0.06,
        depth: 12
      }, this.scene);
      padMesh.material = this.smartTagMat;
      padMesh.parent = padGroup;

      // 3 Chevron arrows
      for (let c = -1; c <= 1; c++) {
        const chev = BABYLON.MeshBuilder.CreatePlane(`chev_${idx}_${c}`, {
          width: 1.8,
          height: 1.2
        }, this.scene);
        chev.rotation.x = Math.PI / 2;
        chev.position.set(0, 0.05, c * 3.5);
        chev.material = this.chevronMat;
        chev.parent = padGroup;
      }

      this.boostPads.push({
        root: padGroup,
        x: loc.x,
        z: loc.z,
        active: true
      });
    });
  }

  update(deltaTime) {
    const playerPos = this.player.position;

    // Check Potholes Collision
    for (let p of this.potholes) {
      if (!p.active) continue;
      const dz = Math.abs(p.z - playerPos.z);
      if (dz < 2.0) {
        const dx = Math.abs(p.x - playerPos.x);
        if (dx < p.radius && !this.player.isAirborne) {
          this.player.triggerPotholeHit();
          p.active = false; // hit once
        }
      }
    }

    // Check SmartTAG Boost Collision
    for (let b of this.boostPads) {
      if (!b.active) continue;
      const dz = Math.abs(b.z - playerPos.z);
      if (dz < 6.0) {
        const dx = Math.abs(b.x - playerPos.x);
        if (dx < 1.8) {
          this.player.triggerSmartTagBoost();
          b.active = false; // trigger boost
        }
      }
    }
  }

  reset() {
    this.potholes.forEach(p => p.active = true);
    this.boostPads.forEach(b => b.active = true);
  }
}
