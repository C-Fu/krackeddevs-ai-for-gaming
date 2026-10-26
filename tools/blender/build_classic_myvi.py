"""
Procedural 3D Model: Classic Perodua Myvi (Old Generation / HUM3D Reference Specification)
Strictly adheres to user technical breakdown:
- Compact 5-door hatchback, tall cabin proportions relative to width
- Large near-vertical tailgate with integrated rear windshield and single rear wiper at bottom center
- Subtle roof-mounted lip spoiler
- Tall vertical angular tail lamps extending from bumper line up toward roofline along the rear corners
- Thick body-colored C-pillar supporting hatch structure
- Rounded rear fender with subtle flared wheel arches
- Smooth body-colored bumper with horizontal shadow crease and corner reflectors, hidden exhaust
- Badges: Center 'MYVI' badge, Perodua emblem, and 'HUM3D' license plate in rectangular recess
"""

import socket
import json
import os
import sys

BLENDER_CODE = r'''
import bpy
import math
import mathutils
import os
import shutil

def build_classic_myvi():
    # -------------------------------------------------------------
    # 0. CLEANUP SCENE MESHES
    # -------------------------------------------------------------
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat, do_unlink=True)

    # -------------------------------------------------------------
    # 1. MATERIALS SETUP (Exact palette from technical breakdown)
    # -------------------------------------------------------------
    def create_mat(name, color, metallic=0.0, roughness=0.3, emissive=(0, 0, 0, 1), emissive_strength=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            if "Base Color" in bsdf.inputs:
                bsdf.inputs["Base Color"].default_value = color
            if "Metallic" in bsdf.inputs:
                bsdf.inputs["Metallic"].default_value = metallic
            if "Roughness" in bsdf.inputs:
                bsdf.inputs["Roughness"].default_value = roughness
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emissive
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emissive_strength
        return mat

    # Materials
    mat_red = create_mat("Myvi_GlossRed", (0.78, 0.05, 0.08, 1.0), metallic=0.35, roughness=0.18)
    mat_crease = create_mat("Myvi_DarkCrease", (0.45, 0.03, 0.05, 1.0), metallic=0.2, roughness=0.3)
    mat_glass = create_mat("Myvi_TintedGlass", (0.04, 0.06, 0.09, 1.0), metallic=0.15, roughness=0.05)
    mat_trim_black = create_mat("Myvi_BlackTrim", (0.08, 0.08, 0.08, 1.0), metallic=0.0, roughness=0.75)
    mat_chrome = create_mat("Myvi_Chrome", (0.95, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.08)
    mat_taillight_red = create_mat("Myvi_TaillightRed", (0.95, 0.02, 0.02, 1.0), metallic=0.1, roughness=0.12, emissive=(0.95, 0.02, 0.02, 1.0), emissive_strength=1.4)
    mat_taillight_clear = create_mat("Myvi_TaillightClear", (0.92, 0.92, 0.95, 1.0), metallic=0.05, roughness=0.15)
    mat_amber = create_mat("Myvi_AmberIndicator", (1.0, 0.55, 0.02, 1.0), metallic=0.1, roughness=0.2, emissive=(1.0, 0.55, 0.02, 1.0), emissive_strength=1.2)
    mat_headlight = create_mat("Myvi_Headlight", (1.0, 1.0, 0.98, 1.0), metallic=0.2, roughness=0.1, emissive=(1.0, 1.0, 0.98, 1.0), emissive_strength=2.0)
    mat_alloy = create_mat("Myvi_AlloySilver", (0.82, 0.83, 0.85, 1.0), metallic=0.88, roughness=0.22)
    mat_tire = create_mat("Myvi_TireRubber", (0.09, 0.09, 0.09, 1.0), metallic=0.0, roughness=0.85)
    mat_plate_bg = create_mat("Myvi_PlateBG", (0.05, 0.05, 0.05, 1.0), metallic=0.0, roughness=0.5)
    mat_plate_text = create_mat("Myvi_PlateWhite", (0.95, 0.95, 0.95, 1.0), metallic=0.0, roughness=0.3)

    # Root Empty Object
    root = bpy.data.objects.new("Perodua_Myvi_Classic", None)
    bpy.context.scene.collection.objects.link(root)

    def link_obj(obj, parent=root):
        obj.parent = parent
        return obj

    def make_mesh_obj(name, verts, faces, mat):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj.data.materials.append(mat)
        obj.parent = root
        return obj

    # =============================================================
    # 2. MAIN BODY TUB & PROPORTIONS
    # Proportions: Compact 5-door, short rear overhang, tall cabin
    # Length: front nose +1.80, rear bumper -1.68. Width: 1.66m (X: -0.83 to +0.83).
    # Height: 1.55m (tall boy packaging).
    # =============================================================

    # Lower Body Tub (Front cowl to rear bumper base)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.04, 0.52))
    tub = bpy.context.active_object
    tub.name = "Body_Tub"
    tub.scale = (1.66, 3.28, 0.52)
    bpy.ops.object.transform_apply(scale=True)
    tub.data.materials.append(mat_red)
    link_obj(tub)

    # Beltline Crease on Side (Runs from front fender to taillamp)
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.835, 0.02, 0.80))
        beltline = bpy.context.active_object
        beltline.name = f"Beltline_Crease_{'L' if side < 0 else 'R'}"
        beltline.scale = (0.015, 3.10, 0.035)
        bpy.ops.object.transform_apply(scale=True)
        beltline.data.materials.append(mat_crease)
        link_obj(beltline)

        # Visible Door Shutlines (Conventional hinged front & rear doors)
        # Front door line
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.836, 0.05, 0.55))
        shut1 = bpy.context.active_object
        shut1.name = f"Shutline_B_Pillar_{'L' if side < 0 else 'R'}"
        shut1.scale = (0.008, 0.015, 0.50)
        bpy.ops.object.transform_apply(scale=True)
        shut1.data.materials.append(mat_trim_black)
        link_obj(shut1)

        # Rear door line
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.836, -0.68, 0.55))
        shut2 = bpy.context.active_object
        shut2.name = f"Shutline_C_Pillar_{'L' if side < 0 else 'R'}"
        shut2.scale = (0.008, 0.015, 0.50)
        bpy.ops.object.transform_apply(scale=True)
        shut2.data.materials.append(mat_trim_black)
        link_obj(shut2)

    # Rounded Contoured Wheel Arches with Subtle Flared Bulge
    # Front wheel: Y = 1.12, Rear wheel: Y = -1.10
    for side in (-1, 1):
        for wy, label in [(1.12, "Front"), (-1.10, "Rear")]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.44, depth=0.06, location=(side * 0.83, wy, 0.36))
            arch = bpy.context.active_object
            arch.name = f"WheelArch_Flare_{label}_{'L' if side < 0 else 'R'}"
            arch.rotation_euler = (0, math.pi / 2, 0)
            arch.scale = (1.0, 1.08, 1.0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            arch.data.materials.append(mat_red)
            link_obj(arch)

    # Curved Front Hood (Slopes down smoothly to front grille)
    hood_verts = [
        (-0.76,  0.55, 0.84), # Cowl L
        ( 0.76,  0.55, 0.84), # Cowl R
        ( 0.68,  1.72, 0.68), # Nose R
        (-0.68,  1.72, 0.68), # Nose L
        (-0.80,  0.55, 0.72), # Under Cowl L
        ( 0.80,  0.55, 0.72), # Under Cowl R
        ( 0.72,  1.72, 0.60), # Under Nose R
        (-0.72,  1.72, 0.60)  # Under Nose L
    ]
    hood_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 3, 7, 4),
        (1, 5, 6, 2), (3, 2, 6, 7), (0, 4, 5, 1)
    ]
    make_mesh_obj("Body_Hood", hood_verts, hood_faces, mat_red)

    # Front Bumper & Lower Grille
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.76, 0.44))
    f_bumper = bpy.context.active_object
    f_bumper.name = "Bumper_Front"
    f_bumper.scale = (1.64, 0.22, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    f_bumper.data.materials.append(mat_red)
    link_obj(f_bumper)

    # Lower front center air intake
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.83, 0.34))
    f_intake = bpy.context.active_object
    f_intake.name = "Front_Air_Dam"
    f_intake.scale = (1.10, 0.12, 0.18)
    bpy.ops.object.transform_apply(scale=True)
    f_intake.data.materials.append(mat_trim_black)
    link_obj(f_intake)

    # Upper Grille with Chrome Bar & Perodua Emblem
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.78, 0.65))
    grille_bar = bpy.context.active_object
    grille_bar.name = "Front_Grille_Chrome_Bar"
    grille_bar.scale = (1.15, 0.08, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    grille_bar.data.materials.append(mat_chrome)
    link_obj(grille_bar)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.04, location=(0, 1.82, 0.65))
    f_badge = bpy.context.active_object
    f_badge.name = "Perodua_Badge_Front"
    f_badge.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    f_badge.data.materials.append(mat_chrome)
    link_obj(f_badge)

    # Friendly Teardrop Front Headlamps
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.65, 1.68, 0.68))
        hl = bpy.context.active_object
        hl.name = f"Headlamp_{'L' if side < 0 else 'R'}"
        hl.scale = (0.32, 0.22, 0.16)
        hl.rotation_euler = (-0.12, side * 0.12, side * 0.15)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        hl.data.materials.append(mat_headlight)
        link_obj(hl)

    # =============================================================
    # 3. TALL CABIN GREENHOUSE, MILDLY CURVED ROOFLINE & C-PILLAR
    # Key requirements:
    # - "Proportions: tall cabin height relative to width, interior space"
    # - "Roofline: Mildly curved, tapering toward rear hatch"
    # - "C-Pillar: Thick, painted body color, supporting hatch structure"
    # - "Rear door: conventional hinged door, window tapering upward toward rear pillar"
    # =============================================================

    # Curved Roof Cap (Mild curve peak at Y = -0.30, Z = 1.54, tapering to Z = 1.48 at rear)
    roof_verts = [
        # Front Cowl edge (A-pillar top)
        (-0.64,  0.18, 1.50), # 0
        ( 0.64,  0.18, 1.50), # 1
        # Mid-Roof peak
        (-0.65, -0.40, 1.54), # 2
        ( 0.65, -0.40, 1.54), # 3
        # Rear Roof Edge (tapering to hatch)
        (-0.63, -1.38, 1.48), # 4
        ( 0.63, -1.38, 1.48), # 5
        # Under-layer for thickness
        (-0.64,  0.18, 1.45), # 6
        ( 0.64,  0.18, 1.45), # 7
        (-0.65, -0.40, 1.49), # 8
        ( 0.65, -0.40, 1.49), # 9
        (-0.63, -1.38, 1.43), # 10
        ( 0.63, -1.38, 1.43)  # 11
    ]
    roof_faces = [
        (0, 1, 3, 2), # Front roof half
        (2, 3, 5, 4), # Rear roof half
        (6, 8, 9, 7), # Front under
        (8, 10, 11, 9), # Rear under
        (0, 2, 8, 6), # L side front
        (2, 4, 10, 8), # L side rear
        (1, 7, 9, 3), # R side front
        (3, 9, 11, 5), # R side rear
        (0, 6, 7, 1), # Front leading edge
        (4, 5, 11, 10) # Rear trailing edge
    ]
    make_mesh_obj("Body_Roof", roof_verts, roof_faces, mat_red)

    # Front Raked Windshield
    windshield_verts = [
        (-0.73,  0.55, 0.84), # Cowl L
        ( 0.73,  0.55, 0.84), # Cowl R
        ( 0.63,  0.18, 1.49), # Top R
        (-0.63,  0.18, 1.49)  # Top L
    ]
    make_mesh_obj("Glass_Windshield", windshield_verts, [(0, 1, 2, 3)], mat_glass)

    # A-Pillars (Body Colored Red)
    for side in (-1, 1):
        ap_verts = [
            (side * 0.74, 0.55, 0.84),
            (side * 0.68, 0.55, 0.84),
            (side * 0.59, 0.18, 1.50),
            (side * 0.65, 0.18, 1.50),
            (side * 0.76, 0.52, 0.84),
            (side * 0.70, 0.52, 0.84),
            (side * 0.61, 0.15, 1.50),
            (side * 0.67, 0.15, 1.50)
        ]
        ap_faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3), (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)]
        make_mesh_obj(f"A_Pillar_{'L' if side < 0 else 'R'}", ap_verts, ap_faces, mat_red)

    # Side Door Windows (Tapering upward toward C-Pillar)
    for side in (-1, 1):
        # Front door window
        fd_verts = [
            (side * 0.81,  0.50, 0.84),
            (side * 0.81,  0.08, 0.84),
            (side * 0.64,  0.08, 1.48),
            (side * 0.63,  0.22, 1.48)
        ]
        make_mesh_obj(f"Glass_FrontDoor_{'L' if side < 0 else 'R'}", fd_verts, [(0, 1, 2, 3) if side < 0 else (0, 3, 2, 1)], mat_glass)

        # Black B-Pillar Divider
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.75, 0.05, 1.15))
        bp = bpy.context.active_object
        bp.name = f"B_Pillar_{'L' if side < 0 else 'R'}"
        bp.scale = (0.04, 0.08, 0.64)
        bpy.ops.object.transform_apply(scale=True)
        bp.data.materials.append(mat_trim_black)
        link_obj(bp)

        # Rear door window (tapering upward toward rear pillar)
        rd_verts = [
            (side * 0.81,  0.02, 0.84), # front bottom
            (side * 0.81, -0.65, 0.88), # rear bottom (kicks upward!)
            (side * 0.65, -0.65, 1.38), # rear top (tapered)
            (side * 0.64,  0.02, 1.48)  # front top
        ]
        make_mesh_obj(f"Glass_RearDoor_{'L' if side < 0 else 'R'}", rd_verts, [(0, 1, 2, 3) if side < 0 else (0, 3, 2, 1)], mat_glass)

        # -------------------------------------------------------------
        # THICK BODY-COLORED C-PILLAR (Key Defining Characteristic!)
        # Spans from Y = -0.65 to Y = -1.38, supporting hatch structure
        # -------------------------------------------------------------
        cp_verts = [
            (side * 0.82, -0.66, 0.84), # Front base at beltline
            (side * 0.82, -1.38, 0.84), # Rear base at taillamp top
            (side * 0.64, -1.38, 1.48), # Rear roof junction
            (side * 0.65, -0.66, 1.48), # Front roof junction
            (side * 0.76, -0.66, 0.84), # Inner thickness
            (side * 0.76, -1.38, 0.84),
            (side * 0.60, -1.38, 1.44),
            (side * 0.60, -0.66, 1.44)
        ]
        cp_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
        ]
        make_mesh_obj(f"C_Pillar_Thick_{'L' if side < 0 else 'R'}", cp_verts, cp_faces, mat_red)

    # =============================================================
    # 4. REAR SECTION (Near-Vertical Tailgate, Glass, Spoiler & Wiper)
    # Key requirements:
    # - "Tailgate: Large, near-vertical hatch with integrated rear windshield"
    # - "Rear Glass: Wide, slightly trapezoidal; single rear wiper at bottom center"
    # - "Spoiler: Subtle roof-mounted lip spoiler extending slightly beyond rear glass"
    # =============================================================

    # Subtle Roof-Mounted Lip Spoiler (Extends slightly beyond rear glass)
    spoiler_verts = [
        (-0.66, -1.34, 1.49),
        ( 0.66, -1.34, 1.49),
        ( 0.68, -1.48, 1.48), # Slight rearward lip overhang
        (-0.68, -1.48, 1.48),
        (-0.65, -1.34, 1.44),
        ( 0.65, -1.34, 1.44),
        ( 0.67, -1.47, 1.43),
        (-0.67, -1.47, 1.43)
    ]
    spoiler_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
        (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
    ]
    make_mesh_obj("Spoiler_Lip_Roof", spoiler_verts, spoiler_faces, mat_red)

    # Black trim underside of spoiler
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.43, 1.43))
    sp_trim = bpy.context.active_object
    sp_trim.name = "Spoiler_Trim_Underside"
    sp_trim.scale = (1.30, 0.08, 0.02)
    bpy.ops.object.transform_apply(scale=True)
    sp_trim.data.materials.append(mat_trim_black)
    link_obj(sp_trim)

    # Integrated High-Mount Center Brake LED (Under lip)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.45, 1.44))
    hmsl = bpy.context.active_object
    hmsl.name = "Spoiler_HMSL_LED"
    hmsl.scale = (0.34, 0.03, 0.02)
    bpy.ops.object.transform_apply(scale=True)
    hmsl.data.materials.append(mat_taillight_red)
    link_obj(hmsl)

    # Large Near-Vertical Rear Glass (Wide, slightly trapezoidal)
    # Starts at Y = -1.38, Z = 1.46 (top), ends at Y = -1.46, Z = 0.94 (bottom) -> steep 82° angle!
    rear_glass_verts = [
        (-0.62, -1.38, 1.46), # Top L
        ( 0.62, -1.38, 1.46), # Top R
        ( 0.68, -1.46, 0.94), # Bottom R (wider trapezoid)
        (-0.68, -1.46, 0.94)  # Bottom L
    ]
    make_mesh_obj("Glass_RearWindshield", rear_glass_verts, [(0, 1, 2, 3)], mat_glass)

    # Black Ceramic Border / Window Seal
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.47, 0.93))
    glass_seal = bpy.context.active_object
    glass_seal.name = "Glass_Rear_Seal"
    glass_seal.scale = (1.38, 0.03, 0.03)
    bpy.ops.object.transform_apply(scale=True)
    glass_seal.data.materials.append(mat_trim_black)
    link_obj(glass_seal)

    # Single Rear Wiper Mounted at Bottom Center (Essential technical requirement!)
    # Wiper Pivot Mount Hub
    bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=0.04, location=(0.0, -1.48, 0.93))
    wiper_hub = bpy.context.active_object
    wiper_hub.name = "Rear_Wiper_Hub"
    wiper_hub.rotation_euler = (math.radians(82), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    wiper_hub.data.materials.append(mat_trim_black)
    link_obj(wiper_hub)

    # Wiper Arm (Angled across lower glass)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.14, -1.475, 1.02))
    wiper_arm = bpy.context.active_object
    wiper_arm.name = "Rear_Wiper_Arm"
    wiper_arm.scale = (0.018, 0.015, 0.22)
    wiper_arm.rotation_euler = (math.radians(-8), math.radians(35), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    wiper_arm.data.materials.append(mat_trim_black)
    link_obj(wiper_arm)

    # Horizontal Wiper Blade
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.20, -1.47, 1.10))
    wiper_blade = bpy.context.active_object
    wiper_blade.name = "Rear_Wiper_Blade"
    wiper_blade.scale = (0.28, 0.012, 0.018)
    wiper_blade.rotation_euler = (math.radians(-8), math.radians(12), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    wiper_blade.data.materials.append(mat_trim_black)
    link_obj(wiper_blade)

    # Tailgate Main Lower Hatch Panel (Flat plane with slight convex curvature)
    tailgate_verts = [
        (-0.70, -1.46, 0.94), # Top L
        ( 0.70, -1.46, 0.94), # Top R
        ( 0.72, -1.52, 0.62), # Bottom R
        (-0.72, -1.52, 0.62), # Bottom L
        (-0.68, -1.42, 0.94),
        ( 0.68, -1.42, 0.94),
        ( 0.70, -1.48, 0.62),
        (-0.70, -1.48, 0.62)
    ]
    tailgate_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
        (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
    ]
    make_mesh_obj("Tailgate_Lower_Panel", tailgate_verts, tailgate_faces, mat_red)

    # Badges on Tailgate:
    # 1. Perodua Chrome Emblem (Upper center below glass)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.03, location=(0, -1.49, 0.88))
    badge_rear = bpy.context.active_object
    badge_rear.name = "Badge_Perodua_Tailgate"
    badge_rear.rotation_euler = (math.radians(90), 0, 0)
    badge_rear.scale = (1.2, 0.85, 1.0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    badge_rear.data.materials.append(mat_chrome)
    link_obj(badge_rear)

    # 2. 'MYVI' Chrome Badge (Center left/mid)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.35, -1.50, 0.80))
    myvi_text = bpy.context.active_object
    myvi_text.name = "Badge_MYVI_Text"
    myvi_text.scale = (0.24, 0.015, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    myvi_text.data.materials.append(mat_chrome)
    link_obj(myvi_text)

    # 3. License Plate Recess with Plate 'HUM3D'
    # Recessed Alcove
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.51, 0.58))
    plate_recess = bpy.context.active_object
    plate_recess.name = "License_Plate_Recess"
    plate_recess.scale = (0.52, 0.05, 0.18)
    bpy.ops.object.transform_apply(scale=True)
    plate_recess.data.materials.append(mat_crease)
    link_obj(plate_recess)

    # Number Plate Frame & 'HUM3D' Plate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.53, 0.58))
    plate_bg = bpy.context.active_object
    plate_bg.name = "License_Plate_HUM3D"
    plate_bg.scale = (0.46, 0.02, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    plate_bg.data.materials.append(mat_plate_bg)
    link_obj(plate_bg)

    # White embossed plate lettering representation
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.542, 0.58))
    plate_txt = bpy.context.active_object
    plate_txt.name = "Plate_Text_HUM3D"
    plate_txt.scale = (0.36, 0.008, 0.07)
    bpy.ops.object.transform_apply(scale=True)
    plate_txt.data.materials.append(mat_plate_text)
    link_obj(plate_txt)

    # =============================================================
    # 5. TALL VERTICAL TAIL LAMPS (Extends from bumper up toward roof)
    # Key requirements:
    # - "Tail Lamps: Angular, vertically oriented clusters wrapping around rear corners"
    # - "Design: Red housing with clear segments for indicators/reverse lights"
    # - "Position: Extends from bumper line up toward roofline"
    # =============================================================

    for side in (-1, 1):
        # Tall Column Housing (Z: 0.64 to 1.35)
        # Red Upper Cluster (HMSL / Brake)
        tl_up_verts = [
            (side * 0.72, -1.44, 1.35), # Top Inner
            (side * 0.83, -1.38, 1.35), # Top Outer (wrapped)
            (side * 0.83, -1.42, 0.98), # Mid Outer
            (side * 0.72, -1.48, 0.98), # Mid Inner
            (side * 0.69, -1.40, 1.35),
            (side * 0.80, -1.34, 1.35),
            (side * 0.80, -1.38, 0.98),
            (side * 0.69, -1.44, 0.98)
        ]
        tl_up_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
        ]
        make_mesh_obj(f"TailLamp_UpperRed_{'L' if side < 0 else 'R'}", tl_up_verts, tl_up_faces, mat_taillight_red)

        # Clear / Amber Center Segment (Indicators & Reverse lights)
        tl_mid_verts = [
            (side * 0.72, -1.48, 0.98),
            (side * 0.83, -1.42, 0.98),
            (side * 0.83, -1.46, 0.78),
            (side * 0.72, -1.51, 0.78),
            (side * 0.70, -1.44, 0.98),
            (side * 0.80, -1.38, 0.98),
            (side * 0.80, -1.42, 0.78),
            (side * 0.70, -1.47, 0.78)
        ]
        tl_mid_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
        ]
        make_mesh_obj(f"TailLamp_ClearSegment_{'L' if side < 0 else 'R'}", tl_mid_verts, tl_mid_faces, mat_taillight_clear)

        # Orange indicator bulb inside clear segment
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.04, location=(side * 0.77, -1.46, 0.88))
        ind_bulb = bpy.context.active_object
        ind_bulb.name = f"Indicator_Bulb_{'L' if side < 0 else 'R'}"
        ind_bulb.rotation_euler = (math.pi / 2, 0, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        ind_bulb.data.materials.append(mat_amber)
        link_obj(ind_bulb)

        # Red Lower Cluster (Tail / Rear Fog)
        tl_low_verts = [
            (side * 0.72, -1.51, 0.78),
            (side * 0.83, -1.46, 0.78),
            (side * 0.83, -1.49, 0.64), # Extends right to bumper line!
            (side * 0.72, -1.53, 0.64),
            (side * 0.70, -1.47, 0.78),
            (side * 0.80, -1.42, 0.78),
            (side * 0.80, -1.45, 0.64),
            (side * 0.70, -1.49, 0.64)
        ]
        tl_low_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
        ]
        make_mesh_obj(f"TailLamp_LowerRed_{'L' if side < 0 else 'R'}", tl_low_verts, tl_low_faces, mat_taillight_red)

    # =============================================================
    # 6. LOWER REAR BUMPER, SHADOW CREASE & CORNER REFLECTORS
    # Key requirements:
    # - "Bumper: Smooth, body-colored with integrated shadow line"
    # - "No visible exhaust pipe (hidden beneath)"
    # - "Subtle crease for diffuser styling"
    # - "Reflectors: Small rectangular inserts at bumper corners"
    # =============================================================

    # Main Rear Bumper Body (Smooth, body-colored)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.56, 0.42))
    r_bumper = bpy.context.active_object
    r_bumper.name = "Bumper_Rear"
    r_bumper.scale = (1.68, 0.22, 0.36)
    bpy.ops.object.transform_apply(scale=True)
    r_bumper.data.materials.append(mat_red)
    link_obj(r_bumper)

    # Horizontal Shadow Crease / Diffuser Styling Line
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.63, 0.38))
    shadow_line = bpy.context.active_object
    shadow_line.name = "Bumper_Shadow_Line"
    shadow_line.scale = (1.56, 0.05, 0.025)
    bpy.ops.object.transform_apply(scale=True)
    shadow_line.data.materials.append(mat_crease)
    link_obj(shadow_line)

    # Subtle Lower Diffuser Apron (Smooth integrated body color, no visible exhaust!)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.61, 0.26))
    diffuser = bpy.context.active_object
    diffuser.name = "Diffuser_Apron_Clean"
    diffuser.scale = (1.20, 0.12, 0.10)
    bpy.ops.object.transform_apply(scale=True)
    diffuser.data.materials.append(mat_red)
    link_obj(diffuser)

    # Small Rectangular Corner Reflectors
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.68, -1.66, 0.34))
        refl = bpy.context.active_object
        refl.name = f"Reflector_Corner_{'L' if side < 0 else 'R'}"
        refl.scale = (0.16, 0.025, 0.055)
        bpy.ops.object.transform_apply(scale=True)
        refl.data.materials.append(mat_taillight_red)
        link_obj(refl)

    # =============================================================
    # 7. SIDE MIRRORS & DOOR HANDLES
    # =============================================================
    for side in (-1, 1):
        # Body-colored wing mirror
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.86, 0.40, 0.96))
        mirror = bpy.context.active_object
        mirror.name = f"Mirror_Body_{'L' if side < 0 else 'R'}"
        mirror.scale = (0.18, 0.14, 0.10)
        mirror.rotation_euler = (0, 0, side * 0.15)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        mirror.data.materials.append(mat_red)
        link_obj(mirror)

        # Mirror glass
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.85, 0.37, 0.96))
        m_glass = bpy.context.active_object
        m_glass.name = f"Mirror_Glass_{'L' if side < 0 else 'R'}"
        m_glass.scale = (0.16, 0.02, 0.08)
        bpy.ops.object.transform_apply(scale=True)
        m_glass.data.materials.append(mat_chrome)
        link_obj(m_glass)

        # Door handles (Front and rear conventional doors)
        for dy in (0.24, -0.42):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.84, dy, 0.82))
            handle = bpy.context.active_object
            handle.name = f"Door_Handle_{dy}_{'L' if side < 0 else 'R'}"
            handle.scale = (0.04, 0.12, 0.035)
            bpy.ops.object.transform_apply(scale=True)
            handle.data.materials.append(mat_red)
            link_obj(handle)

    # =============================================================
    # 8. WHEELS & ALLOY RIMS (Compact 14/15-inch 6-Spoke Alloys)
    # =============================================================
    wheel_coords = [
        ("Front_L", -0.82,  1.12, 0.32),
        ("Front_R",  0.82,  1.12, 0.32),
        ("Rear_L",  -0.82, -1.10, 0.32),
        ("Rear_R",   0.82, -1.10, 0.32)
    ]

    for w_name, wx, wy, wz in wheel_coords:
        # Rubber Tire
        bpy.ops.mesh.primitive_cylinder_add(radius=0.31, depth=0.20, location=(wx, wy, wz))
        tire = bpy.context.active_object
        tire.name = f"Tire_{w_name}"
        tire.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        tire.data.materials.append(mat_tire)
        link_obj(tire)

        # Alloy Rim Outer Lip
        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.21, location=(wx, wy, wz))
        rim = bpy.context.active_object
        rim.name = f"Rim_{w_name}"
        rim.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rim.data.materials.append(mat_alloy)
        link_obj(rim)

        # Center Chrome Cap
        bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.22, location=(wx, wy, wz))
        cap = bpy.context.active_object
        cap.name = f"Cap_{w_name}"
        cap.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        cap.data.materials.append(mat_chrome)
        link_obj(cap)

        # 6 Compact Alloy Spokes
        for s_i in range(6):
            ang = s_i * (2 * math.pi / 6)
            sy = wy + math.sin(ang) * 0.12
            sz = wz + math.cos(ang) * 0.12
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx + (0.08 if wx > 0 else -0.08), sy, sz))
            spk = bpy.context.active_object
            spk.name = f"Spoke_{w_name}_{s_i}"
            spk.scale = (0.035, 0.038, 0.12)
            spk.rotation_euler = (ang, 0, 0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            spk.data.materials.append(mat_alloy)
            link_obj(spk)

    # =============================================================
    # 9. EXPORT GLB TO GAME ASSETS
    # =============================================================
    export_dir = r"X:\Donlod\KD_AI_FOR_GAMING\public\assets\models"
    os.makedirs(export_dir, exist_ok=True)
    glb_path = os.path.join(export_dir, "myvi.glb")

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
    root.select_set(True)
    bpy.context.view_layer.objects.active = root

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True
    )
    print(f"Exported classic Myvi to {glb_path}")

    # Copy to dist
    dist_dir = r"X:\Donlod\KD_AI_FOR_GAMING\dist\assets\models"
    if os.path.exists(r"X:\Donlod\KD_AI_FOR_GAMING\dist"):
        os.makedirs(dist_dir, exist_ok=True)
        shutil.copyfile(glb_path, os.path.join(dist_dir, "myvi.glb"))
        print(f"Copied to dist: {dist_dir}")

    # Set 3D viewport to MATERIAL shading and frame car
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.shading.type = 'MATERIAL'
                    for region in area.regions:
                        if region.type == 'WINDOW':
                            with bpy.context.temp_override(area=area, region=region):
                                bpy.ops.view3d.view_selected()
                            break

    print("Successfully built authentic Classic Perodua Myvi in Blender!")

build_classic_myvi()
'''

def main():
    host = '127.0.0.1'
    port = 9876
    print(f"Connecting to Blender MCP on {host}:{port}...")

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30.0)
    s.connect((host, port))

    payload = {
        "type": "execute_code",
        "params": {
            "code": BLENDER_CODE
        }
    }

    s.sendall(json.dumps(payload).encode('utf-8'))

    buffer = b""
    while True:
        chunk = s.recv(8192)
        if not chunk:
            break
        buffer += chunk
        try:
            resp = json.loads(buffer.decode('utf-8'))
            print("Response from Blender:")
            print(json.dumps(resp, indent=2))
            break
        except json.JSONDecodeError:
            continue
    s.close()

if __name__ == "__main__":
    main()
