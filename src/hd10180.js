import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Background textures
import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import hd10180cTexture from '/images/hd10180C.png';
import hd10180dTexture from '/images/hd10180D.png';
import hd10180eTexture from '/images/hd10180E.png';
import hd10180fTexture from '/images/hd10180F.png';
import hd10180gTexture from '/images/hd10180G.png';
import hd10180hTexture from '/images/hd10180H.png';

// Scene setup
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
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

// Post-processing setup
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Outline pass
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 1.5;
outlinePass.edgeGlow = 0.5;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// Bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 3.1;
bloomPass.strength = 1.0;
bloomPass.radius = 0.0;
composer.addPass(bloomPass);

// Ambient light
console.log("Add the ambient light");
const lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);

// Star background
scene.background = cubeTextureLoader.load([
  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// GUI setup
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container') || document.body;
customContainer.appendChild(gui.domElement);

// Settings for interactive controls
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

// Mouse interaction
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
  if (clickedObject.material === hd10180c.planet.material) {
    offset = 30;
    return hd10180c;
  } else if (clickedObject.material === hd10180d.planet.material) {
    offset = 45;
    return hd10180d;
  } else if (clickedObject.material === hd10180e.planet.material) {
    offset = 35;
    return hd10180e;
  } else if (clickedObject.material === hd10180f.planet.material) {
    offset = 30;
    return hd10180f;
  } else if (clickedObject.material === hd10180g.planet.material) {
    offset = 45;
    return hd10180g;
  } else if (clickedObject.material === hd10180h.planet.material) {
    offset = 100;
    return hd10180h;
  }
  return null;
}

function showPlanetInfo(planet) {
  const info = document.getElementById('planetInfo');
  const name = document.getElementById('planetName');
  const details = document.getElementById('planetDetails');
  name.innerText = planet;
  details.innerText = planetData[planet].text;
  info.style.display = 'block';
}

let isZoomingOut = false;
const zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);

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

// Sun shader
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
const sunSize = 766 / 40;
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

// Planet creation function
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

// Planet data (in Vietnamese, based on limited available data for HD 10180 system)
const planetData = {
  'HD 10180 c': {
    text: 'HD 10180 c là hành tinh gần nhất với ngôi sao HD 10180, với bán kính ước tính tương đương Sao Mộc. Nó cách ngôi sao khoảng 0,064 AU và có chu kỳ quỹ đạo khoảng 5,76 ngày. Hành tinh này là một hành tinh khí khổng lồ, có thể có nhiệt độ rất cao do gần ngôi sao. Đây là một trong những hành tinh đầu tiên được phát hiện trong hệ HD 10180!'
  },
  'HD 10180 d': {
    text: 'HD 10180 d là hành tinh thứ hai, cách ngôi sao khoảng 0,13 AU với chu kỳ quỹ đạo khoảng 16,36 ngày. Nó có kích thước nhỏ hơn một chút so với HD 10180 c, có thể là một hành tinh khí hoặc siêu Trái Đất. Bầu khí quyển của nó có thể chứa các hợp chất nặng do nhiệt độ cao. Hành tinh này nằm trong vùng nóng của hệ!'
  },
  'HD 10180 e': {
    text: 'HD 10180 e cách ngôi sao khoảng 0,27 AU và có chu kỳ quỹ đạo khoảng 49,75 ngày. Đây là một hành tinh có kích thước tương tự Sao Hải Vương, có thể là một hành tinh khí nhỏ. Vị trí của nó khiến nó có khí hậu khắc nghiệt nhưng không quá nóng như các hành tinh gần hơn. Nó là một phần quan trọng của hệ HD 10180!'
  },
  'HD 10180 f': {
    text: 'HD 10180 f có quỹ đạo cách ngôi sao khoảng 0,49 AU với chu kỳ quỹ đạo khoảng 122 ngày. Nó có kích thước tương tự Sao Hải Vương, có thể là một hành tinh khí hoặc băng giá. Hành tinh này nằm trong vùng có thể hỗ trợ các đặc điểm khí quyển phức tạp. Nó là một hành tinh thú vị trong hệ HD 10180!'
  },
  'HD 10180 g': {
    text: 'HD 10180 g là một trong những hành tinh xa hơn, cách ngôi sao khoảng 1,42 AU với chu kỳ quỹ đạo khoảng 602 ngày. Nó có kích thước lớn, có thể là một hành tinh khí khổng lồ giống Sao Mộc. Đây là hành tinh có quỹ đạo tương tự Trái Đất trong hệ Mặt Trời, nhưng lớn hơn nhiều. Nó có thể có bầu khí quyển dày đặc!'
  },
  'HD 10180 h': {
    text: 'HD 10180 h là hành tinh xa nhất được xác nhận, cách ngôi sao khoảng 3,4 AU với chu kỳ quỹ đạo khoảng 2200 ngày. Nó là một hành tinh khí khổng lồ, có thể lạnh giá do khoảng cách xa. Hành tinh này có kích thước lớn và có thể có các đặc điểm giống Sao Thổ. Đây là hành tinh lớn nhất trong hệ HD 10180!'
  }
};

