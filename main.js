// Three.js setup
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
container.appendChild(renderer.domElement);

// Camera position
camera.position.z = 10;

// Create different worlds with unique themes
const worlds = [
    {
        name: "Golden Horizon",
        color: 0xffaa00,
        ambientColor: 0x333333,
        fogDensity: 0.05,
        gradient: "linear-gradient(to bottom, rgba(253, 118, 0, 0.8), rgba(255, 0, 0, 0.7))",
        depthEffect: "radial-gradient(circle at center, rgba(15, 14, 13, 0.64), transparent)",
        particleColor: 0xffff00
    },
    {
        name: "Crimson Sky",
        color: 0xff0000,
        ambientColor: 0x440000,
        fogDensity: 0.06,
        gradient: "linear-gradient(to bottom, rgba(255, 0, 0, 0.8), rgba(139, 0, 0, 0.7))",
        depthEffect: "radial-gradient(circle at center, rgba(255, 0, 0, 0.2), transparent)",
        particleColor: 0xff0000
    },
    {
        name: "Azure Depths",
        color: 0x0000ff,
        ambientColor: 0x000033,
        fogDensity: 0.04,
        gradient: "linear-gradient(to bottom, rgba(0, 0, 255, 0.8), rgba(0, 0, 139, 0.7))",
        depthEffect: "radial-gradient(circle at center, rgba(0, 0, 255, 0.2), transparent)",
        particleColor: 0x0000ff
    },
    {
        name: "Neon Jungle",
        color: 0x00ffff,
        ambientColor: 0x000000,
        fogDensity: 0.07,
        gradient: "linear-gradient(to bottom, rgba(0, 255, 255, 0.8), rgba(0, 139, 139, 0.7))",
        depthEffect: "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)",
        particleColor: 0x00ffff
    }
];

// Current world index
let currentWorldIndex = 0;
let worldTransitionTimer = 0;

// Lights
const ambientLight = new THREE.AmbientLight(worlds[0].ambientColor, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(worlds[0].color, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add point lights for more depth
const pointLights = [];
for (let i = 0; i < 30; i++) {
    const light = new THREE.PointLight(worlds[0].color, 1, 50);
    light.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    );
    scene.add(light);
    pointLights.push(light);
}

// --- NEW CODE: Function to create a single house structure ---
function createHouse() {
    // Create Colorful Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    // Create House Geometries
    const houseBodyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const doorGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
    const windowGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const chimneyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);

    // Create Meshes and Position
    const houseBody = new THREE.Mesh(houseBodyGeometry, bodyMaterial);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);

    // Position the parts
    houseBody.position.y = 0;
    roof.position.y = 1.5;
    door.position.set(0, -0.5, 1.01);
    window1.position.set(-0.5, 0.2, 1.01);
    window2.position.set(0.5, 0.2, 1.01);
    chimney.position.set(0.8, 1.9, -0.5);

    // Group the House Parts
    const houseGroup = new THREE.Group();
    houseGroup.add(houseBody, roof, door, window1, window2, chimney);
    return houseGroup;
}

// Create and place 25 houses randomly
const houses = [];
for (let i = 0; i < 25; i++) {
    const newHouse = createHouse();
    newHouse.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    newHouse.rotation.y = Math.random() * Math.PI;
    scene.add(newHouse);
    houses.push(newHouse);
}
// --- END OF NEW CODE ---


