// The foes. Each is drawn from a family (see engine/beasts.js) in its own colours; its numbers come from its level
// (stat() below) times a few multipliers. w weak, r resist (half), n null, a absorb — elements or blows.
//   sk: [skill, weight] it picks from; bosses have phases: [{ at: % HP, sk, say, add }] and a bigger break gauge.
//   drop [item, %], steal item, hunt: a bounty target
export const ENEMIES = {};
const list = (v) => (Array.isArray(v) ? v : (v || '').split(' ')).filter((x) => x && x !== 'none');
const E = (id, n, fam, lv, w, r, sk, o = {}) => {
  const { w: ow, r: or, n: on, a: oa, ...rest } = o;
  ENEMIES[id] = { id, n, fam, lv, ...rest, w: list(ow || w), r: list(or || r), n0: list(on), a: list(oa), sk: sk.map((s) => typeof s === 'string' ? [s, 1] : s) };
};
export function stat(e) {
  const L = e.lv, m = e.m || {};
  const hp = Math.round((40 + L * 20 + L * L * 0.45) * (e.hp || 1) * (e.boss ? 2.5 : 1)), bm = e.boss ? 1.1 : 1, pw = 10 + L * 4.0 + L * L * 0.008;
  return {
    hp, mp: 999, atk: Math.round(pw * bm * (m.atk || 1)), def: Math.round((4 + L * 1.8) * (m.def || 1)), mag: Math.round(pw * bm * (m.mag || 1)), spr: Math.round((4 + L * 1.8) * (m.spr || 1)),
    spd: Math.round((8 + L * 0.55) * (m.spd || 1) * (e.boss ? 1.5 : 1)), luk: Math.round(5 + L * 0.4),
    xp: Math.round((6 + L * L * 1.1 + L * 3) * (e.boss ? 6 : 1) * (e.xpM || 1)), gil: Math.round((5 + L * 6) * (e.boss ? 8 : 1) * (e.gilM || 1)), ep: Math.max(1, Math.round((1 + L / 5) * (e.boss ? 5 : 1))),
    brk: e.brk || Math.round((60 + L * 1.5) * (e.boss ? 5 : 1)),
  };
}

// ================================================================ prologue: the wind canyon and the wind temple (1–6)
E('slime', '綠史萊姆', 'slime', 1, 'fire', '', ['attack'], { c: ['#5ac84a', '#2a7a2a'], drop: ['jelly', 40], steal: 'potion' });
E('canyonwolf', '峽谷狼', 'wolf', 2, 'fire', '', ['attack', 'e_bite'], { c: ['#8a7a6a', '#4a3a2a'], drop: ['fang', 40], steal: 'potion' });
E('windbat', '風蝙蝠', 'bat', 2, 'shot thunder', '', ['attack', 'e_peck'], { c: ['#5a6a5a', '#9ad8a0'], drop: ['feather', 30] });
E('grassflower', '草叢花', 'plant', 3, 'fire slash', 'water', [['attack', 3], ['e_sleeppowder', 1]], { c: ['#4a9a3a', '#ff8ab0'], drop: ['antidote', 30], steal: 'antidote' });
E('goblin', '小哥布林', 'fig', 3, 'pierce', '', ['attack', 'attack', 'e_steal'], { c: ['#6a9a3a', '#6a4a2a'], kind: 'goblin', drop: ['potion', 25], steal: 'potion' });
E('windsprite', '風精', 'elemental', 4, 'earth', 'wind', [['attack', 2], ['e_aero', 2]], { c: ['#6ae88a', '#e8fff0'], a: 'wind', drop: ['ether', 15], steal: 'ether' });
E('gargoyle', '小石像鬼', 'golem', 4, 'strike', 'slash pierce', ['attack', 'e_harden'], { c: ['#8a8a8a', '#5a5a6a'], hp: 1.4, m: { def: 1.5 }, drop: ['ore', 10] });
E('templeguard', '神殿守衛', 'machine', 5, 'thunder strike', '', ['attack', 'e_double'], { c: ['#c8b890', '#6ae88a'], hp: 1.2, drop: ['potion', 30] });
E('boss_roc', '風蝕巨鷹', 'bird', 6, 'pierce ice', 'wind', [], { c: ['#7a6a5a', '#e8d0a0'], boss: true, hp: 7, scale: 2.4, brk: 220,
  ph: [{ at: 100, sk: [['attack', 3], ['e_windall', 2], ['e_peck', 2]] }, { at: 55, sk: [['e_windall', 2], ['b_gale', 1], ['attack', 2]], say: '巨鷹發出刺耳的尖嘯，羽毛像刀一樣豎起來！' }], drop: ['phoenix', 100] });

// ================================================================ chapter 1: Reedvale, the misty swamp, the sunken temple (5–11)
E('frog', '沼澤蛙', 'frog', 5, 'ice', 'water', ['attack', 'e_water'], { c: ['#5a8a3a', '#e8e0a0'], drop: ['jelly', 30], steal: 'potion' });
E('mushroom', '毒蘑菇', 'mushroom', 5, 'fire slash', '', ['attack', 'e_blindspore'], { c: ['#b8402a', '#f0e6cc'], drop: ['eyedrop', 30], steal: 'eyedrop' });
E('mudslime', '泥史萊姆', 'slime', 6, 'thunder fire', 'strike', ['attack', 'e_tackle'], { c: ['#6a5a3a', '#3a2a1a'], hp: 1.2, drop: ['jelly', 40] });
E('swampsnake', '沼澤蛇', 'serpent', 6, 'ice slash', '', ['attack', 'e_poisonbite'], { c: ['#4a7a3a', '#c8c040'], drop: ['scale', 15], steal: 'antidote' });
E('mosquito', '巨蚊', 'bug', 6, 'wind fire', '', ['e_sting', 'attack', 'e_drain'], { c: ['#5a4a3a', '#c8282a'], m: { spd: 1.4 }, drop: ['antidote', 30] });
E('willo', '鬼火', 'ghost', 7, 'light water', 'slash pierce strike', ['e_fire', 'attack'], { c: ['#7ad8ff', '#3a8aff'], drop: ['ether', 15], steal: 'ether' });
E('waterelem', '水精', 'elemental', 8, 'thunder', 'fire', [['e_water', 3], ['attack', 1], ['e_heal', 1]], { c: ['#3a8aff', '#c8f0ff'], a: 'water', drop: ['ether', 20] });
E('skeleton', '骷髏兵', 'fig', 8, 'light strike', 'pierce dark', ['attack', 'e_double'], { c: ['#f0ecd8', '#5a5a5a'], kind: 'skeleton', drop: ['potion', 30], steal: 'phoenix' });
E('fishman', '魚人', 'fig', 8, 'thunder', 'water', ['attack', 'e_water', 'e_double'], { c: ['#3a7a8a', '#c8e0a0'], kind: 'fishman', drop: ['scale', 25] });
E('boss_hydra', '沼澤九頭蛇', 'hydra', 11, 'thunder fire', 'water', [], { c: ['#3a6a3a', '#c8c040'], boss: true, hp: 7.5, scale: 2.2, brk: 300,
  ph: [{ at: 100, sk: [['e_poisonbite', 3], ['e_waterall', 2], ['attack', 2]] }, { at: 60, sk: [['e_poisonbite', 2], ['b_flood', 1], ['e_waterall', 2], ['e_heal', 1]], say: '九頭蛇的脖子又長出了兩顆頭！' }, { at: 25, sk: [['b_flood', 2], ['e_double', 2]], say: '九頭蛇瘋狂地甩著所有的頭！' }], drop: ['hipotion', 100] });

