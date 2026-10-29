// The battle on screen: a little brick stage in the place's colours, the heroes on the right and the foes on the
// left, the turn timeline across the top, the party's numbers bottom right, the resonance gauge, a tag over each
// foe (its guard gauge and the weaknesses found so far), commands and target choice, and every event played out.
import * as THREE from '../../lib/three.module.min.js';
import { Voxels, VS, B } from './voxel.js';
import { Battle } from './battle.js';
import { buildBeast } from './beasts.js';
import { heroFig, npcFig } from './models.js';
import { FX, elementFX } from './fx.js';
import { UI, wait, div } from './ui.js';
import { I } from './input.js';
import { sfx, music, nowPlaying } from './audio.js';
import { G, active, heroStats, heroSkills, count, take, give, reward } from './state.js';
import { skill, EL, EL_COLOR, ST_NAME } from '../data/skills.js';
import { CHARS } from '../data/chars.js';
import { ECHOES } from '../data/echoes.js';
import { ITEMS } from '../data/items.js';
import { ENEMIES } from '../data/enemies.js';
import { heroBrain, synFor } from './ai.js';
import { skyTex } from './field.js';

const EL_ICON = { fire: '🔥', ice: '❄️', thunder: '⚡', water: '💧', wind: '🌪️', earth: '🪨', light: '✨', dark: '🌑', slash: '🗡️', pierce: '🔱', strike: '🔨', shot: '🏹' };
const ST_ICON = { poison: '☠', sleep: '💤', silence: '🤐', blind: '🕶', paralyze: '⚡', slow: '🐢', haste: '💨', protect: '🛡', shell: '🔰', regen: '💚', atkUp: '⚔↑', atkDown: '⚔↓', defDown: '🛡↓', magUp: '✦↑', magDown: '✦↓', sprDown: '◇↓', berserk: '💢', taunt: '❗', blink: '👥', endure: '💪', doom: '💀', stop: '⏸', confuse: '💫', critUp: '🎯', evade: '🍃' };
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

