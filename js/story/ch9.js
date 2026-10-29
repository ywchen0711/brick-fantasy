// Chapter 9: the shadow castle. Ash village burned by Grim's men, Cyrus joining for a while, the black forest, Ella
// found, General Grim, and the dark crystal opened by Lin's song.
import { flag, G, removeMember } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
const ELLA = { age: 'kid', cheeks: true, lashes: true, colors: { top: '#c8582a', bottom: '#5a3a2a' }, outfit: { top: 'tee' }, hair: { style: 'ponytail', color: '#8a4a20', clip: '#ffd84a' } };
export default function (A, BOSSES) {
  A('ashvillage', { when: () => !F('c9_in'), enter: async (D) => {
    D.set('c9_in');
    await D.say('lin', '……房子都燒焦了。', { mood: -0.6 });
    await D.say('brann', '格里姆的人幹的。……可惡。', { browIn: 1 });
    D.spawn({ id: 'cyrus', hero: 'cyrus', at: ['plaza', 0, -2], dir: Math.PI });
    await D.say('cyrus', '你們來了。');
    await D.say('cyrus', '這個村子，以前叫「楓葉村」。格里姆為了在黑森林蓋城，把村民趕走、燒了房子。剩下的人留下來，改名叫「灰燼村」。');
    await D.say('vera', '……哥哥，你一直在幫這些人？', { mood: 0.2 });
    await D.say('cyrus', '……只是順便。', { mood: 0 });
    await D.say('cyrus', '黑森林在村子西邊。屏障已經被光之晶的光打開了。影之城在森林的最北邊。');
    await D.say('cyrus', '這一次，我跟你們一起去。……如果你們不介意的話。');
    await D.say('lorne', '當然不介意！歡迎加入，賽勒斯！', { happy: true });
    await D.say('nia', '哦～臉紅了。灰冕騎士原來會臉紅啊～', { happy: true });
    await D.say('cyrus', '……閉嘴。', { mood: -0.2 });
    D.remove('cyrus');
    await D.join('cyrus', Math.max(46, G.s.party.lorne.lv + 2));
    D.set('ch9castle');
    await D.say('', '{g}【賽勒斯】{/g}暫時加入隊伍。他精通風與水的劍技，還能用「鐵壁」保護同伴。', { sys: true });
    D.toast('目標：穿過黑森林，前往北邊的影之城');
  } });
  A('ashvillage', { npc: { id: 'ash_chief', name: '村長代理 蘿絲', look: 'woman', seed: 101, at: ['plazaN', 2, 0], talk: async (D) => {
    if (!F('c9_ella')) { await D.say('ash_chief', '那位銀髮的騎士，一直偷偷送食物給我們。他說他叫賽勒斯，是「做錯了很多事的人」。'); return; }
    await D.say('ash_chief', '艾拉在我們這裡很安全。等一切結束，再來接她吧。');
  } } });
  A('ashvillage', { when: () => F('c9_ella'), npc: { id: 'ella', name: '艾拉', spec: ELLA, at: ['plaza', 3, 2], talk: async (D) => {
    if (!F('q_ella_talk')) { D.set('q_ella_talk'); await D.say('ella', '爸爸說你們是他的「小鬼朋友」。……謝謝你們來救我。', { happy: true }); await D.say('ella', '這個給你們。是我在影之城的牢裡，用鐵條偷偷磨出來的！'); await D.give('powerring'); return; }
    await D.say('ella', '爸爸以前從來不笑的。可是剛剛跟你們說話的時候，他一直在笑喔。', { happy: true });
  } } });
  A('ashvillage', { npc: { id: 'ash_k', look: 'kid', seed: 103, at: ['plaza', -4, 4], wander: 2, name: '小孩', lines: [['黑森林裡有會走路的花，會把人吃掉！'], ['我們的房子燒掉了……可是爸爸說，房子可以再蓋。']] } });
  A('ashvillage', { npc: { id: 'ash_m', look: 'man', seed: 105, at: ['plazaE', 2, 3], name: '伐木工', lines: [['影之城是一個月內蓋起來的。黑色的石頭，從地底下冒出來……那不是人蓋得出來的東西。']] } });

  A('blackforest', { when: () => !F('c9_forest'), enter: async (D) => {
    D.set('c9_forest');
    await D.say('nia', '這森林……連鳥叫都沒有。', { mood: -0.4 });
    await D.say('cyrus', '虛無的氣息。森林裡的生物，有一半已經被它染黑了。小心點。');
  } });
  A('shadow1', { when: () => !F('c9_castle'), enter: async (D) => {
    D.set('c9_castle');
    await D.say('brann', '艾拉……老子來了。', { browIn: 1 });
    await D.say('yoru', '……牢房在第二層。我以前在這裡待過。', { name: '夜' });
  } });
  A('shadow2', { when: () => !F('c9_ella'), trigger: { at: 'goal', r: 3, once: 'c9_cell', run: async (D) => {
    D.spawn({ id: 'ella', name: '艾拉', spec: ELLA, at: ['goal', 0, -2], dir: 0 });
    await D.say('ella', '……爸爸？是爸爸嗎！？', { happy: true });
    await D.say('brann', '艾拉！！', { happy: true });
    await D.say('', '布朗用斧頭一下子劈開了牢門，把艾拉緊緊抱進懷裡。', { sys: true });
    await D.say('brann', '……對不起。爸爸來晚了。', { mood: -0.3 });
    await D.say('ella', '我知道爸爸一定會來的。我一路上都在牆上刻小火焰喔。', { happy: true });
    await D.say('brann', '……嗯。看到了。每一個都看到了。', { happy: true });
    await D.say('ella', '爸爸……格里姆說，要用我打開「門」。他讓我摸了一個黑色的大水晶……那個水晶，一直在哭。', { mood: -0.4 });
    await D.say('lin', '闇之晶……就在這座城裡。', { mood: -0.3 });
    await D.say('cyrus', '我送她出城。灰燼村的人會照顧她。你們先往上走，我隨後就到。');
    D.remove('ella'); D.set('c9_ella');
    await D.say('brann', '……賽勒斯。拜託你了。', { mood: 0 });
    await D.say('cyrus', '放心。我用灰冕之名發誓。', { mood: 0.2 });
  } } });
  A('shadow3', { prop: { type: 'altar', at: 'altar', color: '#a050ff', broken: () => F('darkshard') } });
  A('shadow3', { when: () => !F('darkshard'), trigger: { at: 'bossFront', r: 3, once: 'c9_grim', run: async (D) => {
    D.spawn({ id: 'grim', name: '闇之魔將 格里姆', at: ['boss', 0, 0], dir: 0, spec: { age: 'adult', skinBrick: '#5a3a6a', paint: 'demon', swordBrows: true, colors: { top: '#1c1022', bottom: '#1c1022' }, outfit: { top: 'coat' }, hair: { style: 'spiky', color: '#a050ff' } }, gear: { horns: '#1c1c1c', cape: '#5a1a5a', shoulder: '#2a1a3a', weapon: 'axe' }, scale: 1.4, anywhere: true });
    await D.say('grim', '鐵匠的女兒也被帶走了？哼，算了，鑰匙已經用不著了。');
    await D.say('cyrus', '格里姆。六顆水晶的心，交出來。', { browIn: 1 });
    await D.say('grim', '晚了，賽勒斯。心已經送到莫迪恩大人那裡了——學院都市的時之迴廊。');
    await D.say('grim', '你這個天真的傢伙，以為拿走心就能讓魂安息？哈哈！你只是替莫迪恩大人做了最麻煩的工作！', { happy: true });
    await D.say('cyrus', '……！', { mood: -0.8 });
    await D.say('vera', '哥哥，不是你的錯。騙人的是他們。', { mood: 0.2 });
    await D.say('yoru', '格里姆。……妹妹的帳，現在算。', { name: '夜', browIn: 1 });
    D.remove('grim');
    await D.battle(['boss_shadowlord'], { boss: true });
    await D.say('', '格里姆的鎧甲崩落，裡面只剩下一團黑霧。黑霧扭曲著，發出最後的笑聲。', { sys: true });
    await D.say('', '「……莫迪恩大人……會成為神……虛無……終究會……」', { sys: true });
    await D.say('yoru', '……小夜。結束了。', { name: '夜', mood: -0.2 });
    await D.say('lin', '闇之晶……也讓我唱吧。', { mood: 0 });
    D.music('hope'); D.flash('#a050ff', 1500); D.sfx('echo');
    D.breakAltar();
    await D.say('', '黑色的水晶在歌聲中碎成光。那光一點也不黑，溫暖得像夕陽。', { sys: true });
    await D.say('', '「……原來黑暗裡，也能聽見這麼溫柔的歌。」\n「哈！總算可以活動筋骨了！」\n闇與獸的兩道迴響，落進了小鈴的手心。', { sys: true });
    await D.echo('morr');
    await D.echo('buck');
    await D.give('darkshard');
    await D.say('cyrus', '學院都市「艾爾德」……莫迪恩建立的學術之都。在王都東南方的高台上，只有飛空艇上得去。');
    await D.say('lorne', '那就用銀翼號飛上去！這一次，絕對要阻止他！', { browIn: 1 });
    await D.fade(true, 800);
    await D.goto('world', 'shadowcastle');
    await D.chapter(10, '時之迴廊', '千年的約定');
    D.toast('目標：搭飛空艇降落在學院都市艾爾德（王都東南的高台）');
  } } });
}
