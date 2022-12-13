//External Libraries
import * as THREE from "/modules/three.module.js";
import Stats from "/modules/stats.module.js";
//Internal Libraries
import { NoClipControls } from "/utils/NoClipControls.js";
import { Crosshair } from "/utils/Crosshair.js";
import { ProjectileGenerator } from "/utils/ProjectileGenerator.js";
import { DelaunayGenerator } from "/utils/DelaunayGenerator.js";
import { Targets } from "/utils/Targets.js";
import { Holes } from "/utils/Holes.js";
import { Octree } from "/modules/Octree.js";

//THREE JS
let camera, scene, renderer, stats;
//Required for NOCLIPCONTROLS
let prevTime = performance.now();

let controls, crosshair, projectileGenerator, delaunayGenerator, targets, holes;

//Octree Terrain
let worldOctree;
let octreeObjects = new THREE.Group();
let frameIndex = 0;

let walls = [];

init();
animate();

function init() {
  //##############################################################################
  //THREE JS BOILERPLATE
  //##############################################################################
  let createScene = function () {
    scene = new THREE.Scene();
    var loader = new THREE.TextureLoader(),
      texture = loader.load("/static/nightsky2.jpg");
    scene.background = texture;
    // scene.fog = new THREE.Fog(0xffffff, 100, 750);
  };
  createScene();

  let createLights = function () {
    // LIGHTS
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
  };
  createLights();

  let createStats = function () {
    stats = new Stats();
    container.appendChild(stats.dom);
  };
  createStats();

  let createRenderer = function () {
    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  };
  createRenderer();

  let createCamera = function () {
    //Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.y = 30;
    camera.position.z = 150;
    camera.position.x = 10;
  };
  createCamera();

  let createPlane = function () {
    let mat = new THREE.MeshPhongMaterial({
      wireframe: false,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      color: new THREE.Color(0x6a7699),
      opacity: 0.2,
    });
    let geo = new THREE.PlaneBufferGeometry(600, 600);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = 0;
    mesh.position.y = -15;
    mesh.position.z = 0;
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
  };
  createPlane();

  let createStars = function () {
    let M = 28;
    let N = 28;
    let vertices = [];
    for (let x = -M; x <= M; x += 1) {
      for (let z = -N; z <= N; z += 1) {
        // vertices.push(x / scaler, 0 / scaler, z / scaler)
        vertices.push(
          THREE.MathUtils.randFloatSpread(2000),
          THREE.MathUtils.randFloatSpread(2000),
          THREE.MathUtils.randFloatSpread(2000)
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    let material = new THREE.PointsMaterial({
      size: 0.7,
      sizeAttenuation: true,
      alphaTest: 0.2,
      transparent: true,
    });
    material.color.setHSL(0.6, 0.8, 0.9);
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
  };
  createStars();

  let createWall = function (_x, _y, _z) {
    let geo = new THREE.BoxBufferGeometry(10, 10, 10);
    let mat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      wireframe: false,
    });
    let mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = _x || 60;
    mesh.position.y = _y || 25;
    mesh.position.z = _z || 0;

    walls.push(mesh);
    scene.add(mesh);
  };
  for (let i = 0; i < 10; i++) {
    createWall(Math.random() * 100, Math.random() * 100, Math.random() * 100);
  }

  //NO CLIP CONTROLS
  controls = new NoClipControls(window, camera, document);
  //Crosshair
  crosshair = new Crosshair(scene, camera);

  delaunayGenerator = new DelaunayGenerator(scene);
  delaunayGenerator.createPoints();
  delaunayGenerator.calculate();
  worldOctree = new Octree();
  let terrain = scene
    .getObjectByProperty("uuid", delaunayGenerator.lastUUIDMesh_Texture)
    .clone();
  octreeObjects.add(terrain);

  for (let i = 0; i < walls.length; i++) {
    octreeObjects.add(walls[i].clone());
  }

  worldOctree.fromGraphNode(octreeObjects);

  //Targets
  targets = new Targets(scene, camera, worldOctree);

  //Projectile Handler
  projectileGenerator = new ProjectileGenerator(
    scene,
    camera,
    window,
    worldOctree,
    targets.targets
  );

  //Crosshair
  holes = new Holes(scene, camera, targets.targets);

  //Initializing with DOM
  // const score = document.getElementById("score");
  // score.innerHTML = `Score: ${crosshair}`;
}

//##############################################################################
//ANIMATE
//##############################################################################
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  //
  controls.update(time, prevTime);

  worldOctree = new Octree();
  //
  crosshair.update();
  projectileGenerator.update();
  targets.update();

  holes.update();

  renderer.render(scene, camera);
  stats.update();

  //Frame Shut Down
  prevTime = time;
}
