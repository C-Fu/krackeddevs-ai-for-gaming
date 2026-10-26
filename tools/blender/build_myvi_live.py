"""
Generate High-Quality Low-Poly 3D Perodua Myvi Gen 3 in Opened Blender via BlenderMCP (Port 9876)
Strictly adheres to Malaysian Perodua Myvi 3rd Generation (Lava Red / Cranberry Red).
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

def build_myvi_gen3():
    # 1. Clean existing mesh objects
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat, do_unlink=True)

    # 2. Material Helper
    def make_material(name, base_color, metallic=0.0, roughness=0.3, emissive=(0, 0, 0, 1), emissive_strength=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            if "Base Color" in bsdf.inputs:
                bsdf.inputs["Base Color"].default_value = base_color
            if "Metallic" in bsdf.inputs:
                bsdf.inputs["Metallic"].default_value = metallic
            if "Roughness" in bsdf.inputs:
                bsdf.inputs["Roughness"].default_value = roughness
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emissive
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emissive_strength
        return mat

    # Official Myvi Gen 3 Lava Red Palette
    mat_red = make_material("Myvi_LavaRed", (0.76, 0.06, 0.09, 1.0), metallic=0.32, roughness=0.20)
    mat_dark_accent = make_material("Myvi_DarkAccent", (0.42, 0.03, 0.05, 1.0), metallic=0.25, roughness=0.30)
    mat_glass = make_material("Myvi_TintedGlass", (0.04, 0.06, 0.09, 1.0), metallic=0.15, roughness=0.08)
    mat_trim = make_material("Myvi_DarkTrim", (0.06, 0.06, 0.07, 1.0), metallic=0.05, roughness=0.70)
    mat_chrome = make_material("Myvi_Chrome", (0.92, 0.94, 0.96, 1.0), metallic=0.98, roughness=0.08)
    mat_headlight = make_material("Myvi_LED_Headlight", (1.0, 1.0, 0.96, 1.0), metallic=0.1, roughness=0.1, emissive=(1.0, 1.0, 0.96, 1.0), emissive_strength=2.2)
    mat_taillight_red = make_material("Myvi_TaillightRed", (0.92, 0.02, 0.02, 1.0), metallic=0.1, roughness=0.15, emissive=(0.92, 0.02, 0.02, 1.0), emissive_strength=1.2)
    mat_taillight_white = make_material("Myvi_TaillightWhite", (0.95, 0.95, 0.98, 1.0), metallic=0.1, roughness=0.2)
    mat_amber = make_material("Myvi_AmberIndicator", (1.0, 0.55, 0.02, 1.0), metallic=0.1, roughness=0.2, emissive=(1.0, 0.55, 0.02, 1.0), emissive_strength=1.0)
    mat_tire = make_material("Myvi_TireRubber", (0.07, 0.07, 0.07, 1.0), metallic=0.0, roughness=0.82)
    mat_rim_silver = make_material("Myvi_AlloyRim", (0.85, 0.86, 0.88, 1.0), metallic=0.90, roughness=0.18)
    mat_rim_dark = make_material("Myvi_AlloyDark", (0.15, 0.16, 0.18, 1.0), metallic=0.70, roughness=0.35)
    mat_plate = make_material("Myvi_NumberPlate", (0.02, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.45)

    # Root Empty Object
    root = bpy.data.objects.new("Perodua_Myvi_Gen3", None)
    bpy.context.scene.collection.objects.link(root)

    # -------------------------------------------------------------
    # Helper to create mesh from vertices & faces
    # -------------------------------------------------------------
    def create_custom_mesh(name, verts, faces, mat):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj.data.materials.append(mat)
        obj.parent = root
        return obj

    # -------------------------------------------------------------
    # 1. LOWER BODY & CHASSIS (Sculpted Hatchback Silhouette)
    # -------------------------------------------------------------
    # Main lower tub (from front cowl to rear bumper)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.46))
    chassis = bpy.context.active_object
    chassis.name = "Body_Chassis"
    chassis.scale = (1.72, 3.60, 0.44)
    bpy.ops.object.transform_apply(scale=True)
    chassis.data.materials.append(mat_red)
    chassis.parent = root

    # Sloping Front Hood (Tapers down to grille)
    hood_verts = [
        (-0.76, 0.65, 0.78),  # 0: cowl left
        ( 0.76, 0.65, 0.78),  # 1: cowl right
        ( 0.68, 1.76, 0.62),  # 2: nose right
        (-0.68, 1.76, 0.62),  # 3: nose left
        (-0.78, 0.65, 0.58),  # 4: cowl left bottom
        ( 0.78, 0.65, 0.58),  # 5: cowl right bottom
        ( 0.70, 1.76, 0.58),  # 6: nose right bottom
        (-0.70, 1.76, 0.58)   # 7: nose left bottom
    ]
    hood_faces = [
        (0, 1, 2, 3), # Top hood panel
        (4, 7, 6, 5), # Bottom
        (0, 3, 7, 4), # Left side fender flare
        (1, 5, 6, 2), # Right side fender flare
        (3, 2, 6, 7), # Front nose edge
        (0, 4, 5, 1)  # Cowl back
    ]
    create_custom_mesh("Body_Hood", hood_verts, hood_faces, mat_red)

    # Front Bumper Main Block
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.82, 0.40))
    bumper_f = bpy.context.active_object
    bumper_f.name = "Bumper_Front"
    bumper_f.scale = (1.68, 0.22, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    bumper_f.data.materials.append(mat_red)
    bumper_f.parent = root

    # Front Lower Trapezoidal Black Air Dam (Gen 3 iconic wide smile intake)
    air_dam_verts = [
        (-0.52, 1.93, 0.45), # Top L
        ( 0.52, 1.93, 0.45), # Top R
        ( 0.60, 1.93, 0.23), # Bottom R (wider at bottom = trapezoid)
        (-0.60, 1.93, 0.23), # Bottom L
        (-0.50, 1.82, 0.45),
        ( 0.50, 1.82, 0.45),
        ( 0.58, 1.82, 0.23),
        (-0.58, 1.82, 0.23)
    ]
    air_dam_faces = [
        (0, 1, 2, 3), # Front intake face
        (4, 7, 6, 5),
        (0, 4, 7, 3),
        (1, 2, 6, 5),
        (0, 1, 5, 4),
        (3, 2, 6, 7)
    ]
    create_custom_mesh("Grille_Lower_AirDam", air_dam_verts, air_dam_faces, mat_trim)

    # Front Fog Pods with Chrome Bezel & Mini Fog Lamp
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.70, 1.84, 0.31))
        fog_pod = bpy.context.active_object
        fog_pod.name = f"Fog_Pod_{'L' if side < 0 else 'R'}"
        fog_pod.scale = (0.22, 0.12, 0.16)
        fog_pod.rotation_euler = (0, 0, side * 0.12)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        fog_pod.data.materials.append(mat_trim)
        fog_pod.parent = root

        # Round fog lamp bulb
        bpy.ops.mesh.primitive_cylinder_add(radius=0.045, depth=0.05, location=(side * 0.70, 1.90, 0.31))
        fog_bulb = bpy.context.active_object
        fog_bulb.name = f"Fog_Bulb_{'L' if side < 0 else 'R'}"
        fog_bulb.rotation_euler = (math.pi / 2, 0, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        fog_bulb.data.materials.append(mat_headlight)
        fog_bulb.parent = root

    # Upper Front Chrome Grille Wing Bar & Perodua Roundel
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.82, 0.60))
    chrome_wing = bpy.context.active_object
    chrome_wing.name = "Chrome_Wing_Grille"
    chrome_wing.scale = (1.24, 0.08, 0.045)
    bpy.ops.object.transform_apply(scale=True)
    chrome_wing.data.materials.append(mat_chrome)
    chrome_wing.parent = root

    # Perodua Center Badge (Oval Silver)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.06, location=(0, 1.86, 0.59))
    badge_f = bpy.context.active_object
    badge_f.name = "Badge_Perodua_Front"
    badge_f.scale = (1.15, 0.90, 1.0)
    badge_f.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    badge_f.data.materials.append(mat_chrome)
    badge_f.parent = root

    # Angular LED Headlights (Sharp-eyed Gen 3 signature)
    for side in (-1, 1):
        # Angular wedge housing
        hl_verts = [
            (side * 0.48, 1.82, 0.64), # inner top
            (side * 0.80, 1.70, 0.65), # outer top (swept back)
            (side * 0.81, 1.70, 0.54), # outer bottom
            (side * 0.49, 1.82, 0.54), # inner bottom
            (side * 0.48, 1.68, 0.64), # inner back
            (side * 0.80, 1.56, 0.65), # outer back
            (side * 0.81, 1.56, 0.54),
            (side * 0.49, 1.68, 0.54)
        ]
        hl_faces = [
            (0, 1, 2, 3), # Lens face
            (4, 7, 6, 5),
            (0, 4, 7, 3),
            (1, 2, 6, 5),
            (0, 1, 5, 4),
            (3, 2, 6, 7)
        ]
        create_custom_mesh(f"Headlight_LED_{'L' if side < 0 else 'R'}", hl_verts, hl_faces, mat_headlight)

        # Chrome Eyebrow Strip
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.65, 1.74, 0.665))
        eyebrow = bpy.context.active_object
        eyebrow.name = f"Headlight_Brow_{'L' if side < 0 else 'R'}"
        eyebrow.scale = (0.32, 0.12, 0.025)
        eyebrow.rotation_euler = (-0.08, side * 0.10, side * 0.20)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        eyebrow.data.materials.append(mat_chrome)
        eyebrow.parent = root

    # -------------------------------------------------------------
    # 2. STREAMLINED CABIN GREENHOUSE & TINTED GLASS
    # -------------------------------------------------------------
    # Sculpted single-piece aerodynamic glass canopy
    # Cowl -> Raked Windshield -> Roofline -> Sloped Rear Tailgate Glass
    canopy_verts = [
        # Base ring (beltline, Z = 0.76)
        (-0.73,  0.64, 0.76), # 0: A-pillar base L
        ( 0.73,  0.64, 0.76), # 1: A-pillar base R
        ( 0.72, -1.30, 0.76), # 2: C-pillar base R
        (-0.72, -1.30, 0.76), # 3: C-pillar base L
        # Top ring (roofline, Z = 1.38, narrower for sleek tumblehome)
        (-0.62,  0.08, 1.38), # 4: A-pillar top L
        ( 0.62,  0.08, 1.38), # 5: A-pillar top R
        ( 0.61, -1.15, 1.36), # 6: Roof rear R
        (-0.61, -1.15, 1.36)  # 7: Roof rear L
    ]
    canopy_faces = [
        (0, 1, 5, 4), # Windshield (smooth 45-degree rake)
        (1, 2, 6, 5), # Right side windows
        (2, 3, 7, 6), # Rear tailgate glass (sloping hatchback)
        (3, 0, 4, 7), # Left side windows
        (4, 5, 6, 7), # Top roof
        (0, 3, 2, 1)  # Bottom inside
    ]
    create_custom_mesh("Cabin_Glass_Greenhouse", canopy_verts, canopy_faces, mat_glass)

    # Lava Red Roof Cap (Covers top of canopy)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.48, 1.39))
    roof = bpy.context.active_object
    roof.name = "Body_Roof"
    roof.scale = (1.26, 1.45, 0.05)
    bpy.ops.object.transform_apply(scale=True)
    roof.data.materials.append(mat_red)
    roof.parent = root

    # Body-colored A-pillars (Left & Right)
    for side in (-1, 1):
        a_pillar_verts = [
            (side * 0.73,  0.65, 0.76),
            (side * 0.67,  0.65, 0.76),
            (side * 0.58,  0.08, 1.38),
            (side * 0.64,  0.08, 1.38),
            (side * 0.75,  0.60, 0.76),
            (side * 0.69,  0.60, 0.76),
            (side * 0.60,  0.05, 1.38),
            (side * 0.66,  0.05, 1.38)
        ]
        a_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 7, 3),
            (1, 2, 6, 5), (0, 1, 5, 4), (3, 2, 6, 7)
        ]
        create_custom_mesh(f"A_Pillar_{'L' if side < 0 else 'R'}", a_pillar_verts, a_faces, mat_red)

    # Black B-Pillar divider (Left & Right)
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.68, -0.40, 1.07))
        bp = bpy.context.active_object
        bp.name = f"B_Pillar_{'L' if side < 0 else 'R'}"
        bp.scale = (0.04, 0.10, 0.58)
        bpy.ops.object.transform_apply(scale=True)
        bp.data.materials.append(mat_trim)
        bp.parent = root

    # Shark-Fin Antenna (Iconic Malaysian Highway King)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.92, 1.45))
    antenna = bpy.context.active_object
    antenna.name = "SharkFin_Antenna"
    antenna.scale = (0.05, 0.20, 0.09)
    antenna.rotation_euler = (-0.30, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    antenna.data.materials.append(mat_red)
    antenna.parent = root

    # -------------------------------------------------------------
    # 3. ICONIC TWO-TIER REAR ROOF SPOILER (With Aero Side Fins)
    # -------------------------------------------------------------
    # Upper Rear Roof Spoiler Wing
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.36, 1.41))
    spoiler_wing = bpy.context.active_object
    spoiler_wing.name = "Spoiler_Wing"
    spoiler_wing.scale = (1.34, 0.32, 0.06)
    spoiler_wing.rotation_euler = (0.14, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    spoiler_wing.data.materials.append(mat_red)
    spoiler_wing.parent = root

    # Black Aero Gurney Flap on Spoiler Trailing Edge
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.50, 1.42))
    gurney = bpy.context.active_object
    gurney.name = "Spoiler_Aero_Lip"
    gurney.scale = (1.32, 0.06, 0.03)
    bpy.ops.object.transform_apply(scale=True)
    gurney.data.materials.append(mat_trim)
    gurney.parent = root

    # Center High-Mount Stop Lamp (HMSL Red LED)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.48, 1.39))
    hmsl = bpy.context.active_object
    hmsl.name = "Spoiler_HMSL_LED"
    hmsl.scale = (0.40, 0.04, 0.025)
    bpy.ops.object.transform_apply(scale=True)
    hmsl.data.materials.append(mat_taillight_red)
    hmsl.parent = root

    # Aero Side Fins flanking the rear window (Left & Right)
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.66, -1.30, 1.18))
        fin = bpy.context.active_object
        fin.name = f"Spoiler_Fin_{'L' if side < 0 else 'R'}"
        fin.scale = (0.05, 0.22, 0.34)
        fin.rotation_euler = (0.42, 0, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        fin.data.materials.append(mat_trim)
        fin.parent = root

    # -------------------------------------------------------------
    # 4. REAR TAILGATE & 3D WRAP-AROUND TAILLIGHTS
    # -------------------------------------------------------------
    # Tailgate Lower Hatch Panel
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.68, 0.64))
    hatch = bpy.context.active_object
    hatch.name = "Body_Tailgate"
    hatch.scale = (1.56, 0.22, 0.44)
    bpy.ops.object.transform_apply(scale=True)
    hatch.data.materials.append(mat_red)
    hatch.parent = root

    # Rear Bumper
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.76, 0.38))
    bumper_r = bpy.context.active_object
    bumper_r.name = "Bumper_Rear"
    bumper_r.scale = (1.68, 0.26, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    bumper_r.data.materials.append(mat_red)
    bumper_r.parent = root

    # Rear Lower Diffuser Insert (Dark Trim with vertical aero fins)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.82, 0.25))
    diffuser = bpy.context.active_object
    diffuser.name = "Diffuser_Rear"
    diffuser.scale = (1.20, 0.16, 0.16)
    bpy.ops.object.transform_apply(scale=True)
    diffuser.data.materials.append(mat_trim)
    diffuser.parent = root

    # Diffuser Strakes / Vertical Fins
    for d_offset in (-0.25, 0.25):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(d_offset, -1.88, 0.23))
        fin_diff = bpy.context.active_object
        fin_diff.name = f"Diffuser_Fin_{d_offset}"
        fin_diff.scale = (0.03, 0.08, 0.12)
        bpy.ops.object.transform_apply(scale=True)
        fin_diff.data.materials.append(mat_trim)
        fin_diff.parent = root

    # Wrap-around Taillights (Red LED C-shape signature + White reverse/indicator)
    for side in (-1, 1):
        # Main Red Light
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.66, -1.74, 0.68))
        tl_red = bpy.context.active_object
        tl_red.name = f"Taillight_Red_{'L' if side < 0 else 'R'}"
        tl_red.scale = (0.30, 0.12, 0.26)
        tl_red.rotation_euler = (0, side * 0.12, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        tl_red.data.materials.append(mat_taillight_red)
        tl_red.parent = root

        # White Reverse / Turn Signal Segment
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.64, -1.76, 0.65))
        tl_white = bpy.context.active_object
        tl_white.name = f"Taillight_White_{'L' if side < 0 else 'R'}"
        tl_white.scale = (0.18, 0.10, 0.09)
        bpy.ops.object.transform_apply(scale=True)
        tl_white.data.materials.append(mat_taillight_white)
        tl_white.parent = root

        # Rear Bumper Slim Reflectors
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.68, -1.84, 0.32))
        refl = bpy.context.active_object
        refl.name = f"Reflector_{'L' if side < 0 else 'R'}"
        refl.scale = (0.18, 0.05, 0.05)
        bpy.ops.object.transform_apply(scale=True)
        refl.data.materials.append(mat_taillight_red)
        refl.parent = root

    # Rear Malaysian License Plate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.84, 0.44))
    plate = bpy.context.active_object
    plate.name = "License_Plate_Rear"
    plate.scale = (0.46, 0.03, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    plate.data.materials.append(mat_plate)
    plate.parent = root

    # Rear Perodua Silver Roundel
    bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.04, location=(0, -1.76, 0.68))
    badge_r = bpy.context.active_object
    badge_r.name = "Badge_Perodua_Rear"
    badge_r.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    badge_r.data.materials.append(mat_chrome)
    badge_r.parent = root

    # -------------------------------------------------------------
    # 5. SIDE MIRRORS & CHROME DOOR HANDLES
    # -------------------------------------------------------------
    for side in (-1, 1):
        # Body-colored Mirror Shell
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.86, 0.45, 0.92))
        mirror = bpy.context.active_object
        mirror.name = f"Mirror_Housing_{'L' if side < 0 else 'R'}"
        mirror.scale = (0.22, 0.14, 0.10)
        mirror.rotation_euler = (0, 0, side * 0.16)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        mirror.data.materials.append(mat_red)
        mirror.parent = root

        # LED Indicator strip on mirror
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.92, 0.46, 0.92))
        m_led = bpy.context.active_object
        m_led.name = f"Mirror_LED_{'L' if side < 0 else 'R'}"
        m_led.scale = (0.04, 0.10, 0.025)
        bpy.ops.object.transform_apply(scale=True)
        m_led.data.materials.append(mat_amber)
        m_led.parent = root

        # Chrome Door Handles (Front & Rear)
        for dy in (0.10, -0.62):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.87, dy, 0.74))
            h = bpy.context.active_object
            h.name = f"Door_Handle_{dy}_{'L' if side < 0 else 'R'}"
            h.scale = (0.04, 0.13, 0.035)
            bpy.ops.object.transform_apply(scale=True)
            h.data.materials.append(mat_chrome)
            h.parent = root

    # -------------------------------------------------------------
    # 6. WHEELS & 15-INCH DUAL-TONE ALLOY RIMS
    # -------------------------------------------------------------
    wheel_coords = [
        ("Front_L", -0.86,  1.15, 0.32),
        ("Front_R",  0.86,  1.15, 0.32),
        ("Rear_L",  -0.86, -1.18, 0.32),
        ("Rear_R",   0.86, -1.18, 0.32)
    ]

    for w_name, wx, wy, wz in wheel_coords:
        # Rubber Tire (Radius 0.32, Width 0.22)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.22, location=(wx, wy, wz))
        tire = bpy.context.active_object
        tire.name = f"Tire_{w_name}"
        tire.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        tire.data.materials.append(mat_tire)
        tire.parent = root

        # Inner Dark Wheel Well / Rim Basin
        bpy.ops.mesh.primitive_cylinder_add(radius=0.23, depth=0.23, location=(wx, wy, wz))
        rim_base = bpy.context.active_object
        rim_base.name = f"Rim_Base_{w_name}"
        rim_base.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rim_base.data.materials.append(mat_rim_dark)
        rim_base.parent = root

        # Outer Machined Silver Lip
        bpy.ops.mesh.primitive_cylinder_add(radius=0.23, depth=0.03, location=(wx + (0.10 if wx > 0 else -0.10), wy, wz))
        rim_lip = bpy.context.active_object
        rim_lip.name = f"Rim_Lip_{w_name}"
        rim_lip.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rim_lip.data.materials.append(mat_rim_silver)
        rim_lip.parent = root

        # Center Silver Hub
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.24, location=(wx, wy, wz))
        hub = bpy.context.active_object
        hub.name = f"Rim_Hub_{w_name}"
        hub.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        hub.data.materials.append(mat_chrome)
        hub.parent = root

        # 5 Polished Dual Spokes
        for s_i in range(5):
            angle = s_i * (2 * math.pi / 5)
            sp_y = wy + math.sin(angle) * 0.13
            sp_z = wz + math.cos(angle) * 0.13
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx + (0.09 if wx > 0 else -0.09), sp_y, sp_z))
            spoke = bpy.context.active_object
            spoke.name = f"Spoke_{w_name}_{s_i}"
            spoke.scale = (0.04, 0.04, 0.14)
            spoke.rotation_euler = (angle, 0, 0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            spoke.data.materials.append(mat_rim_silver)
            spoke.parent = root

    # -------------------------------------------------------------
    # 7. EXPORT GLB TO GAME ASSETS
    # -------------------------------------------------------------
    export_dir = r"X:\Donlod\KD_AI_FOR_GAMING\public\assets\models"
    os.makedirs(export_dir, exist_ok=True)
    glb_path = os.path.join(export_dir, "myvi.glb")

    # Select all meshes under root
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
    print(f"Exported glb to: {glb_path}")

    # Also copy to dist if dist exists
    dist_dir = r"X:\Donlod\KD_AI_FOR_GAMING\dist\assets\models"
    if os.path.exists(r"X:\Donlod\KD_AI_FOR_GAMING\dist"):
        import shutil
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

    print("Successfully built authentic Perodua Myvi Gen 3 in Blender!")

build_myvi_gen3()
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
