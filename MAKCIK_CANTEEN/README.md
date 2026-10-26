# Makcik Canteen: Haze Fighter (Prototaip Babylon.js)

*[Versi Bahasa Melayu ada di sini: README.ms-MY.md](README.ms-MY.md)*  
*Part of the [AI for Gaming Workshop Ecosystem](../README.md). Sibling games: [King Myvi: Highway Legends](../index.html) | [Neon Kart 3D](../neon_kart_3d/neon_kart_3d_ai_for_gaming_live_workshop_demo.html)*

> **"Battle haze in the school canteen with humor, fans, and dry ice bombs!"**  
> A fast-paced, web-based 3D action arcade proof-of-concept built using **Babylon.js** and HTML5 Web Audio API, designed live during the AI for Gaming workshop.

---

## 🤖 How This Game Was Conceived Using Microsoft Copilot

During the live masterclass, **Makcik Canteen** was scaffolded from scratch in under 10 minutes using [Microsoft Copilot (Live Session Log)](https://copilot.microsoft.com/conversations/join/NppskzM778rkVNxfjVi5D).

### 💡 The Golden Prompting Rule: "Ask Me Relevant Questions"
The most critical prompting technique taught in this workshop is **never asking an LLM to generate a complete Game Design Document in one shot**. When asked blindly, AI produces generic, bloated RPG mechanics with scope creep.

Instead, the prompt anchored the AI into an **interactive consultative interview**:

> **The Exact Initial Prompt:**  
> *"I want to design a lightweight web game called 'Haze Fighter' / 'Makcik Canteen' where a canteen makcik clears haze before students arrive for recess. Ask me relevant questions before creating the game design documents."*

### 📋 The 4-Step Copilot Dialogue Loop
1. **Copilot's Diagnostic Q&A:** Copilot immediately responded by asking 5 precise scoping questions:
   - *Target Audience:* Who is playing? (Answer: High school students, casual gamers).
   - *Unique Selling Point (USP):* What is the absurd / fun twist? (Answer: Industrial blower fan + cryogenic dry ice bombs).
   - *Tech Constraints:* What is the deployment target? (Answer: Zero-backend static web, Babylon.js, Web Audio API, single-level prototype).
   - *Environment & Theme:* Where is it set? (Answer: Malaysian secondary school canteen with food stalls, banners, and Milo Dinosaur).
   - *Win/Loss Conditions:* How does the session end? (Answer: 60-second countdown until recess; clear all haze clusters to win).
2. **Modular Spec Generation:** With exact constraints locked in, Copilot generated a clean, modular suite of markdown documents:
   - [Game Design Document (GDD)](GAME_DESIGN_DOCUMENT.md)
   - [Technical Design Document (TDD)](TECHNICAL_DESIGN_DOCUMENT.md)
   - [Game Mechanics](GAME_MECHANICS.md)
   - [Game Physics Specs](GAME_PHYSICS.md)
   - [Game Tech Stack](GAME_TECH_STACK.md)
   - [Game UI/UX](GAME_UI_UX.md)
   - [Game Assets](GAME_ASSETS.md)
   - [Game Testing Plan](GAME_TESTING.md)
   - [Game Accessibility](GAME_ACCESSIBILITY.md)
3. **Agentic Code Synthesis (Antigravity & OpenCode):** These `.md` spec files were then fed directly into the coding agent, which generated the complete, runnable 3D game codebase in `js/` with zero manual programming.

---

## 📚 Game Design & Specification Suite

| Document | Description | Status |
| :--- | :--- | :--- |
| **[Game Design Document (GDD)](GAME_DESIGN_DOCUMENT.md)** | Core premise, target persona, gameplay loop, narrative urgency, and Babylon.js feature plan. | ✅ Active Spec |
| **[Technical Design Document](TECHNICAL_DESIGN_DOCUMENT.md)** | Engine architecture, module boundaries, and runtime requirements. | ✅ Active Spec |
| **[Game Mechanics](GAME_MECHANICS.md)** | Fan blowing, dry ice bomb throwing, power-up spawns, and win/loss rules. | ✅ Active Spec |
| **[Game Physics Specifications](GAME_PHYSICS.md)** | Kinematic constants, wind cone angles, ballistic trajectories, and shockwave radii. | ✅ Active Spec |
| **[Game Tech Stack](GAME_TECH_STACK.md)** | Babylon.js WebGL/WebGPU pipeline, Web Audio oscillators, and static hosting architecture. | ✅ Active Spec |
| **[Game UI / UX Design](GAME_UI_UX.md)** | Real-time API air pollution meter, 60s timer, mobile touch controls, and modal dialogs. | ✅ Active Spec |
| **[Game Assets & Audio](GAME_ASSETS.md)** | Procedural 3D primitive models, particle textures, Web Audio sound effects, and voice quips. | ✅ Active Spec |
| **[Game Testing & QA Plan](GAME_TESTING.md)** | Functional testing matrix, boundary checks, and cross-browser performance benchmarks. | ✅ Active Spec |
| **[Game Accessibility](GAME_ACCESSIBILITY.md)** | Keyboard/mouse/touch parity, high-contrast HUD, audio toggles, and cognitive simplicity. | ✅ Active Spec |

---

## 🎮 Game Concept & Premise

- **Title**: *Haze Fighter* (*Makcik Canteen vs Jerebu*)
- **Target Audience**: High school students (Ali, 16, SMK Sri Bangsar / Alam Shah Science School)
- **Premise**: Recess starts in **60 seconds**! Students are rushing to the school canteen for breakfast, but an unhealthy cloud of haze (*jerebu*, API 385+) has invaded the canteen! You play as **Makcik Canteen**, armed with an industrial high-velocity fan and cryogenic dry ice bombs to purge the haze before the morning bell rings!
- **Tone**: Humorous, cartoony, lighthearted, and uniquely Malaysian.

---

## 🕹️ Controls

| Control | Action | Details |
| :--- | :--- | :--- |
| **W, A, S, D** or **Arrow Keys** | **Move Makcik** | Run across the canteen with cartoon waddling animation |
| **Mouse Aim** | **Aim Fan & Target Reticle** | Makcik and targeting circle smoothly face mouse cursor |
| **Spacebar** or **Right-Click** | **Activate Fan (Blow)** | Continuous wind blast cone that disperses haze & pushes smog away |
| **Left-Click** or **E Key** | **Throw Dry Ice Bomb** | Ballistic arc projectile with cold shockwave AOE detonation |
| **M Key** / **Mute Button** | **Toggle Audio** | Mute or unmute procedural Web Audio SFX & voice quips |
| **Onscreen Joystick & Buttons** | **Touch / Mobile Support** | Full mobile and tablet support with virtual joystick and action buttons |

---

## 🛠️ Core Mechanics & Features

### 1. 3D School Canteen Environment (`js/canteen.js`)
- Full 3D canteen layout:
  - **3 Food Stalls**:
    - *Gerai 1: Nasi Lemak & Kuih-Muih* (Sambal sotong, telur rebus, karipap)
    - *Gerai 2: Mee Goreng & Roti Canai* (Mee hoon, Maggi goreng)
    - *Gerai 3: Air Sirap & Milo Dinosaur* (with authentic drink coolers)
  - Tiled checkered linoleum floor, school pillars, ceiling lamps.
  - Struggling ceiling fans spinning overhead.
  - Classic canteen wooden tables and attached dining benches.
  - School banners and posters (*"KANTIN SMK SRI BANGSAR"*, *"PULANG TRAY"*).

### 2. Stylized 3D Makcik Model (`js/makcik.js`)
- Modeled entirely with optimized Babylon.js primitives:
  - Baju kurung with iconic teal *tudung* (headscarf) and retro Makcik glasses.
  - Chef apron with pocket logo.
  - Handheld red-and-yellow industrial blower fan with real-time spinning blades.
  - Dynamic walk-waddle animation cycle and running dust particles.

### 3. Dynamic Haze & Particle Cloud System (`js/haze.js`)
- Volumetric haze clusters distributed across tables and food counters.
- **Dynamic Atmospheric Fog**: Scene fog starts dense, yellow-brown, and suffocating (`API 385+ BERBAHAYA`). As you clear haze clusters, the scene fog lifts and clarifies into bright, crisp daylight!
- Real-time Air Pollutant Index (API / PSI) calculation and color-coded status bar.

### 4. Weapons & Physics (`js/weapons.js`)
- **Industrial Fan**:
  - High-velocity directional wind streak particle cone.
  - Applies continuous wind impulse and disperses haze clusters caught in the cone.
- **Dry Ice Bomb**:
  - Arc trajectory physics with gravity and bounce.
  - On detonation: expanding cryogenic frost torus shockwave, cold mist cloud, screen shake, and massive AOE haze clearing!
  - Regenerating 3-bomb stock.

### 5. Power-ups (`js/powerups.js`)
Random pickups spawn on the canteen floor:
- 🌪️ **Mega Fan (Kipas Helikopter)**: 9 seconds of colossal golden hurricane blast with 2x radius and 3x damage!
- ❄️ **Dry Ice Crate (Kotak Ais Kering)**: 8 seconds of rapid-fire dry ice bombs!
- ☕ **Kopi O Kaw / Milo Dinosaur**: 10 seconds of 1.7x hyper speed boost!

### 6. 100% Procedural Audio & Voice Lines (`js/audio.js`)
- Zero external audio files required! Built entirely using **Web Audio API**:
  - Fan motor drone & wind whoosh
  - Dry ice bomb throw, bounce, and frosty explosion boom
  - Power-up chimes, low-time warning heartbeat, victory fanfare, fail trombone
  - Web Speech API voice synthesis & animated comic speech bubbles (*"Cepat sikit lah!"*, *"Aiyo jerebu!"*, *"Kantin dah bersih!"*).

---

## 🚀 How to Run the Game

### Method 1: Double-Click Launcher (Windows)
Double-click `start_game.bat`. It will automatically launch the local Python server and open your default browser at `http://localhost:8080/index.html`.

### Method 2: Python Command Line
```bash
python server.py
```
Open [http://localhost:8080/index.html](http://localhost:8080/index.html).

### Method 3: Direct Browser Launch
You can also open `index.html` directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 📋 Compliance with Game Design Documents

| GDD Requirement | Implementation | Status |
| :--- | :--- | :--- |
| **Title & USP**: *Battle haze in school canteen with fans and dry ice bombs* | Implemented with Malaysian school canteen theme, fan wind cone, and dry ice bombs | ✅ Completed |
| **Target Audience & Tone**: *High school students, humorous & cartoony* | Stylized cartoon Makcik, canteen food stalls, animated speech bubbles, upbeat audio | ✅ Completed |
| **Mechanics**: *Aim and blow fan, throw dry ice bombs, timer countdown* | Full WASD + mouse aim, spacebar fan stream, left-click ballistic bombs, 60s timer | ✅ Completed |
| **Power-ups**: *Mega Fan, Dry ice bomb AOE, speed buff* | 3 floating 3D rotating power-ups: Mega Fan, Rapid Ice Crate, Kopi O Kaw speed boost | ✅ Completed |
| **Environment**: *School canteen only* | 3D food stalls (Nasi Lemak, Mee Goreng, Milo), tables, benches, tray return, posters | ✅ Completed |
| **Babylon.js Features**: *Particle systems for haze and dry ice, meshes, physics* | Volumetric haze particles, wind vortex particles, frost explosion, dynamic scene fog | ✅ Completed |
| **Audio**: *Fan whoosh, bomb fizz, voice lines* | Procedural Web Audio synthesizer + Web Speech API + comic speech bubbles | ✅ Completed |
| **UI/UX**: *Timer, haze meter, power-up icons, start/win/lose menus* | Polished HUD with API meter, bomb stock, animated timer, start/win/lose modals | ✅ Completed |
| **Accessibility**: *Simple keyboard/mouse/touch controls* | Keyboard/mouse + responsive virtual joystick & touch buttons for tablets/phones | ✅ Completed |
