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
import mercuryTexture from '/images/mercurymap.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';

// ****** SETUP ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
// 0.1 là near clipping plane
// 1000 là far clipping plane
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 3000);
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//adds the Three.js renderer's canvas element to the HTML document
// <canvas> element accessible via renderer.domElement
// document.body refers to the <body> element of the HTML document.
document.body.appendChild(renderer.domElement);

// sets the tone mapping algorithm used by the renderer to handle high dynamic range (HDR) lighting and color values, improving the visual quality of the scene
// Tone mapping is a technique to map HDR colors (which can have very high or low intensity) to the limited range of a standard display (e.g., 0 to 1 for RGB).
// THREE.ACESFilmicToneMapping is a specific tone mapping algorithm inspired by the ACES (Academy Color Encoding System) used in film production. 
// It produces a cinematic look by preserving details in bright and dark areas, avoiding harsh clipping of highlights, and providing natural color transitions.
// enhances the realism of the sun's glow, planet lighting, and post-processing effects like the bloom pass, making bright areas (e.g., the sun's corona) look vibrant yet natural.
renderer.toneMapping = THREE.ACESFilmicToneMapping;

//sets the exposure level for the tone mapping, controlling the overall brightness of the rendered scene.
// The toneMappingExposure property adjusts how bright or dark the scene appears after tone mapping. 
// A value of 1.0 is the default, meaning no additional brightening or darkening is applied
// Higher values (e.g., 2.0) make the scene brighter, emphasizing highlights.
// Lower values (e.g., 0.5) make it darker, reducing the intensity of bright areas.
renderer.toneMappingExposure = 1.0;

console.log("Create an orbit control");
// OrbitControls, a Three.js utility that allows users to interactively rotate, zoom, and pan the camera using mouse or touch input
const controls = new OrbitControls(camera, renderer.domElement);
// Enables inertia or "damping" for camera movements, making them smoother and more natural.
controls.enableDamping = true;
// Sets the strength of the damping effect, controlling how quickly the camera's motion slows down after user input stops.
controls.dampingFactor = 0.75;
// Disables screen-space panning, ensuring panning moves the camera in a way that maintains the orbit target.
controls.screenSpacePanning = false;

console.log("Set up texture loader");
// Creates a loader for cube textures, which are used to apply a 360-degree background (e.g., a skybox or environment map) to the scene.
const cubeTextureLoader = new THREE.CubeTextureLoader();
// Creates a loader for 2D textures, used to apply images to the surfaces of objects (e.g., planets, rings, or moons).
const loadTexture = new THREE.TextureLoader();
// Initializes an empty array to store the visual representations of planetary orbits.
const orbits = [];

// ****** POSTPROCESSING setup ******
// Initializes an EffectComposer for post-processing effects, allowing you to apply visual enhancements to the rendered scene.
// THREE.EffectComposer is a tool for chaining post-processing effects, such as bloom, outlines, or color corrections, after the scene is rendered.
const composer = new EffectComposer(renderer);
// Adds a RenderPass to the composer, which renders the scene and camera to a buffer as the first step in the post-processing pipeline.
composer.addPass(new RenderPass(scene, camera));

// ****** OUTLINE PASS ******
// Initializes an OutlinePass object to create outlines around objects in the scene.
// THREE.OutlinePass is a post-processing pass that renders a glowing outline around specified objects by detecting edges.
// OutlinePass works by rendering a depth and normal map of the scene, detecting edges of selected objects, and drawing outlines around them.
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// Sets the intensity or thickness of the outline effect.
outlinePass.edgeStrength = 1.5;
// edgeGlow determines how much the outline “glows” or blurs outward, creating a soft, radiant effect. 
// A value of 0 produces a sharp, hard edge, while higher values (e.g., 1 or more) add a glowing, diffused look.
outlinePass.edgeGlow = 0.5;
// Sets the color of the outline for edges that are visible (not occluded by other objects).
// visibleEdgeColor is a THREE.Color object that defines the color of the outline for parts of the object that are directly visible to the camera.
// this makes the outline of a hovered or selected planet (e.g., Mars) white, providing high contrast against the planet’s texture and the dark space background, ensuring clear visibility.
outlinePass.visibleEdgeColor.set(0xffffff);
// Sets the color of the outline for edges that are hidden (occluded by other objects).
// 0x190a05 is a dark brownish color (rgb(25, 10, 5)), which is subtle and less prominent than the visible edge color.
// This allows the outline to still be visible for occluded parts but with reduced intensity, avoiding visual clutter.
outlinePass.hiddenEdgeColor.set(0x190a05);
// Adds the OutlinePass to the EffectComposer pipeline, enabling the outline effect in the rendering process.
composer.addPass(outlinePass);

// ****** BLOOM PASS ******
// configure an UnrealBloomPass, a post-processing effect that adds a glowing or blooming effect to bright areas of the scene
// enhancing the visual appeal of objects like the sun, corona, or bright planet surfaces.
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
// Sets the brightness threshold for the bloom effect, determining which pixels are considered bright enough to glow.
bloomPass.threshold = 3.1; 
// Sets the intensity of the bloom effect, controlling how strong the glow appears.
bloomPass.strength = 1.0; 
// Sets the spread or blur radius of the bloom effect, controlling how far the glow extends.
bloomPass.radius = 0.0; 
// Adds the UnrealBloomPass to the EffectComposer pipeline, enabling the bloom effect in the rendering process.
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
// Creates an ambient light that illuminates all objects in the scene uniformly, regardless of their position or orientation.
var lightAmbient = new THREE.AmbientLight(0x222222, 6); 
// Adds the ambient light to the scene, making it active.
scene.add(lightAmbient);

// ****** Star background ******
// Sets the background of the scene to a cube map (skybox) using six texture images, creating a starry space environment.
scene.background = cubeTextureLoader.load([
  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ****** CONTROLS ******
// Initializes a dat.GUI interface for creating an interactive control panel, with automatic placement disabled.
// dat.GUI is a lightweight JavaScript library used to create a user interface for tweaking variables in real-time.
// autoPlace: false option prevents dat.GUI from automatically adding the panel to the DOM (e.g., as a floating window in the top-right corner).
// By disabling auto-placement, you can manually control where the GUI is placed in the HTML document, offering more flexibility for layout integration.
// GUI used to control settings like accelerationOrbit, acceleration, sunIntensity, and showOrbits, allowing users to interactively adjust the solar system’s behavior.
const gui = new dat.GUI({ autoPlace: false });
// Retrieves a specific HTML element (with the ID gui-container) to serve as the container for the dat.GUI panel.
// HTML includes a <div id="gui-container"> where the GUI controls (sliders, checkboxes, etc.) will appear, integrating the interface seamlessly into your webpage design.
const customContainer = document.getElementById('gui-container');
// Adds the dat.GUI panel’s DOM element to the gui-container element, making the GUI visible on the webpage.
// this ensures the GUI appears in the designated gui-container area, allowing users to interact with controls like adjusting the sun’s intensity or toggling orbit visibility.
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS ******
// setting default values in the dat.GUI
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9,
  showOrbits: true
};

// add default values from settings to dat.GUI, alongside with minimum and maximum value
// The empty .onChange(value => {}) callback means no additional logic is triggered, but settings.acceleration is updated and used in the animate function to scale rotation speeds
gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {});
// scale the value of sunIntensity appropriately
gui.add(settings, 'sunIntensity', 1, 10, 0.1).onChange(value => {
  sunMaterial.uniforms.emissiveIntensity.value = value * (5.0/1.9);
  coronaMaterial.uniforms.glowIntensity.value = value * 0.9;
});

// Adds a GUI checkbox to toggle the visibility of planetary orbits, with a callback to update the visibility of orbit lines.
gui.add(settings, 'showOrbits').name('Show Orbits').onChange(value => {
  orbits.forEach(orbit => {
    orbit.visible = value;
  });
});

// mouse movement
// Creates a Raycaster object to perform raycasting, which detects intersections between a ray (from the camera through the mouse position) and 3D objects in the scene.
// THREE.Raycaster is a Three.js utility that casts a virtual "ray" from a starting point (typically the camera) in a specified direction to check for intersections with objects.
// raycaster is configured later in the code (e.g., in the animate function or onDocumentMouseDown) to cast rays based on the mouse position and camera perspective.
// used to Detect which planet is under the mouse cursor for highlighting
// used to Identify which planet is clicked to zoom in and display its information (in
const raycaster = new THREE.Raycaster();
// Creates a Vector2 object to store the normalized mouse coordinates in the range [-1, 1], used for raycasting.
const mouse = new THREE.Vector2();

