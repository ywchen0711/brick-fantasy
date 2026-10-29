// The corner of the screen while walking: where you are, what to do next, and a small map — the place drawn from
// its bricks, ways out, save crystals, unopened chests, people with something to say, the next step (pulsing)
// and you. N (or tapping the map) switches it between small, large and hidden.
import { COLOR, B } from './voxel.js';
import { G } from './state.js';
import { objective, target } from '../story/journal.js';

const SIZES = [150, 260, 0];
export const HUD = {
  el: null, base: null, M: null, size: 0, t: 0,
  init() {
    const el = document.getElementById('hud'); this.el = el;
    el.innerHTML = '<div class="where"></div><div class="next"></div><canvas class="mini"></canvas>';
    this.cv = el.querySelector('.mini'); this.ctx = this.cv.getContext('2d');
    this.cv.addEventListener('click', () => this.cycle());
    try { this.size = +(localStorage.getItem('bf.minimap') ?? 0) || 0; } catch (e) { }
  },
  cycle() { this.size = (this.size + 1) % SIZES.length; try { localStorage.setItem('bf.minimap', this.size); } catch (e) { } this.layout(); },
  // a new place: draw its bricks once
  show(M, name) {
    if (!this.el) this.init();
    this.M = M; this.el.querySelector('.where').textContent = name || '';
    const W = M.W, D = M.D, c = document.createElement('canvas'); c.width = W; c.height = D; const g = c.getContext('2d'), img = g.createImageData(W, D);
    const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = M.i(x, z), f = M.flags[i], h = M.floorH[i], top = M.V.top(x, z), b = M.V.get(x, top - 1, z);
      let col = rgb(COLOR[b] || '#444444');
      if (f & 2) col = [58, 122, 184];
      else if (f & 1 || Math.abs(h - top) > 1) col = col.map((v) => v * 0.45); // walls and things you cannot walk on
      else if (f & 4) col = col.map((v) => Math.min(255, v * 1.15 + 20));
      const shade = 0.85 + Math.min(0.3, (h - 3) * 0.05); const o = i * 4;
      img.data[o] = col[0] * shade; img.data[o + 1] = col[1] * shade; img.data[o + 2] = col[2] * shade; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0); this.base = c; this.layout(); this.draw();
  },
  layout() {
    if (!this.M) return; const s = SIZES[this.size], k = s / Math.max(this.M.W, this.M.D);
    this.k = k; this.cv.width = Math.round(this.M.W * k); this.cv.height = Math.round(this.M.D * k); this.cv.hidden = !s;
    this.el.classList.toggle('big', this.size === 1);
  },
  visible(on) { if (this.el) this.el.hidden = !on; },
  update(dt, field) { if (!this.M || this.el.hidden) return; this.t += dt; if ((this.tick = (this.tick || 0) + dt) < 0.1) return; this.tick = 0; this.field = field; this.draw(); },
  draw() {
    const n = this.el.querySelector('.next'), obj = objective(); if (n.textContent !== obj) n.textContent = obj;
    if (!SIZES[this.size] || !this.base) return;
    const g = this.ctx, k = this.k, M = this.M, f = this.field; g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, this.cv.width, this.cv.height); g.drawImage(this.base, 0, 0, this.cv.width, this.cv.height);
    const dot = (x, z, r, col, ring) => { g.beginPath(); g.arc((x + 0.5) * k, (z + 0.5) * k, r, 0, 7); g.fillStyle = col; g.fill(); if (ring) { g.lineWidth = 1.5; g.strokeStyle = ring; g.stroke(); } };
    for (const e of M.exits) { g.fillStyle = '#ffd84a'; g.fillRect(e.x0 * k - 1, e.z0 * k - 1, (e.x1 - e.x0 + 1) * k + 2, (e.z1 - e.z0 + 1) * k + 2); }
    if (f) {
      for (const p of f.props) { if (p.type === 'save') dot(p.x, p.z, Math.max(2.5, k * 0.9), '#7af0ff', '#ffffff'); if (p.type === 'chest' && !p.open) dot(p.x, p.z, Math.max(2, k * 0.7), '#d8a838', '#5a3a10'); if (p.type === 'pickup') dot(p.x, p.z, Math.max(2, k * 0.7), '#ff8ab0', '#ffffff'); }
      for (const a of f.npcs) { if (a.id === 'boss') dot(a.x - 0.5, a.z - 0.5, Math.max(3, k * 1.3), '#ff3a3a', '#ffffff'); else if (a.mark) dot(a.x - 0.5, a.z - 0.5, Math.max(2.5, k), '#ffe24a', '#1a1a1a'); }
    }
    // the next step
    let tg = target(M); if (tg?.npc && f) { const a = f.npc(tg.npc); tg = a ? { x: a.x - 0.5, z: a.z - 0.5, kind: 'goal' } : null; }
    const L = f?.leader;
    if (tg) {
      const pulse = 3 + Math.sin(this.t * 6) * 1.5, x = (tg.x + 0.5) * k, z = (tg.z + 0.5) * k;
      g.save(); g.translate(x, z); g.rotate(Math.PI / 4); g.fillStyle = '#ff3a6a'; g.strokeStyle = '#ffffff'; g.lineWidth = 2; const r = Math.max(4, k * 1.2) + pulse; g.fillRect(-r / 2, -r / 2, r, r); g.strokeRect(-r / 2, -r / 2, r, r); g.restore();
      if (L) { const dx = x - L.x * k, dz = z - L.z * k, d = Math.hypot(dx, dz); if (d > 14) { g.setLineDash([3, 3]); g.strokeStyle = 'rgba(255,58,106,.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L.x * k, L.z * k); g.lineTo(L.x * k + dx * 0.999, L.z * k + dz * 0.999); g.stroke(); g.setLineDash([]); } }
    }
    // you: an arrow the way you face, and the way the camera looks
    if (L) {
      const x = L.x * k, z = L.z * k, s = Math.max(5, k * 1.6);
      if (f) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, z); const a = Math.atan2(-Math.cos(f.yaw), -Math.sin(f.yaw)); g.arc(x, z, s * 4, a - 0.6, a + 0.6); g.closePath(); g.fill(); }
      g.save(); g.translate(x, z); g.rotate(-L.dir + Math.PI); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.7, s * 0.7); g.lineTo(0, s * 0.3); g.lineTo(-s * 0.7, s * 0.7); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#1a2a5a'; g.stroke(); g.restore();
    }
  },
};
