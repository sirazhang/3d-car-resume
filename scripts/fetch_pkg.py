#!/usr/bin/env python3
import json, os, shutil, tarfile, urllib.request
from pathlib import Path

ROOT = Path("/tmp/nm/node_modules")
CACHE = Path("/tmp/nm/tgz")
ROOT.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)

UA = {"User-Agent": "spiral-town/1.0"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def meta(name: str, ver: str | None = None) -> dict:
    url = f"https://registry.npmjs.org/{name}/{ver or 'latest'}"
    return json.loads(get(url).decode())


def dest_of(name: str) -> Path:
    return ROOT.joinpath(*name.split("/"))


def extract_tgz(data: bytes, dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True, exist_ok=True)
    tmp = CACHE / "cur.tgz"
    tmp.write_bytes(data)
    with tarfile.open(tmp, "r:gz") as tf:
        names = tf.getnames()
        prefix = names[0].split("/")[0] if names else "package"
        for m in tf.getmembers():
            parts = Path(m.name).parts
            if not parts:
                continue
            rel = Path(*parts[1:]) if parts[0] == prefix else Path(*parts)
            if not str(rel) or str(rel) == ".":
                continue
            target = dest / rel
            if m.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif m.isfile():
                target.parent.mkdir(parents=True, exist_ok=True)
                src = tf.extractfile(m)
                if src:
                    target.write_bytes(src.read())


def install(name: str, ver: str | None = None) -> dict:
    d = dest_of(name)
    if (d / "package.json").exists():
        return json.loads((d / "package.json").read_text()).get("dependencies") or {}
    print(f"GET {name}@{ver or 'latest'}", flush=True)
    m = meta(name, ver)
    tarball = m["dist"]["tarball"]
    data = get(tarball)
    extract_tgz(data, d)
    print(f"  OK {m['version']} {d}", flush=True)
    return m.get("dependencies") or {}


def strip(spec: str) -> str | None:
    s = spec.strip()
    if s.startswith("npm:"):
        return None
    for ch in "^~>=< ":
        s = s.replace(ch, "")
    if "||" in spec:
        # take last
        s = spec.split("||")[-1]
        for ch in "^~>=< ":
            s = s.replace(ch, "")
    s = s.split("-")[0] if s.count(".") >= 2 else s
    # keep x.y.z only
    parts = []
    for p in s.split("."):
        num = "".join(c for c in p if c.isdigit())
        if num:
            parts.append(num)
        if len(parts) == 3:
            break
    return ".".join(parts) if parts else None


roots = {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "three": "0.160.1",
    "@react-three/fiber": "8.17.10",
    "@react-three/drei": "9.117.3",
    "@react-three/postprocessing": "2.16.3",
    "zustand": "4.5.5",
    "vite": "5.4.11",
    "@vitejs/plugin-react": "4.3.3",
    "tailwindcss": "3.4.15",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "typescript": "5.6.3",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1",
    "@types/three": "0.160.0",
}

from collections import deque

q = deque(roots.items())
seen = set()
n = 0
while q and n < 350:
    name, ver = q.popleft()
    key = f"{name}@{ver}"
    if key in seen:
        continue
    seen.add(key)
    try:
        deps = install(name, ver)
        n += 1
    except Exception as e:
        print("ERR", name, ver, e, flush=True)
        # retry latest
        try:
            deps = install(name, None)
            n += 1
        except Exception as e2:
            print("SKIP", name, e2, flush=True)
            continue
    for dn, ds in (deps or {}).items():
        q.append((dn, strip(str(ds))))

print("installed packages", n)
