import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

// Main React component for the 3D structure
const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Set up renderer to fit the window and append to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000); // Set background to black
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    camera.position.set(0, 40, 110); // Adjusted camera for the 3x3 grid

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Materials ---
    const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 });
    
    // Line material for the connecting wires
    const lineMaterial = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.001,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });

    // --- Structure Parameters ---
    const gridSize = 25;
    const spacing = 1.2;
    const maxRodHeight = 8;
    const levelSpacing = 16;
    const rodRadius = 0.5;

    // Function to create a single level of the structure
    const createLevel = (yPosition) => {
      const levelGroup = new THREE.Group();
      levelGroup.position.y = yPosition;

      const halfSize = gridSize / 2;
      const totalWidth = spacing * gridSize;

      // Create the floor
      const floorGeometry = new THREE.BoxGeometry(totalWidth, 0.5, totalWidth);
      const floorMesh = new THREE.Mesh(floorGeometry, wireframeMaterial);
      floorMesh.position.y = maxRodHeight / 2;
      levelGroup.add(floorMesh);

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x_raw = (i - halfSize) * spacing;
          const z_raw = (j - halfSize) * spacing;
          
          const curveFactor = 1.0;
          const distToEdgeX = Math.min(Math.abs(i), Math.abs(gridSize - 1 - i));
          const distToEdgeZ = Math.min(Math.abs(j), Math.abs(gridSize - 1 - j));
          
          const x = x_raw + curveFactor * Math.cos((j / (gridSize - 1) - 0.5) * Math.PI) * (distToEdgeX < 3 ? 1 : 0);
          const z = z_raw + curveFactor * Math.cos((i / (gridSize - 1) - 0.5) * Math.PI) * (distToEdgeZ < 3 ? 1 : 0);
          
          const rodGeometry = new THREE.CylinderGeometry(rodRadius, rodRadius, maxRodHeight, 8);
          const rod = new THREE.Mesh(rodGeometry, wireframeMaterial);
          rod.position.set(x, maxRodHeight / 2, z);
          
          levelGroup.add(rod);
        }
      }
      return levelGroup;
    };

    // Function to create the continuous central and corner pillars
    const createPillars = (numLevels) => {
      const pillarsGroup = new THREE.Group();
      const positions = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(gridSize * spacing / 2, 0, gridSize * spacing / 2),
        new THREE.Vector3(-gridSize * spacing / 2, 0, gridSize * spacing / 2),
        new THREE.Vector3(gridSize * spacing / 2, 0, -gridSize * spacing / 2),
        new THREE.Vector3(-gridSize * spacing / 2, 0, -gridSize * spacing / 2),
      ];
      
      const cornerPillarHeight = levelSpacing * numLevels + 0.5;
      const centralPillarHeight = cornerPillarHeight + 10;
      const heights = [centralPillarHeight, cornerPillarHeight, cornerPillarHeight, cornerPillarHeight, cornerPillarHeight];
      const radii = [1.5, 1, 1, 1, 1];
      
      for(let i = 0; i < positions.length; i++) {
        const p1 = positions[i];
        const h1 = heights[i];
        const r1 = radii[i];
        
        const pillarGeometry = new THREE.CylinderGeometry(r1, r1, h1, 8);
        const pillar = new THREE.Mesh(pillarGeometry, wireframeMaterial);
        pillar.position.set(p1.x, h1 / 2, p1.z);
        pillarsGroup.add(pillar);
      }
      return pillarsGroup;
    };
    
    // Function to create a conical hut roof
    const createConicalRoof = (numLevels) => {
      const roofHeight = 15;
      const roofRadius = (gridSize * spacing) / 2 + 5;
      const radialSegments = 64; 
      const heightSegments = 32;
      const roofGeometry = new THREE.ConeGeometry(roofRadius, roofHeight, radialSegments, heightSegments);
      const roof = new THREE.Mesh(roofGeometry, wireframeMaterial);
      const roofYPosition = levelSpacing * numLevels + maxRodHeight + 10;
      roof.position.y = roofYPosition - levelSpacing + 5; // Adjusted to sit on top of the last floor
      return roof;
    };

    // Function to create a complete building
    const createBuilding = (numLevels) => {
      const buildingGroup = new THREE.Group();
      
      for (let i = 0; i < numLevels; i++) {
        const level = createLevel(i * levelSpacing);
        buildingGroup.add(level);
      }

      const pillars = createPillars(numLevels);
      buildingGroup.add(pillars);
      
      const roof = createConicalRoof(numLevels);
      buildingGroup.add(roof);

      return buildingGroup;
    };

    // --- Build the 3x3 grid of structures ---
    // Left, Middle, Right row
    const building1 = createBuilding(3);
    building1.position.x = -40;
    scene.add(building1);

    const building2 = createBuilding(4); // Remains at 4 stories
    building2.position.x = 0;
    scene.add(building2);

    const building3 = createBuilding(3);
    building3.position.x = 40;
    scene.add(building3);

    // Front row
    const building4 = createBuilding(3);
    building4.position.x = -40;
    building4.position.z = -40;
    scene.add(building4);

    const building5 = createBuilding(3);
    building5.position.x = 0;
    building5.position.z = -40;
    scene.add(building5);

    const building6 = createBuilding(3);
    building6.position.x = 40;
    building6.position.z = -40;
    scene.add(building6);
    
    // Back row
    const building7 = createBuilding(3);
    building7.position.x = -40;
    building7.position.z = 40;
    scene.add(building7);
    
    const building8 = createBuilding(3);
    building8.position.x = 0;
    building8.position.z = 40;
    scene.add(building8);

    const building9 = createBuilding(3);
    building9.position.x = 40;
    building9.position.z = 40;
    scene.add(building9);

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // --- Handle Window Resizing ---
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    animate();

    // Clean up on component unmount
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div 
        ref={mountRef} 
        className="w-full h-full" 
      />
    </div>
  );
};

export default App;