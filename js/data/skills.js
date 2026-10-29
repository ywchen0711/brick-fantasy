// Every move in the game, for heroes, echoes and enemies alike.
//   k   kind: phys (atk vs def), mag (mag vs spr), heal, revive, buff, debuff, cure, steal, scan, special
//   el  element or blow: fire ice thunder water wind earth light dark | slash pierce strike shot | 'weapon' (the
//       weapon's own blow) | 'none'
//   p   power (a plain attack is 100), h hits, t target: e one foe, E all foes, r random foes (h times), a one ally,
//       A all allies, s self, ko a fallen ally
//   mp  cost, b how much each hit wears down a foe's guard (its break gauge), st statuses [name, chance %, turns]
//   x   extras: drain, hpCost, jump, cover, taunt, scan, gravity (a share of current HP), blink, mpDrain, steal,
//       pierceDef, crit, charge (telegraphed a turn ahead), ult (an echo's resonance art), syn (a duet of two echoes)
export const EL = {
  fire: '火', ice: '冰', thunder: '雷', water: '水', wind: '風', earth: '土', light: '光', dark: '暗',
  slash: '斬', pierce: '突', strike: '打', shot: '射',
};
export const EL_COLOR = { fire: '#ff6a2a', ice: '#7ad8ff', thunder: '#ffe24a', water: '#3a8aff', wind: '#6ae88a', earth: '#c8904a', light: '#fff4c0', dark: '#a050ff', slash: '#e0e4ea', pierce: '#d0d8e8', strike: '#e8c8a0', shot: '#f0d070', none: '#ffffff' };
export const ST_NAME = { poison: '中毒', sleep: '睡眠', silence: '沉默', blind: '黑暗', paralyze: '麻痺', slow: '緩速', haste: '加速', protect: '護盾', shell: '魔障', regen: '再生', atkUp: '攻擊↑', atkDown: '攻擊↓', defDown: '防禦↓', magUp: '魔力↑', magDown: '魔力↓', sprDown: '精神↓', berserk: '狂暴', taunt: '挑釁', blink: '分身', endure: '不屈', doom: '死亡宣告', stop: '停止', confuse: '混亂', critUp: '會心↑', evade: '迴避↑', reflect: '反射' };
export const BAD = ['poison', 'sleep', 'silence', 'blind', 'paralyze', 'slow', 'atkDown', 'defDown', 'magDown', 'sprDown', 'berserk', 'doom', 'stop', 'confuse'];

const SK = {};
const S = (id, n, o) => { SK[id] = { id, n, k: 'phys', el: 'weapon', p: 100, h: 1, t: 'e', mp: 0, b: 10, st: null, x: {}, fx: null, d: '', ...o }; };

// ---------------------------------------------------------------- plain acts
S('attack', '攻擊', { d: '用武器攻擊。' });
S('defend', '防禦', { k: 'special', t: 's', b: 0, d: '這回合受到的傷害減半，下次行動提早。' });

// ---------------------------------------------------------------- 洛恩 Lorne — sword, fire
S('ironcut', '斬鐵', { el: 'slash', p: 150, mp: 4, b: 25, d: '專削防備的重斬。破防力高。' });
S('flameslash', '火焰斬', { el: 'fire', p: 140, mp: 6, b: 18, fx: 'fire', d: '劍上燃起火焰，火屬性斬擊。' });
S('provoke', '挑釁', { k: 'buff', t: 's', mp: 3, b: 0, st: [['taunt', 100, 3], ['protect', 100, 3]], d: '吸引敵人攻擊自己，並提升防禦。' });
S('blazesweep', '爆炎劍', { el: 'fire', p: 115, t: 'E', mp: 14, b: 14, fx: 'fire', d: '火焰橫掃全體敵人。' });
S('courage', '勇氣', { k: 'buff', t: 's', mp: 10, b: 0, st: [['atkUp', 100, 4], ['regen', 100, 4]], d: '提振鬥志：攻擊上升，持續回復。' });
S('dragonflame', '炎龍斬', { el: 'fire', p: 300, mp: 26, b: 60, fx: 'fire2', d: '化身火龍的一擊。' });
S('neverfall', '不屈之心', { k: 'buff', t: 's', mp: 18, b: 0, st: [['endure', 100, 5]], d: '受到致命傷也會以 1 HP 撐住一次。' });
S('crimsonoath', '赤焰之誓', { el: 'fire', p: 160, h: 3, mp: 40, b: 30, fx: 'fire2', d: '三連火焰斬。' });

// ---------------------------------------------------------------- 薇拉 Vera — spear, ice
S('pierce', '穿刺', { el: 'pierce', p: 145, mp: 4, b: 25, d: '貫穿防備的突刺。' });
S('frostthrust', '冰霜刺', { el: 'ice', p: 140, mp: 6, b: 18, fx: 'ice', d: '冰屬性的突刺。' });
S('armorbreak', '破甲', { el: 'pierce', p: 90, mp: 6, b: 20, st: [['defDown', 90, 4]], d: '攻擊並降低敵人防禦。' });
S('blizzard', '冰風暴', { k: 'mag', el: 'ice', p: 120, t: 'E', mp: 16, b: 14, fx: 'ice', d: '冰屬性魔法，攻擊全體。' });
S('galestab', '疾風連刺', { el: 'pierce', p: 70, h: 4, t: 'r', mp: 14, b: 12, d: '對隨機敵人連刺四下。' });
S('icelance', '寒冰之槍', { el: 'ice', p: 290, mp: 26, b: 55, fx: 'ice2', d: '巨大的冰槍貫穿敵人。' });
S('insight', '洞察', { k: 'scan', t: 'E', mp: 8, b: 0, st: [['critUp', 100, 4]], x: { scan: 1 }, d: '看穿全體敵人的弱點，自身會心率上升。' });
S('frostbloom', '霜華', { k: 'mag', el: 'ice', p: 200, t: 'E', mp: 44, b: 30, fx: 'ice2', d: '冰之花在敵陣中綻放。' });

