// Items: things to use, weapons by kind and tier, armour, accessories and key items.
//   use: the skill it casts (see skills.js i_*); field: usable from the menu
//   weapons: atk (and mag for staves), el (an element the blow carries), blow (slash/pierce/strike/shot)
export const ITEMS = {};
const I = (id, n, o) => { ITEMS[id] = { id, n, ...o }; };

// ---------------------------------------------------------------- consumables
I('potion', '藥水', { kind: 'use', use: 'i_potion', price: 40, field: true, icon: '🧪', d: '回復 150 HP。' });
I('hipotion', '高級藥水', { kind: 'use', use: 'i_hipotion', price: 300, field: true, icon: '🧪', d: '回復 600 HP。' });
I('xpotion', '特級藥水', { kind: 'use', use: 'i_xpotion', price: 1500, field: true, icon: '🧪', d: '完全回復 HP。' });
I('ether', '魔力藥水', { kind: 'use', use: 'i_ether', price: 150, field: true, icon: '🔷', d: '回復 60 MP。' });
I('hiether', '高級魔力藥水', { kind: 'use', use: 'i_hiether', price: 900, field: true, icon: '🔷', d: '回復 250 MP。' });
I('elixir', '仙丹', { kind: 'use', use: 'i_elixir', price: 0, sell: 2500, field: true, icon: '✨', d: '完全回復 HP 與 MP。' });
I('megalixir', '萬能藥水', { kind: 'use', use: 'i_megalixir', price: 0, sell: 8000, field: true, icon: '🌟', d: '全體完全回復 HP 與 MP。' });
I('phoenix', '鳳凰之羽', { kind: 'use', use: 'i_phoenix', price: 200, field: true, icon: '🪶', d: '讓倒下的隊友以 25% HP 復活。' });
I('antidote', '解毒草', { kind: 'use', use: 'i_antidote', price: 20, field: true, icon: '🌿', d: '治好中毒。' });
I('eyedrop', '眼藥水', { kind: 'use', use: 'i_eyedrop', price: 20, field: true, icon: '💧', d: '治好黑暗。' });
I('echograss', '回音草', { kind: 'use', use: 'i_echo', price: 30, field: true, icon: '🍃', d: '治好沉默。' });
I('remedy', '萬能藥', { kind: 'use', use: 'i_remedy', price: 250, field: true, icon: '💊', d: '治好所有異常狀態。' });
I('firebomb', '火焰瓶', { kind: 'use', use: 'i_firebomb', price: 120, icon: '🔥', d: '對全體敵人造成火屬性傷害。' });
I('icebomb', '冰凍瓶', { kind: 'use', use: 'i_icebomb', price: 120, icon: '❄️', d: '對全體敵人造成冰屬性傷害。' });
I('boltbomb', '雷電瓶', { kind: 'use', use: 'i_boltbomb', price: 120, icon: '⚡', d: '對全體敵人造成雷屬性傷害。' });
I('holywater', '聖水', { kind: 'use', use: 'i_holywater', price: 600, icon: '💦', d: '對全體敵人造成光屬性傷害。' });
I('darkmatter', '暗黑物質', { kind: 'use', use: 'i_darkmatter', price: 0, sell: 3000, icon: '🌑', d: '對全體敵人造成巨大闇屬性傷害。' });
I('tent', '帳篷', { kind: 'use', price: 250, field: true, tent: true, icon: '⛺', d: '在存檔點使用，全體完全回復。' });
I('seed_hp', '生命果實', { kind: 'use', price: 0, sell: 1000, field: true, seed: 'hp', icon: '🍎', d: '永久提升最大 HP 30。' });
I('seed_atk', '力量果實', { kind: 'use', price: 0, sell: 1000, field: true, seed: 'atk', icon: '🍇', d: '永久提升攻擊 2。' });
I('seed_mag', '魔力果實', { kind: 'use', price: 0, sell: 1000, field: true, seed: 'mag', icon: '🫐', d: '永久提升魔力 2。' });
I('seed_spd', '速度果實', { kind: 'use', price: 0, sell: 1000, field: true, seed: 'spd', icon: '🍊', d: '永久提升速度 1。' });
I('echoshard', '迴響碎片', { kind: 'use', price: 0, sell: 500, field: true, echoEP: 200, icon: '💠', d: '讓一位隊友身上的迴響獲得 200 EP。' });
// loot that is only for selling (and for the smith's upgrades)
I('fang', '獸牙', { kind: 'loot', sell: 30, icon: '🦷', d: '可以賣錢。' });
I('feather', '羽毛', { kind: 'loot', sell: 30, icon: '🪶', d: '可以賣錢。' });
I('jelly', '軟凍', { kind: 'loot', sell: 20, icon: '🟢', d: '可以賣錢。' });
I('scale', '鱗片', { kind: 'loot', sell: 120, icon: '🐟', d: '可以賣錢。' });
I('ore', '礦石', { kind: 'loot', sell: 150, icon: '🪨', d: '可以賣錢。' });
I('silk', '絲線', { kind: 'loot', sell: 200, icon: '🧵', d: '可以賣錢。' });
I('gem', '寶石', { kind: 'loot', sell: 800, icon: '💎', d: '可以賣錢。' });
I('dragonscale', '龍鱗', { kind: 'loot', sell: 2500, icon: '🐉', d: '可以賣很多錢。' });
I('starfrag', '星之碎片', { kind: 'loot', sell: 6000, icon: '⭐', d: '可以賣很多錢。' });

