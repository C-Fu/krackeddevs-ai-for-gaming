# [Game Title] — Testing & QA Plan

## 1. Mechanics Acceptance Criteria
- [ ] **Movement:** Holding acceleration accelerates smoothly from 0 to top speed within specified time.
- [ ] **Braking:** Holding brake brings vehicle to full stop without slipping into infinite negative velocity.
- [ ] **Steering Bounds:** Player cannot steer outside the road barriers or wall bounds.
- [ ] **Weapon / USP Discharge:** Triggering USP 1 triggers visual beam and clears obstacles ahead.
- [ ] **Collision & Penalties:** Colliding with hazard applies speed penalty and triggers camera shake.
- [ ] **Timer Expiration:** When countdown timer hits 0.0s before reaching Point B, gameover modal triggers immediately.
- [ ] **Victory Trigger:** Passing Point B triggers victory modal with total time, score, and restart button.

## 2. Cross-Device Performance Benchmarks
| Platform | Target FPS | Max Memory | Minimum Requirement |
| :--- | :--- | :--- | :--- |
| **Windows PC (Chrome/Edge)** | 60 FPS | < 160 MB | Integrated Intel UHD 620 |
| **macOS (Safari / Chrome)** | 60 FPS | < 140 MB | Apple Silicon M1 / Intel Core i5 |
| **Android (Chrome Mobile)** | 55–60 FPS | < 180 MB | Snapdragon 680 or higher |
| **iOS / iPadOS (Safari)** | 60 FPS | < 150 MB | A12 Bionic or higher |