// Defines a function to handle mouse movement events, updating the mouse vector with normalized coordinates.
function onMouseMove(event) {
    event.preventDefault();
    // event.clientX is the mouse’s horizontal position in pixels relative to the window (e.g., 0 at the left edge, 1920 at the right edge for a 1920px-wide window).
    // event.clientX / window.innerWidth normalizes this to [0, 1] (e.g., 0 at the left, 1 at the right).
    // Multiplying by 2 and subtracting 1 maps it to [-1, 1] (e.g., -1 at the left, +1 at the right).
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// ****** SELECT PLANET ******
// selectedPlanet is a variable that holds a reference to the planet object (e.g., mercury, earth, jupiter) when a user clicks on it.
// It is initialized to null, indicating that no planet is selected when the simulation starts.
// When a planet is clicked, selectedPlanet is updated in the onDocumentMouseDown function by calling identifyPlanet
let selectedPlanet = null;
// Declares a boolean flag to indicate whether the camera is currently moving toward a selected planet.
// isMovingTowardsPlanet is a state variable that tracks whether the camera is in the process of animating (lerping) toward a planet after a click.
// It is initialized to false, meaning the camera is not moving toward a planet when the simulation starts.
// When a planet is clicked in onDocumentMouseDown, isMovingTowardsPlanet is set to true to start the camera movement
let isMovingTowardsPlanet = false;
// Declares a Vector3 object to store the destination position for the camera when moving toward a selected planet.
// targetCameraPosition defines where the camera should end up when zooming in on a planet, ensuring a smooth and visually appropriate view
// (e.g., close to Mercury, farther from Jupiter due to its larger size).
let targetCameraPosition = new THREE.Vector3();
// Declares a variable to store the distance between the camera and the selected planet when zooming in.
// offset is a number that specifies how far the camera should be from the planet’s center when it completes its movement.
// It is not initialized here (its value is undefined initially) but is set in the identifyPlanet function based on the clicked planet
let offset;

// function to defines an event handler for mouse click events
// this function enables users to click on a planet (e.g., Earth, Jupiter) to select it, zoom the camera toward it, and display its information.
function onDocumentMouseDown(event) {
  // Prevents default browser behaviors that might interfere with the click interaction.
  event.preventDefault();
  // Updates the mouse.x and mouse.y coordinate to the normalized device coordinate (NDC) for raycasting.
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Configures the raycaster to cast a ray from the camera through the mouse’s normalized position.
  raycaster.setFromCamera(mouse, camera);
  // Checks for intersections between the ray and a list of target objects, returning any hits.
  // raycastTargets is an array of objects (likely planet meshes and atmospheres, e.g., mercury.planet, earth.Atmosphere) that the raycaster should test for intersections.
  // intersectObjects returns an array of intersection objects, sorted by distance from the camera. Each intersection includes:
  //    The intersected object (e.g., a planet’s mesh).
  //    The point of intersection in 3D space.
  //    The distance from the camera to the intersection.
  // This determines if the user clicked on a planet or its atmosphere (e.g., Venus’ atmosphere), identifying the closest intersected object.
  var intersects = raycaster.intersectObjects(raycastTargets);

  // If a click hit a valid target.
  if (intersects.length > 0) {
    // Retrieves the closest intersected object (the one the user clicked)
    const clickedObject = intersects[0].object;
    // Maps the clicked object to its corresponding planet object using the identifyPlanet function.
    selectedPlanet = identifyPlanet(clickedObject);
    // Ensures a valid planet was identified before proceeding with camera movement and other actions.
    if (selectedPlanet) {
      // Closes any currently displayed planet information without zooming out the camera.
      closeInfoNoZoomOut();
      // Pauses the orbital movement of all planets.
      settings.accelerationOrbit = 0;
      // Creates a Vector3 object to store the selected planet’s position in world coordinates later.
      const planetPosition = new THREE.Vector3();
      // Retrieves the world position of the selected planet’s mesh and stores it in planetPosition.
      selectedPlanet.planet.getWorldPosition(planetPosition);
      // Sets the target point for OrbitControls to the planet’s position, making the camera orbit around the planet.
      controls.target.copy(planetPosition);
      // Orients the camera to face the planet’s position immediately.
      camera.lookAt(planetPosition);
      // Sets targetCameraPosition to a point where the planet (e.g., Venus) is nicely framed, with the camera positioned offset units away
      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      // Activates the camera movement animation toward the planet.
      isMovingTowardsPlanet = true;
    }
  }
}

// define an offset value for each planet and check what planet is it
function identifyPlanet(clickedObject) {
  if (clickedObject.material === mercury.planet.material) {
    offset = 10;
    return mercury;
  } else if (clickedObject.material === venus.Atmosphere.material) {
    offset = 25;
    return venus;
  } else if (clickedObject.material === earth.Atmosphere.material) {
    offset = 25;
    return earth;
  } else if (clickedObject.material === mars.planet.material) {
    offset = 15;
    return mars;
  } else if (clickedObject.material === jupiter.planet.material) {
    offset = 50;
    return jupiter;
  } else if (clickedObject.material === saturn.planet.material) {
    offset = 50;
    return saturn;
  } else if (clickedObject.material === uranus.planet.material) {
    offset = 25;
    return uranus;
  } else if (clickedObject.material === neptune.planet.material) {
    offset = 20;
    return neptune;
  } else if (clickedObject.material === pluto.planet.material) {
    offset = 20;
    return pluto;
  }
  return null;
}

// ****** SHOW PLANET INFO AFTER SELECTION ******
// A function to display information about a specified planet.
function showPlanetInfo(planet) {
  // Retrieves the HTML element that contains the planet information panel.
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');
  // Sets the text content of the planetName element to the planet’s name.
  // This updates the UI to show the selected planet’s name as a heading, e.g., “Jupiter” when Jupiter is clicked.
  name.innerText = planet;
  // Sets the text content of the planetDetails element to a formatted string containing the planet’s properties.
  // details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;
  details.innerText = planetData[planet].text;
  // Makes the planetInfo panel visible in the UI.
  // info is the planetInfo <div> retrieved earlier.
  // style.display = 'block' changes the CSS display property to block, making the element visible.
  // The panel is initially hidden (display: none in the HTML or set by closeInfo), so this line shows it after updating the name and details.
  info.style.display = 'block';
}

// Declares a boolean flag to indicate whether the camera is currently zooming out from a planet to a default view.
let isZoomingOut = false;
// Declares a Vector3 object specifying the camera’s destination position when zooming out to the default view.
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);

// Defines a function to close the planet information panel, resume orbital movement, and zoom the camera out to the default view.
function closeInfo() {
  // Retrieves the HTML element containing the planet information panel.
  var info = document.getElementById('planetInfo');
  // Hides the planet information panel.
  // Setting style.display = 'none' makes the planetInfo <div> invisible, removing it from the UI.
  info.style.display = 'none';
  // Resumes the orbital movement of planets.
  // settings.accelerationOrbit is a GUI-controlled property (defined in settings) that scales the speed of planetary orbits around the sun.
  // It’s set to 0 in onDocumentMouseDown when a planet is clicked to pause orbits
  settings.accelerationOrbit = 1;
  // isZoomingOut is a boolean flag (defined earlier) that indicates whether the camera is animating back to zoomOutTargetPosition ((-175, 115, 5)).
  // Setting it to true triggers the zoom-out in the animate function
  isZoomingOut = true;
  // Resets the OrbitControls target to the sun’s position.
  // controls is the THREE.OrbitControls object managing camera movement.
  // controls.target is a THREE.Vector3 specifying the point the camera orbits around and looks at.
  // set(0, 0, 0) sets the target to the origin, where the sun is located, as planets orbit around (0, 0, 0).
  // Context: This makes the camera rotate around the sun after zooming out, providing a natural view of the solar system.
  controls.target.set(0, 0, 0);
}

// Makes the closeInfo function globally accessible for HTML event handlers.
window.closeInfo = closeInfo;

// Defines a function to close the planet information panel and resume orbital movement without zooming out the camera.
function closeInfoNoZoomOut() {
  // Retrieves the planet information panel element.
  var info = document.getElementById('planetInfo');
  // Hides the planet information panel.
  info.style.display = 'none';
  // // Resumes the orbital movement of planets.
  settings.accelerationOrbit = 1;
}

// ****** SUN ******
// Implements Perlin noise, a type of gradient noise used to generate natural-looking patterns.
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

// Declares a variable to store the shader material for the sun.
// This variable is used to create a material with a procedural, noise-based texture for the sun, enabling dynamic visual effects like a fiery, turbulent surface.
let sunMaterial;

// Defines the radius of the sun’s geometry.
// sunSize is calculated as 697 / 40 ≈ 17.425 units.
// The value 697 likely represents the sun’s real-world radius (approximately 696,340 km) scaled down for the simulation. 
// Dividing by 40 adjusts the size to fit the scene’s scale, where planets like Earth or Jupiter have smaller relative sizes.
// This ensures the sun appears proportionally large compared to planets but manageable within the 3D scene.
const sunSize = 697 / 40;
// Creates a spherical geometry for the sun.
// sunSize (≈17.425): The radius of the sphere.
// 32: The number of width segments (horizontal divisions).
// 32: The number of height segments (vertical divisions).
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 32);

