# Game Tech Stack: Haze Fighter

*[Versi Bahasa Melayu ada di sini: GAME_TECH_STACK.ms-MY.md](GAME_TECH_STACK.ms-MY.md)*

## 1. Core Engine & Rendering
- **3D Engine:** [Babylon.js 7](https://www.babylonjs.com/) (WebGL2 / WebGPU renderer).
- **Architecture:** Zero-compilation vanilla ES modules (`canteen.js`, `makcik.js`, `haze.js`, `weapons.js`, `powerups.js`, `audio.js`).
- **Framerate Target:** Stable 60 FPS on integrated Intel Iris / Apple Silicon / Mobile Safari & Chrome.

## 2. Systems & Modules
- **Scene & Environment (`canteen.js`):** 3D school canteen with checkered floor, food stalls, benches, ceiling fans, and posters.
- **Player Controller (`makcik.js`):** Procedural geometric Makcik mesh with walk-waddle kinematics and mouse/touch aiming.
- **Haze Simulation (`haze.js`):** Babylon.js GPU particle systems and real-time volumetric scene fog modulation based on remaining haze count.
- **Weapons & Shockwaves (`weapons.js`):** Raycast wind cone particle emitter and ballistic physics arc for dry ice bombs with expanding frost torus ring.
- **Audio & Voice (`audio.js`):** 100% Procedural HTML5 Web Audio API synthesizer (oscillators, noise generators, biquad filters) + Web Speech API for authentic voice quips (*"Cepat sikit lah!"*).

## 3. Hosting & Deployment
- **Local Dev Server:** Lightweight Python HTTP server (`server.py` on port 8080).
- **Production:** 100% static client-side web application ready for GitHub Pages, Vercel, or Netlify.
- **Zero External Dependencies:** No external asset CDN or audio files required. Runs completely offline in the browser.
