import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;
  varying float vDepth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float swell(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.30 + t * 0.50) * 0.55;
    h += sin(p.y * 0.20 - t * 0.38) * 0.80;
    h += sin((p.x * 0.55 + p.y * 0.40) + t * 0.70) * 0.28;
    h += noise(p * 0.28 + vec2(t * 0.05, t * 0.03)) * 0.45;
    h += noise(p * 0.72 - vec2(t * 0.08, t * 0.05)) * 0.16;
    return h;
  }

  // Long swells flatten with distance, which limits shimmer and aliasing far away.
  float amplitudeAt(float z) {
    float nearFade = mix(1.0, 0.12, smoothstep(20.0, 150.0, -z));
    float horizonFade = 1.0 - smoothstep(200.0, 286.0, -z);
    return nearFade * horizonFade;
  }

  void main() {
    vec2 p = position.xz;
    float amp = uAmplitude * amplitudeAt(position.z);
    float t = uTime;

    float h = swell(p, t) * amp;
    float e = 0.9;
    float hx = swell(p + vec2(e, 0.0), t) * amp;
    float hz = swell(p + vec2(0.0, e), t) * amp;

    vec3 displaced = position;
    displaced.y += h;

    vec3 normal = normalize(vec3((h - hx) / e, 1.0, (h - hz) / e));

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vHeight = h / max(amp, 0.0001);
    vDepth = -position.z;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeepColor;
  uniform vec3 uMidColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uSkyColor;
  uniform vec3 uSunColor;
  uniform vec3 uSunPosition;
  uniform float uTime;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vHeight;
  varying float vDepth;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunPosition - vWorldPosition);

    float depth = clamp(vDepth / 300.0, 0.0, 1.0);

    vec3 color = mix(uDeepColor, uMidColor, smoothstep(0.0, 0.46, depth));

    // Grazing angles mirror the violet sky above the horizon, not the sun.
    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 4.0);
    color = mix(color, uSkyColor, fresnel * 0.62);

    // Only the last stretch before the horizon picks up the warm sky.
    float warm = smoothstep(0.7, 1.0, depth);
    color = mix(color, uHorizonColor, warm * 0.75);

    // Reflected view ray against the sun: this keeps the highlight on the
    // water path under the sun instead of washing the whole surface.
    vec3 reflected = reflect(-viewDir, normal);
    float alignment = max(dot(reflected, sunDir), 0.0);

    float ripple = 0.5 + 0.5 * sin(vWorldPosition.z * 2.8 + uTime * 1.7);
    float glitter = pow(alignment, 280.0) * 4.2 * mix(0.5, 1.2, ripple);
    float sheen = pow(alignment, 32.0) * 0.14;

    float specularMask = smoothstep(0.0, 0.1, depth);
    color += uSunColor * (glitter + sheen) * specularMask;

    float crest = smoothstep(0.58, 1.0, vHeight);
    color += uSunColor * crest * 0.012 * (1.0 - smoothstep(0.2, 0.7, depth));

    color = mix(color, uHorizonColor, smoothstep(0.9, 1.0, depth) * 0.55);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function isCompactViewport() {
  return Math.min(window.innerWidth, window.innerHeight) < 700;
}

export function createOcean(scene) {
  const segments = isCompactViewport() ? [150, 120] : [280, 210];

  const geometry = new THREE.PlaneGeometry(620, 340, segments[0], segments[1]);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -130);

  const uniforms = {
    uTime: { value: 0 },
    uAmplitude: { value: 0.7 },
    uDeepColor: { value: new THREE.Color("#082033") },
    uMidColor: { value: new THREE.Color("#0d3a58") },
    uHorizonColor: { value: new THREE.Color("#c9755a") },
    uSkyColor: { value: new THREE.Color("#46405e") },
    uSunColor: { value: new THREE.Color("#ffc98f") },
    uSunPosition: { value: new THREE.Vector3(34, 30, -180) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  function update(time) {
    uniforms.uTime.value = time;
  }

  function setSunPosition(position) {
    uniforms.uSunPosition.value.copy(position);
  }

  function dispose() {
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
  }

  return { mesh, update, setSunPosition, dispose };
}