// Creates a custom shader material for the sun, using vertex and fragment shaders with uniforms and Perlin noise.
// THREE.ShaderMaterial allows custom GLSL shaders, giving precise control over rendering.
// The material is configured with:
//    Uniforms: Variables passed from JavaScript to the shaders.
//    Vertex Shader: Processes vertex positions and passes data to the fragment shader.
//    Fragment Shader: Computes the color of each pixel, using noise for a fiery effect.
sunMaterial = new THREE.ShaderMaterial({
  // Defines uniform variables accessible in both shaders
  uniforms: {
    // A float tracking animation time, updated in the animate function.
    // It animates the noise pattern, making the sun’s surface appear dynamic.
    time: { value: 0 },
    // A float controlling the brightness of the sun’s glow, initially set to 5.0. It’s adjusted via the GUI (sunIntensity).
    emissiveIntensity: { value: 5.0 }
  },
  // Defines the vertex shader, which processes the sun’s geometry vertices.
  vertexShader: `
    // Passes the UV coordinates (2D texture coordinates, [0, 1]) to the fragment shader.
    varying vec2 vUv;
    // Passes the vertex’s local position (e.g., (x, y, z) on the sphere) to the fragment shader.
    varying vec3 vPosition;
    void main() {
      // Copies the built-in uv attribute (UV coordinates of the sphere) to vUv for fragment shader use.
      vUv = uv;
      // Copies the vertex’s local position to vPosition for noise calculations.
      vPosition = position;
      // Transforms the vertex position from local to clip space, determining where it appears on the screen.
      // Local space (also called object space or model space) is the coordinate system relative to the object itself, where a 3D model’s vertices are defined before any transformations (e.g., translation, rotation, scaling) are applied.
      // Clip space is the coordinate system after applying all transformations (model, view, and projection) to a vertex, where the vertex’s position is ready for clipping and projection onto the 2D screen.
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Defines the fragment shader, which computes the color of each pixel on the sun’s surface, using Perlin noise for a fiery effect.
  fragmentShader: `
    // Animation time, used to shift the noise pattern.
    uniform float time;
    // Brightness multiplier, controlled via GUI.
    uniform float emissiveIntensity;
    // Vertex position from the vertex shader, used for noise input.
    varying vec2 vUv;
    varying vec3 vPosition;
    // Includes the Perlin noise function (previously analyzed), which generates a smooth noise value.
    ${noiseGLSL}
    void main() {
      // Calls the noise function with a 3D input: vPosition (vertex position on the sphere) offset by time.
      // The time offset animates the noise, making the sun’s surface appear to flicker or roil.
      // noiseValue is in [-1, 1] (due to noise’s scaling by 42.0 in noiseGLSL).
      float noiseValue = noise(vPosition + time);

      // Interpolates between two colors based on noiseValue.
      vec3 color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.4, 0.1), noiseValue);
      // Normalizes noiseValue from [-1, 1] to [0, 1] using (noiseValue * 0.5 + 0.5).
      // Multiplies by emissiveIntensity and 2.0 to amplify brightness, simulating the sun’s glow.
      float intensity = (noiseValue * 0.5 + 0.5) * emissiveIntensity * 2.0;

      // Sets the final pixel color by multiplying color by intensity.
      // The alpha channel is 1.0 (fully opaque).
      // This produces a bright, fiery effect with varying orange-red hues.
      gl_FragColor = vec4(color * intensity, 1.0);
    }
  `
});

// Creates a mesh combining the sun’s geometry and material.
// THREE.Mesh combines a geometry (sunGeom) and a material (sunMaterial) to form a renderable 3D object.
// sunGeom defines the sphere’s shape (radius ~17.425, 32x32 segments).
// sunMaterial defines the appearance (noise-based fiery texture).
// The sun mesh is positioned at the scene’s origin (0, 0, 0) by default, as no position is set.
const sun = new THREE.Mesh(sunGeom, sunMaterial);
// Adds the sun mesh to the Three.js scene.
scene.add(sun);

// Defines the creation and setup of the corona (the glowing outer atmosphere of the sun).
// Defines the radius of the corona’s geometry, making it slightly larger than the sun.
const coronaSize = sunSize * 1.075; 
// Creates a spherical geometry for the corona.
// This geometry forms the corona’s 3D model, positioned at the scene’s origin (0, 0, 0) (same as the sun), creating a layered effect.
const coronaGeom = new THREE.SphereGeometry(coronaSize, 32, 32);
// Creates a custom shader material for the corona, using vertex and fragment shaders to produce a glowing rim effect.
const coronaMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // A float for potential animation (e.g., animating noise or glow over time), updated in animate
    time: { value: 0 },
    // A float controlling the brightness of the corona’s glow, initially set to 1.7. It’s adjusted via the GUI (sunIntensity)
    glowIntensity: { value: 1.7 } 
  },
  // Processes the corona’s geometry vertices, passing normal and position data to the fragment shader.
  vertexShader: `
    // Passes the normalized vertex normal (direction perpendicular to the surface) to the fragment shader.
    varying vec3 vNormal;
    // Passes the vertex’s local position (e.g., (x, y, z) on the corona’s sphere) to the fragment shader.
    varying vec3 vPosition;
    void main() {
      // Normalizes the built-in normal attribute (vertex normal in local space) to ensure unit length, used for rim lighting calculations.
      vNormal = normalize(normal);
      // Copies the vertex’s local position (position attribute, radius ~18.732) for use in the fragment shader.
      vPosition = position;
      // Transforms the vertex from local space to clip space
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Computes the color and transparency of each pixel on the corona, creating a glowing rim effect
  fragmentShader: `
    // Animation time
    uniform float time;
    // Brightness multiplier (1.7 default, scaled by GUI).
    uniform float glowIntensity;
    // Normalized vertex normal from the vertex shader.
    varying vec3 vNormal;
    // Vertex position in local space.
    varying vec3 vPosition;
    void main() {
      // Computes the view direction from the vertex to the camera.
      vec3 viewDir = normalize(vPosition - cameraPosition);
      // Computes a rim lighting factor using the dot product of vNormal and viewDir.
      // dot(vNormal, viewDir) is the cosine of the angle between the normal and view direction, ranging from -1 (facing away) to 1 (facing toward).
      // abs(dot) makes it [0, 1], and 1.0 - abs(dot) inverts it, so rim is 1.0 at the edges (where normal is perpendicular to view) and 0.0 at the center (facing the camera).
      // This creates a glow strongest at the corona’s edges.
      float rim = 1.0 - abs(dot(vNormal, viewDir));
      // Calculates the glow intensity.
      // pow(rim, 1.5) raises rim to the 1.5th power, softening the rim effect (lower exponent = broader glow; commented pow(rim, 5.0) would be sharper).
      // Multiplies by glowIntensity (e.g., 1.7) to scale brightness.
      // Adds 0.3 * glowIntensity as a base glow, ensuring the corona is faintly visible even away from the edges.
      float glow = pow(rim, 1.5) * glowIntensity + 0.3 * glowIntensity;
      // Defines a warm, yellowish-orange color, resembling the corona’s natural hue.
      vec3 color = vec3(1.0, 0.7, 0.3);
      // Sets the final pixel color and alpha.
      // color * glow: Scales the color by the glow intensity, making edges brighter.
      // glow * 0.7: Sets the alpha (transparency), with 0.7 ensuring partial transparency (stronger at edges, fainter elsewhere).
      gl_FragColor = vec4(color * glow, glow * 0.7); 

      // The fragment shader creates a glowing halo around the sun, brightest at the edges due to rim lighting, with a soft, translucent appearance. 
      // The glowIntensity uniform ties to the GUI for user control.
    }
  `,
  // Enables transparency for the corona material.
  // This ensures the corona blends smoothly with the sun and background, creating a wispy, atmospheric effect.
  transparent: true,
  // Sets the blending mode to additive, enhancing the glow effect.
  // THREE.AdditiveBlending adds the corona’s color to the background color, making bright areas (e.g., edges) appear to glow more intensely.
  // Unlike normal blending, additive blending doesn’t darken the background, ideal for glowing effects like the corona.
  blending: THREE.AdditiveBlending,
  // Prevents the corona from writing to the depth buffer.
  // ensures the corona doesn’t block other objects (e.g., the sun or planets) in the depth test, allowing them to render correctly even if behind the corona.
  // Since the corona is transparent and additive, it doesn’t need to affect the depth buffer.
  // This ensures the sun (radius ~17.425) and planets are visible through the corona (radius ~18.732), maintaining proper rendering order.
  depthWrite: false,
  // Renders only the back (inner) faces of the corona’s geometry.
  // Means only the inner surface of the sphere (facing inward) is rendered, not the outer surface.
  // Since the corona is a sphere slightly larger than the sun, rendering the back side ensures the glow is visible from outside, as if the camera is looking at the inner glow of a hollow shell.
  // This prevents the corona from obscuring the sun and creates a halo effect around it.
  side: THREE.BackSide
});
// Creates a mesh combining the corona’s geometry and material.
const corona = new THREE.Mesh(coronaGeom, coronaMaterial);
// Adds the corona mesh to the Three.js scene.
scene.add(corona);

// Point light in the sun (unchanged)
const pointLight = new THREE.PointLight(0xFDFFD3, 1200, 400, 1.4);
scene.add(pointLight);

