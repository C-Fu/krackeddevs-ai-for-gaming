/**
 * haze.js - Dynamic Haze System & Volumetric Particle Clouds
 * Manages scene atmospheric fog, 30+ interactive haze clusters,
 * particle smoke effects, wind physics pushback, and API / PSI air quality calculations.
 */
class HazeManager {
    constructor(scene) {
        this.scene = scene;
        this.clusters = [];
        this.totalInitialHaze = 0;
        this.remainingHaze = 0;
        this.hazePercentage = 100;
        this.apiValue = 385; // Initial hazardous API index
        this.hazeTexture = null;
        this.iceSparkleTexture = null;

        this.initFog();
        this.initTextures();
    }

    initFog() {
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogColor = new BABYLON.Color3(0.72, 0.62, 0.48); // Classic Malaysian haze smog color
        this.scene.fogDensity = 0.042; // Thick haze
    }

    initTextures() {
        // Procedural soft cloud smoke texture
        this.hazeTexture = new BABYLON.DynamicTexture("hazeTex", 128, this.scene, false);
        const ctx = this.hazeTexture.getContext();
        const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
        grad.addColorStop(0, "rgba(210, 195, 175, 0.85)");
        grad.addColorStop(0.4, "rgba(180, 165, 145, 0.5)");
        grad.addColorStop(0.8, "rgba(150, 140, 130, 0.2)");
        grad.addColorStop(1, "rgba(150, 140, 130, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        this.hazeTexture.update();

        // Ice sparkle texture for bomb dispersion
        this.iceSparkleTexture = new BABYLON.DynamicTexture("iceTex", 64, this.scene, false);
        const ictx = this.iceSparkleTexture.getContext();
        const igrad = ictx.createRadialGradient(32, 32, 2, 32, 32, 28);
        igrad.addColorStop(0, "rgba(220, 245, 255, 1.0)");
        igrad.addColorStop(0.5, "rgba(130, 210, 255, 0.7)");
        igrad.addColorStop(1, "rgba(50, 150, 255, 0)");
        ictx.fillStyle = igrad;
        ictx.fillRect(0, 0, 64, 64);
        this.iceSparkleTexture.update();
    }

    spawnHazeClusters(count = 32) {
        // Clear previous if any
        this.clearAll();

        const spawnLocations = [
            // Across canteen floor, around tables and stalls
            [-16, -11], [-10, -12], [-4, -10], [4, -12], [10, -11], [16, -12],
            [-18, -4], [-12, -3], [-6, -4], [0, -4], [6, -3], [12, -4], [18, -3],
            [-16, 3], [-10, 4], [-4, 3], [4, 4], [10, 3], [16, 4],
            [-15, 10], [-8, 9], [0, 9], [8, 10], [15, 9],
            [-18, -8], [18, -8], [-12, 12], [12, 12],
            [-2, -7], [3, -7], [-2, 0], [2, 0]
        ];

        spawnLocations.slice(0, count).forEach((loc, idx) => {
            const jitterX = (Math.random() - 0.5) * 1.5;
            const jitterZ = (Math.random() - 0.5) * 1.5;
            const pos = new BABYLON.Vector3(loc[0] + jitterX, 1.6 + Math.random() * 1.2, loc[1] + jitterZ);

            this.createCluster(idx, pos);
        });

        this.totalInitialHaze = this.clusters.length;
        this.remainingHaze = this.totalInitialHaze;
        this.updateHazeStats();
    }

    createCluster(id, position) {
        // Anchor node
        const anchor = new BABYLON.TransformNode(`hazeCluster_${id}`, this.scene);
        anchor.position.copyFrom(position);

        // Core soft billowy sphere for visual density
        const coreMat = new BABYLON.StandardMaterial(`coreMat_${id}`, this.scene);
        coreMat.diffuseColor = new BABYLON.Color3(0.78, 0.72, 0.60);
        coreMat.emissiveColor = new BABYLON.Color3(0.2, 0.18, 0.14);
        coreMat.alpha = 0.55;
        coreMat.backFaceCulling = false;

        const coreMesh = BABYLON.MeshBuilder.CreateSphere(`cloudMesh_${id}`, {
            diameter: 2.2 + Math.random() * 0.8,
            segments: 8
        }, this.scene);
        coreMesh.parent = anchor;
        coreMesh.material = coreMat;

        // Swirling puff particle system
        const ps = new BABYLON.ParticleSystem(`hazePS_${id}`, 60, this.scene);
        ps.particleTexture = this.hazeTexture;
        ps.emitter = anchor;
        ps.minEmitBox = new BABYLON.Vector3(-1.0, -0.4, -1.0);
        ps.maxEmitBox = new BABYLON.Vector3(1.0, 0.6, 1.0);

        ps.color1 = new BABYLON.Color4(0.78, 0.72, 0.62, 0.65);
        ps.color2 = new BABYLON.Color4(0.70, 0.64, 0.55, 0.45);
        ps.colorDead = new BABYLON.Color4(0.65, 0.60, 0.50, 0.0);

        ps.minSize = 1.6;
        ps.maxSize = 2.8;
        ps.minLifeTime = 1.0;
        ps.maxLifeTime = 2.2;
        ps.emitRate = 18;
        ps.minAngularSpeed = -0.4;
        ps.maxAngularSpeed = 0.4;
        ps.minEmitPower = 0.1;
        ps.maxEmitPower = 0.4;
        ps.gravity = new BABYLON.Vector3(0, 0.08, 0); // Gentle updraft
        ps.start();

        const cluster = {
            id,
            node: anchor,
            coreMesh,
            coreMat,
            ps,
            position: anchor.position,
            radius: 2.4,
            maxHp: 100,
            hp: 100,
            isAlive: true,
            floatSeed: Math.random() * Math.PI * 2,
            velocity: new BABYLON.Vector3(0, 0, 0)
        };

        this.clusters.push(cluster);
    }

    // Apply wind force and damage from Fan
    applyFanWind(fanPos, fanForward, coneAngleRad, maxRange, damagePerSec, delta) {
        let clearedAny = false;

        for (let i = 0; i < this.clusters.length; i++) {
            const c = this.clusters[i];
            if (!c.isAlive) continue;

            const toCluster = c.position.subtract(fanPos);
            const dist = toCluster.length();

            if (dist <= maxRange + c.radius) {
                const dir = toCluster.clone().normalize();
                const dot = BABYLON.Vector3.Dot(fanForward, dir);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

                if (angle <= coneAngleRad) {
                    // Inside the fan wind cone!
                    const distanceFalloff = Math.max(0.3, 1.0 - (dist / maxRange) * 0.7);
                    const damage = damagePerSec * distanceFalloff * delta;
                    c.hp -= damage;

                    // Push cluster back with wind impulse
                    const pushForce = (8.0 * delta) * distanceFalloff;
                    c.velocity.addInPlace(fanForward.scale(pushForce));

                    // Scale down core mesh as health drops
                    const hpRatio = Math.max(0.1, c.hp / c.maxHp);
                    c.coreMesh.scaling.set(hpRatio, hpRatio, hpRatio);
                    c.coreMat.alpha = 0.55 * hpRatio;

                    if (c.hp <= 0) {
                        this.destroyCluster(c, "WIND");
                        clearedAny = true;
                    }
                }
            }
        }

        if (clearedAny) {
            this.updateHazeStats();
        }

        return clearedAny;
    }

    // Apply Area-of-Effect shockwave from Dry Ice Bomb
    applyDryIceBlast(blastCenter, blastRadius, blastDamage = 150) {
        let countDestroyed = 0;

        for (let i = 0; i < this.clusters.length; i++) {
            const c = this.clusters[i];
            if (!c.isAlive) continue;

            const dist = BABYLON.Vector3.Distance(c.position, blastCenter);
            if (dist <= blastRadius + c.radius) {
                const ratio = Math.max(0.4, 1.0 - dist / blastRadius);
                c.hp -= blastDamage * ratio;

                // Push outward from bomb blast center
                const pushDir = c.position.subtract(blastCenter).normalize();
                c.velocity.addInPlace(pushDir.scale(12.0 * ratio));

                const hpRatio = Math.max(0.1, c.hp / c.maxHp);
                c.coreMesh.scaling.set(hpRatio, hpRatio, hpRatio);

                if (c.hp <= 0) {
                    this.destroyCluster(c, "ICE");
                    countDestroyed++;
                }
            }
        }

        if (countDestroyed > 0) {
            this.updateHazeStats();
        }

        return countDestroyed;
    }

    destroyCluster(cluster, method = "WIND") {
        if (!cluster.isAlive) return;
        cluster.isAlive = false;

        // Stop smoke emission
        cluster.ps.stop();

        // Spawn explosive dispersion particles
        if (method === "ICE") {
            this.spawnIceShatterParticles(cluster.position);
        } else {
            this.spawnPuffDispersalParticles(cluster.position);
        }

        // Hide and dispose core mesh
        cluster.coreMesh.dispose();

        // Sound cue
        window.GameSound.playHazeCleared();

        setTimeout(() => {
            cluster.ps.dispose();
            cluster.node.dispose();
        }, 1200);

        this.remainingHaze--;
    }

    // Ice crystals freeze and shatter explosion
    spawnIceShatterParticles(pos) {
        const icePS = new BABYLON.ParticleSystem("iceShatter", 70, this.scene);
        icePS.particleTexture = this.iceSparkleTexture;
        icePS.emitter = pos;
        icePS.minEmitBox = new BABYLON.Vector3(-0.3, -0.3, -0.3);
        icePS.maxEmitBox = new BABYLON.Vector3(0.3, 0.3, 0.3);

        icePS.color1 = new BABYLON.Color4(0.8, 0.95, 1.0, 1.0);
        icePS.color2 = new BABYLON.Color4(0.3, 0.8, 1.0, 0.8);
        icePS.colorDead = new BABYLON.Color4(0.1, 0.4, 0.8, 0.0);

        icePS.minSize = 0.4;
        icePS.maxSize = 0.9;
        icePS.minLifeTime = 0.4;
        icePS.maxLifeTime = 0.9;
        icePS.emitRate = 400;
        icePS.manualEmitCount = 50;
        icePS.minEmitPower = 3.0;
        icePS.maxEmitPower = 7.0;
        icePS.gravity = new BABYLON.Vector3(0, -6.0, 0);
        icePS.targetStopDuration = 0.5;
        icePS.disposeOnStop = true;
        icePS.start();
    }

    // Wind gust dispersal puff
    spawnPuffDispersalParticles(pos) {
        const puffPS = new BABYLON.ParticleSystem("puffDisperse", 40, this.scene);
        puffPS.particleTexture = this.hazeTexture;
        puffPS.emitter = pos;

        puffPS.color1 = new BABYLON.Color4(0.85, 0.85, 0.80, 0.6);
        puffPS.color2 = new BABYLON.Color4(0.9, 0.9, 0.85, 0.2);
        puffPS.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, 0.0);

        puffPS.minSize = 1.0;
        puffPS.maxSize = 2.4;
        puffPS.minLifeTime = 0.3;
        puffPS.maxLifeTime = 0.6;
        puffPS.manualEmitCount = 25;
        puffPS.minEmitPower = 2.0;
        puffPS.maxEmitPower = 5.0;
        puffPS.targetStopDuration = 0.4;
        puffPS.disposeOnStop = true;
        puffPS.start();
    }

