// Every place. kind: town | field | dungeon | room | world. Encounter groups are written 'slime*2+windbat'. Chests sit
// on the spots the generator names (chest0, chest1…): [spot, item | 'gil:300', rare?]. The story adds people and
// happenings to these places (see story/).
const M = {};
const T = (id, o) => { M[id] = { id, kind: 'town', ...o }; };
const F = (id, o) => { M[id] = { id, kind: 'field', ...o }; };
const R = (id, o) => { M[id] = { id, kind: 'room', ...o }; };
// a dungeon of n floors: id1..idN; o.last: the last floor's extra (boss), o.floors: per-floor overrides
function DG(id, n, o) {
  for (let i = 1; i <= n; i++) {
    const f = { ...o, ...(o.floors?.[i] || {}) }; delete f.floors;
    M[id + i] = { id: id + i, kind: 'dungeon', floor: i, ...f, name: `${o.name} ${n > 1 ? i + 'F' : ''}`.trim(),
      up: i === 1 ? o.entry : { to: id + (i - 1), at: 'down' }, down: i < n ? { to: id + (i + 1), at: 'up' } : null, boss: f.boss ?? (i === n && o.boss !== false), seed: (o.seed || 0) + i * 17 };
  }
}
M.world = { id: 'world', kind: 'world', name: '稜晶大陸', music: 'world' };

// ================================================================ prologue
T('whitehawk', { name: '白隼王都', theme: 'whitehawk', W: 60, D: 50, music: 'whitehawk', castle: { to: 'castle', at: 'door' }, shops: { item: 1, weapon: 1, armor: 1, inn: 1, church: 1, board: 1, smith: 1 }, houses: 6, plaza: 'statue', exits: { s: { to: 'world', at: 'whitehawk' } }, doors: { inn: { to: 'whinn', at: 'door' } },
  stock: { item: ['potion', 'antidote', 'eyedrop', 'echograss', 'phoenix', 'ether', 'tent'], weapon: [0, 1], armor: [0, 1] }, innPrice: 20 });
R('castle', { name: '白隼城 王座之間', theme: 'throne', kind2: 'throne', W: 19, D: 17, music: 'whitehawk', exit: { to: 'whitehawk', at: 'castle' } });
R('whinn', { name: '旅館「白羽亭」', theme: 'inn', kind2: 'inn', W: 15, D: 12, music: 'town', exit: { to: 'whitehawk', at: 'inn' } });
R('deck', { name: '飛空艇 白隼號', theme: 'deck', kind2: 'deck', W: 13, D: 19, music: 'airship', exit: null });
F('windcanyon', { name: '風吟峽谷', theme: 'canyon', W: 48, D: 76, music: 'field', exits: { s: { to: 'world', at: 'windcanyon' }, n: { to: 'windtemple1', at: 'up' } }, chests: [['chest0', 'potion'], ['chest1', 'gil:120'], ['chest2', 'phoenix']],
  enc: { rate: 1, groups: ['slime*2', 'canyonwolf', 'windbat*2', 'slime+canyonwolf', 'grassflower+slime', 'goblin*2', 'canyonwolf*2'] }, lv: 2 });
DG('windtemple', 2, { name: '風之神殿', theme: 'windtemple', cols: 3, rows: 3, music: 'temple', entry: { to: 'windcanyon', at: 'n' },
  enc: { rate: 1, groups: ['windsprite*2', 'gargoyle', 'templeguard', 'windsprite+windbat', 'gargoyle+windsprite', 'templeguard+windbat*2'] },
  floors: { 1: { chests: [['chest0', 'ether'], ['chest1', 'bronzesword'], ['chest2', 'potion']] }, 2: { chests: [['chest0', 'leathervest'], ['chest1', 'gil:300'], ['chest2', 'phoenix']], boss: true } } });

// ================================================================ chapter 1: the water crystal
T('reedvale', { name: '蘆葦村', theme: 'village', W: 52, D: 46, music: 'village', river: 8, shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1 }, houses: 5, plaza: 'tree', exits: { n: { to: 'world', at: 'reedvale' }, s: { to: 'mistswamp', at: 'n' } },
  stock: { item: ['potion', 'antidote', 'eyedrop', 'echograss', 'phoenix', 'ether', 'tent', 'firebomb'], weapon: [1, 2], armor: [1, 2] }, innPrice: 30 });