// ****** PLANET CREATION FUNCTION ******
// Defines the function with parameters to configure the planet.
function createPlanet(planetName, size, position_a, position_b, orbitcenter_x, orbitcenter_y, tilt, texture, bump, ring, atmosphere, moons, inclination = 0, omega = 0) {
  // Declares a variable to store the planet’s material.
  // Will be assigned a THREE.MeshPhongMaterial or a provided material based on conditions.
  let material;
  // Uses a pre-defined material if provided.
  if (texture instanceof THREE.Material) {
    material = texture;
  } 
  // Creates a material with a texture and bump map if a bump map is provided.
  else if (bump) {
    material = new THREE.MeshPhongMaterial({
      // The color texture (e.g., 'earth.jpg'), loaded via loadTexture.load
      map: loadTexture.load(texture),
      // The bump map for surface detail, adding shading to simulate height without extra geometry.
      bumpMap: loadTexture.load(bump),
      // Scales the bump effect’s intensity (0.7 is moderate, enhancing terrain like mountains).
      bumpScale: 0.7
    });} 
    // Creates a material with only a color texture if no bump map is provided.
    else {
    material = new THREE.MeshPhongMaterial({
      // The color texture (e.g., 'earth.jpg'), loaded via loadTexture.load
      map: loadTexture.load(texture)
    });
  }
  // Stores the planet’s name for the return object.
  const name = planetName;
  // Creates a spherical geometry for the planet.
  // size: Radius 
  // 32: Width segments (horizontal).
  // 20: Height segments (vertical).
  // Fewer height segments (20 vs. sun’s 32) optimize performance for smaller planets.
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  // Creates a mesh for the planet’s surface.
  const planet = new THREE.Mesh(geometry, material);
  // Creates a group to hold the planet, its orbit, rings, and moons.
  // THREE.Group organizes related objects, allowing them to be transformed together.
  // Contains the planet mesh, orbit path, and optional rings/moons.
  const planetSystem = new THREE.Group();
  // Adds the planet mesh to the planet system group.
  planetSystem.add(planet);
  // Declares variables for optional atmosphere and ring meshes.
  // Will be assigned if atmosphere or ring parameters are provided, used in the return object.
  let Atmosphere;
  let Ring;

  // Apply planet's axial tilt
  // Simulates the planet’s axial tilt, affecting its appearance and ring orientation.
  planet.rotation.z = tilt * Math.PI / 180;

  // Define the elliptical orbit with omega (argument of perihelion)
  const orbitPath = new THREE.EllipseCurve(
    orbitcenter_x, orbitcenter_y, // Center of the ellipse
    position_a, position_b,       // X and Y radii
    0, 2 * Math.PI,              // Full circle
    false,                       // Counter-clockwise
    omega * Math.PI / 180        // Rotate ellipse by omega (in radians)
  );

  // Generates 100 points along the orbit curve.
  // getPoints(100) samples the ellipse at 100 evenly spaced points, creating a smooth path.
  const pathPoints = orbitPath.getPoints(100);
  // Creates a geometry for the orbit path.
  // setFromPoints(pathPoints) sets the vertices to the orbit’s points.
  // Defines the shape of the orbit as a circular line.
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  // Creates a material for the orbit path.
  // color: 0xFFFFFF: White color.
  // transparent: true: Allows opacity.
  // opacity: 0.03: Very faint, making the orbit subtle.
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1});
  // Creates a line loop to render the orbit.
  // THREE.LineLoop connects the points into a closed loop (circle).
  // Combines orbitGeometry (points) and orbitMaterial (faint white).
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  
  // Tilts the orbit plane by rotating the orbit line around the x-axis.
  orbit.rotation.x = Math.PI / 2 + inclination * Math.PI / 180; // Default xy-plane (90°) + inclination
  // Adds the orbit line to the Three.js scene.
  scene.add(orbit);
  // Adds the orbit to a global orbits array.
  orbits.push(orbit);

  // Set initial position based on orbit path at angle 0
  // Purpose: Gets the initial position of the planet on its orbit at t = 0.
  const initialPoint = orbitPath.getPoint(0);
  // Sets the initial position of the planetSystem group.
  // Use initialPoint.y for z to align with orbit
  planetSystem.position.set(initialPoint.x, initialPoint.y, initialPoint.y); 

  // Rotates the planetSystem group to align with the tilted orbital plane.
  planetSystem.rotation.x = inclination * Math.PI / 180;

  // Checks if a ring system is provided (e.g., for Saturn).
  if (ring) {
    // THREE.RingGeometry creates a flat ring with:
    // innerRadius: Inner edge
    // outerRadius: Outer edge
    // 30: Segments for smoothness.
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 30);
    // THREE.MeshStandardMaterial uses physically-based rendering.
    // map: Loads the ring texture
    // side: THREE.DoubleSide: Renders both sides, visible from any angle.
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    // Creates and adds the ring to planetSystem.
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    // Rotates 90° around x-axis to lie flat.
    Ring.rotation.x = -0.5 * Math.PI;
    // Applies the planet’s tilt around y-axis for correct orientation
    Ring.rotation.y = -tilt * Math.PI / 180;
  }

  // Adds a glowing atmosphere layer for planets like Earth.
  if (atmosphere) {
    // Creates a sphere slightly larger than the planet.
    const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
    // Uses a semi-transparent texture.
    // transparent: true, opacity: 0.4: Makes the atmosphere faint.
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map: loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    });
    // Creates the atmosphere mesh.
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial);
    // Rotates it ~23.5° (0.41 radians) around z-axis, possibly to align with the planet’s tilt or texture.
    Atmosphere.rotation.z = 0.41;
    // Adds it as a child of planet, so it moves and rotates with the planet.
    planet.add(Atmosphere);
  }

  // Adds moons orbiting the planet.
  if (moons) {
    // Iterates over each moon
    moons.forEach(moon => {
      // Creates a THREE.MeshStandardMaterial with a texture and optional bump map (scale 0.5, subtler than planet’s 0.7).
      let moonMaterial;
      if (moon.bump) {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      // Creates a sphere with moon.size.
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      // Creates the moon mesh.
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      // Positions it at size * 1.5 (e.g., Earth’s Moon at ~0.24 units from Earth’s center) along the x-axis.
      const moonOrbitDistance = size * 1.5;
      // Positions the moon at the calculated distance along the x-axis relative to the planet.
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      // Adds it to planetSystem.
      planetSystem.add(moonMesh);
      // Stores the mesh in moon.mesh for later reference (e.g., animation).
      moon.mesh = moonMesh;
    });
  }
  // Adds the entire planet system to the scene.
  scene.add(planetSystem);

  let orbitAngle = 0;
  // Returns an object with references to the planet’s components.
  return { name, planet, planetSystem, Atmosphere, moons, Ring, orbitPath, orbitcenter_x, orbitcenter_y, orbitAngle, orbitSpeed: 0.001, inclination };
}

// ****** LOADING OBJECTS METHOD ******
// Function to load an external 3D model (GLTF file), places it at a specified position, scales it uniformly, adds it to the Three.js scene, 
// and optionally calls a user-provided callback function with the loaded object.
// Defines the function with parameters to load and configure a GLTF model.
function loadObject(path, position, scale, callback) {
  // Creates an instance of Three.js’s GLTFLoader to load GLTF models.
  const loader = new GLTFLoader();
  // Initiates the asynchronous loading of the GLTF file, handling success and error cases.
  loader.load(path, function (gltf) {
    const obj = gltf.scene; // Extracts the root scene object from the loaded GLTF data. obj is set to gltf.scene, the renderable 3D object
    obj.position.set(position, 0, 0); // Positions the loaded model in the scene.
    obj.scale.set(scale, scale, scale); // Uniformly scales the model to the desired size.
    scene.add(obj); // Adds the loaded model to the Three.js scene.
    if (callback) { // Executes an optional callback function, passing the loaded object.
      callback(obj); // The callback can perform additional setup, e.g., rotating the object, adding animations, or attaching it to a planet’s system.
    }
  }, undefined, function (error) { // The error callback is triggered if the GLTF file fails to load
    console.error('An error happened', error);
  });
}

// ****** ASTEROIDS ******
// Declares a global array to store all asteroid meshes.
const asteroids = [];
// Function to load a single GLTF model (representing an asteroid) and creates multiple copies, randomly placing them within a specified orbital range around the sun, with varied scales
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  // Creates a GLTFLoader instance to load the asteroid model.
  const loader = new GLTFLoader();
  // Asynchronously loads the GLTF model, handling success and error cases.
  loader.load(path, function (gltf) {
    // Iterates through the GLTF scene’s hierarchy to find renderable meshes.
    gltf.scene.traverse(function (child) {
      // Checks if the current child is a renderable mesh.
      if (child.isMesh) {
        // Creates multiple asteroid instances by cloning the mesh.
        // Loops numberOfAsteroids / 12 times (e.g., for numberOfAsteroids = 120, loops 10 times).
        // Each iteration creates one asteroid instance.
        // For numberOfAsteroids = 120 and a model with one mesh, this creates 10 asteroids (120 / 12); 
        // If the model has 12 meshes, each cloned 10 times, it yields 120 total asteroids.
        for (let i = 0; i < numberOfAsteroids / 12; i++) {
          // Creates a copy of the mesh to represent a single asteroid.
          const asteroid = child.clone();
          // Generates a random orbital radius for the asteroid within the specified belt.
          const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
          // Generates a random angle for the asteroid’s position in the orbital plane.
          const angle = Math.random() * Math.PI * 2;
          // Calculates the x-coordinate of the asteroid’s position.
          // Uses polar coordinates: x = r * cos(θ), where orbitRadius is the radius (r) and angle is the angle (θ).
          // Positions the asteroid along the x-axis relative to the sun.
          const x = orbitRadius * Math.cos(angle);
          // Sets the y-coordinate to 0, keeping the asteroid in the orbital plane.
          // Simplifies the simulation by assuming a flat asteroid belt.
          const y = 0;
          // Calculates the z-coordinate of the asteroid’s position.
          // Uses polar coordinates: z = r * sin(θ), complementing the x-coordinate.
          // Positions the asteroid along the z-axis relative to the sun.
          const z = orbitRadius * Math.sin(angle);
          // Enables the original mesh to receive shadows.
          // receiveShadow = true allows the mesh to show shadows cast by other objects (planets or the sun) if shadows are enabled in the renderer and light source.
          // Applied to child (the original mesh), but since asteroid is a clone, it inherits this property.
          child.receiveShadow = true;
          // Positions the cloned asteroid in the scene.
          asteroid.position.set(x, y, z);
          // Randomly scales the asteroid for visual variety.
          // Some asteroids 20% larger, others 20% smaller, enhancing realism.
          asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
          // Adds the asteroid mesh to the Three.js scene.
          scene.add(asteroid);
          // Stores the asteroid mesh in the global asteroids array.
          asteroids.push(asteroid);
        }
      }
    });
  }, undefined, function (error) {
    // Handles loading errors by logging them.
    console.error('An error happened', error);
  });
}

