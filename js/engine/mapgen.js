// Every place is built here from a short description (data/maps.js): a town around its square, a field with a path
// winding through it, a dungeon of rooms and corridors floor by floor, a room, and the world itself. The result is a
// voxel grid plus what the field engine needs: where you can walk, named spots, ways in and out, chests, lights.
import { Voxels, B, SOLID } from './voxel.js';
import { rng } from './models.js';

export const BASE = 3; // the ground's top: bricks 0..2 are solid
export const THEMES = {
  // towns
  whitehawk: { g: B.GRASS, g2: B.LEAF2, path: B.PATH, wall: B.WALL, roof: B.BLUE, trim: B.WOOD, win: B.BLUE, tree: 'oak', deco: ['flower', 'bush', 'lamp'], sky: ['#7ab8f0', '#e0f0ff'], fog: '#d8ecff', sun: '#fff4e0', amb: 0.62 },
  village: { g: B.GRASS, g2: B.LEAF2, path: B.DIRT, wall: B.PLANK, roof: B.STRAW, trim: B.WOOD, win: B.PAPER, tree: 'oak', deco: ['reed', 'flower', 'fence'], sky: ['#8ac8f0', '#f0f8ff'], fog: '#e0f0f0', sun: '#fff0d8', amb: 0.62 },
  forge: { g: B.STONE, g2: B.GREY, path: B.GREY, wall: B.BRICK, roof: B.ROOF, trim: B.METAL, win: B.GLOW, tree: 'dead', deco: ['crate', 'anvil', 'lamp'], sky: ['#c88a5a', '#f0c8a0'], fog: '#d8a880', sun: '#ffd0a0', amb: 0.55 },
  port: { g: B.GRASS, g2: B.SAND, path: B.PATH, wall: B.WALL, roof: B.RED, trim: B.WOOD, win: B.BLUE, tree: 'palm', deco: ['crate', 'barrel', 'flower'], sky: ['#5ab0f0', '#e0f4ff'], fog: '#d0ecff', sun: '#ffffff', amb: 0.66 },
  snow: { g: B.SNOW, g2: B.WHITE, path: B.PATH, wall: B.PLANK, roof: B.ROOF, trim: B.WOOD, win: B.GLOW, tree: 'pine', deco: ['lamp', 'fence', 'snowman'], sky: ['#a8c0d8', '#f0f4f8'], fog: '#e8eef4', sun: '#e8f0ff', amb: 0.66, snowRoof: true },
  desert: { g: B.SAND, g2: B.SANDSTONE, path: B.SANDSTONE, wall: B.SANDSTONE, roof: B.ORANGE, trim: B.CLAY, win: B.DARK, tree: 'palm', deco: ['pot', 'crate', 'cactus'], sky: ['#f0b860', '#fff0c8'], fog: '#f8e0b0', sun: '#fff0c0', amb: 0.66, flat: true },
  sakura: { g: B.GRASS, g2: B.MOSS, path: B.PATH, wall: B.PAPER, roof: B.ROOF, trim: B.RED, win: B.PAPER, tree: 'sakura', deco: ['lantern', 'bamboo', 'flower'], sky: ['#f0a8c0', '#fff0f4'], fog: '#f8e0e8', sun: '#fff0f0', amb: 0.64 },
  academy: { g: B.GRASS, g2: B.LEAF2, path: B.MARBLE, wall: B.MARBLE, roof: B.PURPLE, trim: B.GOLD, win: B.CRYSTAL, tree: 'oak', deco: ['lamp', 'statue', 'flower'], sky: ['#6a7ac8', '#e0e4ff'], fog: '#d8dcf8', sun: '#f0f0ff', amb: 0.6 },
  ruin: { g: B.DGRASS, g2: B.CRACK, path: B.CRACK, wall: B.WALL, roof: B.BLUE, trim: B.WOOD, win: B.DARK, tree: 'dead', deco: ['rubble', 'fire'], sky: ['#3a2a4a', '#8a6a7a'], fog: '#5a4a5a', sun: '#c8a0a0', amb: 0.45, broken: true },
  ash: { g: B.DGRASS, g2: B.MUD, path: B.DIRT, wall: B.PLANK, roof: B.ROOF, trim: B.WOOD, win: B.GLOW, tree: 'pine', deco: ['fence', 'lamp'], sky: ['#4a5a6a', '#a8b0b8'], fog: '#8a949e', sun: '#d0d8e0', amb: 0.5 },
  // fields
  canyon: { g: B.GRASS, g2: B.LEAF2, path: B.DIRT, cliff: B.CLIFF, tree: 'oak', deco: ['rock', 'flower', 'bush'], sky: ['#7ab8f0', '#e0f0ff'], fog: '#d8ecff', sun: '#fff4e0', amb: 0.62, hills: 2 },
  plains: { g: B.GRASS, g2: B.LEAF2, path: B.DIRT, cliff: B.STONE, tree: 'oak', deco: ['flower', 'bush', 'rock'], sky: ['#7ab8f0', '#e0f0ff'], fog: '#d8ecff', sun: '#fff4e0', amb: 0.62, hills: 1 },
  swamp: { g: B.MOSS, g2: B.MUD, path: B.DIRT, cliff: B.MOSS, tree: 'dead', deco: ['reed', 'mushroom', 'pool'], sky: ['#7a8a7a', '#c8d0c0'], fog: '#a8b4a0', sun: '#e0e8d0', amb: 0.52, hills: 1, pools: 0.12 },
  badlands: { g: B.CLIFF, g2: B.CLAY, path: B.SAND, cliff: B.RUST, tree: 'dead', deco: ['rock', 'cactus'], sky: ['#e0905a', '#f8d8b0'], fog: '#f0c8a0', sun: '#ffe0b0', amb: 0.6, hills: 3 },
  beach: { g: B.SAND, g2: B.GRASS, path: B.SAND, cliff: B.STONE, tree: 'palm', deco: ['rock', 'shell'], sky: ['#5ab0f0', '#e0f4ff'], fog: '#d0ecff', sun: '#ffffff', amb: 0.66, hills: 1, sea: true },
  snowfield: { g: B.SNOW, g2: B.ICE, path: B.WHITE, cliff: B.ICE, tree: 'pine', deco: ['rock', 'icicle'], sky: ['#a8c0d8', '#f0f4f8'], fog: '#e8eef4', sun: '#e8f0ff', amb: 0.66, hills: 2 },
  dunes: { g: B.SAND, g2: B.SANDSTONE, path: B.SANDSTONE, cliff: B.SANDSTONE, tree: 'cactus', deco: ['rock', 'bones'], sky: ['#f0b860', '#fff0c8'], fog: '#f8e0b0', sun: '#fff0c0', amb: 0.68, hills: 3 },
  bamboo: { g: B.GRASS, g2: B.MOSS, path: B.PATH, cliff: B.MOSS, tree: 'bamboo', deco: ['lantern', 'rock', 'flower'], sky: ['#a8d0a0', '#f0f8e8'], fog: '#d0e8c8', sun: '#f8fff0', amb: 0.58, hills: 1 },
  darkwood: { g: B.DGRASS, g2: B.MUD, path: B.DIRT, cliff: B.DARK, tree: 'pine', deco: ['mushroom', 'rock', 'bones'], sky: ['#2a2a3a', '#5a5a6a'], fog: '#3a3a4a', sun: '#a0a0c0', amb: 0.4, hills: 1 },
  skyisle: { g: B.GRASS, g2: B.CLOUD, path: B.MARBLE, cliff: B.CLOUD, tree: 'oak', deco: ['flower', 'statue', 'crystal'], sky: ['#3a8af0', '#f0f8ff'], fog: '#e8f4ff', sun: '#ffffff', amb: 0.7, hills: 1, float: true },
  voidland: { g: B.OBSIDIAN, g2: B.VOID, path: B.CRYSTAL, cliff: B.VOID, tree: 'dead', deco: ['crystal', 'rock'], sky: ['#1a0a2a', '#4a2a5a'], fog: '#2a1a3a', sun: '#c0a0ff', amb: 0.45, hills: 2, float: true },
  // dungeons
  windtemple: { floor: B.MARBLE, floor2: B.TEAL, wall: B.MARBLE, cap: B.TEAL, deco: ['pillar', 'crystal', 'torch'], light: '#a0ffc8', sky: ['#9ad8b0', '#e0f8e8'], fog: '#c8e8d8', amb: 0.55 },
  sunken: { floor: B.STONE, floor2: B.MOSS, wall: B.STONE, cap: B.MOSS, deco: ['pillar', 'water', 'torch'], light: '#80c0ff', sky: ['#1a3a5a', '#3a6a8a'], fog: '#2a4a5a', amb: 0.42 },
  lava: { floor: B.OBSIDIAN, floor2: B.CLIFF, wall: B.CLIFF, cap: B.RUST, deco: ['lava', 'rock', 'torch'], light: '#ff8040', sky: ['#3a1a10', '#8a3a1a'], fog: '#5a2a1a', amb: 0.42 },
  coral: { floor: B.SAND, floor2: B.CORAL, wall: B.STONE, cap: B.CORAL, deco: ['coral', 'water', 'crystal'], light: '#80e0ff', sky: ['#1a4a6a', '#3a8aa8'], fog: '#2a5a7a', amb: 0.45 },
  icepalace: { floor: B.ICE, floor2: B.WHITE, wall: B.ICE, cap: B.WHITE, deco: ['pillar', 'icicle', 'crystal'], light: '#c0f0ff', sky: ['#a8c8e8', '#e8f4ff'], fog: '#c8dcf0', amb: 0.58 },
  ruins: { floor: B.SANDSTONE, floor2: B.CRACK, wall: B.SANDSTONE, cap: B.GOLD, deco: ['pillar', 'statue', 'torch'], light: '#ffc870', sky: ['#5a3a1a', '#a8783a'], fog: '#6a4a2a', amb: 0.45 },
  tower: { floor: B.PLANK, floor2: B.PURPLE, wall: B.WOOD, cap: B.GOLD, deco: ['pillar', 'lantern', 'torch'], light: '#ffe070', sky: ['#2a2a5a', '#5a5a9a'], fog: '#3a3a6a', amb: 0.45 },
  sewer: { floor: B.STONE, floor2: B.MUD, wall: B.BRICK, cap: B.GREY, deco: ['water', 'barrel', 'torch'], light: '#ffc080', sky: ['#1a1a1a', '#3a3a30'], fog: '#2a2a24', amb: 0.4 },
  castle: { floor: B.GREY, floor2: B.RED, wall: B.WALL, cap: B.BLUE, deco: ['pillar', 'banner', 'torch'], light: '#ffd8a0', sky: ['#2a2a3a', '#5a5a6a'], fog: '#3a3a4a', amb: 0.5 },
  skyfort: { floor: B.METAL, floor2: B.PLANK, wall: B.METAL, cap: B.RUST, deco: ['crate', 'barrel', 'torch'], light: '#ffd080', sky: ['#5a8ac8', '#d0e4f8'], fog: '#a0c0e0', amb: 0.55 },
  lighttemple: { floor: B.MARBLE, floor2: B.GOLD, wall: B.MARBLE, cap: B.GOLD, deco: ['pillar', 'statue', 'crystal'], light: '#fff0c0', sky: ['#c8d8ff', '#ffffff'], fog: '#e8ecff', amb: 0.66 },
  shadow: { floor: B.OBSIDIAN, floor2: B.PURPLE, wall: B.OBSIDIAN, cap: B.PURPLE, deco: ['pillar', 'banner', 'torch'], light: '#c080ff', sky: ['#0a0a14', '#2a1a3a'], fog: '#140a1e', amb: 0.36 },
  timecorr: { floor: B.MARBLE, floor2: B.CRYSTAL, wall: B.PURPLE, cap: B.CRYSTAL, deco: ['pillar', 'crystal', 'statue'], light: '#c0a0ff', sky: ['#1a1a3a', '#5a4a8a'], fog: '#2a2a4a', amb: 0.45 },
  voidtower: { floor: B.OBSIDIAN, floor2: B.CRYSTAL, wall: B.VOID, cap: B.CRYSTAL, deco: ['crystal', 'pillar', 'torch'], light: '#ff80ff', sky: ['#0a0010', '#2a0a3a'], fog: '#14001e', amb: 0.4 },
  abyss: { floor: B.DARK, floor2: B.CRYSTAL, wall: B.BLACK, cap: B.GOLD, deco: ['crystal', 'pillar', 'torch'], light: '#ffd84a', sky: ['#000000', '#1a1a2a'], fog: '#0a0a14', amb: 0.4 },
  // rooms
  throne: { floor: B.MARBLE, floor2: B.RED, wall: B.WALL, cap: B.BLUE, light: '#ffe8c0', sky: ['#2a2a3a', '#4a4a5a'], fog: '#3a3a4a', amb: 0.62 },
  inn: { floor: B.PLANK, floor2: B.RED, wall: B.PLANK, cap: B.WOOD, light: '#ffd8a0', sky: ['#1a1410', '#3a2a20'], fog: '#2a2018', amb: 0.6 },
  deck: { floor: B.PLANK, floor2: B.WOOD, wall: B.WOOD, cap: B.RED, light: '#ffffff', sky: ['#5aa0f0', '#e0f0ff'], fog: '#c8e4ff', amb: 0.66 },
};

