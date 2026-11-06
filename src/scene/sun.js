import * as THREE from "three";

function createRadialTexture(stops, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const HALO_TEXTURE = () =>
  createRadialTexture([
    [0, "rgba(255, 226, 186, 0.55)"],
    [0.16, "rgba(255, 190, 136, 0.34)"],
    [0.38, "rgba(255, 146, 92, 0.12)"],
    [0.66, "rgba(255, 120, 72, 0.035)"],
    [1, "rgba(255, 110, 60, 0)"],
  ]);

const GLOW_TEXTURE = () =>
  createRadialTexture([
    [0, "rgba(255, 249, 232, 0.95)"],
    [0.22, "rgba(255, 226, 176, 0.72)"],
    [0.5, "rgba(255, 176, 116, 0.25)"],
    [1, "rgba(255, 150, 90, 0)"],
  ]);

const CORE_TEXTURE = () =>
  createRadialTexture([
    [0, "rgba(255, 253, 245, 1)"],
    [0.45, "rgba(255, 240, 208, 0.98)"],
    [0.72, "rgba(255, 214, 160, 0.8)"],
    [1, "rgba(255, 190, 130, 0)"],
  ]);

function makeSprite(texture, scale, color, opacity) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale, scale, 1);
  sprite.renderOrder = 2;
  return sprite;
}

export function createSun(scene) {
  const group = new THREE.Group();

  const halo = makeSprite(HALO_TEXTURE(), 92, "#ffb27a", 1);
  const glow = makeSprite(GLOW_TEXTURE(), 40, "#ffd2a0", 0.95);
  const core = makeSprite(CORE_TEXTURE(), 12, "#fff4dc", 1);

  group.add(halo, glow, core);
  scene.add(group);

  const anchor = new THREE.Vector3(64, 34, -180);

  function layout(aspect) {
    const narrow = aspect < 1.05;
    anchor.set(narrow ? 22 : 64, narrow ? 38 : 34, -180);
    group.position.copy(anchor);
  }

  function update(time) {
    group.position.x = anchor.x + Math.sin(time * 0.031 + 0.8) * 0.45;
    group.position.y = anchor.y + Math.sin(time * 0.043) * 0.6;
    group.position.z = anchor.z;
  }

  layout(window.innerWidth / window.innerHeight);

  return {
    group,
    position: group.position,
    layout,
    update,
  };
}
