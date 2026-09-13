import bpy
import os
from mathutils import Vector

SRC = "/Users/sirazhang/Downloads/月亮3d.glb"
OUT = "/Users/sirazhang/WorkBuddy/2026-09-10-19-46-02/public/models/moon.glb"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
print("moon meshes", len(meshes), [o.name for o in meshes[:8]])

for obj in meshes:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    verts = len(obj.data.vertices)
    ratio = 0.08
    if verts > 30000:
        ratio = min(ratio, 12000 / verts)
    mod = obj.modifiers.new("Decimate", "DECIMATE")
    mod.ratio = max(0.02, ratio)
    bpy.ops.object.modifier_apply(modifier="Decimate")
    print(" verts", verts, "->", len(obj.data.vertices))

for img in bpy.data.images:
    w, h = img.size
    print(" image", img.name, w, h)
    if max(w, h) > 1024 and w > 0:
        nw, nh = 1024, max(1, int(h * 1024 / w))
        try:
            img.scale(nw, nh)
        except Exception as e:
            print("  scale fail", e)

bpy.context.view_layer.update()
minv = Vector((1e9, 1e9, 1e9))
maxv = Vector((-1e9, -1e9, -1e9))
for obj in meshes:
    for corner in obj.bound_box:
        w = obj.matrix_world @ Vector(corner)
        minv.x = min(minv.x, w.x)
        minv.y = min(minv.y, w.y)
        minv.z = min(minv.z, w.z)
        maxv.x = max(maxv.x, w.x)
        maxv.y = max(maxv.y, w.y)
        maxv.z = max(maxv.z, w.z)
size = maxv - minv
longest = max(size.x, size.y, size.z, 0.001)
center = (minv + maxv) * 0.5
scale = 2.4 / longest
print("size", tuple(round(x, 3) for x in size), "scale", round(scale, 4))

for obj in meshes:
    obj.location = obj.location - center
    obj.scale = obj.scale * scale
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_image_format="JPEG",
    export_jpeg_quality=72,
    export_draco_mesh_compression_enable=False,
    export_yup=True,
)
print("exported", OUT, "mb", round(os.path.getsize(OUT) / 1024 / 1024, 2))