// ---------------------------------------------------------------- 小鈴 Lin — staff, light, the listener
S('listen', '聆聽', { k: 'scan', t: 'e', mp: 0, b: 0, x: { scan: 1 }, d: '聽見敵人的「聲音」，看穿牠的弱點與剩餘 HP。' });
S('cure', '治癒', { k: 'heal', el: 'none', p: 100, t: 'a', mp: 4, b: 0, fx: 'heal', d: '回復一名隊友的 HP。' });
S('lightarrow', '光矢', { k: 'mag', el: 'light', p: 130, mp: 5, b: 18, fx: 'light', d: '光屬性魔法。' });
S('purify', '淨化', { k: 'cure', t: 'a', mp: 5, b: 0, fx: 'heal', d: '解除一名隊友的異常狀態。' });
S('prayer', '祈禱', { k: 'heal', el: 'none', p: 80, t: 'A', mp: 12, b: 0, fx: 'heal', d: '回復全體隊友的 HP。' });
S('revive', '復甦', { k: 'revive', t: 'ko', p: 30, mp: 16, b: 0, fx: 'revive', d: '讓倒下的隊友以 30% HP 站起來。' });
S('holy', '聖光', { k: 'mag', el: 'light', p: 135, t: 'E', mp: 20, b: 16, fx: 'light2', d: '光屬性魔法，攻擊全體。' });
S('guardsong', '守護之歌', { k: 'buff', t: 'A', mp: 22, b: 0, st: [['protect', 100, 4], ['shell', 100, 4]], fx: 'buff', d: '全體獲得護盾與魔障。' });
S('greatcure', '大治癒', { k: 'heal', el: 'none', p: 170, t: 'A', mp: 30, b: 0, fx: 'heal2', d: '大幅回復全體 HP。' });
S('crystalsong', '晶之歌', { k: 'revive', t: 'A', p: 60, mp: 60, b: 0, fx: 'revive', x: { full: 1 }, d: '讓所有倒下的隊友以 60% HP 復活並治好異常。' });

// ---------------------------------------------------------------- 布朗 Brann — axe, earth
S('smash', '重擊', { el: 'strike', p: 160, mp: 4, b: 35, d: '把斧背砸下去，破防力極高。' });
S('rockbreak', '岩碎', { el: 'earth', p: 145, mp: 6, b: 22, fx: 'earth', d: '土屬性的重擊。' });
S('steelbody', '鋼鐵之軀', { k: 'buff', t: 's', mp: 6, b: 0, st: [['protect', 100, 4], ['shell', 100, 4], ['taunt', 100, 3]], d: '自身護盾、魔障並吸引攻擊。' });
S('quake', '地震', { el: 'earth', p: 120, t: 'E', mp: 16, b: 16, fx: 'earth', d: '震裂大地，攻擊全體。' });
S('smitheye', '鍛冶師之眼', { k: 'debuff', t: 'E', mp: 10, b: 10, st: [['defDown', 85, 4]], d: '看出裝備的縫隙，全體敵人防禦下降。' });
S('shatter', '粉碎', { el: 'strike', p: 260, mp: 24, b: 90, d: '專破防禦的毀滅一擊。' });
S('cover', '堅守', { k: 'buff', t: 's', mp: 12, b: 0, st: [['taunt', 100, 4], ['protect', 100, 4]], x: { cover: 1 }, d: '替隊友承受單體攻擊。' });
S('titanfall', '巨人之槌', { el: 'earth', p: 340, mp: 42, b: 80, fx: 'earth2', d: '大地之力全部灌進一擊。' });

// ---------------------------------------------------------------- 妮雅 Nia — gun, thunder, a sky pirate
S('steal', '偷竊', { k: 'steal', mp: 0, b: 5, x: { steal: 1 }, d: '從敵人身上偷東西。' });
S('voltshot', '雷擊彈', { el: 'thunder', p: 140, mp: 6, b: 18, fx: 'thunder', d: '雷屬性射擊。' });
S('rapidfire', '速射', { el: 'shot', p: 65, h: 3, t: 'r', mp: 8, b: 12, d: '對隨機敵人連射三發。' });
S('smoke', '煙幕', { k: 'debuff', t: 'E', mp: 8, b: 5, st: [['blind', 80, 3]], d: '讓全體敵人陷入黑暗。' });
S('thunderstorm', '雷霆風暴', { k: 'mag', el: 'thunder', p: 125, t: 'E', mp: 18, b: 16, fx: 'thunder', d: '雷屬性魔法，攻擊全體。' });
S('mug', '搶奪', { el: 'pierce', p: 120, mp: 8, b: 20, x: { steal: 1 }, d: '攻擊並偷東西。' });
S('haste', '加速', { k: 'buff', t: 'a', mp: 12, b: 0, st: [['haste', 100, 4]], fx: 'buff', d: '一名隊友行動變快。' });
S('deadeye', '致命一擊', { el: 'shot', p: 230, mp: 22, b: 40, x: { crit: 60 }, d: '瞄準要害，會心率極高。' });

