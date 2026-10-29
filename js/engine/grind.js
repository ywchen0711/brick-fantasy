// 自動練功 Auto-grinding: the party walks about near where it was started, fights whatever turns up (with the battle on
// auto), and when it is worn down it walks to the save crystal on this map and rests there. Where there is no crystal
// (the fields, the world map) it drinks potions from the bag instead; with neither, it stops.
// Any direction, B or the menu button stops it. So does leaving the map, a story scene, a boss, or losing a fight.
import { I } from './input.js';
import { UI } from './ui.js';
import { sfx } from './audio.js';
import { G, active, heroStats, count, take, flag } from './state.js';

const ROAM = 12; // how far from where it was started it wanders (cells)
export function grinder(game) {
  const field = game.field, bv = game.bv;
  let on = false, home = null, mapId = null, path = [], phase = 'roam', crystal = null, prevAuto = false, last = null, stuckT = 0, idleT = 0, fights = 0, rests = 0, badge = null;

  // ------------------------------------------------------------ the little sign while it runs
  function showBadge(v) {
    if (!badge) { badge = document.createElement('div'); badge.id = 'grind'; document.body.appendChild(badge); badge.addEventListener('click', (e) => { e.stopPropagation(); stop('自動練功停止'); }); }
    badge.hidden = !v; if (v) draw();
  }
  function draw() { if (!badge) return; badge.innerHTML = `<b>⚔ 自動練功中</b><span>${phase === 'heal' ? '💎 走去水晶補血' : `戰鬥 ${fights} 場${rests ? `・休息 ${rests} 次` : ''}`}</span><small>點這裡或按 <kbd>B</kbd> 停止</small>`; }

  // ------------------------------------------------------------ can it go here?
  const encHere = () => { const M = field.M; return M && (M.world ? !field.vehicle : !!M.def.enc); };
  function start() {
    if (on) return stop('自動練功停止');
    if (game.mode !== 'field' || game.busy || !field.leader) return;
    if (!encHere()) { UI.toast(field.vehicle ? '先下來再練功吧' : '這裡不會遇到魔物，到野外或迷宮再開始練功'); return; }
    on = true; mapId = G.s.map.id; home = field.cell(); path = []; phase = 'roam'; fights = 0; rests = 0; stuckT = 0;
    prevAuto = bv.auto; bv.auto = true; bv.grind = true; field.autoMove = drive;
    crystal = field.props.find((p) => p.type === 'save') || null;
    sfx('ok'); UI.toast(crystal ? '開始自動練功：受傷了會自己去水晶補血' : '開始自動練功：這裡沒有水晶，受傷時會用背包裡的藥水');
    showBadge(true);
  }
  function stop(why) {
    if (!on) return; on = false; field.autoMove = null; bv.auto = prevAuto; bv.grind = false; path = []; showBadge(false);
    if (why) UI.toast(`${why}（打了 ${fights} 場）`);
  }

  // ------------------------------------------------------------ finding the way (cell by cell)
  // cells never to step on (ways out, story happenings, a waiting boss), and cells only to pass through (next to them)
  function blockedCells() {
    const M = field.M, hard = new Set(), near = new Set(), box = (x0, z0, x1, z1, pad) => { for (let x = x0 - pad; x <= x1 + pad; x++) for (let z = z0 - pad; z <= z1 + pad; z++) (pad ? near : hard).add(x + ',' + z); };
    const both = (x0, z0, x1, z1) => { box(x0, z0, x1, z1, 0); box(x0, z0, x1, z1, 2); };
    for (const e of M.exits) both(e.x0, e.z0, e.x1, e.z1); // never wander out of the map
    for (const t of game.triggers || []) { const tr = t.trigger; if (tr.once && flag(tr.once)) continue; if (t.when && !t.when()) continue; if (typeof tr.at === 'string') { const s = M.spots[tr.at]; if (!s) continue; const r = tr.r ?? 1; both(s.x - r, s.z - r, s.x + r, s.z + r); } else { const [x0, z0, x1, z1] = tr.at; both(x0, z0, x1, z1); } }
    if (game.bossHere) { const s = M.spots.boss; if (s) both(s.x - 3, s.z - 4, s.x + 3, s.z + 4); } // keep away from a waiting boss
    return { hard, near };
  }
  // a breadth-first search from where he stands; returns the cells it reached and how to get back from each
  function search(limit) {
    const M = field.M, [sx, sz] = field.cell(), { hard, near } = blockedCells(), from = new Map(), dist = new Map(), q = [[sx, sz]], k0 = sx + ',' + sz; from.set(k0, null); dist.set(k0, 0);
    while (q.length) {
      const [x, z] = q.shift(), k = x + ',' + z, d = dist.get(k);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz, nk = nx + ',' + nz; if (from.has(nk) || hard.has(nk)) continue;
        if (limit && (Math.abs(nx - home[0]) > limit || Math.abs(nz - home[1]) > limit)) continue;
        if (!field.passable(x, z, nx, nz) || !M.walkable(nx, nz)) continue;
        from.set(nk, k); dist.set(nk, d + 1); q.push([nx, nz]);
      }
    }
    return { from, dist, near };
  }
  const route = (from, goal) => { const out = []; for (let k = goal; k; k = from.get(k)) out.push(k.split(',').map(Number)); out.reverse(); out.shift(); return out; };
  function planRoam(retry) {
    const M = field.M, { from, dist, near } = search(ROAM); const all = [...dist.keys()].filter((k) => dist.get(k) >= 3); let cells = all.filter((k) => !near.has(k)); if (!cells.length) cells = all;
    const wild = cells.filter((k) => { const [x, z] = k.split(',').map(Number); return !(M.flags[M.i(x, z)] & 4); }); if (wild.length) cells = wild; // off the road, where the monsters are
    if (!cells.length) { if (retry) return false; home = field.cell(); return planRoam(true); } // nowhere to go from here: wander round where he is instead
    path = route(from, cells[Math.floor(Math.random() * cells.length)]); return path.length > 0;
  }
  function planHeal() {
    if (!crystal) return false; const { from, dist } = search(0); let best = null, bd = 1e9;
    for (const [k, d] of dist) { const [x, z] = k.split(',').map(Number); if (Math.hypot(x + 0.5 - (crystal.x + 0.5), z + 0.5 - (crystal.z + 0.5)) < 2 && d < bd) { bd = d; best = k; } }
    if (!best) return false; path = route(from, best); return true;
  }

  // ------------------------------------------------------------ the stick, held by the computer (field.update asks every frame)
  function drive(dt) {
    if (!on || game.busy || game.mode !== 'field' || UI.busy()) return null;
    const L = field.leader;
    if (!path.length) {
      if (phase === 'heal') { if (game.atSave()) { rest(); return null; } if (!planHeal()) { phase = 'roam'; return null; } }
      else { if ((idleT -= dt) > 0) return null; if (!planRoam()) { idleT = 0.5; return null; } } // a short pause between walks
    }
    const [cx, cz] = path[0], tx = cx + 0.5 - L.x, tz = cz + 0.5 - L.z, d = Math.hypot(tx, tz);
    if (d < 0.22) { path.shift(); if (!path.length && phase === 'roam') idleT = 0.3 + Math.random() * 0.8; return null; }
    // stuck against something (a person walked in the way): think again
    if (last && Math.hypot(L.x - last[0], L.z - last[1]) < 0.002) { if ((stuckT += dt) > 0.8) { stuckT = 0; path = []; return null; } } else stuckT = 0; last = [L.x, L.z];
    return { x: tx / d, z: tz / d, l: 1, world: true };
  }
  function rest() {
    sfx('save'); game.restAll(); UI.flash('#c8f8ff', 500); rests++; phase = 'roam'; path = []; home = field.cell(); UI.toast('在水晶旁休息，大家都恢復了！'); draw(); // and wander near the crystal from now on, so the next rest is close by
  }

  // ------------------------------------------------------------ worn down?
  function hurt() {
    const ms = active(); let lo = 1, sum = 0, mp = 0;
    for (const m of ms) { const p = G.s.party[m], st = heroStats(m), r = p.ko || p.hp <= 0 ? 0 : p.hp / st.hp; lo = Math.min(lo, r); sum += r; mp += st.mp ? p.mp / st.mp : 1; }
    return { lo, avg: sum / ms.length, mp: mp / ms.length };
  }
  const tired = () => { const h = hurt(); return h.lo < 0.4 || h.avg < 0.6 || h.mp < 0.15; };
  // no crystal here: potions and feathers from the bag
  function drink() {
    let used = 0;
    for (const m of active()) {
      const p = G.s.party[m], st = heroStats(m);
      if ((p.ko || p.hp <= 0) && count('phoenix')) { take('phoenix'); p.ko = false; p.hp = Math.max(1, Math.round(st.hp * 0.25)); used++; }
      while (!p.ko && p.hp > 0 && p.hp < st.hp * 0.7) {
        const need = st.hp - p.hp, id = ['potion', 'hipotion', 'xpotion'].find((k) => count(k) && (k === 'xpotion' || { potion: 150, hipotion: 600 }[k] >= Math.min(need, 150))) || ['potion', 'hipotion', 'xpotion'].find((k) => count(k));
        if (!id) break; take(id); p.hp = Math.min(st.hp, p.hp + ({ potion: 150, hipotion: 600, xpotion: 99999 })[id]); used++;
      }
    }
    if (used) { sfx('heal'); UI.toast(`用了 ${used} 個回復道具`); }
    const h = hurt(); return h.lo >= 0.4 && h.avg >= 0.6;
  }

  // ------------------------------------------------------------ every frame (main.js)
  function tick() {
    if (!on) return;
    if (G.s.map.id !== mapId) return stop('換了地方，自動練功停止');
    if (game.mode !== 'field' || game.busy || UI.busy()) return;
    // the player takes over
    const ax = I.axis(); if (ax.l > 0.3 || I.hit('back') || I.hit('menu')) return stop('自動練功停止');
    if (phase === 'roam' && tired()) {
      if (crystal) { phase = 'heal'; path = []; UI.toast('有點累了，去水晶那邊補血'); draw(); }
      else if (!drink()) stop('HP 太低了，這裡沒有水晶，藥水也不夠了');
    }
  }
  // a fight is over (called by game.battle)
  function fought(r) { if (!on) return; if (r === 'lose') return stop('隊伍全滅了，自動練功停止'); if (r === 'win') fights++; draw(); }
  return { start, stop, tick, fought, get on() { return on; } };
}