// Create a base structure for the castle
function createCastleLayer(depth, scale, complexity, world) {
    const layer = new THREE.Group();
    
    // Create building blocks with more detailed structures
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const block = new THREE.Group();
            
            // Building base with hollow sections
            const buildingGeometry = new THREE.BoxGeometry(
                2 + Math.random() * 2,
                4 + Math.random() * 4,
                2 + Math.random() * 2
            );
            
            // Create hollow effect
            const innerGeometry = new THREE.BoxGeometry(
                1 + Math.random() * 1.5,
                3 + Math.random() * 3,
                1 + Math.random() * 1.5
            );
            innerGeometry.translate(0, 1.5, 0);
            
            // Combine geometries
            const combinedGeometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                ...buildingGeometry.attributes.position.array,
                ...innerGeometry.attributes.position.array.map(v => -v)
            ]);
            combinedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            
            const buildingMaterial = new THREE.MeshStandardMaterial({
                color: world.color,
                roughness: 0.8,
                metalness: 0.3,
                transparent: false
            });
            
            const building = new THREE.Mesh(combinedGeometry, buildingMaterial);
            building.position.set(
                i * 4 - 8,
                0,
                j * 4 - 8
            );
            block.add(building);
            
            // Add windows with different styles
            const windowCount = Math.floor(Math.random() * 8) + 3;
            for (let w = 0; w < windowCount; w++) {
                const windowGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
                const windowMaterial = new THREE.MeshStandardMaterial({
                    color: world.color,
                    emissive: world.color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.8
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                // Random positions on faces
                const face = Math.floor(Math.random() * 6);
                const x = Math.random() * 2 - 1;
                const y = Math.random() * 3 + 0.5;
                const z = Math.random() * 2 - 1;
                
                // Position based on face
                switch(face) {
                    case 0: // front
                        window.position.set(x, y, z);
                        break;
                    case 1: // back
                        window.position.set(x, y, -z);
                        break;
                    case 2: // left
                        window.position.set(-x, y, z);
                        break;
                    case 3: // right
                        window.position.set(x, y, -z);
                        break;
                    case 4: // top
                        window.position.set(x, y, z);
                        break;
                    case 5: // bottom
                        window.position.set(x, -y, z);
                        break;
                }
                
                block.add(window);
            }
            
            // Add stairs with multiple levels
            if (Math.random() > 0.5 && complexity > 0.5) {
                const stairLevels = Math.floor(Math.random() * 3) + 2;
                for (let s = 0; s < stairLevels; s++) {
                    const stairGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5);
                    const stairMaterial = new THREE.MeshStandardMaterial({
                        color: world.color,
                        roughness: 0.7
                    });
                    
                    const stair = new THREE.Mesh(stairGeometry, stairMaterial);
                    stair.position.set(0, 1 + s * 0.2, 0);
                    block.add(stair);
                }
            }
            
            // Add balconies
            if (Math.random() > 0.6 && complexity > 0.3) {
                const balconyGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.3);
                const balconyMaterial = new THREE.MeshStandardMaterial({
                    color: world.color,
                    roughness: 0.8
                });
                
                const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
                balcony.position.set(0, 2.5, 0);
                block.add(balcony);
                
                // Add railing
                const railingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.1);
                const railingMaterial = new THREE.MeshStandardMaterial({
                    color: world.color,
                    roughness: 0.7
                });
                
                const railing = new THREE.Mesh(railingGeometry, railingMaterial);
                railing.position.set(0, 2.55, 0.15);
                block.add(railing);
            }
            
            // Add decorative elements
            if (Math.random() > 0.7) {
                const decorationGeometry = new THREE.ConeGeometry(0.3, 0.5, 8);
                const decorationMaterial = new THREE.MeshStandardMaterial({
                    color: world.color,
                    emissive: world.color,
                    emissiveIntensity: 0.3
                });
                
                const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
                decoration.position.set(0, 3, 0);
                block.add(decoration);
            }
            
            layer.add(block);
        }
    }
    
    // Scale and position
    layer.scale.set(scale, scale, scale);
    layer.position.y = depth * 10;
    return layer;
}

// Create multiple layers of the castle with increasing complexity
const castleLayers = [];
const totalLayers = 30;
for (let i = 0; i < totalLayers; i++) {
    const layer = createCastleLayer(i, 1 + i * 0.2, 0.3 + i * 0.05, worlds[0]);
    scene.add(layer);
    castleLayers.push(layer);
}

