import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Doma = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // Add multiple light sources for better illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30); // Adjusted camera position for a closer view

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    mountRef.current.appendChild(renderer.domElement);

    // Function to create a single house story with its bottom at y=0
    const createHouse = (wallColor = 0xD2B48C, door = true, windows = true) => {
      // Vertices for the house geometry
      const vertices = new Float32Array([
        // Base (bottom rectangle) - Y from 0.0
        -1.0, 0.0, 1.0, // 0
        1.0, 0.0, 1.0, // 1
        1.0, 0.0, -1.0, // 2
        -1.0, 0.0, -1.0, // 3
        // Top of the walls - Y up to 1.0
        -1.0, 1.0, 1.0, // 4
        1.0, 1.0, 1.0, // 5
        1.0, 1.0, -1.0, // 6
        -1.0, 1.0, -1.0, // 7
        // Roof peak - Y up to 1.5
        0.0, 1.5, 1.0, // 8
        0.0, 1.5, -1.0, // 9
      ]);

      const houseGroup = new THREE.Group();

      // --- Solid Walls and Base ---
      const wallsMeshGeometry = new THREE.BufferGeometry();
      const wallsIndices = new Uint16Array([
        // Front wall
        0, 4, 5,
        0, 5, 1,
        // Back wall
        3, 7, 6,
        3, 6, 2,
        // Right wall
        1, 5, 6,
        1, 6, 2,
        // Left wall
        3, 7, 4,
        3, 4, 0,
        // Bottom face
        0, 2, 1,
        0, 3, 2,
      ]);
      wallsMeshGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      wallsMeshGeometry.setIndex(new THREE.BufferAttribute(wallsIndices, 1));
      wallsMeshGeometry.computeVertexNormals();

      const wallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor, side: THREE.DoubleSide });
      const wallsMesh = new THREE.Mesh(wallsMeshGeometry, wallsMaterial);
      houseGroup.add(wallsMesh);

      // --- Solid Roof ---
      const roofMeshGeometry = new THREE.BufferGeometry();
      const roofIndices = new Uint16Array([
        // Front face
        4, 8, 5,
        // Back face
        7, 9, 6,
        // Left slope (2 triangles)
        4, 8, 7,
        8, 9, 7,
        // Right slope (2 triangles)
        5, 8, 6,
        8, 9, 6,
      ]);
      roofMeshGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      roofMeshGeometry.setIndex(new THREE.BufferAttribute(roofIndices, 1));
      roofMeshGeometry.computeVertexNormals();

      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, side: THREE.DoubleSide }); // Wooden brown color for roof
      const roofMesh = new THREE.Mesh(roofMeshGeometry, roofMaterial);
      houseGroup.add(roofMesh);

      // --- Wireframe (Line Segments) ---
      const houseLineGeometry = new THREE.BufferGeometry();
      const lineIndices = new Uint16Array([
        // Base edges
        0, 1, 1, 2, 2, 3, 3, 0,
        // Vertical edges
        0, 4, 1, 5, 2, 6, 3, 7,
        // Top edges
        4, 5, 5, 6, 6, 7, 7, 4,
        // Roof edges
        4, 8, 5, 8, 6, 9, 7, 9,
        8, 9,
      ]);
      houseLineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      houseLineGeometry.setIndex(new THREE.BufferAttribute(lineIndices, 1));

      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black lines
      const lineSegments = new THREE.LineSegments(houseLineGeometry, lineMaterial);
      houseGroup.add(lineSegments);

      // Doors and windows
      if (door) {
        const doorGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.05);
        const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x3d2719 });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.position.set(0, 0.4, 1.0);
        houseGroup.add(doorMesh);
      }

      if (windows) {
        const windowGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.8 });
        
        // Window on the left side
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-1.0, 0.5, 0);
        window1.rotation.y = Math.PI / 2;
        houseGroup.add(window1);

        // Window on the right side
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(1.0, 0.5, 0);
        window2.rotation.y = Math.PI / 2;
        houseGroup.add(window2);
        
        // Window on the back side
        const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
        window3.position.set(0, 0.5, -1.0);
        houseGroup.add(window3);
      }

      return { houseGroup, geometries: [wallsMeshGeometry, roofMeshGeometry, houseLineGeometry], materials: [wallsMaterial, roofMaterial, lineMaterial] };
    };

    // Create the three stories with different scales and rotations
    const stories = [];
    const baseHeight = 1.5;
    let currentYPosition = 0;

    // Bottom story (largest)
    const bottomScale = 8;
    const bottomStory = createHouse(0xD2B48C, true, true);
    bottomStory.houseGroup.scale.set(bottomScale, bottomScale / 2, bottomScale); // Reduce wall height by half
    bottomStory.houseGroup.position.y = currentYPosition;
    bottomStory.houseGroup.rotation.y = Math.PI / 2;
    scene.add(bottomStory.houseGroup);
    stories.push(bottomStory);
    currentYPosition += baseHeight * (bottomScale / 2);

    // Middle story (2x size)
    const middleScale = 4;
    const middleStory = createHouse(0xD2B48C, true, true);
    middleStory.houseGroup.scale.set(middleScale, middleScale, middleScale);
    middleStory.houseGroup.position.y = currentYPosition;
    middleStory.houseGroup.rotation.y = Math.PI / 4;
    scene.add(middleStory.houseGroup);
    stories.push(middleStory);
    currentYPosition += baseHeight * middleScale;

    // Top story (smallest)
    const topScale = 2;
    const topStory = createHouse(0xD2B48C, true, true);
    topStory.houseGroup.scale.set(topScale, topScale, topScale);
    topStory.houseGroup.position.y = currentYPosition;
    topStory.houseGroup.rotation.y = Math.PI / 8;
    scene.add(topStory.houseGroup);
    stories.push(topStory);
    currentYPosition += baseHeight * topScale;


    // Additional houses at diagonal corners
    const diagonalHouseScale = 2;
    const diagonalHouse1 = createHouse(0xD2B48C, true, true);
    diagonalHouse1.houseGroup.scale.set(diagonalHouseScale, diagonalHouseScale, diagonalHouseScale);
    diagonalHouse1.houseGroup.position.set(bottomScale * 1.5, 0, bottomScale * 1.5);
    scene.add(diagonalHouse1.houseGroup);
    stories.push(diagonalHouse1);

    const diagonalHouse2 = createHouse(0xD2B48C, true, true);
    diagonalHouse2.houseGroup.scale.set(diagonalHouseScale, diagonalHouseScale, diagonalHouseScale);
    diagonalHouse2.houseGroup.position.set(bottomScale * -1.5, 0, bottomScale * -1.5);
    scene.add(diagonalHouse2.houseGroup);
    stories.push(diagonalHouse2);

    // Add OrbitControls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, currentYPosition / 2, 0);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Proper disposal of all Three.js objects
      stories.forEach(story => {
        story.geometries.forEach(geo => geo.dispose());
        story.materials.forEach(mat => mat.dispose());
        scene.remove(story.houseGroup);
      });
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 left-4 text-xl font-bold font-inter text-white">
        3D House Model
      </div>
      <div ref={mountRef} className="w-full h-full max-w-4xl max-h-4xl rounded-xl shadow-2xl overflow-hidden"></div>
      <div className="absolute bottom-4 text-sm text-gray-400 font-inter">
        Use your mouse to orbit, pan, and zoom.
      </div>
    </div>
  );
};

export default Doma;