// ---------------------------------------------------------------- 夜 Yoru — katana, dark
S('iai', '居合', { el: 'slash', p: 150, mp: 4, b: 24, d: '拔刀即斬。' });
S('shadowbind', '影縫', { el: 'dark', p: 110, mp: 8, b: 18, st: [['paralyze', 45, 2]], fx: 'dark', d: '縫住影子，可能麻痺。' });
S('mirage', '分身', { k: 'buff', t: 's', mp: 10, b: 0, st: [['blink', 100, 4], ['evade', 100, 4]], d: '分身能躲過兩次攻擊。' });
S('nightslash', '暗夜斬', { el: 'dark', p: 120, t: 'E', mp: 16, b: 16, fx: 'dark', d: '闇屬性斬擊攻擊全體。' });
S('shuriken', '手裏劍', { el: 'shot', p: 60, h: 4, t: 'r', mp: 10, b: 10, d: '連擲四枚手裏劍。' });
S('mumyo', '無明', { el: 'dark', p: 310, mp: 30, b: 60, fx: 'dark2', d: '闇中的一閃。' });
S('assassinate', '暗殺', { el: 'slash', p: 200, mp: 24, b: 30, st: [['doom', 25, 3]], d: '可能對敵人施加死亡宣告。' });

// ---------------------------------------------------------------- 賽勒斯 Cyrus — the grey-crowned knight, wind and water
S('galeblade', '疾風劍', { el: 'wind', p: 160, mp: 8, b: 25, fx: 'wind', d: '風屬性斬擊。' });
S('tidecut', '潮斬', { el: 'water', p: 160, mp: 8, b: 25, fx: 'water', d: '水屬性斬擊。' });
S('greycrown', '灰冕', { el: 'wind', p: 180, t: 'E', mp: 30, b: 30, fx: 'wind2', d: '風與水交織的斬擊攻擊全體。' });