F('mistswamp', { name: '迷霧沼澤', theme: 'swamp', W: 56, D: 80, music: 'field2', exits: { n: { to: 'reedvale', at: 's' }, s: { to: 'sunken1', at: 'up' } }, chests: [['chest0', 'antidote'], ['chest1', 'hpbangle'], ['chest2', 'gil:400'], ['chest3', 'ether']],
  enc: { rate: 1.1, groups: ['frog*2', 'mushroom*2', 'mudslime', 'swampsnake+frog', 'mosquito*2', 'willo', 'mushroom+swampsnake', 'mudslime+mosquito'] }, lv: 6, chestsN: 4 });
DG('sunken', 3, { name: '沉沒神殿', theme: 'sunken', cols: 3, rows: 4, music: 'dungeon', entry: { to: 'mistswamp', at: 's' },
  enc: { rate: 1.1, groups: ['waterelem', 'skeleton*2', 'fishman+frog', 'willo*2', 'skeleton+waterelem', 'fishman*2', 'swampsnake*2'] },
  floors: { 1: { chests: [['chest0', 'ironspear'], ['chest1', 'potion'], ['chest2', 'echograss']] }, 2: { chests: [['chest0', 'silkrobe'], ['chest1', 'gil:500'], ['chest2', 'phoenix']] }, 3: { chests: [['chest0', 'magicring'], ['chest1', 'hipotion']] } } });

// ================================================================ chapter 2: the fire crystal
T('forgeholm', { name: '礦都 鐵爐堡', theme: 'forge', W: 56, D: 48, music: 'town', shops: { item: 1, weapon: 1, armor: 1, inn: 1, smith: 1, board: 1, magic: 1 }, houses: 6, plaza: 'statue', exits: { w: { to: 'world', at: 'forgeholm' }, e: { to: 'badlands', at: 'w' } },
  stock: { item: ['potion', 'hipotion', 'antidote', 'eyedrop', 'echograss', 'phoenix', 'ether', 'tent', 'icebomb'], weapon: [2, 3], armor: [2, 3], magic: ['powerring', 'guardring', 'antidoteamulet', 'glasses'] }, innPrice: 40 });
F('badlands', { name: '赤岩荒原', theme: 'badlands', W: 72, D: 60, music: 'field', exits: { w: { to: 'forgeholm', at: 'e' }, e: { to: 'lava1', at: 'up' } }, chests: [['chest0', 'firering'], ['chest1', 'gil:700'], ['chest2', 'hipotion'], ['chest3', 'icebomb']],
  enc: { rate: 1, groups: ['redscorp*2', 'vulture*2', 'firelizard', 'minerat*3', 'redscorp+vulture', 'firelizard+minerat', 'bomb'] }, lv: 11, chestsN: 4 });
DG('lava', 3, { name: '熔岩坑道', theme: 'lava', cols: 4, rows: 3, music: 'dungeon2', entry: { to: 'badlands', at: 'e' },
  enc: { rate: 1.1, groups: ['lavaslime*2', 'bomb*2', 'minecart', 'rockgolem', 'firelizard*2', 'minerat*2+bomb', 'rockgolem+lavaslime'] },
  floors: { 1: { chests: [['chest0', 'steelsword'], ['chest1', 'ether'], ['chest2', 'gil:600']] }, 2: { chests: [['chest0', 'warhammer'], ['chest1', 'ironarmor'], ['chest2', 'phoenix']], boss: true, bossId: 'glen' }, 3: { chests: [['chest0', 'icering'], ['chest1', 'hipotion']] } } });

// ================================================================ chapter 3: the sea
T('bluesail', { name: '港都 藍帆港', theme: 'port', W: 60, D: 52, music: 'port', docks: true, shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1, magic: 1, church: 1 }, houses: 6, plaza: 'fountain', exits: { n: { to: 'world', at: 'bluesail' } },
  stock: { item: ['potion', 'hipotion', 'antidote', 'eyedrop', 'echograss', 'phoenix', 'ether', 'remedy', 'tent', 'boltbomb'], weapon: [3, 4], armor: [3, 4], magic: ['powerring', 'magicring', 'guardring', 'sleepless', 'waterring', 'thunderring'] }, innPrice: 60 });
