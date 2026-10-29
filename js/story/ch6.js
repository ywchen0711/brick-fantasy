// Chapter 6: the thunder crystal. Sakura village, an assassin sent for Lin, a duel in the thunder tower, the raijuu,
// and General Grim of the shadow, who names his master.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
const GRIM = { age: 'adult', skinBrick: '#5a3a6a', paint: 'demon', swordBrows: true, colors: { top: '#1c1022', bottom: '#1c1022' }, outfit: { top: 'coat' }, hair: { style: 'spiky', color: '#a050ff' } };
const GRIMG = { horns: '#1c1c1c', cape: '#5a1a5a', shoulder: '#2a1a3a', weapon: 'axe' };
export default function (A, BOSSES) {
  A('sakura', { when: () => !F('c6_in'), enter: async (D) => {
    D.set('c6_in');
    await D.say('lin', '粉紅色的花……好多！好香！', { happy: true });
    await D.say('nia', '櫻花鄉。整年都開著花的地方。據說是雷之晶的力量。');
    await D.say('vera', '鄉裡的神社有巫女。去問問雷之晶的事吧。');
    D.toast('目標：到櫻花鄉的神社找巫女');
  } });
  A('sakura', { npc: { id: 'kaede', name: '巫女 楓', look: 'woman', seed: 81, at: ['plazaN', 0, -1], specX: { colors: { top: '#f4f0e6', bottom: '#c8282a' }, hair: { style: 'ponytail', color: '#1c1c1c' } }, mark: () => !F('c6_kaede'), talk: async (D) => {
    if (!F('c6_kaede')) {
      await D.say('kaede', '……你們，是聽得見雷之晶聲音的人吧。我在夢裡看見了。');
      await D.say('kaede', '北邊的竹林深處，有一座「雷鳴之塔」，雷之晶就在塔頂。');
      await D.say('kaede', '可是，最近鄉裡出現了奇怪的人影。像影子一樣，在屋頂上跑。昨天，有個孩子說，他看見影子拿著刀。');
      await D.say('brann', '灰冕的刺客嗎……');
      await D.say('kaede', '這個給你們。是櫻之守，能保佑你們平安。……尤其是那位小妹妹。影子盯著的，好像是她。');
      await D.give('sakuracharm');
      await D.say('lin', '……我？', { mood: -0.4 });
      D.set('c6_kaede'); D.set('ch6tower');
      D.toast('目標：穿過北邊的幽竹林，登上雷鳴之塔');
    } else await D.say('kaede', '願櫻花守護你們。');
  } } });
  A('sakura', { npc: { id: 'sweets', name: '和菓子店老闆', look: 'elder', seed: 83, at: ['plazaE', 3, -2], specX: { colors: { top: '#8a5a3a', bottom: '#3a2a1a' } }, mark: () => F('c6_yoru') && !F('q_sweet'), talk: async (D) => {
    if (!F('c6_yoru')) { await D.say('sweets', '櫻花豆餡，老夫做了五十年。可惜最近的年輕人都愛吃西洋點心……'); return; }
    if (F('q_sweet')) { await D.say('sweets', '那位黑衣服的客人，每天都來買豆餡呢。', { happy: true }); return; }
    await D.say('sweets', '喔？那位黑衣服的客人……他小時候常常和妹妹一起來買豆餡呢。');
    await D.say('yoru', '……');
    await D.say('sweets', '來，這是老夫招待的。好久不見了，夜。');
    await D.give('sweetbean');
    await D.say('yoru', '……謝謝。', { happy: true });
    await D.say('nia', '……他、他笑了！？夜居然會笑！？', { brow: 0.6 });
    await D.say('yoru', '……吃甜的時候，例外。', { happy: true });
    D.set('q_sweet');
    await D.give('seed_spd');
  } } });
  A('sakura', { npc: { id: 'sk_w', look: 'woman', seed: 85, at: ['plaza', -5, 3], wander: 2, name: '鄉民', lines: [['雷鳴之塔每到夜裡就會打雷。可是最近，雷聲聽起來像是在哭。'], ['竹林裡有天狗。牠們會搶旅人的斗笠。']] } });
  A('sakura', { npc: { id: 'sk_k', look: 'kid', seed: 87, at: ['plaza', 4, 5], wander: 3, name: '小孩', lines: [['我看到了！屋頂上有一個黑黑的人！他在看那個小姐姐！'], ['（小孩在玩紙風車。）']] } });
  quest({ id: 'sweet', n: '櫻花豆餡', start: 'c6_yoru', end: 'q_sweet', d: '和夜一起去櫻花鄉的和菓子店看看。', hint: () => '和菓子店在櫻花鄉廣場的東邊。' });

  A('bamboo', { trigger: { at: 'mid1', r: 3, once: 'c6_ambush', run: async (D) => {
    D.music('tension');
    D.spawn({ id: 'yoru', hero: 'yoru', at: ['mid1', 2, -3], dir: Math.PI, name: '影之刃' });
    D.sfx('slash');
    await D.say('yoru', '……聆晶者。妳的命，我收下了。', { name: '影之刃' });
    await D.say('lorne', '休想！', { browIn: 1 });
    await D.say('', '刀光一閃——洛恩的劍擋住了。竹葉被刀風削下，紛紛落下。', { sys: true });
    D.shake(0.3, 0.15);
    await D.say('yoru', '……擋得住？', { name: '影之刃' });
    await D.say('vera', '你是灰冕的刺客？是誰派你來的！', { browIn: 0.8 });
    await D.say('yoru', '……塔上見。在那裡，沒有竹子礙事。', { name: '影之刃' });
    D.remove('yoru');
    await D.say('lin', '……', { mood: -0.5 });
    await D.say('brann', '小丫頭，別怕。有我們在，誰也碰不了妳一根頭髮。', { happy: true });
    await D.say('lin', '……嗯。可是……那個人的眼睛，好像很寂寞。', { mood: -0.2 });
  } } });
  A('tower1', { when: () => !F('c6_tower'), enter: async (D) => {
    D.set('c6_tower');
    await D.say('nia', '這座塔是木頭做的，還一直在打雷……不會燒起來嗎？');
    await D.say('brann', '別說這種不吉利的話！');
  } });
  BOSSES.yoru = { foes: ['boss_yoru'], show: 'boss_yoru', pre: async (D) => {
    await D.say('boss', '……來了。', { name: '影之刃' });
    await D.say('lorne', '你為什麼要殺小鈴！？她什麼都沒做！');
    await D.say('boss', '命令就是命令。……拔劍吧。', { name: '影之刃' });
  }, post: async (D) => {
    D.remove('boss');
    D.spawn({ id: 'yoru', hero: 'yoru', at: 'boss', dir: 0, name: '影之刃' });
    await D.say('yoru', '……輸了。殺了我吧。', { name: '影之刃' });
    await D.say('lin', '……不要。', { mood: -0.2 });
    D.face('yoru', 'lin');
    await D.say('lin', '剛剛打架的時候，你有三次可以刺中我。可是你每一次都停下來了。', { mood: 0 });
    await D.say('yoru', '……', { name: '影之刃' });
    await D.say('yoru', '……妳和我妹妹一樣大。她叫小夜。五年前，病死了。', { name: '影之刃', mood: -0.6 });
    await D.say('yoru', '格里姆說，只要殺了聆晶者，就讓我妹妹的魂「回來」。他說，他的主人能操縱魂。', { name: '影之刃', mood: -0.5 });
    await D.say('vera', '格里姆……灰冕的將軍？他的主人是誰？', { browIn: 0.6 });
    await D.say('yoru', '……白隼王國的大賢者。莫迪恩。', { name: '影之刃' });
    await D.say('lorne', '……！', { brow: 0.8 });
    await D.say('nia', '壁畫上說的，果然是真的……', { mood: -0.5 });
    await D.say('yoru', '格里姆在收集水晶的心，交給莫迪恩。雷之晶也是。他現在應該已經往塔頂去了。', { name: '影之刃' });
    await D.say('yoru', '……騙我的人，我不會放過。帶我去塔頂。這把刀，從今天起為你們揮。', { name: '夜' });
    D.remove('yoru'); D.set('c6_yoru');
    await D.join('yoru', Math.max(32, G.s.party.lorne.lv));
    await D.say('yoru', '……叫我「夜」。', { name: '夜' });
    await D.say('', '{g}【夜】{/g}的「居合」是快速的斬擊，「影縫」可能讓敵人麻痺。', { sys: true });
  } };
  A('tower4', { prop: { type: 'altar', at: 'altar', color: '#ffe24a', broken: () => F('thundershard') } });
  A('tower4', { when: () => !F('thundershard'), trigger: { at: 'bossFront', r: 3, once: 'c6_raijuu', run: async (D) => {
    D.spawn({ id: 'grim', name: '闇之魔將 格里姆', at: ['altar', 0, 1], dir: Math.PI, spec: GRIM, gear: GRIMG, scale: 1.25, anywhere: true });
    await D.say('grim', '來得正好，夜。……還有聆晶者。真是省了我不少工夫。');
    await D.say('yoru', '格里姆……你騙了我。', { browIn: 1 });
    await D.say('grim', '騙？死人的魂怎麼可能回來。是你自己太蠢了。');
    await D.say('brann', '格里姆！艾拉在哪裡！葛倫說她被送到「北方的影之……」', { browIn: 1 });
    await D.say('grim', '鐵匠的女兒？她在我的影之城，好好地活著——她是開啟某扇門的鑰匙。');
    await D.say('grim', '雷之晶的心，我收下了。陪你們玩的，是這座塔的主人。');
    D.sfx('dark'); D.flash('#ffe24a', 800); D.breakAltar();
    D.remove('grim');
    D.shake(1.2, 0.35); D.sfx('thunder');
    await D.say('', '格里姆消失在黑影裡。雷之晶碎裂的瞬間，一頭雷光凝成的巨獸咆哮著衝了下來！', { sys: true });
    await D.say('vera', '雷神獸！牠失去了水晶，在發狂！', { browIn: 1 });
    await D.battle(['boss_raijuu'], { boss: true });
    await D.say('lin', '……雷神獸，安靜了。', { mood: -0.2 });
    D.flash('#ffffff', 900);
    await D.say('', '「……被搶走了心，可是我們的聲音還在。」\n「小姑娘，那個格里姆……替我們揍他一頓。」\n雷與影的兩道迴響，落進了小鈴的手心。', { sys: true });
    await D.echo('leo');
    await D.echo('kage');
    await D.give('thundershard');
    await D.say('vera', '莫迪恩……大賢者大人在收集水晶的心。那艾德蒙陛下呢？王都的大家呢？', { mood: -0.6 });
    await D.say('lorne', '我們得馬上回王都！告訴陛下真相！', { browIn: 1 });
    await D.fade(true, 800);
    await D.goto('world', 'thundertower');
    await D.chapter(7, '白隼陷落', '王都的謊言');
    D.toast('目標：回到白隼王都，向國王報告');
  } } });
}
