import { useGLTF } from "@react-three/drei";

// Default drei decoder is Google CDN; that hangs the loader at ~97% offline.
useGLTF.setDecoderPath("/draco/");

export function preloadModel(path: string) {
  useGLTF.preload(path, "/draco/", false);
}
