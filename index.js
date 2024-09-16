import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
camera.position.z = 50;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.035);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0;
bloomPass.strength = 15.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const light = new THREE.PointLight(0xff06500, 1, 100);
light.position.set(50, 50, 50);

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
const mat = new THREE.MeshBasicMaterial({
    color: 0x0764f,
    blending: THREE.AdditiveBlending,  // Use additive blending to create a glow effect
    transparent: true,
    opacity: 0.7,
    emissive: 0x0764f,  // Set emissive color for glow effect
    emissiveIntensity: 2, // Increase intensity to make the glow stronger
});
const edges = new THREE.EdgesGeometry(geo);

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
