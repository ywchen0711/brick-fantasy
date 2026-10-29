// Battle effects, in bricks and light: little glowing 1×1 bricks that burst and fall, rings along the floor, the arc
// of a blade, beams, bolts, pillars of light, glows. One pool of instanced bricks, a few reusable meshes.
import * as THREE from '../../lib/three.module.min.js';

const glowTex = (() => { let t; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); t = new THREE.CanvasTexture(c); return t; }; })();
export class FX {
  constructor(scene) {
    this.scene = scene; this.items = []; const N = 1600;
    const geo = new THREE.BoxGeometry(1, 0.7, 1); const stud = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8); stud.translate(0, 0.5, 0);
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false }), N); this.mesh.frustumCulled = false; this.mesh.count = 0; scene.add(this.mesh);
    this.parts = []; this.N = N; this.m4 = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); this.c = new THREE.Color();
  }
  // ---------------------------------------------------------------- the brick particles
  burst(p, color, { n = 30, speed = 3, size = 0.12, life = 0.9, g = -6, up = 1.5, spread = 1, rise = 0, from = null } = {}) {
    for (let i = 0; i < n; i++) {
      if (this.parts.length >= this.N) break;
      const a = Math.random() * Math.PI * 2, el = Math.random() * Math.PI * 0.5, s = speed * (0.4 + Math.random() * 0.8);
      this.parts.push({ x: p.x + (Math.random() - 0.5) * 0.2 * spread, y: p.y + (Math.random() - 0.5) * 0.2 * spread, z: p.z + (Math.random() - 0.5) * 0.2 * spread, vx: Math.cos(a) * Math.cos(el) * s * spread, vy: Math.sin(el) * s * up + rise, vz: Math.sin(a) * Math.cos(el) * s * spread, g, life: life * (0.6 + Math.random() * 0.6), t: 0, size: size * (0.6 + Math.random() * 0.8), rx: Math.random() * 6, ry: Math.random() * 6, spin: (Math.random() - 0.5) * 12, color: new THREE.Color(Array.isArray(color) ? color[i % color.length] : color) });
    }
  }
  rain(p, color, { n = 40, h = 4, r = 1.6, speed = 9, size = 0.14, life = 0.8 } = {}) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * r; this.parts.push({ x: p.x + Math.cos(a) * d, y: p.y + h + Math.random() * 2, z: p.z + Math.sin(a) * d, vx: 0, vy: -speed * (0.7 + Math.random() * 0.6), vz: 0, g: 0, life: life * (0.5 + Math.random()), t: -Math.random() * 0.5, size, rx: 0, ry: 0, spin: 4, color: new THREE.Color(Array.isArray(color) ? color[i % color.length] : color), stop: p.y }); }
  }
  spiral(p, color, { n = 40, r = 1.2, h = 2.5, life = 1, size = 0.1 } = {}) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 6; this.parts.push({ x: p.x, y: p.y, z: p.z, vx: 0, vy: 0, vz: 0, g: 0, life, t: -i / n * 0.4, size, rx: 0, ry: 0, spin: 6, color: new THREE.Color(color), orbit: { cx: p.x, cy: p.y, cz: p.z, a, r, h } }); } }
  implode(p, color, { n = 36, r = 2, life = 0.6, size = 0.12 } = {}) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, b = (Math.random() - 0.3) * 1.5; const x = p.x + Math.cos(a) * r, y = p.y + b, z = p.z + Math.sin(a) * r; this.parts.push({ x, y, z, vx: (p.x - x) / life, vy: (p.y - y) / life, vz: (p.z - z) / life, g: 0, life, t: -Math.random() * 0.2, size, rx: 0, ry: 0, spin: 8, color: new THREE.Color(color) }); } }
  // ---------------------------------------------------------------- meshes that grow and fade
  add(o, life, upd) { this.scene.add(o); this.items.push({ o, life, t: 0, upd }); return o; }
  ring(p, color, { r = 2, life = 0.6, y = 0.05, w = 0.15 } = {}) { const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, y, p.z); return this.add(m, life, (k) => { const s = 0.2 + k * r; m.scale.setScalar(s); m.material.opacity = 1 - k; }); }
  glow(p, color, { size = 2, life = 0.4 } = {}) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.position.copy(p); return this.add(s, life, (k) => { s.scale.setScalar(size * (0.5 + k)); s.material.opacity = 1 - k; }); }
  slash(p, color, { angle = 0.6, size = 1.4, life = 0.3, dir = 1 } = {}) {
    const geo = new THREE.RingGeometry(size * 0.75, size, 32, 1, -Math.PI * 0.35, Math.PI * 0.9), m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.position.copy(p); m.rotation.set(0, Math.PI / 2, angle * dir); return this.add(m, life, (k) => { m.material.opacity = 1 - k; m.rotation.z = angle * dir - k * 1.2 * dir; m.scale.setScalar(0.9 + k * 0.3); });
  }
  beam(a, b, color, { w = 0.08, life = 0.25 } = {}) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(w, w, L, 8, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return this.add(m, life, (k) => { m.material.opacity = 1 - k; m.scale.x = m.scale.z = 1 + k * 2; }); }
  bolt(p, color = '#fff8a0', { h = 7, life = 0.35 } = {}) { const pts = []; let x = p.x, z = p.z; for (let i = 0; i <= 10; i++) { pts.push(new THREE.Vector3(x, p.y + h - i * h / 10, z)); x = p.x + (Math.random() - 0.5) * 0.7; z = p.z + (Math.random() - 0.5) * 0.7; } pts[10].set(p.x, p.y, p.z); const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 40, 0.07, 5); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })); return this.add(m, life, (k) => { m.material.opacity = (1 - k) * (Math.random() < 0.8 ? 1 : 0.3); }); }
  pillar(p, color, { r = 0.8, h = 6, life = 0.8 } = {}) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); m.position.set(p.x, p.y + h / 2, p.z); return this.add(m, life, (k) => { m.material.opacity = Math.sin(k * Math.PI) * 0.8; m.scale.x = m.scale.z = 0.3 + k * 1.2; }); }
  circle(p, color, { r = 1.2, life = 1.0 } = {}) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 58, 0, 6.29); g.stroke(); g.beginPath(); g.arc(64, 64, 44, 0, 6.29); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); g.lineTo(64 + Math.cos(a + 2.09) * 44, 64 + Math.sin(a + 2.09) * 44); g.stroke(); } const t = new THREE.CanvasTexture(c); const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: t, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.06, p.z); return this.add(m, life, (k) => { m.rotation.z = k * 3; m.material.opacity = Math.sin(Math.min(1, k * 1.3) * Math.PI); }); }
  // ---------------------------------------------------------------- a foe falls apart into its bricks
  shatter(obj, life = 1.2) {
    const meshes = []; obj.updateMatrixWorld(true); obj.traverse((m) => { if (m.isMesh) meshes.push(m); });
    for (const m of meshes) { const wp = new THREE.Vector3(); m.getWorldPosition(wp); const ws = new THREE.Vector3(); m.getWorldScale(ws); const c = m.clone(); c.position.copy(wp); c.scale.copy(ws); c.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone(); [].concat(c.material).forEach((x) => { x.transparent = true; }); this.scene.add(c);
      const v = new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 3, (Math.random() - 0.5) * 3), sp = new THREE.Vector3(Math.random() * 8, Math.random() * 8, 0);
      this.items.push({ o: c, life, t: 0, upd: (k, dt) => { v.y -= 12 * dt; c.position.addScaledVector(v, dt); if (c.position.y < 0.05) { c.position.y = 0.05; v.y *= -0.3; v.x *= 0.7; v.z *= 0.7; } c.rotation.x += sp.x * dt; c.rotation.y += sp.y * dt; [].concat(c.material).forEach((x) => { x.opacity = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1; }); } }); }
    obj.visible = false;
  }
  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) { const it = this.items[i]; it.t += dt; const k = Math.min(1, it.t / it.life); it.upd?.(k, dt); if (k >= 1) { this.scene.remove(it.o); it.o.geometry?.dispose?.(); this.items.splice(i, 1); } }
    let n = 0; const m4 = this.m4;
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.t += dt; if (p.t < 0) continue; if (p.t > p.life) { this.parts.splice(i, 1); continue; }
      if (p.orbit) { const o = p.orbit, k = p.t / p.life, a = o.a + k * 6; p.x = o.cx + Math.cos(a) * o.r * (1 - k * 0.5); p.z = o.cz + Math.sin(a) * o.r * (1 - k * 0.5); p.y = o.cy + k * o.h; }
      else { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.stop != null && p.y < p.stop) { p.y = p.stop; p.vy = 0; } if (p.y < 0.03 && p.stop == null) { p.y = 0.03; p.vy *= -0.35; p.vx *= 0.6; p.vz *= 0.6; } }
      p.rx += p.spin * dt; const s = p.size * (1 - Math.max(0, (p.t / p.life - 0.7) / 0.3));
      this.e.set(p.rx, p.ry + p.rx * 0.5, 0); this.q.setFromEuler(this.e); m4.compose(new THREE.Vector3(p.x, p.y, p.z), this.q, new THREE.Vector3(s, s, s));
      this.mesh.setMatrixAt(n, m4); this.mesh.setColorAt(n, p.color); n++;
    }
    this.mesh.count = n; this.mesh.instanceMatrix.needsUpdate = true; if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  clear() { for (const it of this.items) this.scene.remove(it.o); this.items = []; this.parts = []; this.mesh.count = 0; }
}
// what each element looks like when it lands (p: the target's middle; big: an ultimate)
export function elementFX(fx, el, p, big = false) {
  const k = big ? 2 : 1, ground = new THREE.Vector3(p.x, 0.05, p.z);
  switch (el) {
    case 'fire': fx.glow(p, '#ff8a2a', { size: 3 * k }); fx.burst(p, ['#ff4a1a', '#ffb02a', '#ffe060'], { n: 40 * k, speed: 4 * k, g: 2, up: 1.4, life: 0.8 }); fx.burst(ground, ['#ff6a1a', '#3a2a2a'], { n: 20 * k, speed: 1.5, g: 3, rise: 2, life: 1 }); fx.ring(p, '#ff8a2a', { r: 2 * k }); break;
    case 'ice': fx.burst(p, ['#e8f8ff', '#9ae0ff', '#5ab8ff'], { n: 36 * k, speed: 5 * k, g: -10, size: 0.16, life: 0.9 }); fx.rain(ground, ['#c8f0ff', '#ffffff'], { n: 20 * k, r: 1 * k, size: 0.2 }); fx.glow(p, '#9ae0ff', { size: 2.4 * k }); fx.ring(ground, '#c8f0ff', { r: 2.2 * k }); break;
    case 'thunder': fx.bolt(ground); if (big) { fx.bolt(new THREE.Vector3(p.x + 0.8, 0, p.z + 0.5)); fx.bolt(new THREE.Vector3(p.x - 0.7, 0, p.z - 0.4)); } fx.glow(p, '#fff8a0', { size: 4 * k, life: 0.3 }); fx.burst(p, ['#ffffa0', '#ffe24a', '#ffffff'], { n: 30 * k, speed: 6, size: 0.08, life: 0.4 }); break;
    case 'water': fx.burst(ground, ['#3a8aff', '#8ac8ff', '#ffffff'], { n: 50 * k, speed: 4, up: 2.2, g: -12, life: 1 }); fx.ring(ground, '#5aa8ff', { r: 2.5 * k }); fx.ring(ground, '#ffffff', { r: 1.6 * k, life: 0.8 }); break;
    case 'wind': fx.spiral(ground, '#a0ffc0', { n: 50 * k, r: 1.2 * k, h: 3 }); fx.spiral(ground, '#ffffff', { n: 24 * k, r: 0.8 * k, h: 2.5 }); fx.slash(p, '#c0ffd0', { size: 1.2 * k }); break;
    case 'earth': fx.burst(ground, ['#8a6a4a', '#5a4a3a', '#c8a070'], { n: 40 * k, speed: 4, up: 2.5, g: -14, size: 0.22, life: 1.1 }); fx.ring(ground, '#c8a070', { r: 2.4 * k }); break;
    case 'light': fx.pillar(ground, '#fff4c0', { r: 0.8 * k, h: 7 }); fx.burst(p, ['#ffffff', '#fff4c0'], { n: 40 * k, speed: 2.5, g: 1, rise: 1, size: 0.08, life: 1.2 }); fx.glow(p, '#ffffff', { size: 3 * k }); break;
    case 'dark': fx.implode(p, '#a050ff', { n: 40 * k, r: 2 * k }); fx.glow(p, '#5a1a8a', { size: 3 * k, life: 0.6 }); fx.burst(p, ['#3a0a5a', '#a050ff'], { n: 20 * k, speed: 3, g: 0, life: 0.8 }); break;
    case 'slash': fx.slash(p, '#ffffff', { size: 1.3 * k }); fx.burst(p, ['#ffffff', '#ffe8a0'], { n: 10 * k, speed: 4, size: 0.06, life: 0.3 }); break;
    case 'pierce': fx.beam(new THREE.Vector3(p.x + 1.2, p.y, p.z), new THREE.Vector3(p.x - 0.8, p.y, p.z), '#ffffff', { w: 0.05 * k }); fx.burst(p, ['#ffffff'], { n: 8 * k, speed: 5, size: 0.06, life: 0.3 }); break;
    case 'strike': fx.glow(p, '#ffe8c0', { size: 1.8 * k, life: 0.25 }); fx.burst(p, ['#ffe8a0', '#ffffff', '#c8a070'], { n: 16 * k, speed: 5, size: 0.1, life: 0.4 }); fx.ring(p, '#ffffff', { r: 1.2 * k, life: 0.3 }); break;
    case 'shot': fx.burst(p, ['#ffe070', '#ffffff'], { n: 12 * k, speed: 5, size: 0.07, life: 0.35 }); fx.glow(p, '#ffd070', { size: 1.2 * k, life: 0.2 }); break;
    case 'heal': fx.burst(new THREE.Vector3(p.x, 0.3, p.z), ['#a0ffb0', '#ffffff', '#60ff90'], { n: 24, speed: 0.6, g: 2.5, rise: 1.2, size: 0.08, life: 1.1 }); fx.ring(ground, '#80ffa0', { r: 1.4 }); break;
    case 'buff': fx.ring(ground, '#ffe070', { r: 1.4 }); fx.ring(new THREE.Vector3(p.x, 0.8, p.z), '#ffffff', { r: 1.2, y: 0.8, life: 0.7 }); fx.burst(p, ['#ffe070'], { n: 14, speed: 1, g: 2, rise: 1, size: 0.07, life: 0.8 }); break;
    case 'debuff': fx.implode(p, '#9a6ab8', { n: 18, r: 1.2 }); break;
    case 'revive': fx.pillar(ground, '#fff8e0', { r: 0.6, h: 5 }); fx.burst(new THREE.Vector3(p.x, 0.3, p.z), ['#fff8c0', '#ffffff'], { n: 30, speed: 0.8, g: 3, rise: 1.5, size: 0.08, life: 1.3 }); break;
    default: fx.burst(p, ['#ffffff', '#c8c8ff'], { n: 20 * k, speed: 4, size: 0.1, life: 0.6 }); fx.glow(p, '#ffffff', { size: 2 * k });
  }
}
