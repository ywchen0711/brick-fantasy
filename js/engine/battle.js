// The fight, as rules only (the battle view plays its events; tools/sim.mjs plays whole fights with no screen).
//   Turns come round by speed (a timeline). Hitting a foe's weakness wears its guard (the break gauge) down fast and
//   gives the hero who did it one extra action; a foe whose guard is gone is STAGGERED: it loses its next turn, takes
//   half again as much damage and forgets the great blow it was gathering. Weak hits and staggers fill the party's
//   RESONANCE (three stocks): one stock looses a hero's echo art, two a duet of paired echoes.
import { skill, BAD } from '../data/skills.js';
import { ENEMIES, stat } from '../data/enemies.js';
import { ECHOES } from '../data/echoes.js';

const BOSS_IMMUNE = ['sleep', 'confuse', 'doom', 'berserk'];
const ALL4 = ['fire', 'ice', 'thunder', 'earth'];
const K = 2; // damage scale
let UID = 1;

export class Battle {
  // heroes: [{ id, n, lv, hp, mp, st: stats from heroStats, skills, echo, ko }], foes: [enemy ids]
  constructor({ heroes, foes, boss = false, canFlee = true, diff = 1, rng = Math.random, count = () => 0, consume = () => {}, preempt = 0, know = {} }) {
    this.know = know; // what has been learned about each kind of foe, kept between fights: { enemyId: ['fire', …, '_scan'] }
    this.rng = rng; this.diff = diff; this.boss = boss; this.canFlee = canFlee && !boss; this.count = count; this.consume = consume;
    this.units = []; this.res = 0; this.turnNo = 0; this.result = null; this.gained = []; this.drops = []; this.fled = false;
    heroes.forEach((h, i) => this.units.push(this.mkHero(h, i)));
    foes.forEach((f, i) => this.units.push(this.mkFoe(f, i)));
    for (const u of this.units) u.ct = (u.side === 'h' ? (preempt > 0 ? 600 : 0) : (preempt < 0 ? 600 : 0)) + this.rng() * 300 + u.spd * 8;
    for (const u of this.heroes()) for (const a of u.auto || []) u.st[a] = 4;
  }
  mkHero(h, i) {
    const s = h.st;
    return { uid: UID++, side: 'h', id: h.id, n: h.n, lv: h.lv, slot: i, hp: h.ko ? 0 : Math.max(1, h.hp), mp: h.mp, maxhp: s.hp, maxmp: s.mp, atk: s.atk, def: s.def, mag: s.mag, spr: s.spr, spd: s.spd, luk: s.luk,
      blow: s.blow, wel: s.wel, resist: s.resist, resEl: s.resEl, auto: s.auto, crit: s.crit, brkP: s.brkP, resP: s.resP, mpSave: s.mpSave, passives: s.passives, skills: h.skills, echo: h.echo, st: {}, blinkN: 0, ct: 0 };
  }
  mkFoe(id, i) {
    const d = ENEMIES[id], s = stat(d);
    return { uid: UID++, side: 'f', id, d, n: d.n, lv: d.lv, slot: i, hp: s.hp, maxhp: s.hp, mp: 999, maxmp: 999, atk: s.atk, def: s.def, mag: s.mag, spr: s.spr, spd: s.spd, luk: s.luk,
      xp: s.xp, gil: s.gil, ep: s.ep, brk: s.brk, brkMax: s.brk, stag: false, known: new Set((this.know[id] || []).filter((e) => e !== '_scan')), scanned: (this.know[id] || []).includes('_scan'), stolen: false, charging: null, phase: 0, boss: !!d.boss,
      w: d.w, r: d.r, n0: d.n0, a: d.a, st: {}, blinkN: 0, ct: 0, crit: 5, brkP: 0, passives: [] };
  }
  // remember an element (or that it was scanned) for every foe of this kind, in this fight and the next
  learn(t, e) {
    if (e !== '_scan') t.known.add(e);
    const k = (this.know[t.id] ||= []); if (!k.includes(e)) k.push(e);
    if (e !== '_scan') for (const f of this.units) if (f.side === 'f' && f.id === t.id) f.known.add(e);
    if (e === '_scan') for (const f of this.units) if (f.side === 'f' && f.id === t.id) f.scanned = true;
  }
  heroes() { return this.units.filter((u) => u.side === 'h'); }
  foes() { return this.units.filter((u) => u.side === 'f' && !u.gone); }
  alive(side) { return this.units.filter((u) => u.side === side && u.hp > 0 && !u.gone); }
  rate(u) { if (u.hp <= 0 || u.gone) return 0; return u.spd * (u.st.haste ? 1.5 : 1) * (u.st.slow ? 0.5 : 1); }

