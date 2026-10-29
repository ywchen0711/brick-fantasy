// Plays fights with no screen, to check the numbers: node tools/sim.mjs
// Each line sets up the party the story would have at that point and fights the boss (or a zone's foes) N times.
import { G, newGame, addMember, heroStats, heroSkills, equip, give, giveEcho, equipEcho, active } from '../js/engine/state.js';
import { Battle } from '../js/engine/battle.js';
import { skill } from '../js/data/skills.js';
import { CHARS, xpFor } from '../js/data/chars.js';
import { WEAPON_TABLE, ARMOR_TABLE } from '../js/data/items.js';
import { ECHO_EP } from '../js/data/echoes.js';

function setup(members, lv, tier, echoes = [], echoLv = 3) {
  newGame();
  for (const m of members) addMember(m, lv);
  for (const id of members) {
    const c = CHARS[id], w = WEAPON_TABLE[c.weapon][tier][0], a = ARMOR_TABLE[c.armor[0]][tier][0];
    G.s.party[id].eq.weapon = w; G.s.party[id].eq.armor = a;
  }
  echoes.forEach((e, i) => { giveEcho(e); G.s.echoes[e].ep = ECHO_EP[echoLv]; if (members[i]) equipEcho(members[i], e); });
  for (const id of members) { const st = heroStats(id); G.s.party[id].hp = st.hp; G.s.party[id].mp = st.mp; }
  G.s.inv = { potion: 8, hipotion: tier > 3 ? 5 : 0, phoenix: 3, ether: 2 };
}
function heroBrain(b, u) {
  const sk = heroSkills(u.id), all = [...sk.innate, ...sk.echo, ...sk.slots].filter((id) => b.canUse(u, id));
  const hs = b.alive('h'), low = hs.filter((h) => h.hp < h.maxhp * 0.4), ko = b.heroes().filter((h) => h.hp <= 0);
  const foes = b.alive('f').filter((f) => !f.jumping);
  if (ko.length) { const r = all.find((id) => skill(id).k === 'revive'); if (r) return { kind: 'skill', sk: r, tg: [ko[0]] }; if (b.count('phoenix')) return { kind: 'item', item: 'phoenix', sk: 'i_phoenix', tg: [ko[0]] }; }
  if (low.length) { const heals = all.filter((id) => skill(id).k === 'heal'); const h = low.length > 1 ? heals.find((id) => skill(id).t === 'A') || heals[0] : heals[0]; if (h) return { kind: 'skill', sk: h, tg: [low[0]] }; if (u.hp < u.maxhp * 0.3 && b.count('potion')) return { kind: 'item', item: 'potion', sk: 'i_potion', tg: [u] }; }
  const buff = all.find((id) => ['guardsong', 'stonewall', 'sanctuary'].includes(id)); if (buff && b.boss && !hs.every((h) => h.st.protect || h.st.shell)) return { kind: 'skill', sk: buff, tg: [u] };
  if (b.res >= 100 && sk.ult && (b.boss || foes.length > 2)) return { kind: 'ult', sk: sk.ult, tg: [foes[0]] };
  let best = { kind: 'skill', sk: 'attack', tg: [foes[0]] }, bv = 0;
  for (const id of ['attack', ...all]) {
    const s = skill(id); if (!['phys', 'mag'].includes(s.k) || s.x.jump) continue;
    for (const f of foes) {
      const els = b.els(u, s), aff = b.affinity(f, els); if (aff === 'absorb' || aff === 'null') continue;
      const tgts = s.t === 'E' ? foes.length : 1, v = s.p * (s.h || 1) * tgts * (aff === 'weak' ? 2.5 : aff === 'resist' ? 0.4 : 1) / (1 + s.mp / 40) * (f.charging ? 1.5 : 1);
      if (v > bv) { bv = v; best = { kind: 'skill', sk: id, tg: [f] }; }
    }
  }
  return best;
}
function fight(foes, boss) {
  const heroes = active().map((id) => { const p = G.s.party[id], st = heroStats(id), sk = heroSkills(id); return { id, n: CHARS[id].n, lv: p.lv, hp: p.hp, mp: p.mp, st, skills: sk, echo: p.echo }; });
  const inv = { ...G.s.inv };
  const b = new Battle({ heroes, foes, boss, count: (i) => inv[i] || 0, consume: (i) => inv[i]-- });
  let turns = 0, heroTurns = 0, kos = 0, fa = 0, fd = 0, stg = 0, skip = 0;
  while (!b.result && turns < 400) {
    const u = b.next(); if (!u) break; turns++;
    const st = b.startTurn(u); if (st.skip) { if (u.side === 'f') skip++; b.check([]); continue; }
    if (u.side === 'f') { fa++; const ev = b.foeTurn(u); kos += ev.filter((e) => e.t === 'ko' && e.tg.side === 'h').length; fd += ev.filter((e) => e.t === 'hit' && e.dmg && e.tg.side === 'h').reduce((a, e) => a + e.dmg / e.tg.maxhp, 0); continue; }
    heroTurns++;
    let cmd = st.auto || heroBrain(b, u); if (cmd.kind === 'land') cmd = { kind: 'land', sk: cmd.sk, tg: cmd.tg };
    b.act(u, cmd);
    while (!b.result && b.extraFor === u) { heroTurns++; b.act(u, heroBrain(b, u)); }
  }
  return { result: b.result, turns, heroTurns, kos, fa, fd, skip, hpLeft: b.alive('h').reduce((a, h) => a + h.hp / h.maxhp, 0) / 4 };
}
const CASES = [
  // label, members, level, weapon tier, echoes, foes, boss
  ['P  zone canyon', ['lorne', 'vera', 'lin'], 2, 0, [], ['canyonwolf', 'slime', 'windbat'], false],
  ['P  boss roc', ['lorne', 'vera', 'lin'], 5, 1, ['arthur', 'sylph'], ['boss_roc'], true],
  ['1  zone swamp', ['lorne', 'vera', 'lin'], 7, 1, ['arthur', 'sylph'], ['swampsnake', 'mushroom', 'willo'], false],
  ['1  boss hydra', ['lorne', 'vera', 'lin'], 10, 2, ['arthur', 'roland', 'hyde'], ['boss_hydra'], true],
  ['2  boss glen', ['lorne', 'vera', 'lin', 'brann'], 13, 2, ['arthur', 'roland', 'hyde', 'sylph'], ['boss_glen'], true],
  ['2  boss lavagolem', ['lorne', 'vera', 'lin', 'brann'], 15, 3, ['arthur', 'roland', 'hyde', 'sylph'], ['boss_lavagolem'], true],
  ['3  boss kraken', ['lorne', 'vera', 'lin', 'nia'], 20, 4, ['arthur', 'yuki', 'hyde', 'leo'], ['boss_kraken'], true],
  ['4  boss icedragon', ['lorne', 'vera', 'lin', 'brann'], 25, 4, ['marin', 'roland', 'seren', 'gaia'], ['boss_icedragon'], true],
  ['5  boss sandking', ['lorne', 'vera', 'lin', 'nia'], 30, 5, ['arthur', 'yuki', 'hyde', 'shippu'], ['boss_sandking'], true],
  ['6  boss raijuu', ['lorne', 'vera', 'lin', 'brann'], 35, 6, ['arthur', 'roland', 'seren', 'gaia'], ['boss_raijuu'], true],
  ['7  boss warden', ['lorne', 'vera', 'lin', 'nia'], 39, 6, ['arthur', 'roland', 'seren', 'leo'], ['boss_warden'], true],
  ['8  boss fallen', ['lorne', 'vera', 'lin', 'yoru'], 45, 7, ['arthur', 'roland', 'seren', 'morr'], ['boss_fallen'], true],
  ['9  boss shadowlord', ['lorne', 'vera', 'lin', 'brann'], 49, 8, ['arthur', 'roland', 'seren', 'gaia'], ['boss_shadowlord'], true],
  ['10 boss mordain1', ['lorne', 'vera', 'lin', 'yoru'], 55, 8, ['arthur', 'roland', 'seren', 'kage'], ['boss_mordain1'], true],
  ['12 boss mordain2', ['lorne', 'vera', 'lin', 'brann'], 66, 9, ['arthur', 'roland', 'seren', 'gaia'], ['boss_mordain2'], true],
  ['12 boss void', ['lorne', 'vera', 'lin', 'brann'], 68, 10, ['arthur', 'roland', 'seren', 'gaia'], ['boss_void'], true],
  ['PG endknight', ['lorne', 'vera', 'lin', 'brann'], 95, 11, ['arthur', 'roland', 'stella', 'gaia'], ['sb_endknight'], true],
];
const N = +process.argv[2] || 40;
for (const [label, mem, lv, tier, ech, foes, boss] of CASES) {
  let w = 0, t = 0, ht = 0, hp = 0, ko = 0, fa = 0, fd = 0, sk = 0;
  for (let i = 0; i < N; i++) { setup(mem, lv, tier, ech, boss ? 5 : 3); const r = fight(foes, boss); if (r.result === 'win') { w++; hp += r.hpLeft; } t += r.turns; ht += r.heroTurns; ko += r.kos; fa += r.fa; fd += r.fd; sk += r.skip; }
  console.log(label.padEnd(22), `lv${lv}`.padEnd(5), `win ${String(Math.round(w / N * 100)).padStart(3)}%`, ` hero actions ${(ht / N).toFixed(1).padStart(5)}`, ` hp left ${w ? Math.round(hp / w * 100) : 0}%`, ` KOs ${(ko / N).toFixed(1)}`, ` foe acts ${(fa / N).toFixed(1)} skips ${(sk / N).toFixed(1)} dmg/act ${Math.round(fd / Math.max(1, fa) * 100)}%`);
}