// ---------------------------------------------------------------- the echoes' arts
// 亞瑟 sword saint
S('crosscut', '十字斬', { el: 'slash', p: 170, mp: 8, b: 28, d: '十字形的兩道斬擊。' });
S('twinslash', '連斬', { el: 'slash', p: 80, h: 3, mp: 10, b: 14, d: '同一目標斬三下。' });
S('swordwave', '劍氣', { el: 'slash', p: 115, t: 'E', mp: 16, b: 16, d: '劍氣掃過全體。' });
S('mindseye', '心眼', { k: 'buff', t: 's', mp: 10, b: 0, st: [['critUp', 100, 4], ['evade', 100, 3]], d: '看清一切：會心與迴避上升。' });
S('ult_arthur', '天地一閃', { el: 'slash', p: 520, mp: 0, b: 120, x: { ult: 1 }, fx: 'ult_slash', d: '劍聖的奧義。' });
// 瑪琳 flame witch
S('fire', '火球', { k: 'mag', el: 'fire', p: 120, mp: 5, b: 16, fx: 'fire', d: '火屬性魔法。' });
S('fira', '烈焰', { k: 'mag', el: 'fire', p: 120, t: 'E', mp: 14, b: 14, fx: 'fire', d: '火屬性魔法，攻擊全體。' });
S('flare', '爆炎', { k: 'mag', el: 'fire', p: 300, mp: 30, b: 50, fx: 'fire2', d: '強大的火屬性魔法。' });
S('ult_marin', '紅蓮煉獄', { k: 'mag', el: 'fire', p: 400, t: 'E', mp: 0, b: 90, x: { ult: 1 }, fx: 'ult_fire', d: '燒盡一切的火海。' });
// 雪鈴 ice maiden
S('ice', '冰錐', { k: 'mag', el: 'ice', p: 120, mp: 5, b: 16, fx: 'ice', d: '冰屬性魔法。' });
S('icera', '冰霜', { k: 'mag', el: 'ice', p: 120, t: 'E', mp: 14, b: 14, fx: 'ice', d: '冰屬性魔法，攻擊全體。' });
S('zero', '絕對零度', { k: 'mag', el: 'ice', p: 300, mp: 30, b: 50, st: [['slow', 60, 3]], fx: 'ice2', d: '凍結時間般的寒氣，可能緩速。' });
S('ult_yuki', '永凍之華', { k: 'mag', el: 'ice', p: 400, t: 'E', mp: 0, b: 90, st: [['slow', 100, 3]], x: { ult: 1 }, fx: 'ult_ice', d: '冰花覆蓋戰場，全體緩速。' });
// 雷歐 thunder fighter
S('bolt', '雷擊', { k: 'mag', el: 'thunder', p: 120, mp: 5, b: 16, fx: 'thunder', d: '雷屬性魔法。' });
S('thunderfist', '雷光拳', { el: 'thunder', p: 150, mp: 7, b: 26, fx: 'thunder', d: '帶電的拳頭。' });
S('thundaga', '雷霆', { k: 'mag', el: 'thunder', p: 140, t: 'E', mp: 18, b: 16, st: [['paralyze', 20, 1]], fx: 'thunder2', d: '雷霆轟擊全體，可能麻痺。' });
S('ult_leo', '千雷', { el: 'thunder', p: 90, h: 6, t: 'r', mp: 0, b: 25, x: { ult: 1 }, fx: 'ult_thunder', d: '落下千道雷光。' });
// 海德 tide priest
S('water', '水彈', { k: 'mag', el: 'water', p: 120, mp: 5, b: 16, fx: 'water', d: '水屬性魔法。' });
S('tide', '潮汐', { k: 'heal', el: 'none', p: 70, t: 'A', mp: 10, b: 0, st: [['regen', 100, 3]], fx: 'water', d: '潮水回復全體並給予再生。' });
S('tsunami', '大海嘯', { k: 'mag', el: 'water', p: 150, t: 'E', mp: 22, b: 18, fx: 'water2', d: '巨浪吞沒全體。' });
S('ult_hyde', '深海之怒', { k: 'mag', el: 'water', p: 380, t: 'E', mp: 0, b: 90, x: { ult: 1 }, fx: 'ult_water', d: '深海的巨浪。' });
// 希爾芙 wind dancer
S('aero', '風刃', { k: 'mag', el: 'wind', p: 120, mp: 5, b: 16, fx: 'wind', d: '風屬性魔法。' });
S('tailwind', '順風', { k: 'buff', t: 'A', mp: 20, b: 0, st: [['haste', 100, 3]], fx: 'wind', d: '全體加速。' });
S('tornado', '龍捲', { k: 'mag', el: 'wind', p: 140, t: 'E', mp: 18, b: 16, fx: 'wind2', d: '龍捲風攻擊全體。' });
S('ult_sylph', '天風亂舞', { el: 'wind', p: 110, h: 5, t: 'r', mp: 0, b: 26, x: { ult: 1 }, fx: 'ult_wind', d: '風之舞者的亂舞。' });
// 蓋亞 earth guardian
S('stonewall', '石牆', { k: 'buff', t: 'A', mp: 12, b: 0, st: [['protect', 100, 4]], fx: 'earth', d: '全體獲得護盾。' });
S('rockslide', '岩崩', { el: 'earth', p: 120, t: 'E', mp: 15, b: 16, fx: 'earth', d: '落石攻擊全體。' });
S('fissure', '地裂', { el: 'earth', p: 290, mp: 28, b: 60, fx: 'earth2', d: '大地裂開吞噬敵人。' });
S('ult_gaia', '大地之怒', { el: 'earth', p: 420, t: 'E', mp: 0, b: 100, x: { ult: 1 }, fx: 'ult_earth', d: '大地本身的怒吼。' });
// 賽蓮 the saint
S('cura', '治癒術', { k: 'heal', el: 'none', p: 160, t: 'a', mp: 8, b: 0, fx: 'heal', d: '大量回復一名隊友。' });
S('curaga', '全體治癒', { k: 'heal', el: 'none', p: 120, t: 'A', mp: 18, b: 0, fx: 'heal2', d: '回復全體。' });
S('raise', '復活', { k: 'revive', t: 'ko', p: 50, mp: 20, b: 0, fx: 'revive', d: '以 50% HP 復活。' });
S('sanctuary', '聖域', { k: 'buff', t: 'A', mp: 26, b: 0, st: [['shell', 100, 4], ['regen', 100, 4]], fx: 'light', d: '全體魔障與再生。' });
S('ult_seren', '天使之歌', { k: 'revive', t: 'A', p: 100, mp: 0, b: 0, x: { ult: 1, full: 1 }, fx: 'ult_light', d: '全體完全回復並復活。' });
// 莫爾 dark knight
S('darkblade', '暗黑劍', { el: 'dark', p: 200, mp: 0, b: 30, x: { hpCost: 10 }, fx: 'dark', d: '消耗 10% HP 的闇之劍。' });
S('drain', '吸血', { k: 'mag', el: 'dark', p: 140, mp: 10, b: 15, x: { drain: 1 }, fx: 'dark', d: '吸取敵人的 HP。' });
S('darkwave', '暗之波動', { el: 'dark', p: 160, t: 'E', mp: 0, b: 20, x: { hpCost: 15 }, fx: 'dark2', d: '消耗 15% HP 攻擊全體。' });
S('ult_morr', '冥界之門', { el: 'dark', p: 460, t: 'E', mp: 0, b: 90, x: { ult: 1 }, fx: 'ult_dark', d: '打開冥界之門。' });
// 羅蘭 paladin
S('holyblade', '聖劍', { el: 'light', p: 150, mp: 8, b: 24, fx: 'light', d: '光屬性斬擊。' });
S('ironwall', '鐵壁', { k: 'buff', t: 's', mp: 8, b: 0, st: [['protect', 100, 5], ['shell', 100, 5], ['taunt', 100, 3]], x: { cover: 1 }, d: '鐵壁防禦並保護隊友。' });
S('ult_roland', '神聖十字', { el: 'light', p: 400, t: 'E', mp: 0, b: 90, st: [['protect', 100, 3]], x: { ult: 1, partyBuff: 'protect' }, fx: 'ult_light', d: '光之十字架，全隊護盾。' });
// 飛燕 dragoon
S('jump', '跳躍', { el: 'pierce', p: 260, mp: 10, b: 40, x: { jump: 1 }, d: '跳上高空，下回合落下攻擊（空中不會被打到）。' });
S('dragonclaw', '龍之爪', { el: 'pierce', p: 90, h: 2, mp: 8, b: 18, d: '兩次突刺。' });
S('dragonblood', '龍血', { k: 'buff', t: 's', mp: 14, b: 0, st: [['atkUp', 100, 4], ['berserk', 100, 3]], d: '攻擊大幅上升但會狂暴。' });
S('ult_hien', '天龍降臨', { el: 'pierce', p: 540, mp: 0, b: 130, x: { ult: 1 }, fx: 'ult_pierce', d: '化為天龍貫穿敵人。' });
// 疾風 thief king
S('dualblade', '雙刀', { el: 'pierce', p: 75, h: 2, mp: 5, b: 14, d: '兩次快攻。' });
S('plunder', '掠奪', { el: 'pierce', p: 140, mp: 10, b: 20, x: { steal: 1 }, d: '攻擊並偷東西。' });
S('flee', '脫兔', { k: 'special', t: 's', mp: 0, b: 0, x: { escape: 1 }, d: '必定逃跑（頭目戰無效）。' });
S('ult_shippu', '千刃', { el: 'pierce', p: 70, h: 8, t: 'r', mp: 0, b: 18, x: { ult: 1 }, fx: 'ult_slash', d: '千把刀刃的風暴。' });
// 阿爾忒 archer
S('aim', '瞄準射擊', { el: 'shot', p: 170, mp: 6, b: 26, x: { crit: 25 }, d: '必中的精準一箭。' });
S('volley', '連射', { el: 'shot', p: 60, h: 4, t: 'r', mp: 10, b: 10, d: '連射四箭。' });
S('arrowrain', '箭雨', { el: 'shot', p: 125, t: 'E', mp: 18, b: 16, d: '箭雨落向全體。' });
S('ult_arte', '星落箭雨', { el: 'shot', p: 120, h: 6, t: 'r', mp: 0, b: 25, x: { ult: 1 }, fx: 'ult_light', d: '如流星般的箭雨。' });
// 剛 monk
S('rush', '連打', { el: 'strike', p: 55, h: 4, mp: 6, b: 12, d: '四連打。' });
S('chakra', '氣功', { k: 'heal', el: 'none', p: 140, t: 's', mp: 4, b: 0, fx: 'heal', d: '回復自己並治好中毒與黑暗。' });
S('burstfist', '爆裂拳', { el: 'strike', p: 240, mp: 16, b: 55, d: '貫穿防禦的一拳。' });
S('ult_gou', '百裂拳', { el: 'strike', p: 60, h: 10, mp: 0, b: 15, x: { ult: 1 }, fx: 'ult_strike', d: '一百道拳影。' });
// 琴 bard
S('warsong', '戰歌', { k: 'buff', t: 'A', mp: 14, b: 0, st: [['atkUp', 100, 4]], fx: 'buff', d: '全體攻擊上升。' });
S('requiem', '安魂曲', { k: 'buff', t: 'A', mp: 14, b: 0, st: [['regen', 100, 5]], fx: 'heal', d: '全體再生。' });
S('lullaby', '催眠曲', { k: 'debuff', t: 'E', mp: 12, b: 0, st: [['sleep', 60, 3]], d: '讓全體敵人睡著。' });
S('ult_kin', '英雄讚歌', { k: 'buff', t: 'A', mp: 0, b: 0, st: [['atkUp', 100, 5], ['magUp', 100, 5], ['haste', 100, 5], ['protect', 100, 5]], x: { ult: 1 }, fx: 'ult_light', d: '全體能力大幅上升。' });
// 時雨 time mage
S('slow', '緩速', { k: 'debuff', t: 'e', mp: 8, b: 10, st: [['slow', 85, 4]], d: '讓敵人行動變慢。' });
S('gravity', '重力', { k: 'mag', el: 'none', p: 0, mp: 14, b: 30, x: { gravity: 25 }, d: '削去敵人目前 HP 的 25%（頭目較少）。' });
S('quick', '神速', { k: 'buff', t: 'a', mp: 22, b: 0, st: [['haste', 100, 5]], x: { quick: 1 }, d: '隊友加速並立刻行動。' });
S('ult_shigure', '時間停止', { k: 'debuff', t: 'E', mp: 0, b: 60, st: [['stop', 100, 2]], x: { ult: 1 }, fx: 'ult_time', d: '讓全體敵人停止兩回合。' });
// 艾薇 summoner
S('salamander', '召喚・火精', { k: 'mag', el: 'fire', p: 150, t: 'E', mp: 22, b: 18, fx: 'fire2', d: '召喚火精灼燒全體。' });
S('undine', '召喚・水精', { k: 'mag', el: 'water', p: 150, t: 'E', mp: 22, b: 18, fx: 'water2', d: '召喚水精。' });
S('golemsum', '召喚・岩人', { k: 'buff', t: 'A', mp: 24, b: 0, st: [['protect', 100, 4], ['shell', 100, 4]], fx: 'earth', d: '岩人守護全體。' });
S('ult_ivy', '召喚・古龍', { k: 'mag', el: 'none', p: 480, t: 'E', mp: 0, b: 100, x: { ult: 1, pierceDef: 1 }, fx: 'ult_dragon', d: '古龍的吐息，無視屬性。' });
// 卡爾 machinist
S('drill', '鑽頭', { el: 'strike', p: 170, mp: 6, b: 40, d: '鑽開裝甲，破防力高。' });
S('bomb', '炸彈', { el: 'fire', p: 110, t: 'E', mp: 12, b: 14, fx: 'fire', d: '投擲炸彈。' });
S('scatter', '散彈', { el: 'shot', p: 110, t: 'E', mp: 14, b: 16, d: '散彈攻擊全體。' });
S('ult_karl', '超電磁砲', { el: 'thunder', p: 560, mp: 0, b: 140, x: { ult: 1 }, fx: 'ult_thunder', d: '最強的一發。' });
// 影丸 ninja
S('katon', '火遁', { k: 'mag', el: 'fire', p: 130, t: 'E', mp: 14, b: 14, fx: 'fire', d: '火遁之術。' });
S('suiton', '水遁', { k: 'mag', el: 'water', p: 130, t: 'E', mp: 14, b: 14, fx: 'water', d: '水遁之術。' });
S('utsusemi', '空蟬', { k: 'buff', t: 's', mp: 10, b: 0, st: [['blink', 100, 5]], d: '分身躲過兩次攻擊。' });
S('ult_kage', '天照', { el: 'dark', p: 100, h: 5, t: 'r', mp: 0, b: 25, x: { ult: 1 }, fx: 'ult_dark', d: '黑色火焰。' });
// 歐文 sage
S('elements', '四元素', { k: 'mag', el: 'none', p: 100, t: 'E', mp: 20, b: 14, x: { allEl: 1 }, fx: 'light2', d: '同時帶火冰雷土四屬性（打中任一弱點即算弱點）。' });
S('osmose', '魔力吸收', { k: 'mag', el: 'none', p: 60, mp: 0, b: 10, x: { mpDrain: 1 }, d: '吸取敵人的 MP。' });
S('meteor', '隕石', { k: 'mag', el: 'none', p: 90, h: 4, t: 'r', mp: 40, b: 20, fx: 'earth2', d: '隕石落下。' });
S('ult_owen', '終極魔法', { k: 'mag', el: 'none', p: 520, t: 'E', mp: 0, b: 110, x: { ult: 1, allEl: 1 }, fx: 'ult_light', d: '賢者的終極魔法。' });
// 莎拉 dancer
S('swordance', '劍舞', { el: 'slash', p: 70, h: 4, t: 'r', mp: 10, b: 12, d: '舞動的劍。' });
S('healdance', '治癒之舞', { k: 'heal', el: 'none', p: 90, t: 'A', mp: 14, b: 0, fx: 'heal', d: '回復全體。' });
S('charmdance', '魅惑之舞', { k: 'debuff', t: 'E', mp: 14, b: 10, st: [['confuse', 40, 2], ['atkDown', 70, 3]], d: '可能混亂、攻擊下降。' });
S('ult_sara', '終焉之舞', { el: 'slash', p: 130, h: 5, t: 'r', mp: 0, b: 24, x: { ult: 1 }, fx: 'ult_slash', d: '最後之舞。' });
// 巴克 beast king
S('roar', '咆哮', { k: 'debuff', t: 'E', mp: 10, b: 12, st: [['atkDown', 80, 4]], d: '全體敵人攻擊下降。' });
S('wildfang', '獸牙', { el: 'pierce', p: 180, mp: 8, b: 28, st: [['poison', 50, 4]], d: '可能中毒。' });
S('beastsoul', '野性', { k: 'buff', t: 's', mp: 8, b: 0, st: [['atkUp', 100, 5], ['haste', 100, 3]], d: '攻擊上升並加速。' });
S('ult_buck', '百獸之王', { el: 'strike', p: 480, t: 'E', mp: 0, b: 100, x: { ult: 1 }, fx: 'ult_strike', d: '百獸一齊衝鋒。' });
// 星詠 Stella and the knight of the end (the two secret echoes)
S('starlight', '星光', { k: 'mag', el: 'light', p: 230, t: 'E', mp: 36, b: 30, fx: 'light2', d: '星之光。' });
S('wish', '星願', { k: 'heal', el: 'none', p: 250, t: 'A', mp: 40, b: 0, st: [['regen', 100, 5]], fx: 'heal2', d: '大幅回復全體並再生。' });
S('ult_stella', '星之終焉', { k: 'mag', el: 'light', p: 640, t: 'E', mp: 0, b: 140, x: { ult: 1 }, fx: 'ult_light', d: '星辰墜落。' });
S('voidblade', '虛無之刃', { el: 'dark', p: 190, mp: 30, b: 50, x: { pierceDef: 1 }, fx: 'dark2', d: '無視防禦。' });
S('endwave', '終焉波動', { el: 'dark', p: 220, t: 'E', mp: 44, b: 30, fx: 'dark2', d: '闇之波動攻擊全體。' });
S('ult_end', '終焉之劍', { el: 'dark', p: 700, mp: 0, b: 160, x: { ult: 1, pierceDef: 1 }, fx: 'ult_dark', d: '終結一切的劍。' });

