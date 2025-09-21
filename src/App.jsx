import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

// Load Tailwind CSS from CDN for styling
const tailwindScript = document.createElement('script');
tailwindScript.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindScript);

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    // Adjusted camera position for a better view of the entire grid
    camera.position.set(70, 70, 70);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Line material for wireframe parts
    const wireframeMaterial = new LineMaterial({
        color: 0x000000,
        linewidth: 2,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });

    // Materials for colored parts
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 }); // Dark brown
    const pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x78281F }); // Redder brown
    const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Saddle brown / wood color

    // Function to create a single structure with a variable number of stories
    const createSingleStructure = (numStories) => {
      const group = new THREE.Group();
      const points = [];
      const numSegments = 32;

      // Helper function to create a rectangular prism wireframe
      const createBoxWireframe = (width, height, depth, yOffset) => {
          const w = width / 2;
          const h = height / 2;
          const d = depth / 2;
          const y = yOffset + h;

          // Vertices
          const vertices = [
              // Bottom rectangle
              -w, y - h, -d,  w, y - h, -d,
               w, y - h, -d,  w, y - h,  d,
               w, y - h,  d, -w, y - h,  d,
              -w, y - h,  d, -w, y - h, -d,

              // Top rectangle
              -w, y + h, -d,  w, y + h, -d,
               w, y + h, -d,  w, y + h,  d,
               w, y + h,  d, -w, y + h,  d,
              -w, y + h,  d, -w, y + h, -d,

              // Vertical lines
              -w, y - h, -d, -w, y + h, -d,
               w, y - h, -d,  w, y + h, -d,
               w, y - h,  d,  w, y + h,  d,
              -w, y - h,  d, -w, y + h,  d,
          ];
          points.push(...vertices);
      };

      // Create colored base (solid)
      const base = new THREE.Mesh(new THREE.BoxGeometry(25, 2, 25), baseMaterial);
      base.position.y = 1;
      group.add(base);

      const levelSpacing = 12;
      const pillarHeight = 1 + (numStories * levelSpacing) + 1; // 1 for base, 1 for top plate
      
      // Create solid circular pillars
      const pillarPositions = [
        new THREE.Vector3(-10, 1, -10), new THREE.Vector3(10, 1, -10),
        new THREE.Vector3(-10, 1, 10), new THREE.Vector3(10, 1, 10),
      ];
      
      pillarPositions.forEach(pos => {
          const pillarGeometry = new THREE.CylinderGeometry(0.75, 0.75, pillarHeight, numSegments);
          const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
          pillar.position.set(pos.x, 1 + pillarHeight / 2, pos.z);
          group.add(pillar);
      });

      // Create separate floors as solid cubes
      for (let i = 1; i <= numStories; i++) {
        // Floor plate as a solid box
        const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 20), baseMaterial);
        floor.position.y = 1 + i * levelSpacing + 0.25;
        group.add(floor);
      }

      // Create top plate (wireframe)
      createBoxWireframe(20, 0.5, 20, 1 + numStories * levelSpacing + 1);

      // Create colored roof (solid)
      const roof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 30), roofMaterial);
      roof.position.y = 1 + numStories * levelSpacing + 1.5;
      group.add(roof);

      // Add all wireframe parts to the group
      const geometry = new LineSegmentsGeometry().setPositions(new Float32Array(points));
      const line = new LineSegments2(geometry, wireframeMaterial);
      group.add(line);

      return group;
    };

    // Create a grid of 9 structures with different heights
    const createGrid = () => {
      const gridGroup = new THREE.Group();
      const spacing = 35;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          let numStories = 3;
          // Central structure (i=1, j=1) is 4 stories
          if (i === 1 && j === 1) {
            numStories = 4;
          } 
          // Corner structures (i=0,j=0; i=0,j=2; i=2,j=0; i=2,j=2) are 2 stories
          else if ((i === 0 && j === 0) || (i === 0 && j === 2) || (i === 2 && j === 0) || (i === 2 && j === 2)) {
            numStories = 2;
          }
          // The rest are 3 stories by default
          
          const structure = createSingleStructure(numStories);
          structure.position.x = (i - 1) * spacing;
          structure.position.z = (j - 1) * spacing;
          gridGroup.add(structure);
        }
      }
      return gridGroup;
    };

    scene.add(createGrid());

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Handle window resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      wireframeMaterial.resolution.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-neutral-900 p-4">
      <h1 className="text-3xl font-bold mb-4">Four-Story Wireframe Structure</h1>
      <p className="text-sm text-neutral-600 mb-6">Use your mouse to drag and rotate the model!</p>
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg" 
      />
    </div>
  );
};

export default App;