import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// 1 tới 4 là hình background
import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import kepler90bTexture from '/images/90b.png';
import kepler90cTexture from '/images/90c.png';
import kepler90iTexture from '/images/90i.png';
import kepler90dTexture from '/images/90d.png';
import kepler90eTexture from '/images/90e.png';
import kepler90fTexture from '/images/90f.png';
import kepler90gTexture from '/images/90g.png';
import kepler90hTexture from '/images/90h.png';

// ****** SETUP ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(-175, 115, 5);

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

// ****** POSTPROCESSING setup ******
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
var lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);

// ****** Star background ******
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

// ****** SELECT PLANET ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

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
  if (clickedObject.material === kepler90b.planet.material) {
    offset = 15;
    return kepler90b;
  } else if (clickedObject.material === kepler90c.planet.material) {
    offset = 10;
    return kepler90c;
  } else if (clickedObject.material === kepler90i.planet.material) {
    offset = 15;
    return kepler90i;
  } else if (clickedObject.material === kepler90d.planet.material) {
    offset = 30;
    return kepler90d;
  } else if (clickedObject.material === kepler90e.planet.material) {
    offset = 30;
    return kepler90e;
  } else if (clickedObject.material === kepler90f.planet.material) {
    offset = 30;
    return kepler90f;
  } else if (clickedObject.material === kepler90g.planet.material) {
    offset = 45;
    return kepler90g;
  } else if (clickedObject.material === kepler90h.planet.material) {
    offset = 55;
    return kepler90h;
  }
  return null;
}

// ****** SHOW PLANET INFO ******
function showPlanetInfo(planet) {
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');
  name.innerText = planet;
  details.innerText = planetData[planet].text;
  info.style.display = 'block';
}

let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);

function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}

function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
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
const sunSize = 836 / 40;
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
const kepler90b = new createPlanet('Kepler-90b', 4.25, 33, 32.96, 1.65, 0, 0, kepler90bTexture); // số 0 đầu là x của tọa độ tâm, số 0 2 là y tọa độ tâm, số 0 3 là độ nghiêng trục
const kepler90c = new createPlanet('Kepler-90c', 3.75, 40.2, 40.15, 2.01, 0, 0, kepler90cTexture, 0.01, 0);
const kepler90i = new createPlanet('Kepler-90i', 4.25, 48, 47.94, 2.4, 0, 0, kepler90iTexture, 0.02, 0);
const kepler90d = new createPlanet('Kepler-90d', 9.1, 122, 121.85, 6.1, 0, 0, kepler90dTexture, 0.03, 0);
const kepler90e = new createPlanet('Kepler-90e', 8.5, 150, 149.81, 7.5, 0, 0, kepler90eTexture, 0.01, 0);
const kepler90f = new createPlanet('Kepler-90f', 9.1, 180, 179.77, 9.0, 0, 0, kepler90fTexture, 0.02, 0);
const kepler90g = new createPlanet('Kepler-90g', 12.5, 230, 229.71, 11.5, 0, 0, kepler90gTexture, 0.03, 0);
const kepler90h = new createPlanet('Kepler-90h', 16, 310, 309.61, 15.5, 0, 0, kepler90hTexture, 0, 0);

// ****** PLANETS DATA ******
const planetData = {
  'Kepler-90b': {
    text: 'Kepler-90b là hành tinh gần ngôi sao Kepler-90 nhất, với bán kính khoảng 1,31 lần Trái Đất. Nó có quỹ đạo rất ngắn, chỉ 7 ngày, cách ngôi sao khoảng 10 triệu km. Hành tinh này là một hành tinh đá nóng bỏng, không có mùa do trục nghiêng gần bằng 0. Nhiệt độ bề mặt cực cao khiến nó không thể có sự sống.'
  },
  'Kepler-90c': {
    text: 'Kepler-90c có bán kính 1,18 lần Trái Đất và quay quanh ngôi sao trong 8,7 ngày, cách khoảng 15 triệu km. Là một hành tinh đá, nó chịu nhiệt độ khắc nghiệt từ ngôi sao mẹ. Không có khí quyển đáng kể, và trục nghiêng bằng 0, dẫn đến môi trường không phù hợp cho sự sống.'
  },
  'Kepler-90i': {
    text: 'Kepler-90i, với bán kính 1,32 lần Trái Đất, quay quanh ngôi sao trong 14,4 ngày, cách khoảng 20 triệu km. Hành tinh này được phát hiện nhờ trí tuệ nhân tạo phân tích dữ liệu Kepler. Là một hành tinh đá, nó quá nóng để hỗ trợ sự sống, với bề mặt khô cằn và không có mùa.'
  },
  'Kepler-90d': {
    text: 'Kepler-90d là hành tinh lớn hơn, với bán kính 2,88 lần Trái Đất, quay quanh ngôi sao trong 59,7 ngày, cách khoảng 30 triệu km. Có thể là một hành tinh khí hoặc siêu Trái Đất, nó có môi trường khắc nghiệt với nhiệt độ cao và không có mùa do trục nghiêng bằng 0.'
  },
  'Kepler-90e': {
    text: 'Kepler-90e có bán kính 2,67 lần Trái Đất, với chu kỳ quỹ đạo 91,9 ngày, cách ngôi sao khoảng 40 triệu km. Là một hành tinh có khả năng là siêu Trái Đất hoặc hành tinh khí nhỏ, nó không nằm trong vùng ở được do nhiệt độ cao và thiếu khí quyển phù hợp.'
  },
  'Kepler-90f': {
    text: 'Kepler-90f, với bán kính 2,30 lần Trái Đất, có chu kỳ quỹ đạo 124,9 ngày, cách ngôi sao khoảng 50 triệu km. Hành tinh này có thể là một siêu Trái Đất, nhưng nhiệt độ bề mặt cao khiến nó không phù hợp cho sự sống. Trục nghiêng bằng 0, không tạo ra mùa.'
  },
  'Kepler-90g': {
    text: 'Kepler-90g là một hành tinh khí khổng lồ, với bán kính 8,13 lần Trái Đất, quay quanh ngôi sao trong 210,5 ngày, cách khoảng 70 triệu km. Nằm ngoài vùng ở được, nó có cấu trúc giống sao Mộc, với khí quyển dày và không có bề mặt rắn.'
  },
  'Kepler-90h': {
    text: 'Kepler-90h là hành tinh lớn nhất trong hệ, với bán kính 7,80 lần Trái Đất, chu kỳ quỹ đạo 331,6 ngày, cách ngôi sao khoảng 100 triệu km. Là một hành tinh khí khổng lồ, nó có khí quyển dày và không có mùa do trục nghiêng bằng 0. Không phù hợp cho sự sống.'
  }
};

