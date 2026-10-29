// The director: what the story scripts call. Speech with the speaker's mouth moving, walking people about, fights,
// gifts, party changes, echoes, chapter cards, the camera, the music.
import { UI, wait } from './ui.js';
import { sfx, music } from './audio.js';
import { G, give, take, count, setFlag, flag, addMember, removeMember, giveEcho, healAll, active } from './state.js';
import { CHARS } from '../data/chars.js';
import { ECHOES } from '../data/echoes.js';
import { ITEMS } from '../data/items.js';

const COLORS = { lorne: '#b8282a', vera: '#2a5ab0', lin: '#2a9a90', brann: '#8a5a2a', nia: '#c8582a', yoru: '#5a2a6a', cyrus: '#5a5a66' };
export function director(game) {
  const F = () => game.field;
  const actor = (who) => F().npc(who);
  const D = {
    G: () => G.s, flag, set: setFlag, unset: (k) => { delete G.s.flags[k]; },
    has: (id, n = 1) => count(id) >= n,
    // speech: who is a hero id, an npc id on the map, or a plain name. o: { name, top, face }
    async say(who, text, o = {}) {
      const a = actor(who), c = CHARS[who];
      const name = o.name || (c ? c.n : a?.npc?.name || who || '');
      if (a) { a.talking = true; if (o.mood != null) a.mood = o.mood; if (o.happy) a.happy = true; if (o.brow != null) a.brow = o.brow; if (o.browIn != null) a.browIn = o.browIn; }
      await UI.say(name, text, { color: COLORS[who] || o.color, top: o.top, sys: !name });
      if (a) { a.talking = false; a.happy = false; a.brow = 0; a.browIn = 0; a.mood = undefined; }
    },
    async talk(lines) { for (const l of lines) { if (typeof l === 'string') await D.say('', l); else await D.say(l[0], l[1], l[2] || {}); } },
    narr: (text) => UI.say('', text, { sys: true }),
    async choose(q, opts, who) { if (q) { await D.say(who || '', q); } return UI.choose(opts, { cancel: false }); },
    toast: (t) => UI.toast(t),
    // things
    async give(id, n = 1, quiet) { give(id, n); sfx('chest'); if (!quiet) await UI.say('', `獲得了 {g}${ITEMS[id].icon || ''} ${ITEMS[id].n}${n > 1 ? ' ×' + n : ''}{/g}！`, { sys: true }); },
    take: (id, n = 1) => take(id, n),
    async gil(n) { G.s.gil += n; sfx('coin'); await UI.say('', `獲得了 {g}${n.toLocaleString()} G{/g}！`, { sys: true }); },
    async join(id, lv) { addMember(id, lv); sfx('levelup'); await UI.say('', `{g}${CHARS[id].n}{/g} 加入了隊伍！`, { sys: true }); game.refreshParty(); },
    leave(id) { removeMember(id); game.refreshParty(); },
    async echo(id) {
      giveEcho(id); sfx('echo'); UI.flash('#c8f8ff', 900);
      const e = ECHOES[id]; await UI.card(`<div class="echocard" style="--c:${e.color}"><small>迴響</small><b>${e.n}</b><i>${e.title}</i><p>${e.lore}</p><em>在選單的「迴響」裝備給隊友，就能使用${e.title}的技能。</em></div>`);
    },
    heal() { healAll(); sfx('heal'); },
    // fights: resolves 'win' | 'lose' (only if canLose; otherwise a loss is a game over)
    battle: (foes, o = {}) => game.battle(foes, o),
    // the map
    goto: (map, at, o) => game.goto(map, at, o),
    async walk(who, path, speed) { const a = actor(who); if (!a) return; await F().walk(a, path, speed); },
    async walkTo(who, spotOrXZ, speed) { const a = actor(who); if (!a) return; const M = F().M; const t = typeof spotOrXZ === 'string' ? M.spots[spotOrXZ] : { x: spotOrXZ[0], z: spotOrXZ[1] }; if (!t) return; await F().walk(a, path(Math.floor(a.x), Math.floor(a.z), t.x, t.z), speed); },
    face(who, target) { const a = actor(who); if (!a) return; const b = typeof target === 'string' ? actor(target) : null; if (b) F().face(a, b); else if (typeof target === 'number') a.dir = target; },
    faceAll(target) { const b = actor(target); if (!b) return; for (const p of F().party) if (p !== b) F().face(p, b); },
    spawn: (def) => F().addNpc(def), remove: (id) => F().removeNpc(id),
    async emote(who, mark = '!', ms = 900) { const a = actor(who); if (!a) return; game.emote(a, mark); if (mark === '!') sfx('tick'); await wait(ms); },
    // the party gathers round the leader (for scenes)
    async gather() { const f = F(), L = f.leader; const offs = [[0, 0], [-1, 1], [1, 1], [0, 2]]; await Promise.all(f.party.slice(1).map((p, i) => f.walk(p, [[Math.floor(L.x) + offs[i + 1][0], Math.floor(L.z) + offs[i + 1][1]]], 4))); },
    cam(x, z, zoom = 1) { const f = F(); if (x == null) { f.camFocus = null; f.camZoom = 1; return; } if (typeof x === 'string') { const a = actor(x) || f.M.spots[x]; if (a) f.camFocus = { x: a.x + (a.npc || a.hero ? 0 : 0.5), z: a.z + (a.npc || a.hero ? 0 : 0.5) }; } else f.camFocus = { x: x + 0.5, z: z + 0.5 }; f.camZoom = zoom; },
    shake: (t = 0.6, a = 0.2) => { F().shake(t, a); sfx('quake'); },
    flash: (c, ms) => UI.flash(c, ms), fade: (on, ms) => UI.fade(on, ms),
    sfx, music: (n) => music(n),
    wait,
    control: (on) => { F().control = on; },
    async chapter(n, title, sub) { G.s.ch = Math.max(G.s.ch, n); setFlag('ch' + n); await UI.card(`<div class="chcard"><small>${n === 0 ? '序章' : n === 99 ? '終章' : `第 ${n} 章`}</small><b>${title}</b>${sub ? `<i>${sub}</i>` : ''}</div>`, 3600); },
    banner: (t, s) => UI.banner(t, s),
    card: (html, ms) => UI.card(html, ms),
    party: () => active(),
    inParty: (id) => G.s.members.includes(id),
    async inn(price) { return game.inn(price); },
    async shop(stock, name) { return game.shop(stock, name); },
    async save() { return game.saveMenu(); },
    prop: (p) => F().addProp(p),
    removeProp: (id) => { const p = F().props.find((q) => q.id === id); if (p) F().removeProp(p); },
    breakAltar() { const p = F().props.find((q) => q.type === 'altar'); if (!p) return; F().removeProp(p); F().addProp({ ...p, obj: null, broken: true }); },
    vehicle: (k, x, z) => game.placeVehicle(k, x, z),
  };
  return D;
}
// a straight-ish path of cells from a to b (x first, then z)
export function path(x0, z0, x1, z1) { const out = []; let x = x0, z = z0; while (x !== x1) { x += Math.sign(x1 - x); out.push([x, z]); } while (z !== z1) { z += Math.sign(z1 - z); out.push([x, z]); } return out; }
