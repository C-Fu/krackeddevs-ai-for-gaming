/**
 * powerups.js - Dynamic Canteen Power-up Spawner
 * Spawns 3 distinctive items:
 * 1. MEGA_FAN: Golden turbo blower with hurricane wind cone
 * 2. ICE_CRATE: Rapid-fire Cryogenic Dry Ice Bombs
 * 3. KOPI_O: Kopi O Kaw / Milo Dinosaur Speed Boost
 */
class PowerupManager {
    constructor(scene, makcik, weaponManager) {
        this.scene = scene;
        this.makcik = makcik;
        this.weaponManager = weaponManager;

        this.activePickups = [];
        this.spawnTimer = 4.0; // First powerup spawns early (4s)
        this.spawnInterval = 13.0; // Then every 13s

        // Active Buff Timers
        this.activeBuffs = {
            megaFan: 0,
            iceCrate: 0,
            kopiO: 0
        };

        this.onBuffChanged = null; // Callback for UI HUD updates
    }

    spawnPowerup() {
        if (this.activePickups.length >= 3) return;

        const types = ["MEGA_FAN", "ICE_CRATE", "KOPI_O"];
        const type = types[Math.floor(Math.random() * types.length)];

        // Choose random floor spot inside canteen
        const spawnX = (Math.random() - 0.5) * 32;
        const spawnZ = (Math.random() - 0.5) * 22;
        const pos = new BABYLON.Vector3(spawnX, 1.2, spawnZ);

        const node = new BABYLON.TransformNode(`pickup_${Date.now()}`, this.scene);
        node.position.copyFrom(pos);

        let mesh = null;
        let ringColor = null;

        if (type === "MEGA_FAN") {
            mesh = BABYLON.MeshBuilder.CreateTorus("pFan", { diameter: 1.1, thickness: 0.2 }, this.scene);
            const mMat = new BABYLON.StandardMaterial("pFanMat", this.scene);
            mMat.emissiveColor = new BABYLON.Color3(1.0, 0.8, 0.1);
            mesh.material = mMat;
            ringColor = new BABYLON.Color3(1.0, 0.8, 0.0);
        } else if (type === "ICE_CRATE") {
            mesh = BABYLON.MeshBuilder.CreateBox("pIce", { size: 0.9 }, this.scene);
            const mMat = new BABYLON.StandardMaterial("pIceMat", this.scene);
            mMat.emissiveColor = new BABYLON.Color3(0.2, 0.7, 1.0);
            mesh.material = mMat;
            ringColor = new BABYLON.Color3(0.1, 0.8, 1.0);
        } else { // KOPI_O
            mesh = BABYLON.MeshBuilder.CreateCylinder("pKopi", { diameter: 0.7, height: 0.9 }, this.scene);
            const mMat = new BABYLON.StandardMaterial("pKopiMat", this.scene);
            mMat.emissiveColor = new BABYLON.Color3(0.9, 0.45, 0.1);
            mesh.material = mMat;
            ringColor = new BABYLON.Color3(1.0, 0.5, 0.1);
        }

        mesh.parent = node;

        // Glowing floor ring
        const groundRing = BABYLON.MeshBuilder.CreateTorus("groundRing", {
            diameter: 1.6,
            thickness: 0.1,
            tessellation: 24
        }, this.scene);
        groundRing.parent = node;
        groundRing.position.y = -1.1;

        const ringMat = new BABYLON.StandardMaterial("ringMat", this.scene);
        ringMat.emissiveColor = ringColor;
        ringMat.diffuseColor = ringColor;
        groundRing.material = ringMat;

        const pickupObj = {
            type,
            node,
            mesh,
            groundRing,
            pos,
            initialY: pos.y,
            timer: 0,
            isCollected: false
        };

        this.activePickups.push(pickupObj);
    }

    collect(pickup) {
        if (pickup.isCollected) return;
        pickup.isCollected = true;

        window.GameSound.playPowerup();

        if (pickup.type === "MEGA_FAN") {
            this.activeBuffs.megaFan = 9.0;
            this.weaponManager.setMegaFanMode(true);
            window.GameSound.speak("Kipas helikopter jalan! Bersih jerebu!", window.triggerMakcikBubble);
        } else if (pickup.type === "ICE_CRATE") {
            this.activeBuffs.iceCrate = 8.0;
            this.weaponManager.isRapidBombMode = true;
            this.weaponManager.bombStock = 3;
            window.GameSound.speak("Ais kering ekstra! Habis korang!", window.triggerMakcikBubble);
        } else if (pickup.type === "KOPI_O") {
            this.activeBuffs.kopiO = 10.0;
            this.makcik.currentSpeedMultiplier = 1.7;
            window.GameSound.speak("Minum Kopi O Kaw! Laju Makcik lari!", window.triggerMakcikBubble);
        }

        if (this.onBuffChanged) {
            this.onBuffChanged(this.activeBuffs);
        }

        pickup.mesh.dispose();
        pickup.groundRing.dispose();
        pickup.node.dispose();
    }

    update(delta) {
        // 1. Spawning timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPowerup();
            this.spawnTimer = 0;
        }

        // 2. Active Pickups Animation & Collision Check with Makcik
        const playerPos = this.makcik.position;

        for (let i = this.activePickups.length - 1; i >= 0; i--) {
            const p = this.activePickups[i];
            if (p.isCollected) {
                this.activePickups.splice(i, 1);
                continue;
            }

            p.timer += delta;
            p.mesh.rotation.y += delta * 3.0;
            p.mesh.rotation.x += delta * 1.5;
            p.mesh.position.y = Math.sin(p.timer * 3.5) * 0.25;

            // Check distance to Makcik
            const dist = BABYLON.Vector3.Distance(playerPos, p.node.position);
            if (dist < 2.0) {
                this.collect(p);
                this.activePickups.splice(i, 1);
            }
        }

        // 3. Update active buff countdowns
        let stateChanged = false;

        if (this.activeBuffs.megaFan > 0) {
            this.activeBuffs.megaFan -= delta;
            if (this.activeBuffs.megaFan <= 0) {
                this.activeBuffs.megaFan = 0;
                this.weaponManager.setMegaFanMode(false);
                stateChanged = true;
            }
        }

        if (this.activeBuffs.iceCrate > 0) {
            this.activeBuffs.iceCrate -= delta;
            if (this.activeBuffs.iceCrate <= 0) {
                this.activeBuffs.iceCrate = 0;
                this.weaponManager.isRapidBombMode = false;
                stateChanged = true;
            }
        }

        if (this.activeBuffs.kopiO > 0) {
            this.activeBuffs.kopiO -= delta;
            if (this.activeBuffs.kopiO <= 0) {
                this.activeBuffs.kopiO = 0;
                this.makcik.currentSpeedMultiplier = 1.0;
                stateChanged = true;
            }
        }

        if (stateChanged && this.onBuffChanged) {
            this.onBuffChanged(this.activeBuffs);
        }
    }

    reset() {
        this.activePickups.forEach(p => {
            if (p.mesh) p.mesh.dispose();
            if (p.groundRing) p.groundRing.dispose();
            if (p.node) p.node.dispose();
        });
        this.activePickups = [];
        this.activeBuffs = { megaFan: 0, iceCrate: 0, kopiO: 0 };
        this.weaponManager.setMegaFanMode(false);
        this.weaponManager.isRapidBombMode = false;
        this.makcik.currentSpeedMultiplier = 1.0;
        this.spawnTimer = 4.0;
    }
}

window.PowerupManager = PowerupManager;
