# [Game Title] — Physics & Kinematics Specifications

## 1. Kinematic Constants
| Parameter | Constant | Value | Description |
| :--- | :--- | :--- | :--- |
| **Max Normal Speed** | `MAX_SPEED` | `50.0 m/s` (180 km/h) | Top cruising velocity on straight road |
| **Boost Max Speed** | `BOOST_MAX_SPEED` | `66.6 m/s` (240 km/h) | Absolute speed cap during nitro / ramp jump |
| **Acceleration Rate** | `ACCEL_RATE` | `11.6 m/s²` | Forward thrust acceleration |
| **Brake Deceleration** | `BRAKE_RATE` | `20.8 m/s²` | Deceleration when holding brake key |
| **Natural Rolling Friction** | `FRICTION_RATE` | `3.3 m/s²` | Natural velocity roll-off when coasting |
| **Lateral Steering Speed** | `STEER_SPEED` | `24.0 m/s` | Lateral strafing speed across road lanes |
| **Chassis Banking Tilt** | `MAX_TILT_RAD` | `0.08 rad` (~4.5°) | Visual body roll into steering turns |

---

## 2. Airborne & Trajectory Physics
- **Jump Launch Velocity:** `+12.0 m/s` vertical impulse on ramp contact.
- **Gravity Constant:** `-28.0 m/s²` (fast arcade gravity, preventing floatiness).
- **Pitch Coupling:** Nose-up pitch angle `-verticalVelocity * 0.02` rad.
- **Landing Recovery:** Snaps to ground plane at $Y = 0.45\text{ m}$ with zero vertical bounce.

---

## 3. Collision Layers & Penalty Matrix
| Entity A | Entity B | Collision Type | Penalty / Reaction |
| :--- | :--- | :--- | :--- |
| Player | Road Pothole | Trigger Overlap | -45% current speed, 1.2s camera rattle & steering wobble |
| Player | Slow Lorry / Car | Bounding Box AABB | Elastic rebound impulse (-12 m/s), health penalty |
| Player | SmartTAG Ramp | Trigger Overlap | Launch airborne jump, grant 3.5s super boost |
| Player | Road Barrier | Clamped Position | Lateral velocity arrested, sparks emitted |