  // ---------------------------------------------------------------- whose turn
  next() {
    const live = this.units.filter((u) => this.rate(u) > 0); if (!live.length) return null;
    let best = null, bt = Infinity;
    for (const u of live) { const t = Math.max(0, 1000 - u.ct) / this.rate(u); if (t < bt) { bt = t; best = u; } }
    for (const u of live) u.ct += this.rate(u) * bt;
    best.ct -= 1000; this.turnNo++; return best;
  }
  preview(n = 8) { // the coming turns, without changing anything
    const ct = new Map(this.units.map((u) => [u, u.ct])), out = [], live = this.units.filter((u) => this.rate(u) > 0);
    if (!live.length) return out;
    for (let k = 0; k < n; k++) {
      let best = null, bt = Infinity;
      for (const u of live) { const t = Math.max(0, 1000 - ct.get(u)) / this.rate(u); if (t < bt) { bt = t; best = u; } }
      for (const u of live) ct.set(u, ct.get(u) + this.rate(u) * bt);
      ct.set(best, ct.get(best) - 1000); out.push(best);
    }
    return out;
  }
  // the start of a unit's turn: poison and regen tick, sleep, paralysis, a stagger or a landing from a jump.
  // Returns { ev, skip, auto } — auto is a command the unit must take (confused, berserk, landing)
  startTurn(u) {
    const ev = []; u.defending = false; u.extraUsed = false;
    if (u.st.poison && u.hp > 0) { const d = Math.max(1, Math.round(u.maxhp * (u.boss ? 0.02 : 0.08))); u.hp = Math.max(u.side === 'f' ? 0 : 1, u.hp - d); ev.push({ t: 'hit', tg: u, dmg: d, el: 'poison' }); if (u.hp <= 0) this.kill(u, ev); }
    if (u.st.regen && u.hp > 0) { const h = Math.round(u.maxhp * 0.08); u.hp = Math.min(u.maxhp, u.hp + h); ev.push({ t: 'hit', tg: u, heal: h }); }
    if (u.st.doom != null && u.hp > 0) { if (u.st.doom <= 1) { u.hp = 0; ev.push({ t: 'msg', text: `${u.n}的死亡宣告到時了……` }); this.kill(u, ev); delete u.st.doom; } }
    if (u.hp <= 0) return { ev, skip: true };
    if (u.jumping) { const j = u.jumping; u.jumping = null; return { ev, auto: { kind: 'land', sk: j.sk, tg: j.tg } }; }
    if (u.stag) { ev.push({ t: 'msg', text: `${u.n}失去平衡，無法行動！` }); this.endTurn(u, ev); u.stag = false; u.brk = u.brkMax; ev.push({ t: 'recover', tg: u }); return { ev, skip: true }; }
    for (const s of ['sleep', 'paralyze', 'stop']) if (u.st[s]) { ev.push({ t: 'msg', text: `${u.n}${s === 'sleep' ? '睡著了' : s === 'paralyze' ? '麻痺了，動不了' : '停止了'}。` }); this.endTurn(u, ev); return { ev, skip: true }; }
    if (u.st.confuse) return { ev, auto: { kind: 'confused' } };
    if (u.st.berserk && u.side === 'h') return { ev, auto: { kind: 'skill', sk: 'attack', tg: [this.pick(this.alive('f'))] } };
    return { ev };
  }
  endTurn(u, ev) {
    for (const k of Object.keys(u.st)) { if (k === 'doom') { u.st.doom--; continue; } u.st[k]--; if (u.st[k] <= 0) { delete u.st[k]; ev.push({ t: 'status', tg: u, st: k, on: false }); if (k === 'blink') u.blinkN = 0; } }
  }
  pick(list) { return list[Math.floor(this.rng() * list.length)]; }

