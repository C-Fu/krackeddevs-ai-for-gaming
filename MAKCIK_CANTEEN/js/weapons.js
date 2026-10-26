/**
 * weapons.js - Fan Airflow Mechanics & Dry Ice Bomb Physics
 * Implements:
 * - Directional Wind stream particles & wind distortion cone
 * - Arc projectile physics for Dry Ice Canister
 * - Detonation frost shockwaves, freeze mist, and camera shake
 * - Mega Fan and Super Bomb power-up modifications
 */
class WeaponManager {
    constructor(scene, makcik, hazeManager, camera) {
        this.scene = scene;
        this.makcik = makcik;
        this.hazeManager = hazeManager;
        this.camera = camera;

        // Fan configuration
        this.isFanning = false;
        this.isMegaFan = false;
        this.fanRange = 10.5;
        this.fanConeAngle = (38 * Math.PI) / 180; // 38 degrees
        this.fanDamagePerSec = 75; // HP/sec

        // Wind particle system
        this.windPS = null;
        this.windConeMesh = null;
        this.initFanEffects();

        // Dry Ice Bomb configuration
        this.bombs = [];
        this.bombStock = 3;
        this.maxBombStock = 3;
        this.bombRechargeTimer = 0;
        this.bombRechargeTime = 3.2; // Seconds to recharge one bomb
        this.bombCooldown = 0; // Cooldown between throws
        this.isRapidBombMode = false;

        // Ground aim reticle
        this.targetReticle = null;
        this.aimGroundPos = new BABYLON.Vector3(0, 0.05, 0);
        this.initTargetReticle();
    }

    initFanEffects() {
        // Wind streak particle texture
        const windTex = new BABYLON.DynamicTexture("windTex", 128, this.scene, false);
        const ctx = windTex.getContext();
        const grad = ctx.createLinearGradient(0, 64, 128, 64);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.3, "rgba(230, 245, 255, 0.8)");
        grad.addColorStop(0.7, "rgba(200, 235, 255, 0.6)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 48, 128, 32);
        windTex.update();

        this.windPS = new BABYLON.ParticleSystem("fanWindPS", 200, this.scene);
        this.windPS.particleTexture = windTex;
        this.windPS.emitter = this.makcik.root;
        this.windPS.minEmitBox = new BABYLON.Vector3(-0.3, 1.4, 0.6);
        this.windPS.maxEmitBox = new BABYLON.Vector3(0.3, 1.8, 1.0);

        this.windPS.color1 = new BABYLON.Color4(0.9, 0.98, 1.0, 0.7);
        this.windPS.color2 = new BABYLON.Color4(0.7, 0.9, 1.0, 0.4);
        this.windPS.colorDead = new BABYLON.Color4(1.0, 1.0, 1.0, 0.0);

        this.windPS.minSize = 0.5;
        this.windPS.maxSize = 1.6;
        this.windPS.minLifeTime = 0.18;
        this.windPS.maxLifeTime = 0.35;
        this.windPS.emitRate = 0; // Activated when fanning
        this.windPS.minEmitPower = 16.0;
        this.windPS.maxEmitPower = 25.0;
        this.windPS.start();

        // Stylized visual cone mesh for wind blast boundary
        this.windConeMesh = BABYLON.MeshBuilder.CreateCylinder("windCone", {
            diameterTop: 0.8,
            diameterBottom: 6.5,
            height: 10.5,
            tessellation: 16
        }, this.scene);
        this.windConeMesh.parent = this.makcik.root;
        this.windConeMesh.position.set(0, 1.6, 5.5);
        this.windConeMesh.rotation.x = Math.PI / 2;

        const coneMat = new BABYLON.StandardMaterial("coneMat", this.scene);
        coneMat.diffuseColor = new BABYLON.Color3(0.6, 0.85, 1.0);
        coneMat.emissiveColor = new BABYLON.Color3(0.3, 0.6, 0.9);
        coneMat.alpha = 0.0; // Hidden by default
        coneMat.backFaceCulling = false;
        this.windConeMesh.material = coneMat;
    }

