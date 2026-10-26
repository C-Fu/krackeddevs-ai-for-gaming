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
    // 1. Dark rough pothole crater material
    this.potholeMat = new BABYLON.StandardMaterial('potholeMat', this.scene);
    this.potholeMat.diffuseColor = new BABYLON.Color3(0.04, 0.04, 0.04);
    this.potholeMat.specularColor = new BABYLON.Color3(0.02, 0.02, 0.02);

    // 2. Full-Lane SmartTAG Incline Ramp Surface Material (Glowing Emerald Runway)
    this.rampMat = new BABYLON.StandardMaterial('smartTagRampMat', this.scene);
    this.rampMat.diffuseColor = new BABYLON.Color3(0.02, 0.65, 0.32);
    this.rampMat.emissiveColor = new BABYLON.Color3(0.01, 0.35, 0.18);
    this.rampMat.specularColor = new BABYLON.Color3(0.2, 0.9, 0.5);

    // 3. Ramp Chevrons
    this.chevronMat = new BABYLON.StandardMaterial('chevronMat', this.scene);
    this.chevronMat.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // 4. Concrete Curb Hazard Stripes (Yellow / Black Diagonal Chevrons)
    this.hazardTex = new BABYLON.DynamicTexture('hazardTex', { width: 256, height: 256 }, this.scene);
    const hctx = this.hazardTex.getContext();
    hctx.fillStyle = '#FFC800'; // Yellow
    hctx.fillRect(0, 0, 256, 256);
    hctx.fillStyle = '#111111'; // Black stripes
    hctx.lineWidth = 36;
    for (let i = -256; i < 512; i += 64) {
      hctx.beginPath();
      hctx.moveTo(i, 0);
      hctx.lineTo(i + 256, 256);
      hctx.stroke();
    }
    this.hazardTex.update();

    this.hazardMat = new BABYLON.StandardMaterial('hazardMat', this.scene);
    this.hazardMat.diffuseTexture = this.hazardTex;
    this.hazardMat.emissiveColor = new BABYLON.Color3(0.25, 0.2, 0.0);

    // 5. White & Red Striped Gantry Tubing & Boom Arm
    this.stripeTex = new BABYLON.DynamicTexture('stripeTex', { width: 256, height: 64 }, this.scene);
    const sctx = this.stripeTex.getContext();
    sctx.fillStyle = '#FFFFFF';
    sctx.fillRect(0, 0, 256, 64);
    sctx.fillStyle = '#D60000';
    for (let x = 0; x < 256; x += 48) {
      sctx.fillRect(x, 0, 24, 64);
    }
    this.stripeTex.update();

    this.stripedMat = new BABYLON.StandardMaterial('stripedMat', this.scene);
    this.stripedMat.diffuseTexture = this.stripeTex;
    this.stripedMat.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.1);

    // 6. Main Yellow "SmartTAG" Signboard Dynamic Texture
    this.smartTagBoardTex = new BABYLON.DynamicTexture('smartTagBoardTex', { width: 512, height: 256 }, this.scene);
    const bctx = this.smartTagBoardTex.getContext();
    bctx.fillStyle = '#FFDC00'; // Vibrant SmartTAG Yellow
    bctx.fillRect(0, 0, 512, 256);
    // Dark Blue Border
    bctx.lineWidth = 20;
    bctx.strokeStyle = '#0a1d63';
    bctx.strokeRect(10, 10, 492, 236);
    bctx.lineWidth = 4;
    bctx.strokeStyle = '#FFFFFF';
    bctx.strokeRect(24, 24, 464, 208);
    // Typography: "SmartTAG"
    bctx.fillStyle = '#0a1d63';
    bctx.font = 'italic 900 86px Arial, Rajdhani, sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('SmartTAG', 256, 128);
    this.smartTagBoardTex.update();

    this.smartTagSignMat = new BABYLON.StandardMaterial('smartTagSignMat', this.scene);
    this.smartTagSignMat.diffuseTexture = this.smartTagBoardTex;
    this.smartTagSignMat.emissiveColor = new BABYLON.Color3(0.35, 0.3, 0.05);

    // 7. "🚗 SAHAJA" Red Signboard
    this.sahajaTex = new BABYLON.DynamicTexture('sahajaTex', { width: 256, height: 128 }, this.scene);
    const actx = this.sahajaTex.getContext();
    actx.fillStyle = '#D60000';
    actx.fillRect(0, 0, 256, 128);
    actx.lineWidth = 8;
    actx.strokeStyle = '#FFFFFF';
    actx.strokeRect(4, 4, 248, 120);
    // Car symbol
    actx.fillStyle = '#FFFFFF';
    actx.beginPath();
    actx.moveTo(85, 48);
    actx.lineTo(105, 24);
    actx.lineTo(151, 24);
    actx.lineTo(171, 48);
    actx.closePath();
    actx.fill();
    actx.fillRect(70, 46, 116, 22);
    actx.fillStyle = '#D60000';
    actx.beginPath();
    actx.arc(96, 68, 8, 0, Math.PI * 2);
    actx.arc(160, 68, 8, 0, Math.PI * 2);
    actx.fill();
    // "SAHAJA"
    actx.fillStyle = '#FFFFFF';
    actx.font = 'bold 30px Arial, sans-serif';
    actx.textAlign = 'center';
    actx.fillText('SAHAJA', 128, 108);
    this.sahajaTex.update();

    this.sahajaMat = new BABYLON.StandardMaterial('sahajaMat', this.scene);
    this.sahajaMat.diffuseTexture = this.sahajaTex;
    this.sahajaMat.emissiveColor = new BABYLON.Color3(0.3, 0.05, 0.05);

    // 8. Luminous Green Downward Arrow (Lane Open)
    this.arrowTex = new BABYLON.DynamicTexture('arrowTex', { width: 128, height: 128 }, this.scene);
    const grctx = this.arrowTex.getContext();
    grctx.fillStyle = '#080808';
    grctx.fillRect(0, 0, 128, 128);
    grctx.lineWidth = 6;
    grctx.strokeStyle = '#222222';
    grctx.strokeRect(3, 3, 122, 122);
    // Green arrow
    grctx.fillStyle = '#00FF66';
    grctx.beginPath();
    grctx.moveTo(64, 106);
    grctx.lineTo(24, 58);
    grctx.lineTo(48, 58);
    grctx.lineTo(48, 20);
    grctx.lineTo(80, 20);
    grctx.lineTo(80, 58);
    grctx.lineTo(104, 58);
    grctx.closePath();
    grctx.fill();
    this.arrowTex.update();

    this.arrowMat = new BABYLON.StandardMaterial('arrowMat', this.scene);
    this.arrowMat.diffuseTexture = this.arrowTex;
    this.arrowMat.emissiveColor = new BABYLON.Color3(0.0, 0.9, 0.35);

    // 9. "2.1m" Height Clearance Warning Sign
    this.heightTex = new BABYLON.DynamicTexture('heightTex', { width: 128, height: 128 }, this.scene);
    const hgctx = this.heightTex.getContext();
    hgctx.fillStyle = '#FFFFFF';
    hgctx.beginPath();
    hgctx.arc(64, 64, 60, 0, Math.PI * 2);
    hgctx.fill();
    hgctx.lineWidth = 14;
    hgctx.strokeStyle = '#D60000';
    hgctx.beginPath();
    hgctx.arc(64, 64, 53, 0, Math.PI * 2);
    hgctx.stroke();
    hgctx.fillStyle = '#111111';
    hgctx.font = 'bold 44px Arial, sans-serif';
    hgctx.textAlign = 'center';
    hgctx.textBaseline = 'middle';
    hgctx.fillText('2.1', 64, 64);
    this.heightTex.update();

    this.heightSignMat = new BABYLON.StandardMaterial('heightSignMat', this.scene);
    this.heightSignMat.diffuseTexture = this.heightTex;

    // Dark trim for fixtures and floodlights
    this.darkMat = new BABYLON.StandardMaterial('darkTrimMat', this.scene);
    this.darkMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.14);
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
    // SmartTAG Boost Ramp Locations along PLUS highway corridors
    const padLocations = [
      { x: 5.8, z: 280 },   // Right lane early sprint
      { x: 0.0, z: 950 },   // Middle lane gantry approach
      { x: 5.8, z: 1850 },  // Fast lane bridge
      { x: -5.8, z: 2750 }, // Left lane diversion
      { x: 5.8, z: 3600 },  // Highway climax
      { x: 0.0, z: 4550 }   // Final sprint to Ayer Keroh Toll
    ];

    padLocations.forEach((loc, idx) => {
      const gantryGroup = new BABYLON.TransformNode(`smarttag_lane_${idx}`, this.scene);
      gantryGroup.position.set(loc.x, 0, loc.z);

      // ========================================================
      // 1. FULL-LANE 3D INCLINE RAMP (Covers entire 4.2m lane width)
      // ========================================================
      const rampLength = 16.0;
      const rampWidth = 4.2; // Spans the complete lane!
      const rampInclineAngle = -0.044; // Slopes up ~0.7m over 16m length

      const rampSlab = BABYLON.MeshBuilder.CreateBox(`rampSlab_${idx}`, {
        width: rampWidth,
        height: 0.22,
        depth: rampLength
      }, this.scene);
      rampSlab.position.set(0, 0.38, 0);
      rampSlab.rotation.x = rampInclineAngle;
      rampSlab.material = this.rampMat;
      rampSlab.parent = gantryGroup;

      // Side hazard curbs flanking the ramp
      [-rampWidth / 2 - 0.18, rampWidth / 2 + 0.18].forEach((cx, ci) => {
        const curb = BABYLON.MeshBuilder.CreateBox(`curb_${idx}_${ci}`, {
          width: 0.35,
          height: 0.32,
          depth: rampLength
        }, this.scene);
        curb.position.set(cx, 0.42, 0);
        curb.rotation.x = rampInclineAngle;
        curb.material = this.hazardMat;
        curb.parent = gantryGroup;
      });

      // 4 Large Glowing Runway Chevrons along the ramp
      for (let c = -1.5; c <= 1.5; c += 1.0) {
        const chev = BABYLON.MeshBuilder.CreatePlane(`chev_${idx}_${c}`, {
          width: 2.6,
          height: 1.4
        }, this.scene);
        chev.rotation.x = Math.PI / 2 + rampInclineAngle;
        chev.position.set(0, 0.50 + c * 0.15, c * 3.6);
        chev.material = this.chevronMat;
        chev.parent = gantryGroup;
      }

      // ========================================================
      // 2. OVERHEAD SMARTTAG GANTRY STRUCTURE (At ramp crest z = +7.5)
      // ========================================================
      const gantryZ = 7.5;
      const pillarSpan = 2.25; // 4.5m total opening width

      // Left & Right Concrete Hazard Barrier Blocks
      [-pillarSpan, pillarSpan].forEach((bx, bi) => {
        const barrier = BABYLON.MeshBuilder.CreateBox(`barrier_${idx}_${bi}`, {
          width: 0.55,
          height: 0.85,
          depth: 2.4
        }, this.scene);
        barrier.position.set(bx, 0.72, gantryZ);
        barrier.material = this.hazardMat;
        barrier.parent = gantryGroup;
      });

      // Tubular Arch Pillars (White & Red Striped)
      const pillarL = BABYLON.MeshBuilder.CreateCylinder(`pillarL_${idx}`, {
        diameter: 0.22,
        height: 4.8
      }, this.scene);
      pillarL.position.set(-pillarSpan, 3.2, gantryZ);
      pillarL.material = this.stripedMat;
      pillarL.parent = gantryGroup;

      const pillarR = BABYLON.MeshBuilder.CreateCylinder(`pillarR_${idx}`, {
        diameter: 0.22,
        height: 4.8
      }, this.scene);
      pillarR.position.set(pillarSpan, 3.2, gantryZ);
      pillarR.material = this.stripedMat;
      pillarR.parent = gantryGroup;

      // Top Tubular Crossbar
      const crossbar = BABYLON.MeshBuilder.CreateCylinder(`crossbar_${idx}`, {
        diameter: 0.22,
        height: pillarSpan * 2 + 0.4
      }, this.scene);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 5.25, gantryZ);
      crossbar.material = this.stripedMat;
      crossbar.parent = gantryGroup;

      // Lower Height Limit Clearance Bar
      const lowerBar = BABYLON.MeshBuilder.CreateCylinder(`lowerBar_${idx}`, {
        diameter: 0.14,
        height: pillarSpan * 2
      }, this.scene);
      lowerBar.rotation.z = Math.PI / 2;
      lowerBar.position.set(0, 2.9, gantryZ);
      lowerBar.material = this.stripedMat;
      lowerBar.parent = gantryGroup;

      // Main Yellow "SmartTAG" Overhead Signboard
      const smartTagSign = BABYLON.MeshBuilder.CreateBox(`smartTagSign_${idx}`, {
        width: 3.5,
        height: 1.25,
        depth: 0.12
      }, this.scene);
      smartTagSign.position.set(0, 3.85, gantryZ);
      smartTagSign.material = this.smartTagSignMat;
      smartTagSign.parent = gantryGroup;

      // Twin floodlight fixtures over the sign
      [-1.1, 1.1].forEach((lx, li) => {
        const lamp = BABYLON.MeshBuilder.CreateCylinder(`lamp_${idx}_${li}`, {
          diameter: 0.35,
          height: 0.18
        }, this.scene);
        lamp.rotation.x = Math.PI / 3;
        lamp.position.set(lx, 4.6, gantryZ - 0.25);
        lamp.material = this.darkMat;
        lamp.parent = gantryGroup;
      });

      // Red "🚗 SAHAJA" Badge
      const sahajaSign = BABYLON.MeshBuilder.CreateBox(`sahajaSign_${idx}`, {
        width: 1.6,
        height: 0.72,
        depth: 0.1
      }, this.scene);
      sahajaSign.position.set(0, 4.75, gantryZ);
      sahajaSign.material = this.sahajaMat;
      sahajaSign.parent = gantryGroup;

      // Green Downward Arrow Box (Top Status Box)
      const arrowBox = BABYLON.MeshBuilder.CreateBox(`arrowBox_${idx}`, {
        width: 0.85,
        height: 0.85,
        depth: 0.22
      }, this.scene);
      arrowBox.position.set(0, 5.65, gantryZ);
      arrowBox.material = this.arrowMat;
      arrowBox.parent = gantryGroup;

      // Round "2.1m" Height Limit Warning Sign
      const heightSign = BABYLON.MeshBuilder.CreateCylinder(`heightSign_${idx}`, {
        diameter: 0.82,
        height: 0.06
      }, this.scene);
      heightSign.rotation.x = Math.PI / 2;
      heightSign.position.set(pillarSpan + 0.35, 2.45, gantryZ - 0.1);
      heightSign.material = this.heightSignMat;
      heightSign.parent = gantryGroup;

      // Automated Boom Barrier Arm (Red & White Striped)
      const barrierArmPivot = new BABYLON.TransformNode(`armPivot_${idx}`, this.scene);
      barrierArmPivot.position.set(pillarSpan - 0.25, 1.1, gantryZ - 0.3);
      barrierArmPivot.parent = gantryGroup;

      const barrierArm = BABYLON.MeshBuilder.CreateCylinder(`arm_${idx}`, {
        diameter: 0.11,
        height: 3.4
      }, this.scene);
      barrierArm.rotation.z = Math.PI / 2;
      barrierArm.position.set(-1.6, 0, 0);
      barrierArm.material = this.stripedMat;
      barrierArm.parent = barrierArmPivot;

      // Angled upward at ~42 degrees so vehicles blast under it
      barrierArmPivot.rotation.z = 0.72;

      this.boostPads.push({
        root: gantryGroup,
        armPivot: barrierArmPivot,
        x: loc.x,
        z: loc.z,
        active: true
      });
    });
  }

  update(deltaTime) {
    const playerPos = this.player.position;

    // 1. Check Potholes Collision
    for (let p of this.potholes) {
      if (!p.active) continue;
      const dz = Math.abs(p.z - playerPos.z);
      if (dz < 2.0) {
        const dx = Math.abs(p.x - playerPos.x);
        if (dx < p.radius && !this.player.isAirborne) {
          this.player.triggerPotholeHit();
          p.active = false;
        }
      }
    }

    // 2. Check SmartTAG Full-Lane Ramp Collision & Gantry Animation
    for (let b of this.boostPads) {
      // Dynamic Boom Barrier Swing when approaching
      const distToGantry = (b.z + 7.5) - playerPos.z;
      if (distToGantry > 0 && distToGantry < 40 && Math.abs(b.x - playerPos.x) < 3.0) {
        // Swing barrier smoothly open towards 75 degrees!
        b.armPivot.rotation.z = BABYLON.Scalar.Lerp(b.armPivot.rotation.z, 1.25, 0.1);
      }

      if (!b.active) continue;

      // Full-lane coverage: ramp depth 16m (dz < 8.0) and full lane width (dx < 2.15m)
      const dz = Math.abs(b.z - playerPos.z);
      if (dz < 8.0) {
        const dx = Math.abs(b.x - playerPos.x);
        if (dx < 2.15) {
          this.player.triggerSmartTagBoost();
          b.active = false; // Triggered boost!
        }
      }
    }
  }

  reset() {
    this.potholes.forEach(p => p.active = true);
    this.boostPads.forEach(b => {
      b.active = true;
      b.armPivot.rotation.z = 0.72;
    });
  }
}
