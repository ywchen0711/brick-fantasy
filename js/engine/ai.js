// How a hero fights when left to themselves (auto-battle, and the simulator): raise the fallen, heal the hurt, put up
// guards against a boss, loose resonance arts on bosses and crowds, else the strongest blow on a weakness.
import { skill } from '../data/skills.js';

export function heroBrain(b, u, sk, opt = {}) {
  const all = [...sk.innate, ...sk.echo, ...sk.slots].filter((id) => b.canUse(u, id));
  const hs = b.alive('h'), low = hs.filter((h) => h.hp < h.maxhp * 0.4), ko = b.heroes().filter((h) => h.hp <= 0);
  const foes = b.alive('f').filter((f) => !f.jumping);
  if (!foes.length) return { kind: 'defend' };
  if (ko.length) { const r = all.find((id) => skill(id).k === 'revive'); if (r) return { kind: 'skill', sk: r, tg: [ko[0]] }; if (b.count('phoenix') && opt.items !== false) return { kind: 'item', item: 'phoenix', sk: 'i_phoenix', tg: [ko[0]] }; }
  if (low.length) {
    const heals = all.filter((id) => skill(id).k === 'heal' && skill(id).t !== 's'), h = low.length > 1 ? heals.find((id) => skill(id).t === 'A') || heals[0] : heals[0];
    if (h) return { kind: 'skill', sk: h, tg: [low.sort((a, c) => a.hp / a.maxhp - c.hp / c.maxhp)[0]] };
    if (u.hp < u.maxhp * 0.3 && opt.items !== false) { const pot = b.count('hipotion') && u.maxhp > 500 ? 'hipotion' : b.count('potion') ? 'potion' : null; if (pot) return { kind: 'item', item: pot, sk: 'i_' + pot, tg: [u] }; }
  }
  const buff = all.find((id) => ['guardsong', 'stonewall', 'sanctuary'].includes(id)); if (buff && b.boss && !hs.every((h) => h.st.protect || h.st.shell)) return { kind: 'skill', sk: buff, tg: [u] };
  if (opt.res !== false) {
    if (b.res >= 200 && b.partnerFor(u) && b.boss) { const syn = synFor(u); if (syn) return { kind: 'syn', sk: syn, tg: [foes[0]] }; }
    if (b.res >= 100 && sk.ult && (b.boss || foes.length > 2)) return { kind: 'ult', sk: sk.ult, tg: [foes[0]] };
  }
  let best = { kind: 'skill', sk: 'attack', tg: [foes[0]] }, bv = 0;
  for (const id of ['attack', ...all]) {
    const s = skill(id); if (!['phys', 'mag'].includes(s.k) || s.x.jump || s.x.hpCost) continue;
    for (const f of foes) {
      const els = b.els(u, s), aff = b.affinity(f, els); const known = f.scanned || els.every((e) => f.known.has(e) || !(f.w.includes(e) || f.a.includes(e) || f.n0.includes(e)));
      if ((aff === 'absorb' || aff === 'null') && known) continue;
      const tgts = s.t === 'E' ? foes.length : 1, v = s.p * (s.h || 1) * tgts * (aff === 'weak' ? 2.5 : aff === 'resist' ? 0.4 : 1) / (1 + s.mp / 40) * (f.charging ? 1.5 : 1) * (f.hp < f.maxhp * 0.2 && tgts === 1 ? 1.3 : 1);
      if (v > bv) { bv = v; best = { kind: 'skill', sk: id, tg: [f] }; }
    }
  }
  return best;
}
import { ECHOES } from '../data/echoes.js';
export const synFor = (u) => (u.echo && ECHOES[u.echo] ? ECHOES[u.echo].pair[1] : null);