// ---------------------------------------------------------------- the map object
export class MapData {
  constructor(def, W, D, H = 18) {
    this.def = def; this.id = def.id; this.W = W; this.D = D; this.H = H; this.V = new Voxels(W, H, D);
    this.spots = {}; this.entries = {}; this.exits = []; this.props = []; this.lights = []; this.locs = [];
    this.floorH = new Int16Array(W * D); this.flags = new Uint8Array(W * D); // flags: 1 blocked, 2 water, 4 road, 8 no encounters, 16 hazard
    this.th = THEMES[def.theme] || THEMES.plains; this.r = rng(hashStr(def.id) + (def.seed || 0));
  }
  i(x, z) { return z * this.W + x; }
  in(x, z) { return x >= 0 && z >= 0 && x < this.W && z < this.D; }
  set(x, y, z, b) { this.V.set(x, y, z, b); }
  get(x, y, z) { return this.V.get(x, y, z); }
  col(x, z, y0, y1, b) { for (let y = y0; y <= y1; y++) this.V.set(x, y, z, b); }
  box(x0, y0, z0, x1, y1, z1, b) { this.V.fill(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1), b); }
  top(x, z) { return this.V.top(x, z); }
  spot(name, x, z, dir = 0) { this.spots[name] = { x, z, dir }; return this.spots[name]; }
  entry(name, x, z, dir = Math.PI) { this.entries[name] = { x, z, dir }; }
  exit(x0, z0, x1, z1, to, at, o = {}) { this.exits.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), to, at, ...o }); }
  prop(type, x, z, o = {}) { const p = { type, x, z, ...o }; this.props.push(p); return p; }
  light(x, y, z, color, power = 1) { this.lights.push({ x, y, z, color, power }); }
  // where you stand in each column: the lowest place with solid ground under it and three free bricks above (water
  // counts as ground, and a flag says so); a column with no such place is blocked
  finish() {
    const V = this.V, W = this.W, D = this.D, free = (x, y, z) => { const b = V.get(x, y, z); return b === B.AIR || b === B.REED; };
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = z * W + x; let y = 1;
      while (y < this.H - 2 && !(!free(x, y - 1, z) && free(x, y, z) && free(x, y + 1, z) && free(x, y + 2, z))) y++;
      this.floorH[i] = y;
      if (y >= this.H - 2) { this.flags[i] |= 1; continue; }
      const under = V.get(x, y - 1, z);
      if (under === B.WATER) this.flags[i] |= 2;
      if (under === B.LAVA) this.flags[i] |= 16;
    }
  }
  walkable(x, z) { if (!this.in(x, z)) return false; const f = this.flags[this.i(x, z)]; return !(f & 1) && !(f & 2) && !(f & 16); }
  h(x, z) { return this.in(x, z) ? this.floorH[this.i(x, z)] : 99; }
  block(x, z, v = true) { if (this.in(x, z)) { if (v) this.flags[this.i(x, z)] |= 1; else this.flags[this.i(x, z)] &= ~1; } }
}
export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function noise2(seed) { // a smooth value noise
  const r = rng(seed), P = new Float32Array(256); for (let i = 0; i < 256; i++) P[i] = r();
  const at = (x, z) => P[((x & 15) + (z & 15) * 16) & 255];
  return (x, z) => { const x0 = Math.floor(x), z0 = Math.floor(z), fx = x - x0, fz = z - z0, sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
    const a = at(x0, z0), b = at(x0 + 1, z0), c = at(x0, z0 + 1), d = at(x0 + 1, z0 + 1); return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz; };
}

