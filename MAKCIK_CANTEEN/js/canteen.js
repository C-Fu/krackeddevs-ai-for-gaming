/**
 * canteen.js - 3D School Canteen Environment
 * Procedural Malaysian School Canteen with food stalls, long dining tables,
 * banners, ceiling fans, tray return counter, and drink coolers.
 */
class CanteenEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.canteenWidth = 46;
        this.canteenDepth = 36;
        this.canteenHeight = 9;
        this.ceilingFans = [];
        this.colliders = [];
    }

    build() {
        this.createFloor();
        this.createWalls();
        this.createStalls();
        this.createDiningTables();
        this.createCeilingAndLights();
        this.createCanteenProps();
    }

    // Dynamic procedural texture helper for signage
    createBannerTexture(text, bgColor = "#c0392b", textColor = "#ffffff", subtext = "") {
        const tex = new BABYLON.DynamicTexture("bannerTex", { width: 512, height: 128 }, this.scene, true);
        const ctx = tex.getContext();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 512, 128);

        // Border
        ctx.strokeStyle = "#f39c12";
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 500, 116);

        // Title text
        ctx.fillStyle = textColor;
        ctx.font = "bold 34px 'Trebuchet MS', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 256, subtext ? 48 : 64);

        if (subtext) {
            ctx.fillStyle = "#f1c40f";
            ctx.font = "bold 22px Arial, sans-serif";
            ctx.fillText(subtext, 256, 92);
        }

        tex.update();
        return tex;
    }

    createFloor() {
        const floor = BABYLON.MeshBuilder.CreateGround("canteenFloor", {
            width: this.canteenWidth,
            height: this.canteenDepth
        }, this.scene);
        floor.position.y = 0;
        floor.receiveShadows = true;

        // Canteen Checkered Tile Texture
        const floorTex = new BABYLON.DynamicTexture("floorTiles", { width: 512, height: 512 }, this.scene, true);
        const ctx = floorTex.getContext();
        const tileSize = 64;
        for (let x = 0; x < 512; x += tileSize) {
            for (let y = 0; y < 512; y += tileSize) {
                const isEven = (x / tileSize + y / tileSize) % 2 === 0;
                ctx.fillStyle = isEven ? "#ecf0f1" : "#bdc3c7";
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = "#95a5a6";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
        floorTex.update();
        floorTex.uScale = 8;
        floorTex.vScale = 6;

        const floorMat = new BABYLON.StandardMaterial("floorMat", this.scene);
        floorMat.diffuseTexture = floorTex;
        floorMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
        floor.material = floorMat;
        floor.checkCollisions = true;
    }

    createWalls() {
        const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.92, 0.94, 0.92);
        wallMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

        const w = this.canteenWidth;
        const d = this.canteenDepth;
        const h = this.canteenHeight;

        // Back Wall (behind food stalls)
        const backWall = BABYLON.MeshBuilder.CreateBox("backWall", { width: w, height: h, depth: 0.8 }, this.scene);
        backWall.position.set(0, h / 2, d / 2);
        backWall.material = wallMat;
        backWall.checkCollisions = true;

        // Front Wall (with school courtyard entrance openings)
        const frontWallLeft = BABYLON.MeshBuilder.CreateBox("frontWallL", { width: w * 0.35, height: h, depth: 0.8 }, this.scene);
        frontWallLeft.position.set(-w * 0.325, h / 2, -d / 2);
        frontWallLeft.material = wallMat;
        frontWallLeft.checkCollisions = true;

        const frontWallRight = BABYLON.MeshBuilder.CreateBox("frontWallR", { width: w * 0.35, height: h, depth: 0.8 }, this.scene);
        frontWallRight.position.set(w * 0.325, h / 2, -d / 2);
        frontWallRight.material = wallMat;
        frontWallRight.checkCollisions = true;

        // Side Walls
        const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", { width: 0.8, height: h, depth: d }, this.scene);
        leftWall.position.set(-w / 2, h / 2, 0);
        leftWall.material = wallMat;
        leftWall.checkCollisions = true;

        const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", { width: 0.8, height: h, depth: d }, this.scene);
        rightWall.position.set(w / 2, h / 2, 0);
        rightWall.material = wallMat;
        rightWall.checkCollisions = true;

        // Grand Canteen Welcome Banner
        const mainBanner = BABYLON.MeshBuilder.CreatePlane("mainBanner", { width: 14, height: 2.2 }, this.scene);
        mainBanner.position.set(0, h - 2.0, d / 2 - 0.45);
        mainBanner.rotation.y = Math.PI;
        const mainBannerMat = new BABYLON.StandardMaterial("mainBannerMat", this.scene);
        mainBannerMat.diffuseTexture = this.createBannerTexture("KANTIN SMK SRI BANGSAR", "#2c3e50", "#ffffff", "SELAMAT MENJAMU SELERA & JAGA KEBERSIHAN");
        mainBanner.material = mainBannerMat;

        // School Rules Poster on left wall
        const rulesPoster = BABYLON.MeshBuilder.CreatePlane("rulesPoster", { width: 5, height: 3.2 }, this.scene);
        rulesPoster.position.set(-w / 2 + 0.45, 4.5, 0);
        rulesPoster.rotation.y = -Math.PI / 2;
        const posterMat = new BABYLON.StandardMaterial("posterMat", this.scene);
        posterMat.diffuseTexture = this.createBannerTexture("PANDUAN KANTIN", "#16a085", "#ffffff", "1. Beratur 2. Pulang Tray 3. Buang Sampah");
        rulesPoster.material = posterMat;

        // Pillars
        const pillarMat = new BABYLON.StandardMaterial("pillarMat", this.scene);
        pillarMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.6);
        const pillarPositions = [
            [-12, -4], [12, -4],
            [-12, 6], [12, 6]
        ];
        pillarPositions.forEach((pos, idx) => {
            const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar_${idx}`, {
                diameter: 1.1,
                height: h
            }, this.scene);
            pillar.position.set(pos[0], h / 2, pos[1]);
            pillar.material = pillarMat;
            pillar.checkCollisions = true;
            this.colliders.push(pillar);
        });
    }

    createStalls() {
        const stallConfigs = [
            {
                name: "GERAI 1: NASI LEMAK & KUIH",
                x: -13,
                color: "#e67e22",
                subtext: "Sambal Sotong • Telur Rebus • Karipap"
            },
            {
                name: "GERAI 2: MEE GORENG & ROTI",
                x: 0,
                color: "#27ae60",
                subtext: "Mee Hoon • Maggi Goreng • Roti Canai"
            },
            {
                name: "GERAI 3: AIR SIRAP & MILO",
                x: 13,
                color: "#2980b9",
                subtext: "Teh Tarik Kaw • Milo Dinosaur • Sirap Bandung"
            }
        ];

        const stallCounterMat = new BABYLON.StandardMaterial("stallCounterMat", this.scene);
        stallCounterMat.diffuseColor = new BABYLON.Color3(0.85, 0.82, 0.75);

        const glassMat = new BABYLON.StandardMaterial("glassMat", this.scene);
        glassMat.diffuseColor = new BABYLON.Color3(0.7, 0.9, 1.0);
        glassMat.alpha = 0.35;

        stallConfigs.forEach((cfg) => {
            // Main Counter base
            const counter = BABYLON.MeshBuilder.CreateBox(`counter_${cfg.name}`, {
                width: 10,
                height: 1.8,
                depth: 3
            }, this.scene);
            counter.position.set(cfg.x, 0.9, this.canteenDepth / 2 - 3.5);
            counter.material = stallCounterMat;
            counter.checkCollisions = true;
            this.colliders.push(counter);

            // Glass sneeze guard / food display
            const sneezeGuard = BABYLON.MeshBuilder.CreateBox(`sneeze_${cfg.name}`, {
                width: 9.6,
                height: 1.2,
                depth: 0.1
            }, this.scene);
            sneezeGuard.position.set(cfg.x, 2.4, this.canteenDepth / 2 - 2.2);
            sneezeGuard.material = glassMat;

            // Stall signboard above counter
            const sign = BABYLON.MeshBuilder.CreatePlane(`sign_${cfg.name}`, { width: 9.8, height: 1.6 }, this.scene);
            sign.position.set(cfg.x, 5.0, this.canteenDepth / 2 - 2.0);
            sign.rotation.y = Math.PI;
            const signMat = new BABYLON.StandardMaterial(`signMat_${cfg.name}`, this.scene);
            signMat.diffuseTexture = this.createBannerTexture(cfg.name, cfg.color, "#ffffff", cfg.subtext);
            sign.material = signMat;

            // Canopy awning over stall
            const canopy = BABYLON.MeshBuilder.CreateBox(`canopy_${cfg.name}`, {
                width: 10.4,
                height: 0.3,
                depth: 3.5
            }, this.scene);
            canopy.position.set(cfg.x, 5.9, this.canteenDepth / 2 - 2.8);
            canopy.rotation.x = -0.15;
            const canopyMat = new BABYLON.StandardMaterial(`canopyMat_${cfg.name}`, this.scene);
            canopyMat.diffuseColor = BABYLON.Color3.FromHexString(cfg.color);
            canopy.material = canopyMat;

            // Food trays on counter
            for (let i = -3; i <= 3; i += 2.2) {
                const tray = BABYLON.MeshBuilder.CreateBox(`tray_${cfg.name}_${i}`, {
                    width: 1.5,
                    height: 0.15,
                    depth: 1.2
                }, this.scene);
                tray.position.set(cfg.x + i, 1.88, this.canteenDepth / 2 - 3.2);
                const trayMat = new BABYLON.StandardMaterial("trayMat", this.scene);
                trayMat.diffuseColor = new BABYLON.Color3(0.7, 0.72, 0.75);
                tray.material = trayMat;
            }
        });

        // Drink Dispensers for Stall 3
        const dispenserColors = [
            { c: new BABYLON.Color3(0.9, 0.1, 0.2), x: 10.5 }, // Sirap
            { c: new BABYLON.Color3(0.3, 0.7, 0.2), x: 12.5 }, // Milo Green
            { c: new BABYLON.Color3(0.9, 0.7, 0.1), x: 14.5 }  // Teh O Limau
        ];
        dispenserColors.forEach(d => {
            const disp = BABYLON.MeshBuilder.CreateCylinder("dispenser", {
                diameter: 0.8,
                height: 1.4
            }, this.scene);
            disp.position.set(d.x, 2.5, this.canteenDepth / 2 - 3.4);
            const dMat = new BABYLON.StandardMaterial("dMat", this.scene);
            dMat.diffuseColor = d.c;
            disp.material = dMat;
        });
    }

    createDiningTables() {
        const tableMat = new BABYLON.StandardMaterial("tableMat", this.scene);
        tableMat.diffuseColor = new BABYLON.Color3(0.72, 0.52, 0.35); // Warm wood
        tableMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const legMat = new BABYLON.StandardMaterial("legMat", this.scene);
        legMat.diffuseColor = new BABYLON.Color3(0.2, 0.25, 0.3); // Steel blue-gray

        const benchMat = new BABYLON.StandardMaterial("benchMat", this.scene);
        benchMat.diffuseColor = new BABYLON.Color3(0.65, 0.45, 0.28);

        // 3 Rows x 4 Columns of dining tables
        const tableRows = [-10, -3, 4];
        const tableCols = [-15, -5, 5, 15];

        tableRows.forEach((z, rIdx) => {
            tableCols.forEach((x, cIdx) => {
                // Table Top
                const tableTop = BABYLON.MeshBuilder.CreateBox(`table_${rIdx}_${cIdx}`, {
                    width: 5.6,
                    height: 0.22,
                    depth: 2.2
                }, this.scene);
                tableTop.position.set(x, 1.35, z);
                tableTop.material = tableMat;
                tableTop.checkCollisions = true;
                this.colliders.push(tableTop);

                // Table Legs (4 corner legs)
                [[-2.4, -0.8], [2.4, -0.8], [-2.4, 0.8], [2.4, 0.8]].forEach(([lx, lz], legIdx) => {
                    const leg = BABYLON.MeshBuilder.CreateCylinder(`tleg_${rIdx}_${cIdx}_${legIdx}`, {
                        diameter: 0.14,
                        height: 1.3
                    }, this.scene);
                    leg.position.set(x + lx, 0.65, z + lz);
                    leg.material = legMat;
                });

                // Top Bench & Bottom Bench
                [-1.7, 1.7].forEach((bz, bIdx) => {
                    const bench = BABYLON.MeshBuilder.CreateBox(`bench_${rIdx}_${cIdx}_${bIdx}`, {
                        width: 5.4,
                        height: 0.15,
                        depth: 0.8
                    }, this.scene);
                    bench.position.set(x, 0.75, z + bz);
                    bench.material = benchMat;
                });
            });
        });
    }

    createCeilingAndLights() {
        // Ceiling Fan positions
        const fanPositions = [
            [-10, -5], [10, -5],
            [-10, 5], [10, 5],
            [0, 0]
        ];

        const fanMat = new BABYLON.StandardMaterial("fanMat", this.scene);
        fanMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.35);

        fanPositions.forEach((pos, idx) => {
            // Fan rod hanging down from ceiling
            const rod = BABYLON.MeshBuilder.CreateCylinder(`fanRod_${idx}`, {
                diameter: 0.12,
                height: 2.2
            }, this.scene);
            rod.position.set(pos[0], this.canteenHeight - 1.1, pos[1]);
            rod.material = fanMat;

            // Center motor cap
            const hub = BABYLON.MeshBuilder.CreateCylinder(`fanHub_${idx}`, {
                diameter: 0.8,
                height: 0.4
            }, this.scene);
            hub.position.set(pos[0], this.canteenHeight - 2.2, pos[1]);
            hub.material = fanMat;

            // 3 Blades attached to a pivot node
            const pivot = new BABYLON.TransformNode(`fanPivot_${idx}`, this.scene);
            pivot.position.set(pos[0], this.canteenHeight - 2.2, pos[1]);

            for (let b = 0; b < 3; b++) {
                const blade = BABYLON.MeshBuilder.CreateBox(`blade_${idx}_${b}`, {
                    width: 0.4,
                    height: 0.05,
                    depth: 2.2
                }, this.scene);
                blade.parent = pivot;
                blade.position.z = 1.1;
                blade.rotation.y = (b * 2 * Math.PI) / 3;
                blade.material = fanMat;
            }

            this.ceilingFans.push(pivot);
        });

        // Warm ambient canteen lights hanging down
        const lightPositions = [
            [-12, 10], [0, 10], [12, 10],
            [-12, -2], [0, -2], [12, -2],
            [-12, -12], [0, -12], [12, -12]
        ];

        lightPositions.forEach((pos, idx) => {
            const lamp = BABYLON.MeshBuilder.CreateSphere(`lamp_${idx}`, { diameter: 0.6 }, this.scene);
            lamp.position.set(pos[0], this.canteenHeight - 1.5, pos[1]);
            const lampMat = new BABYLON.StandardMaterial(`lampMat_${idx}`, this.scene);
            lampMat.emissiveColor = new BABYLON.Color3(1.0, 0.95, 0.8);
            lamp.material = lampMat;
        });
    }

    createCanteenProps() {
        // Tray Return Station on the right corner
        const trayStation = BABYLON.MeshBuilder.CreateBox("trayStation", {
            width: 4,
            height: 3.5,
            depth: 2
        }, this.scene);
        trayStation.position.set(this.canteenWidth / 2 - 3, 1.75, -this.canteenDepth / 2 + 3);
        const trayMat = new BABYLON.StandardMaterial("trayStationMat", this.scene);
        trayMat.diffuseTexture = this.createBannerTexture("PULANG TRAY", "#34495e", "#ffffff", "KERJASAMA ANDA DIHARGAI");
        trayStation.material = trayMat;
        trayStation.checkCollisions = true;
        this.colliders.push(trayStation);

        // Waste Bins (Recycle colored bins: Blue, Brown, Orange)
        const binColors = [
            { c: "#2980b9", x: this.canteenWidth / 2 - 6, label: "KERTAS" },
            { c: "#d35400", x: this.canteenWidth / 2 - 7.5, label: "PLASTIK" },
            { c: "#27ae60", x: this.canteenWidth / 2 - 9, label: "MAKANAN" }
        ];

        binColors.forEach((b, idx) => {
            const bin = BABYLON.MeshBuilder.CreateCylinder(`bin_${idx}`, {
                diameterTop: 1.0,
                diameterBottom: 0.8,
                height: 1.6
            }, this.scene);
            bin.position.set(b.x, 0.8, -this.canteenDepth / 2 + 2.5);
            const bMat = new BABYLON.StandardMaterial(`bMat_${idx}`, this.scene);
            bMat.diffuseColor = BABYLON.Color3.FromHexString(b.c);
            bin.material = bMat;
            bin.checkCollisions = true;
            this.colliders.push(bin);
        });

        // Handwashing sinks (Singki Cuci Tangan) along left wall
        for (let sz = -8; sz <= -2; sz += 3) {
            const sink = BABYLON.MeshBuilder.CreateBox(`sink_${sz}`, {
                width: 1.4,
                height: 1.2,
                depth: 1.2
            }, this.scene);
            sink.position.set(-this.canteenWidth / 2 + 1.2, 1.0, sz);
            const sMat = new BABYLON.StandardMaterial("sMat", this.scene);
            sMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
            sink.material = sMat;
            sink.checkCollisions = true;
            this.colliders.push(sink);
        }
    }

    // Called every frame to spin struggling ceiling fans
    update(delta) {
        this.ceilingFans.forEach(fan => {
            fan.rotation.y += delta * 4.5;
        });
    }
}

window.CanteenEnvironment = CanteenEnvironment;