// ================================================================ chapter 2: Forgeholm, the red badlands, the lava tunnels (10–16)
E('redscorp', '赤岩蠍', 'bug', 10, 'ice water', 'earth', ['attack', 'e_sting'], { c: ['#b8502a', '#3a1a10'], kind: 'scorpion', drop: ['fang', 40], steal: 'antidote' });
E('vulture', '荒野禿鷹', 'bird', 10, 'shot ice', '', ['attack', 'e_peck', 'e_windall'], { c: ['#3a2a2a', '#e8c8a0'], drop: ['feather', 40] });
E('firelizard', '炎蜥蜴', 'lizard', 11, 'ice water', 'fire', ['attack', 'e_fire'], { c: ['#d8582a', '#ffd84a'], a: 'fire', drop: ['scale', 20], steal: 'firebomb' });
E('lavaslime', '熔岩史萊姆', 'slime', 12, 'ice water', '', ['attack', 'e_fire'], { c: ['#ff6a1a', '#5a1a0a'], a: 'fire', hp: 1.2, drop: ['firebomb', 20] });
E('minerat', '礦坑鼠', 'wolf', 11, 'fire', '', ['attack', 'e_bite', 'e_summon'], { c: ['#6a5a5a', '#e8a0a0'], scale: 0.7, kind: 'rat', drop: ['fang', 30], steal: 'potion' });
E('bomb', '炸彈怪', 'bomb', 12, 'ice water', 'fire', [['attack', 3], ['e_fire', 2], ['e_selfdestruct', 1]], { c: ['#ff8a2a', '#3a1a0a'], a: 'fire', drop: ['firebomb', 30], steal: 'firebomb' });
E('minecart', '機械礦車', 'machine', 13, 'thunder water', 'slash', ['attack', 'e_tackle', 'e_double'], { c: ['#7a6a5a', '#d8a838'], hp: 1.3, m: { def: 1.4 }, drop: ['ore', 25] });
E('rockgolem', '岩石魔像', 'golem', 13, 'strike water', 'slash pierce', ['attack', 'e_slam', 'e_harden'], { c: ['#8a6a4a', '#ff8a2a'], hp: 1.6, m: { def: 1.5, spd: 0.7 }, drop: ['ore', 35] });
E('boss_glen', '灰冕將軍 葛倫', 'fig', 14, 'pierce thunder', 'strike', [], { c: ['#5a5a66', '#9a9aa6'], kind: 'knight', boss: true, hp: 6.5, scale: 1.4, brk: 340, m: { def: 1.3 },
  ph: [{ at: 100, sk: [['attack', 3], ['e_double', 2], ['e_harden', 1]] }, { at: 50, sk: [['b_cleave', 1], ['e_double', 2], ['e_rage', 1]], say: '「哼……有點本事嘛。認真起來吧！」' }], drop: ['powerring', 100] });
E('boss_lavagolem', '熔岩巨像', 'golem', 16, 'ice water', 'fire strike', [], { c: ['#5a2a1a', '#ff6a1a'], a: 'fire', boss: true, hp: 8, scale: 2.4, brk: 420, m: { def: 1.3, spd: 0.8 },
  ph: [{ at: 100, sk: [['e_slam', 3], ['e_fireall', 2], ['attack', 2]] }, { at: 60, sk: [['b_crush', 1], ['e_fireall', 2], ['e_slam', 2]], say: '熔岩巨像的身體裂開，岩漿噴了出來！' }, { at: 25, sk: [['b_breath', 1], ['b_crush', 1], ['e_slam', 1]], say: '巨像的核心燒得發白——快破壞它！' }], drop: ['hipotion', 100] });

// ================================================================ chapter 3: Bluesail, the sea, the coral cave, the pirates' isle (15–21)
E('gull', '海鷗', 'bird', 15, 'shot thunder', '', ['attack', 'e_peck', 'e_steal'], { c: ['#f0f0f0', '#e8a838'], scale: 0.8, drop: ['feather', 40], steal: 'potion' });
E('hermit', '寄居蟹', 'crab', 15, 'thunder strike', 'slash water', ['attack', 'e_harden', 'e_double'], { c: ['#e86a3a', '#d8c8a0'], m: { def: 1.5 }, drop: ['scale', 25] });
E('sharkman', '鯊魚人', 'fish', 16, 'thunder', 'water', ['attack', 'e_bite', 'e_waterall'], { c: ['#5a7a9a', '#f0f0f0'], drop: ['scale', 30], steal: 'hipotion' });
E('pirate', '海賊', 'fig', 16, 'none', '', ['attack', 'e_double', 'e_steal'], { c: ['#8a2a2a', '#3a3a3a'], kind: 'pirate', w: ['shot'], drop: ['potion', 40], steal: 'boltbomb', gilM: 2 });
E('coralimp', '珊瑚魔', 'plant', 17, 'fire thunder', 'water', ['attack', 'e_sleeppowder', 'e_water'], { c: ['#f07a8a', '#ffe0e0'], drop: ['remedy', 10] });
E('jelly', '電水母', 'jellyfish', 17, 'earth', 'water', ['attack', 'e_paralyze', 'e_boltall'], { c: ['#c8a8ff', '#ffffff'], a: 'thunder', drop: ['boltbomb', 20], steal: 'ether' });
E('seaserpent', '海蛇', 'serpent', 18, 'thunder', 'water fire', ['attack', 'e_bite', 'e_waterall'], { c: ['#2a5a8a', '#7ad8ff'], hp: 1.3, drop: ['scale', 40] });
E('giantcrab', '巨蟹', 'crab', 18, 'thunder', 'slash pierce water', ['attack', 'e_slam', 'e_harden'], { c: ['#c8282a', '#f0d0a0'], hp: 1.5, scale: 1.4, m: { def: 1.6 }, drop: ['scale', 40] });
E('boss_hook', '鐵鉤船長', 'fig', 19, 'thunder light', '', [], { c: ['#2a2a4a', '#c8282a'], kind: 'pirate', boss: true, hp: 7, scale: 1.4, brk: 420,
  ph: [{ at: 100, sk: [['attack', 2], ['e_double', 3], ['e_steal', 1]] }, { at: 50, sk: [['b_execute', 1], ['e_double', 2], ['e_rage', 1], ['e_summon', 1]], say: '「小子們！給我上！」' }], summon: 'pirate', drop: ['speedboots', 100] });
