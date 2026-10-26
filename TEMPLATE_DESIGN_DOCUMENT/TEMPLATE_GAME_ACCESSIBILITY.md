# [Game Title] — Accessibility Guidelines

## 1. Multi-Input Parity
- **Full Keyboard Playability:** Arrow keys and WASD are mapped identically; spacebar and enter provide primary action triggers.
- **Touch / Mobile Friendly:** Responsive virtual joystick and touch action buttons appear automatically on mobile/touch displays.
- **Gamepad Support:** Standard HTML5 Gamepad API mapping for standard controllers.

## 2. Visual & Sensory Comfort
- **High Contrast HUD:** All UI text is outlined with black dropshadows (`text-shadow`) to maintain legibility against light/dark 3D backgrounds.
- **Screen Shake Toggle:** Ability to mute or disable camera rattle for players sensitive to motion sickness.
- **No Rapid Flashing Strobe:** Visual high-beam pulses and speed lines maintain safe contrast ratios to prevent photosensitive epileptic triggers.

## 3. Audio Accessibility
- **Full Visual Redundancy:** All audio events (horn, boost, hazard hit) are accompanied by onscreen text or floating particles.
- **One-Click Mute:** Easily accessible mute icon on the HUD and mapped to `M` key.
