import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Global fixed 3D background that spans the whole page.
 * Reacts smoothly to scroll and pointer without demanding attention.
 */
export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1f30, 0.05);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    camera.position.set(0, 0.4, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Layered particles ----
    const makeParticles = (
      count: number,
      spread: number,
      color: number,
      size: number,
      opacity: number,
    ) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      return { pts: new THREE.Points(geom, mat), geom, mat };
    };

    const near = makeParticles(700, 30, 0x9ec7de, 0.045, 0.9);
    const mid = makeParticles(900, 50, 0x5b8ba8, 0.03, 0.6);
    const far = makeParticles(500, 80, 0xe63946, 0.025, 0.25);
    scene.add(near.pts, mid.pts, far.pts);

    // ---- Wave-displaced ocean grid ----
    const gridGeom = new THREE.PlaneGeometry(90, 90, 80, 80);
    const basePositions = gridGeom.attributes.position.array.slice() as Float32Array;
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x2b6a94,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const grid = new THREE.Mesh(gridGeom, gridMat);
    grid.rotation.x = -Math.PI / 2.15;
    grid.position.y = -6;
    scene.add(grid);

    // ---- Upper accent grid ----
    const grid2Geom = new THREE.PlaneGeometry(80, 80, 40, 40);
    const grid2Mat = new THREE.MeshBasicMaterial({
      color: 0xe63946,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const grid2 = new THREE.Mesh(grid2Geom, grid2Mat);
    grid2.rotation.x = Math.PI / 2.15;
    grid2.position.y = 7;
    scene.add(grid2);

    // ---- Slow-rotating wire icosahedron (subtle centerpiece) ----
    const icoGeom = new THREE.IcosahedronGeometry(3.2, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x4a8fb8,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const ico = new THREE.Mesh(icoGeom, icoMat);
    ico.position.set(0, 0, -6);
    scene.add(ico);

    // ---- Pointer + scroll tracking (smooth) ----
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    const scroll = { target: 0, current: 0 };

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scroll.target = window.scrollY / max; // 0..1
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
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

      // Smooth interpolation
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      scroll.current += (scroll.target - scroll.current) * 0.06;
      const s = scroll.current;

      // Particles drift gently, layers move at different speeds (parallax)
      near.pts.rotation.y = t * 0.02 + s * 0.4;
      near.pts.rotation.x = Math.sin(t * 0.08) * 0.05;
      mid.pts.rotation.y = -t * 0.015 - s * 0.6;
      mid.pts.rotation.x = Math.cos(t * 0.06) * 0.04;
      far.pts.rotation.y = t * 0.008 + s * 0.9;

      // Ocean waves
      if (!prefersReduced) {
        for (let i = 0; i < basePositions.length; i += 3) {
          const x = basePositions[i];
          const y = basePositions[i + 1];
          const wave =
            Math.sin(x * 0.3 + t * 0.8) * 0.4 +
            Math.cos(y * 0.35 + t * 0.6) * 0.35;
          posAttr.array[i + 2] = wave;
        }
        posAttr.needsUpdate = true;
      }

      // Icosahedron slow rotation, drifts with scroll
      ico.rotation.x = t * 0.05 + s * 0.5;
      ico.rotation.y = t * 0.07 + s * 1.2;
      ico.position.y = Math.sin(t * 0.3) * 0.4 - s * 2;
      icoMat.opacity = 0.08 + Math.sin(t * 0.4) * 0.04 + s * 0.1;

      grid2.rotation.z = t * 0.02;

      // Camera: gentle pointer parallax + scroll travel through the scene
      camera.position.x = pointer.x * 0.5;
      camera.position.y = 0.4 + -pointer.y * 0.3 - s * 1.2;
      camera.position.z = 10 - s * 3.5;
      camera.lookAt(0, -s * 1.5, -s * 4);

      // Grid drifts down with scroll to reveal new terrain
      grid.position.y = -6 - s * 2;
      grid2.position.y = 7 - s * 3;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      [near, mid, far].forEach(({ geom, mat }) => {
        geom.dispose();
        mat.dispose();
      });
      gridGeom.dispose();
      gridMat.dispose();
      grid2Geom.dispose();
      grid2Mat.dispose();
      icoGeom.dispose();
      icoMat.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