DG('coral', 2, { name: '珊瑚洞窟', theme: 'coral', cols: 4, rows: 3, music: 'dungeon', entry: { to: 'world', at: 'coralcave' },
  enc: { rate: 1, groups: ['hermit*2', 'sharkman', 'coralimp*2', 'jelly', 'seaserpent', 'hermit+jelly', 'giantcrab'] },
  floors: { 1: { chests: [['chest0', 'voltgun'], ['chest1', 'remedy'], ['chest2', 'gil:900']] }, 2: { chests: [['chest0', 'pirategarb'], ['chest1', 'seed_hp'], ['chest2', 'hipotion']], boss: false } } });
F('pirateisle', { name: '海賊島', theme: 'beach', W: 60, D: 70, music: 'field2', exits: { s: { to: 'bluesail', at: 'dock' }, n: { to: 'piratefort1', at: 'up' } }, chests: [['chest0', 'hiether'], ['chest1', 'gil:1200'], ['chest2', 'speedboots']],
  enc: { rate: 1, groups: ['pirate*2', 'gull*3', 'hermit+pirate', 'sharkman*2', 'pirate+gull', 'giantcrab'] }, lv: 18 });
DG('piratefort', 2, { name: '海賊要塞', theme: 'skyfort', cols: 3, rows: 3, music: 'dungeon2', entry: { to: 'pirateisle', at: 'n' },
  enc: { rate: 1.1, groups: ['pirate*3', 'pirate+sharkman', 'gull*2+pirate', 'seaserpent', 'giantcrab+pirate'] },
  floors: { 1: { chests: [['chest0', 'mythrilgun'], ['chest1', 'hipotion']] }, 2: { chests: [['chest0', 'gil:1500'], ['chest1', 'phoenix']] } } });

// ================================================================ chapter 4: the ice crystal
T('frostlamp', { name: '霜燈村', theme: 'snow', W: 50, D: 46, music: 'snow', shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1 }, houses: 5, plaza: 'tree', exits: { s: { to: 'world', at: 'frostlamp' }, n: { to: 'icefield', at: 's' } },
  stock: { item: ['potion', 'hipotion', 'remedy', 'phoenix', 'ether', 'tent', 'firebomb'], weapon: [4, 5], armor: [4, 5] }, innPrice: 80 });
F('icefield', { name: '永凍冰原', theme: 'snowfield', W: 64, D: 84, music: 'field2', exits: { s: { to: 'frostlamp', at: 'n' }, n: { to: 'ice1', at: 'up' } }, chests: [['chest0', 'firering'], ['chest1', 'gil:1500'], ['chest2', 'seed_atk'], ['chest3', 'hiether']],
  enc: { rate: 1, groups: ['snowwolf*2', 'icebat*3', 'yeti', 'iceelem', 'snowwolf+icebat', 'frostgiant', 'icebug*2'] }, lv: 21, chestsN: 4 });
DG('ice', 3, { name: '冰晶宮', theme: 'icepalace', cols: 4, rows: 4, music: 'temple', entry: { to: 'icefield', at: 'n' },
  enc: { rate: 1.1, groups: ['iceknight', 'iceeye*2', 'iceelem+icebug', 'yeti+icebat', 'iceknight+iceeye', 'frostgiant'] },
  floors: { 1: { chests: [['chest0', 'knightsword'], ['chest1', 'hipotion'], ['chest2', 'gil:1200']] }, 2: { chests: [['chest0', 'partisan'], ['chest1', 'templerobe']], boss: true, bossId: 'cyrus1' }, 3: { chests: [['chest0', 'greataxe'], ['chest1', 'elixir']] } } });

// ================================================================ chapter 5: the earth crystal
T('goldsand', { name: '金沙城', theme: 'desert', W: 58, D: 50, music: 'desert', shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1, magic: 1, church: 1 }, houses: 7, plaza: 'fountain', exits: { e: { to: 'world', at: 'goldsand' }, w: { to: 'desert', at: 'e' } },
  stock: { item: ['potion', 'hipotion', 'remedy', 'phoenix', 'ether', 'hiether', 'tent', 'icebomb'], weapon: [5, 6], armor: [5, 6], magic: ['speedboots', 'hpbangle', 'mpbangle', 'earthring', 'goldhairpin'] }, innPrice: 100 });
