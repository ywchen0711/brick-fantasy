// Brick Fantasy: Crystal Echoes. The loop, the title, going from place to place, fights on the field, talking,
// chests, save crystals, inns and shops, the vehicles, and the story's people and happenings put into each place.
import * as THREE from '../lib/three.module.min.js';
import { Field } from './engine/field.js';
import { BattleView } from './engine/battleview.js';
import { genTown, genField, genDungeon, genRoom, BASE, THEMES } from './engine/mapgen.js';
import { genWorld, regionAt } from './engine/worldgen.js';
import { I, setupTouch } from './engine/input.js';
import { UI, wait } from './engine/ui.js';
import { wake, sfx, music, setVolume } from './engine/audio.js';
import { G, newGame, load, active, healAll, heroStats, count, give, take, setFlag, flag, addMember } from './engine/state.js';
import { director } from './engine/script.js';
import { HUD } from './engine/hud.js';
import { openMenu, shopMenu, saveScreen } from './engine/menu.js';
import { MAPS, WORLD_ENC, BOUNTIES } from './data/maps.js';
import { ENEMIES } from './data/enemies.js';
import { ITEMS, shopStock } from './data/items.js';
import { CHARS } from './data/chars.js';
import { B } from './engine/voxel.js';
import { CONTENT, BOSSES, start as storyStart } from './story/index.js';

const canvas = document.getElementById('cv');
const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, I.touch ? 1.5 : 2)); R.setSize(innerWidth, innerHeight); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
const field = new Field(R), bv = new BattleView(R);
addEventListener('resize', () => { R.setSize(innerWidth, innerHeight); field.resize(); bv.resize(); });