    initTargetReticle() {
        this.targetReticle = BABYLON.MeshBuilder.CreateDisc("aimReticle", {
            radius: 1.8,
            tessellation: 32
        }, this.scene);
        this.targetReticle.rotation.x = Math.PI / 2;
        this.targetReticle.position.set(0, 0.08, 0);

        // Circular glow target texture
        const retTex = new BABYLON.DynamicTexture("retTex", 128, this.scene, false);
        const ctx = retTex.getContext();
        ctx.clearRect(0, 0, 128, 128);

        // Outer ring
        ctx.strokeStyle = "#00d2ff";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(64, 64, 56, 0, Math.PI * 2);
        ctx.stroke();

        // Center crosshair
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(64, 20); ctx.lineTo(64, 108);
        ctx.moveTo(20, 64); ctx.lineTo(108, 64);
        ctx.stroke();

        // Inner circle
        ctx.fillStyle = "rgba(0, 210, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(64, 64, 28, 0, Math.PI * 2);
        ctx.fill();

        retTex.update();

        const retMat = new BABYLON.StandardMaterial("retMat", this.scene);
        retMat.diffuseTexture = retTex;
        retMat.emissiveColor = new BABYLON.Color3(0.4, 0.8, 1.0);
        retMat.opacityTexture = retTex;
        retMat.backFaceCulling = false;
        this.targetReticle.material = retMat;
    }

    setAimGroundPoint(point) {
        if (!point) return;
        this.aimGroundPos.copyFrom(point);
        this.targetReticle.position.x = point.x;
        this.targetReticle.position.z = point.z;
    }

    // Set Fan state (active when holding spacebar or mouse right button)
    setFanning(active) {
        if (this.isFanning === active) return;
        this.isFanning = active;
        this.makcik.isFanning = active;

        if (active) {
            window.GameSound.startFan(this.isMegaFan);
            this.windPS.emitRate = this.isMegaFan ? 350 : 200;
            this.windConeMesh.material.alpha = this.isMegaFan ? 0.28 : 0.14;
        } else {
            window.GameSound.stopFan();
            this.windPS.emitRate = 0;
            this.windConeMesh.material.alpha = 0.0;
        }
    }

    setMegaFanMode(enabled) {
        this.isMegaFan = enabled;
        this.makcik.isMegaFan = enabled;

        if (enabled) {
            this.fanRange = 16.0;
            this.fanConeAngle = (75 * Math.PI) / 180; // 75 degrees wide!
            this.fanDamagePerSec = 220; // 3x damage!
            this.windConeMesh.scaling.set(2.2, 1.5, 2.2);
            this.windConeMesh.material.emissiveColor = new BABYLON.Color3(1.0, 0.85, 0.2); // Golden hurricane
            this.windPS.color1 = new BABYLON.Color4(1.0, 0.9, 0.4, 0.8);
        } else {
            this.fanRange = 10.5;
            this.fanConeAngle = (38 * Math.PI) / 180;
            this.fanDamagePerSec = 75;
            this.windConeMesh.scaling.set(1.0, 1.0, 1.0);
            this.windConeMesh.material.emissiveColor = new BABYLON.Color3(0.3, 0.6, 0.9);
            this.windPS.color1 = new BABYLON.Color4(0.9, 0.98, 1.0, 0.7);
        }

        if (this.isFanning) {
            this.windPS.emitRate = enabled ? 350 : 200;
            this.windConeMesh.material.alpha = enabled ? 0.28 : 0.14;
            window.GameSound.startFan(enabled);
        }
    }