// Creates a THREE.ShaderMaterial for the Earth’s surface. 
// Blending a day texture (e.g., continents, oceans) with a night texture (e.g., city lights) 
// based on the angle between the sun’s light and the Earth’s surface normals.
// Creates a custom shader material for Earth’s mesh.
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Defines variables passed to the shaders, accessible in both vertex and fragment shaders.
    // Represents Earth’s surface in daylight
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    // Loads the night texture
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    // Calculate lighting direction.
    sunPosition: { type: "v3", value: sun.position }
  },
  // Processes each vertex of Earth’s geometry, passing data to the fragment shader 
  // and computing the vertex’s position in clip space.
  vertexShader: `
    // Passes the vertex normal (in world space) to the fragment shader for lighting calculations.
    varying vec3 vNormal;
    // Passes the UV coordinates (texture mapping) to sample textures.
    varying vec2 vUv;
    // Passes the direction from the vertex to the sun for lighting.
    varying vec3 vSunDirection;
    // The sun’s position ((0, 0, 0)), provided via uniforms.
    uniform vec3 sunPosition;
    void main() {
      // Copies the vertex’s UV coordinates (built-in uv attribute, 0–1 range) for texture sampling in the fragment shader.
      vUv = uv;
      // Transforms the vertex position (local space, position attribute, e.g., 
      // on a sphere of radius 0.16) to world space using modelMatrix
      // modelMatrix includes Earth’s position (e.g., (149.6, 0, 0)), rotation, and scale.
      // worldPosition is the vertex’s absolute position in the scene (e.g., (149.6 + x, y, z) for a vertex on Earth’s surface).
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      // Transforms the vertex normal (local space, normal attribute) to world space.
      // vec4(normal, 0.0) treats the normal as a direction (not a point, so w = 0 ignores translation).
      // normalize ensures the normal is a unit vector, critical for lighting calculations.
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      // Calculates the direction from the vertex to the sun.
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      // Transforms the vertex from local space to clip space,
      // modelViewMatrix: Combines model (Earth’s position/rotation) and view (camera) transformations.
      // projectionMatrix: Applies perspective projection (45° FOV, near 0.1, far 1000).
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Computes the final color of each pixel on Earth’s surface, blending day and night textures based on lighting intensity.
  fragmentShader: `
    uniform sampler2D dayTexture; // The day texture
    uniform sampler2D nightTexture; // The night texture
    varying vec3 vNormal; // World-space normal from the vertex shader.
    varying vec2 vUv; // UV coordinates for texture sampling.
    varying vec3 vSunDirection; // Direction to the sun.
    void main() {
      // Calculates lighting intensity using the dot product of the normal and sun direction.
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      // Samples the day texture at the UV coordinates (e.g., blue oceans, green continents).
      vec4 dayColor = texture2D(dayTexture, vUv);
      // Samples the night texture (e.g., yellow city lights on black).
      vec4 nightColor = texture2D(nightTexture, vUv) * 0.2;
      // Blends the night and day colors based on intensity.
      // intensity = 0: Full nightColor (night side).
      // intensity = 1: Full dayColor (day side).
      // intensity = 0.5: 50% blend (twilight).
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});

// ****** MOONS ******
const earthMoon = [{
  size: 1.6, // // radius of the Moon’s spherical geometry
  texture: earthMoonTexture, // Specifies the texture map for the Moon’s surface.
  bump: earthMoonBump, // Specifies the bump map for the Moon’s surface to add depth and detail.
  orbitSpeed: 0.001 * settings.accelerationOrbit, // Defines the Moon’s orbital speed around Earth, scaled by a user-controlled factor.
  orbitRadius: 10 // Specifies the distance from Earth’s center to the Moon’s orbital path.
}];