export const game = {
  mode: 'title', field, bv, busy: false, emotes: [],
  // ---------------------------------------------------------------- going somewhere
  async goto(id, at, o = {}) {
    if (id === 'whitehawk' && flag('ch7') && !flag('ending')) id = 'whitehawk_r';
    const def = MAPS[id]; if (!def) { console.warn('no map', id); return; }
    this.busy = true; field.control = false;
    if (!o.noFade) await UI.fade(true, 350);
    const M = buildMap(def);
    field.build(M); field.clearParked();
    const e = M.entries[at] || M.entries.s || M.entries.up || M.entries.door || M.entries.center || Object.values(M.entries)[0] || { x: M.W >> 1, z: M.D >> 1, dir: 0 };
    let x = o.x ?? e.x, z = o.z ?? e.z; const dir = o.dir ?? e.dir;
    // the world: vehicles parked where they were left
    field.setVehicle(null);
    if (M.world) {
      for (const k of ['ship', 'airship']) { const v = G.s.vehicles[k]; if (v && !(o.vehicle === k)) field.park(k, v.x, v.z, v.dir || 0); }
      if (o.vehicle) { field.setVehicle(o.vehicle); }
    }
    field.camOff = field.baseCam(field.vehicle);
    this.mapContent(M, def);
    field.setParty(M.world || def.kind === 'room' && def.solo ? active().slice(0, 1) : active(), x, z, dir);
    HUD.show(M, def.name);
    if (field.vehicle) for (const p of field.party.slice(1)) p.root.visible = false;
    G.s.map = { id, x, z, dir, at };
    this.lastCell = `${x},${z}`; this.encLeft = this.nextEnc();
    const mus = typeof def.music === 'function' ? def.music() : def.music; if (mus && !o.keepMusic) music(field.vehicle === 'airship' ? 'airship' : mus);
    // always come back out of the dark, unless a scene asks to stay dark and fades in itself
    if (!o.stayDark && (!o.noFade || +getComputedStyle(document.getElementById('fade')).opacity > 0)) await UI.fade(false, o.noFade ? 600 : 350);
    if (def.name && !o.quiet && this.lastArea !== def.name) UI.area(def.name); this.lastArea = def.name;
    this.busy = false; field.control = true;
    if (!G.s.flags.camHint && !this.enters.length) { G.s.flags.camHint = true; UI.toast(I.touch ? '右半邊拖曳可以旋轉視角，雙指縮放' : I.padMode ? '右搖桿／LB・RB 旋轉視角，按下右搖桿回正' : 'Q／E 或滑鼠拖曳旋轉視角・滾輪縮放・雙擊回正', 5000); }
    // things that happen on arrival
    for (const en of this.enters) { if (en.when && !en.when()) continue; field.control = false; this.busy = true; try { await en.enter(D); } catch (err) { console.error(err); } this.busy = false; field.control = true; if (G.s.map.id !== id) return; }
  },
  // the people, chests and happenings of a place
  mapContent(M, def) {
    this.enters = []; this.triggers = []; this.bossHere = null;
    // chests
    for (const [spot, what, rare] of def.chests || []) { const s = M.spots[spot]; if (!s) continue; const key = def.id + ':' + spot, open = !!G.s.chests[key]; field.addProp({ type: 'chest', x: s.x, z: s.z, key, what, open, rare: rare || (typeof what === 'string' && ITEMS[what] && ['acc', 'weapon', 'armor'].includes(ITEMS[what].kind) && ITEMS[what].tier >= 3) }); }
    // towns: shopkeepers, the inn, a save crystal, the board
    if (def.kind === 'town') townFolk(M, def);
    if (def.kind === 'room' && def.kind2 === 'inn') field.addNpc({ id: 'innkeeper', look: 'woman', at: 'keeper', counter: true, talk: (D) => game.inn(MAPS.whitehawk.innPrice) });
    // the story's additions
    for (const en of CONTENT[def.id] || []) {
      if (en.trigger) { this.triggers.push(en); continue; }
      if (en.when && !en.when()) continue;
      if (en.npc) field.addNpc({ ...en.npc, mark: typeof en.npc.mark === 'function' ? en.npc.mark() : en.npc.mark });
      if (en.prop) { const s = M.spots[en.prop.at] || { x: en.prop.at[0], z: en.prop.at[1] }; field.addProp({ ...en.prop, x: s.x, z: s.z, broken: typeof en.prop.broken === 'function' ? en.prop.broken() : en.prop.broken }); }
      if (en.enter) this.enters.push(en);
    }
    // a boss standing in its room
    const bid = def.bossId || def.lair || def.abyssBoss;
    if (def.boss && bid) { const B = BOSSES[bid] || { foes: [bid] }; const fl = 'beat_' + def.id; if (!flag(fl) && (!B.when || B.when())) { const s = M.spots.boss; if (s) { this.bossHere = { ...B, flag: fl, def }; const e0 = ENEMIES[B.show || B.foes[0]]; field.addNpc({ id: 'boss', name: e0.n, at: 'boss', fig: () => bossFig(e0), dir: 0, ghost: false, talk: () => game.bossFight() }); M.block(s.x - 1, s.z, true); M.block(s.x + 1, s.z, true); } } else if (def.next && flag(fl)) { const s = M.spots.boss; if (s) { M.exit(s.x - 1, s.z, s.x + 1, s.z, def.next, 'up'); } } }
    // a save crystal before every boss, and in towns
    for (const p of M.props) if (p.type === 'save' && !p.obj) field.addProp(p);
  },
  async bossFight() {
    const b = this.bossHere; if (!b) return;
    if (b.pre) { await b.pre(D); }
    const r = await this.battle(b.foes, { boss: true, music: b.music || 'boss', canFlee: false });
    if (r !== 'win') return;
    this.bossHere = null; setFlag(b.flag); field.removeNpc('boss'); const s = field.M.spots.boss; if (s) { field.M.block(s.x - 1, s.z, false); field.M.block(s.x + 1, s.z, false); }
    if (b.post) await b.post(D);
    if (b.def.next) { const s2 = field.M.spots.boss; field.M.exit(s2.x - 1, s2.z, s2.x + 1, s2.z, b.def.next, 'up'); UI.toast('往下一層的路打開了'); }
  },
  refreshParty() { if (!field.leader) return; const L = field.leader; field.setParty(field.M.world ? active().slice(0, 1) : active(), Math.floor(L.x), Math.floor(L.z), L.dir); },
  // ---------------------------------------------------------------- fights
  async battle(foes, o = {}) {
    if (typeof foes === 'string') foes = parseGroup(foes);
    const snap = JSON.stringify({ party: G.s.party, inv: G.s.inv, gil: G.s.gil });
    for (;;) {
      this.mode = 'busy'; field.control = false; sfx('encounter'); I.rumble(200, 0.4, 0.6);
      await transition(true);
      const look = o.look || battleLook();
      this.mode = 'battle'; document.body.classList.add('inbattle'); transition(false);
      const r = await bv.start({ foes, boss: o.boss, canFlee: o.canFlee ?? !o.boss, look, music: o.music, preempt: o.preempt || 0, keepMusic: o.keepMusic });
      document.body.classList.remove('inbattle');
      if (r === 'lose') {
        if (o.canLose) { const s = JSON.parse(snap); G.s.party = s.party; healAll(); await UI.fade(true, 300); this.mode = 'field'; await UI.fade(false, 400); field.control = true; return 'lose'; }
        const c = await gameOver(!!o.boss);
        if (c === 'retry') { const s = JSON.parse(snap); G.s.party = s.party; G.s.inv = s.inv; G.s.gil = s.gil; continue; }
        if (c === 'load') { location.reload(); return 'lose'; }
        location.reload(); return 'lose';
      }
      await UI.fade(true, 300); this.mode = 'field'; await UI.fade(false, 400); field.control = true; this.encLeft = this.nextEnc();
      return r;
    }
  },
  nextEnc() { const k = [1.8, 1, 0.6][G.s.opts.enc ?? 1]; return (14 + Math.random() * 22) * k; },
  async encounter() {
    const def = field.M.def, M = field.M;
    let groups, lv;
    if (M.world) { const reg = flag('ch11') && !flag('ending') && Math.random() < 0.4 ? 'w_void' : field.vehicle === 'ship' ? 'w_sea' : regionAt(...field.cell()); const t = WORLD_ENC[reg] || WORLD_ENC.w_ardel; groups = t[0]; if (reg === 'w_ardel' && flag('ch2') && Math.random() < 0.3) groups = t[1]; }
    else groups = def.enc?.groups; if (!groups) return;
    // a bounty target turns up now and then where it lives
    const hunt = BOUNTIES.find((h) => h.where === def.id && G.s.bounties[h.id] === 'taken');
    let g = groups[Math.floor(Math.random() * groups.length)];
    if (hunt && Math.random() < 0.12) { g = hunt.id; UI.toast('懸賞目標出現了！'); }
    const pre = Math.random() < 0.08 ? 1 : Math.random() < 0.05 ? -1 : 0;
    await this.battle(parseGroup(g), { preempt: pre, boss: ENEMIES[g]?.hunt, canFlee: !ENEMIES[g]?.hunt });
  },
  // ---------------------------------------------------------------- each step
  async stepped(d) {
    if (this.busy) return; const M = field.M, [x, z] = field.cell(), key = `${x},${z}`;
    G.s.steps += d; G.s.map.x = x; G.s.map.z = z; G.s.map.dir = field.leader.dir;
    if (key === this.lastCell) return; this.lastCell = key;
    // ways out (not while flying)
    if (field.vehicle !== 'airship' && field.vehicle !== 'ship') for (const e of M.exits) if (x >= e.x0 && x <= e.x1 && z >= e.z0 && z <= e.z1) { if (e.cond && !e.cond()) continue; await this.leave(e); return; }
    // happenings
    for (const t of this.triggers) { const tr = t.trigger; if (tr.once && flag(tr.once)) continue; if (t.when && !t.when()) continue; let inside; if (typeof tr.at === 'string') { const s = M.spots[tr.at]; inside = s && Math.abs(s.x - x) <= (tr.r ?? 1) && Math.abs(s.z - z) <= (tr.r ?? 1); } else { const [x0, z0, x1, z1] = tr.at; inside = x >= x0 && x <= x1 && z >= z0 && z <= z1; } if (!inside) continue; if (tr.once) setFlag(tr.once); this.busy = true; field.control = false; try { await tr.run(D); } catch (e) { console.error(e); } this.busy = false; field.control = true; return; }
    // a boss standing in its room starts the fight when you come close
    if (this.bossHere && !this.bossBusy) { const s = M.spots.boss; if (s && Math.abs(s.x - x) <= 2 && Math.abs(s.z - z) <= 3) { this.busy = true; field.control = false; this.bossBusy = true; try { await this.bossFight(); } catch (e) { console.error(e); } this.bossBusy = false; this.busy = false; field.control = true; return; } }
    // fights
    const road = M.flags[M.i(x, z)] & 4;
    const encHere = M.world ? !field.vehicle || field.vehicle === 'ship' : !!M.def.enc;
    if (encHere && !road && !field.vehicle?.startsWith?.('dash')) { this.encLeft -= 1; if (this.encLeft <= 0) { this.encLeft = this.nextEnc(); await this.encounter(); } }
  },
  async leave(e) {
    if (e.to === 'world') { const loc = e.at; return this.goto('world', loc); }
    return this.goto(e.to, e.at);
  },
  // ---------------------------------------------------------------- pressing the button
  async interact() {
    if (field.vehicle === 'ship' || field.vehicle === 'airship') return this.disembark();
    const f = field.facing();
    if (!f) { if (field.M.world) return this.embark(); return; }
    this.busy = true; field.control = false;
    try {
      if (f.npc) {
        const n = f.npc, def = n.npc; n.busy = true; const prevDir = n.dir;
        if (!def.fixed) field.face(n, field.leader);
        if (def.talk) await def.talk(D, n); else if (def.lines) { const i = (n.li = ((n.li ?? -1) + 1) % def.lines.length); const l = def.lines[i]; for (const s of [].concat(l)) await D.say(n.id, s, { name: def.name }); }
        n.busy = false; if (def.fixed) n.dir = prevDir;
      } else if (f.prop) await this.useProp(f.prop);
    } catch (e) { console.error(e); }
    this.busy = false; field.control = true;
  },
  async useProp(p) {
    if (p.type === 'chest') {
      if (p.open) { await UI.say('', '是空的。', { sys: true }); return; }
      p.open = true; G.s.chests[p.key] = 1; const lid = p.obj.userData.lid; const t0 = performance.now(); const anim = () => { const k = Math.min(1, (performance.now() - t0) / 300); lid.rotation.x = -1.9 * k; if (k < 1) requestAnimationFrame(anim); }; anim(); sfx('chest');
      if (typeof p.what === 'string' && p.what.startsWith('gil:')) { const n = +p.what.slice(4); G.s.gil += n; await UI.say('', `寶箱裡有 {g}${n.toLocaleString()} G{/g}！`, { sys: true }); }
      else { give(p.what); await UI.say('', `寶箱裡有 {g}${ITEMS[p.what].icon || ''} ${ITEMS[p.what].n}{/g}！`, { sys: true }); }
      return;
    }
    if (p.type === 'save') { sfx('save'); this.restAll(); UI.flash('#c8f8ff', 500); const c = await UI.choose(['存檔', '不用了'], { title: '水晶發出溫暖的光，大家都恢復了精神。' }); if (c === 0) await this.saveMenu(true); return; }
    if (p.type === 'sign') { await UI.say('', p.text || '……', { sys: true }); return; }
    if (p.type === 'altar' && p.talk) { await p.talk(D); }
    if (p.type === 'pickup') { field.removeProp(p); if (p.flag) setFlag(p.flag); if (p.text) await UI.say('', p.text, { sys: true }); if (p.item) await D.give(p.item); if (p.gil) await D.gil(p.gil); if (p.run) await p.run(D); }
  },
  restAll() { healAll(); },
  atSave() { const L = field.leader; return field.props.some((p) => p.type === 'save' && Math.hypot(p.x + 0.5 - L.x, p.z + 0.5 - L.z) < 2.5); },
  canSave() { return field.M?.world || this.atSave(); },
  async saveMenu() { return saveScreen({ where: field.M.def.name }); },
  async inn(price) {
    const c = await UI.choose([`住一晚（${price} G）`, '不用了'], { title: `歡迎光臨！一晚 ${price} G。` });
    if (c !== 0) return; if (G.s.gil < price) { await UI.say('', '錢不夠……', { sys: true }); return; }
    G.s.gil -= price; await UI.fade(true, 600); healAll(); sfx('save'); await wait(900); await UI.fade(false, 600); await UI.say('', '大家睡得很飽，HP 和 MP 都完全回復了！', { sys: true });
  },
  shop(stock, name) { return shopMenu(stock, name); },
  // ---------------------------------------------------------------- vehicles on the world map
  async embark() {
    const L = field.leader;
    for (const p of field.parked) if (Math.hypot(p.x + 0.5 - L.x, p.z + 0.5 - L.z) < 2.2) {
      field.scene.remove(p.o); field.parked = field.parked.filter((q) => q !== p); L.x = p.x + 0.5; L.z = p.z + 0.5; field.setVehicle(p.kind); for (const q of field.party.slice(1)) q.root.visible = false;
      sfx('ok'); if (p.kind === 'airship') { music('airship'); UI.toast('起飛！按確定鍵降落'); } else UI.toast('出航！按確定鍵靠岸'); return;
    }
  },
  async disembark() {
    const M = field.M, L = field.leader, [x, z] = field.cell();
    if (field.vehicle === 'airship') {
      if (!M.walkable(x, z) || M.flags[M.i(x, z)] & 32) { UI.toast('這裡不能降落'); sfx('buzz'); return; }
      G.s.vehicles.airship = { x, z, dir: L.dir }; field.setVehicle(null); field.park('airship', x, z, L.dir); L.x = x + 0.5; L.z = z + 1.5; if (!M.walkable(x, z + 1)) L.z = z + 0.5; field.camOff = field.baseCam(null); music(MAPS.world.music); sfx('ok'); this.lastCell = ''; return;
    }
    if (field.vehicle === 'ship') {
      const fx = Math.round(Math.sin(L.dir)), fz = Math.round(Math.cos(L.dir)); const cand = [[fx, fz], [1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dz] of cand) { const tx = x + dx, tz = z + dz; if (M.walkable(tx, tz) && !(M.flags[M.i(tx, tz)] & 32)) { G.s.vehicles.ship = { x, z, dir: L.dir }; field.setVehicle(null); field.park('ship', x, z, L.dir); L.x = tx + 0.5; L.z = tz + 0.5; for (const q of field.party.slice(1)) q.root.visible = false; sfx('ok'); this.lastCell = ''; return; } }
      UI.toast('這裡不能靠岸'); sfx('buzz');
    }
  },
  ride() {
    if (!field.M?.world || !flag('dashbird') || this.busy) return;
    if (field.vehicle === 'dashbird') { field.setVehicle(null); sfx('ok'); return; }
    if (!field.vehicle) { field.setVehicle('dashbird'); sfx('ok'); UI.toast('奔奔鳥來了！（再按一次下來）'); }
  },
  // put a vehicle on the world map at the nearest good cell to (x, z): water for the ship, open land for the airship
  placeVehicle(kind, x, z) {
    const M = genWorld({ id: 'world' }, G.s.flags), ok = (cx, cz) => kind === 'ship' ? (M.flags[M.i(cx, cz)] & 2) && !(M.flags[M.i(cx, cz)] & 1) : M.walkable(cx, cz) && M.h(cx, cz) <= BASE + 1;
    for (let r = 0; r < 40; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const cx = x + dx, cz = z + dz; if (M.in(cx, cz) && ok(cx, cz)) { G.s.vehicles[kind] = { x: cx, z: cz, dir: 0 }; return; } }
    G.s.vehicles[kind] = { x, z, dir: 0 };
  },
  emote(a, mark) { const el = document.createElement('div'); el.className = 'emote'; el.textContent = mark; document.getElementById('ui2').appendChild(el); this.emotes.push({ a, el, t: 0 }); },
};
const D = director(game);
game.D = D;

