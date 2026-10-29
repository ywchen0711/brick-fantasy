// The windows: speech, choices, lists (for menus, shops and battle commands), toasts, banners, the fade.
// Every window is a widget on a stack; the top one gets the keys each frame. Everything can also be tapped or clicked.
import { I } from './input.js';
import { sfx } from './audio.js';

const root = () => document.getElementById('ui');
const stack = [];
export const UI = {
  stack, busy: () => stack.length > 0, speed: 2,
  tick(dt, now) {
    const w = stack[stack.length - 1]; if (!w) return;
    w.update?.(dt, now);
    const n = I.nav(now); if (n) w.nav?.(n);
    if (I.hit('ok')) w.ok?.(); else if (I.hit('back')) w.back?.(); else if (I.hit('pgup')) w.page?.(-1); else if (I.hit('pgdn')) w.page?.(1); else if (I.hit('menu')) w.menuKey?.();
  },
  push(w) { stack.push(w); root().appendChild(w.el); return w; },
  pop(w) { const i = stack.indexOf(w); if (i >= 0) stack.splice(i, 1); w.el.remove(); },
  clear() { while (stack.length) UI.pop(stack[stack.length - 1]); },

  // ---------------------------------------------------------------- speech: resolves when read
  say(name, text, o = {}) {
    return new Promise((res) => {
      const el = div('win say' + (o.top ? ' top' : '') + (o.sys ? ' sys' : '') + (o.mini ? ' mini' : '')); el.innerHTML = (name ? `<b class="nm" style="${o.color ? 'background:' + o.color : ''}">${name}</b>` : '') + '<p></p><i class="more">▼</i>';
      const p = el.querySelector('p'); let shown = 0, done = false; const full = String(text);
      const w = { el, update(dt) { if (done) return; shown += dt * 40 * UI.speed; const n = Math.floor(shown); p.innerHTML = fmt(full.slice(0, n)); if (n % 3 === 0 && n !== this.last) { this.last = n; if (!o.sys) sfx('blip'); } if (n >= full.length) { done = true; p.innerHTML = fmt(full); el.classList.add('done'); } },
        ok() { if (!done) { shown = 1e9; return; } UI.pop(w); sfx('tick'); res(); }, back() { this.ok(); } };
      el.addEventListener('click', () => w.ok()); UI.push(w);
      if (o.auto) setTimeout(() => { if (stack.includes(w)) { shown = 1e9; w.update(0); w.ok(); } }, o.auto);
    });
  },
  // ---------------------------------------------------------------- a choice
  choose(options, o = {}) {
    return UI.list(options.map((t) => ({ label: t })), { cancel: o.cancel, cls: 'choice' + (o.cls ? ' ' + o.cls : ''), title: o.title }).then((r) => r.index);
  },
  // ---------------------------------------------------------------- a list: items [{ label, sub, right, icon, disabled, help }]
  // resolves { index, item } (index -1 if cancelled). o: title, cancel, cols, help (an element for item help), cls, start, onMove
  list(items, o = {}) {
    return new Promise((res) => {
      const el = div('win list ' + (o.cls || '')); if (o.style) el.style.cssText = o.style;
      el.innerHTML = (o.title ? `<h3>${o.title}</h3>` : '') + `<div class="rows" style="${o.cols ? `grid-template-columns:repeat(${o.cols},1fr)` : ''}"></div>` + (o.help !== false ? '<div class="help"></div>' : '');
      const rows = el.querySelector('.rows'), help = el.querySelector('.help'); let k = Math.min(o.start || 0, Math.max(0, items.length - 1));
      const btns = items.map((it, i) => { const b = document.createElement('button'); b.className = 'row' + (it.disabled ? ' off' : '') + (it.cls ? ' ' + it.cls : ''); b.innerHTML = `${it.icon ? `<span class="ic">${it.icon}</span>` : ''}<span class="lb">${it.label}</span>${it.sub ? `<small>${it.sub}</small>` : ''}${it.right != null ? `<em>${it.right}</em>` : ''}`; b.addEventListener('click', (e) => { e.stopPropagation(); if (k === i) w.ok(); else { k = i; draw(); if (I.touch || o.oneTap) w.ok(); } }); b.addEventListener('mouseenter', () => { if (!I.touch) { k = i; draw(); } }); rows.appendChild(b); return b; });
      const draw = () => { btns.forEach((b, i) => b.classList.toggle('on', i === k)); btns[k]?.scrollIntoView({ block: 'nearest' }); if (help) help.innerHTML = items[k]?.help || ''; o.onMove?.(k, items[k]); };
      const cols = o.cols || 1;
      const w = { el,
        nav(d) { if (!items.length) return; if (d === 'up') k = (k - cols + items.length) % items.length; if (d === 'down') k = (k + cols) % items.length; if (d === 'left' && cols > 1) k = (k - 1 + items.length) % items.length; if (d === 'right' && cols > 1) k = (k + 1) % items.length; if ((d === 'left' || d === 'right') && cols === 1) { o.onSide?.(d, k); return; } sfx('tick'); draw(); },
        ok() { const it = items[k]; if (!it || it.disabled) { sfx('buzz'); return; } sfx('ok'); if (!o.keep) UI.pop(w); res({ index: k, item: it, w }); },
        back() { if (o.cancel === false) return; sfx('back'); UI.pop(w); res({ index: -1 }); },
        page(d) { o.onPage?.(d); }, menuKey() { o.onMenu?.(k); },
        set(i) { k = i; draw(); }, close() { if (stack.includes(w)) { UI.pop(w); res({ index: -1, closed: true }); } },
      };
      if (o.cancel !== false) { const x = document.createElement('button'); x.className = 'x'; x.textContent = '✕'; x.addEventListener('click', (e) => { e.stopPropagation(); w.back(); }); el.appendChild(x); }
      UI.push(w); draw(); o.ref?.(w);
    });
  },
  // ---------------------------------------------------------------- how many (for the shop)
  number(max, o = {}) {
    return new Promise((res) => {
      let n = 1; const el = div('win num'); el.innerHTML = `<h3>${o.title || '數量'}</h3><div class="n"><button data-d="-1">◀</button><b></b><button data-d="1">▶</button></div><p class="price"></p><button class="okb">確定</button>`;
      const draw = () => { el.querySelector('b').textContent = n; el.querySelector('.price').innerHTML = o.price ? `${(o.price * n).toLocaleString()} G` : ''; };
      const w = { el, nav(d) { if (d === 'left' || d === 'down') n = Math.max(1, n - (d === 'down' ? 10 : 1)); else n = Math.min(max, n + (d === 'up' ? 10 : 1)); sfx('tick'); draw(); }, ok() { UI.pop(w); sfx('ok'); res(n); }, back() { UI.pop(w); sfx('back'); res(0); } };
      el.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); w.nav(+b.dataset.d > 0 ? 'right' : 'left'); }));
      el.querySelector('.okb').addEventListener('click', (e) => { e.stopPropagation(); w.ok(); });
      UI.push(w); draw();
    });
  },
  confirm(text) { return UI.list([{ label: '是' }, { label: '否' }], { title: text, cls: 'choice' }).then((r) => r.index === 0); },
  // ---------------------------------------------------------------- passing messages
  toast(text, ms = 2200) { const t = div('toast'); t.innerHTML = text; document.getElementById('toasts').appendChild(t); setTimeout(() => t.classList.add('gone'), ms); setTimeout(() => t.remove(), ms + 500); },
  banner(title, sub = '', ms = 3200) { const b = document.getElementById('banner'); b.innerHTML = `<b>${title}</b>${sub ? `<small>${sub}</small>` : ''}`; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); return wait(ms); },
  area(name) { const a = document.getElementById('area'); a.textContent = name; a.classList.remove('show'); void a.offsetWidth; a.classList.add('show'); },
  fade(on, ms = 400, color = '#000') { const f = document.getElementById('fade'); f.style.transition = `opacity ${ms}ms`; f.style.background = color; f.style.opacity = on ? 1 : 0; return wait(ms); },
  flash(color = '#fff', ms = 300) { const f = document.getElementById('flash'); f.style.background = color; f.style.transition = 'none'; f.style.opacity = 0.8; void f.offsetWidth; f.style.transition = `opacity ${ms}ms`; f.style.opacity = 0; },
  // a whole-screen card (chapter titles, the ending)
  card(html, ms) { return new Promise((res) => { const el = div('card'); el.innerHTML = html; document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('show')); const done = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 800); res(); }; if (ms) setTimeout(done, ms); else { const w = { el: div('hidden'), ok() { UI.pop(w); done(); }, back() { this.ok(); } }; el.addEventListener('click', () => w.ok()); UI.push(w); } }); },
};
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export function div(cls) { const d = document.createElement('div'); d.className = cls; return d; }
// text marks: {c:red}…{/c} colours, \n new line, {w}…{/w} a warning colour
export function fmt(s) { return s.replace(/\n/g, '<br>').replace(/\{c:([#\w]+)\}/g, '<span style="color:$1">').replace(/\{\/c\}/g, '</span>').replace(/\{g\}/g, '<span class="hl">').replace(/\{\/g\}/g, '</span>'); }