E('boss_kraken', '海魔克拉肯', 'kraken', 21, 'thunder', 'water fire', [], { c: ['#7a2a5a', '#f0a0c0'], a: 'water', boss: true, hp: 9, scale: 2.6, brk: 520,
  ph: [{ at: 100, sk: [['e_double', 3], ['e_waterall', 2], ['e_blindspore', 1]] }, { at: 60, sk: [['b_flood', 1], ['e_double', 2], ['e_drain', 1]], say: '海水翻騰，觸手從四面八方伸過來！' }, { at: 30, sk: [['b_flood', 2], ['e_paralyze', 1], ['e_double', 1]], say: '克拉肯憤怒地噴出墨汁！' }], drop: ['waterring', 100] });

// ================================================================ chapter 4: the snow country, the ice palace (20–26)
E('snowwolf', '雪狼', 'wolf', 20, 'fire', 'ice', ['attack', 'e_bite', 'e_howl'], { c: ['#e8ecf6', '#7a8aa8'], drop: ['fang', 40], steal: 'hipotion' });
E('icebat', '冰蝙蝠', 'bat', 20, 'fire', 'ice', ['attack', 'e_ice', 'e_drain'], { c: ['#a8dcf0', '#3a5a8a'], drop: ['icebomb', 20] });
E('yeti', '雪人', 'golem', 21, 'fire', 'strike', ['attack', 'e_slam', 'e_iceall'], { c: ['#f4f6fa', '#a8dcf0'], a: 'ice', hp: 1.6, drop: ['hipotion', 20] });
E('iceelem', '冰精', 'elemental', 22, 'fire', 'water', ['e_ice', 'e_iceall', 'attack'], { c: ['#7ad8ff', '#ffffff'], a: 'ice', drop: ['ether', 30], steal: 'icebomb' });
E('frostgiant', '霜巨人', 'fig', 22, 'fire pierce', 'ice', ['attack', 'e_slam', 'b_crush'], { c: ['#7a9ab8', '#e8f4ff'], kind: 'giant', scale: 1.5, hp: 1.8, drop: ['ore', 40] });
E('icebug', '冰晶蟲', 'bug', 22, 'fire strike', 'ice slash', ['attack', 'e_sting', 'e_ice'], { c: ['#a8f0ff', '#3a7ab8'], drop: ['silk', 20] });
E('iceknight', '冰宮騎士', 'fig', 23, 'fire strike', 'ice slash', ['attack', 'e_double', 'e_ice'], { c: ['#a8dcf0', '#3a5a8a'], kind: 'knight', hp: 1.3, drop: ['hipotion', 30], steal: 'icering' });
E('iceeye', '冰之眼', 'eye', 23, 'fire', 'ice', ['e_slowgaze', 'e_ice', 'attack'], { c: ['#e8f4ff', '#3a8aff'], drop: ['ether', 30] });
E('boss_cyrus1', '灰冕騎士', 'fig', 24, 'none', 'wind water', [], { c: ['#5a5a66', '#9a9aa6'], kind: 'cyrus', boss: true, hp: 6, brk: 480, m: { spd: 1.3 },
  ph: [{ at: 100, sk: [['galeblade', 2], ['tidecut', 2], ['attack', 2]] }, { at: 50, sk: [['greycrown', 1], ['galeblade', 2], ['e_rage', 1]], say: '「……薇拉。妳不該來的。」' }], drop: ['lettervera', 0] });
E('boss_icedragon', '冰龍 弗洛斯', 'dragon', 26, 'fire', 'ice water', [], { c: ['#a8dcf0', '#e8f4ff'], a: 'ice', boss: true, hp: 9, scale: 2.4, brk: 620,
  ph: [{ at: 100, sk: [['e_claw', 3], ['e_iceall', 2], ['e_bite', 2]] }, { at: 60, sk: [['b_frost', 1], ['e_iceall', 2], ['e_claw', 2]], say: '冰龍展開翅膀，氣溫一下子降到冰點以下！' }, { at: 25, sk: [['b_frost', 2], ['e_slowgaze', 1], ['e_double', 1]], say: '冰龍的眼睛變成了深藍色！' }], drop: ['icering', 100] });