F('desert', { name: '大沙海', theme: 'dunes', W: 84, D: 84, music: 'field', exits: { e: { to: 'goldsand', at: 'w' } }, chests: [['chest0', 'seed_spd'], ['chest1', 'gil:2500'], ['chest2', 'mpbangle'], ['chest3', 'hiether']],
  enc: { rate: 1, groups: ['sandscorp*2', 'cactus', 'sandworm', 'mummy*2', 'sandelem', 'lion', 'sandscorp+sandelem', 'cactus*3'] }, lv: 27, chestsN: 4 });
DG('ruins', 3, { name: '古代遺跡', theme: 'ruins', cols: 4, rows: 4, music: 'dungeon2', entry: { to: 'world', at: 'ruins' },
  enc: { rate: 1.1, groups: ['mummy*2', 'ancientbot', 'ruinguard', 'sandelem+mummy', 'ancientbot*2', 'lion+mummy'] },
  floors: { 1: { chests: [['chest0', 'mythrilsword'], ['chest1', 'mythrilspear'], ['chest2', 'hipotion']] }, 2: { chests: [['chest0', 'mythrilarmor'], ['chest1', 'mythrilrobe']], boss: true, bossId: 'guardian' }, 3: { chests: [['chest0', 'mythrilhammer'], ['chest1', 'seed_mag'], ['chest2', 'elixir']] } } });

// ================================================================ chapter 6: the thunder crystal
T('sakura', { name: '櫻花鄉', theme: 'sakura', W: 54, D: 48, music: 'sakura', shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1, magic: 1 }, houses: 6, plaza: 'tree', exits: { s: { to: 'world', at: 'sakura' }, n: { to: 'bamboo', at: 's' } },
  stock: { item: ['hipotion', 'remedy', 'phoenix', 'ether', 'hiether', 'tent'], weapon: [6, 7], armor: [6, 7], magic: ['ribbonless', 'thunderring', 'critcharm', 'breakcharm'] }, innPrice: 120 });
F('bamboo', { name: '幽竹林', theme: 'bamboo', W: 60, D: 84, music: 'field2', exits: { s: { to: 'sakura', at: 'n' }, n: { to: 'tower1', at: 'up' } }, chests: [['chest0', 'seed_hp'], ['chest1', 'gil:3000'], ['chest2', 'murasame']],
  enc: { rate: 1, groups: ['bear', 'tengu*2', 'samurai', 'kitsune*2', 'bear+tengu', 'samurai+kitsune'] }, lv: 31 });
DG('tower', 4, { name: '雷鳴之塔', theme: 'tower', cols: 3, rows: 3, music: 'dungeon', entry: { to: 'bamboo', at: 'n' },
  enc: { rate: 1.1, groups: ['thunderbug*2', 'thunderelem', 'puppet*2', 'thunderbird', 'samurai+puppet', 'thunderelem+thunderbug'] },
  floors: { 1: { chests: [['chest0', 'hiether'], ['chest1', 'gil:2000']] }, 2: { chests: [['chest0', 'windspear'], ['chest1', 'shadowgarb']], boss: true, bossId: 'yoru' }, 3: { chests: [['chest0', 'sagestaff'], ['chest1', 'quakeaxe']] }, 4: { chests: [['chest0', 'stormgun'], ['chest1', 'elixir']] } } });

// ================================================================ chapter 7: Whitehawk falls
T('whitehawk_r', { name: '白隼王都（佔領）', theme: 'ruin', W: 60, D: 50, music: 'tension', castle: { to: 'castle', at: 'door' }, shops: { item: 1, inn: 1, church: 1 }, houses: 6, plaza: 'statue', exits: { s: { to: 'world', at: 'whitehawk' } },
  stock: { item: ['hipotion', 'remedy', 'phoenix', 'hiether', 'tent'] }, innPrice: 50 });
R('prison', { name: '白隼城 地牢', theme: 'sewer', W: 13, D: 11, music: 'sad', exit: null });
DG('sewer', 2, { name: '王都地下水道', theme: 'sewer', cols: 4, rows: 4, music: 'dungeon2', entry: { to: 'prison', at: 'door' },
  enc: { rate: 1.1, groups: ['sewerrat*3', 'sludge*2', 'croc', 'cultist*2', 'cultmage+cultist', 'moth*2', 'croc+sludge'] },
  floors: { 1: { chests: [['chest0', 'hipotion'], ['chest1', 'gil:2500'], ['chest2', 'yoizuki']] }, 2: { chests: [['chest0', 'crystalvest'], ['chest1', 'elixir']] } } });

