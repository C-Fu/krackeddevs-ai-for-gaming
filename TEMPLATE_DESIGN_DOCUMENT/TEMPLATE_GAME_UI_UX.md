# [Game Title] — UI / UX Design & Wireframes

## 1. HUD Wireframe Layout (In-Game Screen)
```text
+-------------------------------------------------------------+
| [KM 0.0 / 5.0]       [ ⏳ TIME: 78.4s ]       [ 🏆 12,450 PTS ] |
| [SPEED: 168 KM/H]                                           |
|                                                             |
|                                                             |
|                       ( 3D VIEWPORT )                       |
|                                                             |
|                                                             |
| (🕹️ JOYSTICK)                               (⚡ FLASH) (🚀 BOOST) |
+-------------------------------------------------------------+
```

## 2. Visual Hierarchy & Color Palette
- **Primary Action Accent:** Neon Cyber Amber (`#FFA500` / `#FF8C00`).
- **Reward / Boost:** Emerald Energy Green (`#00FF88` / `#00CC66`).
- **Hazard / Warning:** Hot Crimson Red (`#FF2A2A` / `#D80000`).
- **Atmosphere / Fog:** Deep Sunset Purple-Indigo (`#1A0C2E` / `#0D041A`).

## 3. "Juice" & Screen Feedback
- **High-Speed Tunnel Vision:** Dynamic Camera Field-of-View (FOV) stretching from 0.85 rad to 1.15 rad based on current speed.
- **Impact Camera Shake:** Fast decaying noise shake on collision with potholes or obstacles.
- **Speed Lines:** Canvas particle streaks radiating outward from center screen when exceeding top speed.
