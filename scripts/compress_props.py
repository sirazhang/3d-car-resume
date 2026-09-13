import bpy
import os
from mathutils import Vector

OUT = "/Users/sirazhang/WorkBuddy/2026-09-10-19-46-02/public/models"
os.makedirs(OUT, exist_ok=True)

JOBS = [
    {
        "src": "/Users/sirazhang/Downloads/装饰素材/云朵.glb",
        "out": "cloud.glb",
        "ratio": 0.06,
        "target_size": 2.4,
    },
    {
        "src": "/Users/sirazhang/Downloads/装饰素材/热气球1.glb",
        "out": "balloon1.glb",
        "ratio": 0.06,
        "target_size": 2.2,
    },
    {
        "src": "/Users/sirazhang/Downloads/装饰素材/热气球2.glb",
        "out": "balloon2.glb",
        "ratio": 0.06,
        "target_size": 2.2,
    },
    {
        "src": "/Users/sirazhang/Downloads/装饰素材/郁金香.glb",
        "out": "tulips.glb",
        "ratio": 0.04,
        "target_size": 1.6,
    },
]


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def world_aabb(objs):
    minv = Vector((1e9, 1e9, 1e9))
    maxv = Vector((-1e9, -1e9, -1e9))
    for obj in objs:
        for corner in obj.bound_box:
            w = obj.matrix_world @ Vector(corner)
            minv.x = min(minv.x, w.x)
            minv.y = min(minv.y, w.y)
            minv.z = min(minv.z, w.z)
            maxv.x = max(maxv.x, w.x)
            maxv.y = max(maxv.y, w.y)
            maxv.z = max(maxv.z, w.z)
    return minv, maxv


def process(job):
    reset()
    bpy.ops.import_scene.gltf(filepath=job["src"])
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    print("===", os.path.basename(job["src"]), "meshes", len(meshes))

    for obj in meshes:
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        verts = len(obj.data.vertices)
        ratio = job["ratio"]
        if verts > 20000:
            ratio = min(ratio, 10000 / verts)
        mod = obj.modifiers.new("Decimate", "DECIMATE")
        mod.ratio = max(0.015, ratio)
        bpy.ops.object.modifier_apply(modifier="Decimate")
        print("  verts", verts, "->", len(obj.data.vertices))

    for img in bpy.data.images:
        w, h = img.size
        if max(w, h) > 512 and w > 0:
            nw, nh = 512, max(1, int(h * 512 / w))
            try:
                img.scale(nw, nh)
            except Exception as e:
                print("  scale fail", img.name, e)

    bpy.context.view_layer.update()
    minv, maxv = world_aabb(meshes)
    size = maxv - minv
    longest = max(size.x, size.y, size.z, 0.001)
    center = (minv + maxv) * 0.5
    scale = job["target_size"] / longest
    print("  size", tuple(round(x, 3) for x in size), "scale", round(scale, 4))

    for obj in meshes:
        obj.location = obj.location - center
        obj.scale = obj.scale * scale
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    out = os.path.join(OUT, job["out"])
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_image_format="JPEG",
        export_jpeg_quality=70,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_yup=True,
    )
    print("  exported", out, "mb", round(os.path.getsize(out) / 1024 / 1024, 2))


for job in JOBS:
    try:
        process(job)
    except Exception as e:
        print("FAIL", job["src"], type(e).__name__, e)

print("ALL DONE")