// ---------------------------------------------------------------- pieces: trees, houses, things
export function tree(M, x, z, kind, y = null) {
  y ??= M.top(x, z); const r = M.r, V = M;
  if (kind === 'oak' || kind === 'sakura') {
    const h = 3 + Math.floor(r() * 2), leaf = kind === 'sakura' ? B.BLOSSOM : (r() < 0.5 ? B.LEAF : B.LEAF2);
    V.col(x, z, y, y + h - 1, B.WOOD);
    for (let dy = 0; dy < 3; dy++) { const rad = dy === 2 ? 1 : 2; for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) { if (Math.abs(dx) + Math.abs(dz) > rad + (dy === 1 ? 1 : 0)) continue; if (V.get(x + dx, y + h - 1 + dy, z + dz) === B.AIR) V.set(x + dx, y + h - 1 + dy, z + dz, leaf); } }
  } else if (kind === 'pine') {
    const h = 5 + Math.floor(r() * 3); V.col(x, z, y, y + 1, B.WOOD);
    for (let dy = 1; dy < h; dy++) { const rad = Math.max(0, Math.round((h - dy) / 2.2)); for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) if (Math.abs(dx) + Math.abs(dz) <= rad) V.set(x + dx, y + dy, z + dz, B.PINE); }
    if (M.th.g === B.SNOW) V.set(x, y + h, z, B.SNOW);
  } else if (kind === 'palm') {
    const h = 4 + Math.floor(r() * 2); V.col(x, z, y, y + h - 1, B.WOOD);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]) V.set(x + dx, y + h - (Math.abs(dx + dz) === 2 ? 1 : 0), z + dz, B.LEAF2);
    V.set(x, y + h, z, B.LEAF2);
  } else if (kind === 'dead') {
    const h = 2 + Math.floor(r() * 3); V.col(x, z, y, y + h - 1, B.WOOD); if (r() < 0.6) V.set(x + 1, y + h - 1, z, B.WOOD); if (r() < 0.6) V.set(x - 1, y + h - 2, z, B.WOOD);
  } else if (kind === 'cactus') {
    const h = 2 + Math.floor(r() * 2); V.col(x, z, y, y + h - 1, B.CACTUS); if (r() < 0.7) { V.set(x + 1, y + 1, z, B.CACTUS); V.set(x + 1, y + 2, z, B.CACTUS); }
  } else if (kind === 'bamboo') {
    const h = 5 + Math.floor(r() * 3); V.col(x, z, y, y + h - 1, B.BAMBOO); V.set(x, y + h, z, B.BAMLEAF); V.set(x + 1, y + h - 1, z, B.BAMLEAF); V.set(x - 1, y + h - 2, z, B.BAMLEAF);
  }
}
export function deco(M, x, z, kind) {
  const y = M.top(x, z), V = M;
  switch (kind) {
    case 'flower': V.set(x, y, z, M.r() < 0.5 ? B.RED : B.GOLD); M.set(x, y, z, B.AIR); M.set(x, y - 1, z, M.r() < 0.5 ? B.BLOSSOM : B.GOLD); break;
    case 'bush': V.set(x, y, z, B.LEAF2); break;
    case 'rock': V.set(x, y, z, B.GREY); if (M.r() < 0.4) V.set(x + 1, y, z, B.STONE); break;
    case 'reed': V.set(x, y, z, B.REED); break;
    case 'mushroom': V.set(x, y, z, B.WHITE); V.set(x, y + 1, z, B.RED); break;
    case 'crate': V.set(x, y, z, B.PLANK); break;
    case 'barrel': V.set(x, y, z, B.WOOD); break;
    case 'pot': V.set(x, y, z, B.CLAY); break;
    case 'anvil': V.set(x, y, z, B.METAL); break;
    case 'lamp': V.col(x, z, y, y + 2, B.BLACK); V.set(x, y + 3, z, B.GLOW); M.light(x + 0.5, y + 3.5, z + 0.5, '#ffd890', 0.6); break;
    case 'lantern': V.set(x, y, z, B.GREY); V.set(x, y + 1, z, B.GLOW); V.set(x, y + 2, z, B.ROOF); M.light(x + 0.5, y + 1.5, z + 0.5, '#ffc870', 0.5); break;
    case 'statue': V.col(x, z, y, y + 3, B.MARBLE); break;
    case 'crystal': V.col(x, z, y, y + 1 + Math.floor(M.r() * 2), B.CRYSTAL); M.light(x + 0.5, y + 1.5, z + 0.5, '#7af0ff', 0.4); break;
    case 'snowman': V.set(x, y, z, B.WHITE); V.set(x, y + 1, z, B.WHITE); break;
    case 'bones': V.set(x, y, z, B.WHITE); break;
    case 'icicle': V.col(x, z, y, y + 1, B.ICE); break;
    case 'shell': V.set(x, y, z, B.CORAL); break;
    case 'fence': V.set(x, y, z, B.WOOD); break;
    case 'rubble': V.set(x, y, z, B.CRACK); if (M.r() < 0.5) V.set(x, y + 1, z, B.CRACK); break;
    case 'fire': V.set(x, y, z, B.LAVA); M.light(x + 0.5, y + 1, z + 0.5, '#ff6020', 0.7); break;
    case 'pool': for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (M.top(x + dx, z + dz) === y) V.set(x + dx, y - 1, z + dz, B.WATER); break;
    case 'cactus': tree(M, x, z, 'cactus'); break;
    case 'bamboo': tree(M, x, z, 'bamboo'); break;
  }
}
// a house: walls with a door in the middle of the front, windows, a roof that steps up; front: 's' | 'n' | 'e' | 'w'
export function house(M, x0, z0, w, d, front = 's', o = {}) {
  const th = M.th, y = BASE, hgt = o.h || 4, wall = o.wall || th.wall, roof = o.roof || th.roof, trim = o.trim || th.trim;
  for (let z = z0; z < z0 + d; z++) for (let x = x0; x < x0 + w; x++) {
    const edge = x === x0 || x === x0 + w - 1 || z === z0 || z === z0 + d - 1, corner = (x === x0 || x === x0 + w - 1) && (z === z0 || z === z0 + d - 1);
    M.set(x, y - 1, z, B.PLANK);
    if (edge) for (let yy = y; yy < y + hgt; yy++) M.set(x, yy, z, corner ? trim : (yy === y + hgt - 1 ? trim : wall));
  }
  // windows
  for (let x = x0 + 1; x < x0 + w - 1; x += 2) { if (x === x0 + (w >> 1)) continue; M.set(x, y + 1, z0 + d - 1, th.win || B.BLUE); M.set(x, y + 1, z0, th.win || B.BLUE); }
  // door
  let dx, dz, ox = 0, oz = 0;
  if (front === 's') { dx = x0 + (w >> 1); dz = z0 + d - 1; oz = 1; } else if (front === 'n') { dx = x0 + (w >> 1); dz = z0; oz = -1; } else if (front === 'e') { dx = x0 + w - 1; dz = z0 + (d >> 1); ox = 1; } else { dx = x0; dz = z0 + (d >> 1); ox = -1; }
  M.set(dx, y, dz, B.WOOD); M.set(dx, y + 1, dz, B.WOOD); M.set(dx, y + 2, dz, trim);
  if (o.sign) M.prop('sign', dx + ox + (ox === 0 ? 1 : 0), dz + oz + (oz === 0 ? 1 : 0), { text: o.sign, icon: o.icon });
  // roof: flat for the desert, else stepped
  if (th.flat || o.flat) { M.box(x0, y + hgt, z0, x0 + w - 1, y + hgt, z0 + d - 1, wall); for (let x = x0; x < x0 + w; x++) { M.set(x, y + hgt + 1, z0, trim); M.set(x, y + hgt + 1, z0 + d - 1, trim); } if (front === 's') for (let x = dx - 1; x <= dx + 1; x++) M.set(x, y + 2, dz + 1, roof); }
  else for (let k = 0; ; k++) {
    const ax = x0 - 1 + k, az = z0 - 1 + k, bx = x0 + w - k, bz = z0 + d - k; if (ax > bx || az > bz) break;
    const along = w >= d; // the ridge runs along the longer side
    if (along) { if (az > bz) break; for (let x = x0 - 1; x <= x0 + w; x++) { M.set(x, y + hgt + k, az, roof); M.set(x, y + hgt + k, bz, roof); } for (let z = az + 1; z < bz; z++) { M.set(x0 - 1, y + hgt + k, z, wall); M.set(x0 + w, y + hgt + k, z, wall); } if (bz - az <= 1) break; }
    else { for (let z = z0 - 1; z <= z0 + d; z++) { M.set(ax, y + hgt + k, z, roof); M.set(bx, y + hgt + k, z, roof); } for (let x = ax + 1; x < bx; x++) { M.set(x, y + hgt + k, z0 - 1, wall); M.set(x, y + hgt + k, z0 + d, wall); } if (bx - ax <= 1) break; }
    if (th.snowRoof && k > 0) { }
  }
  if (th.snowRoof) for (let z = z0 - 1; z <= z0 + d; z++) for (let x = x0 - 1; x <= x0 + w; x++) { const t = M.top(x, z); if (M.get(x, t - 1, z) === roof) M.set(x, t, z, B.SNOW); }
  if (th.broken) for (let n = 0; n < 6; n++) { const x = x0 + Math.floor(M.r() * w), z = z0 + Math.floor(M.r() * d); for (let yy = M.top(x, z); yy > y + 2; yy--) M.set(x, yy, z, B.AIR); }
  return { door: { x: dx + ox, z: dz + oz, dir: front === 's' ? 0 : front === 'n' ? Math.PI : front === 'e' ? Math.PI / 2 : -Math.PI / 2 }, dx, dz };
}
// a market stall: a counter with an awning; the seller stands behind it
function stall(M, x, z, color) {
  const y = BASE; for (let dx = -1; dx <= 1; dx++) { M.set(x + dx, y, z, B.PLANK); M.col(x + dx, z - 1, y + 2, y + 2, color); M.set(x + dx, y + 3, z - 2, color); }
  M.col(x - 2, z, y, y + 2, B.WOOD); M.col(x + 2, z, y, y + 2, B.WOOD); M.col(x - 2, z - 2, y, y + 2, B.WOOD); M.col(x + 2, z - 2, y, y + 2, B.WOOD);
  return { x, z: z - 1 };
}
function fountain(M, cx, cz) {
  const y = BASE; for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const e = Math.abs(dx) === 2 || Math.abs(dz) === 2; if (e) M.set(cx + dx, y, cz + dz, B.MARBLE); else M.set(cx + dx, y - 1, cz + dz, B.WATER); }
  M.col(cx, cz, y - 1, y + 1, B.MARBLE); M.set(cx, y + 2, cz, B.WATER);
}