// Add floating platforms and bridges between buildings
function createFloatingBridge(startPos, endPos) {
    const bridge = new THREE.Group();
    
    // Main bridge
    const bridgeGeometry = new THREE.BoxGeometry(
        startPos.distanceTo(endPos),
        0.5,
        0.8
    );
    const bridgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.8,
        metalness: 0.3
    });
    const bridgeMesh = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    
    // Position bridge
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    const midpoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    bridgeMesh.position.copy(midpoint);
    bridgeMesh.lookAt(endPos);
    
    bridge.add(bridgeMesh);
    
    // Add railings
    const railingHeight = 0.3;
    const railingWidth = 0.1;
    const railingLength = startPos.distanceTo(endPos);
    
    // Left railing
    const leftRailingGeometry = new THREE.BoxGeometry(railingLength, railingHeight, railingWidth);
    const leftRailingMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7
    });
    const leftRailing = new THREE.Mesh(leftRailingGeometry, leftRailingMaterial);
    leftRailing.position.copy(bridgeMesh.position);
    leftRailing.position.x -= 0.4;
    leftRailing.lookAt(endPos);
    bridge.add(leftRailing);
    
    // Right railing
    const rightRailing = leftRailing.clone();
    rightRailing.position.x += 0.8;
    bridge.add(rightRailing);
    
    return bridge;
}

// Create some bridges between buildings
for (let i = 0; i < 16; i++) {
    const startBuilding = castleLayers[Math.floor(Math.random() * 10)].children[
        Math.floor(Math.random() * 25)
    ];
    const endBuilding = castleLayers[Math.floor(Math.random() * 10)].children[
        Math.floor(Math.random() * 25)
    ];
    
    if (startBuilding && endBuilding) {
        const startPos = new THREE.Vector3().copy(startBuilding.position);
        const endPos = new THREE.Vector3().copy(endBuilding.position);
        
        // Adjust positions to make bridges more interesting
        startPos.y += Math.random() * 2;
        endPos.y += Math.random() * 2;
        
        const bridge = createFloatingBridge(startPos, endPos);
        scene.add(bridge);
    }
}

// Add depth effects with fog
scene.fog = new THREE.FogExp2(0x000000, worlds[0].fogDensity);

// Add particle systems for floating dust and debris
function createParticleSystem() {
    const particles = new THREE.Group();
    
    for (let i = 0; i < 400; i++) {
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: worlds[0].particleColor,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        
        // Add velocity
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        // Add glow
        particle.userData.glow = Math.random() * 0.5 + 0.5;
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate particles
    setInterval(() => {
        particles.children.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            
            // Bounce off boundaries
            if (particle.position.x > 10 || particle.position.x < -10) {
                particle.userData.velocity.x *= -0.5;
            }
            if (particle.position.y > 10 || particle.position.y < -10) {
                particle.userData.velocity.y *= -0.5;
            }
            if (particle.position.z > 10 || particle.position.z < -10) {
                particle.userData.velocity.z *= -0.5;
            }
            
            // Gradually fade out
            if (particle.userData.glow > 0.1) {
                particle.userData.glow -= 0.001;
            } else {
                particle.userData.glow = 0.5;
            }
        });
    }, 50);
}

createParticleSystem();

