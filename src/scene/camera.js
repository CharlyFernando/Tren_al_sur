import * as THREE from "three";

const BASE_POSITION = new THREE.Vector3(0, 2.6, 14);
const LOOK_AT = new THREE.Vector3(0, 2.15, -40);

export function createCameraRig() {
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 900);
  camera.position.copy(BASE_POSITION);
  camera.lookAt(LOOK_AT);

  function resize(aspect) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  // Slow, almost imperceptible handheld drift. No free camera.
  function update(time) {
    camera.position.x =
      BASE_POSITION.x +
      Math.sin(time * 0.055) * 0.4 +
      Math.sin(time * 0.021 + 1.3) * 0.16;
    camera.position.y =
      BASE_POSITION.y + Math.sin(time * 0.041 + 0.7) * 0.09;
    camera.lookAt(LOOK_AT);
  }

  function reset() {
    camera.position.copy(BASE_POSITION);
    camera.lookAt(LOOK_AT);
  }

  resize(window.innerWidth / window.innerHeight);

  return { camera, resize, update, reset };
}
