// The corner of the screen while walking: where you are, what to do next, and a small map — the place drawn from
// its bricks, ways out, save crystals, unopened chests, people with something to say, the next step (pulsing)
// and you. Buttons under it zoom in and out (the view follows you when zoomed) and open the whole map.
//   keys: + / − zoom, M or N the whole map;  pad: press the left stick for the whole map;  touch: the buttons
import { COLOR } from './voxel.js';
import { objective, target } from '../story/journal.js';

const ZOOMS = [1, 2, 4, 8]; // 1: the whole place fits; more: closer, centred on you
export const HUD = {
  el: null, base: null, M: null, zoom: 1, t: 0, full: false,
  init() {
    const el = document.getElementById('hud'); this.el = el;
    el.innerHTML = '<div class="where"></div><div class="next"></div><canvas class="mini" width="170" height="170"></canvas><div class="mbtns"><button class="zin" title="放大（+）">＋</button><button class="zout" title="縮小（−）">－</button><button class="open" title="全圖（M）">🗺 全圖</button><button class="hide" title="隱藏小地圖">✕</button></div><button class="show" hidden>🗺 地圖</button>';
    this.cv = el.querySelector('.mini'); this.ctx = this.cv.getContext('2d');
    const on = (sel, f) => el.querySelector(sel).addEventListener('click', (e) => { e.stopPropagation(); f(); });
    on('.zin', () => this.zoomBy(1)); on('.zout', () => this.zoomBy(-1)); on('.open', () => this.openFull()); on('.mini', () => this.openFull());
    on('.hide', () => this.setHidden(true)); on('.show', () => this.setHidden(false));
    const fm = document.getElementById('fullmap'); fm.innerHTML = '<div class="box"><h3></h3><canvas></canvas><p class="leg"><i style="background:#ff3a6a"></i>目的地 <i style="background:#ffd84a"></i>出入口 <i style="background:#7af0ff"></i>存檔水晶 <i style="background:#d8a838"></i>寶箱 <i style="background:#ffe24a"></i>有事找你的人 <i style="background:#ff3a3a"></i>頭目</p><p class="obj"></p><button class="close">關閉（B／M）</button></div>';
    fm.querySelector('.close').addEventListener('click', (e) => { e.stopPropagation(); this.closeFull(); });
    fm.addEventListener('click', (e) => { if (e.target === fm) this.closeFull(); });
    try { this.zoom = +(localStorage.getItem('bf.mzoom') || 1) || 1; this.hiddenMap = localStorage.getItem('bf.mhide') === '1'; } catch (e) { }
    this.setHidden(this.hiddenMap, true);
  },
  zoomBy(d) { const i = Math.max(0, Math.min(ZOOMS.length - 1, ZOOMS.indexOf(this.zoom) + d)); this.zoom = ZOOMS[i]; try { localStorage.setItem('bf.mzoom', this.zoom); } catch (e) { } this.draw(); },
  setHidden(h, quiet) { this.hiddenMap = h; if (!this.el) return; this.el.querySelector('.mini').hidden = h; this.el.querySelector('.mbtns').hidden = h; this.el.querySelector('.show').hidden = !h; if (!quiet) try { localStorage.setItem('bf.mhide', h ? '1' : '0'); } catch (e) { } },
  openFull() { if (!this.M) return; this.full = true; const fm = document.getElementById('fullmap'); fm.hidden = false; fm.querySelector('h3').textContent = this.name || ''; fm.querySelector('.obj').textContent = '📜 ' + objective(); this.drawFull(); },
  closeFull() { this.full = false; document.getElementById('fullmap').hidden = true; },
  toggleFull() { if (this.full) this.closeFull(); else this.openFull(); },
  // a new place: draw its bricks once
  show(M, name) {
    if (!this.el) this.init();
    this.M = M; this.name = name; this.el.querySelector('.where').textContent = name || '';
    const W = M.W, D = M.D, c = document.createElement('canvas'); c.width = W; c.height = D; const g = c.getContext('2d'), img = g.createImageData(W, D);
    const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = M.i(x, z), f = M.flags[i], h = M.floorH[i], top = M.V.top(x, z), b = M.V.get(x, top - 1, z);
      let col = rgb(COLOR[b] || '#444444');
      if (f & 2) col = [58, 122, 184];
      else if (f & 1 || Math.abs(h - top) > 1) col = col.map((v) => v * 0.45); // walls and things you cannot walk on
      else if (f & 4) col = col.map((v) => Math.min(255, v * 1.15 + 20));
      const shade = 0.85 + Math.min(0.3, (h - 3) * 0.05), o = i * 4;
      img.data[o] = col[0] * shade; img.data[o + 1] = col[1] * shade; img.data[o + 2] = col[2] * shade; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0); this.base = c; if (this.full) this.openFull(); this.draw();
  },
  visible(on) { if (this.el) this.el.hidden = !on; if (!on && this.full) this.closeFull(); },
  update(dt, field) { if (!this.M || this.el.hidden) return; this.t += dt; this.field = field; if ((this.tick = (this.tick || 0) + dt) < 0.1) return; this.tick = 0; this.draw(); if (this.full) this.drawFull(); },
  draw() {
    const n = this.el.querySelector('.next'), obj = objective(); if (n.textContent !== obj) n.textContent = obj;
    if (!this.base || this.hiddenMap) return;
    const S = this.cv.width, M = this.M, L = this.field?.leader, fit = S / Math.max(M.W, M.D), k = fit * this.zoom;
    // the view: the whole place, or a window round you
    let ox = 0, oz = 0; if (this.zoom > 1 && L) { const span = S / k; ox = Math.max(0, Math.min(M.W - span, L.x - span / 2)); oz = Math.max(0, Math.min(M.D - span, L.z - span / 2)); }
    this.paint(this.ctx, S, S, k, ox, oz, this.zoom === 1);
  },
  drawFull() {
    const cv = document.querySelector('#fullmap canvas'), M = this.M, max = Math.min(innerWidth * 0.9, innerHeight * 0.72), k = max / Math.max(M.W, M.D);
    cv.width = Math.round(M.W * k); cv.height = Math.round(M.D * k); this.paint(cv.getContext('2d'), cv.width, cv.height, k, 0, 0, true);
  },
  paint(g, w, h, k, ox, oz, fit) {
    const M = this.M, f = this.field; g.imageSmoothingEnabled = false;
    g.fillStyle = '#0a1024'; g.fillRect(0, 0, w, h);
    g.drawImage(this.base, -ox * k, -oz * k, M.W * k, M.D * k);
    const X = (x) => (x - ox) * k, Z = (z) => (z - oz) * k, r0 = Math.max(2.5, Math.min(7, k * 0.8));
    const dot = (x, z, r, col, ring) => { g.beginPath(); g.arc(X(x + 0.5), Z(z + 0.5), r, 0, 7); g.fillStyle = col; g.fill(); if (ring) { g.lineWidth = 1.5; g.strokeStyle = ring; g.stroke(); } };
    for (const e of M.exits) { g.fillStyle = '#ffd84a'; g.fillRect(X(e.x0) - 1, Z(e.z0) - 1, (e.x1 - e.x0 + 1) * k + 2, (e.z1 - e.z0 + 1) * k + 2); }
    if (f) {
      for (const p of f.props) { if (p.type === 'save') dot(p.x, p.z, r0 + 0.5, '#7af0ff', '#ffffff'); if (p.type === 'chest' && !p.open) dot(p.x, p.z, r0, '#d8a838', '#5a3a10'); if (p.type === 'pickup') dot(p.x, p.z, r0, '#ff8ab0', '#ffffff'); }
      for (const a of f.npcs) { if (a.id === 'boss') dot(a.x - 0.5, a.z - 0.5, r0 * 1.5, '#ff3a3a', '#ffffff'); else if (a.mark) dot(a.x - 0.5, a.z - 0.5, r0 + 0.5, '#ffe24a', '#1a1a1a'); }
    }
    let tg = target(M); if (tg?.npc && f) { const a = f.npc(tg.npc); tg = a ? { x: a.x - 0.5, z: a.z - 0.5 } : null; }
    const L = f?.leader;
    if (tg) {
      const pulse = 2 + Math.sin(this.t * 6) * 1.5, x = X(tg.x + 0.5), z = Z(tg.z + 0.5), r = Math.max(7, k * 1.4) + pulse;
      if (L) { g.setLineDash([3, 3]); g.strokeStyle = 'rgba(255,58,106,.85)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(L.x), Z(L.z)); g.lineTo(x, z); g.stroke(); g.setLineDash([]); }
      const cx = Math.max(r, Math.min(w - r, x)), cz = Math.max(r, Math.min(h - r, z)); // kept on the map's edge when it is off the view
      g.save(); g.translate(cx, cz); g.rotate(Math.PI / 4); g.fillStyle = '#ff3a6a'; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.fillRect(-r / 2, -r / 2, r, r); g.strokeRect(-r / 2, -r / 2, r, r); g.restore();
    }
    if (L) {
      const x = X(L.x), z = Z(L.z), s = Math.max(6, Math.min(10, k * 1.6));
      if (f) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, z); const a = Math.atan2(-Math.cos(f.yaw), -Math.sin(f.yaw)); g.arc(x, z, s * 4, a - 0.6, a + 0.6); g.closePath(); g.fill(); }
      g.save(); g.translate(x, z); g.rotate(-L.dir + Math.PI); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.7, s * 0.7); g.lineTo(0, s * 0.3); g.lineTo(-s * 0.7, s * 0.7); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#1a2a5a'; g.stroke(); g.restore();
    }
  },
};
