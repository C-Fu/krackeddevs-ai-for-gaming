# Blender MCP & Procedural Pipeline Guide
## King Myvi: Highway Legends

This directory contains the automation scripts for generating the 3D assets for the game.

### Option 1: Running via Blender MCP (Model Context Protocol)
In Antigravity or OpenCode, ensure your Blender MCP server is connected:
1. Start the Blender MCP bridge (listening on port 9876 or stdio).
2. Ask Antigravity:
   > *"Run the `generate_myvi.py` script inside Blender to update the car's spoiler and materials, then export to `public/assets/models/myvi.glb`."*

### Option 2: Running via Command Line (CLI Batch Mode)
You can run Blender in headless mode to regenerate all 3D assets with zero GUI overhead:
```bash
# Windows
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python tools/blender/generate_myvi.py
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python tools/blender/generate_environment.py

# macOS
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/blender/generate_myvi.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/blender/generate_environment.py
```

### Generated Assets
* `public/assets/models/myvi.glb` — Low-poly Perodua Myvi with custom roof spoiler, wheels, and materials.
* `public/assets/models/palm_tree.glb` — Roadside oil palm trees for Malaysian PLUS highway atmosphere.
* `public/assets/models/overhead_gantry.glb` — Highway overhead signage structure.
