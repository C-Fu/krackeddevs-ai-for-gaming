# "AI for Gaming" — Complete 3-Hour Lab Runbook, GDD Template & Agentic Prompt Playbook

## 1. Executive Overview & Recommended Live Demo Game

**Workshop Title:** From Prompt to Playable 3D: How AI is Changing the Way Games Are Made  
**Format & Duration:** 3-Hour Zero-Coding Agentic Lab (Solo Builders, Beginner to Intermediate, Windows & macOS)  
**Target Live Build:** **"Neon Kart 3D" — An Arcade 3D Kart Time-Trial & Item Racer (Mario Kart Style)**  

### Why "Neon Kart 3D" is the Ideal Live Workshop Game
1. **Rich, Iconic Mechanics:** Everyone immediately understands arcade kart racing (acceleration, drift-boost, item boxes, speed pads, lap checkpoints, and AI rival karts), making the Game Design Document (GDD) and mechanics decomposition intuitive for first-time game creators.
2. **Abundant Free 3D & Audio Resources:** Countless CC0 low-poly kart models, modular track tiles, and PBR textures exist on [Kenney](https://kenney.nl/assets) and [Poly Haven](https://polyhaven.com/), while custom props (item boxes, boost gates, trophies) take under 60 seconds to generate via [MCP for Blender](https://github.com/ahujasid/mcp-for-blender) or [Meshy](https://www.meshy.ai/).
3. **Zero-Backend Static Web Deployment:** Runs at 60 FPS in any browser using [Three.js](https://threejs.org/), [Rapier](https://rapier.rs/) 3D physics, and [Vite](https://vite.dev/), and deploys statically in 30 seconds to [GitHub Pages](https://pages.github.com/), [Vercel](https://vercel.com/), or [Netlify](https://www.netlify.com/).
4. **Clear Path from Prototype to Full Immersive 3D Game:** Attendees start with a procedural 3D track and geometric kart in Hour 2, swap in custom `.glb` Blender MCP models and custom audio in Hour 3, and see exactly how shaders, post-processing bloom, and multiplayer WebSockets scale it into a commercial-grade 3D web game.

---

## 2. Recommended AI Game Development Tool Stack

| Workflow Stage | Primary Tool | Backup / Companion Tool | Role in the 3-Hour Lab | Cross-Platform Notes (Windows & macOS) |
| :--- | :--- | :--- | :--- | :--- |
| **Agentic IDE (GUI)** | [Google Antigravity](https://antigravity.google/product/antigravity-ide/) | [Antigravity VS Code Extension](https://antigravity.google/docs/ide/extensions/vscode/) | Autonomous multi-file creation, GDD drafting, architecture scaffolding, and visual browser testing | Native installers for Windows & macOS ([Download](https://antigravity.google/download/)) |
| **Terminal AI Coding Agent** | [OpenCode](https://opencode.ai/) | [OpenCode GitHub CLI](https://github.com/anomalyco/opencode) | Fast terminal TUI agent (`npm i -g @opencode/cli@latest`) for rapid mechanics refactoring, asset pipeline scripts, and build verification | Runs in PowerShell/WSL2 (Windows) and Terminal (macOS) |
| **3D Modeling & Scene Automation** | [Blender](https://www.blender.org/) + [MCP for Blender](https://github.com/ahujasid/mcp-for-blender) | [Blender MCP Server Lab](https://www.blender.org/lab/mcp-server/) | Connects your LLM directly to Blender via socket server (`uvx mcp-for-blender`) to procedurally generate tracks, karts, and export `.glb` | Identical addon setup on Windows & macOS |
| **Text/Image-to-3D Mesh AI** | [Meshy](https://www.meshy.ai/) | [Tripo3D](https://www.tripo3d.ai/) | Generates textured `.glb` props (kart chassis, item crates, palm trees) from text prompts in <60 seconds | Browser-based; zero local GPU required |
| **CC0 3D Assets & PBR Skies** | [Poly Haven](https://polyhaven.com/) | [Kenney Game Assets](https://kenney.nl/assets) | Free CC0 HDRI skies, road textures, and arcade racing starter kits | Direct `.hdr` and `.glb` downloads |
| **Web 3D Engine & Physics** | [Three.js](https://threejs.org/) | [Rapier Physics Engine](https://rapier.rs/) + [Vite](https://vite.dev/) | Renders the 3D scene, lighting, and raycast vehicle physics in browser | Standard Node.js (`npm run dev`) across OS |
| **Audio & Soundtrack Pipeline** | [yt-dlp](https://github.com/yt-dlp/yt-dlp) | [Suno](https://suno.com/) & [ElevenLabs Sound Effects](https://elevenlabs.io/docs/overview/capabilities/sound-effects) | Extracts local `.mp3` background tracks from YouTube URLs (`yt-dlp -x --audio-format mp3`) or generates AI synthwave loops and engine SFX | `winget install yt-dlp` (Win) / `brew install yt-dlp` (Mac) |
| **Static Web Hosting** | [GitHub Pages](https://pages.github.com/) | [Vercel](https://vercel.com/) / [Netlify Drop](https://app.netlify.com/drop) | Instant public URL hosting for the static `dist/` folder without any database | Browser or CLI deploy in 30 seconds |

---

## 3. Minute-by-Minute 3-Hour Lab Session Plan & Instructor Runbook

### Pre-Flight Lab Setup (Before Attendees Arrive)
* **Starter GitHub Repository:** Pre-load a starter repo (`neon-kart-3d-starter`) containing `package.json` ([Three.js](https://threejs.org/) + [Vite](https://vite.dev/)), a `public/assets/` fallback directory with pre-exported `.glb` models and `.mp3` audio (in case lab Wi-Fi throttles downloads), and `AGENTS.md` / `.cursorrules` instructions so [Google Antigravity](https://antigravity.google/) and [OpenCode](https://opencode.ai/) follow strict modular conventions.
* **Branch Checkpoints:** Create 4 Git branches (`checkpoint-0-init`, `checkpoint-1-gdd`, `checkpoint-2-prototype`, `checkpoint-3-blender-full`) so any student who falls behind can run `git checkout checkpoint-2-prototype` and immediately catch up.

### Hour 1 (0:00 – 1:00): The AI Game Studio — Mechanics, GDD, Architecture & PM
* **0:00 – 0:15 | Keynote: How AI is Changing Game Development (15 mins)**
  * **Instructor Action:** Contrast traditional 6-month indie pipelines with the AI-Native Game Loop: *Idea -> AI GDD -> AI Project Backlog -> Agentic Code Scaffolding -> Procedural 3D via MCP -> Playable Web Build*.
  * **Live Demo:** Show the finished **Neon Kart 3D** prototype running in the browser so beginners see the exact finish line they will reach in 3 hours.
* **0:15 – 0:35 | AI-Assisted Game Design Document (GDD) & Mechanics Decomposition (20 mins)**
  * **Hands-On Lab:** Attendees clone the starter repo and open [Google Antigravity](https://antigravity.google/product/antigravity-ide/) (or [OpenCode](https://opencode.ai/)).
  * **Agent Task:** Prompt the agent to act as a Lead Game Designer and generate `docs/GDD.md` covering Core Loop, Arcade Kart Physics Math (forward thrust, steering angular velocity, lateral drift friction, boost multipliers), Item Box state machines, and Track Layout specs.
  * **Teaching Takeaway:** Show why vague prompts ("make a racing game") fail, whereas structured mechanics documents give coding agents deterministic physics constants.
* **0:35 – 0:50 | AI-Driven Project Management in Google Sheets / Excel (15 mins)**
  * **Hands-On Lab:** Open the companion **Project Management Workbook (`AI_for_Gaming_Project_Management_Template.xlsx`)**.
  * **Agent Task:** Ask the AI agent to convert `docs/GDD.md` into a CSV/table of 18 granular tasks mapped across 5 milestones (M1 Pre-Production, M2 Core Engine, M3 3D Assets, M4 Audio/UI, M5 Polish & Deploy) with story points and acceptance criteria, then paste directly into the Backlog tab.
* **0:50 – 1:00 | Designing Clean Game Architecture (10 mins)**
  * **Hands-On Lab:** Prompt [Google Antigravity](https://antigravity.google/) or [OpenCode](https://opencode.ai/) to generate `docs/ARCHITECTURE.md` and scaffold empty module boundaries (`src/main.js`, `src/physics/kartController.js`, `src/world/trackBuilder.js`, `src/items/itemSystem.js`, `src/audio/soundManager.js`, `src/ui/hud.js`) before writing implementation code.

### Hour 2 (1:00 – 2:00): Agentic Live-Build — Playable 3D Web Prototype (Zero Manual Coding)
* **1:00 – 1:20 | Scaffolding the 3D Web Scene & Track via OpenCode / Antigravity (20 mins)**
  * **Hands-On Lab:** Feed `docs/GDD.md` and `docs/ARCHITECTURE.md` into [Google Antigravity](https://antigravity.google/) or [OpenCode](https://opencode.ai/) using Prompt #3 below.
  * **Outcome:** The coding agent generates the [Three.js](https://threejs.org/) scene, oval/circuit spline track with red-and-white curbs, neon cyber grid, lighting, and smooth third-person chase camera. Attendees run `npm run dev` and see their 3D track live in the browser.
* **1:20 – 1:45 | Vibe-Coding Arcade Kart Physics, Drifting & Item Boxes (25 mins)**
  * **Hands-On Lab:** Prompt the coding agent to implement `kartController.js` and `itemSystem.js`.
  * **Outcome:** Attendees drive the kart with WASD/Arrow keys, hold Space/Shift to drift with sparks, hit glowing cyan Speed Pads and rotating golden Item Boxes (granting Turbo Mushroom, Shield, or Shock Trap), and race against 2 AI waypoint karts.
* **1:45 – 2:00 | Live Playtesting & Agentic Tuning Loop (15 mins)**
  * **Hands-On Lab:** Attendees playtest their local build and use natural language in [OpenCode](https://opencode.ai/) to tweak feel ("Increase drift turn rate by 25%, add camera FOV kick when boosting, and add a 3-lap timer HUD").

### Hour 3 (2:00 – 3:00): Blender MCP 3D Pipeline, Audio Automation, Deployment & Next-Level 3D
* **2:00 – 2:30 | Procedural 3D Assets with Blender + MCP & AI Mesh Generators (30 mins)**
  * **Hands-On Lab:** Open [Blender](https://www.blender.org/) with the [MCP for Blender](https://github.com/ahujasid/mcp-for-blender) addon active (`uvx mcp-for-blender`), connected to the IDE agent.
  * **Agent Task:** Prompt the agent to command Blender via Python/MCP to procedurally construct a low-poly Cyber Kart with glowing neon rims, a futuristic Start/Finish Archway, and road barriers, apply metallic/emissive PBR materials, and auto-export them to `public/assets/kart.glb` and `public/assets/arch.glb`.
  * **Bonus Demo:** Show how [Meshy](https://www.meshy.ai/) or [Tripo3D](https://www.tripo3d.ai/) generates complex organic 3D props from text prompts and imports them into Blender via MCP for polygon decimation.
* **2:30 – 2:45 | Audio Pipeline (`yt-dlp` + AI SFX) & 1-Click Web Deployment (15 mins)**
  * **Hands-On Lab:** Run the AI-generated audio helper script using [yt-dlp](https://github.com/yt-dlp/yt-dlp) (`yt-dlp -x --audio-format mp3 --audio-quality 128K <YOUTUBE_URL> -o "public/assets/bgm.mp3"`) to pull a royalty-free synthwave racing track for local lab prototyping, paired with Web Audio API procedural engine pitch synthesis or [ElevenLabs Sound Effects](https://elevenlabs.io/docs/overview/capabilities/sound-effects).
  * **Deployment Note:** Explain copyright best practices—use `yt-dlp` strictly for local offline prototyping, and swap in CC0 music or [Suno](https://suno.com/) AI tracks before pushing to public [GitHub Pages](https://pages.github.com/), [Vercel](https://vercel.com/), or [Netlify](https://www.netlify.com/).
* **2:45 – 3:00 | Scaling to a Full Immersive 3D Game & Wrap-Up Q&A (15 mins)**
  * **Instructor Showcase:** Demonstrate the architectural roadmap from this 3-hour prototype to a commercial 3D game:
    1. **Physics Upgrade:** Swapping arcade kinematics for full [Rapier](https://rapier.rs/) 3D rigid-body raycast suspension and trimesh track colliders.
    2. **Visual Polish:** Adding [Poly Haven](https://polyhaven.com/) 4K HDRI environment reflections, Three.js `UnrealBloomPass` post-processing, skid-mark decals, and GPU particle exhaust.
    3. **Multiplayer & AI Rivals:** Adding WebRTC/WebSocket state sync or reinforcement-learning rival agents.

---

## 4. Template 1: AI-Ready Game Design Document (GDD) & Mechanics Spec

Copy or generate this structure inside `docs/GDD.md` during Hour 1 so [Google Antigravity](https://antigravity.google/) and [OpenCode](https://opencode.ai/) have exact numerical targets:

```markdown
# Game Design Document (GDD): Neon Kart 3D

## 1. High Concept & Core Loop
- **Genre:** 3D Arcade Kart Racer (Mario Kart / OutRun inspired)
- **Target Platform:** Desktop & Mobile Web Browser (Three.js + WebGL, 60 FPS, zero backend)
- **Core Gameplay Loop:**
  1. Accelerate from starting grid on a closed 3D circuit track.
  2. Steer through corners and hold Drift around tight hairpins to charge a 2-tier Mini-Turbo boost.
  3. Collect floating Item Boxes for tactical power-ups (Turbo Boost, Plasma Shield, Oil Slick).
  4. Beat 2 AI rival karts across 3 laps and record the fastest lap time in `localStorage`.

## 2. Vehicle Physics & Handling Constants (Arcade Raycast Model)
| Parameter | Constant Name | Default Value | Description |
| :--- | :--- | :--- | :--- |
| Max Forward Speed | `MAX_SPEED` | `42.0 units/s` | Top cruising speed on straightaways |
| Boost Top Speed | `BOOST_MAX_SPEED` | `60.0 units/s` | Speed cap while Turbo or Pad Boost is active |
| Acceleration | `ACCEL_RATE` | `28.0 units/s²` | Forward thrust when holding W / Up Arrow |
| Braking / Reverse | `BRAKE_RATE` | `35.0 units/s²` | Deceleration and reverse thrust (max `-14.0 units/s`) |
| Natural Drag | `COAST_DRAG` | `0.985 / frame` | Velocity decay when throttle is released |
| Off-Road Grass Drag | `OFFROAD_DRAG` | `0.92 / frame` | Penalty when kart distance from track centerline > track half-width |
| Base Turn Rate | `TURN_SPEED` | `2.1 rad/s` | Steering angular velocity scaled by forward speed |
| Drift Turn Multiplier | `DRIFT_TURN_MULT` | `1.45x` | Tighter cornering angle while holding Spacebar |
| Mini-Turbo Threshold | `DRIFT_CHARGE_TIME` | `1.2 seconds` | Continuous drift duration required to award 1.5s boost on release |

## 3. Interactive Track Mechanics & Items
- **Circuit Spline Geometry:** Closed `CatmullRomCurve3` loop with 12 control points, road width `14 units`, alternating red/white rumble curbs, and start/finish checker line.
- **Speed Boost Pads:** 4 glowing cyan chevrons placed on straightaways; contact sets `boostTimer = 1.4s`.
- **Mystery Item Boxes:** 6 rotating golden wireframe cubes with inner octahedrons; respawn `4.0s` after pickup.
  - **Turbo Mushroom (50% roll):** Instant `+18 units/s` impulse and `1.8s` boost cap.
  - **Energy Shield (30% roll):** 5 seconds of off-road and collision immunity.
  - **Overdrive Star (20% roll):** 4 seconds of max speed (`62 units/s`) + rainbow trail.
- **AI Rival Karts:** 2 autonomous karts following track spline waypoints with slight lateral offset and rubber-banding (`0.88x` to `1.04x` player base speed).
```

---

## 5. Template 2: Modular Web Game Architecture Blueprint (`docs/ARCHITECTURE.md`)

Give this file structure to [Google Antigravity](https://antigravity.google/) or [OpenCode](https://opencode.ai/) so the AI writes clean, maintainable files rather than spaghetti code:

```text
neon-kart-3d/
├── index.html                  # Viewport, HUD overlay containers, and Vite entry point
├── package.json                # Dependencies: three, vite (plus optional @dimforge/rapier3d-compat)
├── docs/
│   ├── GDD.md                  # AI-generated Game Design Document & physics constants
│   ├── ARCHITECTURE.md         # System boundaries and asset loading contract
│   └── BACKLOG.csv             # AI-generated sprint tasks exported for Google Sheets / Excel
├── public/
│   └── assets/
│       ├── models/             # Blender MCP exported .glb files (kart.glb, arch.glb, item_box.glb)
│       ├── textures/           # Poly Haven CC0 sky HDRI and road textures
│       └── audio/              # yt-dlp / Suno background music (bgm.mp3)
└── src/
    ├── main.js                 # Game loop (requestAnimationFrame), state machine, resize handler
    ├── config/
    │   └── constants.js        # All physics, camera, track, and item constants from GDD.md
    ├── world/
    │   ├── sceneSetup.js       # Three.js WebGLRenderer, PerspectiveCamera, lights, fog, skybox
    │   ├── trackBuilder.js     # CatmullRomCurve3 road mesh, curbs, boost pads, checkpoints
    │   └── assetLoader.js      # GLTFLoader wrapper with automatic procedural fallback meshes
    ├── entities/
    │   ├── kart.js             # Player & AI kart mesh builder, wheel spin, drift spark particles
    │   ├── kartController.js   # Arcade physics, steering, drift charge, off-road detection
    │   ├── aiDriver.js         # Waypoint follower & rubber-banding logic for rival karts
    │   └── itemSystem.js       # Rotating item boxes, collision checks, RNG power-up inventory
    ├── audio/
    │   └── soundManager.js     # Web Audio API synth engine hum + SFX + optional bgm.mp3 player
    └── ui/
        └── hud.js              # Speedometer, lap counter, timer, position (1st/3rd), item slot
```

**Crucial Architecture Rule for Live Workshops ("Graceful Procedural Fallback"):**  
Instruct the AI coding agent in `assetLoader.js` to wrap every `GLTFLoader.load('/assets/models/kart.glb')` call in a `try/catch` (or error callback) that automatically renders a sleek procedural `THREE.Group` kart if the `.glb` file isn't present yet. That guarantees the game runs 100% bug-free in Hour 2 *before* attendees export their custom Blender models in Hour 3!

---

## 6. Copy-Paste Prompt Playbook (For Live Demo & Student Handout)

### Prompt 1: Generate the Game Mechanics Document (`docs/GDD.md`)
> **Prompt for Google Antigravity / OpenCode:**  
> "Act as a Principal Game Designer. We are building 'Neon Kart 3D', a browser-based 3D arcade kart racer inspired by Mario Kart using Three.js. Create `docs/GDD.md` containing: (1) Core gameplay loop, (2) Exact numerical physics constants for arcade vehicle handling (acceleration, coasting drag, off-road drag penalty, speed-sensitive steering, drift angle multiplier, and mini-turbo charge time), (3) Track spline geometry and checkpoint rules for a 3-lap race preventing backward lap cheating, (4) 3 power-up items from Mystery Item Boxes, and (5) Waypoint AI rival behavior. Use clean Markdown tables."

### Prompt 2: Populate the Project Management Sheet (`docs/BACKLOG.csv`)
> **Prompt for Google Antigravity / OpenCode:**  
> "Read `docs/GDD.md` and generate a project management backlog in `docs/BACKLOG.csv` with columns: `Task ID, Milestone, Task Name, Category, AI Tool Used, Priority, Estimate (Mins), Status, Acceptance Criteria`. Break the 3-hour build into 18 concrete tasks across 5 milestones (M1 Design & Architecture, M2 Core 3D Engine & Physics, M3 Blender MCP 3D Assets, M4 Audio & HUD, M5 Deployment & Polish) so solo builders can track progress in Google Sheets or Excel."

### Prompt 3: Build the Playable 3D Game Prototype (`src/`)
> **Prompt for Google Antigravity / OpenCode:**  
> "Read `docs/GDD.md` and `docs/ARCHITECTURE.md`. Implement the complete playable 3D web game in `src/` and `index.html` using Three.js. Include: (1) A closed 3D circuit track using `CatmullRomCurve3` with asphalt road, red/white curbs, start/finish banner, glowing cyan speed boost pads, and rotating golden item boxes; (2) Player kart with WASD/Arrow steering, Spacebar drift with particle sparks and mini-turbo release boost, and off-road grass slowdown; (3) 2 AI rival karts racing along the track spline; (4) Web Audio API procedural engine pitch and item SFX; and (5) A modern HUD showing Lap 1/3, live lap timer, current race position (1st–3rd), speedometer, and active item button. Ensure `assetLoader.js` uses procedural Three.js meshes by default and automatically swaps in `/assets/models/kart.glb` when exported from Blender."

### Prompt 4: Blender MCP — Generate & Export Custom 3D Kart & Track Props
> **Prompt for IDE connected to `mcp-for-blender`:**  
> "Using the Blender MCP server, clear the default scene and create a low-poly arcade racing kart centered at the origin facing `-Y`: (1) Create a sleek bevelled chassis (`1.6m` wide, `2.6m` long) with a metallic cyan/crimson PBR material, (2) Add 4 cylinder wheels with dark rubber shaders and glowing neon rims, (3) Add a rear spoiler and driver helmet, (4) Ensure all transforms are applied and polygon count is under 3,500 tris, and (5) Export the collection as a binary glTF file to `<repo_path>/public/assets/models/kart.glb`."

### Prompt 5: Automated YouTube Audio Extraction Script (`scripts/fetch-audio.js`)
> **Prompt for OpenCode in Terminal:**  
> "Create a cross-platform Node.js helper script `scripts/fetch-audio.js` that takes a YouTube URL as a CLI argument, invokes `yt-dlp -x --audio-format mp3 --audio-quality 128K -o public/assets/audio/bgm.%(ext)s <url>`, and prints a reminder that YouTube audio is for local lab prototyping only and should be replaced with CC0 or Suno AI audio before deploying to GitHub Pages."

---

## 7. Cross-Platform Lab Troubleshooting Guide (Windows & macOS)

1. **`uvx mcp-for-blender` Not Found on Windows:**
   - Run `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows) or `brew install uv` (macOS) so `uvx` is on the system `PATH`.
2. **Blender Addon Port Conflict:**
   - In [Blender](https://www.blender.org/), open `Edit > Preferences > Add-ons`, enable **Interface: Blender MCP**, press `N` in the 3D Viewport, open the **BlenderMCP** sidebar tab, and click **Start Server** before prompting your IDE.
3. **`yt-dlp` Missing `ffmpeg` for MP3 Conversion:**
   - Install via `winget install yt-dlp.yt-dlp Gyan.FFmpeg` on Windows or `brew install yt-dlp ffmpeg` on macOS. Alternatively, pass `-f bestaudio[ext=m4a]` which plays natively in all HTML5 `<audio>` tags without needing `ffmpeg` transcoding.
4. **GitHub Pages Blank Screen on Deploy:**
   - Set `base: './'` inside `vite.config.js` so all `.js` and `.glb` asset paths resolve relatively whether hosted at `http://localhost:5173` or `https://<username>.github.io/<repo-name>/`.
