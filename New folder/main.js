// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set the scene background to black
scene.background = new THREE.Color(0x000000);

// Set camera position
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// Add controls to move the camera with the mouse
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// --- Parameters for the grid ---
const gridSize = 20; // Number of boxes along one side of the grid
const boxSpacing = 1.2; // Spacing between boxes

// Use a simple material that doesn't require lighting
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

// Loop to create the grid of boxes
for (let x = -gridSize / 2; x < gridSize / 2; x++) {
    for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        // Calculate the distance from the center of the grid (0, 0, 0)
        const distance = Math.sqrt(x * x + z * z);
        
        // Use a mathematical function to determine the height based on distance
        // This creates the "wave" effect.
        const maxHeight = 10;
        const height = maxHeight * Math.cos(distance * 0.4) + maxHeight * 0.5;
        
        // Create the box geometry and mesh
        const boxGeometry = new THREE.BoxGeometry(1, height, 1);
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Position the box
        box.position.x = x * boxSpacing;
        box.position.z = z * boxSpacing;
        box.position.y = height / 2; // Position the box so it sits on the ground
        
        // Add the box to the scene
        scene.add(box);
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Update the camera controls
    controls.update();
    
    // Render the scene
    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});