// Chapter 7: Whitehawk falls. The capital under grey banners, the king asleep under a curse, Mordain's accusation, the
// dungeon, a bard's lute that still sings, Captain Rex's help, and the sewers out.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
const MORD = { age: 'elder', beard: '#e8e8e8', colors: { top: '#3a2a5a', bottom: '#3a2a5a' }, outfit: { top: 'robe' }, robe: { inner: '#d8a838', trim: '#d8a838' }, hair: { style: 'bald' } };
const MORDG = { beardLong: '#e8e8e8', weapon: 'staff', wcolor: '#a050ff', cape: '#2a1a4a' };
const REX = { age: 'adult', stubble: true, swordBrows: true, colors: { top: '#c8ccd4', bottom: '#2a3a6a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#5a3a1a' } };
export { MORD, MORDG, REX };
export default function (A, BOSSES) {
  A('whitehawk_r', { when: () => !F('c7_caught'), enter: async (D) => {
    D.music('tension');
    await D.say('lorne', '……這是王都？', { mood: -0.6 });
    await D.say('vera', '到處都是灰色的旗子……城門上的白隼旗被拆掉了。', { mood: -0.6 });
    D.spawn({ id: 'soldier1', name: '教團士兵', look: 'guard', at: ['center', -2, -3], dir: Math.PI, gear: { hood: '#4a4a56', weapon: 'spear' }, specX: { colors: { top: '#4a4a56', bottom: '#2a2a32' } } });
    D.spawn({ id: 'soldier2', name: '教團士兵', look: 'guard', at: ['center', 2, -3], dir: Math.PI, gear: { hood: '#4a4a56', weapon: 'spear' }, specX: { colors: { top: '#4a4a56', bottom: '#2a2a32' } } });
    await D.say('soldier1', '找到了！就是他們——「毀滅水晶的叛徒」！');
    await D.say('lorne', '叛徒！？我們！？', { brow: 0.8 });
    await D.say('soldier2', '大賢者莫迪恩大人有令：見到就帶去王座之間！');
    await D.say('brann', '……要打出去嗎？', { browIn: 0.8 });
    await D.say('vera', '不。……我們本來就要見他。問清楚之前，不要動手。', { mood: -0.3 });
    D.set('c7_caught');
    await D.fade(true, 900);
    await D.goto('castle', 'door', { noFade: false });
  } });
  A('castle', { when: () => F('c7_caught') && !F('c7_throne'), npc: { id: 'mordain', name: '大賢者 莫迪恩', at: 'king', dir: 0, spec: MORD, gear: MORDG, fixed: true } });
  A('castle', { when: () => F('c7_caught') && !F('c7_throne'), enter: async (D) => {
    await D.walk('lorne', [[9, 10], [9, 8], [9, 7]], 3);
    await D.say('mordain', '歡迎回來，年輕的騎士們。旅途辛苦了。');
    await D.say('vera', '陛下呢？艾德蒙陛下在哪裡！', { browIn: 0.8 });
    await D.say('mordain', '陛下病倒了。在他康復之前，由我暫代國政。……真是令人心痛，在這種時候。');
    await D.say('mordain', '風、水、火、冰、土、雷……六顆水晶，全都碎了。而每一次，你們都「剛好」在場。');
    await D.say('lorne', '那是灰冕——還有格里姆幹的！格里姆是你的手下！', { browIn: 1 });
    await D.say('mordain', '證據呢？你們身上帶著水晶的碎片。身邊還站著灰冕的刺客。');
    await D.say('yoru', '……莫迪恩。', { browIn: 1 });
    await D.say('mordain', '你看，連叛徒都承認認識我了。這不是很好笑嗎？', { happy: true });
    await D.say('lin', '……莫迪恩爺爺。古代遺跡的壁畫上，畫著你的杖。', { mood: -0.5 });
    await D.say('mordain', '……', {});
    await D.say('mordain', '聆晶者。妳果然聽得見。……真是好孩子。', { happy: true });
    await D.say('mordain', '把他們關進地牢。聆晶者也一起——好好看著。我很快就會需要她。');
    await D.say('nia', '「需要她」？你想對小鈴做什麼！', { browIn: 1 });
    await D.say('mordain', '把他們帶下去。');
    D.set('c7_throne');
    await D.fade(true, 1000);
    D.music('sad');
    await D.goto('prison', 'door', { noFade: false });
  } });
  A('castle', { when: () => F('c7_throne') && !F('ch11'), enter: async (D) => {
    await D.say('', '王座之間的門被厚重的鎖鏈鎖住了。裡面傳來低沉的念咒聲。', { sys: true });
    await D.goto('whitehawk_r', 'castle');
  } });
  // ================================================================ the dungeon
  A('prison', { when: () => !F('c7_escape'), npc: { id: 'bard', name: '老吟遊詩人', look: 'elder', seed: 91, at: ['center', 3, -2], specX: { colors: { top: '#a83a8a', bottom: '#3a2a4a' } }, talk: async (D) => {
    if (!F('c7_bard')) {
      await D.say('bard', '……新來的嗎。年輕人，這裡的飯很難吃喔。');
      await D.say('bard', '我？我唱了一首諷刺大賢者的歌，就被關進來了。哈哈。');
      await D.say('lin', '爺爺的琴……在唱歌。', { mood: 0.1 });
      await D.say('bard', '喔？這把琴是我師父的師父的師父傳下來的。據說裡面住著一千年前的吟遊詩人。');
      D.flash('#e8a0d0', 900);
      await D.say('', '「……有人聽見了呢。我最後一首歌還沒寫完，小姑娘，帶我去把它寫完吧。」', { sys: true });
      D.set('c7_bard');
      await D.echo('kin');
      await D.say('bard', '……琴弦自己響了？哈哈，看來它很喜歡妳。', { happy: true });
    } else await D.say('bard', '逃出去的話，替我唱一首歌給外面的天空聽吧。');
  } } });
  A('prison', { when: () => !F('c7_escape'), enter: async (D) => {
    if (F('c7_cell')) return; D.set('c7_cell');
    await D.say('brann', '……可惡。斧頭被收走了。', { mood: -0.6 });
    await D.say('nia', '鎖頭的話，給我五分鐘。空賊的基本技能。', { happy: true });
    await D.say('vera', '……莫迪恩說「需要小鈴」。他到底想做什麼……', { mood: -0.6 });
    await D.say('lin', '……沒關係。大家都在，我不怕。', { mood: 0.2 });
  } });
  A('prison', { when: () => !F('c7_escape'), trigger: { at: [0, 0, 20, 20], once: 'c7_rexcome', run: async (D) => {
    if (!F('c7_bard')) { D.unset('c7_rexcome'); return; }
    D.spawn({ id: 'rex', name: '雷克斯隊長', at: ['front', 0, 1], dir: Math.PI, spec: REX, gear: { cape: '#2a3a8a', weapon: 'sword' } });
    await D.say('rex', '噓——！小鬼們，是我。');
    await D.say('lorne', '雷克斯隊長！', { happy: true });
    await D.say('rex', '聽好。陛下不是生病，是被莫迪恩下了咒，一直昏睡不醒。騎士團有一半被教團收買了。');
    await D.say('rex', '我會留在王都想辦法救陛下。你們從地牢的排水口進下水道，逃到城外去。');
    await D.say('rex', '還有——妮雅，對吧？搶走你們飛空艇的鐵翼伯爵，跟莫迪恩是一夥的。他的空賊要塞在王都東北邊的山頂上。');
    await D.say('nia', '……鐵翼伯爵！', { browIn: 1 });
    await D.say('rex', '有了飛空艇，你們就能去任何地方。去吧！你們的武器，我放在排水口那邊了。');
    await D.say('vera', '隊長……謝謝你。', { mood: 0.3 });
    await D.say('rex', '說好的，等這一切結束，我教你們開船。……活下去啊。', { happy: true });
    D.remove('rex'); D.set('c7_escape');
    await D.fade(true, 700);
    await D.goto('sewer1', 'up', { noFade: false });
    D.toast('目標：從地下水道逃出王都');
  } } });
  // ================================================================ the sewers
  A('sewer1', { when: () => !F('c7_sewer'), enter: async (D) => {
    D.set('c7_sewer');
    await D.say('brann', '……好臭。我寧願回熔岩坑道。', { mood: -0.5 });
    await D.say('nia', '下水道的出口在城外的河邊。往深處走就對了。');
  } });
  A('sewer2', { when: () => !F('ch8'), trigger: { at: 'bossFront', r: 3, once: 'c7_warden', run: async (D) => {
    D.shake(0.8, 0.3); D.sfx('quake');
    await D.say('', '出口的鐵柵前，一個巨大的機械人亮起了紅色的眼睛。', { sys: true });
    await D.say('', '【逃獄者，確認。執行處分。】', { sys: true });
    await D.say('nia', '莫迪恩連這種東西都準備好了！', { browIn: 1 });
    await D.battle(['boss_warden'], { boss: true });
    await D.say('lorne', '出口！是外面的天空！', { happy: true });
    await D.fade(true, 900);
    D.set('ch8'); D.set('ch8fort');
    await D.goto('world', 'whitehawk');
    await D.say('vera', '……我們成了通緝犯。', { mood: -0.5 });
    await D.say('nia', '那就當通緝犯！先去搶回銀翼號——然後，所有的帳一起算！', { browIn: 0.8 });
    await D.say('yoru', '空賊要塞……王都東北，山頂。', { name: '夜' });
    await D.chapter(8, '銀翼', '天空的鑰匙');
    D.toast('目標：潛入王都東北山頂的空賊要塞');
  } } });
}