// ---------------------------------------------------------------- weapons: one line of tiers per kind
const BLOW = { sword: 'slash', spear: 'pierce', staff: 'strike', axe: 'strike', gun: 'shot', katana: 'slash' };
const ICON = { sword: '🗡️', spear: '🔱', staff: '🪄', axe: '🪓', gun: '🔫', katana: '⚔️' };
const TIER_ATK = [12, 20, 30, 42, 56, 72, 90, 112, 138, 168, 205, 250];
const TIER_PRICE = [80, 300, 800, 1800, 3600, 6500, 11000, 18000, 30000, 0, 0, 0];
const WEAPONS = {
  sword: [['bronzesword', '青銅劍'], ['ironsword', '鐵劍'], ['steelsword', '鋼劍'], ['flamesword', '炎之劍', 'fire'], ['knightsword', '騎士劍'], ['mythrilsword', '秘銀劍'], ['runesword', '符文劍', 'light'], ['crystalsword', '晶鋼劍'], ['dragonsword', '龍鱗劍', 'fire'], ['excalibur', '聖劍・白隼', 'light'], ['ragnarok', '終焉之劍', 'dark'], ['dawnblade', '黎明之刃', 'light']],
  spear: [['bronzespear', '青銅槍'], ['ironspear', '鐵槍'], ['steelspear', '鋼槍'], ['icespear', '冰之槍', 'ice'], ['partisan', '長柄槍'], ['mythrilspear', '秘銀槍'], ['windspear', '疾風槍', 'wind'], ['crystalspear', '晶鋼槍'], ['dragonspear', '龍騎士之槍'], ['gungnir', '神槍・冰月', 'ice'], ['longinus', '命運之槍', 'light'], ['polaris', '北極星', 'ice']],
  staff: [['oakstaff', '橡木杖'], ['maplestaff', '楓木杖'], ['silverstaff', '銀之杖'], ['lightstaff', '光之杖', 'light'], ['healstaff', '治癒之杖'], ['mythrilstaff', '秘銀杖'], ['sagestaff', '賢者之杖'], ['crystalstaff', '水晶杖', 'light'], ['angelstaff', '天使之杖'], ['songstaff', '晶之歌杖', 'light'], ['stardust', '星塵杖', 'light'], ['worldtree', '世界樹之杖']],
  axe: [['handaxe', '手斧'], ['ironaxe', '鐵斧'], ['warhammer', '戰鎚'], ['rockaxe', '岩斧', 'earth'], ['greataxe', '巨斧'], ['mythrilhammer', '秘銀鎚'], ['quakeaxe', '震地斧', 'earth'], ['crystalaxe', '晶鋼斧'], ['dragonaxe', '屠龍斧'], ['forgefather', '鍛冶之父', 'earth'], ['titanhammer', '泰坦之鎚', 'earth'], ['worldbreaker', '破界者']],
  gun: [['flintlock', '燧發槍'], ['pistol', '手槍'], ['rifle', '來福槍'], ['voltgun', '雷電槍', 'thunder'], ['skygun', '天空槍'], ['mythrilgun', '秘銀槍砲'], ['stormgun', '暴風槍', 'wind'], ['crystalgun', '晶鋼槍砲'], ['dragongun', '龍息砲', 'fire'], ['silverwing', '銀翼', 'thunder'], ['railgun', '電磁砲', 'thunder'], ['starcannon', '星之砲']],
  katana: [['wakizashi', '脇差'], ['katana', '打刀'], ['kotetsu', '虎徹'], ['murasame', '村雨', 'water'], ['kikuichi', '菊一文字'], ['masamune0', '影打'], ['yoizuki', '宵月', 'dark'], ['crystalkatana', '晶鋼刀'], ['ryujin', '龍神丸'], ['masamune', '正宗', 'dark'], ['muramasa', '妖刀', 'dark'], ['amenohabakiri', '天羽羽斬']],
};
for (const kind in WEAPONS) WEAPONS[kind].forEach(([id, n, el], t) => {
  const atk = TIER_ATK[t] + (el ? 0 : 3), mag = kind === 'staff' ? Math.round(TIER_ATK[t] * 0.8) : kind === 'gun' ? Math.round(TIER_ATK[t] * 0.2) : 0;
  I(id, n, { kind: 'weapon', wtype: kind, tier: t, atk: kind === 'staff' ? Math.round(atk * 0.55) : atk, mag, el, blow: BLOW[kind], price: TIER_PRICE[t], sell: TIER_PRICE[t] ? TIER_PRICE[t] / 2 : 4000 * t, icon: ICON[kind],
    d: `${n}：攻擊 ${kind === 'staff' ? Math.round(atk * 0.55) : atk}${mag ? '・魔力 ' + mag : ''}${el ? `・附帶${({ fire: '火', ice: '冰', thunder: '雷', water: '水', wind: '風', earth: '土', light: '光', dark: '闇' })[el]}屬性` : ''}` });
});
// ---------------------------------------------------------------- armour: heavy, light, robe
const TIER_DEF = [6, 11, 17, 24, 32, 41, 51, 62, 75, 90, 108, 128];
const ARMOR = {
  heavy: [['leatherplate', '皮甲'], ['chainmail', '鎖子甲'], ['ironarmor', '鐵甲'], ['steelplate', '鋼甲'], ['knightarmor', '騎士鎧'], ['mythrilarmor', '秘銀鎧'], ['diamondarmor', '鑽石鎧'], ['crystalarmor', '水晶鎧'], ['dragonmail', '龍鱗鎧'], ['whitehawk', '白隼聖鎧'], ['genji', '源氏之鎧'], ['aegis', '神盾之鎧']],
  light: [['leathervest', '皮背心'], ['travelcoat', '旅人外套'], ['scoutgarb', '斥候服'], ['ninjagarb', '忍裝束'], ['pirategarb', '空賊外套'], ['mythrilvest', '秘銀背心'], ['shadowgarb', '影之衣'], ['crystalvest', '水晶背心'], ['dragoncoat', '龍皮大衣'], ['skyking', '天空王之衣'], ['nightveil', '夜之帳'], ['phantom', '幻影之衣']],
  robe: [['cottonrobe', '棉袍'], ['silkrobe', '絹袍'], ['whiterobe', '白袍'], ['magerobe', '魔導士袍'], ['templerobe', '神殿袍'], ['mythrilrobe', '秘銀袍'], ['sagerobe', '賢者之袍'], ['crystalrobe', '水晶之袍'], ['angelrobe', '天使之衣'], ['songrobe', '聆晶之衣'], ['starrobe', '星之法衣'], ['goddessrobe', '女神之衣']],
};
for (const kind in ARMOR) ARMOR[kind].forEach(([id, n], t) => {
  const def = Math.round(TIER_DEF[t] * (kind === 'heavy' ? 1 : kind === 'light' ? 0.8 : 0.6)), spr = Math.round(TIER_DEF[t] * (kind === 'robe' ? 0.9 : kind === 'light' ? 0.5 : 0.3)), spd = kind === 'light' ? Math.floor(t / 3) + 1 : 0;
  I(id, n, { kind: 'armor', atype: kind, tier: t, def, spr, spd, price: TIER_PRICE[t] ? Math.round(TIER_PRICE[t] * 0.9) : 0, sell: TIER_PRICE[t] ? Math.round(TIER_PRICE[t] * 0.45) : 3500 * t, icon: kind === 'heavy' ? '🛡️' : kind === 'light' ? '🧥' : '👘',
    d: `${n}：防禦 ${def}・精神 ${spr}${spd ? '・速度 +' + spd : ''}` });
});
// ---------------------------------------------------------------- accessories
const A = (id, n, o, price, d) => I(id, n, { kind: 'acc', ...o, price, sell: Math.round((price || 2000) / 2), icon: '💍', d });
A('powerring', '力量戒指', { atk: 8 }, 600, '攻擊 +8');
A('magicring', '魔力戒指', { mag: 8 }, 600, '魔力 +8');
A('guardring', '守護戒指', { def: 8, spr: 4 }, 600, '防禦 +8・精神 +4');
A('speedboots', '疾風之靴', { spd: 4 }, 1500, '速度 +4');
A('hpbangle', '生命手環', { hpP: 10 }, 1200, '最大 HP +10%');
A('mpbangle', '魔力手環', { mpP: 15 }, 1200, '最大 MP +15%');
A('antidoteamulet', '解毒護符', { resist: ['poison'] }, 400, '不會中毒');
A('sleepless', '清醒耳環', { resist: ['sleep'] }, 600, '不會睡著');
A('goldhairpin', '金髮簪', { resist: ['silence'], mpSave: 0 }, 900, '不會沉默');
A('glasses', '眼鏡', { resist: ['blind'] }, 500, '不會黑暗');
A('ribbonless', '麻痺護符', { resist: ['paralyze', 'stop'] }, 1600, '不會麻痺、停止');
A('ribbon', '緞帶', { resist: ['poison', 'sleep', 'silence', 'blind', 'paralyze', 'slow', 'berserk', 'doom', 'stop', 'confuse'] }, 0, '不會陷入任何異常狀態');
A('firering', '火焰戒指', { resEl: ['fire'] }, 2000, '火屬性傷害減半');
A('icering', '寒冰戒指', { resEl: ['ice'] }, 2000, '冰屬性傷害減半');
A('thunderring', '雷電戒指', { resEl: ['thunder'] }, 2000, '雷屬性傷害減半');
A('waterring', '流水戒指', { resEl: ['water'] }, 2000, '水屬性傷害減半');
A('windring', '疾風戒指', { resEl: ['wind'] }, 2000, '風屬性傷害減半');
A('earthring', '大地戒指', { resEl: ['earth'] }, 2000, '土屬性傷害減半');
A('lightring', '光明戒指', { resEl: ['light'] }, 4000, '光屬性傷害減半');
A('darkring', '暗影戒指', { resEl: ['dark'] }, 4000, '闇屬性傷害減半');
A('hastecharm', '加速護符', { auto: 'haste' }, 0, '戰鬥開始時自動加速');
A('protectcharm', '護盾護符', { auto: 'protect' }, 8000, '戰鬥開始時自動護盾');
A('regencharm', '再生護符', { auto: 'regen' }, 0, '戰鬥開始時自動再生');
A('breakcharm', '破防徽章', { brkP: 25 }, 6000, '破防力 +25%');
A('critcharm', '會心徽章', { crit: 15 }, 6000, '會心率 +15%');
A('resonator', '共鳴石', { resP: 30 }, 0, '共鳴量累積速度 +30%');
A('expcharm', '經驗護符', { xpP: 50 }, 0, '獲得經驗值 +50%');
A('epcharm', '迴響護符', { epP: 50 }, 0, '迴響獲得 EP +50%');
A('gilcharm', '招財貓', { gilP: 50 }, 0, '獲得金錢 +50%');
A('genjiglove', '源氏手甲', { atk: 20, crit: 10 }, 0, '攻擊 +20・會心 +10%');
A('sagering', '賢者之戒', { mag: 20, mpSave: 25 }, 0, '魔力 +20・MP 消耗 -25%');
A('hero', '勇者之證', { atk: 15, def: 15, mag: 15, spr: 15, spd: 5 }, 0, '全能力上升');
A('cyruscrown', '灰冕', { atk: 14, spd: 4, resist: ['slow', 'stop'], resP: 20 }, 0, '賽勒斯的王冠。攻擊 +14・速度 +4・不會緩速、停止・共鳴 +20%');
A('crystalheart', '水晶之心', { hpP: 25, mpP: 25, resP: 50 }, 0, '最大 HP、MP +25%・共鳴 +50%');

