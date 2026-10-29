// Keyboard, gamepad and touch, folded into a few actions: a direction (analogue), ok, back, menu, run, and
// up/down/left/right with key repeat for menus. Touch: a stick on the left half, buttons on the right.
const keys = new Set(), edge = new Set(), held = {};
const MAP = {
  ok: ['KeyZ', 'Enter', 'Space', 'KeyJ'], back: ['KeyX', 'Escape', 'Backspace', 'KeyK'], menu: ['KeyC', 'Tab', 'KeyM'], run: ['ShiftLeft', 'ShiftRight'], ride: ['KeyR'], map: ['KeyN'],
  up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], pgup: ['KeyQ', 'PageUp'], pgdn: ['KeyE', 'PageDown'],
};
export const I = {
  touch: matchMedia('(pointer: coarse)').matches, stick: { x: 0, z: 0, on: false }, gp: { x: 0, z: 0 }, listeners: [], tbtn: new Set(), tedge: new Set(),
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
  poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : []; const p = [...pads].find((g) => g && g.connected);
    this.gpHeld ||= new Set(); this.gpEdge ||= new Set();
    if (!p) { this.gp.x = this.gp.z = 0; this.gpHeld.clear(); return; }
    this.gp.x = p.axes[0] || 0; this.gp.z = p.axes[1] || 0;
    const B = (i) => p.buttons[i]?.pressed;
    const now = new Set(); if (B(0)) now.add('ok'); if (B(1)) now.add('back'); if (B(3) || B(9)) now.add('menu'); if (B(2)) now.add('run'); if (B(12)) now.add('up'); if (B(13)) now.add('down'); if (B(14)) now.add('left'); if (B(15)) now.add('right'); if (B(4)) now.add('pgup'); if (B(5)) now.add('pgdn'); if (B(8)) now.add('ride');
    for (const a of now) if (!this.gpHeld.has(a)) this.gpEdge.add(a);
    this.gpHeld = now;
  },
  // touch buttons press an action
  press(a, on) { if (on) { if (!this.tbtn.has(a)) this.tedge.add(a); this.tbtn.add(a); } else this.tbtn.delete(a); },
};
addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; if (!keys.has(e.code)) edge.add(e.code); keys.add(e.code); if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault(); });
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

// ---------------------------------------------------------------- the touch stick and buttons
export function setupTouch() {
  if (!I.touch) return;
  document.body.classList.add('touch');
  const stick = document.getElementById('stick'), knob = document.getElementById('knob'); let sid = null, sx = 0, sy = 0;
  addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) {
      if (t.target.closest('button, .win, #menuwrap, .clickable')) continue;
      if (t.clientX < innerWidth * 0.5 && sid === null) { sid = t.identifier; sx = t.clientX; sy = t.clientY; stick.hidden = false; stick.style.left = sx - 60 + 'px'; stick.style.top = sy - 60 + 'px'; I.stick.on = true; I.stick.x = I.stick.z = 0; }
      else if (t.clientX >= innerWidth * 0.5) { I.press('ok', true); setTimeout(() => I.press('ok', false), 60); }
    }
  }, { passive: true });
  addEventListener('touchmove', (e) => { for (const t of e.changedTouches) if (t.identifier === sid) { let dx = t.clientX - sx, dy = t.clientY - sy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } knob.style.transform = `translate(${dx}px, ${dy}px)`; I.stick.x = dx / m; I.stick.z = dy / m; } }, { passive: true });
  const end = (e) => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; stick.hidden = true; knob.style.transform = ''; I.stick.on = false; I.stick.x = I.stick.z = 0; } };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  for (const b of document.querySelectorAll('#tbtns [data-act]')) {
    const a = b.dataset.act;
    b.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); I.press(a, true); b.classList.add('on'); }, { passive: false });
    b.addEventListener('touchend', (e) => { e.preventDefault(); I.press(a, false); b.classList.remove('on'); }, { passive: false });
  }
}
