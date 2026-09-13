import json, struct, sys
from pathlib import Path

path = Path(sys.argv[1])
data = path.read_bytes()
off = 12
gltf = None
bin_chunk = None
while off < len(data):
    clen, ctype = struct.unpack_from("<I4s", data, off)
    off += 8
    chunk = data[off : off + clen]
    off += clen
    if ctype == b"JSON":
        gltf = json.loads(chunk)
    elif ctype == b"BIN\x00":
        bin_chunk = chunk

nodes = gltf["nodes"]
print("nodes", len(nodes))
has_t = sum(1 for n in nodes if "translation" in n)
has_r = sum(1 for n in nodes if "rotation" in n)
has_s = sum(1 for n in nodes if "scale" in n)
has_m = sum(1 for n in nodes if "matrix" in n)
has_c = sum(1 for n in nodes if "children" in n)
print("with translation", has_t, "rotation", has_r, "scale", has_s, "matrix", has_m, "children", has_c)

# sample translations
ts = [n["translation"] for n in nodes if "translation" in n]
if ts:
    xs, ys, zs = zip(*ts)
    print("translation x", min(xs), max(xs))
    print("translation y", min(ys), max(ys))
    print("translation z", min(zs), max(zs))
    print("sample", ts[:8])

# accessors bounds
acc = gltf.get("accessors", [])
mins = []
maxs = []
for a in acc:
    if a.get("type") == "VEC3" and "min" in a and "max" in a:
        mins.append(a["min"])
        maxs.append(a["max"])
if mins:
    import math
    mn = [min(m[i] for m in mins) for i in range(3)]
    mx = [max(m[i] for m in maxs) for i in range(3)]
    print("accessor vec3 min", mn)
    print("accessor vec3 max", mx)
    print("size", [mx[i]-mn[i] for i in range(3)])

# materials
print("materials:")
for m in gltf.get("materials", []):
    pbr = m.get("pbrMetallicRoughness", {})
    print(" ", m.get("name"), "base", pbr.get("baseColorFactor"), "alpha", m.get("alphaMode"), "double", m.get("doubleSided"))
