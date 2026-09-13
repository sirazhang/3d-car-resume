"""Print mesh names / bounds of a GLB without Blender."""
import json, struct, sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "public/models/tower.glb")
data = path.read_bytes()
magic, version, length = struct.unpack_from("<4sII", data, 0)
assert magic == b"glTF", magic
off = 12
json_chunk = None
while off < length:
    clen, ctype = struct.unpack_from("<I4s", data, off)
    off += 8
    chunk = data[off : off + clen]
    off += clen
    if ctype == b"JSON":
        json_chunk = json.loads(chunk)
        break
assert json_chunk
nodes = json_chunk.get("nodes", [])
meshes = json_chunk.get("meshes", [])
print("file", path, "size", path.stat().st_size)
print("nodes", len(nodes), "meshes", len(meshes), "materials", len(json_chunk.get("materials", [])))
print("scenes", json_chunk.get("scenes"))
names = [n.get("name", "") for n in nodes]
print("--- node names containing SHOP / School / Library / Movie / Cafe ---")
for n in names:
    u = n.upper()
    if any(k in u for k in ("SHOP", "SCHOOL", "LIBRARY", "MOVIE", "CAFE", "TECH", "SIGN", "STORE")):
        print(" ", n)
print("--- first 80 node names ---")
for n in names[:80]:
    print(" ", n)
print("total unique names", len(set(names)))
print("sample extras", [n for n in names if n][80:140])
