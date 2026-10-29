// The saved game, and everything worked out from it: a hero's numbers with gear and echo, the arts they can use,
// the bag, money, flags. No drawing here (the battle simulator in tools/ uses it too).
import { CHARS, statsAt, xpFor } from '../data/chars.js';
import { ECHOES, echoLevel } from '../data/echoes.js';
import { ITEMS } from '../data/items.js';
import { SKILLS } from '../data/skills.js';

export const G = { s: null };
const START_EQ = {
  lorne: { weapon: 'bronzesword', armor: 'leatherplate' }, vera: { weapon: 'bronzespear', armor: 'leatherplate' }, lin: { weapon: 'oakstaff', armor: 'cottonrobe' },
  brann: { weapon: 'ironaxe', armor: 'chainmail' }, nia: { weapon: 'pistol', armor: 'travelcoat' }, yoru: { weapon: 'kotetsu', armor: 'scoutgarb' }, cyrus: { weapon: 'knightsword', armor: 'knightarmor' },
};
export function newGame() {
  const s = {
    ver: 1, ch: 0, flags: {}, gil: 200, time: 0, steps: 0, members: [], order: [], party: {}, echoes: {}, inv: { potion: 4, phoenix: 1, antidote: 2 },
    map: { id: 'whitehawk', x: 0, z: 0, dir: 0 }, vehicle: null, vehicles: {}, chests: {}, bounties: {}, seen: {}, quests: {}, battles: 0, kills: 0, opts: { msg: 2, enc: 1, bgm: 0.7, sfx: 0.8, dof: 1, diff: 1 },
  };
  G.s = s; return s;
}
export function addMember(id, lv) {
  const s = G.s; if (s.party[id]) { if (!s.members.includes(id)) s.members.push(id); if (!s.order.includes(id)) s.order.push(id); return; }
  lv = lv || Math.max(1, avgLevel() - 1);
  const p = { lv, xp: xpFor(lv), hp: 1, mp: 1, eq: { weapon: START_EQ[id]?.weapon || null, armor: START_EQ[id]?.armor || null, acc1: null, acc2: null }, echo: null, slots: [], seeds: {}, ko: false };
  s.party[id] = p; s.members.push(id); s.order.push(id);
  const st = heroStats(id); p.hp = st.hp; p.mp = st.mp;
}
export function removeMember(id) { const s = G.s; s.members = s.members.filter((m) => m !== id); s.order = s.order.filter((m) => m !== id); }
export const active = () => G.s.order.filter((id) => G.s.members.includes(id)).slice(0, 4);
export const avgLevel = () => { const m = G.s.members.filter((id) => !CHARS[id]?.guest); return m.length ? Math.round(m.reduce((a, id) => a + G.s.party[id].lv, 0) / m.length) : 1; };

// ---------------------------------------------------------------- a hero's numbers
export function heroStats(id) {
  const c = CHARS[id], p = G.s.party[id], st = statsAt(c, p.lv), o = { ...st, blow: 'strike', wel: null, resist: [], resEl: [], auto: [], crit: 5 + Math.floor(st.luk / 8), brkP: 0, resP: 0, xpP: 0, epP: 0, gilP: 0, mpSave: 0, passives: [] };
  for (const k in p.seeds) o[k] = (o[k] || 0) + p.seeds[k];
  for (const slot of ['weapon', 'armor', 'acc1', 'acc2']) {
    const it = ITEMS[p.eq[slot]]; if (!it) continue;
    for (const k of ['atk', 'def', 'mag', 'spr', 'spd', 'luk']) o[k] += it[k] || 0;
    if (it.blow) o.blow = it.blow; if (it.el) o.wel = it.el;
    if (it.resist) o.resist.push(...it.resist); if (it.resEl) o.resEl.push(...it.resEl); if (it.auto) o.auto.push(it.auto);
    for (const k of ['crit', 'brkP', 'resP', 'xpP', 'epP', 'gilP', 'mpSave']) o[k] += it[k] || 0;
    if (it.hpP) o.hp = Math.round(o.hp * (1 + it.hpP / 100)); if (it.mpP) o.mp = Math.round(o.mp * (1 + it.mpP / 100));
  }
  const e = p.echo && ECHOES[p.echo];
  if (e) {
    for (const k in e.bonus) o[k] = Math.round(o[k] * (1 + e.bonus[k] / 100));
    const L = echoLevel(G.s.echoes[p.echo]?.ep || 0);
    if (L >= e.passive[0]) o.passives.push(e.passive[1]);
  }
  if (o.passives.includes('critUp')) o.crit += 10; if (o.passives.includes('brkUp')) o.brkP += 25; if (o.passives.includes('atkUp')) o.atk = Math.round(o.atk * 1.1); if (o.passives.includes('mpSave')) o.mpSave += 25;
  if (o.passives.includes('timeUp')) o.auto.push('haste');
  o.hp = Math.min(o.hp, 99999); o.mp = Math.min(o.mp, 9999);
  return o;
}
export const artSlots = (id) => 2 + Math.floor(G.s.party[id].lv / 15);
export function heroSkills(id) {
  const c = CHARS[id], p = G.s.party[id], out = { innate: [], echo: [], slots: [], ult: null, syn: null };
  for (const [lv, sk] of c.skills) if (p.lv >= lv) out.innate.push(sk);
  const e = p.echo && ECHOES[p.echo];
  if (e) { const L = echoLevel(G.s.echoes[p.echo]?.ep || 0); for (const [lv, sk] of e.arts) if (L >= lv && !out.innate.includes(sk)) out.echo.push(sk); out.ult = e.ult; }
  for (const sk of p.slots) if (sk && !out.innate.includes(sk) && !out.echo.includes(sk)) out.slots.push(sk);
  return out;
}
// arts that can go in slots: every art of every mastered echo
export function masteredArts() { const out = []; for (const id in G.s.echoes) if (echoLevel(G.s.echoes[id].ep) >= 10) for (const [, sk] of ECHOES[id].arts) if (!out.includes(sk)) out.push(sk); return out; }
export function equipEcho(hero, echo) {
  for (const id in G.s.party) if (G.s.party[id].echo === echo) G.s.party[id].echo = null;
  G.s.party[hero].echo = echo; clampHP(hero);
}
export function clampHP(id) { const p = G.s.party[id], st = heroStats(id); p.hp = Math.min(p.hp, st.hp); p.mp = Math.min(p.mp, st.mp); }
export function canEquip(id, it) {
  const c = CHARS[id]; if (!it) return true;
  if (it.kind === 'weapon') return it.wtype === c.weapon; if (it.kind === 'armor') return c.armor.includes(it.atype); return it.kind === 'acc';
}
export function equip(id, slot, itemId) {
  const p = G.s.party[id], old = p.eq[slot];
  if (itemId) { if (!take(itemId)) return false; }
  if (old) give(old);
  p.eq[slot] = itemId || null; clampHP(id); return true;
}
export function healAll() { for (const id of G.s.members) { const st = heroStats(id), p = G.s.party[id]; p.hp = st.hp; p.mp = st.mp; p.ko = false; } }