// ================================================================ chapter 8: the airship, the temple of light
DG('skyfort', 3, { name: '空賊要塞', theme: 'skyfort', cols: 4, rows: 3, music: 'dungeon2', entry: { to: 'world', at: 'skyfort' },
  enc: { rate: 1.1, groups: ['skypirate*2', 'wyvern', 'mine*2', 'skypirate+mine', 'griffin', 'skypirate*3'] },
  floors: { 1: { chests: [['chest0', 'crystalgun'], ['chest1', 'hiether']] }, 2: { chests: [['chest0', 'crystalarmor'], ['chest1', 'gil:4000']] }, 3: { chests: [['chest0', 'elixir'], ['chest1', 'protectcharm']] } } });
F('skyisles', { name: '天空浮島', theme: 'skyisle', W: 60, D: 80, music: 'airship', exits: { s: { to: 'world', at: 'skyisles' }, n: { to: 'light1', at: 'up' } }, chests: [['chest0', 'seed_mag'], ['chest1', 'crystalstaff'], ['chest2', 'gil:5000']],
  enc: { rate: 1, groups: ['wyvern', 'cloudelem*2', 'griffin', 'angelstatue', 'cloudelem+griffin', 'wyvern+cloudelem'] }, lv: 41 });
DG('light', 3, { name: '光之神殿', theme: 'lighttemple', cols: 4, rows: 4, music: 'temple', entry: { to: 'skyisles', at: 'n' },
  enc: { rate: 1.1, groups: ['angelstatue', 'lighteye*2', 'cloudelem+lighteye', 'angelstatue+lighteye', 'griffin+cloudelem'] },
  floors: { 1: { chests: [['chest0', 'crystalsword'], ['chest1', 'crystalspear']] }, 2: { chests: [['chest0', 'crystalrobe'], ['chest1', 'crystalaxe'], ['chest2', 'hiether']] }, 3: { chests: [['chest0', 'lightring'], ['chest1', 'elixir']] } } });

// ================================================================ chapter 9: the shadow castle
T('ashvillage', { name: '灰燼村', theme: 'ash', W: 50, D: 44, music: 'sad', shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1, magic: 1 }, houses: 5, plaza: 'tree', exits: { e: { to: 'world', at: 'ashvillage' }, w: { to: 'blackforest', at: 'e' } },
  stock: { item: ['hipotion', 'xpotion', 'remedy', 'phoenix', 'hiether', 'tent', 'holywater'], weapon: [7, 8], armor: [7, 8], magic: ['darkring', 'lightring', 'ribbonless', 'protectcharm'] }, innPrice: 150 });
F('blackforest', { name: '黑森林', theme: 'darkwood', W: 64, D: 84, music: 'field2', exits: { e: { to: 'ashvillage', at: 'w', pos: [63, 42] }, n: { to: 'shadow1', at: 'up' } }, chests: [['chest0', 'seed_atk'], ['chest1', 'gil:6000'], ['chest2', 'nightveil'], ['chest3', 'xpotion']],
  enc: { rate: 1.1, groups: ['shadowwolf*2', 'soulflower*2', 'vampbat*3', 'ghostknight', 'shadowwolf+vampbat', 'soulflower+ghostknight'] }, lv: 45, chestsN: 4 });
DG('shadow', 3, { name: '影之城', theme: 'shadow', cols: 4, rows: 4, music: 'dungeon', entry: { to: 'blackforest', at: 'n' },
  enc: { rate: 1.1, groups: ['ghostknight*2', 'darkeye*2', 'reaper', 'darkelem', 'ghostknight+darkeye', 'reaper+vampbat'] },
  floors: { 1: { chests: [['chest0', 'dragonsword'], ['chest1', 'dragonspear']] }, 2: { chests: [['chest0', 'dragonmail'], ['chest1', 'dragoncoat'], ['chest2', 'angelrobe']] }, 3: { chests: [['chest0', 'dragonaxe'], ['chest1', 'ryujin'], ['chest2', 'megalixir']] } } });