// Add floating lanterns with more detail
function addDecorativeElements() {
    // Add floating lanterns with glow
    for (let i = 0; i < 60; i++) {
        const lanternGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const lanternMaterial = new THREE.MeshStandardMaterial({
            color: worlds[0].color,
            emissive: worlds[0].color,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        
        const lantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
        lantern.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
        );
        lantern.userData.floatSpeed = Math.random() * 0.01 + 0.005;
        scene.add(lantern);
        
        // Add small glow around lantern
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: worlds[0].color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(lantern.position);
        scene.add(glow);
    }
}

addDecorativeElements();

// Add depth effect overlay
const depthEffect = document.querySelector('.depth-effect');

// World transition element
const worldTransition = document.querySelector('.world-transition');

// Animation variables
let scrollPosition = 0;
let lastScrollY = window.scrollY;
let isScrolling = false;

// Handle scroll
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollPosition = currentScrollY;
    
    // Update camera position based on scroll to create a "falling" effect
    camera.position.z = 10 + scrollPosition * 0.01;
    camera.position.y = -scrollPosition * 0.005; // Negative value to move down
    
    // Add a slight side-to-side and rotation effect to simulate exploration
    camera.position.x = Math.sin(scrollPosition * 0.001) * 2;
    camera.rotation.y = Math.sin(scrollPosition * 0.0005) * 0.05;
    
    // Check if we need to change worlds
    const sectionHeight = window.innerHeight;
    const sectionIndex = Math.floor(scrollPosition / sectionHeight);
    
    if (sectionIndex !== currentWorldIndex) {
        // Transition to new world
        currentWorldIndex = sectionIndex;
        if (worlds[currentWorldIndex]) {
            transitionToWorld(worlds[currentWorldIndex]);
        }
    }
    
    lastScrollY = currentScrollY;
    
    // Update depth effect
    depthEffect.style.opacity = 0.2 + scrollPosition * 0.00005;
});

// Function to transition to a new world
function transitionToWorld(world) {
    // Update colors
    ambientLight.color.setHex(world.ambientColor);
    directionalLight.color.setHex(world.color);
    
    // Update point lights
    pointLights.forEach(light => {
        light.color.setHex(world.color);
    });
    
    // Update fog
    scene.fog.color.setHex(world.color);
    scene.fog.density = world.fogDensity;
    
    // Update depth effect
    depthEffect.style.background = world.depthEffect;
    
    // Update world transition effect
    worldTransition.style.opacity = 1;
    setTimeout(() => {
        worldTransition.style.opacity = 0;
    }, 500);
    
    // Update particle system
    scene.children.forEach(child => {
        if (child.type === 'Group' && child.name === 'particles') {
            child.children.forEach(particle => {
                particle.material.color.setHex(world.particleColor);
            });
        }
    });
    
    // Update lanterns
    scene.children.forEach(child => {
        if (child.type === 'Mesh' && child.material.emissive) {
            child.material.color.setHex(world.color);
            child.material.emissive.setHex(world.color);
        }
    });
    
    // Update all building materials
    castleLayers.forEach(layer => {
        layer.children.forEach(block => {
            block.children.forEach(mesh => {
                if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.color.setHex(world.color);
                    mesh.material.emissive.setHex(world.color);
                }
            });
        });
    });
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the entire scene slightly
    scene.rotation.y += 0.001;
    
    // Update lights
    directionalLight.position.x = Math.sin(Date.now() * 0.001) * 10;
    directionalLight.position.z = Math.cos(Date.now() * 0.001) * 10;
    
    // Update point lights
    pointLights.forEach((light, index) => {
        light.position.x = Math.sin(Date.now() * 0.001 + index) * 15;
        light.position.y = Math.cos(Date.now() * 0.001 + index) * 15;
        light.position.z = Math.sin(Date.now() * 0.001 + index * 2) * 15;
    });

    // Animate each of the new houses
    houses.forEach(house => {
        house.rotation.y += 0.005;
    });
    
    // Render
    renderer.render(scene, camera);
}
animate();

// Add some visual effects when scrolling
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Create floating elements that appear during scroll
    if (scrollTop > 200 && scrollTop % 500 < 100) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.style.width = '20px';
        element.style.height = '20px';
        element.style.background = `rgba(${worlds[currentWorldIndex].color >> 16}, ${(worlds[currentWorldIndex].color >> 8) & 255}, ${worlds[currentWorldIndex].color & 255}, 0.8)`;
        element.style.borderRadius = '50%';
        element.style.position = 'absolute';
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = '0';
        element.style.transform = 'translateY(0)';
        element.style.opacity = '0';
        
        document.body.appendChild(element);
        
        // Animate floating element
        setTimeout(() => {
            element.style.transition = 'all 2s ease-out';
            element.style.transform = 'translateY(100vh)';
            element.style.opacity = '0';
        }, 100);
        
        // Remove element after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 2000);
    }
});