// ================================================================ chapter 5: the desert, the ancient ruins (25–31)
E('sandscorp', '沙漠蠍', 'bug', 25, 'water ice', 'earth', ['attack', 'e_sting', 'e_double'], { c: ['#d8a868', '#5a3a1a'], kind: 'scorpion', drop: ['fang', 40], steal: 'antidote' });
E('cactus', '仙人掌怪', 'plant', 25, 'fire slash', 'water', ['attack', 'e_double', 'e_sting'], { c: ['#4a8a3a', '#ffd84a'], kind: 'cactus', drop: ['potion', 30], m: { spd: 1.5 }, gilM: 3 });
E('sandworm', '沙蟲', 'worm', 26, 'water ice', 'earth', ['attack', 'e_bite', 'e_earthall'], { c: ['#c8945a', '#f0d0a0'], hp: 1.5, drop: ['scale', 30] });
E('mummy', '木乃伊', 'fig', 27, 'fire light', 'dark', ['attack', 'e_curse', 'e_double'], { c: ['#e8dcc0', '#5a4a3a'], kind: 'mummy', drop: ['remedy', 15], steal: 'silk' });
E('sandelem', '沙之精', 'elemental', 27, 'water wind', 'earth', ['e_earthall', 'e_rock', 'attack'], { c: ['#d8a868', '#fff0c0'], a: 'earth', drop: ['ether', 30] });
E('ancientbot', '古代機兵', 'machine', 28, 'thunder water', 'slash pierce', ['attack', 'e_double', 'e_light'], { c: ['#c8a868', '#3ab8ff'], hp: 1.3, m: { def: 1.4 }, drop: ['ore', 40], steal: 'gem' });
E('lion', '獅身獸', 'wolf', 28, 'ice', 'fire', ['attack', 'e_bite', 'e_fireall', 'e_howl'], { c: ['#d8a838', '#8a4a1a'], kind: 'lion', scale: 1.3, hp: 1.3, drop: ['fang', 50] });
E('ruinguard', '遺跡守衛', 'golem', 29, 'thunder strike', 'slash pierce earth', ['attack', 'e_slam', 'e_harden'], { c: ['#c8a868', '#7af0ff'], hp: 1.8, m: { def: 1.6, spd: 0.7 }, drop: ['gem', 10] });
E('boss_guardian', '古代守護者', 'machine', 30, 'thunder water', 'slash pierce', [], { c: ['#c8a868', '#3ab8ff'], boss: true, hp: 8.5, scale: 2.2, brk: 680, m: { def: 1.3 },
  ph: [{ at: 100, sk: [['attack', 2], ['e_light', 2], ['e_double', 2]] }, { at: 55, sk: [['b_judgment', 1], ['e_lightall', 2], ['e_harden', 1]], say: '【警告。入侵者。啟動殲滅模式。】' }], drop: ['mirrorkey', 0] });
E('boss_sandking', '沙蟲王', 'worm', 31, 'water ice', 'earth', [], { c: ['#a8743a', '#f0d0a0'], boss: true, hp: 10, scale: 2.8, brk: 720,
  ph: [{ at: 100, sk: [['e_bite', 3], ['e_earthall', 2], ['e_poisonbite', 1]] }, { at: 60, sk: [['b_quake', 1], ['e_earthall', 2], ['e_bite', 2], ['e_summon', 1]], say: '沙蟲王鑽進沙裡，地面開始震動！' }, { at: 25, sk: [['b_quake', 2], ['e_double', 2]], say: '沙蟲王張開巨口，連沙子一起吸了過來！' }], summon: 'sandworm', drop: ['earthring', 100] });

// ================================================================ chapter 6: Sakura village, the bamboo forest, the thunder tower (30–36)
E('bear', '竹林熊', 'wolf', 30, 'fire', '', ['attack', 'e_slam', 'e_howl'], { c: ['#f0f0f0', '#1c1c1c'], kind: 'bear', scale: 1.3, hp: 1.6, drop: ['fang', 50], steal: 'seed_hp' });
E('tengu', '天狗', 'bird', 30, 'shot thunder', 'wind', ['attack', 'e_windall', 'e_peck'], { c: ['#c8282a', '#3a3a3a'], drop: ['feather', 50] });
E('samurai', '鬼面武士', 'fig', 31, 'pierce', 'slash', ['attack', 'e_double', 'b_execute'], { c: ['#8a1a1a', '#1c1c1c'], kind: 'samurai', hp: 1.3, drop: ['hipotion', 30], steal: 'kotetsu' });
E('kitsune', '狐火', 'ghost', 31, 'water light', 'slash pierce fire', ['e_fire', 'e_fireall', 'e_confuse'], { c: ['#ff8a2a', '#fff0c0'], drop: ['ether', 30] });
E('thunderbug', '雷蟲', 'bug', 32, 'earth', 'thunder', ['attack', 'e_paralyze', 'e_bolt'], { c: ['#ffe24a', '#3a3a1a'], drop: ['boltbomb', 30] });
E('thunderelem', '雷精', 'elemental', 33, 'earth', 'water', ['e_bolt', 'e_boltall', 'attack'], { c: ['#ffe24a', '#ffffff'], a: 'thunder', drop: ['hiether', 10], steal: 'thunderring' });
E('puppet', '木傀儡', 'machine', 33, 'fire', 'pierce', ['attack', 'e_double', 'e_confuse'], { c: ['#c8945a', '#c8282a'], kind: 'puppet', drop: ['silk', 30] });
E('thunderbird', '雷鳥', 'bird', 33, 'earth shot', 'thunder wind', ['e_boltall', 'e_peck', 'attack'], { c: ['#3a3a8a', '#ffe24a'], hp: 1.3, drop: ['feather', 50] });
E('boss_yoru', '影之刃', 'fig', 32, 'light', 'dark', [], { c: ['#2a2a3a', '#8a2a3a'], kind: 'yoru', boss: true, hp: 6.5, brk: 640, m: { spd: 1.4 },
  ph: [{ at: 100, sk: [['iai', 2], ['shadowbind', 2], ['shuriken', 2]] }, { at: 50, sk: [['mumyo', 1], ['mirage', 1], ['iai', 2]], say: '「……你們的眼睛，跟那個人很像。」' }], drop: ['sakuracharm', 0] });
E('boss_raijuu', '雷神獸', 'wolf', 36, 'earth', 'thunder wind', [], { c: ['#3a3a8a', '#ffe24a'], kind: 'raijuu', a: 'thunder', boss: true, hp: 9, scale: 2.4, brk: 820,
  ph: [{ at: 100, sk: [['e_bite', 2], ['e_boltall', 2], ['e_paralyze', 2]] }, { at: 60, sk: [['b_storm', 1], ['e_boltall', 2], ['e_rage', 1]], say: '雷神獸全身的毛都豎了起來，雷光四射！' }, { at: 25, sk: [['b_storm', 2], ['e_double', 2]], say: '雷神獸仰天長嘯，整座塔都在震動！' }], drop: ['thunderring', 100] });