// ================================================================ chapter 10: the academy and the corridor of time
T('academy', { name: '學院都市 艾爾德', theme: 'academy', W: 60, D: 52, music: 'town', shops: { item: 1, weapon: 1, armor: 1, inn: 1, board: 1, magic: 1, church: 1 }, houses: 7, plaza: 'fountain', exits: { s: { to: 'world', at: 'academy' }, n: { to: 'time1', at: 'up' } },
  stock: { item: ['hipotion', 'xpotion', 'remedy', 'phoenix', 'hiether', 'tent', 'holywater'], weapon: [8], armor: [8], magic: ['sagering', 'critcharm', 'breakcharm', 'hpbangle', 'mpbangle'] }, innPrice: 200 });
DG('time', 3, { name: '時之迴廊', theme: 'timecorr', cols: 4, rows: 4, music: 'tension', entry: { to: 'academy', at: 'n' },
  enc: { rate: 1.1, groups: ['acadgolem', 'grimoire*2', 'timeghost*2', 'mechangel', 'elderdragon', 'dimbug*2', 'grimoire+timeghost'] },
  floors: { 1: { chests: [['chest0', 'dragongun'], ['chest1', 'xpotion']] }, 2: { chests: [['chest0', 'angelstaff'], ['chest1', 'seed_spd'], ['chest2', 'gil:9000']] }, 3: { chests: [['chest0', 'megalixir'], ['chest1', 'hastecharm']] } } });

// ================================================================ chapters 11–12: the tower of the void
DG('void', 6, { name: '虛空之塔', theme: 'voidtower', cols: 4, rows: 4, music: 'void', entry: { to: 'world', at: 'voidtower' },
  enc: { rate: 1.1, groups: ['voidslime*2', 'voidwolf*2', 'voidknight', 'voideye*2', 'chaoselem', 'endbot', 'voiddragon', 'fallenhero', 'voidknight+voideye'] },
  floors: { 1: { chests: [['chest0', 'excalibur'], ['chest1', 'gungnir']] }, 2: { chests: [['chest0', 'songstaff'], ['chest1', 'forgefather']], boss: true, bossId: 'lordfire' }, 3: { chests: [['chest0', 'silverwing'], ['chest1', 'masamune']], boss: true, bossId: 'lordice' }, 4: { chests: [['chest0', 'whitehawk'], ['chest1', 'skyking']], boss: true, bossId: 'lordthunder' }, 5: { chests: [['chest0', 'songrobe'], ['chest1', 'megalixir']], boss: true, bossId: 'lordearth' }, 6: { chests: [['chest0', 'megalixir']], boss: true, bossId: 'mordain2' } } });

// ================================================================ the lairs of the crystal beasts, the endless corridor
for (const [id, name, theme, foe, cols] of [['lair_phoenix', '不死鳥的巢穴', 'lava', 'sb_phoenix', 3], ['lair_levia', '利維坦的海蝕洞', 'coral', 'sb_leviathan', 3], ['lair_behemoth', '貝希摩斯的獸穴', 'ruins', 'sb_behemoth', 3], ['lair_bahamut', '龍王的冰窟', 'icepalace', 'sb_bahamut', 4]])
  M[id] = { id, kind: 'dungeon', name, theme, cols, rows: 3, music: 'dungeon2', up: { to: 'world', at: id }, boss: true, bossId: foe, lair: foe, seed: id.length * 31, chests: [['chest0', 'megalixir'], ['chest1', 'elixir']],
    enc: { rate: 1, groups: id === 'lair_phoenix' ? ['truedragon', 'lavaslime*3', 'bomb*3'] : id === 'lair_levia' ? ['seaserpent*3', 'trueslime', 'jelly*3'] : id === 'lair_behemoth' ? ['truewolf*2', 'truegolem', 'lion*3'] : ['truedragon', 'trueknight', 'trueeye'] } };