// Planet creations (approximated sizes and orbits based on HD 10180 data)
const hd10180c = createPlanet('HD 10180 c', 6.9, 38.4, 38.25, 3.07, 0, 0, hd10180cTexture, 0, 0);
const hd10180d = createPlanet('HD 10180 d', 15, 78.0, 77.24, 10.92, 0, 0, hd10180dTexture, 2.2, 0);
const hd10180e = createPlanet('HD 10180 e', 10.0, 162.0, 161.7, 9.72, 0, 0, hd10180eTexture, 1.4, 0);
const hd10180f = createPlanet('HD 10180 f', 9.0, 194.0, 192.9, 19.4, 0, 0, hd10180fTexture, 2.9, 0);
const hd10180g = createPlanet('HD 10180 g', 15, 252.0, 250.1, 30.24, 0, 0, hd10180gTexture, 5.1, 0);
const hd10180h = createPlanet('HD 10180 h', 34, 440.0, 434.4, 70.4, 0, 0, hd10180hTexture, 5.9, 0);

// Assign orbit speeds (scaled inversely to orbital period)
hd10180c.orbitSpeed = 0.0123;
hd10180d.orbitSpeed = 0.0043;
hd10180e.orbitSpeed = 0.0014;
hd10180f.orbitSpeed = 0.00058;
hd10180g.orbitSpeed = 0.00012;
hd10180h.orbitSpeed = 0.000032;

// Raycast targets
const raycastTargets = [
  hd10180c.planet,
  hd10180d.planet,
  hd10180e.planet,
  hd10180f.planet,
  hd10180g.planet,
  hd10180h.planet
];

// Shadows
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 100;

hd10180c.planet.castShadow = true;
hd10180c.planet.receiveShadow = true;
hd10180d.planet.castShadow = true;
hd10180d.planet.receiveShadow = true;
hd10180e.planet.castShadow = true;
hd10180e.planet.receiveShadow = true;
hd10180f.planet.castShadow = true;
hd10180f.planet.receiveShadow = true;
hd10180g.planet.castShadow = true;
hd10180g.planet.receiveShadow = true;
hd10180h.planet.castShadow = true;
hd10180h.planet.receiveShadow = true;

// Minimap
function createMinimap() {
  const minimapCamera = new THREE.OrthographicCamera(-400, 400, 200, -200, 1, 2000);
  minimapCamera.position.set(0, 800, 0);
  minimapCamera.lookAt(0, 0, 0);
  minimapCamera.zoom = 0.2;
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
      const maxDistance = 2000;
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
    update: function() {
      cameraIndicator.position.copy(camera.position);
      minimapRenderer.render(scene, minimapCamera);
    }
  };
}

// Zoom controls
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
    if (!isMovingTowardsPlanet && !isZoomingOut && radius < 5000) {
      radius *= 1.25;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0

);
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

// Initialize minimap and zoom controls
const minimap = createMinimap();
createZoomControls();

// Assign userData to orbits
const planets = [hd10180c, hd10180d, hd10180e, hd10180f, hd10180g, hd10180h];
orbits.forEach((orbit, index) => {
  if (index < 6) {
    orbit.userData = { planetName: planets[index].name };
  }
});

const rotationSpeeds = {
  'HD 10180 c': 0.0087,
  'HD 10180 d': 0.0031,
  'HD 10180 e': 0.0010,
  'HD 10180 f': 0.0004,
  'HD 10180 g': 0.0117,
  'HD 10180 h': 0.0117
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
    if (planet.name in rotationSpeeds) {
      planet.planet.rotateY(rotationSpeeds[planet.name] * settings.acceleration);
    } else {
      planet.planet.rotateY(0.005 * settings.acceleration); 
    }
  });

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(raycastTargets);
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
        if (radius < 5000) {
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
    if ((zoomFactor < 1 && radius > 100) || (zoomFactor > 1 && radius < 5000)) {
      radius *= zoomFactor;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  }
});