// ================================================================ chapter 7: Whitehawk falls, the sewers (35–40)
E('sewerrat', '巨鼠', 'wolf', 35, 'fire', '', ['attack', 'e_poisonbite', 'e_summon'], { c: ['#5a5a4a', '#e8a0a0'], scale: 0.8, kind: 'rat', drop: ['fang', 40], steal: 'antidote' });
E('sludge', '腐泥史萊姆', 'slime', 35, 'fire light', 'strike', ['attack', 'e_poisonbite', 'e_blindspore'], { c: ['#5a6a2a', '#a050ff'], hp: 1.4, drop: ['remedy', 15] });
E('croc', '下水道鱷魚', 'lizard', 36, 'thunder ice', 'water', ['attack', 'e_bite', 'e_slam'], { c: ['#3a5a3a', '#c8c890'], scale: 1.4, hp: 1.4, drop: ['scale', 40] });
E('cultist', '教團士兵', 'fig', 36, 'pierce', '', ['attack', 'e_double', 'e_harden'], { c: ['#4a4a56', '#9a9aa6'], kind: 'cultist', drop: ['hipotion', 30], steal: 'hipotion' });
E('cultmage', '教團魔導士', 'fig', 37, 'pierce slash', '', ['e_fire', 'e_ice', 'e_bolt', 'e_healall'], { c: ['#3a3a4a', '#a050ff'], kind: 'cultmage', drop: ['ether', 40], steal: 'magicring' });
E('moth', '毒蛾', 'bug', 36, 'fire wind', '', ['e_sleeppowder', 'e_sting', 'e_blindspore'], { c: ['#8a6aa8', '#e8d0f0'], kind: 'moth', drop: ['silk', 40] });
E('boss_warden', '機械獄卒', 'machine', 40, 'thunder water', 'slash pierce', [], { c: ['#4a4a56', '#ff3a3a'], boss: true, hp: 10, scale: 2.2, brk: 900, m: { def: 1.4 },
  ph: [{ at: 100, sk: [['e_double', 2], ['e_bolt', 2], ['e_paralyze', 2]] }, { at: 55, sk: [['b_crush', 1], ['e_boltall', 2], ['e_harden', 1], ['e_summon', 1]], say: '【逃獄者確認。全區封鎖。】' }], summon: 'cultist', drop: ['protectcharm', 100] });

// ================================================================ chapter 8: the sky pirates' fortress, the floating isles, the temple of light (39–46)
E('skypirate', '空賊', 'fig', 39, 'thunder', '', ['attack', 'e_double', 'e_steal', 'e_bolt'], { c: ['#3a3a5a', '#c8a040'], kind: 'pirate', drop: ['hipotion', 40], steal: 'hiether', gilM: 2 });
E('wyvern', '飛龍', 'dragon', 40, 'ice pierce', 'wind', ['attack', 'e_bite', 'e_windall'], { c: ['#5a8a5a', '#e8d0a0'], scale: 1.2, hp: 1.5, drop: ['scale', 50] });
E('cloudelem', '雲精', 'elemental', 41, 'earth', 'water wind', ['e_aero', 'e_windall', 'e_water'], { c: ['#f4f6fa', '#a8dcf0'], a: 'wind', drop: ['hiether', 15] });
E('griffin', '獅鷲', 'bird', 41, 'shot ice', 'wind', ['attack', 'e_claw', 'e_windall'], { c: ['#d8a838', '#f0f0f0'], scale: 1.3, hp: 1.4, drop: ['feather', 60] });
E('angelstatue', '天使像', 'golem', 42, 'dark strike', 'light slash pierce', ['attack', 'e_light', 'e_lightall'], { c: ['#ecebe4', '#ffd84a'], hp: 1.6, m: { def: 1.5 }, drop: ['gem', 15] });
E('lighteye', '光之眼', 'eye', 42, 'dark', 'light', ['e_light', 'e_lightall', 'e_slowgaze'], { c: ['#fff4c0', '#d8a838'], a: 'light', drop: ['holywater', 20] });
E('mine', '浮游機雷', 'bomb', 43, 'thunder', 'fire', [['attack', 2], ['e_selfdestruct', 1]], { c: ['#5a5a66', '#ff3a3a'], drop: ['boltbomb', 30] });
E('boss_ironwing', '鐵翼伯爵', 'fig', 41, 'thunder ice', 'wind', [], { c: ['#2a2a3a', '#c8a040'], kind: 'count', boss: true, hp: 8, scale: 1.5, brk: 860,
  ph: [{ at: 100, sk: [['e_double', 2], ['e_windall', 2], ['e_steal', 1]] }, { at: 50, sk: [['b_gale', 1], ['e_double', 2], ['e_rage', 1], ['e_summon', 1]], say: '「銀翼號是我的！誰都別想帶走！」' }], summon: 'skypirate', drop: ['airshipkey', 0] });
E('boss_fallen', '墮天使 露西爾', 'fig', 46, 'dark', 'light', [], { c: ['#f8f4ea', '#5a3a8a'], kind: 'angel', a: 'light', boss: true, hp: 10, scale: 1.8, brk: 1050,
  ph: [{ at: 100, sk: [['e_light', 2], ['e_lightall', 2], ['e_healall', 1], ['attack', 1]] }, { at: 60, sk: [['b_judgment', 1], ['e_lightall', 2], ['e_curse', 1]], say: '「光之晶……不會交給任何人……」' }, { at: 25, sk: [['b_judgment', 1], ['b_abyss', 1], ['e_doom', 1]], say: '天使的翅膀一半變成了黑色。' }], drop: ['lightring', 100] });

// ================================================================ chapter 9: the black forest, the shadow castle (44–50)
E('shadowwolf', '影狼', 'wolf', 44, 'light', 'dark', ['attack', 'e_bite', 'e_dark'], { c: ['#2a1a3a', '#a050ff'], drop: ['fang', 50], steal: 'hipotion' });
E('soulflower', '噬魂花', 'plant', 44, 'fire light', 'dark', ['e_drain', 'e_sleeppowder', 'e_darkall'], { c: ['#5a1a5a', '#ff3a8a'], drop: ['remedy', 20] });
E('vampbat', '吸血蝙蝠', 'bat', 45, 'light', 'dark', ['e_drain', 'attack', 'e_screech'], { c: ['#3a1a2a', '#c8282a'], drop: ['ether', 30] });
E('ghostknight', '幽靈騎士', 'fig', 46, 'light', 'dark slash pierce', ['attack', 'e_double', 'e_curse'], { c: ['#5a6a8a', '#a8f0ff'], kind: 'ghostknight', hp: 1.4, drop: ['hipotion', 30], steal: 'darkring' });
E('darkeye', '闇之眼', 'eye', 46, 'light', 'dark', ['e_dark', 'e_doom', 'e_darkall'], { c: ['#1c1c22', '#a050ff'], a: 'dark', drop: ['hiether', 15] });
E('reaper', '死神', 'ghost', 47, 'light', 'dark slash pierce strike', ['attack', 'e_doom', 'e_darkall'], { c: ['#1c1c22', '#e8e8f0'], kind: 'reaper', hp: 1.3, drop: ['phoenix', 40] });
E('darkelem', '闇精', 'elemental', 47, 'light', '', ['e_dark', 'e_darkall', 'e_drain'], { c: ['#3a1a5a', '#a050ff'], a: 'dark', drop: ['darkmatter', 5] });
E('boss_shadowlord', '闇之魔將 格里姆', 'fig', 50, 'light', 'dark', [], { c: ['#1c1022', '#a050ff'], kind: 'demon', boss: true, hp: 11, scale: 2.0, brk: 1200,
  ph: [{ at: 100, sk: [['e_double', 2], ['e_darkall', 2], ['e_drain', 1]] }, { at: 60, sk: [['b_abyss', 1], ['b_cleave', 1], ['e_doom', 1], ['e_darkall', 1]], say: '「莫迪恩大人的悲願……誰都不能阻止！」' }, { at: 25, sk: [['b_abyss', 2], ['e_rage', 1]], say: '魔將的鎧甲崩落，露出底下的黑霧！' }], drop: ['darkring', 100] });

