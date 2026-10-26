# Game Physics: Haze Fighter

*[Versi Bahasa Melayu ada di sini: GAME_PHYSICS.ms-MY.md](GAME_PHYSICS.ms-MY.md)*

## 1. Character Kinematics (Makcik Movement)
- **Top Speed:** 7.5 m/s (Standard running waddle).
- **Acceleration:** 28.0 m/s² (Snappy arcade response).
- **Deceleration / Friction:** 35.0 m/s² (Immediate stopping when keys released).
- **Turning Speed:** Slerp angular rotation speed factor 14.0 rad/s (Smoothly faces mouse aim reticle).
- **Sprint Boost (Kopi O Kaw):** Speed multiplier 1.7x (12.75 m/s) for 10.0 seconds.

## 2. Industrial Fan Wind Cones (Dispersal Physics)
- **Wind Cone Angle:** 42° field-of-effect extending from fan nozzle.
- **Wind Range:** 14.0 meters standard (28.0 meters when Mega Fan active).
- **Dispersal Impulse:** Applies directional raycast particle force pushing haze away from Makcik.
- **Clearing Rate:** Dissolves haze clusters at 18% density per second of continuous exposure.

## 3. Cryogenic Dry Ice Bombs (Ballistic Trajectory & Shockwave)
- **Launch Velocity:** 16.0 m/s with 35° upward ballistic launch angle.
- **Gravity:** Standard gravity constant (-19.6 m/s²).
- **Bounces:** 1-2 dampening bounces (bounciness coefficient 0.45) before detonation.
- **Detonation Delay:** 1.4 seconds after launch or instant on direct contact with dense haze clusters.
- **Cryogenic Frost Shockwave (AOE):**
  - Expanding frost ring radius: 6.5 meters.
  - Blast duration: 0.6 seconds.
  - Instant haze eradication within radius: 100% clearing.
  - Camera shake impulse: 0.35 intensity for 0.25 seconds.

## 4. Haze Particle Density & Room Fog
- **Initial Total Clusters:** 24 clusters scattered across canteen tables and food stalls.
- **Haze Volumetric Growth:** If left untreated, haze clusters expand by 2% volume every 5 seconds.
- **Atmospheric Scene Fog:**
  - Initial state: Suffocating yellow-brown smog (`#B8860B`, API 385+).
  - Clear state: Crisp daylight ambient lighting (`#E8F4F8`, API 35 Bersih).