// ---------------------------------------------------------------- building a place
function buildMap(def) {
  if (def.kind === 'world') return genWorld(def, G.s.flags);
  const d = { ...def };
  if (def.kind === 'town') return genTown(d);
  if (def.kind === 'field') { d.chests = def.chestsN ?? def.chests?.length ?? 3; return genField(d); }
  if (def.kind === 'dungeon') { d.chests = def.chests?.length ?? 2; return genDungeon(d); }
  return genRoom(d);
}
function townFolk(M, def) {
  const st = def.stock || {}, sh = def.shops || {};
  const keeper = (id, spot, look, talk, name) => { if (M.spots[spot]) field.addNpc({ id, look, at: spot, dir: 0, counter: true, fixed: true, name, talk }); };
  if (sh.item) keeper('shop_item', 'shop_item', 'merchant', (D) => game.shop(st.item || ['potion'], '道具店'), '道具店老闆');
  if (sh.weapon) keeper('shop_weapon', 'shop_weapon', 'miner', (D) => game.shop(shopStock(st.weapon || [0]).filter((i) => ITEMS[i].kind === 'weapon'), '武器店'), '武器店老闆');
  if (sh.armor) keeper('shop_armor', 'shop_armor', 'woman', (D) => game.shop(shopStock(st.armor || [0]).filter((i) => ITEMS[i].kind === 'armor'), '防具店'), '防具店老闆');
  if (sh.magic) keeper('shop_magic', 'shop_magic', 'priest', (D) => game.shop(st.magic || [], '飾品店'), '飾品店老闆');
  if (sh.inn && M.spots.innKeeper && !def.doors?.inn) field.addNpc({ id: 'innkeeper', look: 'woman', at: 'innKeeper', name: '旅館老闆娘', talk: () => game.inn(def.innPrice || 30) });
  if (sh.board && M.spots.boardKeeper) field.addNpc({ id: 'board', look: 'guard', at: 'boardKeeper', name: '懸賞公會', talk: (D) => bountyBoard(D) });
  const sv = M.spots.churchKeeper || M.spots.plazaE; if (sv) { const x = sv.x + (M.spots.churchKeeper ? 1 : 0), z = sv.z; if (M.walkable(x, z)) field.addProp({ type: 'save', x, z }); }
}
async function bountyBoard(D) {
  if (!count('bountycard')) { await D.say('board', '這裡是懸賞公會。打倒告示上的魔物就能領獎金。先拿一張獵人卡吧！', { name: '懸賞公會' }); await D.give('bountycard'); }
  for (;;) {
    const list = BOUNTIES.filter((b) => G.s.ch >= b.ch);
    const r = await UI.list(list.map((b) => { const st = G.s.bounties[b.id]; return { label: ENEMIES[b.id].n.replace('懸賞：', ''), right: st === 'claimed' ? '已領獎' : st === 'killed' ? '可領獎！' : st === 'taken' ? '狩獵中' : `${b.reward.toLocaleString()} G`, b, help: `${b.d}<br>出沒：${MAPS[b.where]?.name || ''}` }; }), { title: '懸賞告示', cls: 'menu2 wide' });
    if (r.index < 0) return; const b = r.item.b, st = G.s.bounties[b.id];
    if (st === 'killed') { G.s.bounties[b.id] = 'claimed'; await D.gil(b.reward); continue; }
    if (!st) { G.s.bounties[b.id] = 'taken'; await D.say('board', `接下「${ENEMIES[b.id].n.replace('懸賞：', '')}」的懸賞了。牠在${MAPS[b.where]?.name}一帶出沒，祝你好運！`, { name: '懸賞公會' }); }
  }
}
function bossFig(e) { const { buildBeast } = game._beasts; const o = buildBeast(e); const g = o.g; return { root: g, pose(p) { g.position.set(p.x || 0, p.y || 0, p.z || 0); g.rotation.y = p.yaw || 0; }, face() { }, kid: false, body: g, hands: [] }; }
export function parseGroup(s) { const out = []; for (const part of String(s).split('+')) { const [id, n] = part.split('*'); for (let i = 0; i < (+n || 1); i++) out.push(id.trim()); } return out; }
function battleLook() {
  const M = field.M, th = M.th, def = M.def;
  if (M.world) { const b = M.BI[M.biome[M.i(...field.cell())]]; const L = { grass: [B.GRASS, B.LEAF2, 'oak'], swamp: [B.MOSS, B.MUD, 'dead'], badlands: [B.CLIFF, B.CLAY, 'rock'], snow: [B.SNOW, B.WHITE, 'pine'], desert: [B.SAND, B.SANDSTONE, 'cactus'], sakura: [B.GRASS, B.BLOSSOM, 'sakura'], darkwood: [B.DGRASS, B.MUD, 'pine'], beach: [B.SAND, B.SAND, 'palm'], sea: [B.PLANK, B.WOOD, null], void: [B.OBSIDIAN, B.VOID, 'crystal'], volcano: [B.OBSIDIAN, B.CLIFF, 'rock'], mountain: [B.STONE, B.GREY, 'rock'] }[b] || [B.GRASS, B.LEAF2, 'oak']; return { g: L[0], g2: L[1], tree: L[2], sky: THEMES.plains.sky, fog: THEMES.plains.fog, amb: 0.62, seed: G.s.steps | 0 }; }
  if (def.kind === 'dungeon' || def.kind === 'room') return { g: th.floor, g2: th.floor2, tree: 'pillar', wall: th.wall, sky: th.sky, fog: th.fog, amb: th.amb, dark: true, light: th.light, seed: def.id.length };
  return { g: th.g, g2: th.g2, tree: th.tree === 'palm' ? 'oak' : th.tree, sky: th.sky, fog: th.fog, amb: th.amb, seed: def.id.length };
}
async function transition(into) {
  const f = document.getElementById('swirl'); if (into) { f.classList.remove('out'); f.classList.add('in'); await wait(650); } else { f.classList.remove('in'); f.classList.add('out'); await wait(450); f.classList.remove('out'); }
}
async function gameOver(boss) {
  music('sad', { restart: true });
  const c = await UI.list([{ label: '再試一次這場戰鬥', k: 'retry' }, { label: '讀取存檔', k: 'load' }, { label: '回到標題', k: 'title' }], { title: '全滅了……', cls: 'gameover', cancel: false });
  return c.item.k;
}