// ---------------------------------------------------------------- a town
// def: { theme, W, D, shops: { inn, item, weapon, armor, board, church }, houses, exits: { s, n, e, w: { to, at } },
//        castle, docks, river, plaza: 'fountain'|'statue'|'tree' }
export function genTown(def) {
  const W = def.W || 56, D = def.D || 48, M = new MapData(def, W, D), th = M.th, r = M.r, cx = W >> 1, cz = D >> 1;
  M.box(0, 0, 0, W - 1, BASE - 1, D - 1, th.g);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (r() < 0.12) M.set(x, BASE - 1, z, th.g2);
  // the roads: south gate to the north, and across
  const road = (x0, z0, x1, z1, w = 3) => { for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let k = -(w >> 1); k <= w >> 1; k++) { const xx = x0 === x1 ? x + k : x, zz = x0 === x1 ? z : z + k; if (M.in(xx, zz)) { M.set(xx, BASE - 1, zz, th.path); M.flags[M.i(xx, zz)] |= 4; } } };
  road(cx, 2, cx, D - 1); road(4, cz, W - 5, cz);
  for (let dz = -5; dz <= 5; dz++) for (let dx = -6; dx <= 6; dx++) { M.set(cx + dx, BASE - 1, cz + dz, th.path); }
  // the square
  if (def.plaza === 'tree') tree(M, cx, cz, th.tree === 'palm' ? 'palm' : 'oak'); else if (def.plaza === 'statue') { M.box(cx - 1, BASE, cz - 1, cx + 1, BASE, cz + 1, B.MARBLE); M.col(cx, cz, BASE + 1, BASE + 4, B.MARBLE); M.set(cx, BASE + 5, cz, B.GOLD); } else fountain(M, cx, cz);
  M.spot('plaza', cx + 3, cz + 3, 0); M.spot('plazaN', cx, cz - 4, 0); M.spot('plazaW', cx - 5, cz, Math.PI / 2); M.spot('plazaE', cx + 5, cz, -Math.PI / 2);
  // the shops: stalls around the square for items, weapons and armour; buildings for the inn and the rest
  const sh = def.shops || {};
  const stalls = [];
  if (sh.item) stalls.push(['item', '#c8282a', cx - 9, cz - 6]); if (sh.weapon) stalls.push(['weapon', '#2a5ab0', cx + 9, cz - 6]); if (sh.armor) stalls.push(['armor', '#3a8a3a', cx + 9, cz + 8]); if (sh.magic) stalls.push(['magic', '#6a3a9a', cx - 9, cz + 8]);
  for (const [k, col, x, z] of stalls) { const s = stall(M, x, z, col); M.spot('shop_' + k, s.x, s.z, 0); M.prop('sign', x + 2, z + 1, { text: { item: '道具店', weapon: '武器店', armor: '防具店', magic: '飾品店' }[k] }); }
  // buildings in the four quarters, doors toward the roads
  const lots = [];
  const qx = [[3, cx - 8], [cx + 8, W - 4]], qz = [[3, cz - 8], [cz + 8, D - 4]];
  for (const [ax, bx] of qx) for (const [az, bz] of qz) { for (let z = az; z + 6 <= bz; z += 9) for (let x = ax; x + 7 <= bx; x += 10) lots.push({ x, z, front: z < cz ? 's' : 'n' }); }
  lots.sort((a, b) => (Math.abs(a.x - cx) + Math.abs(a.z - cz)) - (Math.abs(b.x - cx) + Math.abs(b.z - cz)));
  const named = ['inn', 'church', 'board', 'smith'].filter((k) => sh[k]);
  const homes = def.houses ?? 6; let n = 0;
  if (def.castle) { // a castle at the north end, its gate on the road
    const w = 21, d = 9, x0 = cx - 10, z0 = 0; for (let z = z0; z < z0 + d; z++) for (let x = x0; x < x0 + w; x++) { const e = x === x0 || x === x0 + w - 1 || z === z0 + d - 1; if (e) M.col(x, z, BASE, BASE + 6, B.WALL); else M.col(x, z, BASE, BASE + 6, B.WALL); }
    for (const tx of [x0, x0 + w - 3]) { M.box(tx, BASE, z0 + d - 3, tx + 2, BASE + 9, z0 + d - 1, B.WALL); M.box(tx, BASE + 10, z0 + d - 3, tx + 2, BASE + 11, z0 + d - 1, th.roof); }
    M.box(cx - 3, BASE + 7, 0, cx + 3, BASE + 12, 4, B.WALL); M.box(cx - 2, BASE + 13, 1, cx + 2, BASE + 15, 3, th.roof);
    for (let x = x0; x < x0 + w; x += 2) M.set(x, BASE + 7, z0 + d - 1, B.WALL);
    M.box(cx - 1, BASE, z0 + d - 1, cx + 1, BASE + 2, z0 + d - 1, B.WOOD); M.set(cx, BASE + 3, z0 + d - 1, B.GOLD);
    M.exit(cx - 1, z0 + d, cx + 1, z0 + d, def.castle.to, def.castle.at); M.spot('castleGate', cx, z0 + d + 1, Math.PI);
    M.entry('castle', cx, z0 + d + 2, 0);
    for (let z = z0 + d; z < z0 + d + 2; z++) for (let x = cx - 2; x <= cx + 2; x++) M.set(x, BASE - 1, z, th.path);
    for (let i = lots.length - 1; i >= 0; i--) if (lots[i].z < z0 + d + 1 && Math.abs(lots[i].x + 3 - cx) < 14) lots.splice(i, 1);
  }
  for (const lot of lots) {
    const isNamed = n < named.length, kind = isNamed ? named[n] : 'home'; if (!isNamed && n - named.length >= homes) break; n++;
    const w = kind === 'church' ? 7 : 7, d = 6, hx = house(M, lot.x, lot.z, w, d, lot.front, { sign: { inn: '旅館', church: '水晶教堂', board: '懸賞公會', smith: '鍛冶屋' }[kind], roof: kind === 'church' ? B.TEAL : undefined, h: kind === 'church' ? 5 : 4 });
    M.spot(kind === 'home' ? 'home' + n : kind, hx.door.x, hx.door.z, hx.door.dir);
    if (kind !== 'home') M.spot(kind + 'Keeper', hx.door.x + 1, hx.door.z + (lot.front === 's' ? 1 : -1), hx.door.dir);
    // a path from the door to the nearest road
    const tz = lot.front === 's' ? hx.door.z : hx.door.z; for (let z = Math.min(tz, cz); z <= Math.max(tz, cz); z++) if (Math.abs(z - tz) < 4) { M.set(hx.door.x, BASE - 1, z, th.path); }
    if (def.doors?.[kind]) M.exit(hx.dx, hx.dz, hx.dx, hx.dz, def.doors[kind].to, def.doors[kind].at);
  }
  // a river with a bridge, docks on the sea
  if (def.river) { const rx = def.river; for (let z = 0; z < D; z++) for (let x = rx; x < rx + 3; x++) { M.set(x, BASE - 1, z, B.WATER); M.set(x, BASE - 2, z, B.SAND); } for (const bz of [cz - 1, cz, cz + 1]) for (let x = rx - 1; x < rx + 4; x++) M.set(x, BASE - 1, bz, B.PLANK); }
  if (def.docks) { for (let z = D - 8; z < D; z++) for (let x = 0; x < W; x++) { M.set(x, BASE - 1, z, B.WATER); M.set(x, BASE - 2, z, B.SAND); } for (let z = D - 8; z < D - 1; z++) for (let x = cx - 1; x <= cx + 1; x++) M.set(x, BASE - 1, z, B.PLANK); for (let x = cx - 8; x <= cx + 8; x++) M.set(x, BASE - 1, D - 8, B.PLANK); M.spot('dock', cx, D - 3, 0); M.entry('dock', cx, D - 4, Math.PI); M.spot('dockL', cx - 6, D - 8, 0); M.spot('dockR', cx + 6, D - 8, 0); }
  // walls round the town (a fence, a hedge), gates where the exits are
  const ring = def.wall ?? (th === THEMES.whitehawk ? B.WALL : th.trim === B.WOOD ? B.WOOD : th.wall);
  for (let x = 0; x < W; x++) for (const z of [0, D - 1]) if (!(def.docks && z === D - 1)) M.col(x, z, BASE, BASE + 1, ring);
  for (let z = 0; z < D; z++) for (const x of [0, W - 1]) if (!(def.docks && z >= D - 8)) M.col(x, z, BASE, BASE + 1, ring);
  const gate = (side, o) => {
    if (!o) return; const g = 2;
    if (side === 's') { for (let x = cx - g; x <= cx + g; x++) { M.col(x, D - 1, BASE, BASE + 1, B.AIR); M.set(x, BASE - 1, D - 1, th.path); } M.exit(cx - g, D - 1, cx + g, D - 1, o.to, o.at); M.entry('s', cx, D - 3, Math.PI); M.col(cx - g - 1, D - 1, BASE, BASE + 3, th.trim); M.col(cx + g + 1, D - 1, BASE, BASE + 3, th.trim); }
    if (side === 'n') { for (let x = cx - g; x <= cx + g; x++) M.col(x, 0, BASE, BASE + 1, B.AIR); M.exit(cx - g, 0, cx + g, 0, o.to, o.at); M.entry('n', cx, 2, 0); }
    if (side === 'w') { for (let z = cz - g; z <= cz + g; z++) M.col(0, z, BASE, BASE + 1, B.AIR); M.exit(0, cz - g, 0, cz + g, o.to, o.at); M.entry('w', 2, cz, Math.PI / 2); }
    if (side === 'e') { for (let z = cz - g; z <= cz + g; z++) M.col(W - 1, z, BASE, BASE + 1, B.AIR); M.exit(W - 1, cz - g, W - 1, cz + g, o.to, o.at); M.entry('e', W - 3, cz, -Math.PI / 2); }
  };
  for (const s of ['s', 'n', 'e', 'w']) gate(s, def.exits?.[s]);
  // greenery and street things where nothing is
  for (let k = 0; k < (def.trees ?? 26); k++) { const x = 2 + Math.floor(r() * (W - 4)), z = 2 + Math.floor(r() * (D - 4)); if (free(M, x, z, 2)) tree(M, x, z, th.tree === 'dead' ? 'dead' : th.tree); }
  for (let k = 0; k < (def.deco ?? 30); k++) { const x = 2 + Math.floor(r() * (W - 4)), z = 2 + Math.floor(r() * (D - 4)); if (free(M, x, z, 1)) deco(M, x, z, th.deco[Math.floor(r() * th.deco.length)]); }
  M.entry('center', cx, cz + 4, Math.PI);
  M.finish(); for (const s of Object.values(M.spots)) M.flags[M.i(s.x, s.z)] &= ~1;
  return M;
}
// is there nothing within d of (x, z): no road, no building, no water
function free(M, x, z, d) {
  for (let dz = -d; dz <= d; dz++) for (let dx = -d; dx <= d; dx++) { const xx = x + dx, zz = z + dz; if (!M.in(xx, zz)) return false; if (M.top(xx, zz) !== BASE) return false; const g = M.get(xx, BASE - 1, zz); if (g !== M.th.g && g !== M.th.g2) return false; }
  return true;
}

