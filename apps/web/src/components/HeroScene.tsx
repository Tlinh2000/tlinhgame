import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { usePreferences } from '../lib/preferences';

export default function HeroScene() {
  const host = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const { preferences } = usePreferences();
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: preferences.quality === 'high', powerPreference: 'low-power' }); }
    catch { setUnavailable(true); return; }
    setUnavailable(false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(9, 7, 11);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, preferences.quality === 'high' ? 1.6 : 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = preferences.quality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Cảnh ý tưởng đấu trường băng 3D, kéo để xoay góc nhìn');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.55, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.35;
    controls.autoRotate = !preferences.reducedMotion;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = !preferences.reducedMotion;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xb9eaf7, 0x1b0d38, 3));
    const keyLight = new THREE.DirectionalLight(0xb5faff, 5);
    keyLight.position.set(3, 8, 4);
    keyLight.castShadow = preferences.quality === 'high';
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    const pinkLight = new THREE.PointLight(0xad66ff, 65, 20);
    pinkLight.position.set(-4, 3, -2);
    scene.add(pinkLight);
    const arena = new THREE.Group();
    scene.add(arena);
    const ice = new THREE.MeshPhysicalMaterial({ color: 0x8edce9, metalness: 0.22, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.1 });
    const stone = new THREE.MeshStandardMaterial({ color: 0x182f4c, roughness: 0.4, metalness: 0.5 });
    const snow = new THREE.MeshStandardMaterial({ color: 0xd7f6fa, roughness: 0.75 });
    const neon = new THREE.MeshStandardMaterial({ color: 0x70ffe0, emissive: 0x39c8c4, emissiveIntensity: 2.2 });
    const violet = new THREE.MeshStandardMaterial({ color: 0xb899ff, emissive: 0x7842ed, emissiveIntensity: 2 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.6, 0.9, 72), stone);
    plinth.position.y = -0.65;
    arena.add(plinth);
    const surface = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.34, 72), ice);
    surface.position.y = -0.03;
    surface.receiveShadow = true;
    arena.add(surface);
    for (const [radius, y, material] of [[4.49, 0.15, neon], [4.1, -0.89, violet]] as const) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.045, 8, 96), material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      arena.add(ring);
    }
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.62), i % 3 === 0 ? violet : snow);
      block.position.set(Math.sin(angle) * 4.05, 0.22, Math.cos(angle) * 4.05);
      block.rotation.y = angle;
      block.castShadow = true;
      arena.add(block);
    }
    for (let i = 0; i < 7; i++) {
      const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), i % 2 === 0 ? ice : snow);
      crystal.scale.set(0.55, 1.2 + (i % 3) * 0.7, 0.7);
      crystal.position.set(-2.2 + i * 0.63, 0.6 + (i % 3) * 0.15, -2.35 + (i % 2) * 0.3);
      crystal.rotation.z = (i - 3) * 0.12;
      crystal.castShadow = true;
      arena.add(crystal);
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.065, 8, 80, Math.PI), violet);
    arch.position.set(0, 0.18, -2.4);
    arena.add(arch);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.024, 6, 80, Math.PI), neon);
    inner.position.copy(arch.position);
    arena.add(inner);
    const center = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.06, 6), stone);
    center.position.y = 0.17;
    arena.add(center);
    const centerRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.032, 6, 6), neon);
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.y = 0.215;
    arena.add(centerRing);
    const cracks: number[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = i * 2.39996;
      const radius = 1.3 + (i % 5) * 0.48;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      cracks.push(x, 0.145, z, x + Math.cos(angle + 0.8) * 0.5, 0.145, z + Math.sin(angle + 0.8) * 0.5);
    }
    const crackGeometry = new THREE.BufferGeometry();
    crackGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cracks, 3));
    arena.add(new THREE.LineSegments(crackGeometry, new THREE.LineBasicMaterial({ color: 0xd6ffff, transparent: true, opacity: 0.45 })));
    const particlePositions: number[] = [];
    for (let i = 0; i < 100; i++) particlePositions.push(Math.sin(i * 72.1) * 7, Math.cos(i * 9.37) * 2 + 2, Math.sin(i * 4.7) * 6);
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0xc5edff, size: 0.025, transparent: true, opacity: 0.65 }));
    scene.add(particles);

    let frame = 0;
    let lost = false;
    let last = performance.now();
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(1, height);
      camera.zoom = width < 420 ? 0.83 : 1;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const render = () => {
      if (lost) return;
      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      controls.update(delta);
      if (!preferences.reducedMotion) { arena.position.y = Math.sin(now * 0.0007) * 0.045; particles.rotation.y = now * 0.000015; }
      if (!document.hidden) renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const renderStill = () => { if (!lost) renderer.render(scene, camera); };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; renderer.domElement.style.display = 'none'; setUnavailable(true); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    if (preferences.reducedMotion) controls.addEventListener('change', renderStill);
    resize();
    if (!preferences.reducedMotion) frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener('change', renderStill);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry);
          if (Array.isArray(object.material)) object.material.forEach(material => materials.add(material));
          else materials.add(object.material);
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      keyLight.shadow.map?.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [preferences.quality, preferences.reducedMotion]);
  return <div className="hero-scene" ref={host}>{unavailable && <div className="scene-fallback"><span>❄</span><p>Thiết bị chưa hiển thị được cảnh 3D.<br />Các trang khác vẫn có thể sử dụng.</p></div>}</div>;
}
