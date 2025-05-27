import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

// Background textures
import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import trappist1bTexture from '/images/trappist1B.png';
import trappist1cTexture from '/images/trappist1C.png';
import trappist1dTexture from '/images/trappist1D.png';
import trappist1eTexture from '/images/trappist1E.png';
import trappist1fTexture from '/images/trappist1F.png';
import trappist1gTexture from '/images/trappist1G.png';
import trappist1hTexture from '/images/trappist1H.png';

// ****** SETUP ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-50, 30, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();
const orbits = [];

// ****** POSTPROCESSING SETUP ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ****** OUTLINE PASS ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 1.5;
outlinePass.edgeGlow = 0.5;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ****** BLOOM PASS ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 3.1;
bloomPass.strength = 1.0;
bloomPass.radius = 0.0;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
const lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);

// ****** STAR BACKGROUND ******
scene.background = cubeTextureLoader.load([
  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ****** CONTROLS ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS ******
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9,
  showOrbits: true
};

gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {});
gui.add(settings, 'sunIntensity', 1, 10, 0.1).onChange(value => {
  sunMaterial.uniforms.emissiveIntensity.value = value * (5.0 / 1.9);
  coronaMaterial.uniforms.glowIntensity.value = value * 0.9;
});
gui.add(settings, 'showOrbits').name('Show Orbits').onChange(value => {
  orbits.forEach(orbit => {
    orbit.visible = value;
  });
});

// ****** MOUSE INTERACTION ******
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();
      settings.accelerationOrbit = 0;
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition);
      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  const planets = [trappist1b, trappist1c, trappist1d, trappist1e, trappist1f, trappist1g, trappist1h];
  const offsets = [25, 25, 25, 25, 25, 25, 25];
  for (let i = 0; i < planets.length; i++) {
    if (clickedObject === planets[i].planet) {
      offset = offsets[i];
      return planets[i];
    }
  }
  return null;
}

// ****** SHOW PLANET INFO ******
function showPlanetInfo(planet) {
  const info = document.getElementById('planetInfo');
  const name = document.getElementById('planetName');
  const details = document.getElementById('planetDetails');
  name.innerText = planet;
  details.innerText = planetData[planet].text;
  info.style.display = 'block';
}

let isZoomingOut = false;
const zoomOutTargetPosition = new THREE.Vector3(-50, 30, 5);

function closeInfo() {
  const info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}

function closeInfoNoZoomOut() {
  const info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
}

window.closeInfo = closeInfo;

// ****** SUN ******
const noiseGLSL = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float noise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

let sunMaterial;
const sunSize = 10; // Scaled for TRAPPIST-1 star (smaller than Sun)
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 32);

sunMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    emissiveIntensity: { value: 5.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float emissiveIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;
    ${noiseGLSL}
    void main() {
      float noiseValue = noise(vPosition + time);
      vec3 color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.4, 0.1), noiseValue);
      float intensity = (noiseValue * 0.5 + 0.5) * emissiveIntensity * 2.0;
      gl_FragColor = vec4(color * intensity, 1.0);
    }
  `
});

const sun = new THREE.Mesh(sunGeom, sunMaterial);
scene.add(sun);

const coronaSize = sunSize * 1.075;
const coronaGeom = new THREE.SphereGeometry(coronaSize, 32, 32);
const coronaMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    glowIntensity: { value: 1.7 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float glowIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(vPosition - cameraPosition);
      float rim = 1.0 - abs(dot(vNormal, viewDir));
      float glow = pow(rim, 1.5) * glowIntensity + 0.3 * glowIntensity;
      vec3 color = vec3(1.0, 0.7, 0.3);
      gl_FragColor = vec4(color * glow, glow * 0.7);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.BackSide
});
const corona = new THREE.Mesh(coronaGeom, coronaMaterial);
scene.add(corona);

const pointLight = new THREE.PointLight(0xFDFFD3, 1200, 400, 1.4);
scene.add(pointLight);

// ****** PLANET CREATION FUNCTION ******
function createPlanet(planetName, size, position_a, position_b, orbitcenter_x, orbitcenter_y, tilt, texture, inclination = 0, omega = 0) {
  const material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
  });
  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);

  planet.rotation.z = tilt * Math.PI / 180;

  const orbitPath = new THREE.EllipseCurve(
    orbitcenter_x, orbitcenter_y,
    position_a, position_b,
    0, 2 * Math.PI,
    false,
    omega * Math.PI / 180
  );

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2 + inclination * Math.PI / 180;
  scene.add(orbit);
  orbits.push(orbit);

  const initialPoint = orbitPath.getPoint(0);
  planetSystem.position.set(initialPoint.x, initialPoint.y, initialPoint.y);
  planetSystem.rotation.x = inclination * Math.PI / 180;

  scene.add(planetSystem);

  let orbitAngle = 0;
  return { name, planet, planetSystem, orbitPath, orbitcenter_x, orbitcenter_y, orbitAngle, orbitSpeed: 0.001, inclination };
}

// ****** PLANET CREATIONS ******
const trappist1b = createPlanet('TRAPPIST-1b', 6.7, 30, 30, 0.18, 0, 0, trappist1bTexture, 0, 0);
const trappist1c = createPlanet('TRAPPIST-1c', 6.566, 45, 45, 0.27, 0, 0, trappist1cTexture, 0.03, 0);
const trappist1d = createPlanet('TRAPPIST-1d', 4.69, 60, 60, 0.48, 0, 0, trappist1dTexture, 0.14, 0);
const trappist1e = createPlanet('TRAPPIST-1e', 5.427, 75, 75, 0.375, 0, 0, trappist1eTexture, 0.22, 0);
const trappist1f = createPlanet('TRAPPIST-1f', 6.23, 100, 100, 1, 0, 0, trappist1fTexture, 0.05, 0);
const trappist1g = createPlanet('TRAPPIST-1g', 6.77, 120, 120, 0.36, 0, 0, trappist1gTexture, 0.07, 0);
const trappist1h = createPlanet('TRAPPIST-1h', 4.62, 165, 165, 0.825, 0, 0, trappist1hTexture, 0.16, 0);

// ****** PLANETS DATA ******
const planetData = {
  'TRAPPIST-1b': {
    text: 'TRAPPIST-1b là hành tinh gần nhất với ngôi sao TRAPPIST-1, cách khoảng 0.011 AU, với bán kính khoảng 1.12 lần Trái Đất. Một năm trên hành tinh này chỉ kéo dài 1.51 ngày Trái Đất. Nó có thể là một hành tinh đá với bề mặt nóng do gần ngôi sao mẹ. Hành tinh này nằm trong vùng có khả năng sinh sống nhưng có thể quá nóng để có nước lỏng.'
  },
  'TRAPPIST-1c': {
    text: 'TRAPPIST-1c cách ngôi sao mẹ khoảng 0.016 AU, với bán kính khoảng 1.10 lần Trái Đất. Chu kỳ quỹ đạo của nó là 2.42 ngày Trái Đất. Hành tinh này có thể có bầu khí quyển dày và bề mặt đá, nhưng nhiệt độ cao khiến nước lỏng khó tồn tại. Nó là một trong những hành tinh có tiềm năng nghiên cứu khí quyển.'
  },
  'TRAPPIST-1d': {
    text: 'TRAPPIST-1d có bán kính khoảng 0.78 lần Trái Đất và cách ngôi sao 0.022 AU, với chu kỳ quỹ đạo 4.05 ngày Trái Đất. Hành tinh này nằm ở rìa trong của vùng có thể sinh sống, có khả năng chứa nước lỏng nếu có bầu khí quyển phù hợp. Nó là một trong những mục tiêu chính để nghiên cứu sự sống ngoài Trái Đất.'
  },
  'TRAPPIST-1e': {
    text: 'TRAPPIST-1e có bán kính gần bằng Trái Đất (0.92 lần) và cách ngôi sao 0.029 AU, với chu kỳ quỹ đạo 6.10 ngày Trái Đất. Đây là hành tinh có khả năng cao nhất trong hệ để hỗ trợ sự sống do nằm trong vùng có thể sinh sống. Bề mặt của nó có thể là đá và có khả năng chứa nước lỏng.'
  },
  'TRAPPIST-1f': {
    text: 'TRAPPIST-1f lớn hơn Trái Đất một chút (1.05 lần bán kính), cách ngôi sao 0.038 AU, với chu kỳ quỹ đạo 9.21 ngày Trái Đất. Hành tinh này nằm trong vùng có thể sinh sống, có khả năng là một thế giới băng giá hoặc có nước lỏng nếu có hiệu ứng nhà kính mạnh. Nó là mục tiêu quan trọng để nghiên cứu khí quyển.'
  },
  'TRAPPIST-1g': {
    text: 'TRAPPIST-1g có bán kính khoảng 1.15 lần Trái Đất, cách ngôi sao 0.047 AU, với chu kỳ quỹ đạo 12.35 ngày Trái Đất. Hành tinh này có thể là một thế giới đá với bầu khí quyển dày, nằm ở rìa ngoài vùng có thể sinh sống. Nó có tiềm năng chứa nước dạng lỏng hoặc băng.'
  },
  'TRAPPIST-1h': {
    text: 'TRAPPIST-1h là hành tinh xa nhất, cách ngôi sao 0.062 AU, với bán kính khoảng 0.76 lần Trái Đất và chu kỳ quỹ đạo 18.77 ngày Trái Đất. Hành tinh này có thể là một thế giới băng giá do xa ngôi sao mẹ. Nó ít có khả năng hỗ trợ sự sống nhưng vẫn là mục tiêu nghiên cứu quan trọng.'
  }
};

// ****** RAYCAST TARGETS ******
const raycastTargets = [
  trappist1b.planet, trappist1c.planet, trappist1d.planet, trappist1e.planet,
  trappist1f.planet, trappist1g.planet, trappist1h.planet
];

// ****** SHADOWS ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 100;

trappist1b.planet.castShadow = true;
trappist1b.planet.receiveShadow = true;
trappist1c.planet.castShadow = true;
trappist1c.planet.receiveShadow = true;
trappist1d.planet.castShadow = true;
trappist1d.planet.receiveShadow = true;
trappist1e.planet.castShadow = true;
trappist1e.planet.receiveShadow = true;
trappist1f.planet.castShadow = true;
trappist1f.planet.receiveShadow = true;
trappist1g.planet.castShadow = true;
trappist1g.planet.receiveShadow = true;
trappist1h.planet.castShadow = true;
trappist1h.planet.receiveShadow = true;

trappist1b.orbitSpeed = 0.001;
trappist1c.orbitSpeed = 0.0008;
trappist1d.orbitSpeed = 0.0006;
trappist1e.orbitSpeed = 0.0005;
trappist1f.orbitSpeed = 0.0004;
trappist1g.orbitSpeed = 0.0003;
trappist1h.orbitSpeed = 0.0002;

// ****** MINIMAP & ZOOM CONTROLS ******
function createMinimap() {
  const minimapCamera = new THREE.OrthographicCamera(-100, 100, 50, -50, 1, 1000);
  minimapCamera.position.set(0, 200, 0);
  minimapCamera.lookAt(0, 0, 0);
  minimapCamera.zoom = 1.5;
  minimapCamera.updateProjectionMatrix();

  const minimapRenderer = new THREE.WebGLRenderer({ alpha: true });
  minimapRenderer.setSize(200, 100);
  minimapRenderer.domElement.style.position = 'absolute';
  minimapRenderer.domElement.style.bottom = '10px';
  minimapRenderer.domElement.style.right = '10px';
  minimapRenderer.domElement.style.border = '1px solid white';
  minimapRenderer.domElement.style.borderRadius = '5px';
  minimapRenderer.domElement.style.opacity = '0.7';
  document.body.appendChild(minimapRenderer.domElement);

  const cameraIndicator = new THREE.Mesh(
    new THREE.SphereGeometry(2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  scene.add(cameraIndicator);

  let isMinimapHovered = false;
  let isDraggingMinimap = false;

  minimapRenderer.domElement.addEventListener('mouseenter', () => {
    isMinimapHovered = true;
    minimapRenderer.domElement.style.opacity = '1';
  });

  minimapRenderer.domElement.addEventListener('mouseleave', () => {
    isMinimapHovered = false;
    if (!isDraggingMinimap) {
      minimapRenderer.domElement.style.opacity = '0.7';
    }
  });

  minimapRenderer.domElement.addEventListener('mousedown', (event) => {
    isDraggingMinimap = true;
    navigateFromMinimap(event);
  });

  minimapRenderer.domElement.addEventListener('mousemove', (event) => {
    if (isDraggingMinimap) {
      navigateFromMinimap(event);
    }
  });

  window.addEventListener('mouseup', () => {
    isDraggingMinimap = false;
    if (!isMinimapHovered) {
      minimapRenderer.domElement.style.opacity = '0.7';
    }
  });

  function navigateFromMinimap(event) {
    const rect = minimapRenderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const z = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const targetX = x * 100;
    const targetZ = z * 50;

    const maxDistance = 100;
    const distance = Math.sqrt(targetX * targetX + targetZ * targetZ);

    if (!isMovingTowardsPlanet && !isZoomingOut) {
      if (distance <= maxDistance) {
        camera.position.x = targetX;
        camera.position.z = targetZ;
      } else {
        camera.position.x = (targetX / distance) * maxDistance;
        camera.position.z = (targetZ / distance) * maxDistance;
      }
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      radius = camera.position.length();
      theta = Math.atan2(camera.position.x, camera.position.z);
      phi = Math.acos(camera.position.y / radius);
      controls.update();
    }
  }

  return {
    update: function() {
      cameraIndicator.position.copy(camera.position);
      minimapRenderer.render(scene, minimapCamera);
    }
  };
}

function createZoomControls() {
  const zoomContainer = document.createElement('div');
  zoomContainer.style.position = 'absolute';
  zoomContainer.style.bottom = '120px';
  zoomContainer.style.right = '10px';
  zoomContainer.style.display = 'flex';
  zoomContainer.style.flexDirection = 'column';
  zoomContainer.style.gap = '5px';

  const zoomInButton = document.createElement('button');
  zoomInButton.innerHTML = '+';
  zoomInButton.style.width = '40px';
  zoomInButton.style.height = '40px';
  zoomInButton.style.fontSize = '24px';
  zoomInButton.style.cursor = 'pointer';
  zoomInButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
  zoomInButton.style.color = 'white';
  zoomInButton.style.border = '1px solid white';
  zoomInButton.style.borderRadius = '5px';

  const zoomOutButton = document.createElement('button');
  zoomOutButton.innerHTML = '−';
  zoomOutButton.style.width = '40px';
  zoomOutButton.style.height = '40px';
  zoomOutButton.style.fontSize = '24px';
  zoomOutButton.style.cursor = 'pointer';
  zoomOutButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
  zoomOutButton.style.color = 'white';
  zoomOutButton.style.border = '1px solid white';
  zoomOutButton.style.borderRadius = '5px';

  const resetViewButton = document.createElement('button');
  resetViewButton.innerHTML = '⟳';
  resetViewButton.style.width = '40px';
  resetViewButton.style.height = '40px';
  resetViewButton.style.fontSize = '24px';
  resetViewButton.style.cursor = 'pointer';
  resetViewButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
  resetViewButton.style.color = 'white';
  resetViewButton.style.border = '1px solid white';
  resetViewButton.style.borderRadius = '5px';

  zoomContainer.appendChild(zoomInButton);
  zoomContainer.appendChild(zoomOutButton);
  zoomContainer.appendChild(resetViewButton);
  document.body.appendChild(zoomContainer);

  zoomInButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut && radius > 20) {
      radius *= 0.8;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  });

  zoomOutButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut && radius < 200) {
      radius *= 1.25;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  });

  resetViewButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut) {
      camera.position.set(-50, 30, 5);
      camera.lookAt(0, 0, 0);
      radius = camera.position.length();
      theta = Math.atan2(camera.position.x, camera.position.z);
      phi = Math.acos(camera.position.y / radius);
      controls.update();
    }
  });

  [zoomInButton, zoomOutButton, resetViewButton].forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(255,255,255,0.4)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
  });
}

const minimap = createMinimap();
createZoomControls();

// ****** ANIMATION LOOP ******
const planets = [trappist1b, trappist1c, trappist1d, trappist1e, trappist1f, trappist1g, trappist1h];
orbits.forEach((orbit, index) => {
  if (index < 7) {
    orbit.userData = { planetName: planets[index].name };
  }
});

const rotationSpeeds = {
  'TRAPPIST-1b': 0.033,
  'TRAPPIST-1c': 0.021,
  'TRAPPIST-1d': 0.012,
  'TRAPPIST-1e': 0.0082,
  'TRAPPIST-1f': 0.0054,
  'TRAPPIST-1g': 0.0040,
  'TRAPPIST-1h': 0.0027
};

function animate() {
  sunMaterial.uniforms.time.value += 0.015;
  coronaMaterial.uniforms.time.value += 0.015;
  sun.rotateY(0.004 * settings.acceleration);

  planets.forEach(planet => {
    planet.orbitAngle += planet.orbitSpeed * settings.accelerationOrbit;
    const t = (planet.orbitAngle % (2 * Math.PI)) / (2 * Math.PI);
    const point = planet.orbitPath.getPoint(t);
    planet.planetSystem.position.set(point.x, 0, point.y);
    const inclinationRad = (planet.inclination || 0) * Math.PI / 180;
    const y = planet.planetSystem.position.y * Math.cos(inclinationRad) - planet.planetSystem.position.z * Math.sin(inclinationRad);
    const z = planet.planetSystem.position.y * Math.sin(inclinationRad) + planet.planetSystem.position.z * Math.cos(inclinationRad);
    planet.planetSystem.position.y = y;
    planet.planetSystem.position.z = z;
    //planet.planet.rotateY(0.005 * settings.acceleration);
    if (planet.name in rotationSpeeds) {
      planet.planet.rotateY(rotationSpeeds[planet.name] * settings.acceleration);
    } else {
      planet.planet.rotateY(0.005 * settings.acceleration);
    }
  });

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(raycastTargets);
  outlinePass.selectedObjects = intersects.length > 0 ? [intersects[0].object] : [];

  if (isMovingTowardsPlanet) {
    camera.position.lerp(targetCameraPosition, 0.03);
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);
    }
  } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.05);
    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
    }
  }

  minimap.update();
  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}

animate();

// ****** EVENT LISTENERS ******
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const rotateSpeed = 0.05;
let radius = camera.position.length();
let theta = Math.atan2(camera.position.x, camera.position.z);
let phi = Math.acos(camera.position.y / radius);

window.addEventListener('keydown', (event) => {
  if (!isMovingTowardsPlanet && !isZoomingOut) {
    switch (event.key.toLowerCase()) {
      case 'w':
        phi = Math.max(0.1, phi - rotateSpeed);
        break;
      case 's':
        phi = Math.min(Math.PI - 0.1, phi + rotateSpeed);
        break;
      case 'a':
        theta += rotateSpeed;
        break;
      case 'd':
        theta -= rotateSpeed;
        break;
      case 'pageup':
        if (radius > 20) {
          radius *= 0.9;
          camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
          camera.position.y = radius * Math.cos(phi);
          camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
          camera.lookAt(0, 0, 0);
          controls.update();
        }
        break;
      case 'pagedown':
        if (radius < 200) {
          radius *= 1.1;
          camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
          camera.position.y = radius * Math.cos(phi);
          camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
          camera.lookAt(0, 0, 0);
          controls.update();
        }
        break;
    }
  }
});

window.addEventListener('wheel', (event) => {
  if (!isMovingTowardsPlanet && !isZoomingOut) {
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    if ((zoomFactor < 1 && radius > 20) || (zoomFactor > 1 && radius < 200)) {
      radius *= zoomFactor;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  }
});