const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    // Defines the uniform scaling factor for the Phobos model.
    scale: 0.1, // 0.1 means the model is scaled to 10% of its original size
    orbitRadius: 5, // Specifies the distance from Mars’ center to Phobos’ orbital path, in simulation units.
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100, // Specifies the initial x-coordinate for Phobos’ placement, likely used in loadObject
    mesh: null // A placeholder for the loaded GLTF model’s mesh, updated after loading
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ****** PLANET CREATIONS ******
// Instantiates various planets as objects in the simulation, each with a 3D mesh, material, and orbital properties
const mercury = new createPlanet('Mercury', 2.4, 34.83, 33.39, 7.16, 0, 0, mercuryTexture, mercuryBump, null, null, null, 7, 48.33);
const venus = new createPlanet('Venus', 6.1, 65.07, 65.07, 0.44, 0, 3, venusTexture, venusBump, null, venusAtmosphere, null, 3.39, 76.68);
const earth = new createPlanet('Earth', 6.4, 90, 89.987, 1.5, 0, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Mars', 3.4, 136.8, 136.18, 12.77, 0, 25, marsTexture, marsBump, null, null, null, 1.85, 49.56);

// Loads and integrates the 3D models for Mars’ moons (Phobos and Deimos) into the simulation, 
// assigning them to Mars’ coordinate system (planetSystem) and configuring them to cast and receive shadows for enhanced realism.
// Iterates over each moon object in the marsMoons array
marsMoons.forEach(moon => {
  // Loads the moon’s GLTF model using the loadObject function and executes a callback when the model is loaded.
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    // Assigns the loaded GLTF model to the moon’s mesh property
    moon.mesh = loadedModel;
    // Adds the moon’s model to Mars’ planetSystem group, parenting it to Mars’ coordinate system.
    mars.planetSystem.add(moon.mesh);
    // Iterates through the loaded model’s hierarchy to configure properties of all meshes.
    moon.mesh.traverse(function (child) {
      // Checks if the current child is a renderable mesh, filtering out non-mesh objects (e.g., groups, lights).
      if (child.isMesh) {
        // Enables the mesh to cast shadows onto other objects.
        child.castShadow = true;
        // Enables the mesh to receive shadows cast by other objects.
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Jupiter', 69/4, 200, 199.76, 22.88, 0, 3, jupiterTexture, null, null, null, jupiterMoons, 1.31, 100.56);
const saturn = new createPlanet('Saturn', 58/4, 270, 269.57, 48.75, 0, 26, saturnTexture, null, {
  innerRadius: 18,
  outerRadius: 29,
  texture: satRingTexture
}, null, null, 2.49, 113.72);
const uranus = new createPlanet('Uranus', 25/4, 320, 319.67, 79, 0, 82, uranusTexture, null, {
  innerRadius: 6,
  outerRadius: 8,
  texture: uraRingTexture
}, null, null, 0.77, 74.23);
const neptune = new createPlanet('Neptune', 24/4, 340, 339.98, 30.59, 0, 28, neptuneTexture, null, null, null, null, 1.77, 131.72);
const pluto = new createPlanet('Pluto', 4, 350, 338.88, 88.3, 0, 57, plutoTexture, null, null, null, null, 17.14, 110.30);

// ****** PLANETS DATA ******
// Define planetData
/*
const planetData = {
  'Mercury': {
    radius: '2,439.7 km',
    tilt: '0.034°',
    rotation: '58.6 Earth days',
    orbit: '88 Earth days',
    distance: '57.9 million km',
    moons: '0',
    info: 'The smallest planet in our solar system and nearest to the Sun.'
  },
  'Venus': {
    radius: '6,051.8 km',
    tilt: '177.4°',
    rotation: '243 Earth days',
    orbit: '225 Earth days',
    distance: '108.2 million km',
    moons: '0',
    info: 'Second planet from the Sun, known for its extreme temperatures and thick atmosphere.'
  },
  'Earth': {
    radius: '6,371 km',
    tilt: '23.5°',
    rotation: '24 hours',
    orbit: '365 days',
    distance: '150 million km',
    moons: '1 (Moon)',
    info: 'Third planet from the Sun and the only known planet to harbor life.'
  },
  'Mars': {
    radius: '3,389.5 km',
    tilt: '25.19°',
    rotation: '1.03 Earth days',
    orbit: '687 Earth days',
    distance: '227.9 million km',
    moons: '2 (Phobos and Deimos)',
    info: 'Known as the Red Planet, famous for its reddish appearance and potential for human colonization.'
  },
  'Jupiter': {
    radius: '69,911 km',
    tilt: '3.13°',
    rotation: '9.9 hours',
    orbit: '12 Earth years',
    distance: '778.5 million km',
    moons: '95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)',
    info: 'The largest planet in our solar system, known for its Great Red Spot.'
  },
  'Saturn': {
    radius: '58,232 km',
    tilt: '26.73°',
    rotation: '10.7 hours',
    orbit: '29.5 Earth years',
    distance: '1.4 billion km',
    moons: '146 known moons',
    info: 'Distinguished by its extensive ring system, the second-largest planet in our solar system.'
  },
  'Uranus': {
    radius: '25,362 km',
    tilt: '97.77°',
    rotation: '17.2 hours',
    orbit: '84 Earth years',
    distance: '2.9 billion km',
    moons: '27 known moons',
    info: 'Known for its unique sideways rotation and pale blue color.'
  },
  'Neptune': {
    radius: '24,622 km',
    tilt: '28.32°',
    rotation: '16.1 hours',
    orbit: '165 Earth years',
    distance: '4.5 billion km',
    moons: '14 known moons',
    info: 'The most distant planet from the Sun in our solar system, known for its deep blue color.'
  },
  'Pluto': {
    radius: '1,188.3 km',
    tilt: '122.53°',
    rotation: '6.4 Earth days',
    orbit: '248 Earth years',
    distance: '5.9 billion km',
    moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
    info: 'Originally classified as the ninth planet, Pluto is now considered a dwarf planet.'
  }
};
*/

const planetData = {
  'Mercury': {
    text: 'Sao Thủy là hành tinh nhỏ nhất trong Hệ Mặt Trời với bán kính 2.439,7 km và không có mặt trăng nào. Nó nằm gần Mặt Trời nhất ở khoảng cách 57,9 triệu km. Trục nghiêng của Sao Thủy chỉ 0,034 độ, gần như không có mùa. Một vòng quay quanh trục của nó kéo dài 58,6 ngày Trái Đất, còn một vòng quay quanh Mặt Trời mất 88 ngày Trái Đất. Đây là hành tinh nóng vào ban ngày và cực kỳ lạnh vào ban đêm do không có khí quyển dày. Dù gần Mặt Trời nhất, nhưng Sao Thủy không phải là hành tinh nóng nhất. Một ngày trên Sao Thủy dài hơn cả năm của nó!'
  },
  'Venus': {
    text: 'Sao Kim là hành tinh thứ hai từ Mặt Trời, cách khoảng 108,2 triệu km, với bán kính 6.051,8 km. Nó không có mặt trăng nào và có khí quyển rất dày, chứa chủ yếu là CO₂, gây hiệu ứng nhà kính cực mạnh. Trục nghiêng của nó là 177,4 độ, quay ngược chiều với hầu hết các hành tinh khác. Một ngày trên Sao Kim dài 243 ngày Trái Đất, trong khi một năm chỉ mất 225 ngày Trái Đất. Đây là hành tinh nóng nhất trong Hệ Mặt Trời. Sao Kim là hành tinh sáng nhất trên bầu trời đêm sau Mặt Trăng. Trên Sao Kim, Mặt Trời mọc ở hướng tây và lặn ở hướng đông!'
  },
  'Earth': {
    text: 'Trái Đất là hành tinh thứ ba từ Mặt Trời, cách khoảng 150 triệu km, với bán kính 6.371 km và có một mặt trăng – Mặt Trăng. Trục nghiêng của Trái Đất là 23,5 độ, tạo ra bốn mùa rõ rệt. Trái Đất quay quanh trục mỗi 24 giờ và mất 365 ngày để quay quanh Mặt Trời. Đây là hành tinh duy nhất được biết đến có sự sống. Trái Đất là hành tinh duy nhất có nước tồn tại ở cả ba trạng thái: rắn, lỏng và khí. Trái Đất là hành tinh duy nhất không được đặt tên theo một vị thần trong thần thoại!'
  },
  'Mars': {
    text: 'Sao Hỏa là hành tinh thứ tư, cách Mặt Trời khoảng 227,9 triệu km, với bán kính 3.389,5 km và hai mặt trăng nhỏ tên là Phobos và Deimos. Trục nghiêng của nó là 25,19 độ, tương tự Trái Đất, dẫn đến các mùa. Một ngày trên Sao Hỏa kéo dài 1,03 ngày Trái Đất và một năm kéo dài 687 ngày Trái Đất. Nó nổi bật với màu đỏ do chứa nhiều oxit sắt trên bề mặt. Trên Sao Hỏa có hẻm núi lớn nhất trong Hệ Mặt Trời – Valles Marineris. Bầu khí quyển trên Sao Hỏa mỏng đến mức nước không thể tồn tại ở dạng lỏng trên bề mặt!'
  },
  'Jupiter': {
    text: 'Sao Mộc là hành tinh lớn nhất trong Hệ Mặt Trời với bán kính lên tới 69.911 km và có ít nhất 95 mặt trăng được biết đến, trong đó Ganymede là mặt trăng lớn nhất. Nó nằm cách Mặt Trời 778,5 triệu km, nghiêng trục 3,13 độ. Một ngày trên Sao Mộc chỉ kéo dài 9,9 giờ – ngắn nhất trong các hành tinh, còn một năm kéo dài 12 năm Trái Đất. Nó nổi bật với Vết Đỏ Lớn – một cơn bão khổng lồ tồn tại hàng trăm năm. Ganymede còn lớn hơn cả hành tinh Sao Thủy! Sao Mộc có từ trường mạnh nhất trong Hệ Mặt Trời.'
  },
  'Saturn': {
    text: 'Sao Thổ là hành tinh lớn thứ hai trong Hệ Mặt Trời, với bán kính 58.232 km và có 146 mặt trăng được biết đến. Nó cách Mặt Trời khoảng 1,4 tỷ km và có trục nghiêng 26,73 độ. Một ngày trên Sao Thổ kéo dài 10,7 giờ, còn một năm mất 29,5 năm Trái Đất. Sao Thổ nổi tiếng với hệ thống vành đai hoành tráng. Sao Thổ nhẹ đến mức có thể nổi trong nước nếu có đại dương đủ lớn! Vành đai của Sao Thổ chủ yếu được tạo thành từ băng đá và có thể nhìn thấy bằng kính thiên văn nhỏ.'
  },
  'Uranus': {
    text: 'Sao Thiên Vương là hành tinh thứ bảy, cách Mặt Trời khoảng 2,9 tỷ km, bán kính 25.362 km, và có 27 mặt trăng. Trục nghiêng của nó là 97,77 độ khiến hành tinh này gần như nằm ngang khi quay. Một ngày kéo dài 17,2 giờ và một năm là 84 năm Trái Đất. Màu xanh nhạt của nó là do khí methane hấp thụ ánh sáng đỏ. Sao Thiên Vương có vành đai như Sao Thổ, nhưng rất mờ nhạt. Mùa hè và mùa đông ở mỗi cực có thể kéo dài tới 21 năm!'
  },
  'Neptune': {
    text: 'Sao Hải Vương là hành tinh xa nhất trong Hệ Mặt Trời, cách Mặt Trời khoảng 4,5 tỷ km. Nó có bán kính 24.622 km và 14 mặt trăng, nổi bật nhất là Triton. Trục nghiêng là 28,32 độ. Một ngày dài 16,1 giờ và một năm mất 165 năm Trái Đất. Sao Hải Vương nổi bật với màu xanh đậm và các cơn gió mạnh nhất từng được ghi nhận. Triton quay quanh hành tinh theo hướng ngược lại – rất hiếm trong Hệ Mặt Trời. Dù xa Mặt Trời, Sao Hải Vương vẫn có hệ thời tiết cực kỳ động!'
  },
  'Pluto': {
    text: 'Sao Diêm Vương là một hành tinh lùn, nằm cách Mặt Trời khoảng 5,9 tỷ km, với bán kính chỉ 1.188,3 km. Nó có 5 mặt trăng, trong đó Charon lớn gần bằng chính nó. Trục nghiêng là 122,53 độ, một ngày dài 6,4 ngày Trái Đất, còn một năm kéo dài 248 năm. Dù nhỏ bé, sao Diêm Vương có địa hình đa dạng với núi băng và đồng bằng nitơ. Sao Diêm Vương từng có thời gian gần Mặt Trời hơn cả Sao Hải Vương (1979–1999). Tỷ lệ kích thước giữa Sao Diêm Vương và Charon là gần nhất trong Hệ Mặt Trời – chúng gần như là hệ hành tinh đôi!'
  }
};

// Array of planets and atmospheres for raycasting
// Defines an array of 3D objects (planet meshes and atmospheres) that can be detected by raycasting, 
// enabling user interactions like clicking planets to show information
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere,
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

// ****** SHADOWS ******
// Enables shadow mapping in the WebGL renderer, allowing objects to cast and receive shadows.
renderer.shadowMap.enabled = true;
// Configures the pointLight (the sun) to cast shadows.
pointLight.castShadow = true;

// Sets the resolution of the shadow map for pointLight.
// Provides crisp shadows for objects like earth.planet, marsMoons meshes, or jupiter.planet, visible
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;

// Configures the shadow camera’s near and far clipping planes for pointLight.
// A PointLight uses a perspective shadow camera (or multiple for omnidirectional shadows) to render the shadow map.
// near = 10: Objects closer than 10 units to the light (sun at (0, 0, 0)) are ignored for shadows.
// far = 20: Objects farther than 20 units don’t cast shadows.
pointLight.shadow.camera.near = 10; //10;
pointLight.shadow.camera.far = 100; // 20;

// Allows the Earth’s planet mesh to cast shadows onto other objects.
earth.planet.castShadow = true;
// Allows the Earth’s planet mesh to receive shadows cast by other objects.
earth.planet.receiveShadow = true;
// Allows the Earth’s atmosphere mesh to cast shadows.
earth.Atmosphere.castShadow = true;
// Allows the Earth’s atmosphere to receive shadows.
earth.Atmosphere.receiveShadow = true;
// Iterates over the Earth’s moons (from earthMoon) to configure their shadow properties.
earth.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;

mercury.orbitSpeed = 0.004;
venus.orbitSpeed = 0.0006;
earth.orbitSpeed = 0.001;
mars.orbitSpeed = 0.0007;
jupiter.orbitSpeed = 0.0003;
saturn.orbitSpeed = 0.0002;
uranus.orbitSpeed = 0.0001;
neptune.orbitSpeed = 0.00008;
pluto.orbitSpeed = 0.00006;

// ****** EARTH SATELLITES (mini asteroids and advanced satellites) ******
const earthSatellites = [];
function createEarthSatellites(count = 15) {
  for (let i = 0; i < count; i++) {
    // Thiên thạch nhỏ quay quanh trái đất
    const size = THREE.MathUtils.randFloat(0.15, 0.35);
    const geometry = new THREE.SphereGeometry(size, 12, 8);
    
    // Tạo texture phức tạp hơn cho thiên thạch
    const color = new THREE.Color(
      0.4 + Math.random() * 0.2, 
      0.4 + Math.random() * 0.1,
      0.4 + Math.random() * 0.1
    );
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.8 + Math.random() * 0.2,
      metalness: 0.1 + Math.random() * 0.2,
    });
    
    const satellite = new THREE.Mesh(geometry, material);
    
    // Thêm các hố nhỏ cho thiên thạch
    if (Math.random() > 0.5 && size > 0.25) {
      const craterCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < craterCount; j++) {
        const craterSize = size * (0.2 + Math.random() * 0.2);
        const craterGeom = new THREE.SphereGeometry(craterSize, 8, 8);
        const craterMat = new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(0.3, 0.3, 0.3),
          roughness: 1.0
        });
        const crater = new THREE.Mesh(craterGeom, craterMat);
        
        // Vị trí ngẫu nhiên trên bề mặt thiên thạch
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        crater.position.set(
          size * 0.8 * Math.sin(theta) * Math.cos(phi),
          size * 0.8 * Math.sin(theta) * Math.sin(phi),
          size * 0.8 * Math.cos(theta)
        );
        
        satellite.add(crater);
      }
    }

    // Orbit parameters
    satellite.userData.orbitRadius = THREE.MathUtils.randFloat(8, 15);
    satellite.userData.orbitAngle = Math.random() * Math.PI * 2;
    satellite.userData.orbitSpeed = THREE.MathUtils.randFloat(0.001, 0.003);
    satellite.userData.rotationAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    satellite.userData.rotationSpeed = Math.random() * 0.02;

    earth.planetSystem.add(satellite);
    earthSatellites.push(satellite);
  }

  // Tạo vệ tinh hiện đại với thiết kế đẹp hơn
  createModernSatellite(10, 0);
  createModernSatellite(12, Math.PI / 2);
  createModernSatellite(14, Math.PI);
  createHubbleTelescope();
  createISS();
}

// Tạo vệ tinh hiện đại với chi tiết cao
function createModernSatellite(orbitRadius, startAngle) {
  const satGroup = new THREE.Group();
  
  // Thân vệ tinh - hình hộp chữ nhật có texture
  const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
  const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0xdddddd, 
    metalness: 0.8, 
    roughness: 0.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  satGroup.add(body);

  // Thêm chi tiết thân vệ tinh
  const detailGeom = new THREE.BoxGeometry(0.4, 0.3, 0.9);
  const detailMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.8 
  });
  const detail = new THREE.Mesh(detailGeom, detailMat);
  detail.position.set(0, 0.4, 0);
  satGroup.add(detail);

  // Tấm pin mặt trời với hiệu ứng phản chiếu
  const panelGeometry = new THREE.BoxGeometry(0.04, 2.8, 0.8);
  const panelMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x3366ff, 
    metalness: 0.7, 
    roughness: 0.2,
    envMapIntensity: 1.0,
    emissive: 0x223366,
    emissiveIntensity: 0.3
  });
  
  // Tạo tấm pin trái
  const panelLeft = new THREE.Mesh(panelGeometry, panelMaterial);
  panelLeft.position.x = -0.9;
  
  // Tạo khung viền cho tấm pin
  const frameGeom = new THREE.BoxGeometry(0.06, 2.85, 0.85);
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    metalness: 0.9, 
    roughness: 0.3 
  });
  const frameLeft = new THREE.Mesh(frameGeom, frameMat);
  frameLeft.position.copy(panelLeft.position);
  frameLeft.position.z -= 0.01;
  
  // Tạo cấu trúc nối tấm pin với thân vệ tinh
  const connectorGeom = new THREE.BoxGeometry(0.2, 0.1, 0.1);
  const connector1 = new THREE.Mesh(connectorGeom, frameMat);
  connector1.position.set(-0.7, 0.5, 0);
  const connector2 = new THREE.Mesh(connectorGeom, frameMat);
  connector2.position.set(-0.7, -0.5, 0);
  
  satGroup.add(panelLeft, frameLeft, connector1, connector2);
  
  // Tạo tấm pin phải (nhân đối xứng)
  const panelRight = panelLeft.clone();
  panelRight.position.x = 0.9;
  const frameRight = frameLeft.clone();
  frameRight.position.x = 0.9;
  const connector3 = connector1.clone();
  connector3.position.x = 0.7;
  const connector4 = connector2.clone();
  connector4.position.x = 0.7;
  
  satGroup.add(panelRight, frameRight, connector3, connector4);

  // Anten phát sóng
  const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12);
  const antennaMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    metalness: 0.9,
    roughness: 0.3
  });
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  antenna.position.z = 0.6;
  antenna.rotation.x = Math.PI / 2;
  
  // Thêm đĩa anten
  const dishGeometry = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI);
  const dishMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd, 
    metalness: 0.8, 
    roughness: 0.2,
    side: THREE.DoubleSide
  });
  const dish = new THREE.Mesh(dishGeometry, dishMaterial);
  dish.position.set(0, 0, 1.4);
  dish.rotation.x = Math.PI/2;
  antenna.add(dish);
  
  satGroup.add(antenna);

  // Thêm hiệu ứng ánh sáng nhỏ (đèn tín hiệu)
  const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const lightMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    emissive: 0xff0000,
    emissiveIntensity: 1
  });
  const redLight = new THREE.Mesh(lightGeo, lightMat);
  redLight.position.set(0, -0.5, 0.4);
  satGroup.add(redLight);
  
  // Đặt thông tin quỹ đạo cho vệ tinh
  satGroup.userData.orbitRadius = orbitRadius;
  satGroup.userData.orbitAngle = startAngle;
  satGroup.userData.orbitSpeed = 0.0009;
  satGroup.userData.blink = { time: 0, rate: 0.02 };

  earth.planetSystem.add(satGroup);
  earthSatellites.push(satGroup);
  
  return satGroup;
}

