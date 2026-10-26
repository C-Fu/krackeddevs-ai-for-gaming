# Example Game Spec: King Myvi — Highway Legends

*[Live Game Demo](../../index.html) | [Full GDD Document](../docs/GAME_DESIGN_DOCUMENT.md) | [Blender 3D Pipeline](../docs/BLENDER_3D_PIPELINE.md)*

## 1. High Concept & Overview
- **Title:** *King Myvi: Highway Legends*
- **Genre:** 3D Arcade Highway Racer
- **Platform:** Web Browser (Babylon.js 7, 60 FPS, Vite)
- **Target Persona:** Malaysian students & casual gamers who know the cultural legend of the white/red Perodua Myvi on the PLUS highway.
- **Premise (Point A to Point B):** Drive from Jalan Duta Toll Plaza (KM 0.0) to Ayer Keroh Toll Plaza (KM 5.0) in under 90 seconds.

## 2. Core USPs
- **USP 1: Right-Lane High-Beam Flash (`Spacebar`):** Project 42-meter high-intensity spotlights down the fast lane. Slow lorries and sedans panic, trigger left turn signals, and yield out of the lane.
- **USP 2: SmartTAG Ramp Boosts & Pothole Slalom:** Avoid asphalt craters (-45% speed penalty) and hit emerald SmartTAG ramps to launch supersonic airborne jumps over slow traffic.

## 3. Vehicle Physics Targets
- Normal Top Speed: 180 km/h (50 m/s).
- Boost Top Speed: 240 km/h (66.6 m/s).
- Acceleration Rate: 42 km/h per sec.
- Steering Speed: 24 m/s lateral lane shifting.
- Airborne Gravity: -28 m/s² fast arcade recovery.