// ================================================================ chapter 10: the academy city, the corridor of time (49–56)
E('acadgolem', '學院魔像', 'golem', 49, 'thunder', 'slash pierce', ['attack', 'e_slam', 'e_harden'], { c: ['#5a5a7a', '#7af0ff'], hp: 1.8, m: { def: 1.6 }, drop: ['gem', 20] });
E('grimoire', '魔導書', 'book', 50, 'fire', '', ['e_fire', 'e_ice', 'e_bolt', 'e_confuse'], { c: ['#8a2a2a', '#d8a838'], drop: ['hiether', 30], steal: 'sagering' });
E('timeghost', '時之亡靈', 'ghost', 51, 'light', 'slash pierce strike', ['e_slowgaze', 'e_drain', 'e_grav'], { c: ['#c8a8ff', '#ffffff'], drop: ['remedy', 30] });
E('mechangel', '機械天使', 'machine', 52, 'thunder dark', 'light', ['e_light', 'e_lightall', 'e_double'], { c: ['#ecebe4', '#3ab8ff'], kind: 'angelbot', hp: 1.4, drop: ['gem', 30] });
E('elderdragon', '古代龍', 'dragon', 52, 'ice', 'fire earth', ['e_claw', 'e_fireall', 'e_bite'], { c: ['#7a3a2a', '#ffd84a'], scale: 1.5, hp: 2, drop: ['dragonscale', 10] });
E('dimbug', '異次元蟲', 'bug', 53, 'light', 'dark', ['e_sting', 'e_grav', 'e_confuse'], { c: ['#3a1a5a', '#3af0a0'], drop: ['silk', 40] });
E('boss_mordain1', '大賢者 莫迪恩', 'fig', 56, 'none', 'fire ice thunder', [], { c: ['#3a2a5a', '#d8a838'], kind: 'mordain', boss: true, hp: 9, scale: 1.4, brk: 1350,
  ph: [{ at: 100, sk: [['e_fire', 1], ['e_ice', 1], ['e_bolt', 1], ['e_fireall', 1], ['e_iceall', 1], ['e_slowgaze', 1]] }, { at: 60, sk: [['b_meteor', 1], ['e_grav', 1], ['e_boltall', 1], ['e_curse', 1]], say: '「迴響是我的作品。你們手上的力量，本來就是我的。」' }, { at: 25, sk: [['b_ultima', 1], ['e_grav', 1], ['e_doom', 1]], say: '「……竟然逼我到這一步。」' }], drop: ['timekey', 0] });

// ================================================================ chapters 11–12: the void spreads, the tower of the void (54–70)
E('voidslime', '虛空史萊姆', 'slime', 54, 'light', 'dark', ['attack', 'e_drain', 'e_darkall'], { c: ['#3a1a5a', '#ff3aff'], hp: 1.5, drop: ['hiether', 20] });
E('voidwolf', '虛空狼', 'wolf', 55, 'light', 'dark', ['attack', 'e_bite', 'e_rage'], { c: ['#2a0a3a', '#ff3aff'], hp: 1.3, drop: ['fang', 50], steal: 'seed_spd' });
E('voidknight', '虛空騎士', 'fig', 57, 'light', 'dark slash', ['attack', 'e_double', 'b_execute'], { c: ['#1a0a2a', '#ff3aff'], kind: 'voidknight', hp: 1.5, drop: ['xpotion', 15] });
E('voideye', '虛無之眼', 'eye', 57, 'light', 'dark', ['e_doom', 'e_darkall', 'e_grav'], { c: ['#1a0a2a', '#ffffff'], drop: ['hiether', 25] });
E('chaoselem', '混沌元素', 'elemental', 58, 'none', '', ['e_fireall', 'e_iceall', 'e_boltall', 'e_darkall'], { c: ['#ffffff', '#ff3aff'], kind: 'chaos', drop: ['gem', 30], steal: 'elixir' });
E('endbot', '終末機兵', 'machine', 59, 'thunder', 'slash pierce', ['e_double', 'e_boltall', 'b_crush'], { c: ['#1c1c22', '#ff3a3a'], hp: 1.6, m: { def: 1.5 }, drop: ['gem', 30] });
E('voiddragon', '虛空龍', 'dragon', 61, 'light', 'dark', ['e_claw', 'e_darkall', 'e_bite'], { c: ['#1a0a2a', '#a050ff'], scale: 1.5, hp: 2, drop: ['dragonscale', 15] });
E('fallenhero', '墮落的迴響', 'fig', 62, 'light', 'dark', ['attack', 'e_double', 'e_curse', 'e_drain'], { c: ['#3a3a4a', '#a050ff'], kind: 'fallen', hp: 1.6, drop: ['echoshard', 20], steal: 'echoshard' });
E('boss_lordfire', '炎之王', 'elemental', 60, 'ice water', 'fire', [], { c: ['#ff3a1a', '#ffd84a'], a: 'fire', boss: true, hp: 9, scale: 2.4, brk: 1400, ph: [{ at: 100, sk: [['e_fireall', 2], ['e_fire', 2]] }, { at: 50, sk: [['b_breath', 1], ['e_fireall', 2]], say: '炎之王燃燒得更旺了！' }], drop: ['firering', 100] });
E('boss_lordice', '冰之王', 'elemental', 61, 'fire', 'ice water', [], { c: ['#7ad8ff', '#ffffff'], a: 'ice', boss: true, hp: 9, scale: 2.4, brk: 1400, ph: [{ at: 100, sk: [['e_iceall', 2], ['e_ice', 2], ['e_slowgaze', 1]] }, { at: 50, sk: [['b_frost', 1], ['e_iceall', 2]], say: '冰之王的寒氣凍住了空氣！' }], drop: ['icering', 100] });
E('boss_lordthunder', '雷之王', 'elemental', 62, 'earth', 'thunder', [], { c: ['#ffe24a', '#3a3a8a'], a: 'thunder', boss: true, hp: 9, scale: 2.4, brk: 1400, ph: [{ at: 100, sk: [['e_boltall', 2], ['e_paralyze', 2]] }, { at: 50, sk: [['b_storm', 1], ['e_boltall', 2]], say: '雷之王的光芒刺眼！' }], drop: ['thunderring', 100] });
E('boss_lordearth', '土之王', 'golem', 63, 'wind thunder', 'earth', [], { c: ['#8a6a3a', '#7af0ff'], a: 'earth', boss: true, hp: 10, scale: 2.6, brk: 1500, m: { def: 1.4 }, ph: [{ at: 100, sk: [['e_earthall', 2], ['e_slam', 2], ['e_harden', 1]] }, { at: 50, sk: [['b_quake', 1], ['e_earthall', 2]], say: '土之王讓整座塔都傾斜了！' }], drop: ['earthring', 100] });
E('boss_mordain2', '神化 莫迪恩', 'fig', 68, 'light', 'dark fire ice thunder', [], { c: ['#f8f4ea', '#a050ff'], kind: 'godmordain', boss: true, hp: 7, m: { mag: 0.9, atk: 0.9 }, scale: 2.2, brk: 1800,
  ph: [{ at: 100, sk: [['e_darkall', 1], ['e_lightall', 1], ['e_grav', 1], ['e_curse', 1]] }, { at: 70, sk: [['b_meteor', 1], ['b_abyss', 1], ['e_doom', 1], ['e_darkall', 1]], say: '「看吧。所有英雄的力量，都在我的身體裡歌唱！」' }, { at: 35, sk: [['b_ultima', 1], ['b_judgment', 1], ['e_grav', 1]], say: '「為什麼……為什麼迴響們不聽我的！」' }], drop: ['voidkey', 0] });
