"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

const SPHERE_POINTS = 6000;
const RING_POINTS = 180;
const RING_RADIUS = 2.4;

// Points that breathe on a sphere, a ring that follows the frequency spectrum, and slow drifting dust.
// Without an analyser (no CORS on the bucket) it still pulses gently while audio plays.
export default function Visualizer({
  analyserRef,
  playingRef,
}: {
  analyserRef: RefObject<AnalyserNode | null>;
  playingRef: RefObject<boolean>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 7;

    // Sphere: Fibonacci-distributed points, displaced in the vertex shader by bass/mid levels.
    const spherePos = new Float32Array(SPHERE_POINTS * 3);
    const sphereRand = new Float32Array(SPHERE_POINTS);
    for (let i = 0; i < SPHERE_POINTS; i++) {
      const y = 1 - (i / (SPHERE_POINTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      spherePos.set([Math.cos(theta) * r * 1.5, y * 1.5, Math.sin(theta) * r * 1.5], i * 3);
      sphereRand[i] = Math.random();
    }
    const sphereGeo = new THREE.BufferGeometry();
    sphereGeo.setAttribute("position", new THREE.BufferAttribute(spherePos, 3));
    sphereGeo.setAttribute("aRand", new THREE.BufferAttribute(sphereRand, 1));
    const sphereMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uColorA: { value: new THREE.Color("#1B6D24") },
        uColorB: { value: new THREE.Color("#EAE4B1") },
      },
      vertexShader: /* glsl */ `
        uniform float uTime, uBass, uMid;
        attribute float aRand;
        varying float vGlow;
        void main() {
          vec3 p = position;
          float n = sin(p.x * 2.5 + uTime) * sin(p.y * 2.5 + uTime * 1.3) * sin(p.z * 2.5 + uTime * 0.7);
          p *= 1.0 + n * (0.08 + uMid * 0.25) + uBass * 0.3;
          vGlow = clamp(n * 0.5 + 0.5 + uBass * 0.5, 0.0, 1.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.5 + aRand * 2.0 + uBass * 3.0) * (7.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColorA, uColorB;
        varying float vGlow;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(mix(uColorA, uColorB, vGlow), smoothstep(0.5, 0.0, d) * 0.9);
        }`,
    });
    const sphere = new THREE.Points(sphereGeo, sphereMat);
    scene.add(sphere);

    // Soft round sprite shared by the ring and the dust.
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const g = dot.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const dotTex = new THREE.CanvasTexture(dot);

    const ringPos = new Float32Array(RING_POINTS * 3);
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    const ringMat = new THREE.PointsMaterial({
      size: 0.09, map: dotTex, color: "#EAE4B1", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Points(ringGeo, ringMat);
    ring.rotation.x = -0.35;
    scene.add(ring);

    const dustPos = new Float32Array(1500 * 3);
    for (let i = 0; i < dustPos.length; i++) dustPos[i] = (Math.random() - 0.5) * 30;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.05, map: dotTex, color: "#9fc9a3", transparent: true, opacity: 0.5, depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // Keep the whole ring in view on narrow screens.
      camera.position.z = w < h ? 7 * (h / w) * 0.75 : 7;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const freq = new Uint8Array(256);
    const speed = reduceMotion ? 0.2 : 1;
    let bass = 0, mid = 0, frame = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const t = clock.getElapsedTime() * speed;
      const analyser = analyserRef.current;
      const playing = playingRef.current;

      let targetBass = 0, targetMid = 0;
      if (analyser && playing) {
        analyser.getByteFrequencyData(freq);
        for (let i = 0; i < 8; i++) targetBass += freq[i];
        for (let i = 8; i < 64; i++) targetMid += freq[i];
        targetBass /= 8 * 255;
        targetMid /= 56 * 255;
      } else if (playing) {
        targetBass = 0.15 + Math.sin(t * 2) * 0.08;
        targetMid = 0.2;
      }
      bass += (targetBass - bass) * 0.15;
      mid += (targetMid - mid) * 0.15;

      for (let i = 0; i < RING_POINTS; i++) {
        const a = (i / RING_POINTS) * Math.PI * 2;
        // Mirror the spectrum so both halves of the ring move together.
        const bin = Math.floor((i < RING_POINTS / 2 ? i : RING_POINTS - i) * 0.9);
        const level = analyser && playing ? freq[bin] / 255 : bass * (0.5 + 0.5 * Math.sin(a * 6 + t * 3));
        const r = RING_RADIUS + level * 0.9;
        ringPos.set([Math.cos(a) * r, Math.sin(a) * r, 0], i * 3);
      }
      ringGeo.attributes.position.needsUpdate = true;

      sphereMat.uniforms.uTime.value = t;
      sphereMat.uniforms.uBass.value = bass;
      sphereMat.uniforms.uMid.value = mid;
      sphere.rotation.y = t * 0.15;
      sphere.rotation.x = Math.sin(t * 0.1) * 0.3;
      ring.rotation.z = t * 0.05;
      dust.rotation.y = t * 0.02;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      [sphereGeo, ringGeo, dustGeo, sphereMat, ringMat, dustMat, dotTex].forEach((o) => o.dispose());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [analyserRef, playingRef]);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
