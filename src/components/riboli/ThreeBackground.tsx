import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1f30, 0.055);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Particles (layered depth) ----
    const particleCount = 1100;
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x9ec7de,
      size: 0.04,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeom, pMat);
    scene.add(points);

    // ---- Wave-displaced wireframe grid (ocean surface) ----
    const gridGeom = new THREE.PlaneGeometry(50, 50, 60, 60);
    const basePositions = gridGeom.attributes.position.array.slice() as Float32Array;
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x2b6a94,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const grid = new THREE.Mesh(gridGeom, gridMat);
    grid.rotation.x = -Math.PI / 2.15;
    grid.position.y = -5.5;
    scene.add(grid);

    // Upper accent grid
    const grid2Geom = new THREE.PlaneGeometry(50, 50, 30, 30);
    const grid2 = new THREE.Mesh(
      grid2Geom,
      new THREE.MeshBasicMaterial({
        color: 0xe63946,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
      }),
    );
    grid2.rotation.x = Math.PI / 2.15;
    grid2.position.y = 6;
    scene.add(grid2);

    // ---- Smooth pointer tracking (normalized, lerped) ----
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const posAttr = gridGeom.attributes.position as THREE.BufferAttribute;

    const animate = () => {
      const t = clock.getElapsedTime();

      // Gentle, drifting particle motion
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.08) * 0.06;
      pMat.size = 0.038 + Math.sin(t * 0.6) * 0.004;

      // Ocean-like wave displacement on the grid
      if (!prefersReduced) {
        for (let i = 0; i < basePositions.length; i += 3) {
          const x = basePositions[i];
          const y = basePositions[i + 1];
          const wave =
            Math.sin(x * 0.35 + t * 0.9) * 0.35 +
            Math.cos(y * 0.4 + t * 0.7) * 0.3;
          posAttr.array[i + 2] = wave;
        }
        posAttr.needsUpdate = true;
      }

      grid2.rotation.z = t * 0.02;

      // Smooth, softened parallax — small amplitude + easing
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      camera.position.x = current.x * 0.6;
      camera.position.y = 0.4 + -current.y * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pGeom.dispose();
      pMat.dispose();
      gridGeom.dispose();
      gridMat.dispose();
      grid2Geom.dispose();
      (grid2.material as THREE.Material).dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