  // ---------------------------------------------------------------- what a hero may do
  canUse(u, id) {
    const sk = skill(id); if (u.hp <= 0) return false;
    if (u.st.silence && sk.mp > 0) return false;
    if (u.mp < this.mpCost(u, sk)) return false;
    if (sk.x.hpCost && u.hp <= u.maxhp * sk.x.hpCost / 100) return false;
    return true;
  }
  mpCost(u, sk) { return Math.ceil(sk.mp * (1 - (u.mpSave || 0) / 100)); }
  partnerFor(u) { // the hero whose echo sings a duet with u's
    const e = u.echo && ECHOES[u.echo]; if (!e) return null;
    return this.alive('h').find((v) => v !== u && v.echo === e.pair[0]) || null;
  }
  // ---------------------------------------------------------------- doing it.  cmd: { kind: skill|item|defend|ult|syn|flee|land|confused, sk, item, tg: [units] }
  act(u, cmd) {
    const ev = []; this.extraFor = null;
    if (cmd.kind === 'defend') { u.defending = true; u.ct += 350; ev.push({ t: 'act', u, name: '防禦', sk: 'defend' }); this.endTurn(u, ev); return ev; }
    if (cmd.kind === 'flee') {
      const ok = this.canFlee && this.rng() < 0.55 + (this.avgSpd('h') - this.avgSpd('f')) / 60 + (cmd.sure ? 1 : 0);
      ev.push({ t: 'flee', ok }); if (ok) { this.result = 'fled'; this.fled = true; } else this.endTurn(u, ev); return ev;
    }
    if (cmd.kind === 'confused') { const all = this.units.filter((v) => v.hp > 0 && !v.gone && v !== u && !v.jumping); ev.push({ t: 'msg', text: `${u.n}混亂了！` }); this.use(u, skill('attack'), [this.pick(all)], ev); this.endTurn(u, ev); this.check(ev); return ev; }
    let sk = skill(cmd.sk), tg = cmd.tg || [];
    if (cmd.kind === 'item') { if (!this.count(cmd.item)) return ev; this.consume(cmd.item); }
    if (cmd.kind === 'ult') { if (this.res < 100) return ev; this.res -= 100; ev.push({ t: 'res', v: this.res }); ev.push({ t: 'ult', u, echo: u.echo }); }
    if (cmd.kind === 'syn') { if (this.res < 200) return ev; const p = this.partnerFor(u); if (!p) return ev; this.res -= 200; ev.push({ t: 'res', v: this.res }); ev.push({ t: 'syn', u, p, echo: u.echo, echo2: p.echo }); }
    if (cmd.kind === 'land') { ev.push({ t: 'land', u }); tg = tg.filter((v) => v.hp > 0 && !v.gone); if (!tg.length) tg = [this.pick(this.alive(u.side === 'h' ? 'f' : 'h'))].filter(Boolean); }
    if (cmd.kind === 'skill' || cmd.kind === 'item') {
      if (cmd.kind === 'skill') { const c = this.mpCost(u, sk); u.mp -= c; if (sk.x.hpCost) { const d = Math.round(u.maxhp * sk.x.hpCost / 100); u.hp = Math.max(1, u.hp - d); ev.push({ t: 'hit', tg: u, dmg: d, el: 'cost' }); } }
      if (sk.x.jump && cmd.kind !== 'land') { u.jumping = { sk: sk.id, tg }; u.ct = Math.max(u.ct, 400); ev.push({ t: 'act', u, name: sk.n, sk: sk.id, tg }); ev.push({ t: 'jump', u }); this.endTurn(u, ev); return ev; }
    }
    if (sk.x.escape) { if (this.canFlee) { ev.push({ t: 'act', u, name: sk.n, sk: sk.id }); ev.push({ t: 'flee', ok: true }); this.result = 'fled'; this.fled = true; return ev; } }
    if (sk.x.quick && tg[0]) { tg[0].ct = 1000; }
    this.use(u, sk, tg, ev, cmd);
    this.endTurn(u, ev); this.check(ev);
    // one extra action for a hero who struck a weakness or staggered someone this action
    this.extraFor = null;
    if (!this.result && u.side === 'h' && u.hp > 0 && this.hitWeak && !u.extraUsed && cmd.kind !== 'land') { u.extraUsed = true; this.extraFor = u; ev.push({ t: 'extra', u }); }
    return ev;
  }
  avgSpd(side) { const a = this.alive(side); return a.reduce((s, u) => s + u.spd, 0) / Math.max(1, a.length); }
  // the targets an art aims at, worked out from a chosen unit
  targets(u, sk, chosen) {
    const foesOf = (v) => this.alive(v.side === 'h' ? 'f' : 'h').filter((x) => !x.jumping), friends = (v) => this.alive(v.side);
    switch (sk.t) {
      case 'E': return foesOf(u);
      case 'A': return sk.k === 'revive' ? this.units.filter((v) => v.side === u.side && !v.gone) : ['phys', 'mag', 'debuff'].includes(sk.k) ? foesOf(u) : friends(u);
      case 's': return [u];
      case 'ko': return chosen?.length ? chosen : this.units.filter((v) => v.side === u.side && v.hp <= 0 && !v.gone).slice(0, 1);
      case 'r': return foesOf(u);
      case 'a': return chosen?.length ? chosen : [u];
      default: return chosen?.length && chosen[0].hp > 0 && !chosen[0].gone ? chosen : [this.pick(foesOf(u))].filter(Boolean);
    }
  }
  use(u, sk, chosen, ev, cmd = {}) {
    this.hitWeak = false;
    let tg = this.targets(u, sk, chosen);
    ev.push({ t: 'act', u, name: sk.n, sk: sk.id, tg, kind: cmd.kind });
    if (sk.k === 'scan') { for (const t of tg) { t.scanned = true; for (const w of t.w || []) this.learn(t, w); this.learn(t, '_scan'); ev.push({ t: 'scan', tg: t }); } if (sk.st) this.applySt(u, [u], sk.st, ev); return; }
    if (sk.x.summon) { const d = u.d; if (this.foes().filter((f) => f.hp > 0).length < 5) { const nf = this.mkFoe(d.summon || u.id, this.units.length); nf.ct = 0; nf.summoned = true; this.units.push(nf); ev.push({ t: 'summon', u: nf, by: u }); } else ev.push({ t: 'msg', text: '但是沒有同伴來。' }); return; }
    if (sk.x.stealGil) { ev.push({ t: 'msg', text: `${u.n}偷走了一些錢！` }); this.gilStolen = (this.gilStolen || 0) + 20 + u.lv * 5; return; }
    if (sk.k === 'buff' || sk.k === 'debuff') { if (sk.p && sk.k === 'debuff' && sk.el !== 'weapon') { } this.applySt(u, tg, sk.st || [], ev, sk.k === 'debuff'); if (sk.x.cover) u.cover = true; if (sk.b && sk.k === 'debuff') for (const t of tg) this.wear(u, t, sk.b, false, ev); return; }
    if (sk.k === 'cure') { for (const t of tg) { for (const s of (sk.x.only || BAD)) if (t.st[s] != null) { delete t.st[s]; ev.push({ t: 'status', tg: t, st: s, on: false }); } } ev.push({ t: 'msg', text: '異常狀態解除了。' }); return; }
    if (sk.k === 'revive') {
      for (const t of tg) {
        if (t.hp <= 0) { t.hp = Math.max(1, Math.round(t.maxhp * sk.p / 100)); t.st = {}; t.ct = 0; ev.push({ t: 'revive', tg: t, hp: t.hp }); }
        else if (sk.x.full) { const h = t.maxhp - t.hp; t.hp = t.maxhp; ev.push({ t: 'hit', tg: t, heal: h }); }
        if (sk.x.full) for (const s of BAD) delete t.st[s];
      }
      if (sk.st) this.applySt(u, tg.filter((t) => t.hp > 0), sk.st, ev);
      return;
    }
    if (sk.k === 'heal') {
      for (const t of tg) {
        if (t.hp <= 0) continue;
        if (sk.x.mpFlat || sk.x.mp) { const m = Math.min(t.maxmp - t.mp, sk.x.mpFlat || sk.x.mp); t.mp += m; ev.push({ t: 'hit', tg: t, mpHeal: m }); }
        let h = sk.x.flat || Math.round((u.mag * 1.6 + 12) * sk.p / 100 * (0.95 + this.rng() * 0.1) * (u.passives?.includes('healUp') ? 1.2 : 1));
        if (sk.x.mpFlat && !sk.x.flat) h = 0;
        if (h) { h = Math.min(h, t.maxhp - t.hp); t.hp += h; ev.push({ t: 'hit', tg: t, heal: h }); }
        if (sk.id === 'chakra') for (const s of ['poison', 'blind']) delete t.st[s];
      }
      if (sk.st) this.applySt(u, tg, sk.st, ev);
      return;
    }
    if (sk.k === 'steal' && !sk.p) { for (const t of tg) this.steal(u, t, ev); return; }
    // a blow or a spell, h times (random targets for 'r')
    const hits = sk.h || 1;
    for (let i = 0; i < hits; i++) {
      let list = sk.t === 'r' ? [this.pick(this.alive(u.side === 'h' ? 'f' : 'h').filter((x) => !x.jumping))].filter(Boolean) : tg.filter((t) => t.hp > 0 && !t.gone);
      if (!list.length) break;
      for (const t of list) this.strike(u, t, sk, ev, cmd);
      if (u.hp <= 0) break;
    }
    if (sk.x.steal) for (const t of tg) if (t.hp > 0) this.steal(u, t, ev);
    if (sk.x.partyBuff) this.applySt(u, this.alive(u.side), [[sk.x.partyBuff, 100, 3]], ev);
    if (sk.x.suicide) { u.hp = 0; this.kill(u, ev); }
    if (sk.st) this.applySt(u, tg.filter((t) => t.hp > 0), sk.st, ev, true);
  }
  // the elements a blow carries
  els(u, sk) {
    let e = sk.el === 'weapon' ? [u.blow || 'strike'].concat(u.wel ? [u.wel] : []) : [sk.el];
    if (sk.x.allEl) e = e.concat(ALL4); if (sk.x.els) e = e.concat(sk.x.els);
    return [...new Set(e)].filter((x) => x && x !== 'none');
  }
  affinity(t, els) { // 'weak' | 'absorb' | 'null' | 'resist' | ''
    if (!els.length) return '';
    if (t.side === 'h') { return els.some((e) => (t.resEl || []).includes(e)) ? 'resist' : ''; }
    if (els.some((e) => t.w.includes(e))) return 'weak';
    if (els.some((e) => t.a.includes(e))) return 'absorb';
    if (els.every((e) => t.n0.includes(e))) return 'null';
    if (els.some((e) => t.r.includes(e))) return 'resist';
    return '';
  }
  strike(u, t, sk, ev, cmd) {
    const phys = sk.k === 'phys' || sk.k === 'steal';
    // a single blow at someone weak may be taken by a friend who covers
    if (phys && t.side === 'h' && sk.t === 'e' && t.hp < t.maxhp * 0.5) { const c = this.alive('h').find((v) => v.cover && v !== t && v.st.taunt); if (c) { ev.push({ t: 'msg', text: `${c.n}擋在${t.n}前面！` }); t = c; } }
    if (phys && t.blinkN > 0 && sk.t !== 'E') { t.blinkN--; ev.push({ t: 'hit', tg: t, miss: true, u }); if (!t.blinkN) { delete t.st.blink; } return; }
    if (phys && !sk.x.ult && !sk.x.syn) {
      const hit = 0.97 - (u.st.blind ? 0.5 : 0) - (t.st.evade ? 0.25 : 0) - (t.passives?.includes('evadeUp') ? 0.1 : 0);
      if (this.rng() > hit) { ev.push({ t: 'hit', tg: t, miss: true, u }); return; }
    }
    const els = this.els(u, sk), aff = this.affinity(t, els);
    let dmg;
    if (sk.x.flatDmg) dmg = sk.x.flatDmg;
    else if (sk.x.gravity) dmg = Math.min(9999, Math.round(t.hp * sk.x.gravity / 100 * (t.boss ? 0.25 : 1)));
    else {
      let A = phys ? u.atk : u.mag, D = phys ? t.def : t.spr;
      if (phys) { if (u.st.atkUp) A *= 1.3; if (u.st.atkDown) A *= 0.7; if (u.st.berserk) A *= 1.3; if (t.st.defDown) D *= 0.6; }
      else { if (u.st.magUp) A *= 1.3; if (u.st.magDown) A *= 0.7; if (t.st.sprDown) D *= 0.6; }
      if (sk.x.pierceDef) D = 0;
      dmg = A * A / (A + D) * K * sk.p / 100 * (0.92 + this.rng() * 0.16);
      if (phys && t.st.protect) dmg *= 0.67; if (!phys && t.st.shell) dmg *= 0.67;
    }
    let crit = false;
    if (phys && !sk.x.gravity) { const c = (u.crit || 5) + (u.st.critUp ? 25 : 0) + (sk.x.crit || 0) + (t.stag ? 20 : 0); if (this.rng() * 100 < c) { crit = true; dmg *= 1.5; } }
    if (!sk.x.gravity) {
      if (aff === 'weak') dmg *= 1.5; else if (aff === 'resist') dmg *= 0.5; else if (aff === 'null') dmg = 0;
      if (t.stag) dmg *= 1.5;
      if (t.defending) dmg *= 0.5;
      if (t.passives?.includes('guard')) dmg *= 0.9;
      for (const e of els) if (u.passives?.includes(e + 'Up')) { dmg *= 1.2; break; }
      if (sk.x.jump && u.passives?.includes('jumpUp')) dmg *= 1.3;
      if (u.side === 'f') dmg *= this.diff;
    }
    dmg = Math.max(aff === 'null' ? 0 : 1, Math.min(99999, Math.round(dmg)));
    if (aff === 'absorb') { const h = Math.min(dmg, t.maxhp - t.hp); t.hp += h; ev.push({ t: 'hit', tg: t, heal: h, absorb: true, el: els[0], u }); return; }
    // the blow lands
    if (t.st.endure && dmg >= t.hp && t.hp > 1) { dmg = t.hp - 1; delete t.st.endure; ev.push({ t: 'msg', text: `${t.n}撐住了！` }); }
    t.hp = Math.max(0, t.hp - dmg);
    if (t.st.sleep) { delete t.st.sleep; ev.push({ t: 'status', tg: t, st: 'sleep', on: false }); }
    if (t.side === 'f') for (const e of els) if (t.w.includes(e) || t.r.includes(e) || t.a.includes(e) || t.n0.includes(e)) this.learn(t, e);
    ev.push({ t: 'hit', tg: t, dmg, crit, weak: aff === 'weak', resist: aff === 'resist' || aff === 'null', el: els[0] || sk.el, u, sk: sk.id });
    if (t.side === 'f' && aff === 'weak') { this.hitWeak = true; this.gain(u, 6, ev); }
    if (crit) this.gain(u, 3, ev);
    if (t.side === 'h') this.gain(t, 2, ev);
    if (sk.x.drain && u.hp > 0) { const h = Math.min(u.maxhp - u.hp, Math.round(dmg * 0.5)); u.hp += h; ev.push({ t: 'hit', tg: u, heal: h }); }
    if (sk.x.mpDrain && u.side === 'h') { const m = Math.min(u.maxmp - u.mp, Math.max(5, Math.round(dmg / 6))); u.mp += m; ev.push({ t: 'hit', tg: u, mpHeal: m }); }
    if (t.side === 'f' && t.hp > 0) this.wear(u, t, sk.b, aff === 'weak', ev);
    if (t.hp <= 0) this.kill(t, ev);
    else if (t.side === 'f') this.phaseCheck(t, ev);
    // a monk's counter
    if (t.hp > 0 && phys && sk.t === 'e' && t.passives?.includes('counter') && u.hp > 0 && this.rng() < 0.25) { ev.push({ t: 'msg', text: `${t.n}反擊！` }); this.strike(t, u, skill('attack'), ev, {}); }
  }
  wear(u, t, b, weak, ev) {
    if (t.stag || !b) return;
    const v = Math.round(b * (weak ? 2.5 : 1) * (1 + (u.brkP || 0) / 100));
    t.brk = Math.max(0, t.brk - v); ev.push({ t: 'brk', tg: t, v: t.brk });
    if (t.brk <= 0) {
      t.stag = true; t.ct = Math.min(t.ct, 0) - 200; this.hitWeak = true;
      ev.push({ t: 'stagger', tg: t });
      if (t.charging) { ev.push({ t: 'msg', text: `${t.n}的「${skill(t.charging).n}」被打斷了！` }); t.charging = null; }
      this.gain(u, 35, ev);
    }
  }
  gain(u, v, ev) { const before = this.res; this.res = Math.min(300, this.res + v * (1 + ((u?.side === 'h' ? u.resP : 0) || 0) / 100)); if (Math.floor(this.res) !== Math.floor(before)) ev.push({ t: 'res', v: this.res }); }
  steal(u, t, ev) {
    if (t.side !== 'f') return;
    if (t.stolen || !t.d.steal) { ev.push({ t: 'steal', u, tg: t, item: null, none: true }); return; }
    const ch = 0.45 + (u.luk - t.luk) / 100 + (u.passives?.includes('stealUp') ? 0.25 : 0) + (t.stag ? 0.25 : 0);
    if (this.rng() < ch) { t.stolen = true; this.gained.push(t.d.steal); ev.push({ t: 'steal', u, tg: t, item: t.d.steal }); }
    else ev.push({ t: 'steal', u, tg: t, item: null });
  }
  applySt(u, tg, list, ev, hostile = false) {
    for (const t of tg) for (const [s, ch, turns] of list) {
      if (t.hp <= 0) continue;
      let c = ch;
      if (hostile && t.side !== u.side) {
        if ((t.resist || []).includes(s)) c = 0;
        if (t.boss) { if (BOSS_IMMUNE.includes(s)) c = 0; else if (['paralyze', 'stop', 'slow'].includes(s)) c *= 0.5; }
      }
      if (this.rng() * 100 >= c) { if (hostile && t.side !== u.side && ch < 100) ev.push({ t: 'hit', tg: t, miss: true, u, quiet: true }); continue; }
      const n = t.boss && ['paralyze', 'stop'].includes(s) ? 1 : turns + (u.passives?.includes('songUp') ? 1 : 0);
      if (s === 'haste') delete t.st.slow; if (s === 'slow') delete t.st.haste;
      if (s === 'blink') t.blinkN = 2;
      t.st[s] = s === 'doom' ? (t.st.doom ?? n) : Math.max(t.st[s] || 0, n);
      ev.push({ t: 'status', tg: t, st: s, on: true });
    }
  }
  kill(t, ev) {
    if (t.dead) return; t.hp = 0; t.st = {}; t.jumping = null; t.charging = null;
    if (t.side === 'f') { t.dead = true; t.gone = true; const d = t.d; if (d.drop?.length && this.rng() * 100 < d.drop[1]) this.drops.push(d.drop[0]); }
    ev.push({ t: 'ko', tg: t });
  }
  phaseCheck(t, ev) {
    const ph = t.d.ph; if (!ph) return;
    const pct = t.hp / t.maxhp * 100;
    while (t.phase + 1 < ph.length && pct <= ph[t.phase + 1].at) { t.phase++; if (ph[t.phase].say) ev.push({ t: 'phase', u: t, say: ph[t.phase].say }); }
  }
  check(ev) {
    if (this.result) return;
    if (!this.alive('f').length) { this.result = 'win'; ev.push({ t: 'end', result: 'win' }); }
    else if (!this.alive('h').length) { this.result = 'lose'; ev.push({ t: 'end', result: 'lose' }); }
  }
  // ---------------------------------------------------------------- the foes' minds
  think(u) {
    if (u.charging) { const sk = skill(u.charging); u.charging = null; return { kind: 'skill', sk: sk.id, tg: this.aim(u, sk) }; }
    const list = u.d.ph ? u.d.ph[u.phase].sk : u.d.sk;
    const usable = list.filter(([id]) => { const s = skill(id); if (s.x.summon && this.foes().filter((f) => f.hp > 0).length >= 4) return false; if (s.k === 'heal' && u.hp > u.maxhp * 0.6 && s.t === 's') return false; if (s.x.suicide && u.hp > u.maxhp * 0.5) return false; return true; });
    const tot = usable.reduce((a, [, w]) => a + w, 0); let r = this.rng() * tot, pick = usable[0]?.[0] || 'attack';
    for (const [id, w] of usable) { if ((r -= w) <= 0) { pick = id; break; } }
    const sk = skill(pick);
    if (sk.x.charge) { u.charging = sk.id; return { kind: 'charge', sk: sk.id }; }
    return { kind: 'skill', sk: sk.id, tg: this.aim(u, sk) };
  }
  aim(u, sk) {
    if (sk.t === 'e' || sk.t === 'a') {
      if (sk.k === 'heal' || sk.k === 'buff') { const fr = this.alive('f'); return [fr.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]]; }
      const hs = this.alive('h').filter((h) => !h.jumping); if (!hs.length) return [];
      const w = hs.map((h) => (h.st.taunt ? 6 : 1)), tot = w.reduce((a, b) => a + b, 0); let r = this.rng() * tot;
      for (let i = 0; i < hs.length; i++) if ((r -= w[i]) <= 0) return [hs[i]];
      return [hs[0]];
    }
    return [];
  }
  foeTurn(u) {
    const ev = [], cmd = this.think(u);
    if (cmd.kind === 'charge') { ev.push({ t: 'charge', u, sk: cmd.sk, name: skill(cmd.sk).n }); this.endTurn(u, ev); return ev; }
    if (cmd.kind === 'skill' && skill(cmd.sk).t === 'e' && !cmd.tg.length) { this.endTurn(u, ev); return ev; }
    this.use(u, skill(cmd.sk), cmd.tg, ev, cmd); this.endTurn(u, ev); this.check(ev);
    return ev;
  }
  spoils() {
    const fs = this.units.filter((u) => u.side === 'f' && u.dead && !u.summoned || (u.side === 'f' && u.dead && u.summoned));
    return { xp: fs.reduce((a, f) => a + (f.summoned ? Math.round(f.xp / 2) : f.xp), 0), gil: Math.max(0, fs.reduce((a, f) => a + f.gil, 0) - (this.gilStolen || 0)), ep: fs.reduce((a, f) => a + f.ep, 0), drops: this.drops.concat(this.gained) };
  }
}