// ---------------------------------------------------------------- key items (story)
const K = (id, n, d, icon = '🔑') => I(id, n, { kind: 'key', icon, d });
K('knightbadge', '見習騎士徽章', '白隼騎士團的見習徽章。洛恩每天早上都會擦一遍。', '🎖️');
K('windshard', '風之晶片', '風之水晶碎掉時留下的碎片。還在微微發亮。', '💠');
K('watershard', '水之晶片', '沉沒神殿的水晶碎片。', '💠');
K('fireshard', '火之晶片', '熔岩坑道的水晶碎片。', '💠');
K('iceshard', '冰之晶片', '冰晶宮的水晶碎片。', '💠');
K('earthshard', '土之晶片', '古代遺跡的水晶碎片。', '💠');
K('thundershard', '雷之晶片', '雷鳴之塔的水晶碎片。', '💠');
K('lightshard', '光之晶片', '光之神殿的水晶碎片。', '💠');
K('darkshard', '闇之晶片', '影之城的水晶碎片。', '💠');
K('reedpass', '渡船券', '蘆葦村渡船的乘船券。', '🎫');
K('minepass', '礦坑通行證', '鐵爐堡礦工公會的通行證。', '🎫');
K('shipdeed', '船契', '藍帆港「海燕號」的使用許可。', '📜');
K('dashwhistle', '奔奔鳥哨子', '吹了就會有奔奔鳥跑來。', '📯');
K('mirrorkey', '鏡之鑰', '能打開古代遺跡深處的門。', '🗝️');
K('sakuracharm', '櫻之守', '櫻花鄉巫女給的護身符。', '🌸');
K('sewerkey', '下水道鑰匙', '白隼城地下水道的鑰匙。', '🗝️');
K('airshipkey', '銀翼號之鑰', '飛空艇「銀翼號」的鑰匙。', '🛩️');
K('shadowkey', '影之鑰', '影之城的鑰匙。', '🗝️');
K('timekey', '時之鑰', '學院都市最深處的鑰匙。', '⌛');
K('voidkey', '虛空之鑰', '通往虛空之塔頂端的鑰匙。', '🌀');
K('lettervera', '母親的信', '薇拉的母親寫給賽勒斯、一直沒寄出去的信。', '✉️');
K('brannlocket', '小墜子', '布朗女兒的墜子，裡面有一張全家的畫像。', '📿');
K('niacompass', '父親的羅盤', '妮雅父親的羅盤，指針永遠指著銀翼號。', '🧭');
K('luckyrod', '幸運釣竿', '蘆葦村漁夫阿漁的釣竿。握把被磨得發亮。', '🎣');
K('ellasbrooch', '艾拉的胸針', '布朗的女兒艾拉的胸針，火焰形狀的銅片。', '🔥');
K('lighthouseoil', '燈塔的燈油', '藍帆港燈塔需要的特製燈油。', '🛢️');
K('chick', '奔奔鳥雛鳥', '從金沙城馬廄逃走的奔奔鳥寶寶。毛茸茸的。', '🐣');
K('dancefan', '舞孃的扇子', '金沙城舞蹈大賽的優勝獎品。', '🪭');
K('sweetbean', '櫻花豆餡', '櫻花鄉老舖的豆餡，夜最喜歡的東西。', '🍡');
K('oldbook', '古老的日記', '一千年前某位騎士的日記。字跡溫柔。', '📔');
K('bountycard', '獵人卡', '懸賞公會的會員卡。打倒懸賞目標後到任一城鎮的告示板領獎。', '🪪');

export const item = (id) => ITEMS[id];
// what each town sells (by chapter it opens), weapons and armour picked by tier
export function shopStock(tierW, extra = []) {
  const out = ['potion', 'antidote', 'eyedrop', 'echograss', 'phoenix', ...extra];
  for (const k of Object.keys(WEAPONS)) for (const t of tierW) if (WEAPONS[k][t]) out.push(WEAPONS[k][t][0]);
  for (const k of Object.keys(ARMOR)) for (const t of tierW) if (ARMOR[k][t]) out.push(ARMOR[k][t][0]);
  return out;
}
export const WEAPON_TABLE = WEAPONS, ARMOR_TABLE = ARMOR;
