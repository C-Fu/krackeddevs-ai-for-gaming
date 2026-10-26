# [Game Title] — Asset & Audio Pipeline

## 1. 3D Model Poly Budgets & Materials
| Asset Name | Target Polycount | PBR Material Channels | Export Path |
| :--- | :--- | :--- | :--- |
| **Player Vehicle / Character** | 3,500 – 6,000 tris | Albedo (Lava Red), Metallic 0.35, Roughness 0.20, Emissive LED | `public/assets/models/player.glb` |
| **Traffic / Rival Entities** | 800 – 1,500 tris | Standard Vertex Color / Low-Poly Albedo | Procedural / `traffic.glb` |
| **Obstacles & Pickups** | 250 – 600 tris | High Emissive Shader (Glow) | Procedural Primitives |
| **Modular Environment** | 1,200 tris / chunk | Asphalt texture, guardrails, overhead signage | Procedural Instancing |

## 2. Procedural Web Audio API Sound Map
| Sound Event | Oscillator / Synthesizer Profile | Duration | Pitch Modulation |
| :--- | :--- | :--- | :--- |
| **Engine RPM Drone** | Sawtooth wave + lowpass filter | Continuous | Frequency scaled linearly with km/h (65Hz – 380Hz) |
| **Nitro / Speed Boost** | Dual Sine oscillator with exponential chirp | 1.8s | 220Hz ramping up to 880Hz |
| **Hazard Collision** | White noise burst + low-frequency square thump | 0.35s | Instant attack, 0.3s decay |
| **Victory Fanfare** | Arpeggiated major chord triad (C-E-G-C) | 2.5s | Uplifting synth chime |
