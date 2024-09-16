import * as THREE from 'three';
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
camera.position.z = 25;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.035);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0;
bloomPass.strength = 4.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

function getRandomSpherePoint({ radius }) {
    const minRadius = radius * 0.25;
    const maxRadius = radius - minRadius;
    const range = (Math.random() * maxRadius) + minRadius;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos((2 * v) - 1);
    return {
        x: range * Math.sin(phi) * Math.cos(theta),
        y: range * Math.sin(phi) * Math.sin(theta),
        z: range * Math.cos(phi),
    };
}

const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshBasicMaterial({ color: 0x0764f });
const edges = new THREE.EdgesGeometry(geo);

const hemilight = new THREE.HemisphereLight(0xffffff, 0x44444444);
scene.add(hemilight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

function getBox() {
    const box = new THREE.LineSegments(edges, mat);
    return box;
}

const boxGroup = new THREE.Group();
boxGroup.userData.update = (timestamp) => {
    boxGroup.rotation.x = timestamp * 0.0001;
    boxGroup.rotation.y = timestamp * 0.0001;
};
scene.add(boxGroup);

const numBoxes = 1000;
const radius = 45;
for (let i = 0; i < numBoxes; i++) {
    const box = getBox();
    const { x, y, z } = getRandomSpherePoint({ radius });
    box.position.set(x, y, z);
    box.rotation.set(x, y, z);
    boxGroup.add(box);
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    boxGroup.userData.update(timestamp);
    composer.render(scene, camera);
    controls.update();
}

animate();

function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize);
onWindowResize(); // Call once to set initial size