// ---------------------------------------------------------------- a field: open land with a winding path
// def: { theme, W, D, from: 's', to: 'n', exits: { s, n, e, w }, chests: n, spots: [...], landmark }
export function genField(def) {
  const W = def.W || 64, D = def.D || 80, M = new MapData(def, W, D, 20), th = M.th, r = M.r, N = noise2(hashStr(def.id));
  const hills = th.hills ?? 1;
  const hgt = new Int8Array(W * D);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) { const n = N(x / 9, z / 9) * 0.7 + N(x / 4 + 30, z / 4) * 0.3; hgt[z * W + x] = Math.floor(n * (hills + 1.4)); }
  // the path: through waypoints from each exit to the middle
  const ends = {}, cx = W >> 1, cz = D >> 1;
  const sides = { s: [cx, D - 1], n: [cx, 0], w: [0, cz], e: [W - 1, cz] };
  for (const s in def.exits || {}) ends[s] = def.exits[s].pos || sides[s];
  const path = new Uint8Array(W * D), wps = [];
  const carve = (ax, az, bx, bz) => { // a wandering line
    let x = ax, z = az; const steps = Math.abs(bx - ax) + Math.abs(bz - az);
    for (let i = 0; i < steps * 3 && (x !== bx || z !== bz); i++) {
      const dx = Math.sign(bx - x), dz = Math.sign(bz - z);
      if (dx && (!dz || r() < Math.abs(bx - x) / (Math.abs(bx - x) + Math.abs(bz - z) + 0.01) + (r() - 0.5) * 0.4)) x += dx; else if (dz) z += dz;
      for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) if (M.in(x + k, z + j)) path[(z + j) * W + x + k] = 1;
    }
  };
  const mid = def.mid || [[cx + Math.round((r() - 0.5) * W * 0.4), Math.round(D * 0.66)], [cx + Math.round((r() - 0.5) * W * 0.4), Math.round(D * 0.33)]];
  const keys = Object.keys(ends);
  for (const k of keys) { const [ex, ez] = ends[k]; const near = mid.reduce((b, m) => (Math.hypot(m[0] - ex, m[1] - ez) < Math.hypot(b[0] - ex, b[1] - ez) ? m : b), mid[0]); carve(ex, ez, near[0], near[1]); }
  for (let i = 0; i + 1 < mid.length; i++) carve(mid[i][0], mid[i][1], mid[i + 1][0], mid[i + 1][1]);
  // side branches to the chests
  const chestSpots = [];
  for (let k = 0; k < (def.chests ?? 3); k++) { const m = mid[k % mid.length], tx = Math.max(4, Math.min(W - 5, m[0] + Math.round((r() - 0.5) * W * 0.7))), tz = Math.max(4, Math.min(D - 5, m[1] + Math.round((r() - 0.5) * D * 0.3))); carve(m[0], m[1], tx, tz); chestSpots.push([tx, tz]); }
  // flatten the path and its edges
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (path[z * W + x]) hgt[z * W + x] = Math.min(hgt[z * W + x], 1);
  // lay it down
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const i = z * W + x, h = BASE + hgt[i];
    M.box(x, 0, z, x, h - 1, z, th.g === B.SNOW || th.g === B.SAND ? th.g : B.DIRT);
    M.set(x, h - 1, z, path[i] ? th.path : (r() < 0.15 ? th.g2 : th.g));
    if (path[i]) M.flags[i] |= 4;
  }
  // smooth: no step taller than one brick next to the path
  // cliffs round the edge, open at the exits
  const edge = def.edge ?? 4;
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const d = Math.min(x, z, W - 1 - x, D - 1 - z); if (d >= edge) continue;
    let open = false; for (const k of keys) { const [ex, ez] = ends[k]; if (Math.abs(ex - x) <= 2 && Math.abs(ez - z) <= edge + 1) open = true; if (Math.abs(ez - z) <= 2 && Math.abs(ex - x) <= edge + 1) open = true; }
    if (open) continue;
    if (th.float) { for (let y = 0; y < M.H; y++) M.set(x, y, z, B.AIR); continue; }
    if (th.sea && z > D * 0.5) { for (let y = BASE - 1; y < M.H; y++) M.set(x, y, z, B.AIR); M.set(x, BASE - 1, z, B.WATER); continue; }
    const top = BASE + hgt[z * W + x] + 3 + (edge - d) + Math.floor(r() * 2); M.box(x, BASE, z, x, top, z, th.cliff);
  }
  // pools and water for the swamp and the beach
  if (th.pools) for (let k = 0; k < W * D * th.pools / 20; k++) { const x = 3 + Math.floor(r() * (W - 6)), z = 3 + Math.floor(r() * (D - 6)); if (!path[z * W + x]) deco(M, x, z, 'pool'); }
  // trees and things off the path
  const dens = def.trees ?? 0.05;
  for (let z = edge; z < D - edge; z++) for (let x = edge; x < W - edge; x++) {
    let near = false; for (let dz = -2; dz <= 2 && !near; dz++) for (let dx = -2; dx <= 2; dx++) if (M.in(x + dx, z + dz) && path[(z + dz) * W + x + dx]) { near = true; break; }
    if (near) continue;
    const v = r(); if (v < dens) tree(M, x, z, th.tree); else if (v < dens + 0.03) deco(M, x, z, th.deco[Math.floor(r() * th.deco.length)]);
  }
  // exits
  for (const k of keys) {
    const [ex, ez] = ends[k], o = def.exits[k];
    if (k === 's') { M.exit(ex - 2, D - 1, ex + 2, D - 1, o.to, o.at); M.entry('s', ex, D - 3, Math.PI); }
    if (k === 'n') { M.exit(ex - 2, 0, ex + 2, 0, o.to, o.at); M.entry('n', ex, 2, 0); }
    if (k === 'w') { M.exit(0, ez - 2, 0, ez + 2, o.to, o.at); M.entry('w', 2, ez, Math.PI / 2); }
    if (k === 'e') { M.exit(W - 1, ez - 2, W - 1, ez + 2, o.to, o.at); M.entry('e', W - 3, ez, -Math.PI / 2); }
  }
  chestSpots.forEach(([x, z], i) => M.spot('chest' + i, x, z));
  mid.forEach(([x, z], i) => M.spot('mid' + i, x, z));
  M.spot('center', cx, cz);
  // a landmark: a shrine, a dungeon's door in a cliff
  if (def.door) { const [x, z] = def.door.pos; for (let dz = -3; dz <= 0; dz++) for (let dx = -3; dx <= 3; dx++) M.col(x + dx, z + dz - 1, BASE, BASE + 6, th.cliff); M.box(x - 1, BASE + hgt[z * W + x], z - 1, x + 1, BASE + 2, z - 1, B.DARK); M.box(x - 1, BASE + 3, z - 1, x + 1, BASE + 3, z - 1, def.door.trim || B.GOLD); M.exit(x - 1, z, x + 1, z, def.door.to, def.door.at); M.entry('door', x, z + 2, 0); for (let dz = 0; dz < 3; dz++) for (let dx = -1; dx <= 1; dx++) { const i = (z + dz) * W + x + dx; hgt[i] = 0; } }
  M.finish(); return M;
}

