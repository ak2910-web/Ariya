'use client';

import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect, useState } from 'react';

// Custom Shader Material for Energy Orb
const EnergyOrbMaterial = shaderMaterial(
  {
    time: 0,
    intensity: 0, // For voice sync
    colorA: new THREE.Color('#8b5cf6'), // Purple
    colorB: new THREE.Color('#3b82f6'), // Blue
  },
  // Vertex Shader: Displaces vertices with noise
  `
    uniform float time;
    uniform float intensity;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec3 vColor;
    varying float vNoise;

    // Multi-octave 3D noise for organic water-like movement
    float noise(vec3 p) {
      return sin(p.x * 2.0 + time * 0.5) * cos(p.y * 2.0 + time * 0.3) + 
             sin(p.z * 2.0 + time * 0.4) * 0.5 +
             sin(p.x * 4.0 + time) * 0.25;
    }

    void main() {
      vec3 pos = position;
      
      // Multi-layer displacement for watery effect
      float n1 = noise(pos * 1.0 + time * 0.3);
      float n2 = noise(pos * 2.0 + time * 0.5);
      float n3 = noise(pos * 4.0 + time * 0.7);
      
      // Combine noise layers for organic droplet shape
      float displacement = (n1 * 0.15 + n2 * 0.08 + n3 * 0.04) * (1.0 + intensity * 0.5);
      
      pos += normal * displacement;
      vNoise = n1;
      vColor = mix(colorA, colorB, (n1 + 1.0) * 0.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.5;
    }
  `,
  // Fragment Shader: Colors the points
  `
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec3 vColor;
    varying float vNoise;

    void main() {
      float alpha = 1.0 - length(gl_PointCoord - 0.5) * 2.0; // Circular fade
      gl_FragColor = vec4(vColor, alpha * 0.8);
    }
  `
);

// Register the material with three.js
extend({ EnergyOrbMaterial });

function OrbPoints() {
  const ref = useRef<THREE.Points>(null!);
  const materialRef = useRef<any>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.time = t;
      materialRef.current.intensity = Math.sin(t * 0.5) * 0.5 + 0.5; // Smooth pulsing
    }
    if (ref.current) {
      ref.current.rotation.y += 0.003;
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.1; // Gentle tilt
    }
  });

  return (
    <points ref={ref}>
      <sphereGeometry args={[1, 128, 128]} />
      <primitive
        object={new (EnergyOrbMaterial as any)()}
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ShaderOrb() {
  return (
    <div className="flex items-center justify-center" style={{ width: '500px', height: '500px' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.4} />
        <OrbPoints />
      </Canvas>
    </div>
  );
}