    updateHazeStats() {
        if (this.totalInitialHaze === 0) return;
        this.hazePercentage = Math.round((this.remainingHaze / this.totalInitialHaze) * 100);

        // Dynamically adjust scene fog density and color
        // From thick brown smog (0.042) to crisp clear air (0.002)
        const ratio = this.remainingHaze / this.totalInitialHaze;
        this.scene.fogDensity = 0.002 + ratio * 0.040;

        // Shift fog color towards clean daylight as haze clears
        this.scene.fogColor = BABYLON.Color3.Lerp(
            new BABYLON.Color3(0.95, 0.97, 1.0), // Clean air
            new BABYLON.Color3(0.72, 0.62, 0.48), // Smog
            ratio
        );

        // Calculate API (Air Pollutant Index / PSI)
        // 0% haze = 25 (Clean), 100% haze = 385 (Hazardous)
        this.apiValue = Math.round(25 + ratio * 360);
    }

    getHazeStatus() {
        if (this.apiValue <= 50) {
            return { label: "BAIK (CLEAN & FRESH)", color: "#2ecc71" };
        } else if (this.apiValue <= 100) {
            return { label: "SEDERHANA (MODERATE)", color: "#f1c40f" };
        } else if (this.apiValue <= 200) {
            return { label: "TIDAK SIHAT (UNHEALTHY)", color: "#e67e22" };
        } else if (this.apiValue <= 300) {
            return { label: "SANGAT TIDAK SIHAT", color: "#e74c3c" };
        } else {
            return { label: "BERBAHAYA (HAZARDOUS)", color: "#8e44ad" };
        }
    }

    update(delta) {
        const time = Date.now() * 0.0015;

        for (let i = 0; i < this.clusters.length; i++) {
            const c = this.clusters[i];
            if (!c.isAlive) continue;

            // Idle floating bob
            const floatY = Math.sin(time + c.floatSeed) * 0.006;
            c.position.y += floatY;

            // Damping velocity from wind impulses
            if (c.velocity.lengthSquared() > 0.001) {
                c.position.addInPlace(c.velocity.scale(delta));
                c.velocity.scaleInPlace(Math.max(0, 1.0 - delta * 4.0));

                // Clamp to canteen walls
                c.position.x = Math.max(-21, Math.min(21, c.position.x));
                c.position.z = Math.max(-16, Math.min(16, c.position.z));
            }
        }
    }

    clearAll() {
        this.clusters.forEach(c => {
            if (c.ps) c.ps.dispose();
            if (c.coreMesh) c.coreMesh.dispose();
            if (c.node) c.node.dispose();
        });
        this.clusters = [];
    }
}

window.HazeManager = HazeManager;
