// Keyboard, gamepad and touch, folded into a few actions: a direction (analogue), ok, back, menu, run, and
// up/down/left/right with key repeat for menus. Touch: a stick on the left half, buttons on the right.
const keys = new Set(), edge = new Set(), held = {};
const MAP = {
  ok: ['KeyZ', 'Enter', 'Space', 'KeyJ'], back: ['KeyX', 'Escape', 'Backspace', 'KeyK'], menu: ['KeyC', 'Tab', 'KeyM'], run: ['ShiftLeft', 'ShiftRight'], ride: ['KeyR'], map: ['KeyN'],
  up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], pgup: ['KeyQ', 'PageUp'], pgdn: ['KeyE', 'PageDown'],
};
export const I = {
  touch: matchMedia('(pointer: coarse)').matches, stick: { x: 0, z: 0, on: false }, gp: { x: 0, z: 0 }, gpLook: { x: 0, z: 0 }, lookAcc: { dx: 0, dy: 0, zoom: 0, reset: false },
  takeLook() { const l = { ...this.lookAcc }; this.lookAcc = { dx: 0, dy: 0, zoom: 0, reset: false }; return l; }, listeners: [], tbtn: new Set(), tedge: new Set(),
  down(a) { return MAP[a]?.some((k) => keys.has(k)) || this.tbtn.has(a) || this.gpHeld?.has(a); },
  hit(a) { const h = MAP[a]?.some((k) => edge.has(k)) || this.tedge.has(a) || this.gpEdge?.has(a); return h; },
  axis() {
    let x = (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0), z = (this.down('down') ? 1 : 0) - (this.down('up') ? 1 : 0);
    if (this.stick.on) { x = this.stick.x; z = this.stick.z; }
    if (Math.abs(this.gp.x) > 0.25 || Math.abs(this.gp.z) > 0.25) { x = this.gp.x; z = this.gp.z; }
    const l = Math.hypot(x, z); if (l > 1) { x /= l; z /= l; } return { x, z, l: Math.min(1, l) };
  },
  // a menu step with repeat: returns 'up' | 'down' | 'left' | 'right' | null
  nav(now) {
    for (const d of ['up', 'down', 'left', 'right']) {
      const on = this.down(d) || (d === 'up' && this.gp.z < -0.6) || (d === 'down' && this.gp.z > 0.6) || (d === 'left' && this.gp.x < -0.6) || (d === 'right' && this.gp.x > 0.6);
      if (!on) { held[d] = 0; continue; }
      if (!held[d]) { held[d] = now + 0.32; return d; }
      if (now >= held[d]) { held[d] = now + 0.08; return d; }
    }
    return null;
  },
  end() { edge.clear(); this.tedge.clear(); this.gpEdge?.clear(); },
  any() { return keys.size > 0 || this.tbtn.size > 0; },
  // the gamepad (standard layout): A ok, B back, X run, Y / Start menu, Select ride, LB / RB page (in battle:
  // auto and fast), LT / RT run, d-pad and left stick move. Any connected pad works; the first with input wins.
  poll() {
    this.gpHeld ||= new Set(); this.gpEdge ||= new Set();
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter((g) => g && g.connected) : [];
    if (!pads.length) { this.gp.x = this.gp.z = 0; this.gpLook.x = this.gpLook.z = 0; this.gpHeld.clear(); this.pad = null; return; }
    const p = pads.find((g) => g.buttons.some((b) => b.pressed) || Math.hypot(g.axes[0] || 0, g.axes[1] || 0) > 0.3) || this.pad && pads.find((g) => g.index === this.pad.index) || pads[0];
    this.pad = p;
    let x = p.axes[0] || 0, z = p.axes[1] || 0; const l = Math.hypot(x, z);
    if (l < 0.22) { x = 0; z = 0; } else { const k = Math.min(1, (l - 0.22) / 0.7) / l; x *= k; z *= k; } // a round dead zone, scaled
    this.gp.x = x; this.gp.z = z;
    let rx = p.axes[2] || 0, rz = p.axes[3] || 0; const rl = Math.hypot(rx, rz); if (rl < 0.2) { rx = 0; rz = 0; } this.gpLook.x = rx; this.gpLook.z = rz;
    if (p.buttons[11]?.pressed && !this.r3) this.lookAcc.reset = true; this.r3 = !!p.buttons[11]?.pressed;
    const B = (i) => !!p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5);
    const now = new Set();
    if (B(0)) now.add('ok'); if (B(1)) now.add('back'); if (B(3) || B(9)) now.add('menu'); if (B(2) || B(6) || B(7)) now.add('run');
    if (B(12)) now.add('up'); if (B(13)) now.add('down'); if (B(14)) now.add('left'); if (B(15)) now.add('right');
    if (B(4)) now.add('pgup'); if (B(5)) now.add('pgdn'); if (B(8) || B(10)) now.add('ride');
    for (const a of now) if (!this.gpHeld.has(a)) this.gpEdge.add(a);
    if (now.size || l > 0.3) this.usingPad(true);
    this.gpHeld = now;
  },
  // show controller prompts once a pad is used; back to keyboard / touch prompts when those are used
  usingPad(on) { if (this.padMode === on) return; this.padMode = on; document.body.classList.toggle('pad', on); this.onMode?.(on); },
  // a short shake of the pad (if it can)
  rumble(ms = 120, strong = 0.6, weak = 0.4) { const a = this.pad?.vibrationActuator; if (!a || this.noRumble) return; try { a.playEffect?.('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }); } catch (e) { } },
  // touch buttons press an action
  press(a, on) { if (on) { if (!this.tbtn.has(a)) this.tedge.add(a); this.tbtn.add(a); } else this.tbtn.delete(a); },
};
addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; I.usingPad(false); if (!keys.has(e.code)) edge.add(e.code); keys.add(e.code); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
let drag = null;
addEventListener('mousedown', (e) => { if (e.target.id !== 'cv') return; drag = { x: e.clientX, y: e.clientY }; });
addEventListener('mousemove', (e) => { if (!drag) return; I.lookAcc.dx += e.clientX - drag.x; I.lookAcc.dy += e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; });
addEventListener('mouseup', () => { drag = null; });
addEventListener('wheel', (e) => { if (e.target.id !== 'cv') return; I.lookAcc.zoom += e.deltaY; }, { passive: true });
addEventListener('dblclick', (e) => { if (e.target.id === 'cv') I.lookAcc.reset = true; });
addEventListener('gamepadconnected', (e) => { I.onPad?.(e.gamepad, true); });
addEventListener('gamepaddisconnected', (e) => { I.onPad?.(e.gamepad, false); });

// ---------------------------------------------------------------- the touch stick and buttons
export function setupTouch() {
  if (!I.touch) return;
  document.body.classList.add('touch');
  const stick = document.getElementById('stick'), knob = document.getElementById('knob'); let sid = null, sx = 0, sy = 0;
  let lid = null, lx = 0, ly = 0, lt = 0, lmoved = 0, pinch = null;
  addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) {
      if (t.target.closest('button, .win, #menuwrap, .clickable')) continue;
      if (t.clientX < innerWidth * 0.5 && sid === null) { sid = t.identifier; sx = t.clientX; sy = t.clientY; stick.hidden = false; stick.style.left = sx - 60 + 'px'; stick.style.top = sy - 60 + 'px'; I.stick.on = true; I.stick.x = I.stick.z = 0; }
      else if (t.clientX >= innerWidth * 0.5 && lid === null) { lid = t.identifier; lx = t.clientX; ly = t.clientY; lt = performance.now(); lmoved = 0; }
    }
    if (e.touches.length === 2 && sid === null) { const [a, b] = e.touches; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  }, { passive: true });
  addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === sid) { let dx = t.clientX - sx, dy = t.clientY - sy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } knob.style.transform = `translate(${dx}px, ${dy}px)`; I.stick.x = dx / m; I.stick.z = dy / m; }
      if (t.identifier === lid) { const dx = t.clientX - lx, dy = t.clientY - ly; lmoved += Math.abs(dx) + Math.abs(dy); I.lookAcc.dx += dx * 1.3; I.lookAcc.dy += dy * 1.3; lx = t.clientX; ly = t.clientY; }
    }
    if (pinch && e.touches.length === 2) { const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); I.lookAcc.zoom += (pinch - d) * 3; pinch = d; }
  }, { passive: true });
  const end = (e) => { for (const t of e.changedTouches) { if (t.identifier === sid) { sid = null; stick.hidden = true; knob.style.transform = ''; I.stick.on = false; I.stick.x = I.stick.z = 0; } if (t.identifier === lid) { if (lmoved < 14 && performance.now() - lt < 350) { I.press('ok', true); setTimeout(() => I.press('ok', false), 60); } lid = null; } } if (e.touches.length < 2) pinch = null; };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  for (const b of document.querySelectorAll('#tbtns [data-act]')) {
    const a = b.dataset.act;
    b.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); I.press(a, true); b.classList.add('on'); }, { passive: false });
    b.addEventListener('touchend', (e) => { e.preventDefault(); I.press(a, false); b.classList.remove('on'); }, { passive: false });
  }
}
