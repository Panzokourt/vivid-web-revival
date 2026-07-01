import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Global fixed 3D background.
 * As the user scrolls, a RIB boat assembles piece by piece:
 *   0.00 – 0.25  Hull (Deep-V γάστρα)
 *   0.25 – 0.50  Tubes (side pontoons)
 *   0.50 – 0.75  Console + windshield
 *   0.75 – 1.00  Outboard engine
 * A subtle wave grid stays underneath.
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
    scene.fog = new THREE.FogExp2(0x0a1f30, 0.045);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(0, 2, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights for the solid shading phase
    const hemi = new THREE.HemisphereLight(0x9ec7de, 0x0a1f30, 0.9);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe63946, 0.5);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // ---- Wave-displaced ocean grid (kept) ----
    const gridGeom = new THREE.PlaneGeometry(80, 80, 70, 70);
    const basePositions = gridGeom.attributes.position.array.slice() as Float32Array;
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x2b6a94,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const gridMesh = new THREE.Mesh(gridGeom, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -2.2;
    scene.add(gridMesh);

    // ============================================================
    //  RIB parts
    // ============================================================

    const NAVY = 0x1e3a56;
    const NAVY_DARK = 0x14283d;
    const RED = 0xe63946;
    const TUBE_GRAY = 0x2c3e50;
    const WIRE_COLOR = 0x7fb3d5;

    type Part = {
      group: THREE.Group;
      wire: THREE.LineSegments;
      wireMat: THREE.LineBasicMaterial;
      solids: { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial }[];
      finalPos: THREE.Vector3;
      fromOffset: THREE.Vector3;
      phaseStart: number;
      phaseEnd: number;
    };
    const parts: Part[] = [];

    const wireMatFor = () =>
      new THREE.LineBasicMaterial({
        color: WIRE_COLOR,
        transparent: true,
        opacity: 0,
      });
    const solidMatFor = (color: number, metalness = 0.3, roughness = 0.55) =>
      new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness,
        transparent: true,
        opacity: 0,
      });

    const wrapPart = (
      geoms: { geom: THREE.BufferGeometry; mat: THREE.MeshStandardMaterial }[],
      wireSource: THREE.BufferGeometry,
      finalPos: THREE.Vector3,
      fromOffset: THREE.Vector3,
      phaseStart: number,
      phaseEnd: number,
    ): Part => {
      const group = new THREE.Group();
      const edges = new THREE.EdgesGeometry(wireSource, 20);
      const wireMat = wireMatFor();
      const wire = new THREE.LineSegments(edges, wireMat);
      group.add(wire);
      const solids = geoms.map(({ geom, mat }) => {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.visible = false;
        group.add(mesh);
        return { mesh, mat };
      });
      group.visible = false;
      scene.add(group);
      return {
        group,
        wire,
        wireMat,
        solids,
        finalPos,
        fromOffset,
        phaseStart,
        phaseEnd,
      };
    };

    // ---- HULL (Deep-V) built from BufferGeometry ----
    const buildHullGeometry = () => {
      // Stations along the length (x = length axis; bow at +x, stern at -x)
      const stations = [
        { x: -2.6, scaleZ: 1.0, scaleY: 1.0, deckY: 0.35 }, // stern
        { x: -1.2, scaleZ: 1.05, scaleY: 1.0, deckY: 0.4 },
        { x: 0.4, scaleZ: 1.0, scaleY: 1.0, deckY: 0.45 },
        { x: 1.8, scaleZ: 0.75, scaleY: 0.9, deckY: 0.55 },
        { x: 2.6, scaleZ: 0.15, scaleY: 0.5, deckY: 0.65 }, // near bow point
      ];
      // Cross-section points (z, y) — port to starboard
      const cs: [number, number][] = [
        [-1.15, 0.35], // gunwale port
        [-0.95, 0.0], // chine port
        [0.0, -0.55], // keel
        [0.95, 0.0], // chine stbd
        [1.15, 0.35], // gunwale stbd
      ];
      const N = cs.length;
      const positions: number[] = [];
      // Hull vertices
      stations.forEach((s) => {
        cs.forEach(([z, y]) => {
          const adjY = y * s.scaleY + (s.deckY - 0.35);
          positions.push(s.x, adjY, z * s.scaleZ);
        });
      });
      const indices: number[] = [];
      for (let si = 0; si < stations.length - 1; si++) {
        for (let k = 0; k < N - 1; k++) {
          const a = si * N + k;
          const b = si * N + k + 1;
          const c = (si + 1) * N + k;
          const d = (si + 1) * N + k + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
      // Deck (top) between the two gunwale rails
      const deckStart = positions.length / 3;
      stations.forEach((s) => {
        positions.push(s.x, s.deckY, -1.15 * s.scaleZ);
        positions.push(s.x, s.deckY, 1.15 * s.scaleZ);
      });
      for (let si = 0; si < stations.length - 1; si++) {
        const a = deckStart + si * 2;
        const b = deckStart + si * 2 + 1;
        const c = deckStart + (si + 1) * 2;
        const d = deckStart + (si + 1) * 2 + 1;
        indices.push(a, b, c, b, d, c);
      }
      // Stern transom (close the back)
      for (let k = 0; k < N - 2; k++) {
        indices.push(0, k + 2, k + 1);
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    };

    const hullGeom = buildHullGeometry();
    const hullMat = solidMatFor(NAVY, 0.4, 0.5);
    parts.push(
      wrapPart(
        [{ geom: hullGeom, mat: hullMat }],
        hullGeom,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -3.5, 0),
        0.0,
        0.25,
      ),
    );

    // ---- TUBES (two side pontoons) ----
    const makeTubeCurve = (side: 1 | -1) => {
      // Trace the gunwale from stern to bow tip
      const zBase = 1.1 * side;
      const pts = [
        new THREE.Vector3(-2.6, 0.4, zBase * 1.0),
        new THREE.Vector3(-1.2, 0.42, zBase * 1.05),
        new THREE.Vector3(0.4, 0.45, zBase * 1.0),
        new THREE.Vector3(1.8, 0.55, zBase * 0.7),
        new THREE.Vector3(2.55, 0.65, zBase * 0.12),
      ];
      return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
    };
    const tubeGroupSolidGeoms: THREE.BufferGeometry[] = [];
    const tubePortGeom = new THREE.TubeGeometry(
      makeTubeCurve(-1),
      40,
      0.25,
      12,
      false,
    );
    const tubeStbdGeom = new THREE.TubeGeometry(
      makeTubeCurve(1),
      40,
      0.25,
      12,
      false,
    );
    tubeGroupSolidGeoms.push(tubePortGeom, tubeStbdGeom);
    const tubeMatA = solidMatFor(TUBE_GRAY, 0.05, 0.85);
    const tubeMatB = solidMatFor(TUBE_GRAY, 0.05, 0.85);
    // Merge wire sources into one for edge preview
    const tubeWireCombined = new THREE.BufferGeometry();
    {
      const posA = tubePortGeom.attributes.position.array as Float32Array;
      const posB = tubeStbdGeom.attributes.position.array as Float32Array;
      const merged = new Float32Array(posA.length + posB.length);
      merged.set(posA, 0);
      merged.set(posB, posA.length);
      tubeWireCombined.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(merged, 3),
      );
    }
    // Simpler: use edges of each; combine by adding both as separate LineSegments via a group.
    // Instead we just use one tube geom's edges for the wire preview — visually close enough.
    parts.push({
      ...wrapPart(
        [
          { geom: tubePortGeom, mat: tubeMatA },
          { geom: tubeStbdGeom, mat: tubeMatB },
        ],
        tubePortGeom,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 2.8),
        0.25,
        0.5,
      ),
    });
    // Add a second edge preview for the starboard tube inside the same group
    {
      const p = parts[parts.length - 1];
      const edges2 = new THREE.EdgesGeometry(tubeStbdGeom, 20);
      const wire2 = new THREE.LineSegments(edges2, p.wireMat);
      p.group.add(wire2);
    }

    // ---- CONSOLE (base + windshield + wheel + seat + T-top) ----
    const consoleGroupGeoms: {
      geom: THREE.BufferGeometry;
      mat: THREE.MeshStandardMaterial;
      offset: THREE.Vector3;
      rot?: THREE.Euler;
    }[] = [
      {
        geom: new THREE.BoxGeometry(0.85, 0.7, 0.75),
        mat: solidMatFor(NAVY_DARK, 0.2, 0.6),
        offset: new THREE.Vector3(0.1, 0.8, 0),
      },
      {
        geom: new THREE.BoxGeometry(0.05, 0.45, 0.78),
        mat: solidMatFor(0x88bcd8, 0.9, 0.1),
        offset: new THREE.Vector3(0.5, 1.28, 0),
        rot: new THREE.Euler(0, 0, -0.35),
      },
      {
        geom: new THREE.CylinderGeometry(0.14, 0.14, 0.03, 24),
        mat: solidMatFor(RED, 0.3, 0.4),
        offset: new THREE.Vector3(0.05, 1.05, 0),
        rot: new THREE.Euler(Math.PI / 2.4, 0, 0),
      },
      // Leaning post / seat
      {
        geom: new THREE.BoxGeometry(0.55, 0.55, 0.85),
        mat: solidMatFor(NAVY_DARK, 0.15, 0.7),
        offset: new THREE.Vector3(-0.55, 0.72, 0),
      },
      {
        geom: new THREE.BoxGeometry(0.12, 0.45, 0.85),
        mat: solidMatFor(NAVY_DARK, 0.15, 0.7),
        offset: new THREE.Vector3(-0.8, 1.2, 0),
      },
      // T-top canopy
      {
        geom: new THREE.BoxGeometry(1.5, 0.06, 1.4),
        mat: solidMatFor(NAVY, 0.35, 0.45),
        offset: new THREE.Vector3(-0.1, 2.15, 0),
      },
      // 4 T-top posts
      {
        geom: new THREE.CylinderGeometry(0.035, 0.035, 1.4, 12),
        mat: solidMatFor(0xb8c5cf, 0.85, 0.25),
        offset: new THREE.Vector3(0.55, 1.45, 0.55),
      },
      {
        geom: new THREE.CylinderGeometry(0.035, 0.035, 1.4, 12),
        mat: solidMatFor(0xb8c5cf, 0.85, 0.25),
        offset: new THREE.Vector3(0.55, 1.45, -0.55),
      },
      {
        geom: new THREE.CylinderGeometry(0.035, 0.035, 1.4, 12),
        mat: solidMatFor(0xb8c5cf, 0.85, 0.25),
        offset: new THREE.Vector3(-0.75, 1.45, 0.55),
      },
      {
        geom: new THREE.CylinderGeometry(0.035, 0.035, 1.4, 12),
        mat: solidMatFor(0xb8c5cf, 0.85, 0.25),
        offset: new THREE.Vector3(-0.75, 1.45, -0.55),
      },
    ];
    const consoleWirePreview = consoleGroupGeoms[0].geom;

    {
      const group = new THREE.Group();
      const edges = new THREE.EdgesGeometry(consoleWirePreview, 20);
      const wireMat = wireMatFor();
      const wire = new THREE.LineSegments(edges, wireMat);
      wire.position.copy(consoleGroupGeoms[0].offset);
      group.add(wire);
      const solids = consoleGroupGeoms.map(({ geom, mat, offset, rot }) => {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(offset);
        if (rot) mesh.rotation.copy(rot);
        mesh.visible = false;
        group.add(mesh);
        return { mesh, mat };
      });
      group.visible = false;
      scene.add(group);
      parts.push({
        group,
        wire,
        wireMat,
        solids,
        finalPos: new THREE.Vector3(0, 0, 0),
        fromOffset: new THREE.Vector3(0, 3.5, 0),
        phaseStart: 0.5,
        phaseEnd: 0.75,
      });
    }

    // ---- ENGINE (outboard at stern) ----
    let propSpinGroup: THREE.Group | null = null;
    const engineParts: {
      geom: THREE.BufferGeometry;
      mat: THREE.MeshStandardMaterial;
      offset: THREE.Vector3;
      rot?: THREE.Euler;
    }[] = [
      // Cowling
      {
        geom: new THREE.BoxGeometry(0.5, 0.85, 0.48),
        mat: solidMatFor(NAVY_DARK, 0.55, 0.3),
        offset: new THREE.Vector3(-2.95, 0.75, 0),
      },
      // Cowling top accent
      {
        geom: new THREE.BoxGeometry(0.45, 0.15, 0.42),
        mat: solidMatFor(RED, 0.4, 0.35),
        offset: new THREE.Vector3(-2.95, 1.22, 0),
      },
      // Mid-shaft housing
      {
        geom: new THREE.BoxGeometry(0.22, 0.55, 0.28),
        mat: solidMatFor(NAVY_DARK, 0.6, 0.3),
        offset: new THREE.Vector3(-2.95, 0.05, 0),
      },
      // Gearcase (torpedo)
      {
        geom: new THREE.CapsuleGeometry(0.14, 0.5, 6, 12),
        mat: solidMatFor(NAVY_DARK, 0.7, 0.25),
        offset: new THREE.Vector3(-3.05, -0.35, 0),
        rot: new THREE.Euler(0, 0, Math.PI / 2),
      },
      // Skeg
      {
        geom: new THREE.BoxGeometry(0.22, 0.22, 0.03),
        mat: solidMatFor(NAVY_DARK, 0.7, 0.25),
        offset: new THREE.Vector3(-2.9, -0.5, 0),
      },
    ];
    const engineWirePreview = engineParts[0].geom;
    {
      const group = new THREE.Group();
      const edges = new THREE.EdgesGeometry(engineWirePreview, 20);
      const wireMat = wireMatFor();
      const wire = new THREE.LineSegments(edges, wireMat);
      wire.position.copy(engineParts[0].offset);
      group.add(wire);
      const solids = engineParts.map(({ geom, mat, offset, rot }) => {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(offset);
        if (rot) mesh.rotation.copy(rot);
        mesh.visible = false;
        group.add(mesh);
        return { mesh, mat };
      });
      // Propeller
      propSpinGroup = new THREE.Group();
      propSpinGroup.position.set(-3.35, -0.35, 0);
      const hubMat = solidMatFor(0xc0c8d0, 0.9, 0.2);
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12),
        hubMat,
      );
      hub.rotation.z = Math.PI / 2;
      hub.visible = false;
      propSpinGroup.add(hub);
      solids.push({ mesh: hub, mat: hubMat });
      for (let b = 0; b < 3; b++) {
        const bladeMat = solidMatFor(0xc0c8d0, 0.9, 0.2);
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.22, 0.07),
          bladeMat,
        );
        blade.position.set(0, 0.13, 0);
        const bWrap = new THREE.Group();
        bWrap.rotation.x = (b * Math.PI * 2) / 3;
        bWrap.add(blade);
        blade.visible = false;
        propSpinGroup.add(bWrap);
        solids.push({ mesh: blade, mat: bladeMat });
      }
      group.add(propSpinGroup);

      group.visible = false;
      scene.add(group);
      parts.push({
        group,
        wire,
        wireMat,
        solids,
        finalPos: new THREE.Vector3(0, 0, 0),
        fromOffset: new THREE.Vector3(-2.5, 0.5, 0),
        phaseStart: 0.75,
        phaseEnd: 1.0,
      });
    }

    // ---- BOW RAIL + NAV LIGHTS ----
    {
      const railCurve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0.6, 0.75, 1.05),
          new THREE.Vector3(1.4, 0.8, 0.9),
          new THREE.Vector3(2.1, 0.85, 0.55),
          new THREE.Vector3(2.55, 0.9, 0.05),
          new THREE.Vector3(2.1, 0.85, -0.55),
          new THREE.Vector3(1.4, 0.8, -0.9),
          new THREE.Vector3(0.6, 0.75, -1.05),
        ],
        false,
        "catmullrom",
        0.4,
      );
      const railGroup = new THREE.Group();
      const railGeom = new THREE.TubeGeometry(railCurve, 40, 0.035, 10, false);
      const railMat = solidMatFor(0xc8d1d9, 0.9, 0.2);
      const railMesh = new THREE.Mesh(railGeom, railMat);
      railMesh.visible = false;
      railGroup.add(railMesh);
      const navRedMat = solidMatFor(RED, 0.3, 0.4);
      const navRed = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        navRedMat,
      );
      navRed.position.set(2.1, 0.9, 0.55);
      navRed.visible = false;
      const navGreenMat = solidMatFor(0x2ecc71, 0.3, 0.4);
      const navGreen = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        navGreenMat,
      );
      navGreen.position.set(2.1, 0.9, -0.55);
      navGreen.visible = false;
      railGroup.add(navRed, navGreen);
      const edges = new THREE.EdgesGeometry(railGeom, 20);
      const wireMat = wireMatFor();
      const wire = new THREE.LineSegments(edges, wireMat);
      railGroup.add(wire);
      railGroup.visible = false;
      scene.add(railGroup);
      parts.push({
        group: railGroup,
        wire,
        wireMat,
        solids: [
          { mesh: railMesh, mat: railMat },
          { mesh: navRed, mat: navRedMat },
          { mesh: navGreen, mat: navGreenMat },
        ],
        finalPos: new THREE.Vector3(0, 0, 0),
        fromOffset: new THREE.Vector3(0, 2, 0),
        phaseStart: 0.2,
        phaseEnd: 0.5,
      });
    }

    // Boat root group — a tiny bob + slow spin for life
    const boatRoot = new THREE.Group();
    parts.forEach((p) => {
      scene.remove(p.group);
      boatRoot.add(p.group);
    });
    scene.add(boatRoot);

    // ---- Pointer + scroll tracking ----
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
      scroll.target = Math.min(1, Math.max(0, window.scrollY / max));
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

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutBack = (t: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    // Reassign phase windows so the whole assembly is complete well before the
    // end of the page, giving the user time to enjoy the finished boat.
    parts[0].phaseStart = 0.0;   parts[0].phaseEnd = 0.22;  // hull
    parts[1].phaseStart = 0.18;  parts[1].phaseEnd = 0.42;  // tubes
    parts[4].phaseStart = 0.35;  parts[4].phaseEnd = 0.58;  // bow rail + nav lights
    parts[2].phaseStart = 0.5;   parts[2].phaseEnd = 0.75;  // console + T-top
    parts[3].phaseStart = 0.7;   parts[3].phaseEnd = 0.95;  // engine + prop


    const updatePart = (p: Part, s: number) => {
      const local = clamp01((s - p.phaseStart) / (p.phaseEnd - p.phaseStart));
      if (local <= 0) {
        p.group.visible = false;
        return;
      }
      p.group.visible = true;

      // Position: ease-out back → satisfying "snap" as it seats
      const posT = easeOutBack(local);
      p.group.position.set(
        p.finalPos.x + p.fromOffset.x * (1 - posT),
        p.finalPos.y + p.fromOffset.y * (1 - posT),
        p.finalPos.z + p.fromOffset.z * (1 - posT),
      );

      // Wire opacity: fade in fast (0→0.25), hold, fade out as solid takes over (0.7→0.95)
      const wireIn = clamp01(local / 0.25);
      const wireOut = 1 - clamp01((local - 0.7) / 0.25);
      p.wireMat.opacity = wireIn * wireOut * 0.85;

      // Solid opacity: crossfades in during the last third
      const solidIn = easeInOutCubic(clamp01((local - 0.55) / 0.4));
      p.solids.forEach(({ mesh, mat }) => {
        mat.opacity = solidIn;
        mesh.visible = solidIn > 0.01;
      });

      // Snap settle: a tiny squash-and-release around the seat moment (0.85–1.0)
      let scale = 1;
      if (local > 0.85 && local < 1) {
        const s2 = (local - 0.85) / 0.15;
        scale = 1 + Math.sin(s2 * Math.PI) * 0.06;
      }
      p.group.scale.setScalar(scale);
    };

    let raf = 0;
    const clock = new THREE.Clock();
    const posAttr = gridGeom.attributes.position as THREE.BufferAttribute;

    // Remap: assembly completes at 55% of page scroll; last 45% just holds & camera drifts around the finished RIB.
    const ASSEMBLY_END = 0.55;


    const animate = () => {
      const t = clock.getElapsedTime();

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      scroll.current += (scroll.target - scroll.current) * 0.08;
      const rawS = prefersReduced ? 1 : scroll.current;
      const s = clamp01(rawS / ASSEMBLY_END); // assembly progress
      const sExtra = clamp01((rawS - ASSEMBLY_END) / (1 - ASSEMBLY_END)); // after-assembly


      // Ocean waves under boat
      if (!prefersReduced) {
        for (let i = 0; i < basePositions.length; i += 3) {
          const x = basePositions[i];
          const y = basePositions[i + 1];
          const wave =
            Math.sin(x * 0.35 + t * 0.7) * 0.22 +
            Math.cos(y * 0.4 + t * 0.55) * 0.2;
          posAttr.array[i + 2] = wave;
        }
        posAttr.needsUpdate = true;
      }

      // Assembly
      parts.forEach((p) => updatePart(p, s));

      // Idle bob for the whole boat
      boatRoot.position.y = Math.sin(t * 0.6) * 0.12;
      boatRoot.rotation.z = Math.sin(t * 0.5) * 0.015;

      // Spin propeller once the engine is fully seated
      if (propSpinGroup) {
        const engineLocal = clamp01((s - parts[3].phaseStart) / (parts[3].phaseEnd - parts[3].phaseStart));
        propSpinGroup.rotation.x += 0.05 + engineLocal * 0.25;
      }


      // Camera: orbit during assembly (s: 0→1), then a gentle continued drift after (sExtra)
      const angle = Math.PI * 0.15 + s * Math.PI * 0.55 + sExtra * Math.PI * 0.25;
      const radius = 8.5 - s * 1.5 - sExtra * 0.6;
      const camY = 1.6 + s * 1.4 + sExtra * 0.5;
      camera.position.x = Math.sin(angle) * radius + pointer.x * 0.6;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = camY + -pointer.y * 0.4;
      camera.lookAt(0, 0.3, 0);


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
      gridGeom.dispose();
      gridMat.dispose();
      parts.forEach((p) => {
        p.wireMat.dispose();
        (p.wire.geometry as THREE.BufferGeometry).dispose();
        p.solids.forEach(({ mesh, mat }) => {
          mesh.geometry.dispose();
          mat.dispose();
        });
      });
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
