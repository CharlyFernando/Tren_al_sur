import * as THREE from "three";
import { createCameraRig } from "./camera.js";
import { createOcean } from "./ocean.js";
import { createSun } from "./sun.js";

function isCompactViewport() {
  return Math.min(window.innerWidth, window.innerHeight) < 700;
}

export function createScene(container, { reducedMotion = false } = {}) {
  const scene = new THREE.Scene();

  const cameraRig = createCameraRig();
  const { camera } = cameraRig;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const ocean = createOcean(scene);
  const sun = createSun(scene);

  let motionReduced = reducedMotion;
  let needsRender = true;
  let frameId = 0;
  let last = performance.now();
  let time = 0;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    const maxPixelRatio = isCompactViewport() ? 1.6 : 2;

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, maxPixelRatio)
    );
    renderer.setSize(width, height, false);
    cameraRig.resize(aspect);
    sun.layout(aspect);

    needsRender = true;
  }

  function render() {
    ocean.update(time);
    ocean.setSunPosition(sun.position);
    cameraRig.update(motionReduced ? 0 : time);
    if (!motionReduced) sun.update(time);
    renderer.render(scene, camera);
  }

  function frame(now) {
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!document.hidden) {
      if (!motionReduced) {
        time += delta;
        render();
      } else if (needsRender) {
        render();
        needsRender = false;
      }
    }

    frameId = requestAnimationFrame(frame);
  }

  function setReducedMotion(value) {
    motionReduced = value;
    needsRender = true;
  }

  function dispose() {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    ocean.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  window.addEventListener("resize", resize);
  resize();
  render();

  frameId = requestAnimationFrame(frame);

  return { scene, camera, renderer, ocean, sun, resize, setReducedMotion, dispose };
}
