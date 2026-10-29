// The party. Stats at level L are base + growth × (L−1) + curve × (L−1)², so the late levels count.
// spec is the minifig (see brick/minifig.js); gear says what is added on top (a cape, a helm, a weapon shape).
export const CHARS = {
  lorne: {
    id: 'lorne', n: '洛恩', en: 'Lorne', title: '白隼見習騎士', weapon: 'sword', armor: ['heavy', 'light'], el: 'fire',
    bio: '十七歲，白隼王國騎士團的見習騎士。衝動、愛逞強，但從不丟下同伴。夢想是當上能駕駛飛空艇的「天空騎士」。',
    base: { hp: 95, mp: 20, atk: 14, def: 11, mag: 7, spr: 8, spd: 10, luk: 8 }, grow: { hp: 24, mp: 3, atk: 2.6, def: 1.9, mag: 1.3, spr: 1.5, spd: 0.55, luk: 0.5 }, curve: { hp: 0.25, mp: 0.02 },
    skills: [[1, 'ironcut'], [5, 'flameslash'], [11, 'provoke'], [20, 'blazesweep'], [29, 'courage'], [40, 'dragonflame'], [52, 'neverfall'], [66, 'crimsonoath']],
    spec: { age: 'adult', colors: { top: '#e8e8f0', bottom: '#2a3a6a', shoes: '#3a2418' }, outfit: { top: 'coat' }, hair: { style: 'spiky', color: '#a8401e' }, swordBrows: true },
    gear: { cape: '#b8282a', shoulder: '#c8ccd4' },
  },
  vera: {
    id: 'vera', n: '薇拉', en: 'Vera', title: '冰槍騎士', weapon: 'spear', armor: ['heavy', 'light'], el: 'ice',
    bio: '十八歲，洛恩的同期與好友。沒落貴族艾斯特家的女兒，冷靜、毒舌，劍術與學識都是第一名。三年前失蹤的哥哥是她心裡的刺。',
    base: { hp: 85, mp: 26, atk: 13, def: 9, mag: 10, spr: 9, spd: 12, luk: 9 }, grow: { hp: 21, mp: 3.5, atk: 2.5, def: 1.6, mag: 1.9, spr: 1.6, spd: 0.65, luk: 0.55 }, curve: { hp: 0.22, mp: 0.03 },
    skills: [[1, 'pierce'], [5, 'frostthrust'], [10, 'armorbreak'], [18, 'blizzard'], [27, 'galestab'], [38, 'icelance'], [50, 'insight'], [64, 'frostbloom']],
    spec: { age: 'adult', lashes: true, colors: { top: '#3a5ab0', bottom: '#e8e8f0', shoes: '#2a2a3a' }, outfit: { top: 'coat' }, hair: { style: 'ponytail', color: '#e8ecf6', clip: '#7ad8ff' } },
    gear: { cape: '#2a3a8a', shoulder: '#a8dcf0' },
  },
  lin: {
    id: 'lin', n: '小鈴', en: 'Lin', title: '聆晶者', weapon: 'staff', armor: ['robe'], el: 'light',
    bio: '十三歲，在風之神殿長大的少女，聽得見水晶的「歌聲」。能召喚封在水晶裡的英雄之魂「迴響」。天真、好奇，很怕寂寞。',
    base: { hp: 70, mp: 40, atk: 7, def: 7, mag: 14, spr: 13, spd: 11, luk: 12 }, grow: { hp: 17, mp: 5.2, atk: 1.2, def: 1.3, mag: 2.7, spr: 2.4, spd: 0.6, luk: 0.7 }, curve: { hp: 0.18, mp: 0.05 },
    skills: [[1, 'listen'], [1, 'cure'], [3, 'lightarrow'], [8, 'purify'], [13, 'prayer'], [19, 'revive'], [26, 'holy'], [34, 'guardsong'], [45, 'greatcure'], [60, 'crystalsong']],
    spec: { age: 'kid', cheeks: true, lashes: true, colors: { top: '#f4f0e6', bottom: '#7ab8e8', shoes: '#c8a040' }, outfit: { top: 'robe', bottom: 'skirt' }, robe: { inner: '#7ad8ff', trim: '#c8a040', belt: '#3a8ad8' }, hair: { style: 'bun', color: '#3a2a5a' } },
    gear: { hood: null, staffGem: '#7af0ff' },
  },
  brann: {
    id: 'brann', n: '布朗', en: 'Brann', title: '鐵爐堡的鐵匠', weapon: 'axe', armor: ['heavy'], el: 'earth',
    bio: '四十二歲，礦都鐵爐堡最頑固的鐵匠，滿臉鬍子、嗓門很大。女兒被灰冕教團抓走後拿起了戰斧。',
    base: { hp: 120, mp: 14, atk: 15, def: 14, mag: 5, spr: 8, spd: 7, luk: 7 }, grow: { hp: 29, mp: 2.2, atk: 2.8, def: 2.3, mag: 0.9, spr: 1.4, spd: 0.45, luk: 0.4 }, curve: { hp: 0.3, mp: 0.01 },
    skills: [[1, 'smash'], [1, 'rockbreak'], [12, 'steelbody'], [19, 'quake'], [26, 'smitheye'], [36, 'shatter'], [48, 'cover'], [62, 'titanfall']],
    spec: { age: 'adult', beard: '#8a4a20', colors: { top: '#6a4a2a', bottom: '#3a3a40', shoes: '#2a1a10' }, outfit: { top: 'coat', apron: '#3a2a1a' }, hair: { style: 'short', color: '#8a4a20' } },
    gear: { helm: '#8a8a90' },
  },
  nia: {
    id: 'nia', n: '妮雅', en: 'Nia', title: '空賊', weapon: 'gun', armor: ['light'], el: 'thunder',
    bio: '十九歲，空賊團「銀翼」的頭目女兒，嘴巴很壞、心很軟。最大的寶藏是父親留下的飛空艇——可惜它被扣在空賊要塞。',
    base: { hp: 80, mp: 24, atk: 12, def: 9, mag: 10, spr: 9, spd: 15, luk: 14 }, grow: { hp: 20, mp: 3.2, atk: 2.4, def: 1.5, mag: 1.7, spr: 1.5, spd: 0.8, luk: 0.8 }, curve: { hp: 0.2, mp: 0.02 },
    skills: [[1, 'steal'], [1, 'voltshot'], [16, 'rapidfire'], [20, 'smoke'], [26, 'thunderstorm'], [33, 'mug'], [42, 'haste'], [58, 'deadeye']],
    spec: { age: 'adult', lashes: true, eyeShadow: 'rgba(200,80,40,0.25)', colors: { top: '#c8582a', bottom: '#4a3a2a', shoes: '#2a1a10' }, outfit: { top: 'coat' }, hair: { style: 'ponytail', color: '#f0c040', clip: '#2a2a2a' }, hat: null },
    gear: { goggles: '#c8a040', scarf: '#2a6ab8' },
  },
  yoru: {
    id: 'yoru', n: '夜', en: 'Yoru', title: '影之刃', weapon: 'katana', armor: ['light'], el: 'dark',
    bio: '年齡不明，曾是灰冕教團的刺客。在櫻花鄉背叛教團，為了償還什麼而揮刀。話很少，吃甜食時會笑。',
    base: { hp: 85, mp: 22, atk: 15, def: 9, mag: 9, spr: 9, spd: 14, luk: 10 }, grow: { hp: 21, mp: 3, atk: 2.7, def: 1.6, mag: 1.6, spr: 1.5, spd: 0.75, luk: 0.6 }, curve: { hp: 0.22, mp: 0.02 },
    skills: [[1, 'iai'], [1, 'shadowbind'], [30, 'mirage'], [33, 'nightslash'], [38, 'shuriken'], [46, 'mumyo'], [60, 'assassinate']],
    spec: { age: 'adult', mask: '#1c1c24', colors: { top: '#2a2a3a', bottom: '#1c1c24', shoes: '#141418' }, outfit: { top: 'robe' }, robe: { inner: '#5a2a6a', trim: '#8a2a3a', belt: '#8a2a3a' }, hair: { style: 'spiky', color: '#1c1c24' } },
    gear: { scarf: '#8a2a3a' },
  },
  cyrus: {
    id: 'cyrus', n: '賽勒斯', en: 'Cyrus', title: '灰冕騎士', weapon: 'sword', armor: ['heavy'], el: 'wind', guest: true,
    bio: '薇拉的哥哥。三年前在任務中失蹤，戴著灰色的王冠盔再度出現，奪走水晶的「心」。',
    base: { hp: 140, mp: 40, atk: 20, def: 15, mag: 14, spr: 14, spd: 13, luk: 10 }, grow: { hp: 30, mp: 4, atk: 3.0, def: 2.2, mag: 2.2, spr: 2.0, spd: 0.7, luk: 0.6 }, curve: { hp: 0.3, mp: 0.03 },
    skills: [[1, 'galeblade'], [1, 'tidecut'], [1, 'greycrown'], [1, 'crosscut'], [1, 'ironwall']],
    spec: { age: 'adult', swordBrows: true, scar: true, colors: { top: '#5a5a66', bottom: '#2a2a32', shoes: '#1c1c22' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#e8ecf6' } },
    gear: { cape: '#4a4a56', crown: '#9a9aa6', shoulder: '#6a6a76' },
  },
};
export const PARTY_ORDER = ['lorne', 'vera', 'lin', 'brann', 'nia', 'yoru', 'cyrus'];
// experience to reach level L (cumulative)
export const xpFor = (L) => Math.round(16 * (L - 1) ** 3 + 60 * (L - 1) ** 2 + 40 * (L - 1));
export function statsAt(c, L) {
  const o = {}; for (const k in c.base) o[k] = Math.round(c.base[k] + c.grow[k] * (L - 1) + (c.curve?.[k] || 0) * (L - 1) ** 2);
  return o;
}