// ---------------------------------------------------------------- a dungeon floor: rooms on a grid joined by corridors
// def: { theme, cols, rows, cell, up: { to, at } (the way back), down: { to, at } (deeper) | boss: true, chests, save }
export function genDungeon(def) {
  const C = def.cell || 13, cols = def.cols || 4, rows = def.rows || 4, W = cols * C + 2, D = rows * C + 2, M = new MapData(def, W, D, 14), th = M.th, r = M.r;
  const WH = 3, top = BASE + WH;
  M.box(0, 0, 0, W - 1, top, D - 1, th.wall);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) M.set(x, top, z, th.cap === th.wall ? B.DARK : B.DARK);
  // the rooms
  const cells = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const rw = 5 + Math.floor(r() * (C - 7)), rd = 5 + Math.floor(r() * (C - 7)); const x0 = 1 + i * C + Math.floor((C - rw) / 2) + Math.floor((r() - 0.5) * 2), z0 = 1 + j * C + Math.floor((C - rd) / 2) + Math.floor((r() - 0.5) * 2); cells.push({ i, j, x0, z0, x1: x0 + rw - 1, z1: z0 + rd - 1, cx: x0 + (rw >> 1), cz: z0 + (rd >> 1), n: [] }); }
  const at = (i, j) => cells[j * cols + i];
  // a maze through the cells (every cell reached), then a few extra doors
  const seen = new Set(), stack = [at(Math.floor(cols / 2), rows - 1)]; seen.add(stack[0]);
  while (stack.length) { const c = stack[stack.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => c.i + a >= 0 && c.i + a < cols && c.j + b >= 0 && c.j + b < rows ? at(c.i + a, c.j + b) : null).filter((n) => n && !seen.has(n)); if (!nb.length) { stack.pop(); continue; } const n = nb[Math.floor(r() * nb.length)]; c.n.push(n); n.n.push(c); seen.add(n); stack.push(n); }
  for (let k = 0; k < (def.loops ?? 2); k++) { const c = cells[Math.floor(r() * cells.length)], n = [[1, 0], [0, 1]].map(([a, b]) => c.i + a < cols && c.j + b < rows ? at(c.i + a, c.j + b) : null)[Math.floor(r() * 2)]; if (n && !c.n.includes(n)) { c.n.push(n); n.n.push(c); } }
  const carve = (x0, z0, x1, z1, f) => { for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) { for (let y = BASE; y <= top; y++) M.set(x, y, z, B.AIR); M.set(x, BASE - 1, z, f ?? ((x + z) % 7 === 0 || r() < 0.08 ? th.floor2 : th.floor)); } };
  // the start and the goal: the farthest cell from the start
  const start = at(Math.floor(cols / 2), rows - 1);
  const dist = new Map([[start, 0]]), q = [start]; while (q.length) { const c = q.shift(); for (const n of c.n) if (!dist.has(n)) { dist.set(n, dist.get(c) + 1); q.push(n); } }
  let goal = start; for (const c of cells) if (dist.get(c) > dist.get(goal)) goal = c;
  if (def.boss) { goal.x0 = Math.max(goal.i * C + 2, goal.x0 - 2); goal.z0 = Math.max(goal.j * C + 2, goal.z0 - 2); goal.x1 = Math.min(goal.i * C + C - 1, goal.x1 + 2); goal.z1 = Math.min(goal.j * C + C - 1, goal.z1 + 2); goal.cx = (goal.x0 + goal.x1) >> 1; goal.cz = (goal.z0 + goal.z1) >> 1; }
  for (const c of cells) carve(c.x0, c.z0, c.x1, c.z1);
  for (const c of cells) for (const n of c.n) if (cells.indexOf(n) > cells.indexOf(c)) { const w = def.wide ? 2 : 1; carve(c.cx - (c.cx === n.cx ? 0 : 0), c.cz, n.cx, c.cz, null); carve(n.cx, c.cz, n.cx, n.cz, null); if (w > 1) { carve(c.cx, c.cz + 1, n.cx, c.cz + 1); carve(n.cx + 1, c.cz, n.cx + 1, n.cz); } }
  // a carpet to the boss
  if (def.boss) for (let z = goal.z0 + 1; z <= goal.z1 - 1; z++) M.set(goal.cx, BASE - 1, z, th.floor2);
  // ways in and out
  M.box(start.cx - 1, BASE - 1, start.z1 + 1, start.cx + 1, BASE - 1, D - 1, th.floor); for (let z = start.z1 + 1; z < D; z++) for (let x = start.cx - 1; x <= start.cx + 1; x++) for (let y = BASE; y < top; y++) M.set(x, y, z, B.AIR);
  if (def.up) { M.exit(start.cx - 1, D - 1, start.cx + 1, D - 1, def.up.to, def.up.at); }
  M.entry('up', start.cx, D - 3, Math.PI); M.entry('start', start.cx, start.cz, Math.PI);
  if (def.down) { const x = goal.cx, z = goal.z0; M.set(x, BASE - 1, z, B.DARK); M.set(x - 1, BASE - 1, z, B.DARK); M.set(x + 1, BASE - 1, z, B.DARK); M.exit(x - 1, z, x + 1, z, def.down.to, def.down.at); M.entry('down', x, z + 2, 0); M.prop('stairs', x, z); M.spot('stairs', x, z + 1, Math.PI); }
  if (def.boss) { M.spot('boss', goal.cx, goal.z0 + 2, 0); M.spot('bossFront', goal.cx, goal.z0 + 5, Math.PI); M.spot('altar', goal.cx, goal.z0 + 1, 0); M.entry('boss', goal.cx, goal.z1 - 1, Math.PI); const bx = goal.cx; M.box(bx - 1, BASE, goal.z0, bx + 1, BASE, goal.z0, th.cap); }
  if (def.boss || def.down) { // a save crystal on the way to the goal
    const before = goal.n.reduce((b, n) => (dist.get(n) < dist.get(b) ? n : b), goal.n[0]); if (before && def.save !== false) { M.prop('save', before.cx, before.cz); M.spot('save', before.cx, before.cz + 1); }
  }
  M.spot('goal', goal.cx, goal.cz); M.spot('start', start.cx, start.cz);
  // chests in the dead ends
  const ends = cells.filter((c) => c !== start && c !== goal && c.n.length === 1).sort(() => r() - 0.5);
  for (let k = 0; k < Math.min(def.chests ?? 3, ends.length); k++) M.spot('chest' + k, ends[k].cx, ends[k].z0 + 1);
  cells.forEach((c, k) => M.spot('room' + k, c.cx, c.cz));
  // pillars, torches on the walls, water channels, lava
  for (const c of cells) {
    if (c === goal && def.boss) { for (const [x, z] of [[c.x0 + 1, c.z0 + 1], [c.x1 - 1, c.z0 + 1], [c.x0 + 1, c.z1 - 1], [c.x1 - 1, c.z1 - 1]]) { M.col(x, z, BASE, top - 1, th.cap); M.light(x + 0.5, BASE + 2, z + 0.5, th.light, 0.9); } continue; }
    const kind = th.deco[Math.floor(r() * th.deco.length)];
    if (kind === 'pillar' && c.x1 - c.x0 > 5 && c.z1 - c.z0 > 5) for (const [x, z] of [[c.x0 + 1, c.z0 + 1], [c.x1 - 1, c.z0 + 1], [c.x0 + 1, c.z1 - 1], [c.x1 - 1, c.z1 - 1]]) M.col(x, z, BASE, top - 1, th.cap);
    if (kind === 'water' || kind === 'lava') { const b = kind === 'water' ? B.WATER : B.LAVA; for (let z = c.z0 + 2; z <= c.z1 - 2; z++) for (let x = c.x0 + 2; x <= c.x1 - 2; x++) if ((x - c.cx) ** 2 + (z - c.cz) ** 2 < 5 && !(x === c.cx || z === c.cz)) M.set(x, BASE - 1, z, b); if (kind === 'lava') M.light(c.cx + 0.5, BASE + 1, c.cz + 0.5, '#ff6020', 0.8); }
    if (kind === 'crystal' || kind === 'coral' || kind === 'icicle' || kind === 'statue' || kind === 'banner' || kind === 'barrel' || kind === 'crate' || kind === 'lantern' || kind === 'rock') { const x = c.x0 + 1 + Math.floor(r() * 2), z = c.z0 + 1; deco(M, x, z, kind === 'coral' ? 'shell' : kind === 'banner' ? 'statue' : kind); }
    if (r() < 0.8) { const x = c.cx, z = c.z0 - 1; if (M.get(x, BASE + 1, z) === th.wall) { M.set(x, BASE + 1, z, B.GLOW); M.light(x + 0.5, BASE + 1.6, z + 1.2, th.light, 0.7); } }
  }
  M.finish(); return M;
}

