# [Game Title] — Game Tech Stack & Hosting

## 1. Engine & Runtime Selection
- **Web 3D Runtime:** [Babylon.js 7](https://www.babylonjs.com/) or [Three.js r160+](https://threejs.org/).
- **Module Format:** Modern ECMAScript (ESM) bundled via [Vite](https://vite.dev/).
- **Target Platform:** Zero-backend static HTML5 canvas application.

## 2. Procedural Audio Engine
- **Web Audio API:** Pure mathematical synthesis using `AudioContext`, `OscillatorNode` (sawtooth, square, sine), and `BiquadFilterNode`.
- **Zero MP3/WAV Dependencies:** Eliminates asset loading failures, audio licensing risks, and CORS security issues.

## 3. 3D Content Pipeline
- **Blender 5 + MCP Bridge:** AI coding agents interface directly with Blender via socket protocol (`addon.py` on port 9876) to generate procedural models and export `.glb`.
- **Fallback Geometry:** All game entities implement procedural fallback boxes/cylinders so the web game runs even if external `.glb` files fail to load.

## 4. 1-Click Static Deployment
- **GitHub Pages:** Automated deployment via GitHub Actions on push to `main`.
- **Vercel / Netlify:** Instant static deployment from CLI (`npx vercel`).
