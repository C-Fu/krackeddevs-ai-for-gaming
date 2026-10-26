# Attendee Hands-On Lab Handout & AI Prompt Pack
## *Building "King Myvi: Highway Legends" with Antigravity, OpenCode & Blender*
**[English](WORKSHOP_HANDOUT_AND_PROMPTS.md) | [Bahasa Melayu](WORKSHOP_HANDOUT_AND_PROMPTS.ms-MY.md)**  
*Workshop Game Suite: [King Myvi (Root)](../README.md) | [Makcik Canteen](../MAKCIK_CANTEEN/README.md) | [Neon Kart 3D](../neon_kart_3d/README.md) | [3D Warehouse Downloader](../sketchup_downloader/README.md) | [Design Templates](../TEMPLATE_DESIGN_DOCUMENT/README.md)*

---

> [!NOTE]
> **Welcome to the Lab!**  
> In this 3-hour hands-on session, you will not write JavaScript or 3D shaders by hand. You are acting as the **Creative Director & Lead Producer**, using AI agents (**Antigravity** or **OpenCode**) to architect, code, test, and balance a full 3D game running on Babylon.js.

---

## 🌟 The Golden Rule of Game Prompting: Consultative Scoping
> [!IMPORTANT]
> **The #1 Pro-Tip from the Live Session:**  
> Never ask an LLM to generate an entire Game Design Document (GDD) in a single blind prompt. A single-shot prompt almost always results in bloated scope, generic mechanics, and unrealizable promises.
>
> Instead, trigger a **Consultative Diagnostic Interview** by including this exact key phrase:
> ```text
> "I want to design a game about [concept]. Before creating the game design documents, ask me relevant questions to scope the target audience, core loop, USP, platform constraints, and art style."
> ```
> See real live Copilot dialogue transcripts demonstrating this technique:
> - 🍛 [Makcik Canteen: Haze Fighter GDD Scoping on Microsoft Copilot](https://copilot.microsoft.com/conversations/join/NppskzM778rkVNxfjVi5D)
> - 📄 [Game Design Document Suite Scoping on Microsoft Copilot](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)

---

---

## 1. Quick Setup & Environment Verification (00:00 - 00:15)

### Step 1: Open Your Terminal & Verify Tools
Open your terminal (PowerShell on Windows, Terminal on macOS) and run:
```bash
node -v      # Should be v18+ or v20+
npm -v       # Should be v9+ or v10+
git --version
```

### Step 2: Launch Your AI Agent
* **If using Antigravity:** Open the project workspace folder in Antigravity (`File -> Open Folder -> KD_AI_FOR_GAMING`).
* **If using OpenCode:** In your terminal, navigate to the folder and run `opencode .`.

### Step 3: Run the Development Server
```bash
npm install
npm run dev
```
Open your browser to `http://localhost:5173`. You should see the game running with instant Hot Module Reloading (HMR).

---

## 2. Phase 1 Prompts: Game Architecture & Core Loop (00:15 - 00:45)

### Prompt 1.1: Establishing the Game Scope & Architecture
*Copy and paste this into Antigravity / OpenCode chat:*
```text
I am creating an arcade 3D web game in Babylon.js called "King Myvi: Highway Legends".
The core game premise is navigating from Point A (Toll Plaza Jalan Duta) to Point B (Ayer Keroh R&R) across a 5,000m stretch of highway.
The game has 2 Unique Selling Propositions (USPs):
1. High-Beam Flash (Spacebar): Flashing bright lights forces slow traffic in the right lane to signal and change lanes.
2. Pothole Slalom & SmartTAG Boost: Potholes penalize speed; SmartTAG lanes launch the car into a nitro ramp jump.

Please inspect the workspace and ensure we have a clean modular architecture:
- src/main.js (Babylon Engine, Render Loop, State Machine)
- src/myvi.js (Arcade Vehicle Physics, Banking, Controls)
- src/traffic.js (AI Traffic Spawning & Yielding State Machine)
- src/highway.js (Modular PLUS Highway & Overhead Gantries)
- src/obstacles.js (Potholes & SmartTAG Boosters)
- src/ui.js (Arcade HUD: Speedometer, Distance, High-Beam Gauge)
- src/audio.js (Web Audio Synthesized SFX)

Build or verify the base scene setup with an asphalt road, chase camera, and directional sunset lighting.
```

---

## 3. Phase 2 Prompts: Blender MCP & 3D Asset Pipeline (00:45 - 01:30)

### Understanding the Blender MCP Bridge
* If your instructor is running **Blender MCP live**: The agent sends direct Python execution calls through Model Context Protocol to Blender, modifying meshes and generating `.glb` models on the fly.
* If you are in **Hybrid/Fallback mode**: The project contains procedural geometry generators that build the low-poly Myvi, palm trees, and toll plaza directly in Babylon.js, seamlessly swapping in any `.glb` files found in `/public/assets/models/`.

### Prompt 2.1: Instructing Blender via MCP / Generating 3D Assets
```text
We need to generate a low-poly stylized Malaysian Perodua Myvi car body.
Requirements:
1. Compact hatchback proportions (Length: 3.8m, Width: 1.7m, Height: 1.5m).
2. Clean white body paint (#F5F5F5) with glossy finish.
3. Dark tinted windows (#1A1A1A).
4. Four dark alloy wheels positioned at corners.
5. Distinctive sporty rear roof spoiler.
6. Twin front headlight fixtures that can serve as origins for spotlight cones.
7. Export the resulting model as a binary glTF (.glb) into public/assets/models/myvi.glb.
```

### Prompt 2.2: Advanced Multimodal Image-to-Spec & Live Model Steering
*(As demonstrated during the live workshop upgrade to the 3rd Gen Lava Red Myvi)*:

1. **Multimodal Spec Extraction Prompt** (Upload rear-left & front-left 3D renders to Copilot/Gemini):
   ```text
   "Here is a technical reference image of the Perodua Myvi. Provide a technical breakdown 
   structured specifically for 3D polygonal modeling: overall proportions, rear hatch rake, 
   taillamp orientation (horizontal wrap-around), spoiler design, floating roof C-pillar cue, 
   and primary volumes for procedural mesh generation."
   ```
2. **Real-Time Blender Steering Prompt** (To the coding agent with active Blender MCP):
   ```text
   "The car model is not correct, not like in real life. Change the car model to match this technical spec 
   and reference image. Replace vertical taillights with horizontal two-piece wrap-around clusters, 
   add the two-tier spoiler with black fins, floating C-pillar insert, and 15-inch turbine alloys. 
   Export directly to public/assets/models/myvi.glb."
   ```
*(For complete technical details and procedural Python code, see [`docs/BLENDER_3D_PIPELINE.md`](BLENDER_3D_PIPELINE.md)).*

### Prototyping Shortcut: Sourcing Real 3D Models from 3D Warehouse (`sketchup_downloader/`)
Don't have Blender or want real-world Malaysian architecture and props (KLCC, PLUS toll plazas, mamak stalls)? Instead of modeling from scratch, download production-ready **`.glb` models directly from Trimble SketchUp 3D Warehouse** without creating an account or logging in:

**Windows (PowerShell):**
```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.ps1))) "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC" -Download
```

**macOS / Linux (Bash):**
```bash
curl -sSL https://raw.githubusercontent.com/C-Fu/krackeddevs-ai-for-gaming/main/sketchup_downloader/get_sketchup_model.sh | bash -s -- --download "https://3dwarehouse.sketchup.com/model/16965783-d6e1-4abf-b2d6-ef87f1b25747/Ombak-KLCC"
```

Save the downloaded `.glb` file into `public/assets/models/` and prompt your AI agent to load it into the Babylon.js scene! *(See [`sketchup_downloader/README.md`](../sketchup_downloader/README.md) for converter utilities and batch download options).*

---

## 4. Phase 3 Prompts: Game Assembly & The 2 USPs (01:30 - 02:45)

### Prompt 3.1: Building the Arcade Vehicle Controller
```text
In src/myvi.js, implement the player vehicle arcade controller:
1. Inputs: W/Up (Accelerate), S/Down (Brake/Reverse), A/D or Left/Right (Steering).
2. Acceleration: Non-linear curve reaching 110 km/h in 3 seconds, top speed 180 km/h.
3. Steering: Smooth lateral velocity with visual chassis roll (banking up to 8 degrees into the turn).
4. Auto-centering: Releasing steer keys smoothly glides the car back to forward alignment.
5. Attach a chase camera behind and slightly above the car that smoothly interpolates (lerps) with velocity-based distance stretching.
```

### Prompt 3.2: Implementing USP 1 — The High-Beam Flash & Traffic AI
```text
Implement the High-Beam Flash system and Traffic AI:
1. Player Vehicle:
   - When the user presses or holds Spacebar, activate dual forward spotlight cones projecting 42 meters ahead with intense white/cyan illumination.
   - Trigger a camera micro-shake and high-frequency sound chime.
2. AI Traffic Vehicles:
   - Spawn low-poly traffic (lorries, sedans, vans) ahead of the player moving at 80-100 km/h in random lanes.
   - When the player flashes high-beams while behind a vehicle in the right lane (within 35m distance), the AI vehicle must:
     a) Turn on its left indicator blinking light.
     b) Wait 0.35 seconds (reaction delay).
     c) Smoothly interpolate its lateral position to the adjacent left lane over 0.7 seconds.
     d) Award the player +250 "Fast Lane Cleared!" score bonus.
3. Collision:
   - If the player collides with un-yielded traffic, trigger bumper bounce physics, reduce speed to 40 km/h, and emit smoke particles.
```

### Prompt 3.3: Implementing USP 2 — Potholes & SmartTAG Boost Ramps
```text
In src/obstacles.js, generate dynamic road obstacles along the PLUS highway:
1. Potholes:
   - Scatter dark asphalt craters across lanes 1 and 2 every 60-90 meters.
   - When the player drives over a pothole: drop speed by 40%, trigger camera vibration, and add a suspension wobble for 1.2s.
2. SmartTAG Boost Lanes:
   - Place luminescent emerald green lanes leading into overhead toll gantries.
   - When the player drives through: trigger a +60 km/h speed surge (up to 240 km/h), activate a low-gravity ramp jump launching the car over traffic, and play a futuristic nitro whoosh.
```

### Prompt 3.4: HUD, Procedural Web Audio & Game Loop
```text
Finish the game presentation:
1. HUD Overlay:
   - Digital Speedometer displaying real-time km/h with color shift (Green -> Amber -> Neon Red above 150 km/h).
   - "Distance to Toll B" countdown meter (starting at 5,000m down to 0m).
   - High-Beam status indicator ("READY" / "FLASHING").
   - 90-second countdown timer.
2. Audio Engine (Web Audio API):
   - Synthesize continuous engine pitch shifting with speed.
   - Synthesize tire screech on hard steering.
   - Synthesize classic Malaysian double horn ("pon-pon!") when pressing 'H'.
3. Victory & Defeat:
   - Crossing Point B before time runs out: Display "HIGHWAY LEGEND" victory banner.
   - Timer reaches 0: Display "LATE FOR DINNER" defeat screen with Restart button.
```

---

## 5. Phase 4: Instant 1-Click Deployment (02:45 - 03:00)

### Deploying to GitHub Pages
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Commit and push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete King Myvi Highway Legends demo"
   git push origin main
   ```
3. In your GitHub repository:
   * Go to **Settings -> Pages**.
   * Under **Build and deployment -> Source**, select **GitHub Actions** (or deploy branch `gh-pages` pointing to `/dist`).
   * Your game is now live globally on `https://<your-username>.github.io/<repo-name>/`!

### Deploying to Vercel (Fastest Alternative)
1. Run:
   ```bash
   npx vercel
   ```
2. Follow the 3 prompts. In 20 seconds, you receive a production HTTPS URL to share with the room!

---

## 6. Troubleshooting & Common Pitfalls

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **Black screen in browser** | WebGL context failed or missing camera | Check browser console (`F12`). Ensure Babylon camera is attached to canvas via `camera.attachControl(canvas, true)`. |
| **Car falls through road** | Missing collision plane or road bounding box | Ensure the highway ground mesh has standard collision enabled (`checkCollisions = true`) or keep ground Y clamped. |
| **Audio not playing** | Browser Web Audio autoplay policy | Web Audio requires a user click/key gesture before audio context starts. Our start screen handles this automatically. |
| **Blender MCP connection timeout** | Blender script listener not running | Use the built-in procedural mesh fallback mode; it generates the full low-poly car without requiring external Blender. |