export class BattleView {
  constructor(renderer) { this.R = renderer; this.cam = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 200); this.tweens = []; this.speed = 1; this.auto = false; }
  resize() { this.cam.aspect = innerWidth / innerHeight; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- setting the stage
  stage(look) {
    const S = new THREE.Scene(); this.scene = S; S.background = skyTex(look.sky || ['#7ab8f0', '#e0f0ff']); S.fog = new THREE.Fog(look.fog || '#d8ecff', 14, 40);
    S.add(new THREE.HemisphereLight(look.sky?.[1] || '#ffffff', '#5a4a3a', (look.amb ?? 0.6) * 1.2));
    const sun = new THREE.DirectionalLight('#fff4e0', (look.amb ?? 0.6) * 2); sun.position.set(5, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.bias = -0.0008; S.add(sun);
    if (look.dark) { const p = new THREE.PointLight(look.light || '#ffd8a0', 3, 18, 1.3); p.position.set(0, 4, 2); S.add(p); }
    const W = 30, D = 20, V = new Voxels(W, 8, D), r = mulberry(look.seed || 7);
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) { const back = z < 4, h = back ? 2 + Math.floor(r() * 2) : 2; for (let y = 0; y < h; y++) V.set(x, y, z, look.under || B.DIRT); V.set(x, h - 1, z, r() < 0.18 ? look.g2 : look.g); }
    // scenery round the back: trees, rocks, pillars
    for (let k = 0; k < 9; k++) { const x = Math.floor(r() * W), z = Math.floor(r() * 3); const t = V.top(x, z); const kind = look.tree;
      if (kind === 'pillar') { for (let y = t; y < t + 5; y++) V.set(x, y, z, look.wall || B.MARBLE); }
      else if (kind === 'pine') { for (let y = t; y < t + 2; y++) V.set(x, y, z, B.WOOD); for (let dy = 1; dy < 6; dy++) { const rad = Math.round((6 - dy) / 2.2); for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) if (Math.abs(dx) + Math.abs(dz) <= rad) V.set(x + dx, t + dy, z + dz, B.PINE); } }
      else if (kind === 'rock') { V.set(x, t, z, B.GREY); V.set(x + 1, t, z, B.STONE); }
      else if (kind === 'cactus') { for (let y = t; y < t + 3; y++) V.set(x, y, z, B.CACTUS); }
      else if (kind === 'crystal') { for (let y = t; y < t + 2; y++) V.set(x, y, z, B.CRYSTAL); }
      else if (kind) { for (let y = t; y < t + 3; y++) V.set(x, y, z, B.WOOD); for (let dy = 0; dy < 3; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dz) <= 3 - dy) V.set(x + dx, t + 2 + dy, z + dz, kind === 'sakura' ? B.BLOSSOM : kind === 'bamboo' ? B.BAMLEAF : B.LEAF2); }
    }
    const grp = new THREE.Group(); V.mesh(grp); grp.position.set(-W * VS / 2, -2 * VS, -D * VS / 2 + 1); S.add(grp); this.V = V;
    this.fx = new FX(S);
    this.cursor = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), new THREE.MeshBasicMaterial({ color: '#ffe24a', toneMapped: false })); this.cursor.rotation.x = Math.PI; this.cursor.visible = false; S.add(this.cursor);
  }
  // ---------------------------------------------------------------- one fight; resolves 'win' | 'lose' | 'fled'
  async start(opts) {
    this.opts = opts; const { foes, boss = false, canFlee = true, look = {}, preempt = 0 } = opts;
    this.stage(look); this.tweens = []; this.views = new Map(); this.camT = 0;
    const s = G.s, ids = active();
    const heroes = ids.map((id) => { const p = s.party[id]; return { id, n: CHARS[id].n, lv: p.lv, hp: p.hp, mp: p.mp, ko: p.ko || p.hp <= 0, st: heroStats(id), skills: heroSkills(id), echo: p.echo }; });
    this.b = new Battle({ heroes, foes, boss, canFlee, diff: [0.75, 1, 1.25][s.opts.diff ?? 1], count: (i) => count(i), consume: (i) => take(i), preempt });
    for (const f of this.b.foes()) s.seen[f.id] = Math.max(s.seen[f.id] || 0, 1);
    this.dom(); this.place();
    this.prevMusic = nowPlaying(); music(opts.music || (boss ? 'boss' : 'battle'), { restart: true });
    this.running = true;
    const names = [...new Set(this.b.foes().map((f) => f.n))].join('、');
    this.msg(preempt > 0 ? '先制攻擊！' : preempt < 0 ? '被偷襲了！' : `${names}出現了！`);
    await this.intro();
    const res = await this.loop();
    return res;
  }
  dom() {
    const el = document.getElementById('battle'); el.innerHTML = `<div class="tl"></div><div class="msg"></div><div class="aname"></div><div class="tags"></div><div class="pops"></div><div class="party"></div><div class="res"><b>共鳴</b><div class="bar"><i></i><i></i><i></i></div></div><div class="btools"><button class="auto"><kbd class="pk">LB</kbd>自動</button><button class="fast"><kbd class="pk">RB</kbd>加速</button></div>`; el.hidden = false;
    this.el = el; this.tagEls = new Map();
    el.querySelector('.auto').onclick = (e) => { e.stopPropagation(); this.auto = !this.auto; this.toolDraw(); if (this.auto) this.menuW?.close(); };
    el.querySelector('.fast').onclick = (e) => { e.stopPropagation(); this.speed = this.speed > 1 ? 1 : 2; this.toolDraw(); };
    this.toolDraw();
  }
  toolDraw() { this.el.querySelector('.auto').classList.toggle('on', this.auto); this.el.querySelector('.fast').classList.toggle('on', this.speed > 1); }
  place() {
    const hs = this.b.heroes(), slots = [[2.5, -1.9], [3.0, -0.75], [2.5, 0.4], [3.0, 1.55]];
    hs.forEach((u, i) => { const F = heroFig(u.id); this.scene.add(F.root); const [x, z] = slots[i]; const v = { u, F, root: F.root, home: v3(x, 0, z), pos: v3(x + 6, 0, z), yaw: -Math.PI / 2, pose: {}, side: 'h', h: F.kid ? 1.2 : 1.55 }; this.views.set(u.uid, v); });
    this.layoutFoes(true);
  }
  layoutFoes(first) {
    const fs = this.b.foes(), n = fs.length, big = fs.some((f) => f.d.boss);
    const spots = big && n === 1 ? [[-3.2, 0]] : n === 1 ? [[-2.8, 0.3]] : n === 2 ? [[-2.5, 1.1], [-3.4, -1.2]] : [[-2.3, 1.3], [-3.5, -0.4], [-2.6, -2.2], [-4.4, 1.9], [-4.6, -2.0], [-1.8, 3.0]];
    fs.forEach((u, i) => {
      let v = this.views.get(u.uid);
      if (!v) { const B = buildBeast(u.d); this.scene.add(B.g); v = { u, B, root: B.g, home: v3(0, 0, 0), pos: v3(-9, 0, 0), yaw: Math.PI / 2, side: 'f', h: B.h, born: first ? 0 : 1 }; this.views.set(u.uid, v); this.makeTag(u, v); }
      const [x, z] = spots[i % spots.length]; v.home.set(x - (u.d.boss && n > 1 ? 0.8 : 0), 0, z);
      if (first) v.pos.set(x - 6, 0, z);
    });
  }
  intro() { return this.tween(0.9, (k) => { const e = 1 - (1 - k) ** 3; for (const v of this.views.values()) { const from = v.side === 'h' ? 6 : -6; v.pos.x = v.home.x + from * (1 - e); v.pos.z = v.home.z; } }); }
  // ---------------------------------------------------------------- the turn loop
  async loop() {
    const b = this.b;
    while (!b.result) {
      const u = b.next(); if (!u) break;
      this.current = u; this.drawTimeline(); this.drawParty();
      const st = b.startTurn(u); await this.play(st.ev);
      if (st.skip || u.hp <= 0) { b.check(st.ev); if (b.result) break; continue; }
      if (b.result) break;
      if (u.side === 'f') { await wait(180 / this.speed); await this.play(b.foeTurn(u)); continue; }
      let cmd = st.auto;
      if (!cmd) cmd = await this.choose(u);
      if (!cmd) continue;
      await this.play(b.act(u, cmd));
      while (!b.result && b.extraFor === u) { this.drawTimeline(); this.drawParty(); const c2 = await this.choose(u, true); if (!c2) break; await this.play(b.act(u, c2)); }
    }
    this.current = null; this.drawParty(); this.drawTimeline();
    return this.finish();
  }
  async choose(u, extra = false) {
    if (this.auto) { await wait(120 / this.speed); return heroBrain(this.b, u, u.skills, { res: false }); }
    const v = this.views.get(u.uid); this.stepOut(v, true);
    const cmd = await this.commandMenu(u, extra);
    this.stepOut(v, false);
    if (cmd === 'auto') return heroBrain(this.b, u, u.skills, { res: false });
    return cmd;
  }
  stepOut(v, on) { v.ready = on; }
  // ---------------------------------------------------------------- commands
  async commandMenu(u, extra) {
    const b = this.b, sk = u.skills;
    for (;;) {
      if (this.auto) return 'auto';
      const partner = b.partnerFor(u);
      const items = [
        { label: '攻擊', k: 'attack', help: `用${CHARS[u.id].weapon === 'staff' ? '杖' : '武器'}攻擊（${EL[u.blow]}${u.wel ? '・' + EL[u.wel] : ''}）` },
        { label: '技能', k: 'skills', disabled: !sk.innate.length && !sk.slots.length, help: '角色自己的技能與設定的迴響技' },
        { label: u.echo ? `迴響・${ECHOES[u.echo].n}` : '迴響', k: 'echo', disabled: !sk.echo.length, help: u.echo ? `${ECHOES[u.echo].title}的技能` : '沒有裝備迴響' },
        { label: '物品', k: 'item', help: '使用道具' },
        { label: '共鳴技', k: 'ult', disabled: !(sk.ult && b.res >= 100), right: sk.ult ? '◆1' : '', help: sk.ult ? `${skill(sk.ult).n}：${skill(sk.ult).d}（消耗 1 格共鳴）` : '裝備迴響後才能使用' },
        { label: '合體技', k: 'syn', disabled: !(partner && b.res >= 200), right: partner ? '◆2' : '', help: partner ? `與${partner.n}的${skill(synFor(u)).n}（消耗 2 格共鳴）` : u.echo ? `需要裝備「${ECHOES[ECHOES[u.echo].pair[0]].n}」的隊友` : '' },
        { label: '防禦', k: 'defend', help: '受到的傷害減半，下次行動提早' },
        { label: '逃跑', k: 'flee', disabled: !b.canFlee, help: b.canFlee ? '逃離戰鬥' : '無法逃跑！' },
      ];
      const r = await UI.list(items, { cls: 'bt-menu', title: `${u.n}${extra ? ' <span class="xt">額外回合！</span>' : ''}`, cancel: false, ref: (w) => { this.menuW = w; }, onMenu: () => { this.auto = true; this.toolDraw(); this.menuW?.close(); } });
      this.menuW = null;
      if (r.index < 0) continue;
      const k = r.item.k;
      if (k === 'attack') { const t = await this.target(u, skill('attack')); if (t) return { kind: 'skill', sk: 'attack', tg: t }; continue; }
      if (k === 'defend') return { kind: 'defend' };
      if (k === 'flee') return { kind: 'flee' };
      if (k === 'skills' || k === 'echo') { const list = k === 'skills' ? [...sk.innate, ...sk.slots] : sk.echo; const id = await this.skillMenu(u, list, k === 'echo' ? `迴響・${ECHOES[u.echo].n}` : '技能'); if (!id) continue; const t = await this.target(u, skill(id)); if (t) return { kind: 'skill', sk: id, tg: t }; continue; }
      if (k === 'item') { const id = await this.itemMenu(); if (!id) continue; const s2 = skill(ITEMS[id].use); const t = await this.target(u, s2); if (t) return { kind: 'item', item: id, sk: s2.id, tg: t }; continue; }
      if (k === 'ult') { const s2 = skill(sk.ult); const t = await this.target(u, s2); if (t) return { kind: 'ult', sk: sk.ult, tg: t }; continue; }
      if (k === 'syn') { const s2 = skill(synFor(u)); const t = await this.target(u, s2); if (t) return { kind: 'syn', sk: s2.id, tg: t }; continue; }
    }
  }
  async skillMenu(u, list, title) {
    const b = this.b, items = list.map((id) => { const s = skill(id), c = b.mpCost(u, s); return { label: s.n, id, right: s.x.hpCost ? `HP${s.x.hpCost}%` : c ? `${c}` : '', icon: s.el && s.el !== 'weapon' && s.el !== 'none' ? EL_ICON[s.el] || '' : s.k === 'heal' ? '💚' : s.k === 'buff' ? '⬆' : s.k === 'debuff' ? '⬇' : '', disabled: !b.canUse(u, id), help: s.d + (b.canUse(u, id) ? '' : u.st.silence ? '（沉默中）' : '（MP 不足）') }; });
    const r = await UI.list(items, { cls: 'bt-menu sub', title: `${title}　<small>MP ${u.mp}/${u.maxmp}</small>`, cols: 2 });
    return r.index < 0 ? null : r.item.id;
  }
  async itemMenu() {
    const items = Object.keys(G.s.inv).filter((id) => ITEMS[id]?.use).map((id) => ({ label: ITEMS[id].n, icon: ITEMS[id].icon, id, right: '×' + G.s.inv[id], help: ITEMS[id].d }));
    if (!items.length) { UI.toast('沒有能用的道具'); return null; }
    const r = await UI.list(items, { cls: 'bt-menu sub', title: '物品', cols: 2 });
    return r.index < 0 ? null : r.item.id;
  }
  // choose who: a widget that cycles with the arrows; tags can be tapped
  target(u, s) {
    const b = this.b, foes = b.alive('f').filter((f) => !f.jumping), allies = b.heroes().filter((h) => !h.gone);
    let list, all = false;
    if (s.t === 'e') list = foes; else if (s.t === 'a') list = allies.filter((h) => h.hp > 0); else if (s.t === 'ko') { list = allies.filter((h) => h.hp <= 0); if (!list.length) { UI.toast('沒有倒下的隊友'); return Promise.resolve(null); } }
    else { all = true; list = s.t === 'E' || s.t === 'r' ? foes : s.t === 's' ? [u] : (s.k === 'revive' ? allies : allies.filter((h) => h.hp > 0)); }
    return new Promise((res) => {
      let k = s.t === 'a' || s.t === 'ko' ? Math.max(0, list.indexOf(s.k === 'heal' ? list.slice().sort((a, c) => a.hp / a.maxhp - c.hp / c.maxhp)[0] : u)) : 0;
      if (s.t === 'e') { const w = list.findIndex((f) => this.b.affinity(f, this.b.els(u, s)) === 'weak' && [...f.w].some((e) => f.known.has(e))); if (w >= 0) k = w; }
      const el = div('win tgt'); el.innerHTML = `<p>${all ? (s.t === 's' ? '自己' : '全體') : '選擇目標'}　<small>${s.n}</small></p>`;
      const draw = () => { for (const [uid, t] of this.tagEls) t.classList.remove('sel'); for (const v of this.views.values()) v.sel = false; (all ? list : [list[k]]).forEach((t) => { const v = this.views.get(t.uid); if (v) v.sel = true; this.tagEls.get(t.uid)?.classList.add('sel'); }); this.hint(u, s, all ? null : list[k]); };
      const done = (r) => { UI.pop(w); for (const v of this.views.values()) v.sel = false; for (const t of this.tagEls.values()) t.classList.remove('sel'); this.hint(); this.pickCb = null; res(r); };
      const self = this; const w = { el, update() { if (self.auto) done(null); }, nav(d) { if (all) return; if (d === 'up' || d === 'left') k = (k - 1 + list.length) % list.length; else k = (k + 1) % list.length; sfx('tick'); draw(); }, ok() { sfx('ok'); done(all ? list : [list[k]]); }, back() { sfx('back'); done(null); } };
      this.pickCb = (unit) => { const i = list.indexOf(unit); if (i < 0) return; if (all || i === k) w.ok(); else { k = i; draw(); } };
      el.addEventListener('click', () => w.ok());
      UI.push(w); draw();
    });
  }
  hint(u, s, t) { const h = this.el.querySelector('.msg'); if (!u) { h.classList.remove('hint'); return; } if (t && t.side === 'f') { const els = this.b.els(u, s), aff = this.b.affinity(t, els), known = els.some((e) => t.known.has(e)); h.innerHTML = `${t.n}${known && aff === 'weak' ? '　<b class="wk">弱點！</b>' : known && aff === 'absorb' ? '　<b class="rs">吸收</b>' : known && (aff === 'resist' || aff === 'null') ? '　<b class="rs">抗性</b>' : ''}`; h.classList.add('hint', 'show'); } else if (t) { h.innerHTML = `${t.n}　HP ${t.hp}/${t.maxhp}`; h.classList.add('hint', 'show'); } }
  // ---------------------------------------------------------------- playing the events
  async play(ev) {
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i], sp = this.speed;
      switch (e.t) {
        case 'act': await this.actStart(e, ev.slice(i + 1)); break;
        case 'hit': this.showHit(e); if (!e.quiet) await wait((e.heal || e.mpHeal ? 120 : 200) / sp); break;
        case 'brk': this.drawTag(e.tg); break;
        case 'stagger': await this.showStagger(e.tg); break;
        case 'recover': this.drawTag(e.tg); this.pop(e.tg, '重整架勢', 'st'); await wait(250 / sp); break;
        case 'status': this.pop(e.tg, `${ST_NAME[e.st] || e.st}${e.on ? '' : ' 解除'}`, e.on ? (['haste', 'protect', 'shell', 'regen', 'atkUp', 'magUp', 'blink', 'endure', 'critUp', 'evade', 'taunt'].includes(e.st) ? 'buff' : 'bad') : 'st'); this.drawParty(); this.drawTag(e.tg); await wait(90 / sp); break;
        case 'ko': await this.showKO(e.tg); break;
        case 'revive': { const v = this.views.get(e.tg.uid); elementFX(this.fx, 'revive', this.mid(v)); v.ko = false; this.pop(e.tg, `復活 ${e.hp}`, 'heal'); sfx('heal'); this.drawParty(); await wait(400 / sp); break; }
        case 'extra': this.pop(e.u, '額外回合！', 'extra'); sfx('extra'); await wait(350 / sp); break;
        case 'res': this.drawRes(); break;
        case 'charge': { const v = this.views.get(e.u.uid); v.charging = true; sfx('charge'); this.msg(`${e.u.n}正在蓄力「${e.name}」！快打破它的防禦！`); this.pop(e.u, '蓄力中', 'bad'); await wait(700 / sp); break; }
        case 'phase': await this.bossLine(e.u, e.say); break;
        case 'summon': this.layoutFoes(false); this.drawTimeline(); sfx('echo'); this.msg(`${e.u.n}出現了！`); await wait(500 / sp); break;
        case 'steal': this.pop(e.u, e.item ? `偷到了 ${ITEMS[e.item].n}！` : e.none ? '沒有東西可偷' : '偷竊失敗', e.item ? 'buff' : 'st'); if (e.item) sfx('coin'); await wait(450 / sp); break;
        case 'scan': this.drawTag(e.tg); this.pop(e.tg, '看穿了！', 'buff'); sfx('light'); await wait(350 / sp); break;
        case 'flee': if (e.ok) { this.msg('逃跑了！'); sfx('flee'); await this.tween(0.6, (k) => { for (const v of this.views.values()) if (v.side === 'h') { v.pos.x = v.home.x + k * 6; v.yaw = Math.PI / 2; v.running = true; } }); } else { this.msg('逃不掉！'); sfx('buzz'); await wait(500 / sp); } break;
        case 'jump': { const v = this.views.get(e.u.uid); sfx('wind'); await this.tween(0.4, (k) => { v.pos.y = k * 9; }); v.root.visible = false; break; }
        case 'land': { const v = this.views.get(e.u.uid); v.root.visible = true; break; }
        case 'ult': await this.ultCinematic(e.u, [e.echo]); break;
        case 'syn': await this.ultCinematic(e.u, [e.echo, e.echo2], e.p); break;
        case 'msg': this.msg(e.text); await wait(500 / sp); break;
        case 'end': break;
      }
    }
    this.drawParty(); this.drawTimeline(); for (const f of this.b.foes()) this.drawTag(f);
  }
  async actStart(e, rest) {
    const s = skill(e.sk), v = this.views.get(e.u.uid), sp = this.speed, isHero = e.u.side === 'h';
    if (v.charging) v.charging = false;
    if (e.sk !== 'attack' && e.sk !== 'defend') this.aname(s.n, isHero ? (s.x.ult || s.x.syn ? 'ult' : '') : 'foe');
    if (e.sk === 'defend') { this.pop(e.u, '防禦', 'st'); v.defend = true; await wait(250 / sp); return; }
    const tg = (e.tg || []).filter(Boolean), t0 = tg[0] && this.views.get(tg[0].uid), phys = ['phys', 'steal'].includes(s.k) && s.t !== 'E' && s.t !== 'r' && !s.x.jump;
    const elx = s.el === 'weapon' ? (e.u.side === 'h' ? (e.u.wel || e.u.blow) : 'strike') : s.el;
    if (s.k === 'phys' && phys && t0 && t0 !== v) {
      // run up to the target, strike, come back after the hits
      const dir = isHero ? 1 : -1, to = v3(t0.pos.x + dir * (0.9 + (t0.u.d?.scale || 1) * 0.4), 0, t0.pos.z), from = v.pos.clone();
      await this.tween(0.22, (k) => { v.pos.lerpVectors(from, to, k); v.running = true; });
      v.running = false; v.swing = 1; sfx(['slash', 'pierce', 'strike', 'shot'].includes(e.u.blow) && s.el === 'weapon' ? e.u.blow : s.el in EL ? (['slash', 'pierce', 'strike', 'shot'].includes(s.el) ? s.el : 'slash') : 'strike');
      await wait(90 / sp);
      const n = rest.filter((x) => x.t === 'hit' && x.tg && x.tg.side !== e.u.side).length || 1;
      for (let i = 0; i < Math.min(n, 4); i++) { elementFX(this.fx, elx in EL ? elx : 'strike', this.mid(t0), false); if (i) { v.swing = 1; sfx('slash'); } await wait(60 / sp); }
      this.returnLater(v, from);
    } else if (s.k === 'mag' || s.k === 'heal' || s.k === 'buff' || s.k === 'debuff' || s.k === 'revive' || s.k === 'cure' || s.k === 'scan' || (s.k === 'phys' && !phys)) {
      v.cast = 1; this.fx.circle(v3(v.pos.x, 0, v.pos.z), EL_COLOR[elx] || '#ffffff', { r: 0.9, life: 0.9 }); this.fx.burst(this.mid(v), EL_COLOR[elx] || '#ffffff', { n: 14, speed: 1, g: 2, rise: 1, size: 0.06, life: 0.6 });
      await wait(320 / sp);
      const fxk = s.k === 'heal' || s.k === 'cure' ? 'heal' : s.k === 'buff' ? 'buff' : s.k === 'debuff' ? 'debuff' : s.k === 'revive' ? 'revive' : s.k === 'scan' ? 'light' : elx;
      sfx(fxk === 'heal' || fxk === 'revive' ? 'heal' : fxk === 'buff' ? 'buff' : fxk === 'debuff' ? 'debuff' : ['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'light', 'dark'].includes(fxk) ? fxk : 'strike');
      const big = !!(s.x.ult || s.x.syn);
      if (s.t === 'r') { } else for (const t of tg.slice(0, 6)) { const tv = this.views.get(t.uid); if (tv) elementFX(this.fx, fxk in EL || ['heal', 'buff', 'debuff', 'revive'].includes(fxk) ? fxk : 'none', this.mid(tv), big); }
      if (big) { this.shake(0.5, 0.2); }
      await wait(260 / sp); v.cast = 0;
    } else if (s.k === 'special') { await wait(200 / sp); }
    if (s.t === 'r') this.randomFX = elx;
  }
  returnLater(v, home) { setTimeout(() => { const from = v.pos.clone(); this.tween(0.25, (k) => { v.pos.lerpVectors(from, v.home, k); v.backstep = true; }).then(() => { v.backstep = false; }); }, 260 / this.speed); }
  showHit(e) {
    const t = e.tg, v = this.views.get(t.uid); if (!v) return;
    if (this.randomFX && e.dmg != null && e.u) { elementFX(this.fx, this.randomFX in EL ? this.randomFX : 'strike', this.mid(v)); sfx(['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'light', 'dark'].includes(this.randomFX) ? this.randomFX : 'slash'); }
    if (e.miss) { this.pop(t, 'MISS', 'st'); sfx('miss'); v.dodge = 1; return; }
    if (e.heal != null) { this.pop(t, e.heal, 'heal'); this.drawParty(); this.drawTag(t); return; }
    if (e.mpHeal != null) { this.pop(t, `MP ${e.mpHeal}`, 'mp'); this.drawParty(); return; }
    if (e.dmg != null) {
      this.pop(t, e.dmg, e.crit ? 'crit' : e.weak ? 'weak' : e.resist ? 'resi' : t.side === 'h' ? 'hurt' : 'dmg', e.weak ? '弱點！' : e.crit ? '會心！' : e.resist ? (e.dmg === 0 ? '無效' : '抵抗') : '');
      if (e.weak) sfx('weak'); if (e.crit) { sfx('crit'); I.rumble(90, 0.5, 0.3); } if (t.side === 'h' && e.dmg > t.maxhp * 0.25) I.rumble(160, 0.8, 0.5);
      if (e.el !== 'poison' && e.el !== 'cost') { v.hurt = 1; if (t.side === 'h') this.shake(0.15, 0.06); }
      if (e.weak && t.side === 'f') { this.flashTag(t); }
      this.drawParty(); this.drawTag(t);
    }
  }
  async showStagger(t) {
    const v = this.views.get(t.uid); sfx('brk'); this.shake(0.4, 0.18); v.stag = true; I.rumble(260, 0.9, 0.6);
    this.fx.burst(this.mid(v), ['#ffffff', '#ffe24a', '#7af0ff'], { n: 60, speed: 6, size: 0.12, life: 0.8 }); this.fx.glow(this.mid(v), '#ffffff', { size: 4, life: 0.35 }); this.fx.ring(v3(v.pos.x, 0.05, v.pos.z), '#ffe24a', { r: 3 });
    this.big('BREAK!', t); this.drawTag(t); await wait(650 / this.speed);
  }
  async showKO(t) {
    const v = this.views.get(t.uid); if (!v) return;
    if (t.side === 'f') { sfx('bricks'); this.fx.shatter(v.root, 1.3); this.tagEls.get(t.uid)?.remove(); this.tagEls.delete(t.uid); await wait(300 / this.speed); }
    else { sfx('ko'); v.ko = true; this.pop(t, '倒下了', 'bad'); this.drawParty(); await wait(400 / this.speed); }
  }
  async bossLine(u, say) { const n = say.startsWith('「') ? u.n : ''; await UI.say(n, say, { top: true, mini: true, auto: 2400 / this.speed }); }
  // a resonance art: the echo's ghost rises behind the hero, the screen dims, the name in big letters
  async ultCinematic(u, echoes, p) {
    const v = this.views.get(u.uid); sfx('ult'); I.rumble(500, 0.7, 0.7); const ghosts = [];
    echoes.forEach((id, i) => {
      const e = ECHOES[id], host = i === 0 ? v : this.views.get(p?.uid); if (!e || !host) return;
      const F = npcFig(e.spec, {});
      F.root.traverse((m) => { if (!m.isMesh) return; const mk = (x) => { const c = x.clone(); c.transparent = true; c.opacity = 0; if (c.emissive) { c.emissive = new THREE.Color(e.color); c.emissiveIntensity = 0.7; } return c; }; m.material = Array.isArray(m.material) ? m.material.map(mk) : mk(m.material); });
      this.scene.add(F.root); ghosts.push(F);
      F.pose({ x: host.pos.x + 0.9, y: 0, z: host.pos.z - 0.7, yaw: -Math.PI / 2, armR: -2.6, armL: -0.4 }); F.root.scale.setScalar(1.6);
    });
    document.getElementById('dim').classList.add('on');
    const names = echoes.map((id) => ECHOES[id]?.n).filter(Boolean).join(' × ');
    this.bigName(names);
    this.camFocus = v; await this.tween(0.9, (k) => { for (const F of ghosts) F.root.traverse((m) => { if (m.isMesh) [].concat(m.material).forEach((x) => { x.opacity = Math.min(0.75, k * 1.2); }); }); });
    await wait(500 / this.speed);
    document.getElementById('dim').classList.remove('on'); this.camFocus = null;
    setTimeout(() => { for (const F of ghosts) this.scene.remove(F.root); }, 900);
  }
  // ---------------------------------------------------------------- the end of the fight
  async finish() {
    const b = this.b, s = G.s;
    // write the heroes back into the save
    for (const u of b.heroes()) { const p = s.party[u.id]; p.hp = Math.max(0, u.hp); p.mp = u.mp; p.ko = u.hp <= 0; }
    for (const it of b.gained) give(it);
    if (b.result === 'win') {
      s.battles++; s.kills += b.units.filter((u) => u.side === 'f' && u.dead).length;
      for (const f of b.units) if (f.side === 'f' && f.dead) { s.seen[f.id] = 2; if (f.d.hunt) s.bounties[f.id] = s.bounties[f.id] === 'claimed' ? 'claimed' : 'killed'; }
      music('victory', { restart: true });
      for (const v of this.views.values()) if (v.side === 'h' && !v.ko) v.win = true;
      await wait(500);
      const sp = b.spoils(); const r = reward(sp.xp, sp.gil, sp.ep, b.drops);
      for (const u of b.heroes()) { const p = s.party[u.id]; if (p.hp <= 0) { p.hp = 1; p.ko = false; } }
      await this.results(r, sp);
    } else if (b.result === 'fled') { await wait(200); }
    this.close();
    if (b.result === 'lose') return 'lose';
    if (this.prevMusic && !this.opts.keepMusic) music(this.prevMusic, { restart: true });
    return b.result;
  }
  results(r, sp) {
    const lines = [`<div class="rw"><span>經驗值</span><b>${r.xp.toLocaleString()}</b></div>`, `<div class="rw"><span>金錢</span><b>${r.gil.toLocaleString()} G</b></div>`, `<div class="rw"><span>迴響 EP</span><b>${r.ep}</b></div>`];
    const drops = sp.drops.map((d) => ITEMS[d]?.n).filter(Boolean); if (drops.length) lines.push(`<div class="rw"><span>獲得物品</span><b>${drops.join('、')}</b></div>`);
    for (const u of r.ups) lines.push(`<div class="up">⬆ ${CHARS[u.id].n} 升到 Lv ${u.to}！${u.learned.length ? `　學會了 ${u.learned.join('、')}` : ''}</div>`);
    for (const e of r.echoUps) lines.push(`<div class="up echo">✦ 迴響「${ECHOES[e.echo].n}」升到 Lv ${e.to}${e.to >= 10 ? '（精通！）' : ''}${e.arts.length ? `　習得 ${e.arts.join('、')}` : ''}</div>`);
    if (r.ups.length) sfx('levelup');
    return new Promise((res) => { const el = div('win results'); el.innerHTML = `<h3>勝利！</h3>${lines.join('')}<p class="more">▼</p>`; const w = { el, ok() { UI.pop(w); res(); }, back() { this.ok(); } }; el.addEventListener('click', () => w.ok()); UI.push(w); if (this.auto && !r.ups.length && !r.echoUps.length) setTimeout(() => { if (UI.stack.includes(w)) w.ok(); }, 1400); });
  }
  close() { this.running = false; this.el.hidden = true; this.el.innerHTML = ''; this.fx?.clear(); this.scene?.traverse((o) => o.geometry?.dispose?.()); }
  // ---------------------------------------------------------------- the HUD
  drawTimeline() {
    const el = this.el.querySelector('.tl'); if (!this.b) return; const list = this.b.preview(9);
    el.innerHTML = (this.current ? [this.current] : []).concat(list).slice(0, 9).map((u, i) => `<i class="${u.side}${i === 0 ? ' now' : ''}${u.stag ? ' stag' : ''}${u.charging ? ' chg' : ''}" title="${u.n}">${u.n.slice(0, u.side === 'h' ? 2 : 2)}</i>`).join('');
  }
  drawParty() {
    const el = this.el.querySelector('.party'); if (!this.b) return;
    el.innerHTML = this.b.heroes().map((u) => `<div class="pm${u === this.current ? ' now' : ''}${u.hp <= 0 ? ' ko' : ''}${u.hp > 0 && u.hp < u.maxhp / 4 ? ' low' : ''}" data-uid="${u.uid}"><b>${u.n}<span class="st">${Object.keys(u.st).map((k) => ST_ICON[k] || '').join('')}</span></b><div class="hp"><i style="width:${u.hp / u.maxhp * 100}%"></i></div><em>${u.hp}<small>/${u.maxhp}</small></em><div class="mp"><i style="width:${u.mp / Math.max(1, u.maxmp) * 100}%"></i></div><em class="m">${u.mp}</em></div>`).join('');
    el.querySelectorAll('.pm').forEach((d) => d.addEventListener('click', (e) => { e.stopPropagation(); const u = this.b.units.find((x) => x.uid === +d.dataset.uid); this.pickCb?.(u); }));
    this.drawRes();
  }
  drawRes() { const v = this.b.res, el = this.el.querySelector('.res'); el.querySelectorAll('.bar i').forEach((i, k) => { const f = Math.max(0, Math.min(1, (v - k * 100) / 100)); i.style.setProperty('--f', f); i.classList.toggle('full', f >= 1); }); }
  makeTag(u, v) { const t = div('tag'); t.addEventListener('click', (e) => { e.stopPropagation(); this.pickCb?.(u); }); this.el.querySelector('.tags').appendChild(t); this.tagEls.set(u.uid, t); this.drawTag(u); }
  drawTag(u) {
    const t = this.tagEls.get(u.uid); if (!t || u.side !== 'f') return;
    const all = [...new Set([...u.w])], icons = all.map((e) => u.known.has(e) || u.scanned ? `<i class="w">${EL_ICON[e] || e}</i>` : '<i class="q">?</i>').join('');
    t.innerHTML = `<b>${u.n}</b>${u.scanned || u.boss ? `<div class="hpb"><i style="width:${u.hp / u.maxhp * 100}%"></i></div>` : ''}<div class="brk${u.stag ? ' stag' : ''}"><i style="width:${u.stag ? 0 : u.brk / u.brkMax * 100}%"></i><span>${u.stag ? 'BREAK' : Math.ceil(u.brk)}</span></div><div class="wk">${icons || '<i class="q">－</i>'}</div>${Object.keys(u.st).length ? `<div class="sts">${Object.keys(u.st).map((k) => ST_ICON[k] || '').join('')}</div>` : ''}`;
    t.classList.toggle('chg', !!u.charging);
  }
  flashTag(u) { const t = this.tagEls.get(u.uid); if (!t) return; t.classList.remove('fl'); void t.offsetWidth; t.classList.add('fl'); }
  msg(text) { const m = this.el.querySelector('.msg'); m.classList.remove('hint'); m.innerHTML = text; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show'); clearTimeout(this.msgT); this.msgT = setTimeout(() => m.classList.remove('show'), 2200); }
  aname(text, cls) { const a = this.el.querySelector('.aname'); a.className = 'aname ' + (cls || ''); a.textContent = text; void a.offsetWidth; a.classList.add('show'); clearTimeout(this.anT); this.anT = setTimeout(() => a.classList.remove('show'), 1300); }
  bigName(text) { const a = div('ultname'); a.innerHTML = `<small>共鳴</small>${text}`; this.el.appendChild(a); setTimeout(() => a.remove(), 1800); }
  big(text, u) { const v = this.views.get(u.uid), p = this.project(this.mid(v)); const d = div('bigpop'); d.textContent = text; d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; this.el.querySelector('.pops').appendChild(d); setTimeout(() => d.remove(), 1200); }
  pop(u, text, cls, sub = '') {
    const v = this.views.get(u.uid); if (!v) return; const p = this.project(v3(v.pos.x, v.h * 0.85 + v.pos.y, v.pos.z));
    const d = div('pop ' + cls); d.innerHTML = (sub ? `<small>${sub}</small>` : '') + text; d.style.left = p.x + (Math.random() - 0.5) * 30 + 'px'; d.style.top = p.y + 'px'; this.el.querySelector('.pops').appendChild(d); setTimeout(() => d.remove(), 1300);
  }
  project(p) { const q = p.clone().project(this.cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight }; }
  mid(v) { return v3(v.pos.x, v.pos.y + v.h * 0.55, v.pos.z); }
  shake(t, a) { this.shakeT = t; this.shakeA = a; }
  tween(dur, fn) { return new Promise((res) => this.tweens.push({ t: 0, dur: dur / this.speed, fn, res })); }
  // ---------------------------------------------------------------- every frame
  update(dt) {
    if (!this.scene) return; this.camT += dt;
    if (this.running && this.el) { if (I.hit('pgup')) { this.auto = !this.auto; this.toolDraw(); if (this.auto) this.menuW?.close(); } if (I.hit('pgdn')) { this.speed = this.speed > 1 ? 1 : 2; this.toolDraw(); } }
    for (let i = this.tweens.length - 1; i >= 0; i--) { const tw = this.tweens[i]; tw.t += dt; const k = Math.min(1, tw.t / tw.dur); tw.fn(k); if (k >= 1) { this.tweens.splice(i, 1); tw.res(); } }
    const t = this.camT;
    for (const v of this.views.values()) {
      v.hurt = Math.max(0, (v.hurt || 0) - dt * 4); v.swing = Math.max(0, (v.swing || 0) - dt * 4); v.dodge = Math.max(0, (v.dodge || 0) - dt * 4);
      const u = v.u, alive = u.hp > 0;
      if (v.side === 'h') {
        const F = v.F, ko = v.ko || u.hp <= 0, step = v.ready ? -0.5 : 0, jx = v.hurt * 0.25 + v.dodge * 0.4;
        const sw = v.swing, run = v.running || v.backstep, w = run ? Math.sin(t * 18) : 0, idle = Math.sin(t * 2.4 + v.home.z);
        const yaw = v.running && v.pos.x > v.home.x + 1 ? Math.PI / 2 : v.yaw;
        if (ko) F.pose({ x: v.pos.x + 0.3, y: 0.15, z: v.pos.z, yaw, tilt: -1.45, armL: -2.8, armR: -2.8 });
        else if (v.win) F.pose({ x: v.pos.x, y: Math.abs(Math.sin(t * 5)) * 0.15, z: v.pos.z, yaw: yaw + 0.4, armR: -2.9, armL: -0.2, outL: 0.3 });
        else F.pose({ x: v.pos.x + step + jx, y: v.pos.y, z: v.pos.z, yaw, tilt: (u.hp < u.maxhp / 4 ? 0.25 : 0) + (v.cast ? -0.15 : 0), hipL: w * 0.8, hipR: -w * 0.8, armR: v.cast ? -2.6 : sw > 0 ? -2.6 + (1 - sw) * 3.2 : -0.6 + idle * 0.05 - w * 0.6, armL: v.cast ? -2.6 : -0.3 + w * 0.6, outL: v.cast ? 0.4 : 0.1, outR: v.cast ? 0.4 : 0 });
        F.face({ blink: (t + v.home.z * 3) % 3.5 < 0.12 ? 1 : 0, mouth: { smile: v.win ? 0.9 : u.hp < u.maxhp / 4 ? -0.4 : v.hurt > 0.3 ? -0.6 : 0.3, open: v.win ? 0.5 : v.cast ? 0.3 : v.hurt > 0.3 ? 0.4 : 0 }, brow: v.hurt > 0.3 ? -0.5 : 0, browIn: sw > 0 || v.ready ? 0.6 : 0, happy: v.win ? 1 : 0, eyes: v.hurt > 0.5 ? 0.6 : 1 });
        if (F.cape) F.cape.rotation.x = 0.15 + (run ? 0.5 : Math.sin(t * 1.6) * 0.05);
      } else {
        const B = v.B; if (!v.root.visible && !alive) continue;
        const hover = B.fly ? 0.25 + Math.sin(t * 2.6 + v.home.z) * 0.12 : 0, bob = Math.sin(t * 3 + v.home.z * 2);
        const lunge = v.swing * 0.6, jx = -v.hurt * 0.25 - v.dodge * 0.4;
        v.root.position.set(v.pos.x + lunge + jx, v.pos.y + hover, v.pos.z); v.root.rotation.y = v.yaw;
        if (v.born < 1) { v.born = Math.min(1, (v.born || 0) + dt * 3); v.root.scale.setScalar(B.s * v.born); }
        if (B.body && B.body !== B.g && !B.fig) { B.body.scale.y = 1 + bob * 0.03; B.body.rotation.z = v.stag ? 0.35 : 0; }
        if (B.wings) B.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (Math.sin(t * 12) * 0.5); });
        if (B.orb) B.orb.rotation.y += dt * 1.5; if (B.core) B.core.rotation.y += dt;
        if (B.head) B.head.rotation.x = v.swing * -0.4 + (v.stag ? 0.5 : 0);
        if (B.legs) B.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 3 + i) * 0.08; });
        if (B.heads) B.heads.forEach((h, i) => { h.rotation.x = Math.sin(t * 2 + i) * 0.15 - v.swing * 0.5; });
        if (B.arms) B.arms.forEach((a, i) => { a.rotation.z = Math.sin(t * 2 + i) * 0.2; });
        if (B.armR) B.armR.rotation.x = -v.swing * 2;
        if (B.fig) { const F = B.fig; F.pose({ armR: v.swing > 0 ? -2.6 + (1 - v.swing) * 3 : -0.5 + bob * 0.05, armL: -0.4, tilt: v.stag ? 0.4 : 0, hipL: 0, hipR: 0 }); F.face({ brow: -0.3, browIn: 0.8, mouth: { smile: -0.3 } }); }
        v.root.traverse?.((m) => { if (m.isMesh && m.material && !Array.isArray(m.material) && m.material.emissive && v.flashUntil !== undefined) { } });
        if (v.charging) { if (Math.random() < dt * 30) this.fx.burst(this.mid(v), ['#ff3a3a', '#ff8a2a'], { n: 1, speed: 1, g: 2, rise: 1, size: 0.07, life: 0.6 }); }
      }
      // the selection cursor
    }
    const sel = [...this.views.values()].filter((v) => v.sel && v.root.visible);
    this.cursor.visible = sel.length > 0; if (sel[0]) { const v = sel[0]; this.cursor.position.set(v.pos.x, v.pos.y + v.h + 0.35 + Math.sin(t * 6) * 0.08 + (v.B?.fly ? 0.3 : 0), v.pos.z); }
    // tags follow the foes
    for (const [uid, el] of this.tagEls) { const v = this.views.get(uid); if (!v || !v.root.visible) continue; const p = this.project(v3(v.pos.x, v.pos.y + v.h + (v.B?.fly ? 0.4 : 0.1), v.pos.z)); el.style.transform = `translate(${Math.max(70, Math.min(innerWidth - 70, p.x))}px, ${Math.max(150, p.y)}px) translate(-50%, -100%)`; }
    this.fx.update(dt);
    // the camera: a slow drift, a look toward whoever acts
    const foc = this.camFocus;
    const bigFoe = Math.max(0, ...this.b.foes().filter((f) => f.hp > 0).map((f) => this.views.get(f.uid)?.h || 0)), lift = Math.max(0, bigFoe - 2.2);
    const base = v3(5.4 + Math.sin(t * 0.25) * 0.4 + lift * 0.3, 4.4 + lift * 0.45, 11.2 + lift * 0.9), look = v3(-0.9 - lift * 0.15, 0.8 + lift * 0.35, 0.3);
    if (foc) { base.set(foc.pos.x + 3.2, 2.4, foc.pos.z + 5); look.set(foc.pos.x - 0.5, 1.1, foc.pos.z); }
    this.camPos = this.camPos ? this.camPos.lerp(base, Math.min(1, dt * 3)) : base.clone(); this.camLook = this.camLook ? this.camLook.lerp(look, Math.min(1, dt * 3)) : look.clone();
    this.cam.position.copy(this.camPos); if (this.shakeT > 0) { this.shakeT -= dt; this.cam.position.x += (Math.random() - 0.5) * this.shakeA; this.cam.position.y += (Math.random() - 0.5) * this.shakeA; }
    this.cam.lookAt(this.camLook);
  }
  render() { this.R.render(this.scene, this.cam); }
}
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