// ---------------------------------------------------------------- a room (inside a castle, an inn, a ship's deck)
export function genRoom(def) {
  const W = def.W || 17, D = def.D || 15, M = new MapData(def, W, D, 12), th = M.th, top = BASE + 4;
  M.box(0, 0, 0, W - 1, BASE - 1, D - 1, th.floor);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) { const e = x === 0 || z === 0 || x === W - 1; if (e) M.col(x, z, BASE, top, th.wall); if (z === 0) M.set(x, top, z, th.cap); }
  const cx = W >> 1;
  for (let z = 2; z < D; z++) M.set(cx, BASE - 1, z, th.floor2); for (let z = 2; z < D; z++) { M.set(cx - 1, BASE - 1, z, th.floor2); M.set(cx + 1, BASE - 1, z, th.floor2); }
  if (def.kind2 === 'throne') { M.box(cx - 2, BASE, 1, cx + 2, BASE, 3, B.RED); M.set(cx, BASE + 1, 1, B.GOLD); M.col(cx, 1, BASE + 1, BASE + 3, B.GOLD); M.spot('throne', cx, 2, 0); M.spot('king', cx, 2, 0); for (const x of [2, W - 3]) for (let z = 3; z < D - 2; z += 4) { M.col(x, z, BASE, top, B.MARBLE); M.light(x + 0.5, BASE + 3, z + 1.5, th.light, 0.6); } for (const x of [1, W - 2]) for (let z = 2; z < D - 1; z += 3) M.col(x, 0, BASE + 1, BASE + 3, B.BLUE); }
  if (def.kind2 === 'deck') { for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (x === 0 || x === W - 1) { M.col(x, z, BASE, top, B.AIR); M.set(x, BASE, z, B.WOOD); } for (let x = 0; x < W; x++) { M.col(x, 0, BASE, top, B.AIR); M.set(x, BASE, 0, B.WOOD); } M.col(cx, 4, BASE, BASE + 9, B.WOOD); for (let x = cx - 3; x <= cx + 3; x++) for (let y = BASE + 4; y < BASE + 9; y++) M.set(x, y, 5, B.WHITE); M.spot('helm', cx, D - 3, Math.PI); M.spot('bow', cx, 2, 0); }
  if (def.kind2 === 'inn') { for (let k = 0; k < 3; k++) { M.box(2 + k * 4, BASE, 2, 3 + k * 4, BASE, 4, B.RED); M.set(2 + k * 4, BASE, 2, B.WHITE); M.set(3 + k * 4, BASE, 2, B.WHITE); } M.box(W - 5, BASE, 7, W - 2, BASE, 7, B.PLANK); M.spot('keeper', W - 3, 6, 0); M.light(cx + 0.5, BASE + 3, D / 2, th.light, 1); }
  for (let z = 1; z < D - 1; z += 4) for (const x of [1, W - 2]) M.light(x + 0.5, BASE + 3, z + 0.5, th.light, 0.5);
  // the door at the front, open toward the camera
  for (let x = cx - 1; x <= cx + 1; x++) M.col(x, D - 1, BASE, top, B.AIR);
  if (def.exit) M.exit(cx - 1, D - 1, cx + 1, D - 1, def.exit.to, def.exit.at);
  M.entry('door', cx, D - 3, Math.PI); M.spot('center', cx, D >> 1); M.spot('front', cx, D - 4, Math.PI);
  M.finish(); return M;
}