// ---------------------------------------------------------------- duets: two echoes together (cost 2 resonance)
S('syn_holycross', '雙劍・神聖十字', { el: 'light', p: 700, t: 'E', b: 160, x: { syn: 1 }, fx: 'ult_light', d: '劍聖與聖騎士的合擊。' });
S('syn_polar', '冰炎雙極', { k: 'mag', el: 'fire', p: 680, t: 'E', b: 150, x: { syn: 1, allEl: 1, els: ['fire', 'ice'] }, fx: 'ult_fire', d: '火與冰同時炸開。' });
S('syn_storm', '雷風神威', { k: 'mag', el: 'thunder', p: 680, t: 'E', b: 150, x: { syn: 1, els: ['thunder', 'wind'] }, fx: 'ult_thunder', d: '雷與風的風暴。' });
S('syn_hymn', '天籟聖歌', { k: 'revive', t: 'A', p: 100, b: 0, st: [['regen', 100, 5], ['protect', 100, 5], ['shell', 100, 5], ['haste', 100, 4]], x: { syn: 1, full: 1 }, fx: 'ult_light', d: '完全回復並全面強化。' });
S('syn_shadow', '冥影殺', { el: 'dark', p: 760, b: 170, x: { syn: 1, crit: 100 }, fx: 'ult_dark', d: '必會心的闇之一擊。' });
S('syn_sky', '天空雙穿', { el: 'pierce', p: 820, b: 190, x: { syn: 1 }, fx: 'ult_pierce', d: '天空中交會的兩擊。' });
S('syn_quake', '天崩地裂', { el: 'earth', p: 700, t: 'E', b: 170, x: { syn: 1 }, fx: 'ult_earth', d: '天崩地裂。' });
S('syn_sea', '海神召喚', { k: 'mag', el: 'water', p: 700, t: 'E', b: 160, x: { syn: 1 }, fx: 'ult_water', d: '召喚海神。' });
S('syn_phantom', '幻影劍舞', { el: 'slash', p: 120, h: 9, t: 'r', b: 24, x: { syn: 1 }, fx: 'ult_slash', d: '幻影與劍舞。' });
S('syn_time', '時空崩壞', { k: 'mag', el: 'none', p: 720, t: 'E', b: 180, st: [['slow', 100, 3]], x: { syn: 1, pierceDef: 1 }, fx: 'ult_time', d: '時空崩壞。' });
S('syn_steel', '鋼鐵獸王', { el: 'strike', p: 780, t: 'E', b: 180, x: { syn: 1 }, fx: 'ult_strike', d: '機械與野獸。' });
S('syn_starfall', '星滅', { k: 'mag', el: 'light', p: 1000, t: 'E', b: 250, x: { syn: 1, allEl: 1, els: ['light', 'dark'] }, fx: 'ult_light', d: '光與闇的終極合擊。' });

