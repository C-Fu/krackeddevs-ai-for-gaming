# 📋 AI Game Design Document & Specification Template Suite

*[Versi Bahasa Melayu ada di sini: README.ms-MY.md](README.ms-MY.md)*  
*Part of the [AI for Gaming Workshop Ecosystem](../README.md). Interactive Copilot Session: [Microsoft Copilot Design Suite](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)*

This folder contains a modular, battle-tested suite of **AI-Ready Game Design Document (GDD) and Technical Design Document (TDD) Templates** created for rapid game prototyping with autonomous coding agents ([Google Antigravity](https://antigravity.google/), [OpenCode](https://opencode.ai/), and [Blender MCP](https://github.com/ahujasid/mcp-for-blender)).

---

## 🌟 The #1 Pro-Tip: "Ask Me Relevant Questions"

When brainstorming or architecting a new game with an LLM (Microsoft Copilot, Gemini, ChatGPT, Claude), **never prompt the AI to generate a complete Game Design Document in a single turn**.

### Why Single-Shot Prompting Fails
When given a prompt like `"Write me a Game Design Document for a 3D racing game"`, the LLM has zero boundaries. It will hallucinate a massive open-world multiplayer RPG with procedural weather, dynamic economies, and vehicle tuning trees—resulting in **scope creep** that overwhelms beginners and breaks AI coding agents.

### The Consultative Prompting Pattern
Instead, anchor the AI into an **interactive design interview** before writing any documentation:

```text
"I want to design a lightweight 3D web game about [INSERT HIGH-LEVEL CONCEPT]. 
Before creating the game design documents, act as a veteran Lead Game Designer 
and ASK ME RELEVANT QUESTIONS to scope the target audience, core loop, 
unique selling proposition (USP), platform constraints, and art style."
```

### The Proven Dialogue Loop (As Seen in Live Workshop)
1. **The AI's Diagnostic Q&A:** The AI interviews you with 4–6 targeted questions:
   - Who is the specific target persona? (e.g., Casual high school student playing during lunch break).
   - What are the 1–2 Unique Selling Propositions (USPs)? (e.g., High-beam flashing or dry ice bombs).
   - What is the technical platform and performance budget? (e.g., WebGL/WebGPU in browser, 60 FPS on mobile, zero backend).
   - What are the session length and win/loss rules? (e.g., 60-second countdown timer).
2. **Deterministic Constraint Locking:** You answer each question with 1–2 bullet points.
3. **Modular Document Generation:** With strict boundaries established, the AI outputs modular, unambiguous markdown specifications with exact physics constants and state machines.
4. **Agentic Code Execution:** You pass the completed markdown files into an agentic IDE ([Google Antigravity](https://antigravity.google/) or [OpenCode](https://opencode.ai/)), which builds the game without hallucinating features.

*Review the live session transcript: [Copilot Design Document Session](https://copilot.microsoft.com/conversations/join/a8PJA1mSSRu5JoSRYExV7)*

---

## 📂 Template Suite Structure

### 🛠️ Core Blank Templates (Copy & Populate for Your Game)
| Template | Purpose |
| :--- | :--- |
| **[`TEMPLATE_GAME_DESIGN_DOCUMENT.md`](TEMPLATE_GAME_DESIGN_DOCUMENT.md)** | Master high-concept document: premise, persona, core loop, USPs, art direction, and win conditions. |
| **[`TEMPLATE_TECHNICAL_DESIGN_DOCUMENT.md`](TEMPLATE_TECHNICAL_DESIGN_DOCUMENT.md)** | Technical architecture: engine choice, module breakdown, entity systems, and data flow. |
| **[`TEMPLATE_GAME_MECHANICS.md`](TEMPLATE_GAME_MECHANICS.md)** | Detailed player inputs, action state machines, combat/tools, power-ups, and scoring formulas. |
| **[`TEMPLATE_GAME_PHYSICS.md`](TEMPLATE_GAME_PHYSICS.md)** | Numerical physics constants: acceleration, braking, friction, projectile trajectories, and collision layers. |
| **[`TEMPLATE_GAME_TECH_STACK.md`](TEMPLATE_GAME_TECH_STACK.md)** | Web 3D runtime (Babylon.js / Three.js), procedural audio APIs, asset pipeline, and static hosting. |
| **[`TEMPLATE_GAME_UI_UX.md`](TEMPLATE_GAME_UI_UX.md)** | HUD wireframe, responsive touch controls, color tokens, and juice/screen-shake feedback. |
| **[`TEMPLATE_GAME_ASSETS.md`](TEMPLATE_GAME_ASSETS.md)** | 3D mesh polygon budget, Blender MCP procedural generation rules, and procedural Web Audio SFX. |
| **[`TEMPLATE_GAME_TESTING.md`](TEMPLATE_GAME_TESTING.md)** | QA verification matrix, physics boundary edge cases, and cross-browser framerate benchmarks. |
| **[`TEMPLATE_GAME_ACCESSIBILITY.md`](TEMPLATE_GAME_ACCESSIBILITY.md)** | Mobile touch parity, high-contrast visibility, audio toggle fallbacks, and motor simplicity. |

---

## 🎮 Completed Workshop Case Studies (Real Examples)

| Example Game | Genre & Engine | Highlights & USPs | Reference Spec |
| :--- | :--- | :--- | :--- |
| **King Myvi: Highway Legends** | 3D Arcade Highway Racer (Babylon.js 7) | High-Beam Flash weapon, SmartTAG ramp jumps, authentic Gen 3 Myvi 3D model via Blender MCP | [`EXAMPLE_1_HIGHWAY_LEGENDS_MYVI.md`](EXAMPLE_1_HIGHWAY_LEGENDS_MYVI.md) |
| **Makcik Canteen: Haze Fighter** | 3D Action Arcade (Babylon.js 7) | Industrial blower fan, cryogenic dry ice bombs, dynamic API smog fog, 60s recess timer | [`EXAMPLE_2_MAKCIK_CANTEEN_HAZE_FIGHTER.md`](EXAMPLE_2_MAKCIK_CANTEEN_HAZE_FIGHTER.md) |
| **Neon Kart 3D** | 3D Kart Racer (Three.js + Vite) | Drift mini-turbo sparks, floating item boxes (boost, shield, oil slick), AI waypoint rivals | [`EXAMPLE_3_NEON_KART_3D.md`](EXAMPLE_3_NEON_KART_3D.md) |

---

## 🚀 How to Use These Templates in a Live Workshop

1. **Step 1:** Copy this `TEMPLATE_DESIGN_DOCUMENT/` folder into your new project repository.
2. **Step 2:** Start a conversation with your LLM using the [Consultative Prompt Pattern](#the-consultative-prompting-pattern).
3. **Step 3:** Paste the AI's scoped answers directly into the respective template markdown files.
4. **Step 4:** Open your coding agent ([Google Antigravity](https://antigravity.google/) or [OpenCode](https://opencode.ai/)) and instruct it:
   > *"Read `TEMPLATE_GAME_DESIGN_DOCUMENT.md` and `TEMPLATE_GAME_MECHANICS.md`. Scaffold a playable web prototype matching all physics constants and control schemas."*