// Tạo mô hình Kính viễn vọng Hubble
function createHubbleTelescope() {
  const hubble = new THREE.Group();
  
  // Thân chính - hình trụ
  const bodyGeom = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0xbbbbbb, 
    metalness: 0.7, 
    roughness: 0.4
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.rotation.z = Math.PI/2;
  hubble.add(body);
  
  // Thêm các tấm pin mặt trời (lớn hơn, xoay 90 độ)
  const panelGeom = new THREE.BoxGeometry(3.0, 0.05, 1.0);
  const panelMat = new THREE.MeshPhysicalMaterial({
    color: 0x2255dd,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x112244,
    emissiveIntensity: 0.5
  });
  
  const panel1 = new THREE.Mesh(panelGeom, panelMat);
  panel1.position.set(0, 1.2, 0);
  hubble.add(panel1);
  
  const panel2 = new THREE.Mesh(panelGeom, panelMat);
  panel2.position.set(0, -1.2, 0);
  hubble.add(panel2);
  
  // Kính viễn vọng - phía trước
  const scopeGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
  const scopeMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.5,
    roughness: 0.8
  });
  const scope = new THREE.Mesh(scopeGeom, scopeMat);
  scope.rotation.z = Math.PI/2;
  scope.position.set(-1.8, 0, 0);
  hubble.add(scope);
  
  // Đặt thông tin quỹ đạo
  hubble.userData.orbitRadius = 13;
  hubble.userData.orbitAngle = Math.PI * 0.75;
  hubble.userData.orbitSpeed = 0.0007;
  hubble.userData.tilt = 0.4;
  
  hubble.scale.set(0.5, 0.5, 0.5); // Kích thước phù hợp
  
  earth.planetSystem.add(hubble);
  earthSatellites.push(hubble);
  
  return hubble;
}

// Tạo Trạm vũ trụ quốc tế ISS
function createISS() {
  const iss = new THREE.Group();
  
  // Mô-đun chính
  const mainModuleGeom = new THREE.CylinderGeometry(0.4, 0.4, 2.0, 12);
  const mainModuleMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.7,
    roughness: 0.3
  });
  const mainModule = new THREE.Mesh(mainModuleGeom, mainModuleMat);
  mainModule.rotation.z = Math.PI/2;
  iss.add(mainModule);
  
  // Tạo các mô-đun phụ
  for (let i = 0; i < 3; i++) {
    const segmentGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12);
    const segment = new THREE.Mesh(segmentGeom, mainModuleMat);
    segment.position.set((i-1) * 0.8, 0, 0);
    segment.rotation.z = Math.PI/2;
    iss.add(segment);
  }
  
  // Tấm pin mặt trời - cặp 1
  const solarPanelGeom = new THREE.BoxGeometry(2.5, 0.05, 0.8);
  const solarPanelMat = new THREE.MeshPhysicalMaterial({
    color: 0x3355dd,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x112244,
    emissiveIntensity: 0.4
  });
  
  const solarPanel1 = new THREE.Mesh(solarPanelGeom, solarPanelMat);
  solarPanel1.position.set(0.5, 0, 1.0);
  iss.add(solarPanel1);
  
  const solarPanel2 = new THREE.Mesh(solarPanelGeom, solarPanelMat);
  solarPanel2.position.set(0.5, 0, -1.0);
  iss.add(solarPanel2);
  
  // Tấm pin mặt trời - cặp 2
  const solarPanel3 = new THREE.Mesh(solarPanelGeom, solarPanelMat);
  solarPanel3.position.set(-0.5, 0, 1.0);
  solarPanel3.rotation.y = Math.PI/6;
  iss.add(solarPanel3);
  
  const solarPanel4 = new THREE.Mesh(solarPanelGeom, solarPanelMat);
  solarPanel4.position.set(-0.5, 0, -1.0);
  solarPanel4.rotation.y = -Math.PI/6;
  iss.add(solarPanel4);
  
  // Scale to appropriate size
  iss.scale.set(0.6, 0.6, 0.6);
  
  // Đặt thông tin quỹ đạo
  iss.userData.orbitRadius = 9;
  iss.userData.orbitAngle = Math.PI * 1.25;
  iss.userData.orbitSpeed = 0.0012;
  iss.userData.tilt = 0.2;
  
  earth.planetSystem.add(iss);
  earthSatellites.push(iss);
  
  return iss;
}

createEarthSatellites(15);

