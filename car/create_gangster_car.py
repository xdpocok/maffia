import numpy as np
import trimesh
from trimesh.creation import box, cylinder, uv_sphere
from trimesh.transformations import rotation_matrix, translation_matrix

# Materials
mat_body = trimesh.visual.material.PBRMaterial(name='deep_black_paint', baseColorFactor=[0.01,0.01,0.012,1], roughnessFactor=0.42, metallicFactor=0.0)
mat_dark = trimesh.visual.material.PBRMaterial(name='dark_tinted_glass', baseColorFactor=[0.02,0.035,0.05,0.72], roughnessFactor=0.18, metallicFactor=0.0, alphaMode='BLEND')
mat_chrome = trimesh.visual.material.PBRMaterial(name='aged_chrome', baseColorFactor=[0.72,0.72,0.68,1], roughnessFactor=0.22, metallicFactor=0.75)
mat_tire = trimesh.visual.material.PBRMaterial(name='rubber_black', baseColorFactor=[0.004,0.004,0.004,1], roughnessFactor=0.85, metallicFactor=0)
mat_white = trimesh.visual.material.PBRMaterial(name='whitewall_tire', baseColorFactor=[0.92,0.88,0.78,1], roughnessFactor=0.7, metallicFactor=0)
mat_light = trimesh.visual.material.PBRMaterial(name='warm_headlight', baseColorFactor=[1.0,0.83,0.45,1], roughnessFactor=0.2, metallicFactor=0)
mat_red = trimesh.visual.material.PBRMaterial(name='tail_light_red', baseColorFactor=[0.8,0.03,0.02,1], roughnessFactor=0.35, metallicFactor=0)
mat_wood = trimesh.visual.material.PBRMaterial(name='wooden_crate', baseColorFactor=[0.36,0.18,0.07,1], roughnessFactor=0.8, metallicFactor=0)

scene = trimesh.Scene()

def add(mesh, name, mat, transform=None):
    mesh.visual.material = mat
    if transform is not None:
        mesh.apply_transform(transform)
    scene.add_geometry(mesh, node_name=name, geom_name=name)
    return mesh

def T(x,y,z): return translation_matrix([x,y,z])
def R(angle, axis): return rotation_matrix(angle, axis)

# Main body: stylized long sedan proportions, length along X, width Y, height Z
add(box(extents=[4.8, 1.75, 0.58]), 'long_rounded_body_block', mat_body, T(0,0,0.75))
add(box(extents=[2.2, 1.55, 0.46]), 'long_motor_hood', mat_body, T(-1.25,0,1.08))
add(box(extents=[1.55, 1.42, 0.95]), 'boxy_passenger_cabin', mat_body, T(0.85,0,1.42))
add(box(extents=[0.85, 1.5, 0.38]), 'rear_trunk', mat_body, T(1.95,0,1.03))

# Windows
add(box(extents=[0.88, 1.48, 0.35]), 'front_windshield_dark', mat_dark, T(0.26,0,1.67) @ R(np.deg2rad(8), [0,1,0]))
add(box(extents=[0.7, 1.5, 0.32]), 'rear_window_dark', mat_dark, T(1.42,0,1.66) @ R(np.deg2rad(-8), [0,1,0]))
add(box(extents=[1.25, 0.06, 0.42]), 'left_side_window_dark', mat_dark, T(0.86,0.735,1.58))
add(box(extents=[1.25, 0.06, 0.42]), 'right_side_window_dark', mat_dark, T(0.86,-0.735,1.58))

# Fenders as horizontal cylinders over each wheel
for x in [-1.65, 1.55]:
    for y, side in [(0.93,'L'), (-0.93,'R')]:
        f = cylinder(radius=0.45, height=0.34, sections=24)
        # cylinder axis default z -> rotate to y axis
        add(f, f'{side}_rounded_fender_{x}', mat_body, T(x,y,0.68) @ R(np.pi/2, [1,0,0]))
        # flatten bottom by visual overlap body; keep low-poly semicircular style

# Wheels: tires cylinders, whitewall disks, chrome hubs
for x in [-1.65, 1.55]:
    for y, side in [(1.02,'L'), (-1.02,'R')]:
        tire = cylinder(radius=0.36, height=0.28, sections=32)
        add(tire, f'{side}_black_tire_{x}', mat_tire, T(x,y,0.38) @ R(np.pi/2, [1,0,0]))
        ww = cylinder(radius=0.25, height=0.295, sections=32)
        add(ww, f'{side}_whitewall_{x}', mat_white, T(x,y,0.38) @ R(np.pi/2, [1,0,0]))
        hub = cylinder(radius=0.13, height=0.31, sections=24)
        add(hub, f'{side}_chrome_hubcap_{x}', mat_chrome, T(x,y,0.38) @ R(np.pi/2, [1,0,0]))

# Bumpers and grille
add(box(extents=[0.18, 1.85, 0.16]), 'front_chrome_bumper', mat_chrome, T(-2.55,0,0.68))
add(box(extents=[0.18, 1.75, 0.16]), 'rear_chrome_bumper', mat_chrome, T(2.52,0,0.68))
add(box(extents=[0.12, 1.05, 0.65]), 'vertical_chrome_grille', mat_chrome, T(-2.42,0,1.02))
for z in [0.84, 1.0, 1.16]:
    add(box(extents=[0.14, 1.1, 0.045]), f'grille_slats_{z}', mat_body, T(-2.5,0,z))

# Lights
for y in [0.58,-0.58]:
    add(uv_sphere(radius=0.16, count=[16,8]), f'round_headlight_{y}', mat_light, T(-2.48,y,1.12))
for y in [0.58,-0.58]:
    add(box(extents=[0.08,0.18,0.12]), f'red_tail_light_{y}', mat_red, T(2.48,y,0.94))

# Running boards
for y, side in [(1.02,'L'), (-1.02,'R')]:
    add(box(extents=[3.4,0.18,0.09]), f'{side}_running_board', mat_chrome, T(-0.05,y,0.58))

# Spare tire on rear
spare = cylinder(radius=0.32, height=0.18, sections=32)
add(spare, 'rear_spare_tire', mat_tire, T(2.62,0,0.96) @ R(np.pi/2, [0,1,0]))
add(cylinder(radius=0.19, height=0.19, sections=32), 'rear_spare_whitewall', mat_white, T(2.63,0,0.96) @ R(np.pi/2, [0,1,0]))

# Small optional wooden crate on rear seat/trunk vibe
add(box(extents=[0.48,0.55,0.28]), 'small_wooden_cargo_crate', mat_wood, T(1.8,0,1.28))
for yy in [-0.18,0.18]:
    add(box(extents=[0.5,0.045,0.3]), f'crate_slats_{yy}', mat_chrome, T(1.8,yy,1.285))

# Origin center floor, add metadata
scene.metadata['title'] = 'Stylized 1930s Gangster Car - Browser Game Ready'
scene.metadata['author'] = 'Generated by ChatGPT'

# Export GLB
out='/mnt/data/gangster_car_1930_lowpoly.glb'
scene.export(out)
print(out)
