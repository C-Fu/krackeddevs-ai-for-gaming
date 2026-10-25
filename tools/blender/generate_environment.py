"""
Blender 4.x / 5.x MCP Script: Generate Low-Poly Malaysian Highway Environment Assets
Exports: palm_tree.glb, overhead_gantry.glb, toll_plaza.glb
"""

import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_mat(name, color, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
    return mat

def export_mesh(output_name):
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "models"))
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, output_name)
    bpy.ops.export_scene.gltf(filepath=out_file, export_format='GLB', use_selection=False)
    print(f"Exported: {out_file}")

def build_palm_tree():
    clean_scene()
    bark_mat = create_mat("PalmBark", (0.35, 0.22, 0.12, 1.0))
    leaf_mat = create_mat("PalmLeaf", (0.08, 0.45, 0.15, 1.0))

    # Trunk
    bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=6.5, location=(0, 0, 3.25))
    trunk = bpy.context.active_object
    trunk.data.materials.append(bark_mat)

    # Fronds
    for i in range(6):
        angle = (i * math.pi) / 3
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(math.sin(angle)*1.5, math.cos(angle)*1.5, 6.5))
        frond = bpy.context.active_object
        frond.scale = (0.8, 3.2, 0.08)
        frond.rotation_euler = (0.35, 0, angle)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        frond.data.materials.append(leaf_mat)

    export_mesh("palm_tree.glb")

def build_overhead_gantry():
    clean_scene()
    steel_mat = create_mat("GantrySteel", (0.6, 0.62, 0.65, 1.0))
    sign_mat = create_mat("PlusGreenSign", (0.02, 0.45, 0.18, 1.0))

    # Left & Right Pillars
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=7.0, location=(-10.5, 0, 3.5))
    pillar_l = bpy.context.active_object
    pillar_l.data.materials.append(steel_mat)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=7.0, location=(10.5, 0, 3.5))
    pillar_r = bpy.context.active_object
    pillar_r.data.materials.append(steel_mat)

    # Top Beam
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 6.8))
    beam = bpy.context.active_object
    beam.scale = (21.5, 0.5, 0.5)
    bpy.ops.object.transform_apply(scale=True)
    beam.data.materials.append(steel_mat)

    # Green Malaysian Highway Board
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 5.5))
    sign = bpy.context.active_object
    sign.scale = (14.0, 0.2, 2.2)
    bpy.ops.object.transform_apply(scale=True)
    sign.data.materials.append(sign_mat)

    export_mesh("overhead_gantry.glb")

if __name__ == "__main__":
    build_palm_tree()
    build_overhead_gantry()