// ****** MINIMAP & ZOOM CONTROLS ******
function createMinimap() {
  // Tạo camera phụ cho minimap
  const minimapCamera = new THREE.OrthographicCamera(
    -400, 400, 200, -200, 1, 2000
  );
  minimapCamera.position.set(0, 800, 0);
  minimapCamera.lookAt(0, 0, 0);
  minimapCamera.zoom = 1.5;
  minimapCamera.updateProjectionMatrix();
  
  // Tạo renderer phụ cho minimap
  const minimapRenderer = new THREE.WebGLRenderer({ alpha: true });
  minimapRenderer.setSize(200, 100);
  minimapRenderer.domElement.style.position = 'absolute';
  minimapRenderer.domElement.style.bottom = '10px';
  minimapRenderer.domElement.style.right = '10px';
  minimapRenderer.domElement.style.border = '1px solid white';
  minimapRenderer.domElement.style.borderRadius = '5px';
  minimapRenderer.domElement.style.opacity = '0.7';
  document.body.appendChild(minimapRenderer.domElement);
  
  // Chỉ thị vị trí camera chính trên minimap
  const cameraIndicator = new THREE.Mesh(
    new THREE.SphereGeometry(5, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  scene.add(cameraIndicator);
  
  // Các biến để theo dõi sự kiện hover và click lên minimap
  let isMinimapHovered = false;
  let isDraggingMinimap = false;
  
  // Thêm sự kiện cho minimap
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
    // Chuyển đổi tọa độ chuột trên minimap thành tọa độ trong không gian 3D
    const rect = minimapRenderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const z = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Tính toán vị trí mới cho camera chính
    const targetX = x * 400;
    const targetZ = z * 200;
    
    // Di chuyển camera chính đến vị trí mới, giữ nguyên độ cao (y)
    if (!isMovingTowardsPlanet && !isZoomingOut) {
      // Vòng tròn giới hạn phạm vi di chuyển
      const maxDistance = 350;
      const distance = Math.sqrt(targetX * targetX + targetZ * targetZ);
      
      if (distance <= maxDistance) {
        camera.position.x = targetX;
        camera.position.z = targetZ;
      } else {
        // Giữ tỷ lệ nhưng giới hạn trong phạm vi cho phép
        camera.position.x = (targetX / distance) * maxDistance;
        camera.position.z = (targetZ / distance) * maxDistance;
      }
      
      // Cập nhật góc quay và khoảng cách cho controls
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
      // Cập nhật vị trí indicator theo camera chính
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Xác định vị trí indicator là cách camera 20 đơn vị theo hướng nhìn
      cameraIndicator.position.copy(camera.position);
      
      minimapRenderer.render(scene, minimapCamera);
    }
  };
}

// Tạo chức năng zoom toàn cảnh
function createZoomControls() {
  // Tạo container cho các nút zoom
  const zoomContainer = document.createElement('div');
  zoomContainer.style.position = 'absolute';
  zoomContainer.style.bottom = '120px';
  zoomContainer.style.right = '10px';
  zoomContainer.style.display = 'flex';
  zoomContainer.style.flexDirection = 'column';
  zoomContainer.style.gap = '5px';
  
  // Tạo nút zoom in
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
  
  // Tạo nút zoom out
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
  
  // Tạo nút reset view
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
  
  // Thêm các nút vào container
  zoomContainer.appendChild(zoomInButton);
  zoomContainer.appendChild(zoomOutButton);
  zoomContainer.appendChild(resetViewButton);
  document.body.appendChild(zoomContainer);
  
  // Xử lý sự kiện zoom in
  zoomInButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut && radius > 100) {
      // Giảm khoảng cách (zoom in)
      radius *= 0.8;
      
      // Cập nhật vị trí camera
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  });
  
  // Xử lý sự kiện zoom out
  zoomOutButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut && radius < 500) {
      // Tăng khoảng cách (zoom out)
      radius *= 1.25;
      
      // Cập nhật vị trí camera
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(0, 0, 0);
      controls.update();
    }
  });
  
  // Xử lý sự kiện reset view
  resetViewButton.addEventListener('click', () => {
    if (!isMovingTowardsPlanet && !isZoomingOut) {
      // Reset về vị trí mặc định
      camera.position.set(-175, 115, 5);
      camera.lookAt(0, 0, 0);
      
      // Cập nhật các biến theo dõi
      radius = camera.position.length();
      theta = Math.atan2(camera.position.x, camera.position.z);
      phi = Math.acos(camera.position.y / radius);
      
      controls.update();
    }
  });
  
  // Thêm hiệu ứng hover
  [zoomInButton, zoomOutButton, resetViewButton].forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(255,255,255,0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
  });
}

// Khởi tạo minimap và điều khiển
const minimap = createMinimap();
createZoomControls();

// Thiết lập userdata planetName cho các quỹ đạo
orbits.forEach((orbit, index) => {
  if (index < 9) { // 9 hành tinh
    const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];
    orbit.userData = { planetName: planets[index].name };
  }
});

function animate() {
  // Update Sun and Corona Materials
  sunMaterial.uniforms.time.value += 0.015;
  coronaMaterial.uniforms.time.value += 0.015;

  // Rotate Sun
  sun.rotateY(0.004 * settings.acceleration);

  // Creates an array of all planet objects in the simulation.
  const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];
  planets.forEach(planet => {
    // Advances the planet’s position along its orbit by incrementing its orbital angle.
    planet.orbitAngle += planet.orbitSpeed * settings.accelerationOrbit;
    // Normalize t to [0, 1] by wrapping angle to [0, 2π]
    // Normalizes the orbital angle to a value between 0 and 1, suitable for sampling the elliptical orbit.
    const t = (planet.orbitAngle % (2 * Math.PI)) / (2 * Math.PI);
    // Retrieves the 2D coordinates (x, y) of the planet’s current position on its elliptical orbit.
    const point = planet.orbitPath.getPoint(t);
    // Sets the initial position of the planetSystem group in 3D space, using the 2D orbit coordinates.
    planet.planetSystem.position.set(point.x, 0, point.y);
    // Converts the planet’s orbital inclination to radians for use in a rotation transformation.
    const inclinationRad = (planet.inclination || 0) * Math.PI / 180;
    // Calculates the new y-coordinate of the planet after rotating its position by the inclination angle around the x-axis.
    // This line applies a 2D rotation matrix to the y and z coordinates of planetSystem.position to tilt the orbit plane
    // y' = y * cos(θ) - z * sin(θ)
    const y = planet.planetSystem.position.y * Math.cos(inclinationRad) - planet.planetSystem.position.z * Math.sin(inclinationRad);
    // Calculates the new z-coordinate of the planet after rotating its position by the inclination angle around the x-axis.
    // z' = y * sin(θ) + z * cos(θ)
    const z = planet.planetSystem.position.y * Math.sin(inclinationRad) + planet.planetSystem.position.z * Math.cos(inclinationRad);
    planet.planetSystem.position.y = y;
    planet.planetSystem.position.z = z;

    // Rotate planet on its axis
    if (planet.name === 'Venus') {
    planet.planet.rotateY(-0.005 * settings.acceleration); // clockwise
    } 
    else {
    planet.planet.rotateY(0.005 * settings.acceleration); // counter-clockwise
    }

    if (planet.Atmosphere) {
      planet.Atmosphere.rotateY(0.001 * settings.acceleration);
    }
  });

  // Update Earth's Moon
  if (earth.moons) {
    earth.moons.forEach(moon => {
      const time = performance.now();
      const tiltAngle = 5 * Math.PI / 180;
      const moonX = moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
      const moonZ = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);
      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }

  // Update Mars' Moons
  if (marsMoons) {
    marsMoons.forEach(moon => {
      if (moon.mesh) {
        const time = performance.now();
        const moonX = moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
        const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
        const moonZ = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
        moon.mesh.position.set(moonX, moonY, moonZ);
        moon.mesh.rotateY(0.001);
      }
    });
  }

  // Update Jupiter's Moons
  if (jupiter.moons) {
    jupiter.moons.forEach(moon => {
      const time = performance.now();
      const moonX = moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
      const moonZ = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }

  // Update Earth's mini satellites (thiên thạch và vệ tinh)
  if (earthSatellites.length > 0) {
    const time = performance.now();
    earthSatellites.forEach(satellite => {
      satellite.userData.orbitAngle += (satellite.userData.orbitSpeed || 0.001) * settings.accelerationOrbit;
      const angle = satellite.userData.orbitAngle;
      const r = satellite.userData.orbitRadius;
      const tilt = satellite.userData.tilt || 0.3;
      
      // Vị trí theo quỹ đạo
      satellite.position.set(
        r * Math.cos(angle),
        r * Math.sin(angle) * Math.sin(tilt),
        r * Math.sin(angle) * Math.cos(tilt)
      );
      
      // Cho vệ tinh luôn hướng về trái đất
      if (satellite instanceof THREE.Group && satellite.children.length > 2) {
        satellite.lookAt(0, 0, 0);
      }
      
      // Xoay quanh trục riêng hoặc theo hướng chuyển động
      if (satellite.userData.rotationAxis) {
        satellite.rotateOnAxis(satellite.userData.rotationAxis, satellite.userData.rotationSpeed);
      } else {
        satellite.rotation.y += 0.01;
      }
      
      // Hiệu ứng nhấp nháy đèn cho vệ tinh
      if (satellite.userData.blink) {
        satellite.userData.blink.time += satellite.userData.blink.rate;
        if (satellite.userData.blink.time > Math.PI) {
          satellite.userData.blink.time = 0;
        }
        
        satellite.children.forEach(child => {
          if (child.material && child.material.emissive) {
            const intensity = 0.5 + 0.5 * Math.sin(satellite.userData.blink.time);
            child.material.emissiveIntensity = intensity;
          }
        });
      }
    });
  }

  // Update Asteroids
  asteroids.forEach(asteroid => {
    asteroid.rotation.y += 0.0001;
    asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
    asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
  });

  // Raycasting for mouse interactions
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);
  outlinePass.selectedObjects = [];
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject === earth.Atmosphere) {
      outlinePass.selectedObjects = [earth.planet];
    } else if (intersectedObject === venus.Atmosphere) {
      outlinePass.selectedObjects = [venus.planet];
    } else {
      outlinePass.selectedObjects = [intersectedObject];
    }
  }

  // Camera movement for zooming
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

  // Update minimap
  minimap.update();

  // Update controls and render
  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}

// Calls the loadAsteroids function to load and place asteroids from a GLTF file (asteroidPack.glb) into the scene, 
// creating two asteroid belts with different counts and ranges.
// path: Path to the GLTF file (/asteroids/asteroidPack.glb), containing 3D asteroid models.
// count: Number of asteroids (1000 and 3000).
// minDistance, maxDistance: Minimum and maximum distances from the origin (sun at (0, 0, 0)) to place asteroids, forming ring-shaped belts.
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);

// Calls the animate function to start the simulation’s animation loop.
animate();

// Attaches the onMouseMove function to handle mouse movement events in the browser window.
window.addEventListener('mousemove', onMouseMove, false);
// Attaches the onDocumentMouseDown function to handle mouse click events.
window.addEventListener('mousedown', onDocumentMouseDown, false);
// Handles window resize events to update the camera, renderer, and composer to match the new window size.
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth/window.innerHeight;
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