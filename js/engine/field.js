// Walking about: the map as a brick diorama under a tilted camera, the party in a line behind the leader, townsfolk,
// chests, save crystals, signs, ways out, random fights, and on the world map the dashbird, the ship and the airship.
import * as THREE from '../../lib/three.module.min.js';
import { VS, B } from './voxel.js';
import { heroFig, townsfolk, npcFig, chestMesh, saveCrystal, signpost, questMark, dashbird, shipMesh, airshipMesh, rng } from './models.js';
import { makeFig } from '../brick/minifig.js';
import { I } from './input.js';
import { sfx } from './audio.js';

const tmpV = new THREE.Vector3();
export class Field {
  constructor(renderer) {
    this.R = renderer; this.scene = new THREE.Scene(); this.cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.5, 400);
    this.xray = new THREE.Scene(); this.xmat = new THREE.MeshBasicMaterial({ color: '#7ab8ff', transparent: true, opacity: 0.45, depthFunc: THREE.GreaterDepth, depthWrite: false });
    this.actors = []; this.npcs = []; this.props = []; this.party = []; this.trail = []; this.control = true; this.camOff = { dist: 15, pitch: 0.92 }; this.camFocus = null; this.shakeT = 0;
    this.lightPool = []; this.time = 0; this.encCount = 20; this.vehicle = null;
  }
  // ---------------------------------------------------------------- building a map's scene
  build(M, opts = {}) {
    const old = this.scene; old.traverse((o) => { if (o.geometry && !o.geometry.userData?.keep) o.geometry.dispose?.(); }); this.scene = new THREE.Scene(); this.M = M; this.actors = []; this.npcs = []; this.props = []; this.lightPool = [];
    const th = M.th, S = this.scene;
    S.background = skyTex(th.sky || ['#7ab8f0', '#e0f0ff']);
    const big = M.W * M.D > 20000; S.fog = new THREE.Fog(th.fog || '#d8ecff', big ? 26 : 22, big ? 70 : 60);
    const hemi = new THREE.HemisphereLight(th.sky?.[1] || '#ffffff', '#5a4a3a', (th.amb ?? 0.6) * 1.1); hemi.layers.enable(1); S.add(hemi);
    const sun = new THREE.DirectionalLight(th.sun || '#fff4e0', (th.amb ?? 0.6) * 1.9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02; sun.layers.enable(1); sun.shadow.camera.layers.enable(1); S.add(sun); S.add(sun.target); this.sun = sun;
    M.V.mesh(S); this.V = M.V;
    for (let i = 0; i < (M.world ? 2 : 6); i++) { const L = new THREE.PointLight('#ffffff', 0, 7, 1.6); L.layers.enable(1); S.add(L); this.lightPool.push(L); }
    this.lightT = 0;
    // props
    for (const p of M.props) this.addProp(p);
    this.party = []; this.trail = [];
    return S;
  }
  addProp(p) {
    const M = this.M; let o = null;
    if (p.type === 'chest') { o = chestMesh(p.open, p.rare); M.block(p.x, p.z, true); }
    else if (p.type === 'save') { o = saveCrystal(); M.block(p.x, p.z, true); }
    else if (p.type === 'sign') { o = signpost(); M.block(p.x, p.z, true); }
    else if (p.type === 'altar') { o = crystalAltar(p.color || '#7af0ff', p.broken); M.block(p.x, p.z, true); }
    else if (p.type === 'pickup') { o = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: p.color || '#ffe070', emissive: p.color || '#ffe070', emissiveIntensity: 0.8 })); b.position.y = 0.35; o.add(b); o.userData.spin = b; const L = new THREE.PointLight(p.color || '#ffe070', 1.2, 3, 1.5); L.position.y = 0.6; o.add(L); }
    else if (p.type === 'stairs') return;
    else if (p.type === 'mesh' && p.mesh) o = p.mesh;
    if (!o) return;
    o.position.set((p.x + 0.5) * VS, M.h(p.x, p.z) * VS, (p.z + 0.5) * VS); if (p.dir != null) o.rotation.y = p.dir;
    this.scene.add(o); p.obj = o; this.props.push(p); return p;
  }
  removeProp(p) { if (p.obj) this.scene.remove(p.obj); this.M.block(p.x, p.z, false); this.props = this.props.filter((q) => q !== p); }
  // ---------------------------------------------------------------- actors
  makeActor(F, x, z, dir = 0, o = {}) {
    const a = { F, root: F.root, x: x + 0.5, z: z + 0.5, y: this.M ? this.M.h(x, z) : 0, dir, walk: 0, moving: false, speed: 4.5, blink: Math.random() * 4, id: o.id, ...o };
    this.scene.add(F.root); this.actors.push(a); this.place(a); return a;
  }
  place(a) { a.root.position.set(a.x * VS, a.y * VS, a.z * VS); a.root.rotation.y = a.dir; }
  setParty(ids, x, z, dir) {
    for (const p of this.party) { this.scene.remove(p.root); this.actors = this.actors.filter((a) => a !== p); }
    this.party = ids.map((id, i) => this.makeActor(heroFig(id), x, z, dir, { id, hero: true }));
    this.leader = this.party[0]; this.trail = []; if (this.leader) this.onLayer1(this.leader.root);
    for (let i = 0; i < 40; i++) this.trail.push({ x: this.leader.x, z: this.leader.z, y: this.leader.y, dir });
    this.camSnap();
  }
  addNpc(def) {
    const M = this.M; let pos = def.at;
    if (typeof pos === 'string') pos = M.spots[pos] ? [M.spots[pos].x, M.spots[pos].z, M.spots[pos].dir] : null;
    else if (Array.isArray(pos) && typeof pos[0] === 'string') { const s = M.spots[pos[0]]; pos = s ? [s.x + (pos[1] || 0), s.z + (pos[2] || 0), s.dir] : null; }
    if (!pos) return null;
    if (!def.anywhere && !M.walkable(pos[0], pos[1])) { // the nearest free cell
      let best = null; for (let r = 1; r < 6 && !best; r++) for (let dz = -r; dz <= r && !best; dz++) for (let dx = -r; dx <= r; dx++) { const x = pos[0] + dx, z = pos[1] + dz; if (M.walkable(x, z) && Math.abs(M.h(x, z) - M.h(pos[0], pos[1])) <= 2) { best = [x, z, pos[2]]; break; } }
      if (best) pos = best;
    }
    let F;
    if (def.hero) F = heroFig(def.hero); else if (def.spec) F = npcFig(def.spec, def.gear); else if (def.fig) F = def.fig(); else F = townsfolk(def.look || 'man', def.seed ?? hashId(def.id), { gear: def.gear, spec: def.specX, skin: def.skin });
    if (def.scale) F.root.scale.setScalar(def.scale);
    const a = this.makeActor(F, pos[0], pos[1], def.dir ?? pos[2] ?? 0, { id: def.id, npc: def, home: [pos[0], pos[1]] });
    this.npcs.push(a); if (!def.ghost) M.block(pos[0], pos[1], true);
    if (def.mark) { a.mark = questMark(def.markColor); a.mark.scale.setScalar(2); F.root.add(a.mark); a.mark.position.y = (F.kid ? 1.5 : 1.85) / F.root.scale.y + 0.3; }
    return a;
  }
  removeNpc(id) { const a = this.npcs.find((n) => n.id === id); if (!a) return; this.scene.remove(a.root); this.npcs = this.npcs.filter((n) => n !== a); this.actors = this.actors.filter((n) => n !== a); this.M.block(Math.floor(a.x), Math.floor(a.z), false); }
  npc(id) { return this.npcs.find((n) => n.id === id) || this.party.find((p) => p.id === id); }
  // ---------------------------------------------------------------- moving
  passable(fx, fz, tx, tz, a) {
    const M = this.M; if (!M.in(tx, tz)) return false;
    const f = M.flags[M.i(tx, tz)];
    if (this.vehicle === 'airship') return true;
    if (this.vehicle === 'ship') return !!(f & 2) && !(f & 1);
    if (f & 1 || f & 16) return (fx === tx && fz === tz);
    if (f & 2) return false;
    if ((f & 32) && this.vehicle !== 'dashbird') return false;
    if (Math.abs(M.h(tx, tz) - M.h(fx, fz)) > 1) return false;
    return true;
  }
  tryMove(a, dx, dz) {
    const r = 0.26, M = this.M, cx = Math.floor(a.x), cz = Math.floor(a.z);
    const ok = (nx, nz) => { for (const [ox, oz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { const tx = Math.floor(nx + ox), tz = Math.floor(nz + oz); if ((tx !== cx || tz !== cz) && !this.passable(cx, cz, tx, tz, a)) return false; } return true; };
    let moved = false;
    if (dx && ok(a.x + dx, a.z)) { a.x += dx; moved = true; }
    if (dz && ok(a.x, a.z + dz)) { a.z += dz; moved = true; }
    return moved;
  }
  update(dt) {
    const M = this.M; if (!M) return; this.time += dt;
    // the player
    const L = this.leader;
    if (L && this.control) {
      const ax = I.axis();
      if (ax.l > 0.15) {
        const sp = (this.vehicle === 'airship' ? 14 : this.vehicle === 'ship' ? 9 : this.vehicle === 'dashbird' ? 10 : I.down('run') ? 7.6 : 5.4) * Math.max(0.45, ax.l) * dt;
        const before = [L.x, L.z]; this.tryMove(L, ax.x * sp, ax.z * sp);
        const moved = Math.hypot(L.x - before[0], L.z - before[1]);
        L.dir = lerpAngle(L.dir, Math.atan2(ax.x, ax.z), Math.min(1, dt * 14)); L.moving = moved > 0.0005; L.walk += moved * 2.2;
        if (moved) { this.onStep?.(moved); this.pushTrail(); }
      } else L.moving = false;
    }
    // heights, poses
    for (const a of this.actors) {
      const tx = Math.floor(a.x), tz = Math.floor(a.z), th = this.vehicle === 'airship' && a === L ? 16 : M.h(tx, tz);
      a.y += (th - a.y) * Math.min(1, dt * 12);
      this.pose(a, dt);
    }
    // the party follows along the trail
    if (L) this.party.forEach((p, i) => { if (!i) return; const t = this.trail[Math.min(this.trail.length - 1, i * 7)]; if (!t) return; const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz); p.moving = d > 0.02 && L.moving; if (d > 0.001) { p.x += dx * Math.min(1, dt * 10); p.z += dz * Math.min(1, dt * 10); p.dir = lerpAngle(p.dir, Math.atan2(dx, dz), Math.min(1, dt * 10)); p.walk += d * 0.9; } p.root.visible = !this.vehicle; });
    // townsfolk wander
    for (const n of this.npcs) if (n.npc.wander && !n.busy && this.control) this.wander(n, dt);
    // props: spin the save crystals
    for (const p of this.props) { if (p.obj?.userData?.spin) { p.obj.userData.spin.rotation.y += dt * 1.5; p.obj.userData.spin.position.y = (p.type === 'pickup' ? 0.35 : 1.2) + Math.sin(this.time * 2) * 0.08; } if (p.obj?.userData?.bob) p.obj.userData.bob.position.y = 1.6 + Math.sin(this.time * 1.6) * 0.12; }
    for (const n of this.npcs) if (n.mark) { n.mark.rotation.y += dt * 2; n.mark.position.y = (n.F.kid ? 1.5 : 1.85) / n.root.scale.y + 0.3 + Math.sin(this.time * 4) * 0.05; }
    // vehicles
    if (this.vObj) { const v = this.vObj; if (this.vehicle) { v.position.set(L.x * VS, (this.vehicle === 'airship' ? 16 : this.vehicle === 'ship' ? 2.1 : L.y) * VS, L.z * VS); v.rotation.y = L.dir; if (v.userData.props) for (const p of v.userData.props) p.rotation.x += dt * 20; if (v.userData.legs) v.userData.legs.forEach((l, i) => { l.rotation.x = L.moving ? Math.sin(L.walk * 3 + i * Math.PI) * 0.7 : 0; }); } }
    this.updateLights(dt); this.updateCam(dt);
  }
  pushTrail() { const L = this.leader, t0 = this.trail[0]; if (Math.hypot(L.x - t0.x, L.z - t0.z) > 0.12) { this.trail.unshift({ x: L.x, z: L.z, y: L.y, dir: L.dir }); this.trail.length = 40; } }
  pose(a, dt) {
    const F = a.F, w = a.moving ? Math.sin(a.walk * 3.2) : 0, k = a.moving ? 0.75 : 0;
    a.blink -= dt; const blink = a.blink < 0.12 ? 1 : 0; if (a.blink < 0) a.blink = 2.5 + Math.random() * 3;
    const riding = a === this.leader && this.vehicle;
    const ry = riding ? (this.vObj?.userData.seatY || 0) / VS : 0;
    F.pose({ x: a.x * VS, y: (a.y + ry / 1) * VS + (a.moving ? Math.abs(w) * 0.04 : Math.sin(this.time * 2 + a.x) * 0.005), z: a.z * VS, yaw: a.dir, hipL: riding ? -1.3 : w * k, hipR: riding ? -1.3 : -w * k, armL: -0.2 - w * k * 0.8 + (a.armL || 0), armR: -0.2 + w * k * 0.8 + (a.armR || 0), head: a.head || 0, tilt: a.tilt || 0 });
    if (riding && this.vehicle !== 'dashbird') { F.root.position.y = ((this.vehicle === 'airship' ? 16 : 2.1) + 1.0) * VS + 0.1; }
    if (F.cape) F.cape.rotation.x = 0.12 + (a.moving ? 0.35 + Math.abs(w) * 0.1 : Math.sin(this.time * 1.5) * 0.03);
    if (F.scarfTail) F.scarfTail.rotation.x = a.moving ? -0.6 : -0.1;
    F.face({ blink, mouth: a.talking ? { open: (Math.sin(this.time * 18) + 1) * 0.3, smile: 0.4 } : { smile: a.mood ?? 0.4 }, happy: a.happy ? 1 : 0, brow: a.brow || 0, browIn: a.browIn || 0, look: a.look || [0, 0] });
  }
  wander(n, dt) {
    n.wt = (n.wt ?? Math.random() * 3) - dt;
    if (n.goal) {
      const dx = n.goal[0] + 0.5 - n.x, dz = n.goal[1] + 0.5 - n.z, d = Math.hypot(dx, dz);
      if (d < 0.08) { n.goal = null; n.moving = false; this.M.block(Math.floor(n.x), Math.floor(n.z), true); return; }
      const s = Math.min(d, 1.8 * dt); n.x += dx / d * s; n.z += dz / d * s; n.dir = lerpAngle(n.dir, Math.atan2(dx, dz), dt * 8); n.moving = true; n.walk += s * 2.2; return;
    }
    if (n.wt > 0) return; n.wt = 2 + Math.random() * 4;
    const R = n.npc.wander, [hx, hz] = n.home, cx = Math.floor(n.x), cz = Math.floor(n.z);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]], [ddx, ddz] = dirs[Math.floor(Math.random() * 4)], tx = cx + ddx, tz = cz + ddz;
    if (Math.abs(tx - hx) > R || Math.abs(tz - hz) > R) return;
    const L = this.leader; if (L && Math.floor(L.x) === tx && Math.floor(L.z) === tz) return;
    if (!this.passable(cx, cz, tx, tz) || this.M.flags[this.M.i(tx, tz)] & 1) return;
    this.M.block(cx, cz, false); this.M.block(tx, tz, true); n.goal = [tx, tz];
  }
  // a scripted walk along cells; resolves on arrival
  walk(a, path, speed = 3.5) {
    return new Promise((res) => {
      if (a.npc) this.M.block(Math.floor(a.x), Math.floor(a.z), false);
      a.busy = true; const pts = path.map(([x, z]) => [x + 0.5, z + 0.5]); let i = 0;
      const step = (dt) => {
        if (i >= pts.length) { a.moving = false; a.busy = false; if (a.npc) this.M.block(Math.floor(a.x), Math.floor(a.z), true); if (a === this.leader) { for (const t of this.trail) { } } return true; }
        const [tx, tz] = pts[i], dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz);
        if (d < 0.05) { i++; return false; }
        const s = Math.min(d, speed * dt); a.x += dx / d * s; a.z += dz / d * s; a.dir = lerpAngle(a.dir, Math.atan2(dx, dz), Math.min(1, dt * 12)); a.moving = true; a.walk += s * 2.2;
        if (a === this.leader) this.pushTrail();
        return false;
      };
      this.tasks.push({ step, done: res });
    });
  }
  tasks = [];
  runTasks(dt) { for (let i = this.tasks.length - 1; i >= 0; i--) { const t = this.tasks[i]; if (t.step(dt)) { this.tasks.splice(i, 1); t.done(); } } }
  face(a, target) { if (typeof target === 'number') a.dir = target; else { a.dir = Math.atan2(target.x - a.x, target.z - a.z); } }
  // ---------------------------------------------------------------- what is in front of the leader
  facing() {
    const L = this.leader, fx = Math.sin(L.dir), fz = Math.cos(L.dir); let best = null, bd = 1.6;
    for (const n of this.npcs) { const dx = n.x - L.x, dz = n.z - L.z, d = Math.hypot(dx, dz); if (d < bd && (dx * fx + dz * fz) / (d || 1) > 0.4) { best = { npc: n }; bd = d; } }
    for (const p of this.props) { if (!['chest', 'save', 'sign', 'altar', 'pickup'].includes(p.type)) continue; const dx = p.x + 0.5 - L.x, dz = p.z + 0.5 - L.z, d = Math.hypot(dx, dz); if (d < Math.max(bd, 1.5) && (dx * fx + dz * fz) / (d || 1) > 0.3) { best = { prop: p }; bd = d; } }
    // shopkeepers behind counters: two cells away across a counter
    if (!best) for (const n of this.npcs) { if (!n.npc.counter) continue; const dx = n.x - L.x, dz = n.z - L.z, d = Math.hypot(dx, dz); if (d < 2.7 && (dx * fx + dz * fz) / (d || 1) > 0.6) best = { npc: n }; }
    return best;
  }
  cell() { return [Math.floor(this.leader.x), Math.floor(this.leader.z)]; }
  // ---------------------------------------------------------------- the camera
  camSnap() { this.updateCam(1, true); }
  updateCam(dt, snap) {
    const L = this.leader; if (!L) return;
    const f = this.camFocus || { x: L.x, z: L.z, y: L.y };
    const tgt = tmpV.set(f.x * VS, (f.y ?? L.y) * VS + 0.6, f.z * VS);
    const o = this.camOff, dist = o.dist * (this.camZoom || 1), p = o.pitch;
    const want = new THREE.Vector3(tgt.x, tgt.y + Math.sin(p) * dist, tgt.z + Math.cos(p) * dist);
    if (snap || !this.camPos) { this.camPos = want.clone(); this.camTgt = tgt.clone(); }
    const k = Math.min(1, dt * 5); this.camPos.lerp(want, k); this.camTgt.lerp(tgt, k);
    this.cam.position.copy(this.camPos); if (this.shakeT > 0) { this.shakeT -= dt; this.cam.position.x += (Math.random() - 0.5) * this.shakeA; this.cam.position.y += (Math.random() - 0.5) * this.shakeA; }
    this.cam.lookAt(this.camTgt);
    this.sun.position.set(this.camTgt.x + 12, this.camTgt.y + 22, this.camTgt.z + 8); this.sun.target.position.copy(this.camTgt);
    this.V.studsNear(this.scene, L.x, L.z, this.M.world ? 14 : 22);
    if (this.M.world || this.M.W * this.M.D > 4000) { const near = this.camOff.dist * 1.2 * (this.camZoom || 1); this.scene.fog.near = near; this.scene.fog.far = near + (this.M.world ? 46 : 40); }
  }
  shake(t = 0.4, a = 0.15) { this.shakeT = t; this.shakeA = a; }
  updateLights(dt) {
    this.lightT -= dt; if (this.lightT > 0 || !this.leader) return; this.lightT = 0.4;
    const L = this.leader, ls = this.M.lights.map((l) => [l, (l.x - L.x) ** 2 + (l.z - L.z) ** 2]).sort((a, b) => a[1] - b[1]);
    this.lightPool.forEach((P, i) => { const e = ls[i]; if (e && e[1] < 400) { P.position.set(e[0].x * VS, e[0].y * VS, e[0].z * VS); P.color.set(e[0].color); P.intensity = 2.2 * e[0].power; P.distance = 7; } else P.intensity = 0; });
  }
  // ---------------------------------------------------------------- vehicles
  setVehicle(kind) {
    if (this.vObj) { this.scene.remove(this.vObj); this.vObj = null; }
    this.vehicle = kind;
    if (kind) { this.vObj = kind === 'dashbird' ? dashbird() : kind === 'ship' ? shipMesh() : airshipMesh(); this.scene.add(this.vObj); }
    this.camOff = this.baseCam(kind);
  }
  baseCam(kind) {
    const M = this.M; if (kind === 'airship') return { dist: 34, pitch: 0.95 }; if (M?.world) return { dist: 22, pitch: 0.86 };
    if (M?.def.kind === 'dungeon') return { dist: 15, pitch: 0.92 }; if (M?.def.kind === 'room') return { dist: 13, pitch: 0.8 }; return { dist: 16, pitch: 0.78 };
  }
  parked = [];
  park(kind, x, z, dir = 0) { const o = kind === 'ship' ? shipMesh() : airshipMesh(); o.position.set((x + 0.5) * VS, (kind === 'ship' ? 2.1 : this.M.h(x, z)) * VS, (z + 0.5) * VS); o.rotation.y = dir; this.scene.add(o); this.parked.push({ kind, x, z, o }); }
  clearParked() { for (const p of this.parked) this.scene.remove(p.o); this.parked = []; }
  // ---------------------------------------------------------------- drawing (with the leader shown through walls)
  render() {
    // the world first (layer 0); then the leader where something hides them, as a pale silhouette; then the leader
    const R = this.R, L = this.leader, cam = this.cam;
    cam.layers.set(0); R.autoClear = true; R.render(this.scene, cam);
    if (!L) return;
    R.autoClear = false; cam.layers.set(1); const bg = this.scene.background; this.scene.background = null;
    if (this.vehicle !== 'airship') { this.scene.overrideMaterial = this.xmat; R.render(this.scene, cam); this.scene.overrideMaterial = null; }
    R.render(this.scene, cam); R.autoClear = true; cam.layers.set(0); this.scene.background = bg;
  }
  onLayer1(root) { root.traverse((o) => { if (o.isMesh) o.layers.set(1); }); }
  resize() { this.cam.aspect = innerWidth / innerHeight; this.cam.updateProjectionMatrix(); }
}
function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }
function hashId(s = 'x') { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
const skyCache = new Map();
export function skyTex([a, b]) {
  const k = a + b; if (skyCache.has(k)) return skyCache.get(k);
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; skyCache.set(k, t); return t;
}
// a crystal on its altar (whole, or shattered after its heart is taken)
export function crystalAltar(color, broken) {
  const g = new THREE.Group(), mat = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: broken ? 0.15 : 0.7, transparent: true, opacity: 0.85, roughness: 0.1, clearcoat: 1 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 8), new THREE.MeshLambertMaterial({ color: '#ecebe4' })); base.position.y = 0.25; base.receiveShadow = true; g.add(base);
  if (!broken) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), mat); c.scale.y = 1.8; c.position.y = 1.6; g.add(c); g.userData.bob = c; const L = new THREE.PointLight(color, 2.5, 8, 1.5); L.position.y = 1.6; g.add(L); }
  else for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.2 + Math.random() * 0.15), mat); s.position.set((Math.random() - 0.5) * 1.2, 0.6, (Math.random() - 0.5) * 1.2); s.rotation.set(Math.random() * 3, Math.random() * 3, 0); g.add(s); }
  return g;
}
