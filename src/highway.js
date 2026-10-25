import * as BABYLON from '@babylonjs/core';

export class HighwayManager {
  constructor(scene, playerVehicle) {
    this.scene = scene;
    this.player = playerVehicle;
    this.trackLength = 5000; // 5000m to Point B
    this.roadWidth = 20; // 3 lanes + shoulders

    this.initMaterials();
    this.buildHighway();
    this.buildGantries();
    this.buildPalmTrees();
    this.buildTollPlaza();
  }

  initMaterials() {
    // Asphalt
    this.asphaltMat = new BABYLON.StandardMaterial('asphaltMat', this.scene);
    this.asphaltMat.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.14);
    this.asphaltMat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);

    // Grass Embankment
    this.grassMat = new BABYLON.StandardMaterial('grassMat', this.scene);
    this.grassMat.diffuseColor = new BABYLON.Color3(0.1, 0.22, 0.08);

    // Guardrail Steel
    this.guardrailMat = new BABYLON.StandardMaterial('guardMat', this.scene);
    this.guardrailMat.diffuseColor = new BABYLON.Color3(0.65, 0.65, 0.7);

    // Lane Markings (White)
    this.stripeMat = new BABYLON.StandardMaterial('stripeMat', this.scene);
    this.stripeMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    this.stripeMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    // PLUS Malaysian Sign Green
    this.plusGreenMat = new BABYLON.StandardMaterial('plusGreen', this.scene);
    this.plusGreenMat.diffuseColor = new BABYLON.Color3(0.02, 0.42, 0.18);
    this.plusGreenMat.emissiveColor = new BABYLON.Color3(0.01, 0.15, 0.06);

    // Palm Tree Trunk & Fronds
    this.trunkMat = new BABYLON.StandardMaterial('trunkMat', this.scene);
    this.trunkMat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);

    this.frondMat = new BABYLON.StandardMaterial('frondMat', this.scene);
    this.frondMat.diffuseColor = new BABYLON.Color3(0.08, 0.35, 0.12);
  }

  buildHighway() {
    // Main asphalt slab (segmented into repeating sections for performance)
    this.road = BABYLON.MeshBuilder.CreateGround('highway_road', {
      width: this.roadWidth,
      height: this.trackLength + 400,
      subdivisions: 2
    }, this.scene);
    this.road.position.set(0, 0, (this.trackLength + 400) / 2 - 100);
    this.road.material = this.asphaltMat;

    // Grass verges
    const grassL = BABYLON.MeshBuilder.CreateGround('grassL', {
      width: 40,
      height: this.trackLength + 400
    }, this.scene);
    grassL.position.set(-30, -0.05, (this.trackLength + 400) / 2 - 100);
    grassL.material = this.grassMat;

    const grassR = BABYLON.MeshBuilder.CreateGround('grassR', {
      width: 40,
      height: this.trackLength + 400
    }, this.scene);
    grassR.position.set(30, -0.05, (this.trackLength + 400) / 2 - 100);
    grassR.material = this.grassMat;

    // Steel Guardrails (Left and Right)
    const guardL = BABYLON.MeshBuilder.CreateBox('guardL', {
      width: 0.4,
      height: 0.8,
      depth: this.trackLength + 400
    }, this.scene);
    guardL.position.set(-this.roadWidth / 2 - 0.2, 0.4, (this.trackLength + 400) / 2 - 100);
    guardL.material = this.guardrailMat;

    const guardR = BABYLON.MeshBuilder.CreateBox('guardR', {
      width: 0.4,
      height: 0.8,
      depth: this.trackLength + 400
    }, this.scene);
    guardR.position.set(this.roadWidth / 2 + 0.2, 0.4, (this.trackLength + 400) / 2 - 100);
    guardR.material = this.guardrailMat;

    // Dashed Lane Dividers (Lane 1/2 at x = -3, Lane 2/3 at x = +3)
    this.buildLaneStripes(-2.9);
    this.buildLaneStripes(2.9);
  }

  buildLaneStripes(xPos) {
    // Generate dashed stripes along track
    const stripeLength = 6;
    const stripeGap = 12;
    const count = Math.floor(this.trackLength / (stripeLength + stripeGap));

    for (let i = 0; i < count; i++) {
      const z = i * (stripeLength + stripeGap);
      const stripe = BABYLON.MeshBuilder.CreatePlane(`stripe_${xPos}_${i}`, {
        width: 0.25,
        height: stripeLength
      }, this.scene);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.set(xPos, 0.02, z);
      stripe.material = this.stripeMat;
      stripe.freezeWorldMatrix(); // optimization
    }
  }

  buildGantries() {
    const gantryPositions = [
      { z: 50, text: 'KM 0.0 : TOL JALAN DUTA (START)' },
      { z: 1200, text: 'KM 1.2 : RAWANG / SG BULOH' },
      { z: 2500, text: 'KM 2.5 : SHAH ALAM / SEREMBAN' },
      { z: 3800, text: 'KM 3.8 : AWAS - HAD LAJU 110 KM/J' },
      { z: 4700, text: 'KM 4.7 : 300M KE TOL AYER KEROH' }
    ];

    gantryPositions.forEach((g, idx) => {
      const gantryGroup = new BABYLON.TransformNode(`gantry_${idx}`, this.scene);
      gantryGroup.position.set(0, 0, g.z);

      // Support pillars
      const pillarL = BABYLON.MeshBuilder.CreateCylinder(`pillarL_${idx}`, { diameter: 0.5, height: 7 }, this.scene);
      pillarL.position.set(-this.roadWidth / 2 - 0.5, 3.5, 0);
      pillarL.material = this.guardrailMat;
      pillarL.parent = gantryGroup;

      const pillarR = BABYLON.MeshBuilder.CreateCylinder(`pillarR_${idx}`, { diameter: 0.5, height: 7 }, this.scene);
      pillarR.position.set(this.roadWidth / 2 + 0.5, 3.5, 0);
      pillarR.material = this.guardrailMat;
      pillarR.parent = gantryGroup;

      // Cross beam
      const beam = BABYLON.MeshBuilder.CreateBox(`beam_${idx}`, { width: this.roadWidth + 2, height: 0.5, depth: 0.5 }, this.scene);
      beam.position.set(0, 6.5, 0);
      beam.material = this.guardrailMat;
      beam.parent = gantryGroup;

      // Big Green Malaysian Highway Overhead Board
      const signBoard = BABYLON.MeshBuilder.CreateBox(`board_${idx}`, { width: 14, height: 2.2, depth: 0.2 }, this.scene);
      signBoard.position.set(0, 5.5, 0);
      signBoard.material = this.plusGreenMat;
      signBoard.parent = gantryGroup;
    });
  }

  buildPalmTrees() {
    // Spawn rows of low-poly oil palm trees along highway shoulders
    for (let z = 0; z < this.trackLength; z += 35) {
      this.createPalmTree(-16 - Math.random() * 8, z + Math.random() * 10);
      this.createPalmTree(16 + Math.random() * 8, z + Math.random() * 10);
    }
  }

  createPalmTree(x, z) {
    const tree = new BABYLON.TransformNode(`palm_${x}_${z}`, this.scene);
    tree.position.set(x, 0, z);

    // Trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', {
      diameterTop: 0.4,
      diameterBottom: 0.7,
      height: 6 + Math.random() * 2,
      tessellation: 6
    }, this.scene);
    trunk.position.y = 3.5;
    trunk.material = this.trunkMat;
    trunk.parent = tree;

    // Palm fronds
    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3;
      const frond = BABYLON.MeshBuilder.CreateBox('frond', {
        width: 0.8,
        height: 0.1,
        depth: 3.5
      }, this.scene);
      frond.position.set(Math.sin(angle) * 1.5, 6.8, Math.cos(angle) * 1.5);
      frond.rotation.y = angle;
      frond.rotation.x = 0.35;
      frond.material = this.frondMat;
      frond.parent = tree;
    }
  }

  buildTollPlaza() {
    // Point B: Ayer Keroh Toll Plaza at z = 5000
    const tollRoot = new BABYLON.TransformNode('toll_plaza_pointB', this.scene);
    tollRoot.position.set(0, 0, this.trackLength);

    // Giant yellow / red modern Toll Canopy roof
    const canopyMat = new BABYLON.StandardMaterial('canopyMat', this.scene);
    canopyMat.diffuseColor = new BABYLON.Color3(0.9, 0.7, 0.1);
    canopyMat.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0.02);

    const canopy = BABYLON.MeshBuilder.CreateBox('tollCanopy', {
      width: this.roadWidth + 8,
      height: 1.2,
      depth: 14
    }, this.scene);
    canopy.position.set(0, 7.5, 0);
    canopy.material = canopyMat;
    canopy.parent = tollRoot;

    // Toll booths dividing the lanes
    const boothMat = new BABYLON.StandardMaterial('boothMat', this.scene);
    boothMat.diffuseColor = new BABYLON.Color3(0.2, 0.25, 0.3);

    [-6, 0, 6].forEach((x, i) => {
      const booth = BABYLON.MeshBuilder.CreateBox(`booth_${i}`, {
        width: 1.6,
        height: 3.2,
        depth: 4.5
      }, this.scene);
      booth.position.set(x - 1.5, 1.6, 0);
      booth.material = boothMat;
      booth.parent = tollRoot;

      // Glowing Green Gate Bar
      const gateMat = new BABYLON.StandardMaterial(`gateMat_${i}`, this.scene);
      gateMat.emissiveColor = new BABYLON.Color3(0, 1, 0.4);

      const gate = BABYLON.MeshBuilder.CreateCylinder(`gate_${i}`, {
        diameter: 0.18,
        height: 3.2
      }, this.scene);
      gate.rotation.z = Math.PI / 2;
      gate.position.set(x, 1.2, 2.5);
      gate.material = gateMat;
      gate.parent = tollRoot;
    });

    // Big overhead Point B Banner
    const banner = BABYLON.MeshBuilder.CreateBox('tollBanner', {
      width: 18,
      height: 2.5,
      depth: 0.3
    }, this.scene);
    banner.position.set(0, 9.2, -6.5);
    banner.material = this.plusGreenMat;
    banner.parent = tollRoot;
  }
}