E('boss_void', '虛無', 'eye', 70, 'light', 'dark', [], { c: ['#0a0010', '#ffffff'], kind: 'void', boss: true, hp: 8, m: { mag: 0.9, atk: 0.9 }, scale: 3.2, brk: 2200,
  ph: [{ at: 100, sk: [['e_darkall', 2], ['e_grav', 1], ['e_doom', 1]] }, { at: 66, sk: [['b_void', 1], ['b_abyss', 1], ['e_darkall', 2]], say: '……………………（虛無正在把聲音吃掉。）' }, { at: 33, sk: [['b_void', 2], ['b_ultima', 1], ['e_curse', 1]], say: '小鈴：「大家！歌聲還在！迴響們都在唱！」' }], drop: [] });

// ================================================================ post-game: the endless corridor and the hidden foes (66–99)
E('trueslime', '真・史萊姆王', 'slime', 70, 'none', '', ['e_slam', 'e_waterall', 'e_heal'], { c: ['#ffd84a', '#ff3a3a'], scale: 1.6, hp: 3, drop: ['elixir', 20] });
E('truewolf', '真・魔狼', 'wolf', 72, 'light', '', ['e_bite', 'e_rage', 'e_double'], { c: ['#c8282a', '#1c1c1c'], scale: 1.3, hp: 2, drop: ['seed_atk', 8] });
E('truegolem', '真・魔像', 'golem', 75, 'thunder', 'slash pierce strike', ['e_slam', 'b_crush', 'e_harden'], { c: ['#ffd84a', '#3a3a3a'], hp: 3, m: { def: 1.8 }, drop: ['seed_hp', 8] });
E('truedragon', '真・紅龍', 'dragon', 80, 'ice', 'fire', ['e_fireall', 'e_claw', 'b_breath'], { c: ['#c8282a', '#ffd84a'], scale: 1.6, hp: 3, drop: ['dragonscale', 25] });
E('truemage', '真・魔導士', 'fig', 82, 'pierce', 'fire ice thunder', ['e_fireall', 'e_iceall', 'e_boltall', 'e_grav'], { c: ['#1c1c22', '#ffd84a'], kind: 'cultmage', hp: 2, drop: ['seed_mag', 8] });
E('trueknight', '真・黑騎士', 'fig', 85, 'light', 'dark', ['e_double', 'b_execute', 'e_curse'], { c: ['#1c1c22', '#c8282a'], kind: 'voidknight', hp: 2.5, drop: ['xpotion', 25] });
E('trueeye', '真・邪眼', 'eye', 88, 'none', '', ['e_doom', 'e_grav', 'b_void'], { c: ['#c8282a', '#ffd84a'], hp: 2, drop: ['megalixir', 5] });
E('truechaos', '真・混沌', 'elemental', 92, 'none', '', ['e_fireall', 'e_iceall', 'e_boltall', 'e_darkall', 'b_ultima'], { c: ['#000000', '#ffffff'], kind: 'chaos', hp: 3, drop: ['starfrag', 10] });
// the crystal beasts (one hides in each corner of the world after the story), the two secret echoes
E('sb_phoenix', '晶獸 不死鳥', 'bird', 75, 'ice water', 'fire', [], { c: ['#ff6a1a', '#ffd84a'], a: 'fire', boss: true, hp: 18, scale: 2.6, brk: 2500, ph: [{ at: 100, sk: [['e_fireall', 2], ['e_peck', 1], ['e_healall', 1]] }, { at: 50, sk: [['b_breath', 2], ['e_fireall', 1]], say: '不死鳥從火焰中重生！' }], drop: ['regencharm', 100] });
E('sb_leviathan', '晶獸 利維坦', 'serpent', 78, 'thunder', 'water', [], { c: ['#2a5ab0', '#7ad8ff'], a: 'water', boss: true, hp: 18, scale: 2.8, brk: 2600, ph: [{ at: 100, sk: [['e_waterall', 2], ['e_bite', 2]] }, { at: 50, sk: [['b_flood', 2], ['e_waterall', 1]], say: '海嘯捲了過來！' }], drop: ['hastecharm', 100] });
E('sb_behemoth', '晶獸 貝希摩斯', 'wolf', 82, 'ice', 'fire earth', [], { c: ['#5a2a6a', '#ffd84a'], kind: 'behemoth', boss: true, hp: 20, scale: 2.6, brk: 2800, ph: [{ at: 100, sk: [['e_slam', 2], ['e_claw', 2], ['e_rage', 1]] }, { at: 50, sk: [['b_meteor', 1], ['b_crush', 1], ['e_double', 1]], say: '貝希摩斯召來了流星！' }], drop: ['genjiglove', 100] });
E('sb_bahamut', '晶獸 巴哈姆特', 'dragon', 90, 'none', '', [], { c: ['#2a2a3a', '#7af0ff'], boss: true, hp: 24, scale: 3.0, brk: 3200, ph: [{ at: 100, sk: [['e_claw', 2], ['e_fireall', 1], ['e_darkall', 1]] }, { at: 50, sk: [['b_ultima', 1], ['b_breath', 1], ['e_double', 1]], say: '巴哈姆特張開了口——百萬兆焰！' }], drop: ['ribbon', 100] });
E('sb_stella', '星詠的試煉', 'fig', 95, 'dark', 'light', [], { c: ['#f8f8ff', '#c8d8ff'], kind: 'stella', boss: true, hp: 22, scale: 1.6, brk: 3400, m: { mag: 1.5 }, ph: [{ at: 100, sk: [['starlight', 2], ['wish', 1], ['e_lightall', 1]] }, { at: 50, sk: [['b_judgment', 1], ['ult_stella', 1], ['starlight', 1]], say: '「讓我聽聽，你們的歌。」' }], drop: ['crystalheart', 100] });
E('sb_endknight', '終焉騎士', 'fig', 99, 'light', 'dark', [], { c: ['#1a0a2a', '#5a1a8a'], kind: 'endknight', boss: true, hp: 10, scale: 1.8, brk: 4000, m: { atk: 1.0, def: 1.1 }, ph: [{ at: 100, sk: [['voidblade', 2], ['endwave', 1], ['e_double', 1]] }, { at: 60, sk: [['b_execute', 1], ['endwave', 1], ['e_rage', 1]], say: '「……你們，就是她說的那些孩子嗎。」' }, { at: 25, sk: [['ult_end', 1], ['b_void', 1], ['voidblade', 1]], say: '「來吧。讓我看看結局。」' }], drop: ['hero', 100] });

