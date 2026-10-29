// The world. Land is a set of blobs (biome, centre, radius) roughened with noise; mountain ridges wall the regions
// apart; the places stand on it as little models. Some ways stay shut until the story opens them (a rockfall in a
// pass, a barrier of void, low tide, quicksand). The world is rebuilt from the flags each time you come out onto it.
import { B } from './voxel.js';
import { MapData, BASE, noise2, tree } from './mapgen.js';

export const WORLD = {
  W: 200, D: 200,
  blobs: [
    [100, 112, 44, 'grass'], [80, 140, 22, 'grass'], [62, 160, 18, 'swamp'], [128, 100, 22, 'grass'], [118, 80, 17, 'grass'], [150, 116, 22, 'badlands'], [172, 124, 13, 'badlands'],
    [134, 156, 15, 'grass'], [112, 128, 9, 'grass'], [58, 78, 20, 'darkwood'], [70, 96, 10, 'grass'], [128, 64, 9, 'mountain'],
    [95, 28, 26, 'snow'], [124, 20, 15, 'snow'], [70, 22, 12, 'snow'],
    [32, 100, 23, 'desert'], [24, 126, 16, 'desert'], [40, 76, 10, 'desert'],
    [172, 58, 15, 'sakura'], [186, 44, 10, 'sakura'], [160, 40, 8, 'sakura'],
    [150, 186, 9, 'beach'], [121, 182, 6, 'beach'], [12, 12, 6, 'void'], [184, 182, 7, 'volcano'], [18, 182, 6, 'beach'], [190, 98, 6, 'badlands'], [14, 52, 6, 'snow'],
  ],
  ridges: [[[138, 70], [141, 96], [140, 108]], [[140, 116], [143, 136], [146, 150]], [[44, 92], [47, 104]], [[160, 128], [166, 136]]],
  lakes: [[100, 92, 7], [86, 122, 3]],
  // places: id, x, z, model, the map and entry it leads to, the flag that opens it
  locs: [
    ['whitehawk', 92, 112, 'castle', 'whitehawk', 's'], ['windcanyon', 110, 96, 'field', 'windcanyon', 's'], ['windtemple', 122, 74, 'temple', 'windtemple1', 'up', 'windOpen'],
    ['reedvale', 80, 140, 'village', 'reedvale', 'n', 'ch1'], ['mistswamp', 68, 150, 'field', 'mistswamp', 'n', 'ch1'], ['sunken', 55, 166, 'temple', 'sunken1', 'up', 'ch1swamp'],
    ['forgeholm', 152, 110, 'town', 'forgeholm', 'w', 'pass_east'], ['badlands', 160, 126, 'field', 'badlands', 'n', 'ch2'], ['lavatunnel', 174, 120, 'cave', 'lava1', 'up', 'ch2mine'],
    ['bluesail', 134, 156, 'port', 'bluesail', 'n', 'ch3'], ['coralcave', 121, 181, 'cave', 'coral1', 'up', 'lowtide'], ['pirateisle', 150, 186, 'fort', 'pirateisle', 's', 'ch3pirate'],
    ['frostlamp', 92, 36, 'village', 'frostlamp', 's', 'ship'], ['icefield', 104, 26, 'field', 'icefield', 's', 'ch4'], ['icepalace', 120, 16, 'temple', 'ice1', 'up', 'ch4palace'],
    ['goldsand', 34, 96, 'town', 'goldsand', 'e', 'ch5'], ['desert', 28, 110, 'field', 'desert', 'n', 'ch5'], ['ruins', 22, 128, 'ruin', 'ruins1', 'up', 'ch5ruins'],
    ['sakura', 170, 62, 'village', 'sakura', 's', 'ch6'], ['bamboo', 182, 50, 'field', 'bamboo', 's', 'ch6'], ['thundertower', 188, 38, 'tower', 'tower1', 'up', 'ch6tower'],
    ['skyfort', 128, 64, 'fort', 'skyfort1', 'up', 'ch8fort'], ['skyisles', 62, 46, 'float', 'skyisles', 's', 'airship'],
    ['ashvillage', 70, 96, 'village', 'ashvillage', 'e', 'ch9'], ['blackforest', 58, 84, 'field', 'blackforest', 's', 'ch9'], ['shadowcastle', 46, 66, 'castle2', 'shadow1', 'up', 'ch9castle'],
    ['academy', 112, 128, 'academy', 'academy', 's', 'ch10'], ['voidtower', 100, 92, 'tower2', 'void1', 'up', 'ch11'], ['abyss', 12, 12, 'cave', 'abyss1', 'up', 'postgame'],
    ['lair_phoenix', 184, 182, 'cave', 'lair_phoenix', 'up', 'ch11'], ['lair_levia', 18, 182, 'cave', 'lair_levia', 'up', 'ch11'], ['lair_behemoth', 190, 98, 'cave', 'lair_behemoth', 'up', 'ch11'], ['lair_bahamut', 14, 52, 'cave', 'lair_bahamut', 'up', 'postgame'],
  ],
  // ways shut until a flag: [x0, z0, x1, z1, kind, flag that clears it]
  gates: [[136, 108, 146, 116, 'rock', 'pass_east'], [124, 164, 128, 177, 'tide', 'lowtide'], [36, 62, 82, 63, 'void', 'ch9'], [81, 62, 82, 100, 'void', 'ch9'], [36, 99, 82, 100, 'void', 'ch9'], [18, 116, 38, 117, 'quick', 'dashbird'], [108, 122, 116, 124, 'none', '']],
  regions: [ // encounter tables by area: [x0, z0, x1, z1, table] (the first that holds the spot)
    [36, 62, 82, 100, 'w_dark'], [60, 60, 140, 132, 'w_ardel'], [40, 130, 110, 180, 'w_reed'], [140, 90, 200, 150, 'w_forge'], [100, 140, 170, 200, 'w_coast'], [50, 0, 150, 52, 'w_frost'], [0, 60, 60, 150, 'w_sand'], [150, 20, 200, 80, 'w_sakura'], [0, 0, 200, 200, 'w_sea'],
  ],
};
export const regionAt = (x, z) => { for (const [x0, z0, x1, z1, t] of WORLD.regions) if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return t; return 'w_sea'; };
const BI = ['sea', 'grass', 'swamp', 'badlands', 'snow', 'desert', 'sakura', 'darkwood', 'beach', 'void', 'volcano', 'mountain'];
export function genWorld(def, flags = {}) {
  const Wd = WORLD, W = Wd.W, D = Wd.D, M = new MapData({ ...def, theme: 'plains' }, W, D, 22), N = noise2(77), N2 = noise2(91), r = M.r;
  const biome = new Uint8Array(W * D), elev = new Float32Array(W * D);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    let best = 0, bb = 0; const n = (N(x / 12, z / 12) - 0.5) * 0.5 + (N2(x / 5, z / 5) - 0.5) * 0.18;
    for (const [bx, bz, br, b] of Wd.blobs) { const d = 1 - Math.hypot(x - bx, z - bz) / br + n; if (d > best) { best = d; bb = BI.indexOf(b); } }
    biome[z * W + x] = best > 0 ? bb : 0; elev[z * W + x] = best;
  }
  for (const [lx, lz, lr] of Wd.lakes) for (let z = lz - lr - 2; z <= lz + lr + 2; z++) for (let x = lx - lr - 2; x <= lx + lr + 2; x++) if (M.in(x, z) && Math.hypot(x - lx, z - lz) < lr + (N(x / 3, z / 3) - 0.5) * 2) biome[z * W + x] = 0;
  const ridge = new Uint8Array(W * D);
  for (const line of Wd.ridges) for (let k = 0; k + 1 < line.length; k++) { const [ax, az] = line[k], [bx, bz] = line[k + 1], n = Math.ceil(Math.hypot(bx - ax, bz - az)); for (let t = 0; t <= n; t++) { const x = Math.round(ax + (bx - ax) * t / n), z = Math.round(az + (bz - az) * t / n); for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dz * dz <= 9 && M.in(x + dx, z + dz) && biome[(z + dz) * W + x + dx]) ridge[(z + dz) * W + x + dx] = 1; } }
  const TOP = { grass: [B.GRASS, B.LEAF2], swamp: [B.MOSS, B.MUD], badlands: [B.CLIFF, B.CLAY], snow: [B.SNOW, B.WHITE], desert: [B.SAND, B.SANDSTONE], sakura: [B.GRASS, B.BLOSSOM], darkwood: [B.DGRASS, B.MUD], beach: [B.SAND, B.SAND], void: [B.OBSIDIAN, B.VOID], volcano: [B.OBSIDIAN, B.CLIFF], mountain: [B.STONE, B.GREY] };
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const i = z * W + x, b = BI[biome[i]];
    if (b === 'sea') { M.box(x, 0, z, x, BASE - 2, z, B.SAND); M.set(x, BASE - 1, z, B.WATER); continue; }
    const coast = elev[i] < 0.08, hgt = coast ? 0 : (b === 'mountain' || b === 'volcano' ? 3 + Math.floor(elev[i] * 8) : Math.min(1, Math.floor(elev[i] * 3)));
    const h = BASE + hgt, [t1, t2] = coast && b !== 'snow' && b !== 'void' ? [B.SAND, B.SAND] : TOP[b];
    M.box(x, 0, z, x, h - 2, z, B.DIRT); M.set(x, h - 1, z, r() < 0.2 ? t2 : t1);
    if (ridge[i]) { const rh = h + 3 + Math.floor(N(x / 2, z / 2) * 3); M.box(x, h, z, x, rh, z, B.STONE); if (rh > h + 4) M.set(x, rh, z, b === 'snow' ? B.SNOW : B.GREY); }
  }
  // the academy's mesa: cliffs all round (only the airship goes up)
  for (let z = 118; z < 139; z++) for (let x = 102; x < 123; x++) { const d = Math.hypot(x - 112, z - 128); if (d < 9.5 && biome[z * W + x]) { M.box(x, BASE, z, x, BASE + 5, z, B.CLIFF); M.set(x, BASE + 5, z, d > 8 ? B.CLIFF : B.GRASS); } }
  // the sky isles float over the western sea
  for (const [ix, iz, ir] of [[62, 46, 6], [52, 55, 3], [72, 53, 3]]) for (let z = iz - ir; z <= iz + ir; z++) for (let x = ix - ir; x <= ix + ir; x++) { const d = Math.hypot(x - ix, z - iz); if (d <= ir) { const depth = Math.round((ir - d) * 0.9) + 1; M.box(x, 14 - depth, z, x, 13, z, B.STONE); M.set(x, 13, z, B.GRASS); } }
  // places
  const locs = []; const open = (f) => !f || !!flags[f];
  const always = new Set(['skyfort', 'academy', 'shadowcastle', 'icepalace', 'thundertower', 'ruins', 'sunken', 'lavatunnel', 'pirateisle', 'bluesail', 'forgeholm', 'goldsand', 'frostlamp', 'sakura', 'reedvale', 'windtemple', 'ashvillage']);
  for (const [id, x, z, model, to, at, f] of Wd.locs) {
    if (!open(f)) { if (always.has(id)) placeModel(M, x, z, model, r, id === 'academy' ? BASE + 6 : null); continue; }
    const y0 = id === 'academy' ? BASE + 6 : id === 'skyisles' ? 14 : null;
    placeModel(M, x, z, model, r, y0); locs.push({ id, x, z, to, at, model });
    M.exit(x - 1, z + 1, x + 1, z + 2, to, at, { loc: id }); M.entry(id, x, z + 4, 0);
  }
  M.locs = locs;
  // trees, kept off the places and their doorsteps
  const forest = { grass: ['oak', 0.025], swamp: ['dead', 0.05], badlands: ['dead', 0.012], snow: ['pine', 0.06], desert: ['cactus', 0.012], sakura: ['sakura', 0.05], darkwood: ['pine', 0.15], beach: ['palm', 0.03] };
  for (let z = 2; z < D - 2; z++) for (let x = 2; x < W - 2; x++) {
    const i = z * W + x, b = BI[biome[i]], f = forest[b]; if (!f || ridge[i] || elev[i] < 0.1) continue;
    if (Wd.locs.some((l) => Math.abs(l[1] - x) < 7 && Math.abs(l[2] - z) < 9)) continue;
    if (M.top(x, z) > BASE + 1) continue;
    if (r() < f[1]) tree(M, x, z, f[0]);
  }
  // gates
  for (const [x0, z0, x1, z1, kind, f] of Wd.gates) {
    if (!f || flags[f]) continue;
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
      if (!biome[z * W + x] && kind !== 'tide') continue;
      const t = M.top(x, z);
      if (kind === 'rock' && !ridge[z * W + x]) M.box(x, t, z, x, t + 2, z, B.CRACK);
      if (kind === 'void') M.box(x, t, z, x, t + 4, z, B.VOID);
      if (kind === 'quick') M.set(x, t - 1, z, B.MUD);
    }
  }
  if (flags.lowtide) for (let z = 163; z <= 178; z++) for (let x = 124; x <= 127; x++) if (!biome[z * W + x]) M.set(x, BASE - 1, z, B.SAND);
  M.finish();
  if (!flags.dashbird) for (let z = 116; z <= 117; z++) for (let x = 18; x <= 38; x++) if (biome[z * W + x]) M.flags[M.i(x, z)] |= 32; // quicksand: only the dashbird crosses
  for (const l of locs) for (let dz = -3; dz <= 0; dz++) for (let dx = -3; dx <= 3; dx++) M.block(l.x + dx, l.z + dz, true);
  M.biome = biome; M.BI = BI; M.world = true;
  return M;
}
function placeModel(M, x, z, model, r, y0) {
  const y = y0 ?? M.top(x, z);
  const flat = (rad) => { for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) { for (let yy = y; yy < y + 12; yy++) M.set(x + dx, yy, z + dz, B.AIR); M.set(x + dx, y - 1, z + dz, B.PATH); } };
  const mini = (hx, hz, wall, roof, h = 2) => { M.box(hx, y, hz, hx + 1, y + h - 1, hz + 1, wall); M.box(hx, y + h, hz, hx + 1, y + h, hz + 1, roof); };
  switch (model) {
    case 'castle': flat(3); M.box(x - 2, y, z - 3, x + 2, y + 2, z - 1, B.WALL); for (const [a, b] of [[-2, -3], [2, -3], [-2, -1], [2, -1]]) { M.col(x + a, z + b, y, y + 4, B.WALL); M.set(x + a, y + 5, z + b, B.BLUE); } M.col(x, z - 2, y + 3, y + 6, B.WALL); M.set(x, y + 7, z - 2, B.BLUE); M.set(x, y, z - 1, B.WOOD); M.set(x, y + 1, z - 1, B.WOOD); break;
    case 'castle2': flat(3); M.box(x - 2, y, z - 3, x + 2, y + 3, z - 1, B.OBSIDIAN); for (const [a, b] of [[-2, -3], [2, -3]]) { M.col(x + a, z + b, y, y + 6, B.OBSIDIAN); M.set(x + a, y + 7, z + b, B.PURPLE); } M.set(x, y, z - 1, B.DARK); M.set(x, y + 1, z - 1, B.DARK); break;
    case 'town': flat(3); mini(x - 3, z - 3, B.BRICK, B.ROOF); mini(x + 2, z - 3, B.BRICK, B.ROOF); mini(x - 1, z - 3, B.WALL, B.ROOF, 3); break;
    case 'village': flat(3); mini(x - 3, z - 3, B.PLANK, B.STRAW); mini(x + 2, z - 2, B.PLANK, B.STRAW); mini(x - 1, z - 3, B.PLANK, B.STRAW); break;
    case 'port': flat(3); mini(x - 3, z - 3, B.WALL, B.RED); mini(x + 2, z - 3, B.WALL, B.RED); mini(x - 1, z - 3, B.WALL, B.RED, 3); break;
    case 'cave': { for (let dz = -3; dz <= -1; dz++) for (let dx = -2; dx <= 2; dx++) M.box(x + dx, y, z + dz, x + dx, y + 2 + (dz < -1 ? 1 : 0) - (Math.abs(dx) === 2 ? 1 : 0), z + dz, B.GREY); M.set(x, y, z - 1, B.DARK); M.set(x, y + 1, z - 1, B.DARK); break; }
    case 'temple': flat(3); M.box(x - 2, y, z - 3, x + 2, y, z - 1, B.MARBLE); for (const [a, b] of [[-2, -3], [2, -3], [-2, -1], [2, -1]]) M.col(x + a, z + b, y + 1, y + 3, B.MARBLE); M.box(x - 2, y + 4, z - 3, x + 2, y + 4, z - 1, B.TEAL); M.set(x, y + 5, z - 2, B.TEAL); M.set(x, y + 1, z - 2, B.CRYSTAL); break;
    case 'tower': flat(2); M.box(x - 1, y, z - 3, x + 1, y + 9, z - 1, B.WOOD); M.box(x - 1, y + 10, z - 3, x + 1, y + 10, z - 1, B.GOLD); M.set(x, y + 11, z - 2, B.CRYSTAL); M.set(x, y, z - 1, B.DARK); M.set(x, y + 1, z - 1, B.DARK); break;
    case 'tower2': for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) if (dx * dx + dz * dz <= 16) M.box(x + dx, 0, z + dz, x + dx, BASE - 1, z + dz, B.OBSIDIAN); M.box(x - 1, BASE, z - 3, x + 1, BASE + 16, z - 1, B.VOID); M.box(x - 2, BASE + 5, z - 4, x + 2, BASE + 5, z, B.CRYSTAL); M.box(x - 2, BASE + 12, z - 4, x + 2, BASE + 12, z, B.CRYSTAL); M.set(x, BASE, z - 1, B.DARK); M.set(x, BASE + 1, z - 1, B.DARK); for (let dz = 0; dz <= 8; dz++) for (let dx = -1; dx <= 1; dx++) M.set(x + dx, BASE - 1, z + dz, B.OBSIDIAN); break;
    case 'fort': flat(3); M.box(x - 2, y, z - 3, x + 2, y + 2, z - 1, B.METAL); M.col(x - 2, z - 3, y + 3, y + 5, B.METAL); M.col(x + 2, z - 3, y + 3, y + 4, B.RUST); M.set(x, y, z - 1, B.DARK); M.set(x, y + 1, z - 1, B.DARK); break;
    case 'ruin': flat(3); for (const [a, b] of [[-2, -3], [2, -3], [-2, -1], [0, -3]]) M.col(x + a, z + b, y, y + 1 + Math.floor(r() * 3), B.SANDSTONE); M.box(x - 1, y, z - 2, x + 1, y, z - 2, B.GOLD); break;
    case 'academy': for (const [a, b] of [[-3, -3], [3, -3], [0, -4]]) { M.box(x + a - 1, y, z + b - 1, x + a + 1, y + 3, z + b + 1, B.MARBLE); M.box(x + a - 1, y + 4, z + b - 1, x + a + 1, y + 4, z + b + 1, B.PURPLE); } M.col(x, z - 4, y + 5, y + 8, B.MARBLE); M.set(x, y + 9, z - 4, B.CRYSTAL); break;
    case 'field': M.col(x - 1, z - 1, y, y + 2, B.WOOD); M.col(x + 1, z - 1, y, y + 2, B.WOOD); M.set(x, y + 2, z - 1, B.WOOD); break;
    case 'float': M.col(x, z - 2, y, y + 2, B.MARBLE); M.set(x, y + 3, z - 2, B.CRYSTAL); break;
  }
}