for (let i = 1; i <= 20; i++) M['abyss' + i] = { id: 'abyss' + i, kind: 'dungeon', name: `無盡迴廊 第 ${i} 層`, theme: i > 15 ? 'voidtower' : i > 10 ? 'timecorr' : i > 5 ? 'shadow' : 'abyss', cols: 3 + Math.floor(i / 8), rows: 3 + Math.floor(i / 10), music: i % 5 ? 'dungeon' : 'tension', seed: i * 101,
  up: i === 1 ? { to: 'world', at: 'abyss' } : { to: 'abyss' + (i - 1), at: 'down' }, down: i < 20 && i % 5 ? { to: 'abyss' + (i + 1), at: 'up' } : null, boss: i % 5 === 0, bossId: ['', '', '', '', '', 'abyssA'][1] && null, abyssBoss: i % 5 === 0 ? ['', 'trueknight', 'sb_stella', 'truechaos', 'sb_endknight'][i / 5] : null, next: i % 5 === 0 && i < 20 ? 'abyss' + (i + 1) : null,
  chests: [['chest0', ['seed_hp', 'seed_atk', 'seed_mag', 'seed_spd', 'echoshard'][i % 5]], ['chest1', i % 2 ? 'xpotion' : 'hiether'], ['chest2', i % 4 === 0 ? 'megalixir' : 'elixir']],
  enc: { rate: 1, groups: [['trueslime', 'truewolf*2', 'truegolem'], ['truedragon', 'truemage*2', 'trueknight'], ['trueeye*2', 'truechaos', 'trueknight+truemage'], ['truechaos+trueeye', 'truedragon*2', 'trueknight*2']][Math.min(3, Math.floor((i - 1) / 5))] } };
export const MAPS = M;
// fights on the world map, by region
export const WORLD_ENC = {
  w_ardel: [['slime*2', 'canyonwolf*2', 'windbat*2', 'goblin*3', 'grassflower+goblin'], ['mushroom*2', 'frog*3', 'canyonwolf+windbat'], ['h_kingslime']],
  w_reed: [['frog*2', 'mushroom*2', 'mudslime', 'swampsnake+frog', 'mosquito*2']],
  w_forge: [['redscorp*2', 'vulture*2', 'firelizard', 'minerat*3', 'bomb+vulture']],
  w_coast: [['gull*3', 'hermit*2', 'sharkman', 'coralimp*2', 'pirate*2']],
  w_frost: [['snowwolf*2', 'icebat*3', 'yeti', 'iceelem+icebat']],
  w_sand: [['sandscorp*2', 'cactus', 'mummy*2', 'lion', 'sandelem']],
  w_sakura: [['bear', 'tengu*2', 'samurai', 'kitsune*2']],
  w_dark: [['shadowwolf*2', 'vampbat*3', 'soulflower*2', 'ghostknight']],
  w_sea: [['seaserpent', 'sharkman*2', 'jelly*2', 'giantcrab']],
  w_void: [['voidslime*2', 'voidwolf*2', 'voideye', 'fallenhero']],
};
// the bounties: posted on the boards, found in a place's fights
export const BOUNTIES = [
  { id: 'h_kingslime', where: 'windcanyon', ch: 1, reward: 1500, d: '風吟峽谷出現了巨大的史萊姆，牠會叫來同伴。' },
  { id: 'h_greyfang', where: 'badlands', ch: 2, reward: 3000, d: '赤岩荒原的灰色狼王，吃掉了礦工的便當。' },
  { id: 'h_redcap', where: 'mistswamp', ch: 3, reward: 4500, d: '迷霧沼澤深處的巨大紅蘑菇，聞了會睡著。' },
  { id: 'h_ghostship', where: 'pirateisle', ch: 3, reward: 6000, d: '海賊島附近出沒的幽靈船長，在找他的眼鏡。' },
  { id: 'h_mammoth', where: 'icefield', ch: 4, reward: 8000, d: '永凍冰原的長毛象，脾氣很差。' },
  { id: 'h_goldcactus', where: 'desert', ch: 5, reward: 6000, d: '大沙海的黃金仙人掌，跑得很快、身上有很多錢。' },
  { id: 'h_nue', where: 'bamboo', ch: 6, reward: 12000, d: '幽竹林的鵺，猴臉狸身蛇尾，會讓人混亂。' },
  { id: 'h_sewerking', where: 'sewer1', ch: 7, reward: 15000, d: '地下水道之王，一隻吃了太多東西的鱷魚。' },
  { id: 'h_skywhale', where: 'skyisles', ch: 8, reward: 20000, d: '在天空浮島游泳的鯨魚。' },
  { id: 'h_nightmare', where: 'blackforest', ch: 9, reward: 25000, d: '黑森林的夢魘，讓人做惡夢。' },
  { id: 'h_tonberry', where: 'time2', ch: 10, reward: 40000, d: '時之迴廊的提燈老人，走得很慢、刀很快。' },
  { id: 'h_omega', where: 'abyss10', ch: 13, reward: 99999, d: '無盡迴廊的古代兵器。' },
];