// ================================================================ bounties: rare marks, one per land (they are found in their place's fights)
E('h_kingslime', '懸賞：史萊姆國王', 'slime', 8, 'fire', '', ['e_slam', 'e_heal', 'e_summon'], { c: ['#5ac84a', '#ffd84a'], scale: 2, hp: 6, boss: true, brk: 260, summon: 'slime', hunt: 1, drop: ['powerring', 100] });
E('h_greyfang', '懸賞：灰牙', 'wolf', 14, 'fire', '', ['e_bite', 'e_howl', 'e_double'], { c: ['#5a5a6a', '#ffffff'], scale: 1.6, hp: 6, boss: true, brk: 380, hunt: 1, drop: ['hpbangle', 100] });
E('h_redcap', '懸賞：紅帽菇', 'mushroom', 18, 'fire slash', '', ['e_blindspore', 'e_sleeppowder', 'e_slam'], { c: ['#ff2a2a', '#ffffff'], scale: 1.8, hp: 6, boss: true, brk: 440, hunt: 1, drop: ['sleepless', 100] });
E('h_ghostship', '懸賞：幽靈船長', 'fig', 22, 'light', 'dark', ['e_double', 'e_curse', 'e_waterall'], { c: ['#3a5a6a', '#a8f0ff'], kind: 'ghostknight', scale: 1.4, hp: 6, boss: true, brk: 520, hunt: 1, drop: ['glasses', 100] });
E('h_mammoth', '懸賞：冰原長毛象', 'wolf', 27, 'fire', 'ice', ['e_slam', 'e_iceall', 'b_crush'], { c: ['#8a5a3a', '#f0f0f0'], kind: 'bear', scale: 2, hp: 7, boss: true, brk: 640, hunt: 1, drop: ['guardring', 100] });
E('h_goldcactus', '懸賞：黃金仙人掌', 'plant', 32, 'fire', '', ['e_double', 'e_sting', 'e_heal'], { c: ['#ffd84a', '#c8a040'], kind: 'cactus', scale: 1.6, hp: 6, boss: true, brk: 700, m: { spd: 2 }, hunt: 1, gilM: 5, drop: ['gilcharm', 100] });
E('h_nue', '懸賞：鵺', 'wolf', 37, 'earth', 'thunder', ['e_bite', 'e_boltall', 'e_confuse'], { c: ['#3a2a1a', '#ffe24a'], kind: 'lion', scale: 1.6, hp: 7, boss: true, brk: 820, hunt: 1, drop: ['antidoteamulet', 100] });
E('h_sewerking', '懸賞：下水道之王', 'lizard', 41, 'thunder', 'water', ['e_bite', 'e_slam', 'e_poisonbite'], { c: ['#2a4a2a', '#ffd84a'], scale: 2.2, hp: 7, boss: true, brk: 900, hunt: 1, drop: ['ribbonless', 100] });
E('h_skywhale', '懸賞：天空鯨', 'fish', 47, 'thunder', 'wind', ['e_slam', 'e_windall', 'e_heal'], { c: ['#7a9ab8', '#f0f0f0'], kind: 'whale', scale: 2.6, hp: 8, boss: true, brk: 1100, hunt: 1, drop: ['expcharm', 100] });
E('h_nightmare', '懸賞：夢魘', 'ghost', 52, 'light', 'dark slash pierce', ['e_sleeppowder', 'e_drain', 'e_doom'], { c: ['#1a0a2a', '#ff3aff'], scale: 1.8, hp: 8, boss: true, brk: 1200, hunt: 1, drop: ['epcharm', 100] });
E('h_tonberry', '懸賞：提燈老人', 'fig', 60, 'none', '', ['attack', 'b_execute'], { c: ['#5a8a5a', '#ffd84a'], kind: 'lantern', scale: 0.9, hp: 9, boss: true, brk: 1500, m: { atk: 1.8, spd: 0.6 }, hunt: 1, drop: ['resonator', 100] });
E('h_omega', '懸賞：歐米伽', 'machine', 80, 'thunder', 'slash pierce fire ice', ['e_boltall', 'e_double', 'b_crush', 'b_ultima'], { c: ['#c8c8d0', '#ff3a3a'], scale: 2.4, hp: 14, boss: true, brk: 2600, hunt: 1, drop: ['breakcharm', 100] });

export const enemy = (id) => ENEMIES[id];
