// Things made of bricks that are not the ground: the heroes and townsfolk (minifigs with capes, helms, crowns and
// weapons), treasure chests, the save crystal, signposts, the vehicles (a dashbird, a ship, the airship).
import * as THREE from '../../lib/three.module.min.js';
import { makeFig, plastic, rbox } from '../brick/minifig.js';
import { CHARS } from '../data/chars.js';

const mk = (g, m, p) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
const metal = (c, o = {}) => plastic(c, { metalness: 0.7, roughness: 0.3, ...o });
const glow = (c, i = 0.8) => plastic(c, { emissive: c, emissiveIntensity: i });
const cache = new Map(); const geo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

// ---------------------------------------------------------------- weapons, in the figure's units (millimetres)
export function weaponMesh(kind, color) {
  const g = new THREE.Group();
  if (kind === 'sword' || kind === 'katana') {
    mk(geo('hilt', () => new THREE.CylinderGeometry(0.75, 0.75, 5, 8)), plastic('#4a2a1a'), g).position.y = 1;
    if (kind === 'sword') mk(geo('guard', () => rbox(6, 1.1, 1.6, 0.3)), metal('#d8a838'), g).position.y = 3.8;
    else mk(geo('tsuba', () => new THREE.CylinderGeometry(2, 2, 0.6, 12)), metal('#2a2a2a'), g).position.y = 3.8;
    const bl = mk(geo('blade' + kind, () => kind === 'katana' ? rbox(1.3, 17, 0.5, 0.25) : rbox(1.9, 16, 0.55, 0.25)), metal(color || '#d0d4dc', { roughness: 0.2 }), g); bl.position.y = 12.5; if (kind === 'katana') bl.rotation.z = -0.06;
  } else if (kind === 'spear') {
    mk(geo('shaft', () => new THREE.CylinderGeometry(0.6, 0.6, 30, 8)), plastic('#6a4a2a'), g).position.y = 8;
    const tip = mk(geo('tip', () => new THREE.ConeGeometry(1.4, 6, 4)), metal(color || '#d0d4dc'), g); tip.position.y = 26;
  } else if (kind === 'staff') {
    mk(geo('stf', () => new THREE.CylinderGeometry(0.7, 0.8, 24, 8)), plastic('#8a5a2a'), g).position.y = 6;
    const gem = mk(geo('gem', () => new THREE.OctahedronGeometry(2.4)), glow(color || '#7af0ff', 0.9), g); gem.position.y = 20;
    const ring = mk(geo('ring', () => new THREE.TorusGeometry(2.8, 0.45, 8, 20)), metal('#d8a838'), g); ring.position.y = 20;
  } else if (kind === 'axe') {
    mk(geo('axh', () => new THREE.CylinderGeometry(0.8, 0.8, 18, 8)), plastic('#5a3a1a'), g).position.y = 5;
    const head = mk(geo('axe', () => { const s = new THREE.Shape(); s.moveTo(0, -4); s.quadraticCurveTo(7, -6, 8, 0); s.quadraticCurveTo(7, 6, 0, 4); s.lineTo(0, -4); return new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3 }).translate(0.8, 0, -0.6); }), metal(color || '#a8acb4'), g); head.position.y = 12;
  } else if (kind === 'gun') {
    const b = mk(geo('gunb', () => rbox(2, 2.2, 10, 0.4)), metal(color || '#5a5a66'), g); b.position.set(0, 3, 4);
    mk(geo('gung', () => rbox(1.8, 4, 2.4, 0.4)), plastic('#6a3a1a'), g).position.set(0, 0.5, 0.5);
    g.rotation.x = -Math.PI / 2 + 0.3;
  } else if (kind === 'bow') {
    const arc = mk(geo('bow', () => new THREE.TorusGeometry(9, 0.6, 6, 20, Math.PI)), plastic('#8a5a2a'), g); arc.rotation.z = -Math.PI / 2; arc.position.y = 3;
  }
  return g;
}
// what goes on top of a minifig: a cape, shoulder plates, a helm or crown, goggles, a scarf, a hood, wings, horns
export function dress(F, gear = {}) {
  const b = F.body, h = F.headP, top = F.kid ? 19.6 : 23.4;
  if (gear.cape) { const c = mk(geo('cape' + F.kid, () => { const g = new THREE.PlaneGeometry(14, F.kid ? 15 : 19, 1, 6); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -((y - 9) ** 2) * 0.012); } return g.translate(0, -(F.kid ? 7.5 : 9.5), 0); }), plastic(gear.cape, { side: THREE.DoubleSide }), b); c.position.set(0, top + 2.4, -4.6); c.rotation.x = 0.12; F.cape = c; }
  if (gear.shoulder) for (const s of [-1, 1]) { const p = mk(geo('pad', () => new THREE.SphereGeometry(3.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)), metal(gear.shoulder), b); p.position.set(s * 6.6, top + 0.4, 0); p.scale.set(1, 0.6, 1.1); }
  if (gear.helm) { const m = mk(geo('helm', () => new THREE.SphereGeometry(6.1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)), metal(gear.helm), h); m.position.y = 5.2; const nose = mk(geo('nose', () => rbox(1.2, 4, 1.2, 0.3)), metal(gear.helm), h); nose.position.set(0, 6, 5.6); }
  if (gear.crown) { const cr = new THREE.Group(); h.add(cr); cr.position.y = 9.6; mk(geo('crownb', () => new THREE.CylinderGeometry(5.2, 5.0, 2.2, 20, 1, true)), metal(gear.crown, { side: THREE.DoubleSide }), cr); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, sp = mk(geo('crowns', () => new THREE.ConeGeometry(0.9, 3, 4)), metal(gear.crown), cr); sp.position.set(Math.sin(a) * 5, 2.4, Math.cos(a) * 5); } }
  if (gear.goggles) { const g = mk(geo('gog', () => new THREE.TorusGeometry(5.9, 0.7, 8, 28)), plastic('#3a2a1a'), h); g.position.y = 8.2; g.rotation.x = Math.PI / 2; for (const s of [-1, 1]) { const l = mk(geo('lens', () => new THREE.CylinderGeometry(1.7, 1.7, 1.4, 14)), metal(gear.goggles), h); l.position.set(s * 2.4, 9.2, 4.6); l.rotation.x = Math.PI / 2 - 0.5; } }
  if (gear.scarf) { const s = mk(geo('scarf', () => new THREE.TorusGeometry(4.4, 1.3, 8, 20)), plastic(gear.scarf), b); s.position.y = top + 1.6; s.rotation.x = Math.PI / 2; const t = mk(geo('scarft', () => rbox(2.6, 7, 0.9, 0.3)), plastic(gear.scarf), b); t.position.set(-3, top - 2.6, -4.4); t.rotation.z = 0.3; F.scarfTail = t; }
  if (gear.hood) { const m = mk(geo('hood', () => new THREE.SphereGeometry(6.4, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.62)), plastic(gear.hood), h); m.position.set(0, 4.6, -0.6); }
  if (gear.wizard) { const m = mk(geo('wiz', () => new THREE.ConeGeometry(6, 12, 20)), plastic(gear.wizard), h); m.position.y = 14; m.rotation.z = 0.15; const br = mk(geo('wizb', () => new THREE.CylinderGeometry(9, 9, 0.8, 24)), plastic(gear.wizard), h); br.position.y = 8.6; }
  if (gear.wings) for (const s of [-1, 1]) { const w = mk(geo('wing', () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(10, 10, 20, 14); sh.quadraticCurveTo(16, 4, 18, -4); sh.quadraticCurveTo(10, -2, 0, -6); return new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false }); }), plastic(gear.wings, { side: THREE.DoubleSide }), b); w.position.set(s * 2, top - 2, -4.6); w.scale.set(s, 1, 1); w.rotation.y = s * 0.5; (F.wings ||= []).push(w); }
  if (gear.horns) for (const s of [-1, 1]) { const hn = mk(geo('horn', () => new THREE.ConeGeometry(1.2, 6, 8)), plastic(gear.horns), h); hn.position.set(s * 4, 10, 0); hn.rotation.z = -s * 0.6; }
  if (gear.beardLong) { const bd = mk(geo('beardl', () => new THREE.ConeGeometry(4, 9, 12)), plastic(gear.beardLong), h); bd.position.set(0, -1.5, 4); bd.rotation.x = Math.PI; }
  if (gear.lantern) { const l = mk(geo('lant', () => rbox(3, 4, 3, 0.4)), glow('#ffd84a', 1.2), F.hands[1]); l.position.y = -5; }
  if (gear.weapon) { const w = weaponMesh(gear.weapon, gear.wcolor); const grip = new THREE.Group(); grip.rotation.x = Math.PI / 2 - 1.05; F.hands[0].add(grip); grip.add(w); F.weapon = w; F.grip = grip; }
  return F;
}
export function heroFig(id) {
  const c = CHARS[id]; const F = makeFig(c.spec);
  dress(F, { ...c.gear, weapon: c.weapon, wcolor: c.gear?.staffGem });
  return F;
}
export function npcFig(spec, gear) { return dress(makeFig(spec), gear || {}); }
// townsfolk from a short code: a few looks to pick from, varied by seed
const LOOKS = {
  man: (r) => ({ age: 'adult', colors: { top: pick(r, ['#5a7a3a', '#8a5a3a', '#3a5a8a', '#7a3a3a', '#5a5a5a']), bottom: pick(r, ['#3a3a4a', '#5a4a3a', '#2a3a5a']) }, outfit: { top: pick(r, ['coat', 'tee', 'hoodie']) }, hair: { style: pick(r, ['short', 'spiky', 'short']), color: pick(r, ['#3a2418', '#1c1c1c', '#8a5a2a', '#c8a050']) }, stubble: r() < 0.3, mustache: r() < 0.2 ? '#3a2418' : null }),
  woman: (r) => ({ age: 'adult', lashes: true, colors: { top: pick(r, ['#c85a7a', '#5a8ac8', '#e8c040', '#7ac85a', '#a85ac8']), bottom: pick(r, ['#f0e6cc', '#3a3a4a', '#8a5a3a']) }, outfit: { top: pick(r, ['coat', 'tee']), bottom: 'skirt' }, hair: { style: pick(r, ['ponytail', 'bun', 'short']), color: pick(r, ['#3a2418', '#1c1c1c', '#c8a050', '#a8401e']) } }),
  kid: (r) => ({ age: 'kid', cheeks: true, colors: { top: pick(r, ['#ff6a3a', '#3ab8ff', '#ffd84a', '#7ae85a']), bottom: pick(r, ['#3a5aa8', '#5a3a2a']) }, outfit: { top: 'tee' }, hair: { style: pick(r, ['spiky', 'ponytail', 'short']), color: pick(r, ['#3a2418', '#1c1c1c', '#8a5a2a']) } }),
  elder: (r) => ({ age: 'elder', beard: r() < 0.6 ? '#e8e8e8' : null, colors: { top: pick(r, ['#6a5a4a', '#4a5a6a', '#7a6a5a']), bottom: '#3a3a3a' }, outfit: { top: 'robe' }, robe: { inner: '#e8e0c8', trim: '#8a6a3a' }, hair: { style: pick(r, ['bald', 'short', 'bun']), color: '#e8e8e8' } }),
  guard: (r) => ({ age: 'adult', swordBrows: true, colors: { top: '#c8ccd4', bottom: '#2a3a6a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#3a2418' } }),
  merchant: (r) => ({ age: 'adult', mustache: '#3a2418', colors: { top: '#8a3a2a', bottom: '#3a3a3a' }, outfit: { top: 'coat', apron: '#e8dcc0' }, hair: { style: 'short', color: '#3a2418' } }),
  sailor: (r) => ({ age: 'adult', stubble: true, colors: { top: '#f0f0f0', bottom: '#2a3a6a' }, outfit: { top: 'tee' }, hair: { style: 'short', color: '#3a2418' }, hat: { type: 'cap', color: '#2a3a6a' } }),
  miner: (r) => ({ age: 'adult', beard: pick(r, ['#5a3a1a', '#8a4a20', '#3a2a1a']), colors: { top: '#6a5a4a', bottom: '#3a3a40' }, outfit: { top: 'coat', apron: '#3a2a1a' }, hair: { style: 'short', color: '#5a3a1a' } }),
  priest: (r) => ({ age: 'adult', colors: { top: '#f4f0e6', bottom: '#f4f0e6' }, outfit: { top: 'robe' }, robe: { inner: '#7ad8ff', trim: '#c8a040' }, hair: { style: 'short', color: '#8a8a8a' } }),
  monk: (r) => ({ age: 'adult', colors: { top: '#c8282a', bottom: '#f0e6cc' }, outfit: { top: 'robe' }, robe: { inner: '#f0e6cc', trim: '#d8a838' }, hair: { style: 'bald' } }),
};
const GEAR = { guard: { helm: '#c8ccd4', weapon: 'spear', cape: '#2a3a8a' }, sailor: {}, miner: { helm: '#d8a838' }, priest: { hood: '#f4f0e6' } };
function pick(r, a) { return a[Math.floor(r() * a.length)]; }
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function townsfolk(look, seed = 1, extra = {}) {
  const r = rng(seed * 7919 + 13), spec = { ...(LOOKS[look] || LOOKS.man)(r), ...(extra.spec || {}) };
  if (extra.skin) spec.skinBrick = extra.skin;
  return npcFig(spec, { ...(GEAR[look] || {}), ...(extra.gear || {}) });
}