    // Throw Dry Ice Bomb towards target location
    throwDryIceBomb(targetPos = null) {
        if (this.bombCooldown > 0) return false;
        if (this.bombStock <= 0) return false;

        const target = targetPos || this.aimGroundPos;
        const startPos = this.makcik.root.position.clone().add(new BABYLON.Vector3(0, 2.0, 0));

        // Consume stock (or infinite if rapid bomb power-up)
        if (!this.isRapidBombMode) {
            this.bombStock--;
        }
        this.bombCooldown = this.isRapidBombMode ? 0.2 : 0.65;

        // Create 3D Bomb mesh (Dry ice canister with glowing frost ring)
        const canister = BABYLON.MeshBuilder.CreateCylinder("dryIceCanister", {
            diameter: 0.65,
            height: 1.1,
            tessellation: 16
        }, this.scene);
        canister.position.copyFrom(startPos);

        const canMat = new BABYLON.StandardMaterial("canMat", this.scene);
        canMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.9);
        canMat.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.7);
        canister.material = canMat;

        // Canister lid
        const lid = BABYLON.MeshBuilder.CreateCylinder("canLid", { diameter: 0.75, height: 0.2 }, this.scene);
        lid.parent = canister;
        lid.position.y = 0.55;
        const lidMat = new BABYLON.StandardMaterial("lidMat", this.scene);
        lidMat.diffuseColor = new BABYLON.Color3(0.9, 0.95, 1.0);
        lid.material = lidMat;

        // Trailing frost trail particles
        const trailPS = new BABYLON.ParticleSystem("bombTrail", 40, this.scene);
        trailPS.particleTexture = this.hazeManager.iceSparkleTexture;
        trailPS.emitter = canister;
        trailPS.color1 = new BABYLON.Color4(0.8, 0.95, 1.0, 0.8);
        trailPS.color2 = new BABYLON.Color4(0.4, 0.75, 1.0, 0.4);
        trailPS.colorDead = new BABYLON.Color4(0.2, 0.5, 0.9, 0.0);
        trailPS.minSize = 0.25;
        trailPS.maxSize = 0.5;
        trailPS.minLifeTime = 0.15;
        trailPS.maxLifeTime = 0.35;
        trailPS.emitRate = 45;
        trailPS.start();

        // Calculate ballistic trajectory velocity
        const deltaX = target.x - startPos.x;
        const deltaZ = target.z - startPos.z;
        const dist = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

        // Flight time based on distance (clamped)
        const flightTime = Math.max(0.45, Math.min(1.0, dist / 18.0));
        const gravity = -26.0;

        const vx = deltaX / flightTime;
        const vz = deltaZ / flightTime;
        const vy = (0.3 - startPos.y - 0.5 * gravity * flightTime * flightTime) / flightTime;

        const bombObj = {
            mesh: canister,
            trailPS,
            pos: startPos,
            vel: new BABYLON.Vector3(vx, vy, vz),
            gravity,
            bouncesLeft: 1,
            timeAlive: 0,
            isExploded: false,
            blastRadius: this.isRapidBombMode ? 8.5 : 6.2,
            blastDamage: this.isRapidBombMode ? 250 : 160
        };

        this.bombs.push(bombObj);
        window.GameSound.playThrow();

        // Makcik humorous shout chance
        if (Math.random() < 0.25) {
            const quips = ["Ambil ais kering ni!", "Sejuk beku!", "Kering terus jerebu!", "Rasa bom ais ni!"];
            const phrase = quips[Math.floor(Math.random() * quips.length)];
            window.GameSound.speak(phrase, window.triggerMakcikBubble);
        }

        return true;
    }

    // Detonate Dry Ice Canister
    detonateBomb(bomb) {
        if (bomb.isExploded) return;
        bomb.isExploded = true;

        const blastCenter = bomb.mesh.position.clone();

        // Clean up bomb mesh and trail
        bomb.trailPS.stop();
        setTimeout(() => bomb.trailPS.dispose(), 400);
        bomb.mesh.dispose();

        // 1. Audio sound
        window.GameSound.playBombExplosion();

        // 2. Camera screen shake
        this.triggerCameraShake(0.35);

        // 3. Expanding Frost Shockwave Torus Ring
        const shockRing = BABYLON.MeshBuilder.CreateTorus("shockRing", {
            diameter: 1.0,
            thickness: 0.25,
            tessellation: 32
        }, this.scene);
        shockRing.position.copyFrom(blastCenter);
        shockRing.position.y = 0.25;

        const ringMat = new BABYLON.StandardMaterial("ringMat", this.scene);
        ringMat.emissiveColor = new BABYLON.Color3(0.5, 0.9, 1.0);
        ringMat.diffuseColor = new BABYLON.Color3(0.8, 0.95, 1.0);
        ringMat.alpha = 0.9;
        shockRing.material = ringMat;

        // Animate shockwave expanding & fading
        const ringAnim = new BABYLON.Animation(
            "ringScale", "scaling", 60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        const keys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 22, value: new BABYLON.Vector3(bomb.blastRadius * 2.2, 1, bomb.blastRadius * 2.2) }
        ];
        ringAnim.setKeys(keys);
        shockRing.animations.push(ringAnim);
        this.scene.beginAnimation(shockRing, 0, 22, false, 1.0, () => {
            shockRing.dispose();
        });

        // 4. Large Freeze Mist & Cryogenic Sparkle Particle Explosion
        const blastPS = new BABYLON.ParticleSystem("blastPS", 120, this.scene);
        blastPS.particleTexture = this.hazeManager.iceSparkleTexture;
        blastPS.emitter = blastCenter;
        blastPS.minEmitBox = new BABYLON.Vector3(-0.6, 0.1, -0.6);
        blastPS.maxEmitBox = new BABYLON.Vector3(0.6, 1.2, 0.6);

        blastPS.color1 = new BABYLON.Color4(0.9, 0.98, 1.0, 1.0);
        blastPS.color2 = new BABYLON.Color4(0.4, 0.8, 1.0, 0.8);
        blastPS.colorDead = new BABYLON.Color4(0.1, 0.4, 0.9, 0.0);

        blastPS.minSize = 0.8;
        blastPS.maxSize = 2.4;
        blastPS.minLifeTime = 0.4;
        blastPS.maxLifeTime = 0.85;
        blastPS.manualEmitCount = 90;
        blastPS.minEmitPower = 5.0;
        blastPS.maxEmitPower = 12.0;
        blastPS.targetStopDuration = 0.6;
        blastPS.disposeOnStop = true;
        blastPS.start();

        // 5. Apply blast damage & clear haze clusters in AOE
        this.hazeManager.applyDryIceBlast(blastCenter, bomb.blastRadius, bomb.blastDamage);
    }

    triggerCameraShake(intensity = 0.3) {
        if (!this.camera) return;
        const initialAlpha = this.camera.alpha;
        const initialBeta = this.camera.beta;
        let shakeFrames = 12;

        const shakeObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (shakeFrames > 0) {
                const decay = shakeFrames / 12;
                this.camera.alpha = initialAlpha + (Math.random() - 0.5) * intensity * 0.05 * decay;
                this.camera.beta = initialBeta + (Math.random() - 0.5) * intensity * 0.03 * decay;
                shakeFrames--;
            } else {
                this.camera.alpha = initialAlpha;
                this.camera.beta = initialBeta;
                this.scene.onBeforeRenderObservable.remove(shakeObserver);
            }
        });
    }

    update(delta) {
        // 1. Bomb cooldown & recharge tick
        if (this.bombCooldown > 0) {
            this.bombCooldown -= delta;
        }

        if (this.bombStock < this.maxBombStock) {
            this.bombRechargeTimer += delta;
            if (this.bombRechargeTimer >= this.bombRechargeTime) {
                this.bombStock++;
                this.bombRechargeTimer = 0;
            }
        } else {
            this.bombRechargeTimer = 0;
        }

        // 2. Active Fan Wind Processing
        if (this.isFanning) {
            const fanPos = this.makcik.getFanNozzlePosition();
            const fanForward = this.makcik.getForwardVector();

            // Direct wind particles forward
            this.windPS.direction1 = fanForward.scale(1.2).add(new BABYLON.Vector3(-0.3, -0.1, -0.3));
            this.windPS.direction2 = fanForward.scale(1.2).add(new BABYLON.Vector3(0.3, 0.2, 0.3));

            // Apply wind dispersal to haze clusters
            this.hazeManager.applyFanWind(
                fanPos,
                fanForward,
                this.fanConeAngle,
                this.fanRange,
                this.fanDamagePerSec,
                delta
            );
        }

        // 3. Update Projectile Physics for active Dry Ice Bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const b = this.bombs[i];
            if (b.isExploded) {
                this.bombs.splice(i, 1);
                continue;
            }

            b.timeAlive += delta;
            b.vel.y += b.gravity * delta;

            b.pos.x += b.vel.x * delta;
            b.pos.y += b.vel.y * delta;
            b.pos.z += b.vel.z * delta;

            b.mesh.position.copyFrom(b.pos);
            b.mesh.rotation.x += delta * 14.0;
            b.mesh.rotation.z += delta * 8.0;

            // Ground impact check
            if (b.pos.y <= 0.4) {
                b.pos.y = 0.4;
                if (b.bouncesLeft > 0) {
                    b.bouncesLeft--;
                    b.vel.y = -b.vel.y * 0.38; // Bounce with dampening
                    b.vel.x *= 0.6;
                    b.vel.z *= 0.6;
                    window.GameSound.playBounce();
                } else {
                    // Detonate!
                    this.detonateBomb(b);
                    this.bombs.splice(i, 1);
                }
            }
        }

        // Reticle gentle pulse
        if (this.targetReticle) {
            const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.08;
            this.targetReticle.scaling.set(pulse, 1.0, pulse);
        }
    }
}

window.WeaponManager = WeaponManager;
