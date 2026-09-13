import * as THREE from "three";

/** 小车当前世界坐标，供路灯等每帧读取，不进 zustand。 */
export const CAR_WORLD = new THREE.Vector3(0, 0, 0);
export const CAR_DRIVING = { value: false };
