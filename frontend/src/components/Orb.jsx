import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Orb({ active }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Sphere points
    const sphereGeometry = new THREE.SphereGeometry(2.5, 24, 24);
    const originalPositions = sphereGeometry.attributes.position.array.slice();

    const colors = [];
    for (let i = 0; i < sphereGeometry.attributes.position.count; i++) {
      const color = new THREE.Color();
      // Initial hue randomly across indigo → purple → pink → red → cyan
      const hue = 0.65 + Math.random() * 0.25; // 0.65~0.90 approx. for indigo → cyan
      color.setHSL(hue, 0.7, 0.6);
      colors.push(color.r, color.g, color.b);
    }
    sphereGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });

    const points = new THREE.Points(sphereGeometry, pointsMaterial);
    scene.add(points);

    // Glow sphere
    const glowGeometry = new THREE.SphereGeometry(2.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff4d4d"), // subtle red glow
      transparent: true,
      opacity: 0.12,
      wireframe: true,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    let frameId;
    const animate = () => {
      const time = Date.now() * 0.001;

      // Base rotation
      points.rotation.y = time * 0.15;
      points.rotation.x = Math.sin(time * 0.2) * 0.02;
      glow.rotation.y = -time * 0.1;

      // Pulsating scale when listening
      const scale = active ? 1 + Math.sin(time * 2) * 0.05 : 1;
      points.scale.set(scale, scale, scale);
      glow.scale.set(scale * 1.05, scale * 1.05, scale * 1.05);

      // Smooth wavy deformation when listening
      if (active) {
        const positions = sphereGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          positions[i] = ox + Math.sin(time * 2 + oy * 1.5 + oz) * 0.06;
          positions[i + 1] = oy + Math.sin(time * 1.5 + ox * 2) * 0.06;
          positions[i + 2] = oz + Math.sin(time * 3 + ox * 1.5 + oy) * 0.06;
        }
        sphereGeometry.attributes.position.needsUpdate = true;
      }

      // Smooth color cycling across indigo → purple → pink → red → cyan
      const colorsArr = sphereGeometry.attributes.color.array;
      for (let i = 0; i < colorsArr.length; i += 3) {
        const h = (0.65 + ((time * 0.05 + i / colorsArr.length) * 0.25) % 0.25);
        const color = new THREE.Color();
        color.setHSL(h, 0.7, 0.6);
        colorsArr[i] = color.r;
        colorsArr[i + 1] = color.g;
        colorsArr[i + 2] = color.b;
      }
      sphereGeometry.attributes.color.needsUpdate = true;

      // Glow pulsing
      glow.material.opacity = 0.08 + Math.sin(time * 1.5) * 0.03;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [active]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{
        filter: "drop-shadow(0 0 45px rgba(255,77,77,0.8))",
        overflow: "hidden",
      }}
    />
  );
}