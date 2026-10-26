/**
 * makcik.js - Stylized 3D Makcik Canteen Character
 * Features:
 * - Cartoony Malaysian Makcik model with colorful tudung & apron
 * - Industrial handheld blower fan with rotating blades
 * - Smooth WASD / touch movement with waddling walk cycle
 * - Aim towards cursor / movement direction
 * - Speed boost mode with footstep dust effects
 */
class MakcikPlayer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.root = null;
        this.bodyMesh = null;
        this.fanBlades = null;
        this.fanMesh = null;
        this.dustParticles = null;

        this.position = new BABYLON.Vector3(0, 0, -10);
        this.moveSpeed = 12.0;
        this.currentSpeedMultiplier = 1.0;
        this.rotationY = 0;
        this.targetRotationY = 0;

        this.isMoving = false;
        this.isFanning = false;
        this.isMegaFan = false;
        this.walkTimer = 0;

        // Bounding bounds for canteen
        this.minX = -21;
        this.maxX = 21;
        this.minZ = -16;
        this.maxZ = 15;
    }

    build() {
        this.root = new BABYLON.TransformNode("makcikRoot", this.scene);
        this.root.position.copyFrom(this.position);

        // Body Pivot (for walk wobble/bobbing)
        this.bodyMesh = new BABYLON.TransformNode("makcikBodyNode", this.scene);
        this.bodyMesh.parent = this.root;

        // Materials
        const skinMat = new BABYLON.StandardMaterial("skinMat", this.scene);
        skinMat.diffuseColor = new BABYLON.Color3(0.96, 0.76, 0.62); // Warm skin tone

        const tudungMat = new BABYLON.StandardMaterial("tudungMat", this.scene);
        tudungMat.diffuseColor = new BABYLON.Color3(0.12, 0.65, 0.60); // Vibrant teal tudung
        tudungMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const bajuMat = new BABYLON.StandardMaterial("bajuMat", this.scene);
        bajuMat.diffuseColor = new BABYLON.Color3(0.85, 0.35, 0.55); // Floral magenta kurung

        const apronMat = new BABYLON.StandardMaterial("apronMat", this.scene);
        apronMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White clean apron

        const fanMat = new BABYLON.StandardMaterial("fanRedMat", this.scene);
        fanMat.diffuseColor = new BABYLON.Color3(0.88, 0.2, 0.15); // Vibrant red industrial fan

        const bladeMat = new BABYLON.StandardMaterial("bladeMat", this.scene);
        bladeMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25); // Dark blades

        // 1. Skirt / Lower Body (Baju Kurung Kain)
        const skirt = BABYLON.MeshBuilder.CreateCylinder("skirt", {
            diameterTop: 1.3,
            diameterBottom: 1.8,
            height: 1.6
        }, this.scene);
        skirt.parent = this.bodyMesh;
        skirt.position.y = 0.8;
        skirt.material = bajuMat;

        // 2. Torso (Baju Kurung Upper)
        const torso = BABYLON.MeshBuilder.CreateCylinder("torso", {
            diameterTop: 1.2,
            diameterBottom: 1.4,
            height: 1.2
        }, this.scene);
        torso.parent = this.bodyMesh;
        torso.position.y = 2.0;
        torso.material = bajuMat;

        // 3. Apron front shield & pocket
        const apron = BABYLON.MeshBuilder.CreateBox("apron", {
            width: 1.1,
            height: 1.5,
            depth: 0.12
        }, this.scene);
        apron.parent = this.bodyMesh;
        apron.position.set(0, 1.7, 0.65);
        apron.material = apronMat;

        // Apron pocket
        const pocket = BABYLON.MeshBuilder.CreateBox("pocket", {
            width: 0.6,
            height: 0.4,
            depth: 0.08
        }, this.scene);
        pocket.parent = apron;
        pocket.position.set(0, -0.3, 0.08);
        const pocketMat = new BABYLON.StandardMaterial("pocketMat", this.scene);
        pocketMat.diffuseColor = new BABYLON.Color3(0.8, 0.85, 0.9);
        pocket.material = pocketMat;

        // 4. Head (Face sphere)
        const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 1.05 }, this.scene);
        head.parent = this.bodyMesh;
        head.position.y = 2.95;
        head.material = skinMat;

        // Tudung (Outer dome wrapping head)
        const tudung = BABYLON.MeshBuilder.CreateSphere("tudung", {
            diameterX: 1.32,
            diameterY: 1.4,
            diameterZ: 1.35
        }, this.scene);
        tudung.parent = this.bodyMesh;
        tudung.position.set(0, 3.05, -0.05);
        tudung.material = tudungMat;

        // Tudung chest drape
        const drape = BABYLON.MeshBuilder.CreateCylinder("drape", {
            diameterTop: 1.1,
            diameterBottom: 1.5,
            height: 0.7
        }, this.scene);
        drape.parent = this.bodyMesh;
        drape.position.set(0, 2.3, 0.1);
        drape.material = tudungMat;

        // Cartoon Eyes
        [-0.22, 0.22].forEach((ex, idx) => {
            const eyeWhite = BABYLON.MeshBuilder.CreateSphere(`eyeW_${idx}`, {
                diameterX: 0.2,
                diameterY: 0.24,
                diameterZ: 0.1
            }, this.scene);
            eyeWhite.parent = this.bodyMesh;
            eyeWhite.position.set(ex, 3.0, 0.52);

            const eyePupil = BABYLON.MeshBuilder.CreateSphere(`eyeP_${idx}`, {
                diameter: 0.12
            }, this.scene);
            eyePupil.parent = this.bodyMesh;
            eyePupil.position.set(ex, 3.0, 0.58);
            const pupilMat = new BABYLON.StandardMaterial("pupilMat", this.scene);
            pupilMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
            eyePupil.material = pupilMat;
        });

        // Cartoon Spectacles (classic Makcik canteen glasses)
        const glasses = BABYLON.MeshBuilder.CreateTorus("glasses", {
            diameter: 0.35,
            thickness: 0.05,
            tessellation: 20
        }, this.scene);
        glasses.parent = this.bodyMesh;
        glasses.position.set(0.22, 3.0, 0.54);
        glasses.rotation.x = Math.PI / 2;
        const glassesMat = new BABYLON.StandardMaterial("glassesMat", this.scene);
        glassesMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red frames
        glasses.material = glassesMat;

        const glasses2 = glasses.clone("glasses2");
        glasses2.parent = this.bodyMesh;
        glasses2.position.set(-0.22, 3.0, 0.54);

        const noseBridge = BABYLON.MeshBuilder.CreateCylinder("bridge", {
            diameter: 0.04,
            height: 0.25
        }, this.scene);
        noseBridge.parent = this.bodyMesh;
        noseBridge.position.set(0, 3.02, 0.56);
        noseBridge.rotation.z = Math.PI / 2;
        noseBridge.material = glassesMat;

        // Friendly Smile
        const smile = BABYLON.MeshBuilder.CreateTorus("smile", {
            diameter: 0.28,
            thickness: 0.04,
            tessellation: 16
        }, this.scene);
        smile.parent = this.bodyMesh;
        smile.position.set(0, 2.75, 0.5);
        smile.rotation.x = 1.3;
        smile.scaling.set(1.0, 0.4, 0.5);
        smile.material = glassesMat;

        // 5. Handheld Industrial Fan (Held firmly in front)
        this.fanMesh = new BABYLON.TransformNode("fanContainer", this.scene);
        this.fanMesh.parent = this.bodyMesh;
        this.fanMesh.position.set(0.5, 1.6, 1.1);

        // Fan Casing (Cylinder barrel)
        const fanCasing = BABYLON.MeshBuilder.CreateCylinder("fanCasing", {
            diameter: 1.1,
            height: 0.8,
            tessellation: 24
        }, this.scene);
        fanCasing.parent = this.fanMesh;
        fanCasing.rotation.x = Math.PI / 2;
        fanCasing.material = fanMat;

        // Yellow high-velocity nozzle rim
        const fanRim = BABYLON.MeshBuilder.CreateTorus("fanRim", {
            diameter: 1.12,
            thickness: 0.1,
            tessellation: 24
        }, this.scene);
        fanRim.parent = this.fanMesh;
        fanRim.position.z = 0.4;
        fanRim.rotation.x = Math.PI / 2;
        const yellowMat = new BABYLON.StandardMaterial("yellowMat", this.scene);
        yellowMat.diffuseColor = new BABYLON.Color3(0.95, 0.75, 0.1);
        fanRim.material = yellowMat;

        // Fan Motor housing in rear
        const motorHousing = BABYLON.MeshBuilder.CreateCylinder("fanMotor", {
            diameter: 0.55,
            height: 0.6
        }, this.scene);
        motorHousing.parent = this.fanMesh;
        motorHousing.position.z = -0.3;
        motorHousing.rotation.x = Math.PI / 2;
        motorHousing.material = bladeMat;

        // Fan Handle & Grips
        const handle = BABYLON.MeshBuilder.CreateTorus("fanHandle", {
            diameter: 0.5,
            thickness: 0.08
        }, this.scene);
        handle.parent = this.fanMesh;
        handle.position.set(0, 0.6, 0);
        handle.rotation.z = Math.PI / 2;
        handle.material = yellowMat;

        // Spinning Blades pivot
        this.fanBlades = new BABYLON.TransformNode("fanBlades", this.scene);
        this.fanBlades.parent = this.fanMesh;
        this.fanBlades.position.z = 0.1;

        for (let i = 0; i < 4; i++) {
            const blade = BABYLON.MeshBuilder.CreateBox(`blade_${i}`, {
                width: 0.15,
                height: 0.04,
                depth: 0.42
            }, this.scene);
            blade.parent = this.fanBlades;
            blade.position.z = 0.2;
            blade.rotation.y = (i * Math.PI) / 2;
            blade.material = bladeMat;
        }

        // Arms holding the fan
        const armMat = bajuMat;
        const leftArm = BABYLON.MeshBuilder.CreateCylinder("armL", { diameter: 0.22, height: 0.9 }, this.scene);
        leftArm.parent = this.bodyMesh;
        leftArm.position.set(-0.65, 1.8, 0.4);
        leftArm.rotation.set(0.8, -0.4, -0.5);
        leftArm.material = armMat;

        const rightArm = BABYLON.MeshBuilder.CreateCylinder("armR", { diameter: 0.22, height: 0.9 }, this.scene);
        rightArm.parent = this.bodyMesh;
        rightArm.position.set(0.65, 1.8, 0.4);
        rightArm.rotation.set(0.8, 0.4, 0.5);
        rightArm.material = armMat;

        // Footstep dust particle system
        this.createDustParticles();
    }

    createDustParticles() {
        this.dustParticles = new BABYLON.ParticleSystem("dustParticles", 150, this.scene);
        // Create simple particle texture in-memory
        const tex = new BABYLON.DynamicTexture("dustTex", 64, this.scene, false);
        const ctx = tex.getContext();
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0, "rgba(220, 220, 210, 0.8)");
        grad.addColorStop(0.5, "rgba(200, 200, 190, 0.4)");
        grad.addColorStop(1, "rgba(200, 200, 190, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        tex.update();

        this.dustParticles.particleTexture = tex;
        this.dustParticles.emitter = this.root;
        this.dustParticles.minEmitBox = new BABYLON.Vector3(-0.4, 0.1, -0.4);
        this.dustParticles.maxEmitBox = new BABYLON.Vector3(0.4, 0.1, 0.4);

        this.dustParticles.color1 = new BABYLON.Color4(0.8, 0.8, 0.75, 0.5);
        this.dustParticles.color2 = new BABYLON.Color4(0.7, 0.7, 0.65, 0.2);
        this.dustParticles.colorDead = new BABYLON.Color4(0.6, 0.6, 0.6, 0.0);

        this.dustParticles.minSize = 0.2;
        this.dustParticles.maxSize = 0.5;
        this.dustParticles.minLifeTime = 0.2;
        this.dustParticles.maxLifeTime = 0.45;
        this.dustParticles.emitRate = 0;
        this.dustParticles.direction1 = new BABYLON.Vector3(-0.5, 0.2, -0.5);
        this.dustParticles.direction2 = new BABYLON.Vector3(0.5, 0.5, 0.5);
        this.dustParticles.start();
    }

    // Get position of fan nozzle in world coordinates (for wind projectile/cone emission)
    getFanNozzlePosition() {
        if (!this.fanMesh) return this.position.clone();
        return this.fanMesh.getAbsolutePosition().add(this.root.forward.scale(0.8));
    }

    getForwardVector() {
        return this.root.forward.clone().normalize();
    }

    // Aim character smoothly towards a 3D ground target point
    aimAt(targetPoint) {
        if (!targetPoint) return;
        const dx = targetPoint.x - this.root.position.x;
        const dz = targetPoint.z - this.root.position.z;
        if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
            this.targetRotationY = Math.atan2(dx, dz);
        }
    }

    update(delta, inputVector) {
        // 1. Movement handling
        const moveLen = Math.sqrt(inputVector.x * inputVector.x + inputVector.z * inputVector.z);
        this.isMoving = moveLen > 0.01;

        if (this.isMoving) {
            const normX = inputVector.x / moveLen;
            const normZ = inputVector.z / moveLen;
            const speed = this.moveSpeed * this.currentSpeedMultiplier * delta;

            const newX = this.position.x + normX * speed;
            const newZ = this.position.z + normZ * speed;

            // Clamp inside canteen floor bounds
            this.position.x = Math.max(this.minX, Math.min(this.maxX, newX));
            this.position.z = Math.max(this.minZ, Math.min(this.maxZ, newZ));
            this.root.position.copyFrom(this.position);

            // Waddling walk cycle animation
            this.walkTimer += delta * 14 * this.currentSpeedMultiplier;
            this.bodyMesh.position.y = Math.abs(Math.sin(this.walkTimer)) * 0.18;
            this.bodyMesh.rotation.z = Math.sin(this.walkTimer * 0.5) * 0.09;
            this.bodyMesh.rotation.x = 0.05; // slight forward run lean

            this.dustParticles.emitRate = this.currentSpeedMultiplier > 1.2 ? 65 : 25;
        } else {
            // Idle breathing
            this.walkTimer += delta * 2.5;
            this.bodyMesh.position.y = Math.sin(this.walkTimer) * 0.03;
            this.bodyMesh.rotation.z = 0;
            this.bodyMesh.rotation.x = 0;
            this.dustParticles.emitRate = 0;
        }

        // 2. Smooth rotation towards target angle
        let diff = this.targetRotationY - this.root.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.root.rotation.y += diff * Math.min(1.0, delta * 12.0);

        // 3. Fan blades spin & vibration
        if (this.isFanning) {
            const spinRate = this.isMegaFan ? 55.0 : 35.0;
            this.fanBlades.rotation.z += delta * spinRate;
            // Fan jitter recoil
            this.fanMesh.position.x = 0.5 + (Math.random() - 0.5) * 0.04;
            this.fanMesh.position.y = 1.6 + (Math.random() - 0.5) * 0.04;
        } else {
            // Idle slow fan spin
            this.fanBlades.rotation.z += delta * 2.0;
            this.fanMesh.position.set(0.5, 1.6, 1.1);
        }
    }
}

window.MakcikPlayer = MakcikPlayer;