// ---------------------------------------------------------------- the loop
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  I.poll();
  UI.tick(dt, now / 1000);
  if (game.mode === 'field' || game.mode === 'busy') {
    if (game.mode === 'field' && !UI.busy() && !game.busy && field.control) {
      if (I.hit('ok')) game.interact(); else if (I.hit('menu')) { game.busy = true; field.control = false; openMenu(game).then(() => { game.busy = false; field.control = true; }); } else if (I.hit('ride')) game.ride();
    }
    if (game.mode === 'field' && G.s) G.s.time += dt;
    field.runTasks(dt); field.update(dt); field.render();
    HUD.visible(!document.body.classList.contains('inmenu')); HUD.update(dt, field); if (I.hit('map') && !UI.busy()) HUD.cycle();
    for (let i = game.emotes.length - 1; i >= 0; i--) { const e = game.emotes[i]; e.t += dt; const p = new THREE.Vector3(e.a.x * 0.6, (e.a.y + 3.4) * 0.6, e.a.z * 0.6).project(field.cam); e.el.style.left = (p.x + 1) / 2 * innerWidth + 'px'; e.el.style.top = (1 - p.y) / 2 * innerHeight + 'px'; if (e.t > 1) { e.el.remove(); game.emotes.splice(i, 1); } }
  } else if (game.mode === 'battle') { HUD.visible(false); bv.update(dt); bv.render(); }
  else if (game.mode === 'title') { game.titleTick?.(); field.update(dt); titleCam(dt); field.render(); }
  I.end();
}
field.onStep = (d) => game.stepped(d);
let titleT = 0;
function titleCam(dt) { titleT += dt; if (!field.M) return; field.camFocus = { x: field.M.W / 2 + Math.sin(titleT * 0.1) * 14, z: field.M.D / 2 + Math.cos(titleT * 0.08) * 8 }; field.camZoom = 1.3; }