// ---------------------------------------------------------------- items used in battle (item skills)
S('i_potion', '藥水', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { flat: 150 }, fx: 'heal' });
S('i_hipotion', '高級藥水', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { flat: 600 }, fx: 'heal' });
S('i_xpotion', '特級藥水', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { flat: 9999 }, fx: 'heal2' });
S('i_megalixir', '萬能藥水', { k: 'heal', el: 'none', p: 0, t: 'A', b: 0, x: { flat: 9999, mp: 999 }, fx: 'heal2' });
S('i_ether', '魔力藥水', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { mpFlat: 60 }, fx: 'heal' });
S('i_hiether', '高級魔力藥水', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { mpFlat: 250 }, fx: 'heal' });
S('i_elixir', '仙丹', { k: 'heal', el: 'none', p: 0, t: 'a', b: 0, x: { flat: 9999, mp: 999 }, fx: 'heal2' });
S('i_phoenix', '鳳凰之羽', { k: 'revive', t: 'ko', p: 25, b: 0, fx: 'revive' });
S('i_antidote', '解毒草', { k: 'cure', t: 'a', b: 0, x: { only: ['poison'] }, fx: 'heal' });
S('i_eyedrop', '眼藥水', { k: 'cure', t: 'a', b: 0, x: { only: ['blind'] }, fx: 'heal' });
S('i_echo', '回音草', { k: 'cure', t: 'a', b: 0, x: { only: ['silence'] }, fx: 'heal' });
S('i_remedy', '萬能藥', { k: 'cure', t: 'a', b: 0, fx: 'heal' });
S('i_firebomb', '火焰瓶', { k: 'mag', el: 'fire', p: 0, t: 'E', b: 20, x: { flatDmg: 180 }, fx: 'fire' });
S('i_icebomb', '冰凍瓶', { k: 'mag', el: 'ice', p: 0, t: 'E', b: 20, x: { flatDmg: 180 }, fx: 'ice' });
S('i_boltbomb', '雷電瓶', { k: 'mag', el: 'thunder', p: 0, t: 'E', b: 20, x: { flatDmg: 180 }, fx: 'thunder' });
S('i_holywater', '聖水', { k: 'mag', el: 'light', p: 0, t: 'E', b: 20, x: { flatDmg: 400 }, fx: 'light' });
S('i_darkmatter', '暗黑物質', { k: 'mag', el: 'dark', p: 0, t: 'E', b: 40, x: { flatDmg: 1500 }, fx: 'dark2' });