// ---------------------------------------------------------------- the bag
export const count = (id) => G.s.inv[id] || 0;
export function give(id, n = 1) { if (!ITEMS[id]) return; G.s.inv[id] = Math.min(99, (G.s.inv[id] || 0) + n); if (ITEMS[id].kind === 'key') { G.s.inv[id] = 1; G.s.flags[id] = true; } }
export function take(id, n = 1) { if ((G.s.inv[id] || 0) < n) return false; G.s.inv[id] -= n; if (G.s.inv[id] <= 0) delete G.s.inv[id]; return true; }
export const flag = (k) => !!G.s.flags[k];
export const setFlag = (k, v = true) => { G.s.flags[k] = v; };
export function giveEcho(id) { if (!G.s.echoes[id]) G.s.echoes[id] = { ep: 0 }; }

// ---------------------------------------------------------------- after a won fight
export function reward(xp, gil, ep, drops) {
  const s = G.s, log = [], ups = [];
  const bonus = (k) => Math.max(...active().map((id) => heroStats(id)[k] || 0), 0);
  xp = Math.round(xp * (1 + bonus('xpP') / 100)); gil = Math.round(gil * (1 + bonus('gilP') / 100));
  s.gil += gil;
  for (const id of s.members) {
    const p = s.party[id], inFight = active().includes(id), gain = Math.round(xp * (inFight ? (p.ko ? 0.5 : 1) : 0.6));
    p.xp += gain; const before = p.lv;
    while (p.lv < 99 && p.xp >= xpFor(p.lv + 1)) p.lv++;
    if (p.lv > before) { const learned = CHARS[id].skills.filter(([lv]) => lv > before && lv <= p.lv).map(([, sk]) => SKILLS[sk].n); ups.push({ id, from: before, to: p.lv, learned }); const st = heroStats(id); p.hp = Math.min(st.hp, p.hp + (st.hp - p.hp) * 0.0); }
    if (inFight && p.echo) {
      const e = s.echoes[p.echo], L0 = echoLevel(e.ep); e.ep += Math.round(ep * (1 + heroStats(id).epP / 100)); const L1 = echoLevel(e.ep);
      if (L1 > L0) { const arts = ECHOES[p.echo].arts.filter(([lv]) => lv > L0 && lv <= L1).map(([, sk]) => SKILLS[sk].n); log.push({ echo: p.echo, to: L1, arts }); }
    }
  }
  for (const d of drops) give(d);
  return { xp, gil, ep, drops, ups, echoUps: log };
}

// ---------------------------------------------------------------- saving
const KEY = 'brickfantasy.slot';
export function save(slot) { try { const s = G.s; s.savedAt = Date.now(); localStorage.setItem(KEY + slot, JSON.stringify(s)); return true; } catch (e) { return false; } }
export function load(slot) { try { const t = localStorage.getItem(KEY + slot); if (!t) return null; const s = JSON.parse(t); G.s = Object.assign(newGame(), s); return G.s; } catch (e) { return null; } }
export function peek(slot) { try { const t = localStorage.getItem(KEY + slot); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
