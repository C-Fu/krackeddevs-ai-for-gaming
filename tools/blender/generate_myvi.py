"""
Blender 4.x / 5.x MCP Automation Script: Generate Low-Poly Malaysian Myvi Car
Can be executed via Blender MCP in Antigravity/OpenCode or directly via CLI:
blender --background --python tools/blender/generate_myvi.py
"""

import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_material(name, diffuse_color, roughness=0.3, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        # Base color RGBA
        bsdf.inputs['Base Color'].default_value = diffuse_color
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Metallic' in bsdf.inputs:
            bsdf.inputs['Metallic'].default_value = metallic
    return mat

def build_myvi():
    clean_scene()

    # Materials
    white_paint = create_material("MyviWhite", (0.95, 0.95, 0.97, 1.0), roughness=0.15, metallic=0.1)
    dark_trim = create_material("MyviDark", (0.05, 0.05, 0.06, 1.0), roughness=0.6)
    tinted_glass = create_material("MyviGlass", (0.08, 0.1, 0.15, 1.0), roughness=0.05)
    tire_rubber = create_material("MyviTire", (0.06, 0.06, 0.07, 1.0), roughness=0.8)
    alloy_rim = create_material("MyviRim", (0.7, 0.72, 0.75, 1.0), roughness=0.2, metallic=0.9)
    headlight_glow = create_material("MyviHeadlight", (1.0, 1.0, 0.9, 1.0), roughness=0.1)

    # 1. Lower Chassis
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.45))
    chassis = bpy.context.active_object
    chassis.name = "Myvi_Chassis"
    chassis.scale = (1.75, 3.6, 0.65)
    bpy.ops.object.transform_apply(scale=True)
    chassis.data.materials.append(white_paint)

    # 2. Cabin / Roof (Hatchback)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.2, 0.95))
    cabin = bpy.context.active_object
    cabin.name = "Myvi_Cabin"
    cabin.scale = (1.5, 2.1, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    cabin.data.materials.append(tinted_glass)

    # 3. King Myvi Iconic Rear Spoiler
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.25, 1.25))
    spoiler = bpy.context.active_object
    spoiler.name = "Myvi_Spoiler"
    spoiler.scale = (1.5, 0.35, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    spoiler.data.materials.append(dark_trim)

    # 4. Front Grille
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.82, 0.35))
    grille = bpy.context.active_object
    grille.name = "Myvi_Grille"
    grille.scale = (1.3, 0.12, 0.28)
    bpy.ops.object.transform_apply(scale=True)
    grille.data.materials.append(dark_trim)

    # 5. Wheels
    wheel_offsets = [
        (-0.9, 1.1, 0.28),
        (0.9, 1.1, 0.28),
        (-0.9, -1.1, 0.28),
        (0.9, -1.1, 0.28)
    ]

    for idx, (x, y, z) in enumerate(wheel_offsets):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.28, location=(x, y, z))
        wheel = bpy.context.active_object
        wheel.name = f"Wheel_{idx}"
        wheel.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(rotation=True)
        wheel.data.materials.append(tire_rubber)

    # Export to public/assets/models/myvi.glb
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "models"))
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "myvi.glb")

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    print(f"Successfully generated and exported King Myvi 3D model to: {output_path}")

if __name__ == "__main__":
    build_myvi()