// ---------------------------------------------------------------- props
export function chestMesh(open = false, rare = false) {
  const g = new THREE.Group(), S = 0.06;
  const base = mk(geo('chb', () => rbox(14, 8, 10, 0.8)), plastic(rare ? '#5a3a8a' : '#8a4a20'), g); base.position.y = 4;
  const lid = new THREE.Group(); lid.position.set(0, 8, -5); g.add(lid);
  const l = mk(geo('chl', () => new THREE.CylinderGeometry(5, 5, 14, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2)), plastic(rare ? '#6a4a9a' : '#9a5a2a'), lid); l.position.z = 5;
  for (const x of [-5, 5]) { const band = mk(geo('chband', () => rbox(1.6, 8.4, 10.4, 0.3)), metal('#d8a838'), g); band.position.set(x, 4, 0); }
  const lock = mk(geo('chlock', () => rbox(2.4, 3, 1, 0.3)), metal('#ffd84a'), g); lock.position.set(0, 7, 5.3);
  lid.rotation.x = open ? -1.9 : 0; g.scale.setScalar(S); g.userData.lid = lid;
  return g;
}
export function saveCrystal() {
  const g = new THREE.Group();
  const c = mk(geo('savec', () => new THREE.OctahedronGeometry(0.42)), plastic('#7af0ff', { emissive: '#3ab8ff', emissiveIntensity: 0.9, transparent: true, opacity: 0.9 }), g); c.position.y = 1.2; c.scale.y = 1.6;
  const ped = mk(geo('saveped', () => new THREE.CylinderGeometry(0.4, 0.55, 0.35, 8)), plastic('#ecebe4'), g); ped.position.y = 0.18;
  const light = new THREE.PointLight('#7af0ff', 1.2, 5, 1.6); light.position.y = 1.3; g.add(light);
  g.userData.spin = c; return g;
}
export function signpost(color = '#8a5a2a') {
  const g = new THREE.Group(); const p = mk(geo('sgp', () => new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6)), plastic('#5a3a1a'), g); p.position.y = 0.5;
  const b = mk(geo('sgb', () => new THREE.BoxGeometry(0.7, 0.35, 0.06)), plastic(color), g); b.position.y = 0.9; return g;
}
export function questMark(color = '#ffd84a') { // the "!" over someone who has something for you
  const g = new THREE.Group(); const m = glow(color, 1);
  mk(geo('qm1', () => new THREE.CylinderGeometry(0.07, 0.04, 0.32, 8)), m, g).position.y = 0.22; mk(geo('qm2', () => new THREE.SphereGeometry(0.06, 8, 6)), m, g).position.y = 0; return g;
}
// ---------------------------------------------------------------- vehicles
export function dashbird(color = '#ffd84a') {
  const g = new THREE.Group(), S = 0.07, b = new THREE.Group(); b.scale.setScalar(S); g.add(b);
  const body = mk(geo('dbb', () => new THREE.SphereGeometry(7, 20, 14)), plastic(color), b); body.scale.set(1, 0.9, 1.3); body.position.y = 16;
  const neck = mk(geo('dbn', () => new THREE.CylinderGeometry(2.4, 3.2, 10, 12)), plastic(color), b); neck.position.set(0, 22, 6); neck.rotation.x = 0.5;
  const head = mk(geo('dbh', () => new THREE.SphereGeometry(4, 16, 12)), plastic(color), b); head.position.set(0, 27, 9);
  const beak = mk(geo('dbk', () => new THREE.ConeGeometry(1.6, 5, 8)), plastic('#e8862a'), b); beak.position.set(0, 26.5, 13.5); beak.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const e = mk(geo('dbe', () => new THREE.SphereGeometry(0.9, 8, 6)), plastic('#1c1c1c'), b); e.position.set(s * 2.6, 28, 11.5); }
  const legs = []; for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.set(s * 3, 11, 0); b.add(l); mk(geo('dbl', () => new THREE.CylinderGeometry(0.9, 0.9, 11, 8).translate(0, -5.5, 0)), plastic('#e8862a'), l); const f = mk(geo('dbf', () => rbox(3, 1, 5, 0.3)), plastic('#e8862a'), l); f.position.set(0, -11, 1.5); legs.push(l); }
  const tail = mk(geo('dbt', () => new THREE.ConeGeometry(4, 8, 8)), plastic(color), b); tail.position.set(0, 19, -9); tail.rotation.x = -2.2;
  g.userData.legs = legs; g.userData.seatY = 1.55; return g;
}
export function shipMesh() {
  const g = new THREE.Group();
  const hull = mk(geo('shh', () => { const s = new THREE.Shape(); s.moveTo(-1.4, -3); s.lineTo(1.4, -3); s.lineTo(1.6, 2); s.quadraticCurveTo(0, 4.4, -1.6, 2); s.lineTo(-1.4, -3); return new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 }).rotateX(Math.PI / 2).translate(0, 1.2, 0); }), plastic('#8a4a20'), g); hull.position.y = -0.3;
  const deck = mk(geo('shd', () => new THREE.BoxGeometry(2.8, 0.15, 5)), plastic('#c8945a'), g); deck.position.set(0, 0.95, -0.3);
  const mast = mk(geo('shm', () => new THREE.CylinderGeometry(0.1, 0.12, 5, 8)), plastic('#5a3a1a'), g); mast.position.set(0, 3.4, 0.2);
  const sail = mk(geo('shs', () => { const p = new THREE.PlaneGeometry(3, 2.6, 6, 4); const a = p.attributes.position; for (let i = 0; i < a.count; i++) a.setZ(i, Math.cos(a.getX(i) / 1.5) * 0.4); return p; }), plastic('#f4f0e6', { side: THREE.DoubleSide }), g); sail.position.set(0, 3.6, 0.45);
  const flag = mk(geo('shf', () => new THREE.PlaneGeometry(0.8, 0.5)), plastic('#2a5ab0', { side: THREE.DoubleSide }), g); flag.position.set(0.4, 6, 0.2);
  g.userData.seatY = 1.0; return g;
}
export function airshipMesh() {
  const g = new THREE.Group();
  const hull = mk(geo('ash', () => new THREE.CapsuleGeometry(1.1, 4.4, 6, 14).rotateX(Math.PI / 2)), plastic('#c8c8d0', { metalness: 0.4 }), g); hull.position.y = 0.6; hull.scale.set(1, 0.7, 1);
  const deck = mk(geo('asd', () => new THREE.BoxGeometry(1.8, 0.12, 4.2)), plastic('#9a6a3e'), g); deck.position.y = 1.15;
  const bal = mk(geo('asb', () => new THREE.CapsuleGeometry(1.6, 4.6, 8, 18).rotateX(Math.PI / 2)), plastic('#e8e8f0'), g); bal.position.y = 3.4; bal.scale.set(1, 0.75, 1);
  const stripe = mk(geo('ass', () => new THREE.TorusGeometry(1.62, 0.12, 6, 30)), plastic('#2a5ab0'), g); stripe.position.y = 3.4; stripe.scale.set(1, 0.75, 1);
  for (const s of [-1, 1]) { const w = mk(geo('asw', () => rbox(2.6, 0.12, 1.2, 0.1)), plastic('#c8c8d0'), g); w.position.set(s * 1.9, 0.9, -0.4); w.rotation.z = s * 0.15; }
  const props = []; for (const s of [-1, 1]) { const pr = new THREE.Group(); pr.position.set(s * 3, 0.95, -0.9); g.add(pr); for (let k = 0; k < 3; k++) { const bl = mk(geo('asp', () => new THREE.BoxGeometry(0.12, 1.4, 0.05)), plastic('#5a3a1a'), pr); bl.rotation.z = k * Math.PI / 3 * 2; } pr.rotation.y = Math.PI / 2; props.push(pr); }
  const tail = mk(geo('ast', () => new THREE.ConeGeometry(0.8, 1.6, 4)), plastic('#2a5ab0'), g); tail.position.set(0, 3.4, -3.6); tail.rotation.x = -Math.PI / 2;
  g.userData.props = props; g.userData.seatY = 1.2; return g;
}
