/**
 * game.js - Master Game Controller & Babylon.js Scene Setup
 * Makcik Canteen: Haze Fighter Prototype
 */
class HazeFighterGame {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = null;
        this.scene = null;
        this.camera = null;

        // Game Components
        this.canteen = null;
        this.makcik = null;
        this.hazeManager = null;
        this.weaponManager = null;
        this.powerupManager = null;

        // Game State
        this.gameState = "MENU"; // MENU, PLAYING, WIN, LOSE, PAUSED
        this.gameTimeRemaining = 60.0;
        this.gameTimerTotal = 60.0;
        this.score = 0;
        this.hazeClearedCount = 0;
        this.totalInitialHazeCount = 0;

        // Input states
        this.keys = {};
        this.isMouseDown = false;
        this.mouseButton = 0;
        this.pointerRaycastTarget = new BABYLON.Vector3(0, 0, 0);

        // Speech bubble tracking
        this.bubbleElem = document.getElementById("makcikBubble");
        this.bubbleTimeout = null;

        // Virtual Touch Joystick
        this.virtualInput = { x: 0, z: 0 };
    }

    init() {
        // Create Babylon Engine
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        this.createScene();
        this.setupInputs();
        this.setupUIEvents();

        // Render Loop
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });

        // Window resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Bind global speech bubble callback
        window.triggerMakcikBubble = (phrase) => this.showMakcikSpeech(phrase);
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.12, 0.14, 0.18, 1.0);

        // Isometric Action Follow Camera
        this.camera = new BABYLON.ArcRotateCamera(
            "actionCamera",
            -Math.PI / 2,
            Math.PI / 3.2, // ~56 degrees downward tilt
            34,            // Camera distance
            new BABYLON.Vector3(0, 1.5, -2),
            this.scene
        );
        this.camera.lowerRadiusLimit = 22;
        this.camera.upperRadiusLimit = 42;
        this.camera.lowerBetaLimit = 0.4;
        this.camera.upperBetaLimit = Math.PI / 2.3;

        // Lighting
        const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.75;
        hemiLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.88);
        hemiLight.groundColor = new BABYLON.Color3(0.3, 0.28, 0.25);

        const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-0.5, -1.0, 0.5), this.scene);
        dirLight.position = new BABYLON.Vector3(15, 25, -15);
        dirLight.intensity = 0.65;
        dirLight.diffuse = new BABYLON.Color3(1.0, 0.98, 0.92);

        // Initialize Systems
        this.canteen = new CanteenEnvironment(this.scene);
        this.canteen.build();

        this.makcik = new MakcikPlayer(this.scene, this.camera);
        this.makcik.build();

        this.hazeManager = new HazeManager(this.scene);

        this.weaponManager = new WeaponManager(this.scene, this.makcik, this.hazeManager, this.camera);

        this.powerupManager = new PowerupManager(this.scene, this.makcik, this.weaponManager);
        this.powerupManager.onBuffChanged = (buffs) => this.updateBuffHUD(buffs);

        // Ground Plane Raycast target for mouse aiming
        this.groundPickPlane = BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), BABYLON.Axis.Y);

        // Update loop registered with scene
        this.scene.onBeforeRenderObservable.add(() => {
            const delta = this.engine.getDeltaTime() * 0.001;
            if (delta <= 0 || delta > 0.1) return; // guard against lag spikes
            this.gameLoop(delta);
        });
    }

    startGame() {
        this.gameState = "PLAYING";
        this.gameTimeRemaining = 60.0;
        this.score = 0;
        this.hazeClearedCount = 0;

        // Reset player position
        this.makcik.position.set(0, 0, -10);
        this.makcik.root.position.copyFrom(this.makcik.position);

        // Spawn fresh haze clouds
        this.hazeManager.spawnHazeClusters(28);
        this.totalInitialHazeCount = this.hazeManager.totalInitialHaze;

        // Reset powerups and weapons
        this.powerupManager.reset();
        this.weaponManager.bombStock = 3;

        // Hide menus, show HUD
        document.getElementById("startModal").classList.add("hidden");
        document.getElementById("winModal").classList.add("hidden");
        document.getElementById("loseModal").classList.add("hidden");
        document.getElementById("gameHUD").classList.remove("hidden");

        // Speech quip
        window.GameSound.speak("Cepat sikit lah! 60 saat lagi budak nak sampai!", window.triggerMakcikBubble);
    }

    gameLoop(delta) {
        if (this.gameState !== "PLAYING") {
            // Still animate fans even on pause/menu
            if (this.canteen) this.canteen.update(delta);
            return;
        }

        // 1. Timer Countdown
        this.gameTimeRemaining -= delta;
        if (this.gameTimeRemaining <= 0) {
            this.gameTimeRemaining = 0;
            this.handleTimeUp();
            return;
        }

        // Low time alert
        if (this.gameTimeRemaining <= 15.0) {
            if (Math.floor(this.gameTimeRemaining * 2) % 2 === 0) {
                // Heartbeat pulse warning
                document.getElementById("timerValue").classList.add("urgent");
            } else {
                document.getElementById("timerValue").classList.remove("urgent");
            }
            if (Math.floor(this.gameTimeRemaining) !== Math.floor(this.gameTimeRemaining + delta)) {
                window.GameSound.playWarningTick();
            }
        }

        // 2. Input & Movement
        const inputVec = { x: 0, z: 0 };
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) inputVec.z += 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) inputVec.z -= 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) inputVec.x -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) inputVec.x += 1;

        // Add virtual joystick input if touched
        inputVec.x += this.virtualInput.x;
        inputVec.z += this.virtualInput.z;

        this.makcik.update(delta, inputVec);

        // 3. Aiming (Orient Makcik and Aim Reticle towards cursor ground position)
        this.updateAiming();

        // 4. Update Systems
        this.canteen.update(delta);
        this.hazeManager.update(delta);
        this.weaponManager.update(delta);
        this.powerupManager.update(delta);

        // 5. Smooth Camera Follow
        const targetCamX = this.makcik.position.x * 0.45;
        const targetCamZ = this.makcik.position.z * 0.45 - 2.0;
        this.camera.target.x += (targetCamX - this.camera.target.x) * 0.08;
        this.camera.target.z += (targetCamZ - this.camera.target.z) * 0.08;

        // 6. Update HUD
        this.updateHUD();

        // 7. Update Speech Bubble position
        this.updateSpeechBubblePos();

        // 8. Check Win Condition
        if (this.hazeManager.remainingHaze <= 0) {
            this.handleVictory();
        }
    }

    updateAiming() {
        // Raycast from mouse screen coordinates onto ground plane (y = 0)
        const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
        );

        const distance = ray.intersectsPlane(this.groundPickPlane);
        if (distance !== null) {
            const hitPoint = ray.origin.add(ray.direction.scale(distance));
            this.pointerRaycastTarget.copyFrom(hitPoint);
            this.makcik.aimAt(hitPoint);
            this.weaponManager.setAimGroundPoint(hitPoint);
        }
    }

    updateHUD() {
        // Timer display
        const timerElem = document.getElementById("timerValue");
        const secs = Math.ceil(this.gameTimeRemaining);
        timerElem.textContent = `${secs}s`;

        // Haze percentage & API progress
        const percent = this.hazeManager.hazePercentage;
        const apiVal = this.hazeManager.apiValue;
        const hazeStatus = this.hazeManager.getHazeStatus();

        const meterBar = document.getElementById("hazeMeterFill");
        meterBar.style.width = `${percent}%`;
        meterBar.style.backgroundColor = hazeStatus.color;

        const apiText = document.getElementById("apiStatusText");
        apiText.textContent = `API: ${apiVal} • ${hazeStatus.label}`;
        apiText.style.color = hazeStatus.color;

        // Bomb stock display
        const bombIconsContainer = document.getElementById("bombStockContainer");
        let bombHTML = "";
        for (let i = 0; i < this.weaponManager.maxBombStock; i++) {
            if (i < this.weaponManager.bombStock) {
                bombHTML += `<span class="bomb-icon active">❄️</span>`;
            } else {
                bombHTML += `<span class="bomb-icon recharging">⏳</span>`;
            }
        }
        bombIconsContainer.innerHTML = bombHTML;

        // Haze cleared score counter
        this.hazeClearedCount = this.totalInitialHazeCount - this.hazeManager.remainingHaze;
        this.score = this.hazeClearedCount * 150 + Math.round((60.0 - this.gameTimeRemaining) * 10);
        document.getElementById("scoreValue").textContent = this.score;
    }

    updateBuffHUD(buffs) {
        const buffContainer = document.getElementById("buffStatusContainer");
        let html = "";
        if (buffs.megaFan > 0) {
            html += `<div class="buff-badge mega-fan">🌪️ MEGA FAN (${Math.ceil(buffs.megaFan)}s)</div>`;
        }
        if (buffs.iceCrate > 0) {
            html += `<div class="buff-badge ice-crate">❄️ RAPID ICE BOMBS (${Math.ceil(buffs.iceCrate)}s)</div>`;
        }
        if (buffs.kopiO > 0) {
            html += `<div class="buff-badge kopi-o">☕ KOPI O KAW SPEED (${Math.ceil(buffs.kopiO)}s)</div>`;
        }
        buffContainer.innerHTML = html;
    }

    showMakcikSpeech(phrase) {
        if (!this.bubbleElem) return;
        this.bubbleElem.textContent = phrase;
        this.bubbleElem.classList.remove("hidden");
        this.bubbleElem.classList.add("visible");

        if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
        this.bubbleTimeout = setTimeout(() => {
            this.bubbleElem.classList.remove("visible");
            setTimeout(() => this.bubbleElem.classList.add("hidden"), 300);
        }, 2600);
    }

    updateSpeechBubblePos() {
        if (!this.makcik || !this.bubbleElem || this.bubbleElem.classList.contains("hidden")) return;
        const headPos = this.makcik.position.clone().add(new BABYLON.Vector3(0, 3.8, 0));
        const screenPos = BABYLON.Vector3.Project(
            headPos,
            BABYLON.Matrix.Identity(),
            this.scene.getTransformMatrix(),
            this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight())
        );

        this.bubbleElem.style.left = `${screenPos.x}px`;
        this.bubbleElem.style.top = `${screenPos.y}px`;
    }

    handleVictory() {
        this.gameState = "WIN";
        this.weaponManager.setFanning(false);
        window.GameSound.playWin();

        const timeBonus = Math.round(this.gameTimeRemaining * 60);
        const finalScore = this.score + timeBonus;

        document.getElementById("winScore").textContent = finalScore;
        document.getElementById("winTimeRemaining").textContent = `${this.gameTimeRemaining.toFixed(1)}s`;
        document.getElementById("winModal").classList.remove("hidden");

        window.GameSound.speak("Bagus! Kantin dah bersih! Budak-budak boleh makan sekarang!", window.triggerMakcikBubble);
    }

    handleTimeUp() {
        this.gameState = "LOSE";
        this.weaponManager.setFanning(false);
        window.GameSound.playLose();

        document.getElementById("loseHazeRemaining").textContent = `${this.hazeManager.remainingHaze} awan jerebu`;
        document.getElementById("loseModal").classList.remove("hidden");

        window.GameSound.speak("Alamak jerebu masih tebal! Budak-budak batuk tercekik!", window.triggerMakcikBubble);
    }

    setupInputs() {
        // Keyboard listeners
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;

            // Spacebar activates fan
            if (e.code === "Space") {
                e.preventDefault();
                if (this.gameState === "PLAYING") {
                    this.weaponManager.setFanning(true);
                }
            }

            // 'E' key quick throw dry ice bomb
            if (e.code === "KeyE") {
                if (this.gameState === "PLAYING") {
                    this.weaponManager.throwDryIceBomb();
                }
            }

            // 'M' mute toggle
            if (e.code === "KeyM") {
                this.toggleMute();
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;

            if (e.code === "Space") {
                if (this.gameState === "PLAYING") {
                    this.weaponManager.setFanning(false);
                }
            }
        });

        // Pointer / Mouse events on canvas
        this.canvas.addEventListener("pointerdown", (e) => {
            if (this.gameState !== "PLAYING") return;

            // Left Click (button 0): Throw Dry Ice Bomb
            if (e.button === 0) {
                this.weaponManager.throwDryIceBomb();
            }
            // Right Click (button 2): Activate Fan
            else if (e.button === 2) {
                this.weaponManager.setFanning(true);
            }
        });

        this.canvas.addEventListener("pointerup", (e) => {
            if (e.button === 2) {
                this.weaponManager.setFanning(false);
            }
        });

        // Prevent browser context menu on right click inside canvas
        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    toggleMute() {
        const isMuted = window.GameSound.toggleMute();
        const muteBtn = document.getElementById("muteBtn");
        if (muteBtn) {
            muteBtn.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
        }
    }

    setupUIEvents() {
        // Start Game Button
        const startBtn = document.getElementById("startBtn");
        startBtn.addEventListener("click", () => {
            window.GameSound.init();
            this.startGame();
        });

        // Retry Buttons
        const retryWinBtn = document.getElementById("retryWinBtn");
        const retryLoseBtn = document.getElementById("retryLoseBtn");

        retryWinBtn.addEventListener("click", () => this.startGame());
        retryLoseBtn.addEventListener("click", () => this.startGame());

        // Mute Button
        const muteBtn = document.getElementById("muteBtn");
        muteBtn.addEventListener("click", () => this.toggleMute());

        // Mobile Onscreen Buttons
        const mobileFanBtn = document.getElementById("mobileFanBtn");
        if (mobileFanBtn) {
            mobileFanBtn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.weaponManager.setFanning(true);
            });
            mobileFanBtn.addEventListener("pointerup", (e) => {
                e.preventDefault();
                this.weaponManager.setFanning(false);
            });
            mobileFanBtn.addEventListener("pointerleave", (e) => {
                e.preventDefault();
                this.weaponManager.setFanning(false);
            });
        }

        const mobileBombBtn = document.getElementById("mobileBombBtn");
        if (mobileBombBtn) {
            mobileBombBtn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.weaponManager.throwDryIceBomb();
            });
        }

        // Virtual Touch Joystick for Mobile/Tablet
        this.setupVirtualJoystick();
    }

    setupVirtualJoystick() {
        const zone = document.getElementById("joystickZone");
        const knob = document.getElementById("joystickKnob");
        if (!zone || !knob) return;

        let touchId = null;
        let startX = 0;
        let startY = 0;
        const maxRadius = 45;

        zone.addEventListener("touchstart", (e) => {
            if (touchId !== null) return;
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = zone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
            this.handleJoystickMove(touch.clientX, touch.clientY, startX, startY, maxRadius, knob);
        }, { passive: false });

        zone.addEventListener("touchmove", (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchId) {
                    e.preventDefault();
                    this.handleJoystickMove(touch.clientX, touch.clientY, startX, startY, maxRadius, knob);
                    break;
                }
            }
        }, { passive: false });

        const resetJoystick = () => {
            touchId = null;
            this.virtualInput = { x: 0, z: 0 };
            knob.style.transform = `translate(0px, 0px)`;
        };

        zone.addEventListener("touchend", resetJoystick);
        zone.addEventListener("touchcancel", resetJoystick);
    }

    handleJoystickMove(curX, curY, startX, startY, maxRadius, knob) {
        let dx = curX - startX;
        let dy = curY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
        }

        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        // Invert Y for forward (z axis in Babylon)
        this.virtualInput.x = dx / maxRadius;
        this.virtualInput.z = -dy / maxRadius;
    }
}

// Instantiate and launch game on DOM load
window.addEventListener("DOMContentLoaded", () => {
    window.game = new HazeFighterGame();
    window.game.init();
});