// ---------------------------------------------------------------- the title
async function title() {
  const { buildBeast } = await import('./engine/beasts.js'); game._beasts = { buildBeast };
  newGame();
  const M = genTown({ ...MAPS.whitehawk }); field.build(M); field.setParty(['lorne', 'vera', 'lin'], M.W >> 1, (M.D >> 1) + 4, Math.PI); field.control = false;
  document.getElementById('loading').classList.add('gone');
  const el = document.getElementById('title'); el.hidden = false;
  const hasSave = [1, 2, 3].some((k) => localStorage.getItem('brickfantasy.slot' + k));
  el.querySelector('.cont').disabled = !hasSave;
  const go = (k) => new Promise((res) => { el.querySelector('.new').onclick = () => res('new'); el.querySelector('.cont').onclick = () => res('cont'); el.onkeydown = null; });
  let pick = hasSave ? 1 : 0; const btns = [el.querySelector('.new'), el.querySelector('.cont')]; const mark = () => btns.forEach((b, i) => b.classList.toggle('on', i === pick)); mark();
  game.titleTick = () => { if (el.hidden) return; const n = I.nav(performance.now() / 1000); if ((n === 'up' || n === 'down') && hasSave) { pick = 1 - pick; mark(); sfx('tick'); } if (I.hit('ok')) btns[pick].click(); };
  addEventListener('pointerdown', () => { wake(); music('title'); }, { once: true }); addEventListener('keydown', () => { wake(); music('title'); }, { once: true });
  for (;;) {
    const c = await go(); wake();
    if (c === 'new') { el.hidden = true; newGame(); applyOpts(); field.camFocus = null; field.camZoom = 1; game.mode = 'field'; await storyStart(D); return; }
    el.hidden = true; const slot = await saveScreen({ load: true });
    if (!slot) { el.hidden = false; continue; }
    load(slot); applyOpts(); field.camFocus = null; field.camZoom = 1; game.mode = 'field';
    const m = G.s.map; await game.goto(m.id, m.at, { x: m.x, z: m.z, dir: m.dir, vehicle: G.s.vehicle }); return;
  }
}
function applyOpts() { const o = G.s.opts; setVolume('bgm', o.bgm); setVolume('sfx', o.sfx); UI.speed = [1, 2, 4, 99][o.msg ?? 1]; document.body.classList.toggle('nodof', !o.dof); }
setupTouch();
I.onPad = (g, on) => { UI.toast(on ? '🎮 已連接手把：A 確定・B 取消・Y 選單・X 跑步・Select 奔奔鳥' : '🎮 手把已中斷連接'); if (on) I.usingPad(true); };
I.onMode = (pad) => { const h = document.querySelector('#title .hint'); if (h) h.textContent = pad ? '🎮 左搖桿／十字鍵 移動・A 確定・B 取消・Y 選單・X 跑步・Select 奔奔鳥' : '方向鍵／WASD 移動・Z／Enter 確定・X／Esc 取消・C 選單・手機可直接觸控'; };
requestAnimationFrame(frame);
title().catch((e) => { console.error(e); document.getElementById('loading').innerHTML = '<p style="color:#fff">載入失敗：' + e.message + '</p>'; });
window.GAME = { game, G, field, bv, D, MAPS };