// ****** RAYCAST TARGETS ******
const raycastTargets = [
  kepler90b.planet, kepler90c.planet, kepler90i.planet, kepler90d.planet,
  kepler90e.planet, kepler90f.planet, kepler90g.planet, kepler90h.planet
];

// ****** SHADOWS ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 100;

kepler90b.planet.castShadow = true;
kepler90b.planet.receiveShadow = true;
kepler90c.planet.castShadow = true;
kepler90c.planet.receiveShadow = true;
kepler90i.planet.castShadow = true;
kepler90i.planet.receiveShadow = true;
kepler90d.planet.castShadow = true;
kepler90d.planet.receiveShadow = true;
kepler90e.planet.castShadow = true;
kepler90e.planet.receiveShadow = true;
kepler90f.planet.castShadow = true;
kepler90f.planet.receiveShadow = true;
kepler90g.planet.castShadow = true;
kepler90g.planet.receiveShadow = true;
kepler90h.planet.castShadow = true;
kepler90h.planet.receiveShadow = true;

// ****** ORBIT SPEEDS ******
kepler90b.orbitSpeed = 0.0099;
kepler90c.orbitSpeed = 0.0075;
kepler90i.orbitSpeed = 0.0051;
kepler90d.orbitSpeed = 0.0011;
kepler90e.orbitSpeed = 0.00074;
kepler90f.orbitSpeed = 0.00045;
kepler90g.orbitSpeed = 0.00033;
kepler90h.orbitSpeed = 0.0002;

// ****** MINIMAP & ZOOM CONTROLS ******
function createMinimap() {
  const minimapCamera = new THREE.OrthographicCamera(-400, 400, 200, -200, 1, 2000);
  minimapCamera.position.set(0, 800, 0);
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
    new THREE.SphereGeometry(5, 8, 8),
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

    const targetX = x * 400;
    const targetZ = z * 200;

    if (!isMovingTowardsPlanet && !isZoomingOut) {
      const maxDistance = 350;
      const distance = Math.sqrt(targetX * targetX + targetZ * targetZ);

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
    update: function () {
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
    if (!isMovingTowardsPlanet && !isZoomingOut && radius > 100) {
      radius *= 0.8;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  });

  zoomOutButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut && radius < 500) {
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
      camera.position.set(-175, 115, 5);
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

// ****** ORBIT LABELS ******
orbits.forEach((orbit, index) => {
  if (index < 8) {
    const planets = [kepler90b, kepler90c, kepler90i, kepler90d, kepler90e, kepler90f, kepler90g, kepler90h];
    orbit.userData = { planetName: planets[index].name };
  }
});

const rotationSpeeds = {
  'Kepler-90b': 0.022,
  'Kepler-90c': 0.016,
  'Kepler-90i': 0.011,
  'Kepler-90d': 0.0024,
  'Kepler-90e': 0.0016,
  'Kepler-90f': 0.0117,
  'Kepler-90g': 0.0117,
  'Kepler-90h': 0.0117
};

// ****** ANIMATION ******
function animate() {
  sunMaterial.uniforms.time.value += 0.015;
  coronaMaterial.uniforms.time.value += 0.015;
  sun.rotateY(0.004 * settings.acceleration);

  const planets = [kepler90b, kepler90c, kepler90i, kepler90d, kepler90e, kepler90f, kepler90g, kepler90h];
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
    if (planet.name in rotationSpeeds) {
        planet.planet.rotateY(rotationSpeeds[planet.name] * settings.acceleration);
    } else {
    planet.planet.rotateY(0.005 * settings.acceleration);
    }
  });

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);
  outlinePass.selectedObjects = [];
  if (intersects.length > 0) {
    outlinePass.selectedObjects = [intersects[0].object];
  }

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

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function () {
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
        if (radius > 100) {
          radius *= 0.9;
          camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
          camera.position.y = radius * Math.cos(phi);
          camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
          camera.lookAt(0, 0, 0);
          controls.update();
        }
        break;
      case 'pagedown':
        if (radius < 500) {
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
    if ((zoomFactor < 1 && radius > 100) || (zoomFactor > 1 && radius < 500)) {
      radius *= zoomFactor;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  }
});