"""
Procedural 3D Model: 3rd Generation Perodua Myvi (Lava Red / HUM3D 3D Reference Specification)
Directly reproduces the user-uploaded Hum3D reference renders (media_1793013754379_8974d7c7.png & media_1793013766937_0b5e9563.png):
- Sleek aerodynamic modern hatchback profile with rising beltline
- Swept-back raked rear glass (NOT vertical)
- Signature two-tier roof spoiler with black side aero fins flanking the rear window
- Horizontal wrap-around two-piece taillights extending into the tailgate
- Center Perodua emblem with oval latch recess and chrome 'Myvi' script badge
- License plate recess with 'HUM3D' plate
- Sporty rear bumper with black side diffuser cutouts and slim horizontal reflectors
- Shark fin antenna on roof
- 15-inch two-tone directional turbine alloy wheels (machined silver faces on dark anthracite)
- Front fascia with sharp LED headlights, chrome wing grille, and trapezoid lower air dam
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

def build_hum3d_myvi():
    # 0. Clean scene
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat, do_unlink=True)

    # 1. Materials Setup (Accurate to Hum3D Lava Red reference)
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
    mat_red = create_mat("Myvi_LavaRed", (0.74, 0.05, 0.08, 1.0), metallic=0.36, roughness=0.18)
    mat_red_dark = create_mat("Myvi_RedDark", (0.50, 0.03, 0.05, 1.0), metallic=0.30, roughness=0.25)
    mat_glass = create_mat("Myvi_TintedGlass", (0.04, 0.06, 0.09, 1.0), metallic=0.15, roughness=0.04)
    mat_black_gloss = create_mat("Myvi_BlackGloss", (0.05, 0.05, 0.05, 1.0), metallic=0.20, roughness=0.15)
    mat_trim_matte = create_mat("Myvi_TrimMatte", (0.08, 0.08, 0.09, 1.0), metallic=0.05, roughness=0.75)
    mat_chrome = create_mat("Myvi_Chrome", (0.95, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.06)
    mat_taillight_red = create_mat("Myvi_TailRedLED", (0.95, 0.02, 0.02, 1.0), metallic=0.1, roughness=0.10, emissive=(0.95, 0.02, 0.02, 1.0), emissive_strength=1.6)
    mat_taillight_clear = create_mat("Myvi_TailClear", (0.90, 0.90, 0.93, 1.0), metallic=0.1, roughness=0.15)
    mat_amber = create_mat("Myvi_AmberLED", (1.0, 0.55, 0.02, 1.0), metallic=0.1, roughness=0.2, emissive=(1.0, 0.55, 0.02, 1.0), emissive_strength=1.2)
    mat_headlight = create_mat("Myvi_LED_Headlight", (1.0, 1.0, 0.98, 1.0), metallic=0.2, roughness=0.1, emissive=(1.0, 1.0, 0.98, 1.0), emissive_strength=2.2)
    mat_alloy_silver = create_mat("Myvi_TurbineSilver", (0.88, 0.89, 0.91, 1.0), metallic=0.92, roughness=0.15)
    mat_alloy_dark = create_mat("Myvi_TurbineAnthracite", (0.12, 0.13, 0.15, 1.0), metallic=0.80, roughness=0.30)
    mat_tire = create_mat("Myvi_TireRubber", (0.08, 0.08, 0.08, 1.0), metallic=0.0, roughness=0.85)
    mat_plate_bg = create_mat("Myvi_PlateBG", (0.04, 0.04, 0.04, 1.0), metallic=0.0, roughness=0.5)
    mat_plate_text = create_mat("Myvi_PlateWhite", (0.96, 0.96, 0.98, 1.0), metallic=0.0, roughness=0.3)
    mat_plate_blue = create_mat("Myvi_PlateBlue", (0.05, 0.20, 0.70, 1.0), metallic=0.0, roughness=0.4)

    # Root
    root = bpy.data.objects.new("Perodua_Myvi_Gen3_Hum3D", None)
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
    # 2. BODY SHELL & SCULPTED VOLUMES (3rd Gen Proportions)
    # Length: 3.89m (front bumper +1.92, rear bumper -1.88)
    # Width: 1.73m (X from -0.865 to +0.865)
    # Height: 1.51m (Z: 0.16 to 1.51)
    # =============================================================

    # Main Body Tub
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.05, 0.52))
    tub = bpy.context.active_object
    tub.name = "Body_Tub"
    tub.scale = (1.72, 3.55, 0.48)
    bpy.ops.object.transform_apply(scale=True)
    tub.data.materials.append(mat_red)
    link_obj(tub)

    # Rising Dynamic Beltline Crease (runs through doors, kicks up to C-pillar)
    for side in (-1, 1):
        belt_verts = [
            (side * 0.865,  1.70, 0.76), # Front fender tip
            (side * 0.870,  0.50, 0.79), # A-pillar base
            (side * 0.875, -0.40, 0.83), # B-pillar
            (side * 0.875, -1.20, 0.88), # Rear door kick
            (side * 0.865, -1.65, 0.92), # Tail lamp corner
            (side * 0.855, -1.65, 0.89),
            (side * 0.865, -1.20, 0.85),
            (side * 0.865, -0.40, 0.80),
            (side * 0.860,  0.50, 0.76),
            (side * 0.855,  1.70, 0.73)
        ]
        belt_faces = [(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)]
        make_mesh_obj(f"Beltline_Crease_{'L' if side < 0 else 'R'}", belt_verts, belt_faces, mat_red_dark)

        # Chrome door handles with dark sensor button
        for dy in (0.35, -0.38):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.875, dy, 0.82))
            handle = bpy.context.active_object
            handle.name = f"Door_Handle_{dy}_{'L' if side < 0 else 'R'}"
            handle.scale = (0.035, 0.14, 0.035)
            bpy.ops.object.transform_apply(scale=True)
            handle.data.materials.append(mat_chrome)
            link_obj(handle)

        # Flared Wheel Arches
        for wy, label in [(1.20, "Front"), (-1.22, "Rear")]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.05, location=(side * 0.86, wy, 0.36))
            arch = bpy.context.active_object
            arch.name = f"WheelArch_Flare_{label}_{'L' if side < 0 else 'R'}"
            arch.rotation_euler = (0, math.pi / 2, 0)
            arch.scale = (1.0, 1.06, 1.0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            arch.data.materials.append(mat_red)
            link_obj(arch)

    # Sculpted Front Hood (Dual character creases, sloping to nose)
    hood_verts = [
        (-0.76,  0.65, 0.84),
        ( 0.76,  0.65, 0.84),
        ( 0.68,  1.82, 0.65),
        (-0.68,  1.82, 0.65),
        (-0.80,  0.65, 0.70),
        ( 0.80,  0.65, 0.70),
        ( 0.72,  1.82, 0.58),
        (-0.72,  1.82, 0.58)
    ]
    hood_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 3, 7, 4),
        (1, 5, 6, 2), (3, 2, 6, 7), (0, 4, 5, 1)
    ]
    make_mesh_obj("Body_Hood", hood_verts, hood_faces, mat_red)

    # Front Bumper Apron & Nose
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.86, 0.42))
    f_bumper = bpy.context.active_object
    f_bumper.name = "Bumper_Front"
    f_bumper.scale = (1.70, 0.22, 0.42)
    bpy.ops.object.transform_apply(scale=True)
    f_bumper.data.materials.append(mat_red)
    link_obj(f_bumper)

    # Large Black Center Trapezoidal Air Dam
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.94, 0.32))
    f_airdam = bpy.context.active_object
    f_airdam.name = "Front_Air_Dam"
    f_airdam.scale = (1.18, 0.12, 0.24)
    bpy.ops.object.transform_apply(scale=True)
    f_airdam.data.materials.append(mat_trim_matte)
    link_obj(f_airdam)

    # Front Chrome Wing Bar & Perodua Logo
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.88, 0.64))
    f_chrome = bpy.context.active_object
    f_chrome.name = "Front_Chrome_Wing"
    f_chrome.scale = (1.24, 0.08, 0.04)
    bpy.ops.object.transform_apply(scale=True)
    f_chrome.data.materials.append(mat_chrome)
    link_obj(f_chrome)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.04, location=(0, 1.92, 0.63))
    f_badge = bpy.context.active_object
    f_badge.name = "Perodua_Badge_Front"
    f_badge.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    f_badge.data.materials.append(mat_chrome)
    link_obj(f_badge)

    # Front Fog Light Housings with Chrome Accents
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.68, 1.92, 0.30))
        fog = bpy.context.active_object
        fog.name = f"Fog_Housing_{'L' if side < 0 else 'R'}"
        fog.scale = (0.24, 0.10, 0.16)
        fog.rotation_euler = (0, 0, side * 0.14)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        fog.data.materials.append(mat_trim_matte)
        link_obj(fog)

        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.04, location=(side * 0.68, 1.96, 0.30))
        fog_lamp = bpy.context.active_object
        fog_lamp.name = f"Fog_Lamp_{'L' if side < 0 else 'R'}"
        fog_lamp.rotation_euler = (math.pi / 2, 0, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        fog_lamp.data.materials.append(mat_headlight)
        link_obj(fog_lamp)

        # Sharp LED Headlamps
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.66, 1.76, 0.66))
        hl = bpy.context.active_object
        hl.name = f"Headlamp_{'L' if side < 0 else 'R'}"
        hl.scale = (0.34, 0.28, 0.15)
        hl.rotation_euler = (-0.14, side * 0.14, side * 0.22)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        hl.data.materials.append(mat_headlight)
        link_obj(hl)

    # =============================================================
    # 3. GREENHOUSE, TUMBLEHOME & FLOATING ROOF C-PILLAR
    # Exact 3rd Gen silhouette: Sweeping A-pillar, raked windshield,
    # black triangular C-pillar insert creating floating roof effect
    # =============================================================

    # Raked Front Windshield
    ws_verts = [
        (-0.74,  0.65, 0.84),
        ( 0.74,  0.65, 0.84),
        ( 0.62,  0.12, 1.48),
        (-0.62,  0.12, 1.48)
    ]
    make_mesh_obj("Glass_Windshield", ws_verts, [(0, 1, 2, 3)], mat_glass)

    # A-Pillars (Red)
    for side in (-1, 1):
        ap_verts = [
            (side * 0.75, 0.65, 0.84),
            (side * 0.69, 0.65, 0.84),
            (side * 0.58, 0.12, 1.48),
            (side * 0.64, 0.12, 1.48),
            (side * 0.77, 0.60, 0.84),
            (side * 0.71, 0.60, 0.84),
            (side * 0.60, 0.08, 1.48),
            (side * 0.66, 0.08, 1.48)
        ]
        make_mesh_obj(f"A_Pillar_{'L' if side < 0 else 'R'}", ap_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_red)

    # Roof Cap (Sleek curve, tapering gently back to spoiler)
    roof_verts = [
        (-0.64,  0.12, 1.48),
        ( 0.64,  0.12, 1.48),
        ( 0.63, -0.40, 1.50),
        (-0.63, -0.40, 1.50),
        (-0.61, -1.35, 1.43),
        ( 0.61, -1.35, 1.43),
        (-0.64,  0.12, 1.44),
        ( 0.64,  0.12, 1.44),
        ( 0.63, -0.40, 1.46),
        (-0.63, -0.40, 1.46),
        (-0.61, -1.35, 1.39),
        ( 0.61, -1.35, 1.39)
    ]
    roof_faces = [
        (0, 1, 2, 3), (3, 2, 5, 4),
        (6, 8, 7, 9), (9, 11, 10, 8),
        (0, 3, 9, 6), (3, 4, 10, 9),
        (1, 7, 8, 2), (2, 8, 11, 5),
        (0, 6, 7, 1), (4, 5, 11, 10)
    ]
    make_mesh_obj("Body_Roof", roof_verts, roof_faces, mat_red)

    # Shark Fin Antenna on Roof
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.95, 1.49))
    antenna = bpy.context.active_object
    antenna.name = "SharkFin_Antenna"
    antenna.scale = (0.05, 0.18, 0.09)
    antenna.rotation_euler = (-0.32, 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    antenna.data.materials.append(mat_red)
    link_obj(antenna)

    # Side Door Windows & B-Pillar
    for side in (-1, 1):
        # Front door window
        f_win_verts = [
            (side * 0.81,  0.48, 0.84),
            (side * 0.82,  0.02, 0.86),
            (side * 0.64,  0.02, 1.47),
            (side * 0.63,  0.18, 1.47)
        ]
        make_mesh_obj(f"Glass_FrontWin_{'L' if side < 0 else 'R'}", f_win_verts, [(0, 1, 2, 3) if side < 0 else (0, 3, 2, 1)], mat_glass)

        # Black B-pillar
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.77, 0.00, 1.15))
        bp = bpy.context.active_object
        bp.name = f"B_Pillar_{'L' if side < 0 else 'R'}"
        bp.scale = (0.035, 0.07, 0.60)
        bpy.ops.object.transform_apply(scale=True)
        bp.data.materials.append(mat_trim_matte)
        link_obj(bp)

        # Rear door window
        r_win_verts = [
            (side * 0.82, -0.06, 0.86),
            (side * 0.83, -0.68, 0.90), # Rising beltline
            (side * 0.66, -0.68, 1.45),
            (side * 0.64, -0.06, 1.47)
        ]
        make_mesh_obj(f"Glass_RearWin_{'L' if side < 0 else 'R'}", r_win_verts, [(0, 1, 2, 3) if side < 0 else (0, 3, 2, 1)], mat_glass)

        # Rear Quarter Window
        q_win_verts = [
            (side * 0.83, -0.72, 0.90),
            (side * 0.80, -1.22, 0.94),
            (side * 0.65, -1.22, 1.42),
            (side * 0.66, -0.72, 1.45)
        ]
        make_mesh_obj(f"Glass_QuarterWin_{'L' if side < 0 else 'R'}", q_win_verts, [(0, 1, 2, 3) if side < 0 else (0, 3, 2, 1)], mat_glass)

    # Interior Cabin Block (Positioned safely behind raked windshield)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.65, 1.10))
    cabin_interior = bpy.context.active_object
    cabin_interior.name = "Cabin_Interior_Dark"
    cabin_interior.scale = (1.30, 1.45, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    cabin_interior.data.materials.append(mat_trim_matte)
    link_obj(cabin_interior)

    # Solid Body-Colored C-Pillar Panels (Closes rear quarter flank)
    for side in (-1, 1):
        cp_verts = [
            (side * 0.83, -1.20, 0.90), # Base front (quarter win)
            (side * 0.72, -1.68, 0.98), # Base rear (tailgate)
            (side * 0.62, -1.35, 1.42), # Roof rear
            (side * 0.65, -1.20, 1.42), # Roof front
            (side * 0.76, -1.20, 0.90),
            (side * 0.68, -1.65, 0.98),
            (side * 0.58, -1.35, 1.40),
            (side * 0.61, -1.20, 1.40)
        ]
        make_mesh_obj(f"C_Pillar_Solid_{'L' if side < 0 else 'R'}", cp_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_red)

    # Black Gloss Floating Roof Trim Insert on C-Pillar (Iconic Gen 3 Myvi cue!)
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.76, -1.25, 1.16))
        float_trim = bpy.context.active_object
        float_trim.name = f"Floating_Roof_Trim_{'L' if side < 0 else 'R'}"
        float_trim.scale = (0.04, 0.12, 0.42)
        float_trim.rotation_euler = (0, 0, side * 0.08)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        float_trim.data.materials.append(mat_black_gloss)
        link_obj(float_trim)

    # =============================================================
    # 4. REAR SECTION (Exact Hum3D Reference Match!)
    # - Aerodynamic Raked Rear Windshield (NOT vertical!)
    # - Two-tier roof spoiler with black side fins
    # - Horizontal wrap-around 2-piece taillights
    # - Perodua oval badge with handle recess & 'Myvi' script
    # - 'HUM3D' license plate in lower hatch recess
    # - Sculpted bumper with black side diffuser cutouts & reflectors
    # =============================================================

    # Two-Tier Rear Roof Spoiler
    # Main horizontal wing extending rearward
    sp_verts = [
        (-0.64, -1.32, 1.44),
        ( 0.64, -1.32, 1.44),
        ( 0.66, -1.58, 1.42), # Significant aerodynamic overhang!
        (-0.66, -1.58, 1.42),
        (-0.63, -1.32, 1.39),
        ( 0.63, -1.32, 1.39),
        ( 0.65, -1.57, 1.38),
        (-0.65, -1.57, 1.38)
    ]
    make_mesh_obj("Spoiler_Main_Wing", sp_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_red)

    # Integrated Red LED High-Mount Stop Lamp (HMSL) centered in spoiler
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.56, 1.40))
    hmsl = bpy.context.active_object
    hmsl.name = "Spoiler_HMSL_LED"
    hmsl.scale = (0.38, 0.03, 0.02)
    bpy.ops.object.transform_apply(scale=True)
    hmsl.data.materials.append(mat_taillight_red)
    link_obj(hmsl)

    # Black Aero Side Fins flanking the rear window (left & right)
    for side in (-1, 1):
        fin_verts = [
            (side * 0.66, -1.34, 1.42),
            (side * 0.67, -1.56, 1.40),
            (side * 0.70, -1.54, 1.08), # Extends downward framing the glass!
            (side * 0.69, -1.36, 1.10),
            (side * 0.63, -1.34, 1.42),
            (side * 0.64, -1.56, 1.40),
            (side * 0.67, -1.54, 1.08),
            (side * 0.66, -1.36, 1.10)
        ]
        make_mesh_obj(f"Spoiler_Side_Fin_{'L' if side < 0 else 'R'}", fin_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_black_gloss)

    # Raked Aerodynamic Rear Windshield Glass (~55° slope from horizontal!)
    # Top at Y = -1.35, Z = 1.40. Bottom at Y = -1.68, Z = 0.98.
    rear_glass_verts = [
        (-0.60, -1.35, 1.40), # Top L
        ( 0.60, -1.35, 1.40), # Top R
        ( 0.68, -1.68, 0.98), # Bottom R
        (-0.68, -1.68, 0.98)  # Bottom L
    ]
    make_mesh_obj("Glass_RearWindshield", rear_glass_verts, [(0, 1, 2, 3)], mat_glass)

    # Rear Window Wiper (Mounted at bottom left-center, resting horizontally)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.03, location=(-0.10, -1.70, 0.97))
    r_wiper_hub = bpy.context.active_object
    r_wiper_hub.name = "Rear_Wiper_Pivot"
    r_wiper_hub.rotation_euler = (math.radians(55), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    r_wiper_hub.data.materials.append(mat_trim_matte)
    link_obj(r_wiper_hub)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.08, -1.69, 0.98))
    r_wiper_blade = bpy.context.active_object
    r_wiper_blade.name = "Rear_Wiper_Blade"
    r_wiper_blade.scale = (0.34, 0.015, 0.018)
    r_wiper_blade.rotation_euler = (math.radians(-35), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    r_wiper_blade.data.materials.append(mat_trim_matte)
    link_obj(r_wiper_blade)

    # Tailgate Lower Body Panel
    tailgate_verts = [
        (-0.70, -1.68, 0.98), # Top L
        ( 0.70, -1.68, 0.98), # Top R
        ( 0.74, -1.82, 0.58), # Bottom R
        (-0.74, -1.82, 0.58), # Bottom L
        (-0.68, -1.62, 0.98),
        ( 0.68, -1.62, 0.98),
        ( 0.72, -1.76, 0.58),
        (-0.72, -1.76, 0.58)
    ]
    make_mesh_obj("Tailgate_Panel", tailgate_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_red)

    # Center Perodua Emblem & Latch Recess
    # Chrome Oval Emblem
    bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.035, location=(0, -1.74, 0.88))
    p_badge = bpy.context.active_object
    p_badge.name = "Badge_Perodua_Tailgate"
    p_badge.rotation_euler = (math.radians(75), 0, 0)
    p_badge.scale = (1.2, 0.85, 1.0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    p_badge.data.materials.append(mat_chrome)
    link_obj(p_badge)

    # Oval Hatch Latch Recess (Right below emblem, as seen in reference photo!)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.02, location=(0, -1.74, 0.82))
    latch_recess = bpy.context.active_object
    latch_recess.name = "Hatch_Handle_Recess"
    latch_recess.rotation_euler = (math.radians(75), 0, 0)
    latch_recess.scale = (1.3, 0.9, 1.0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    latch_recess.data.materials.append(mat_red_dark)
    link_obj(latch_recess)

    # Chrome 'Myvi' Script Badge (Left of emblem!)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.36, -1.73, 0.85))
    myvi_badge = bpy.context.active_object
    myvi_badge.name = "Badge_Myvi_Script"
    myvi_badge.scale = (0.22, 0.015, 0.045)
    bpy.ops.object.transform_apply(scale=True)
    myvi_badge.data.materials.append(mat_chrome)
    link_obj(myvi_badge)

    # License Plate Recess & Plate 'HUM3D'
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.83, 0.54))
    plate_recess = bpy.context.active_object
    plate_recess.name = "License_Plate_Recess"
    plate_recess.scale = (0.58, 0.05, 0.20)
    bpy.ops.object.transform_apply(scale=True)
    plate_recess.data.materials.append(mat_red_dark)
    link_obj(plate_recess)

    # Black Plate Border
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.855, 0.54))
    plate_frame = bpy.context.active_object
    plate_frame.name = "Plate_Frame"
    plate_frame.scale = (0.52, 0.02, 0.16)
    bpy.ops.object.transform_apply(scale=True)
    plate_frame.data.materials.append(mat_plate_bg)
    link_obj(plate_frame)

    # Blue EU/MY side strip on left of plate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.22, -1.868, 0.54))
    blue_strip = bpy.context.active_object
    blue_strip.name = "Plate_Blue_Strip"
    blue_strip.scale = (0.055, 0.010, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    blue_strip.data.materials.append(mat_plate_blue)
    link_obj(blue_strip)

    # White embossed plate text 'HUM3D'
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.04, -1.868, 0.54))
    plate_txt = bpy.context.active_object
    plate_txt.name = "Plate_Text_HUM3D"
    plate_txt.scale = (0.36, 0.010, 0.10)
    bpy.ops.object.transform_apply(scale=True)
    plate_txt.data.materials.append(mat_plate_text)
    link_obj(plate_txt)

    # =============================================================
    # 5. HORIZONTAL WRAP-AROUND TAILLIGHTS (Gen 3 Signature!)
    # Two-piece horizontal lights:
    # Piece 1: Body corner wrap-around
    # Piece 2: Tailgate horizontal extension
    # =============================================================
    for side in (-1, 1):
        # 1. Outer Taillight Piece (On body corner, wrapping from side into rear)
        tl_outer_verts = [
            (side * 0.70, -1.70, 0.96), # Inner top
            (side * 0.85, -1.55, 0.94), # Outer top (swept forward into rear fender)
            (side * 0.86, -1.55, 0.78), # Outer bottom
            (side * 0.72, -1.72, 0.80), # Inner bottom
            (side * 0.67, -1.65, 0.96),
            (side * 0.82, -1.50, 0.94),
            (side * 0.83, -1.50, 0.78),
            (side * 0.69, -1.67, 0.80)
        ]
        make_mesh_obj(f"Taillight_OuterRed_{'L' if side < 0 else 'R'}", tl_outer_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_taillight_red)

        # Clear reverse/indicator inner insert in outer light
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.77, -1.65, 0.86))
        tl_clear = bpy.context.active_object
        tl_clear.name = f"Taillight_ClearSegment_{'L' if side < 0 else 'R'}"
        tl_clear.scale = (0.12, 0.08, 0.08)
        tl_clear.rotation_euler = (0, side * 0.15, side * 0.18)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        tl_clear.data.materials.append(mat_taillight_clear)
        link_obj(tl_clear)

        # 2. Inner Taillight Piece (Extending horizontally onto tailgate!)
        tl_inner_verts = [
            (side * 0.44, -1.74, 0.93), # Center-most top point
            (side * 0.70, -1.71, 0.96), # Outer top
            (side * 0.72, -1.73, 0.80), # Outer bottom
            (side * 0.46, -1.75, 0.85), # Center-most bottom
            (side * 0.42, -1.69, 0.93),
            (side * 0.68, -1.66, 0.96),
            (side * 0.70, -1.68, 0.80),
            (side * 0.44, -1.70, 0.85)
        ]
        make_mesh_obj(f"Taillight_InnerTailgate_{'L' if side < 0 else 'R'}", tl_inner_verts, [(0,1,2,3),(4,7,6,5),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,2,6,7)], mat_taillight_red)

    # =============================================================
    # 6. REAR BUMPER, CORNER DIFFUSERS & REFLECTORS
    # Exact match to Hum3D reference:
    # - Smooth sculpted bumper
    # - Black faux aerodynamic cutouts on bottom left and right
    # - Slim horizontal red reflectors above the black cutouts
    # =============================================================

    # Main Rear Bumper Body
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.80, 0.38))
    r_bumper = bpy.context.active_object
    r_bumper.name = "Bumper_Rear"
    r_bumper.scale = (1.72, 0.22, 0.38)
    bpy.ops.object.transform_apply(scale=True)
    r_bumper.data.materials.append(mat_red)
    link_obj(r_bumper)

    # Black Faux Aerodynamic Diffuser Cutouts (Bottom L & R)
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.58, -1.89, 0.26))
        diff_vent = bpy.context.active_object
        diff_vent.name = f"Bumper_Diffuser_Vent_{'L' if side < 0 else 'R'}"
        diff_vent.scale = (0.24, 0.08, 0.14)
        diff_vent.rotation_euler = (0, 0, side * 0.08)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        diff_vent.data.materials.append(mat_trim_matte)
        link_obj(diff_vent)

        # Slim Horizontal Red Reflectors (Mounted above the black vent!)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.58, -1.91, 0.36))
        refl = bpy.context.active_object
        refl.name = f"Reflector_Horizontal_{'L' if side < 0 else 'R'}"
        refl.scale = (0.18, 0.025, 0.035)
        bpy.ops.object.transform_apply(scale=True)
        refl.data.materials.append(mat_taillight_red)
        link_obj(refl)

    # =============================================================
    # 7. SIDE MIRRORS & TURBINE ALLOY WHEELS
    # =============================================================
    for side in (-1, 1):
        # Body-colored mirror shell
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.88, 0.45, 0.94))
        m_shell = bpy.context.active_object
        m_shell.name = f"Mirror_Shell_{'L' if side < 0 else 'R'}"
        m_shell.scale = (0.20, 0.15, 0.10)
        m_shell.rotation_euler = (0, 0, side * 0.18)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        m_shell.data.materials.append(mat_red)
        link_obj(m_shell)

        # Amber turn indicator strip on mirror shell
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.92, 0.46, 0.94))
        m_led = bpy.context.active_object
        m_led.name = f"Mirror_Indicator_{'L' if side < 0 else 'R'}"
        m_led.scale = (0.035, 0.10, 0.025)
        bpy.ops.object.transform_apply(scale=True)
        m_led.data.materials.append(mat_amber)
        link_obj(m_led)

    # 15-inch Two-Tone Directional Turbine Alloy Wheels (10 Spokes!)
    wheel_coords = [
        ("Front_L", -0.84,  1.20, 0.32),
        ("Front_R",  0.84,  1.20, 0.32),
        ("Rear_L",  -0.84, -1.22, 0.32),
        ("Rear_R",   0.84, -1.22, 0.32)
    ]

    for w_name, wx, wy, wz in wheel_coords:
        # Rubber Tire (Low Profile)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.20, location=(wx, wy, wz))
        tire = bpy.context.active_object
        tire.name = f"Tire_{w_name}"
        tire.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        tire.data.materials.append(mat_tire)
        link_obj(tire)

        # Dark Anthracite Inner Rim Basin
        bpy.ops.mesh.primitive_cylinder_add(radius=0.23, depth=0.21, location=(wx, wy, wz))
        rim_dark = bpy.context.active_object
        rim_dark.name = f"Rim_Dark_{w_name}"
        rim_dark.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rim_dark.data.materials.append(mat_alloy_dark)
        link_obj(rim_dark)

        # Polished Silver Outer Lip
        bpy.ops.mesh.primitive_cylinder_add(radius=0.235, depth=0.03, location=(wx + (0.09 if wx > 0 else -0.09), wy, wz))
        rim_lip = bpy.context.active_object
        rim_lip.name = f"Rim_Lip_{w_name}"
        rim_lip.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        rim_lip.data.materials.append(mat_alloy_silver)
        link_obj(rim_lip)

        # Center Cap with Perodua Emblem
        bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.22, location=(wx, wy, wz))
        hub = bpy.context.active_object
        hub.name = f"Rim_Hub_{w_name}"
        hub.rotation_euler = (0, math.pi / 2, 0)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        hub.data.materials.append(mat_chrome)
        link_obj(hub)

        # 10 Turbine Spokes (Alternating Silver / Machined)
        for s_idx in range(10):
            ang = s_idx * (2 * math.pi / 10)
            sy = wy + math.sin(ang) * 0.13
            sz = wz + math.cos(ang) * 0.13
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wx + (0.08 if wx > 0 else -0.08), sy, sz))
            spk = bpy.context.active_object
            spk.name = f"Turbine_Spoke_{w_name}_{s_idx}"
            spk.scale = (0.035, 0.030, 0.12)
            # Twist angle for directional turbine blade look!
            spk.rotation_euler = (ang, math.radians(15 if wx > 0 else -15), 0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            spk.data.materials.append(mat_alloy_silver if s_idx % 2 == 0 else mat_alloy_dark)
            link_obj(spk)

    # =============================================================
    # 8. EXPORT GLB TO GAME ASSETS
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
    print(f"Exported Hum3D Gen 3 Myvi to {glb_path}")

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

    print("Successfully built authentic Hum3D Gen 3 Myvi in Blender!")

build_hum3d_myvi()
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
