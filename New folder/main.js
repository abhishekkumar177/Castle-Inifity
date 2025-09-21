// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set a background color for a better contrast, easier to see if objects are rendered
scene.background = new THREE.Color(0x333333);

// --- Materials for the layered, glowing house ---
const warmModuleMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    emissive: 0xEE6600,
    emissiveIntensity: 0.8,
});

const coolModuleMaterial = new THREE.MeshStandardMaterial({
    color: 0x36454F,
    emissive: 0x00BFFF,
    emissiveIntensity: 0.6,
});

const structureMaterial = new THREE.MeshStandardMaterial({
    color: 0x332211,
});

// --- Create House Modules and Structure ---
const houseGroup = new THREE.Group();

const module1_geo = new THREE.BoxGeometry(3, 1, 3);
const module1 = new THREE.Mesh(module1_geo, warmModuleMaterial);
module1.position.set(0, 3.5, 0);
houseGroup.add(module1);

const module2_geo = new THREE.BoxGeometry(2.8, 1.5, 2.8);
const module2 = new THREE.Mesh(module2_geo, warmModuleMaterial);
module2.position.set(0, 2, 0);
houseGroup.add(module2);

const module3_geo = new THREE.BoxGeometry(2.5, 1.2, 2.5);
const module3 = new THREE.Mesh(module3_geo, coolModuleMaterial);
module3.position.set(0.5, 0.5, 0.5);
houseGroup.add(module3);

const module4_geo = new THREE.BoxGeometry(2.2, 1, 2.2);
const module4 = new THREE.Mesh(module4_geo, coolModuleMaterial);
module4.position.set(-0.5, -0.8, -0.5);
houseGroup.add(module4);

scene.add(houseGroup);

// --- Add Lights ---
// Ambient light to ensure all parts of the scene are at least partially illuminated
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// A HemisphereLight provides a nice gradient from sky to ground
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
scene.add(hemisphereLight);

// Directional light for shadows and highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5).normalize();
scene.add(directionalLight);

// --- Position Camera ---
camera.position.z = 10;
camera.position.y = 2;
camera.lookAt(new THREE.Vector3(0, 0, 0));

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    houseGroup.rotation.y += 0.005;

    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});