// ---------------------------------------------------------------- enemies' moves
S('e_bite', '咬', { el: 'pierce', p: 110, d: '' });
S('e_claw', '爪擊', { el: 'slash', p: 110 });
S('e_tackle', '撞擊', { el: 'strike', p: 110 });
S('e_peck', '啄', { el: 'pierce', p: 100 });
S('e_sting', '毒針', { el: 'pierce', p: 90, st: [['poison', 50, 4]] });
S('e_poisonbite', '毒牙', { el: 'pierce', p: 100, st: [['poison', 60, 4]] });
S('e_sleeppowder', '催眠粉', { k: 'debuff', t: 'A', st: [['sleep', 35, 2]] });
S('e_blindspore', '黑霧孢子', { k: 'debuff', t: 'A', st: [['blind', 40, 3]] });
S('e_screech', '尖嘯', { k: 'debuff', t: 'A', st: [['silence', 35, 3]] });
S('e_howl', '嚎叫', { k: 'buff', t: 's', st: [['atkUp', 100, 3]] });
S('e_harden', '硬化', { k: 'buff', t: 's', st: [['protect', 100, 3]] });
S('e_heal', '回復', { k: 'heal', el: 'none', p: 120, t: 's', fx: 'heal' });
S('e_healall', '群體回復', { k: 'heal', el: 'none', p: 90, t: 'A', fx: 'heal' });
S('e_fire', '火球', { k: 'mag', el: 'fire', p: 120, fx: 'fire' });
S('e_ice', '冰錐', { k: 'mag', el: 'ice', p: 120, fx: 'ice' });
S('e_bolt', '雷擊', { k: 'mag', el: 'thunder', p: 120, fx: 'thunder' });
S('e_water', '水彈', { k: 'mag', el: 'water', p: 120, fx: 'water' });
S('e_aero', '風刃', { k: 'mag', el: 'wind', p: 120, fx: 'wind' });
S('e_rock', '投石', { el: 'earth', p: 120, fx: 'earth' });
S('e_light', '光彈', { k: 'mag', el: 'light', p: 120, fx: 'light' });
S('e_dark', '闇球', { k: 'mag', el: 'dark', p: 120, fx: 'dark' });
S('e_fireall', '火焰吐息', { k: 'mag', el: 'fire', p: 95, t: 'A', fx: 'fire' });
S('e_iceall', '寒冰吐息', { k: 'mag', el: 'ice', p: 95, t: 'A', fx: 'ice' });
S('e_boltall', '雷光', { k: 'mag', el: 'thunder', p: 95, t: 'A', fx: 'thunder' });
S('e_waterall', '水流', { k: 'mag', el: 'water', p: 95, t: 'A', fx: 'water' });
S('e_windall', '旋風', { k: 'mag', el: 'wind', p: 95, t: 'A', fx: 'wind' });
S('e_earthall', '地鳴', { el: 'earth', p: 95, t: 'A', fx: 'earth' });
S('e_darkall', '闇之霧', { k: 'mag', el: 'dark', p: 95, t: 'A', fx: 'dark' });
S('e_lightall', '光之雨', { k: 'mag', el: 'light', p: 95, t: 'A', fx: 'light' });
S('e_slam', '重壓', { el: 'strike', p: 160 });
S('e_double', '連擊', { el: 'slash', p: 70, h: 2 });
S('e_drain', '吸血', { k: 'mag', el: 'dark', p: 100, x: { drain: 1 }, fx: 'dark' });
S('e_paralyze', '麻痺之觸', { el: 'thunder', p: 80, st: [['paralyze', 40, 2]], fx: 'thunder' });
S('e_slowgaze', '遲緩凝視', { k: 'debuff', t: 'a', st: [['slow', 60, 3]] });
S('e_curse', '詛咒', { k: 'debuff', t: 'a', st: [['atkDown', 70, 3], ['magDown', 70, 3]], fx: 'dark' });
S('e_confuse', '迷惑', { k: 'debuff', t: 'a', st: [['confuse', 45, 2]] });
S('e_rage', '狂怒', { k: 'buff', t: 's', st: [['atkUp', 100, 4], ['haste', 100, 3]] });
S('e_selfdestruct', '自爆', { k: 'mag', el: 'fire', p: 260, x: { suicide: 1 }, fx: 'fire2' });
S('e_doom', '死亡宣告', { k: 'debuff', t: 'a', st: [['doom', 55, 3]], fx: 'dark' });
S('e_grav', '重力波', { k: 'mag', el: 'none', p: 0, t: 'A', x: { gravity: 20 } });
S('e_summon', '呼喚同伴', { k: 'special', t: 's', x: { summon: 1 } });
S('e_steal', '偷竊', { k: 'special', t: 'a', x: { stealGil: 1 } });
// bosses' great blows (telegraphed: break the boss before it lands)
S('b_crush', '粉碎重擊', { el: 'strike', p: 260, x: { charge: 1 } });
S('b_breath', '毀滅吐息', { k: 'mag', el: 'fire', p: 190, t: 'A', x: { charge: 1 }, fx: 'fire2' });
S('b_frost', '極寒吐息', { k: 'mag', el: 'ice', p: 190, t: 'A', x: { charge: 1 }, fx: 'ice2' });
S('b_storm', '雷暴', { k: 'mag', el: 'thunder', p: 190, t: 'A', x: { charge: 1 }, fx: 'thunder2' });
S('b_flood', '洪流', { k: 'mag', el: 'water', p: 190, t: 'A', x: { charge: 1 }, fx: 'water2' });
S('b_gale', '暴風', { k: 'mag', el: 'wind', p: 190, t: 'A', x: { charge: 1 }, fx: 'wind2' });
S('b_quake', '大地震', { el: 'earth', p: 190, t: 'A', x: { charge: 1 }, fx: 'earth2' });
S('b_judgment', '審判之光', { k: 'mag', el: 'light', p: 200, t: 'A', x: { charge: 1 }, fx: 'light2' });
S('b_abyss', '深淵', { k: 'mag', el: 'dark', p: 200, t: 'A', x: { charge: 1 }, fx: 'dark2' });
S('b_void', '虛無', { k: 'mag', el: 'none', p: 150, t: 'A', x: { charge: 1, pierceDef: 1 }, fx: 'ult_dark' });
S('b_cleave', '橫掃千軍', { el: 'slash', p: 170, t: 'A', x: { charge: 1 } });
S('b_execute', '處刑', { el: 'slash', p: 380, x: { charge: 1 } });
S('b_meteor', '流星雨', { k: 'mag', el: 'none', p: 110, h: 5, t: 'r', x: { charge: 1 }, fx: 'earth2' });
S('b_ultima', '究極', { k: 'mag', el: 'none', p: 260, t: 'A', x: { charge: 1 }, fx: 'ult_light' });

export const SKILLS = SK;
export const skill = (id) => SK[id] || SK.attack;
