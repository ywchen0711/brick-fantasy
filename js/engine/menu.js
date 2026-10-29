// The field menu (items, arts, gear, echoes, party order, status, journal, bestiary, settings, save) and the shop,
// the inn and the save screen.
import { UI, div } from './ui.js';
import { sfx, setVolume } from './audio.js';
import { G, active, heroStats, heroSkills, artSlots, masteredArts, equipEcho, canEquip, equip, count, give, take, save, peek, clampHP } from './state.js';
import { CHARS, xpFor } from '../data/chars.js';
import { ECHOES, ECHO_EP, echoLevel } from '../data/echoes.js';
import { ITEMS } from '../data/items.js';
import { skill, EL, ST_NAME } from '../data/skills.js';
import { ENEMIES, stat } from '../data/enemies.js';
import { QUESTS, STORY, PEOPLE, objective } from '../story/journal.js';

const STATN = { hp: 'HP', mp: 'MP', atk: '攻擊', def: '防禦', mag: '魔力', spr: '精神', spd: '速度', luk: '幸運' };
const EL_ICON = { fire: '🔥', ice: '❄️', thunder: '⚡', water: '💧', wind: '🌪️', earth: '🪨', light: '✨', dark: '🌑', slash: '🗡️', pierce: '🔱', strike: '🔨', shot: '🏹', none: '◎' };
const panel = () => document.getElementById('side');
function side(html) { const p = panel(); p.innerHTML = html; p.hidden = !html; }
const hpBar = (a, b, cls = 'hp') => `<span class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, a / b * 100))}%"></i></span>`;
function partyCard(id) {
  const p = G.s.party[id], st = heroStats(id), c = CHARS[id], e = p.echo && ECHOES[p.echo];
  return `<div class="pc"><b>${c.n}</b><small>Lv ${p.lv}　${c.title}</small><div>HP ${p.hp}/${st.hp} ${hpBar(p.hp, st.hp)}</div><div>MP ${p.mp}/${st.mp} ${hpBar(p.mp, st.mp, 'mp')}</div><small class="ec">${e ? `迴響：${e.n}（${e.title}）Lv ${echoLevel(G.s.echoes[p.echo].ep)}` : '迴響：—'}</small></div>`;
}
const fmtTime = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`;
async function pickMember(title, o = {}) {
  const ids = o.all ? G.s.members : active();
  const r = await UI.list(ids.map((id) => ({ label: CHARS[id].n, right: `Lv ${G.s.party[id].lv}`, sub: o.sub?.(id), id, disabled: o.can && !o.can(id) })), { title, cls: 'menu2', start: o.start || 0, onMove: (k, it) => it && side(partyCard(it.id)) });
  return r.index < 0 ? null : r.item.id;
}
export async function openMenu(game) {
  sfx('ok'); document.body.classList.add('inmenu'); let start = 0;
  for (;;) {
    const s = G.s, where = game.field.M?.def.name || '';
    side(`<div class="sum">${active().map(partyCard).join('')}<div class="gil">💰 ${s.gil.toLocaleString()} G　⏱ ${fmtTime(s.time)}　📍 ${where}</div><div class="obj">📜 ${objective()}</div></div>`);
    const canSave = game.canSave();
    const r = await UI.list([
      { label: '物品', k: 'items' }, { label: '技能', k: 'skills' }, { label: '裝備', k: 'equip' }, { label: '迴響', k: 'echo' }, { label: '隊伍', k: 'party' }, { label: '狀態', k: 'status' }, { label: '冒險日誌', k: 'journal' }, { label: '魔物圖鑑', k: 'beasts' }, { label: '設定', k: 'opts' }, { label: '存檔', k: 'save', disabled: !canSave, help: canSave ? '' : '只能在存檔水晶旁或世界地圖上存檔' },
    ], { cls: 'menu1', title: '選單', start, onMenu: () => { } });
    if (r.index < 0) break; start = r.index;
    const k = r.item.k;
    try {
      if (k === 'items') await itemsMenu(game); if (k === 'skills') await skillsMenu(); if (k === 'equip') await equipMenu(); if (k === 'echo') await echoMenu(); if (k === 'party') await partyMenu(game);
      if (k === 'status') await statusMenu(); if (k === 'journal') await journalMenu(); if (k === 'beasts') await beastMenu(); if (k === 'opts') await optsMenu(); if (k === 'save') await game.saveMenu();
    } catch (e) { console.error(e); }
  }
  side(''); document.body.classList.remove('inmenu');
}
// ---------------------------------------------------------------- items
async function itemsMenu(game) {
  let start = 0;
  for (;;) {
    const ids = Object.keys(G.s.inv).filter((id) => ITEMS[id]).sort((a, b) => ['use', 'weapon', 'armor', 'acc', 'loot', 'key'].indexOf(ITEMS[a].kind) - ['use', 'weapon', 'armor', 'acc', 'loot', 'key'].indexOf(ITEMS[b].kind));
    if (!ids.length) { UI.toast('背包是空的'); return; }
    const r = await UI.list(ids.map((id) => ({ label: ITEMS[id].n, icon: ITEMS[id].icon, right: ITEMS[id].kind === 'key' ? '' : '×' + G.s.inv[id], id, help: ITEMS[id].d, cls: ITEMS[id].kind === 'key' ? 'key' : '' })), { title: '物品', cols: 2, cls: 'menu2 wide', start });
    if (r.index < 0) return; start = r.index;
    const it = ITEMS[r.item.id]; if (!it.field) { if (it.kind !== 'key') UI.toast('這裡不能用'); continue; }
    if (it.tent) { if (!game.atSave()) { UI.toast('要在存檔水晶旁使用'); continue; } take(it.id); game.restAll(); UI.toast('大家都恢復精神了！'); continue; }
    if (it.echoEP) { const id = await pickMember(`把${it.n}給誰？`, { sub: (m) => G.s.party[m].echo ? ECHOES[G.s.party[m].echo].n : '沒有迴響', can: (m) => !!G.s.party[m].echo }); if (!id) continue; take(it.id); G.s.echoes[G.s.party[id].echo].ep += it.echoEP; sfx('echo'); UI.toast(`${ECHOES[G.s.party[id].echo].n} 獲得了 ${it.echoEP} EP`); continue; }
    if (it.seed) { const id = await pickMember(`給誰吃${it.n}？`, { all: true }); if (!id) continue; take(it.id); const p = G.s.party[id]; p.seeds[it.seed] = (p.seeds[it.seed] || 0) + (it.seed === 'hp' ? 30 : it.seed === 'spd' ? 1 : 2); sfx('levelup'); UI.toast(`${CHARS[id].n}的${STATN[it.seed]}永久提升了！`); continue; }
    const s = skill(it.use); await useOnParty(s, () => take(it.id), it.n);
  }
}
async function useOnParty(s, pay, name, user) {
  const all = s.t === 'A';
  const id = all ? 'all' : await pickMember(`對誰使用${name}？`, { sub: (m) => { const p = G.s.party[m], st = heroStats(m); return `HP ${p.hp}/${st.hp}　MP ${p.mp}/${st.mp}`; } });
  if (!id) return false;
  const targets = all ? active() : [id]; let did = false;
  for (const m of targets) {
    const p = G.s.party[m], st = heroStats(m);
    if (s.k === 'revive') { if (p.hp <= 0 || p.ko) { p.hp = Math.max(1, Math.round(st.hp * s.p / 100)); p.ko = false; did = true; } }
    else if (s.k === 'heal') { if (p.hp <= 0) continue; const mag = user ? heroStats(user).mag : 0; const h = s.x.flat || Math.round((mag * 1.6 + 12) * s.p / 100); if (s.x.mpFlat || s.x.mp) { p.mp = Math.min(st.mp, p.mp + (s.x.mpFlat || s.x.mp)); did = true; } if (h && p.hp < st.hp) { p.hp = Math.min(st.hp, p.hp + h); did = true; } }
    else if (s.k === 'cure') did = true;
  }
  if (!did) { UI.toast('沒有效果'); return false; }
  pay(); sfx('heal'); UI.toast('回復了！'); return true;
}
// ---------------------------------------------------------------- arts (healing outside fights)
async function skillsMenu() {
  const id = await pickMember('誰的技能？'); if (!id) return;
  for (;;) {
    const sk = heroSkills(id), list = [...sk.innate, ...sk.echo, ...sk.slots], p = G.s.party[id], st = heroStats(id);
    const r = await UI.list(list.map((k) => { const s = skill(k), field = ['heal', 'revive', 'cure'].includes(s.k) && s.t !== 's'; return { label: s.n, k, icon: EL_ICON[s.el] || (s.k === 'heal' ? '💚' : ''), right: s.mp ? s.mp : '', help: s.d, cls: field ? '' : 'dim', disabled: !field || p.mp < s.mp }; }), { title: `${CHARS[id].n}　MP ${p.mp}/${st.mp}`, cols: 2, cls: 'menu2 wide' });
    if (r.index < 0) return;
    const s = skill(r.item.k); await useOnParty(s, () => { p.mp -= s.mp; }, s.n, id);
  }
}
// ---------------------------------------------------------------- gear
function gearLine(id) { const p = G.s.party[id]; return ['weapon', 'armor', 'acc1', 'acc2'].map((k) => ITEMS[p.eq[k]]?.n || '—'); }
function diff(id, slot, itemId) {
  const p = G.s.party[id], before = heroStats(id), old = p.eq[slot]; p.eq[slot] = itemId; const after = heroStats(id); p.eq[slot] = old;
  return ['atk', 'def', 'mag', 'spr', 'spd'].map((k) => { const d = after[k] - before[k]; return d ? `<span class="${d > 0 ? 'up' : 'dn'}">${STATN[k]} ${d > 0 ? '+' : ''}${d}</span>` : ''; }).join(' ');
}
async function equipMenu() {
  let id = await pickMember('誰要換裝備？'); if (!id) return; let start = 0;
  for (;;) {
    const p = G.s.party[id], st = heroStats(id), g = gearLine(id);
    side(`${partyCard(id)}<div class="stats">${['atk', 'def', 'mag', 'spr', 'spd', 'luk'].map((k) => `<div>${STATN[k]}<b>${st[k]}</b></div>`).join('')}</div>`);
    const r = await UI.list([{ label: '武器', right: g[0], slot: 'weapon' }, { label: '防具', right: g[1], slot: 'armor' }, { label: '飾品 1', right: g[2], slot: 'acc1' }, { label: '飾品 2', right: g[3], slot: 'acc2' }, { label: '最強裝備', slot: 'best', help: '自動換上背包裡最強的武器和防具' }, { label: '全部卸下', slot: 'none' }, { label: '下一位 ▶', slot: 'next' }], { title: `${CHARS[id].n}的裝備`, cls: 'menu2', start });
    if (r.index < 0) return; start = r.index;
    const slot = r.item.slot;
    if (slot === 'next') { const m = active(); id = m[(m.indexOf(id) + 1) % m.length]; continue; }
    if (slot === 'none') { for (const k of ['weapon', 'armor', 'acc1', 'acc2']) if (p.eq[k] && k !== 'weapon') equip(id, k, null); continue; }
    if (slot === 'best') { for (const k of ['weapon', 'armor']) { const opts = Object.keys(G.s.inv).filter((i) => ITEMS[i]?.kind === (k === 'weapon' ? 'weapon' : 'armor') && canEquip(id, ITEMS[i])); const cur = ITEMS[p.eq[k]]; const best = opts.sort((a, b) => (ITEMS[b].atk || 0) + (ITEMS[b].def || 0) + (ITEMS[b].mag || 0) - ((ITEMS[a].atk || 0) + (ITEMS[a].def || 0) + (ITEMS[a].mag || 0)))[0]; if (best && (!cur || (ITEMS[best].atk || 0) + (ITEMS[best].def || 0) + (ITEMS[best].mag || 0) > (cur.atk || 0) + (cur.def || 0) + (cur.mag || 0))) equip(id, k, best); } sfx('ok'); continue; }
    const kind = slot === 'weapon' ? 'weapon' : slot === 'armor' ? 'armor' : 'acc';
    const opts = Object.keys(G.s.inv).filter((i) => ITEMS[i]?.kind === kind && canEquip(id, ITEMS[i]));
    const items = [{ label: '（卸下）', itemId: null, disabled: slot === 'weapon' }].concat(opts.map((i) => ({ label: ITEMS[i].n, icon: ITEMS[i].icon, right: '×' + G.s.inv[i], itemId: i, help: `${ITEMS[i].d}<br>${diff(id, slot, i)}` })));
    const r2 = await UI.list(items, { title: `${CHARS[id].n}：${r.item.label}`, cls: 'menu2 wide', start: 1 });
    if (r2.index < 0) continue; equip(id, slot, r2.item.itemId); sfx('ok');
  }
}
// ---------------------------------------------------------------- echoes
function echoCard(eid) {
  const e = ECHOES[eid], ep = G.s.echoes[eid].ep, L = echoLevel(ep), holder = Object.keys(G.s.party).find((m) => G.s.party[m].echo === eid);
  const next = L < 10 ? ECHO_EP[L + 1] : null;
  return `<div class="ecard" style="--c:${e.color}"><b>${e.n}</b><small>${e.title}　Lv ${L}${L >= 10 ? '（精通）' : ''}</small>${next ? `<div>EP ${ep}/${next} ${hpBar(ep - ECHO_EP[L], next - ECHO_EP[L], 'ep')}</div>` : ''}
    <p class="lore">${e.lore}</p><div>能力：${Object.entries(e.bonus).map(([k, v]) => `${STATN[k]}${v > 0 ? '+' : ''}${v}%`).join('　')}</div>
    <div class="arts">${e.arts.map(([lv, sk]) => `<span class="${L >= lv ? 'got' : ''}">Lv${lv} ${skill(sk).n}</span>`).join('')}</div>
    <div>被動（Lv${e.passive[0]}）：${e.passive[2]}</div><div>共鳴技：<b>${skill(e.ult).n}</b>　${skill(e.ult).d}</div><div>合體：與「${ECHOES[e.pair[0]].n}」→ ${skill(e.pair[1]).n}</div>${holder ? `<div class="hold">裝備中：${CHARS[holder].n}</div>` : ''}</div>`;
}
async function echoMenu() {
  const owned = Object.keys(G.s.echoes); if (!owned.length) { UI.toast('還沒有任何迴響'); return; }
  let id = await pickMember('誰要裝備迴響？', { sub: (m) => G.s.party[m].echo ? ECHOES[G.s.party[m].echo].n : '—' }); if (!id) return;
  for (;;) {
    const p = G.s.party[id];
    const r = await UI.list([{ label: '換迴響', k: 'set', right: p.echo ? ECHOES[p.echo].n : '—' }, { label: `技能欄（${artSlots(id)} 格）`, k: 'slots', help: '把精通（Lv10）迴響的技能放進技能欄，不用裝備那個迴響也能用' }, { label: '下一位 ▶', k: 'next' }], { title: `${CHARS[id].n}的迴響`, cls: 'menu2', onMove: () => side(p.echo ? echoCard(p.echo) : partyCard(id)) });
    if (r.index < 0) return;
    if (r.item.k === 'next') { const m = active(); id = m[(m.indexOf(id) + 1) % m.length]; continue; }
    if (r.item.k === 'set') {
      const list = Object.keys(G.s.echoes);
      const r2 = await UI.list([{ label: '（卸下）', eid: null }].concat(list.map((eid) => { const holder = Object.keys(G.s.party).find((m) => G.s.party[m].echo === eid); return { label: ECHOES[eid].n, sub: ECHOES[eid].title, right: `Lv${echoLevel(G.s.echoes[eid].ep)}${holder ? '・' + CHARS[holder].n : ''}`, eid }; })), { title: '選擇迴響', cls: 'menu2', cols: 1, onMove: (k, it) => side(it?.eid ? echoCard(it.eid) : partyCard(id)) });
      if (r2.index < 0) continue; if (r2.item.eid) equipEcho(id, r2.item.eid); else { p.echo = null; clampHP(id); } sfx('echo'); continue;
    }
    if (r.item.k === 'slots') {
      for (;;) {
        const n = artSlots(id); while (p.slots.length < n) p.slots.push(null);
        const r3 = await UI.list(p.slots.slice(0, n).map((sk, i) => ({ label: `欄 ${i + 1}`, right: sk ? skill(sk).n : '（空）', i })), { title: '技能欄', cls: 'menu2' });
        if (r3.index < 0) break;
        const arts = masteredArts(); if (!arts.length) { UI.toast('還沒有精通的迴響（Lv10）'); continue; }
        const r4 = await UI.list([{ label: '（清空）', sk: null }].concat(arts.map((sk) => ({ label: skill(sk).n, sk, right: skill(sk).mp || '', help: skill(sk).d, disabled: p.slots.includes(sk) }))), { title: '放入技能', cls: 'menu2 wide', cols: 2 });
        if (r4.index < 0) continue; p.slots[r3.item.i] = r4.item.sk; sfx('ok');
      }
    }
  }
}
// ---------------------------------------------------------------- party order
async function partyMenu(game) {
  for (;;) {
    const ids = G.s.order.filter((id) => G.s.members.includes(id));
    const r = await UI.list(ids.map((id, i) => ({ label: `${i < 4 ? '⚔' : '　'} ${CHARS[id].n}`, right: `Lv ${G.s.party[id].lv}${i >= 4 ? '（待命）' : ''}`, id, help: i < 4 ? '戰鬥成員' : '待命成員獲得 60% 經驗值' })), { title: '隊伍：選一位和另一位交換', cls: 'menu2', onMove: (k, it) => it && side(partyCard(it.id)) });
    if (r.index < 0) { game.refreshParty(); return; }
    const r2 = await UI.list(ids.map((id) => ({ label: CHARS[id].n, id })), { title: `和誰交換位置？`, cls: 'menu2' });
    if (r2.index < 0) continue; const o = G.s.order, a = o.indexOf(r.item.id), b = o.indexOf(r2.item.id); [o[a], o[b]] = [o[b], o[a]]; sfx('ok');
  }
}
// ---------------------------------------------------------------- status
async function statusMenu() {
  let i = 0; const ids = G.s.members;
  for (;;) {
    const id = ids[i], p = G.s.party[id], c = CHARS[id], st = heroStats(id), sk = heroSkills(id);
    side(`<div class="status"><h3>${c.n} <small>${c.title}</small></h3><p>${c.bio}</p><div>Lv ${p.lv}　經驗值 ${p.xp.toLocaleString()}　下一級還要 ${p.lv < 99 ? (xpFor(p.lv + 1) - p.xp).toLocaleString() : '—'}</div>
      <div class="stats">${Object.keys(STATN).map((k) => `<div>${STATN[k]}<b>${st[k]}</b></div>`).join('')}<div>會心<b>${st.crit}%</b></div><div>武器屬性<b>${EL[st.blow]}${st.wel ? '・' + EL[st.wel] : ''}</b></div></div>
      <div>技能：${sk.innate.map((s) => skill(s).n).join('、')}</div>${st.resist.length ? `<div>防止：${[...new Set(st.resist)].map((s) => ST_NAME[s]).join('、')}</div>` : ''}${st.resEl.length ? `<div>減半：${st.resEl.map((e) => EL[e]).join('、')}</div>` : ''}${st.passives.length ? `<div>被動：${st.passives.join('、')}</div>` : ''}</div>`);
    const r = await UI.list([{ label: '◀ 上一位', d: -1 }, { label: '下一位 ▶', d: 1 }], { title: '狀態', cls: 'menu2' });
    if (r.index < 0) return; i = (i + r.item.d + ids.length) % ids.length;
  }
}
// ---------------------------------------------------------------- journal and bestiary
async function journalMenu() {
  let start = 0;
  for (;;) {
    const story = STORY.filter(([f]) => G.s.flags[f]), people = PEOPLE.filter((p) => p[3]()), qs = QUESTS.filter((q) => q.show());
    side(`<div class="jr"><h3>📜 現在要做的事</h3><p class="goal">${objective()}</p><p class="tip">右上角的小地圖上，紅色菱形是目的地，黃色是出入口，藍色是存檔水晶，金色是寶箱，黃點是有事找你的人。（N 鍵或點小地圖切換大小）</p></div>`);
    const r = await UI.list([
      { label: '📜 現在要做的事', k: 'goal', help: objective() },
      { label: `📖 故事回顧（${story.length}）`, k: 'story', help: '到目前為止發生的事和重要的對話' },
      { label: `👥 人物介紹（${people.length}）`, k: 'people', help: '夥伴和遇到的重要人物' },
      { label: `📋 支線任務（${qs.filter((q) => q.done()).length}/${qs.length}）`, k: 'quests', help: '城鎮的人們拜託的事' },
    ], { title: '冒險日誌', cls: 'menu2', start });
    if (r.index < 0) return; start = r.index;
    if (r.item.k === 'story') {
      if (!story.length) { UI.toast('還沒有記錄'); continue; }
      const rev = story.slice().reverse();
      const card = (e) => `<div class="jr"><small>${e[1]}</small><h3>${e[2]}</h3><p>${e[3]}</p>${e[4] ? `<blockquote>${e[4]}</blockquote>` : ''}</div>`;
      await UI.list(rev.map((e) => ({ label: e[2], sub: e[1] })), { title: '故事回顧（最新的在上面）', cls: 'menu2', onMove: (k) => side(card(rev[k])) });
    }
    if (r.item.k === 'people') {
      const val = (x) => (typeof x === 'function' ? x() : x); const card = (p) => `<div class="jr"><small>${val(p[2])}</small><h3>${val(p[1])}</h3><p>${p[4]()}</p>${G.s.members.includes(p[0]) ? `<p class="tip">隊伍成員・Lv ${G.s.party[p[0]].lv}</p>` : ''}</div>`;
      await UI.list(people.map((p) => ({ label: val(p[1]), sub: val(p[2]) })), { title: '人物介紹', cls: 'menu2', onMove: (k) => side(card(people[k])) });
    }
    if (r.item.k === 'quests') {
      if (!qs.length) { UI.toast('還沒有支線任務。和城鎮裡頭上有「!」的人說說話吧'); continue; }
      const card = (q) => `<div class="jr"><h3>${q.done() ? '✅ ' : ''}${q.n}</h3><p>${q.d}</p>${q.done() ? '<p class="tip">已完成</p>' : q.hint ? `<p class="tip">提示：${q.hint()}</p>` : ''}</div>`;
      await UI.list(qs.map((q) => ({ label: (q.done() ? '✅ ' : '⬜ ') + q.n })), { title: '支線任務', cls: 'menu2', onMove: (k) => side(card(qs[k])) });
    }
  }
}
async function beastMenu() {
  const list = Object.values(ENEMIES).filter((e) => G.s.seen[e.id]);
  const total = Object.values(ENEMIES).length;
  side('');
  const r = await UI.list(list.map((e) => ({ label: e.n, right: G.s.seen[e.id] >= 2 ? `Lv${e.lv}` : '???', help: G.s.seen[e.id] >= 2 || G.s.known?.[e.id]?.length ? `HP ${G.s.seen[e.id] >= 2 || G.s.known?.[e.id]?.includes('_scan') ? stat(e).hp.toLocaleString() : '???'}　弱點：${e.w.map((w) => ((G.s.known?.[e.id] || []).includes(w) ? EL[w] : '？')).join('、') || '無'}${e.r.filter((w) => (G.s.known?.[e.id] || []).includes(w)).length ? `　抗性：${e.r.filter((w) => (G.s.known?.[e.id] || []).includes(w)).map((w) => EL[w]).join('、')}` : ''}${e.a.filter((w) => (G.s.known?.[e.id] || []).includes(w)).length ? `　吸收：${e.a.filter((w) => (G.s.known?.[e.id] || []).includes(w)).map((w) => EL[w]).join('、')}` : ''}${e.steal ? `<br>可偷：${ITEMS[e.steal].n}` : ''}${e.drop?.length ? `　掉落：${ITEMS[e.drop[0]]?.n || ''}` : ''}` : '打倒後才會知道詳細資料' })), { title: `魔物圖鑑　${list.length}/${total}`, cls: 'menu2 wide', cols: 2 });
}
async function optsMenu() {
  for (;;) {
    const o = G.s.opts, D = ['簡單', '普通', '困難'], E = ['少', '普通', '多'];
    const r = await UI.list([{ label: '文字速度', right: ['慢', '普通', '快', '瞬間'][o.msg] , k: 'msg' }, { label: '背景音樂', right: Math.round(o.bgm * 10), k: 'bgm' }, { label: '音效', right: Math.round(o.sfx * 10), k: 'sfx' }, { label: '難度', right: D[o.diff ?? 1], k: 'diff', help: '敵人的傷害：簡單 75%、普通 100%、困難 125%' }, { label: '遇敵率', right: E[o.enc ?? 1], k: 'enc' }, { label: '景深效果', right: o.dof ? '開' : '關', k: 'dof' }], { title: '設定　（左右鍵或點選調整）', cls: 'menu2', onSide: (d, k) => { } });
    if (r.index < 0) return;
    const k = r.item.k;
    if (k === 'msg') o.msg = (o.msg + 1) % 4; if (k === 'bgm') { o.bgm = Math.round(((o.bgm * 10 + 1) % 11)) / 10; setVolume('bgm', o.bgm); } if (k === 'sfx') { o.sfx = Math.round(((o.sfx * 10 + 1) % 11)) / 10; setVolume('sfx', o.sfx); }
    if (k === 'diff') o.diff = ((o.diff ?? 1) + 1) % 3; if (k === 'enc') o.enc = ((o.enc ?? 1) + 1) % 3; if (k === 'dof') { o.dof = o.dof ? 0 : 1; document.body.classList.toggle('nodof', !o.dof); }
    UI.speed = [1, 2, 4, 99][o.msg];
  }
}
// ---------------------------------------------------------------- shop, inn, save
export async function shopMenu(stock, name = '商店') {
  for (;;) {
    side(`<div class="gil big">💰 ${G.s.gil.toLocaleString()} G</div>`);
    const r = await UI.list([{ label: '買', k: 'buy' }, { label: '賣', k: 'sell' }, { label: '離開', k: 'out' }], { title: name, cls: 'menu2' });
    if (r.index < 0 || r.item.k === 'out') { side(''); return; }
    if (r.item.k === 'buy') for (;;) {
      side(`<div class="gil big">💰 ${G.s.gil.toLocaleString()} G</div>`);
      const items = stock.filter((id) => ITEMS[id]).map((id) => { const it = ITEMS[id]; const who = it.kind === 'weapon' || it.kind === 'armor' ? active().filter((m) => canEquip(m, it)).map((m) => { const sl = it.kind === 'weapon' ? 'weapon' : 'armor'; const d = diff(m, sl, id); return `${CHARS[m].n} ${d || '—'}`; }).join('<br>') : ''; return { label: it.n, icon: it.icon, right: `${it.price.toLocaleString()} G`, id, disabled: G.s.gil < it.price, help: `${it.d}${who ? '<br>' + who : ''}<br>持有：${count(id)}` }; });
      const r2 = await UI.list(items, { title: '要買什麼？', cls: 'menu2 wide', cols: 1 }); if (r2.index < 0) break;
      const it = ITEMS[r2.item.id], max = Math.min(99 - count(it.id), Math.floor(G.s.gil / it.price)); if (max <= 0) { UI.toast('買不了更多'); continue; }
      const n = it.kind === 'use' ? await UI.number(max, { title: it.n, price: it.price }) : 1; if (!n) continue;
      G.s.gil -= it.price * n; give(it.id, n); sfx('coin'); UI.toast(`買了 ${it.n}${n > 1 ? ' ×' + n : ''}`);
    }
    if (r.item.k === 'sell') for (;;) {
      side(`<div class="gil big">💰 ${G.s.gil.toLocaleString()} G</div>`);
      const ids = Object.keys(G.s.inv).filter((id) => ITEMS[id] && ITEMS[id].kind !== 'key');
      if (!ids.length) { UI.toast('沒有東西可以賣'); break; }
      const price = (it) => it.sell ?? Math.floor((it.price || 0) / 2);
      const r2 = await UI.list(ids.map((id) => ({ label: ITEMS[id].n, icon: ITEMS[id].icon, right: `${price(ITEMS[id])} G ×${G.s.inv[id]}`, id, help: ITEMS[id].d, disabled: !price(ITEMS[id]) })), { title: '要賣什麼？', cls: 'menu2 wide', cols: 2 }); if (r2.index < 0) break;
      const it = ITEMS[r2.item.id], n = G.s.inv[it.id] > 1 ? await UI.number(G.s.inv[it.id], { title: it.n, price: price(it) }) : 1; if (!n) continue;
      take(it.id, n); G.s.gil += price(it) * n; sfx('coin');
    }
  }
}
export async function saveScreen(o = {}) {
  for (;;) {
    const rows = [1, 2, 3].map((k) => { const s = peek(k); return { label: `檔案 ${k}`, k, sub: s ? `${s.where || ''}　Lv ${s.party?.lorne?.lv || 1}　第 ${s.ch} 章` : '（空）', right: s ? fmtTime(s.time) : '', disabled: o.load && !s }; });
    const r = await UI.list(rows, { title: o.load ? '讀取檔案' : '存檔', cls: 'menu2' });
    if (r.index < 0) return null;
    if (o.load) return r.item.k;
    if (peek(r.item.k) && !(await UI.confirm('要覆蓋這個檔案嗎？'))) continue;
    G.s.where = o.where || ''; if (save(r.item.k)) { sfx('save'); UI.toast('存檔完成！'); } else UI.toast('存檔失敗'); return r.item.k;
  }
}
