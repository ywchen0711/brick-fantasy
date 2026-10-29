// Chapter 1: the water crystal. Reedvale and its fog, a grey-robed preacher, the swamp, the sunken temple, a hydra,
// the grey knight again — and he knows Vera's name.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
export const GK = { age: 'adult', swordBrows: true, colors: { top: '#5a5a66', bottom: '#2a2a32' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#e8ecf6' }, mask: '#6a6a76' };
export const GKG = { cape: '#4a4a56', crown: '#9a9aa6', shoulder: '#6a6a76', weapon: 'sword', helm: '#6a6a76' };
export default function (A, BOSSES) {
  // ================================================================ Reedvale
  A('reedvale', { when: () => !F('c1_in'), enter: async (D) => {
    D.set('c1_in');
    await D.say('lin', '哇……房子都是木頭做的！河裡有魚耶！', { happy: true });
    await D.say('vera', '蘆葦村。王都的米和魚，有一半是從這裡來的。');
    await D.say('lorne', '可是……好安靜。大家看起來都很沒精神。');
    await D.say('vera', '先找村長問問看吧。村長家應該在廣場附近。');
  } });
  A('reedvale', { npc: { id: 'elder', name: '賀爺爺（村長）', look: 'elder', seed: 3, at: ['plaza', -4, -2], mark: () => !F('c1_elder'), talk: async (D) => {
    if (!F('c1_elder')) {
      await D.say('elder', '王都的騎士大人……你們是為了「霧」來的嗎？');
      await D.say('lorne', '霧？我們是來調查水之晶的。');
      await D.say('elder', '一個月前，南邊的沼澤開始起霧。霧散的那天早上，沼澤中央浮出了一座神殿——「沉沒神殿」。');
      await D.say('elder', '從那天起，河水就變得冰冷，魚也不見了。孩子們夜裡會聽到哭聲……');
      await D.say('lin', '……是水晶。水之晶也在哭。', { mood: -0.4 });
      await D.say('elder', '還有一件事。最近村子裡來了一個穿灰色袍子的人，到處跟人說「水晶是牢籠」。大家都被他弄得心神不寧。');
      await D.say('vera', '灰色……灰冕的人嗎。');
      await D.say('elder', '沼澤在村子南邊的出口。拜託你們了，騎士大人。');
      D.set('c1_elder'); D.set('ch1swamp');
      D.toast('目標：從蘆葦村南邊進入迷霧沼澤');
    } else if (!F('watershard')) await D.say('elder', '沉沒神殿在沼澤的最南端。霧很濃，別走散了。');
    else await D.say('elder', '河水變暖了！魚也回來了！謝謝你們，騎士大人們！', { happy: true });
  } } });
  A('reedvale', { when: () => !F('watershard') && !F('c1_preach'), npc: { id: 'preacher', name: '灰袍人', at: ['plazaW', -2, 3], spec: { age: 'adult', colors: { top: '#6a6a72', bottom: '#4a4a52' }, outfit: { top: 'robe' }, robe: { inner: '#4a4a52', trim: '#9a9aa6' }, hair: { style: 'short', color: '#8a8a8a' } }, gear: { hood: '#6a6a72' }, talk: async (D) => {
    await D.say('preacher', '你們也是來看水晶的嗎？', { name: '灰袍人' });
    await D.say('preacher', '人們說水晶的歌聲是祝福。可是有誰問過——被關在水晶裡的英雄們，想不想唱歌呢？', { name: '灰袍人' });
    await D.say('lorne', '你是灰冕的人？');
    await D.say('preacher', '我只是一個聽見過哭聲的人。……小姑娘，妳也聽得見吧？', { name: '灰袍人' });
    await D.say('lin', '……', { mood: -0.3 });
    await D.say('vera', '少胡說八道。灰冕騎士毀了風之晶，害得多少人擔心受怕！');
    await D.say('preacher', '是嗎。那妳哥哥呢？他也是「胡說八道」嗎？', { name: '灰袍人' });
    await D.emote('vera', '!');
    await D.say('vera', '你……你說什麼！？', { brow: 0.8 });
    await D.say('preacher', '……我說多了。願水晶裡的人們，有一天能夠安息。', { name: '灰袍人' });
    D.remove('preacher'); D.set('c1_preach');
    await D.say('lorne', '薇拉……', { mood: -0.2 });
    await D.say('vera', '……沒事。走吧。', { mood: -0.5 });
  } } });
  A('reedvale', { npc: { id: 'fisher', name: '阿漁', look: 'sailor', seed: 7, at: ['plaza', 10, 6], mark: () => F('c1_elder') && !F('q_rod'), talk: async (D) => {
    if (F('q_rod')) { await D.say('fisher', '這根釣竿最近釣到好多魚！你們要不要吃烤魚？', { happy: true, name: '阿漁' }); return; }
    if (D.has('luckyrod')) { await D.say('fisher', '這、這是我的幸運釣竿！你們真的找到了！', { happy: true, name: '阿漁' }); D.take('luckyrod'); D.set('q_rod'); await D.say('fisher', '這是謝禮，我年輕時在沼澤撿到的。', { name: '阿漁' }); await D.give('magicring'); return; }
    await D.say('fisher', '唉……我的幸運釣竿，被沼澤裡的大青蛙搶走了。那可是我爺爺留下來的。', { name: '阿漁' });
    await D.say('fisher', '如果你們去沼澤，看到閃閃發光的東西，那八成就是了。拜託了！', { name: '阿漁' }); D.set('q_rod_start');
  } } });
  A('reedvale', { npc: { id: 'herbgran', name: '藥草婆婆', look: 'elder', seed: 11, at: ['plazaE', 2, -4], mark: () => !F('q_herb'), talk: async (D) => {
    const N = { name: '藥草婆婆' };
    if (F('q_herb')) { await D.say('herbgran', '解毒草泡茶最好喝了。下次再來喝茶喔。', { ...N, happy: true }); return; }
    if (D.has('antidote', 3)) { await D.say('herbgran', '喔喔，是解毒草！給婆婆三株好嗎？', N); const c = await D.choose('', ['給她三株解毒草', '先不要']); if (c === 0) { D.take('antidote', 3); D.set('q_herb'); await D.say('herbgran', '好孩子。這個護身符給你們，聽說能擋住毒蛇的牙。', { ...N, happy: true }); await D.give('antidoteamulet'); } return; }
    await D.say('herbgran', '沼澤的毒氣讓村裡好多人病倒了。如果有三株「解毒草」，婆婆就能熬藥了……', N); D.set('q_herb_start');
    await D.say('herbgran', '道具店有賣，沼澤裡的魔物身上也偷得到喔。', N);
  } } });
  A('reedvale', { npc: { id: 'rv_kid', look: 'kid', seed: 21, at: ['plaza', 3, 5], wander: 3, name: '村裡的小孩', lines: [['晚上河邊會有人在哭……媽媽說不可以去看。'], ['騎士姐姐的槍好酷！可以借我摸一下嗎？']] } });
  A('reedvale', { npc: { id: 'rv_woman', look: 'woman', seed: 23, at: ['plazaN', -5, 0], wander: 2, name: '洗衣的婦人', lines: [['河水好冰，衣服都洗不乾淨。'], ['聽說王都的騎士在追一個戴灰色王冠的人。好可怕。']] } });
  A('reedvale', { when: () => F('watershard'), npc: { id: 'rv_man', look: 'man', seed: 29, at: ['plaza', -6, 5], name: '村民', lines: [['魚回來了！今晚吃烤魚！', '你們是英雄！']] } });
  quest({ id: 'rod', n: '漁夫的幸運釣竿', start: 'q_rod_start', end: 'q_rod', d: '蘆葦村的阿漁在沼澤弄丟了爺爺留下的釣竿。', hint: () => '在迷霧沼澤找找閃閃發光的東西。' });
  quest({ id: 'herb', n: '藥草婆婆的藥', start: 'q_herb_start', end: 'q_herb', d: '把三株解毒草帶給蘆葦村的藥草婆婆。', hint: () => `目前有 ${G.s.inv.antidote || 0} 株。` });

  // ================================================================ the misty swamp
  A('mistswamp', { when: () => !F('c1_swamp'), enter: async (D) => {
    D.set('c1_swamp');
    await D.say('lorne', '霧好濃……連自己的腳都快看不見了。');
    await D.say('lin', '這邊。水晶的聲音從南邊傳過來。', { mood: -0.2 });
    await D.say('vera', '洛恩，別亂跑。走散了可沒人找得到你。');
    await D.say('lorne', '為什麼每次都只針對我！');
  } });
  A('mistswamp', { when: () => F('q_rod_start') && !F('q_rod_got'), prop: { type: 'pickup', at: 'chest3', item: 'luckyrod', flag: 'q_rod_got', text: '泥巴裡插著一根閃閃發亮的釣竿。' } });
  A('mistswamp', { trigger: { at: 'mid1', r: 3, once: 'c1_voice', run: async (D) => {
    await D.say('lin', '……！', { mood: -0.5 });
    await D.say('', '「……放我們出去……好冷……好暗……」', { sys: true });
    await D.say('lorne', '小鈴？妳怎麼了？');
    await D.say('lin', '剛剛……水晶裡的人在說話。他說「好冷、好暗」。', { mood: -0.6 });
    await D.say('vera', '……水晶裡的人？', { brow: 0.4 });
    await D.say('lin', '我不知道……可是那個聲音，好像很難過。');
    await D.say('vera', '（灰袍人說的話……不，不可能。）', { mood: -0.3 });
  } } });

  // ================================================================ the sunken temple
  A('sunken1', { when: () => !F('c1_temple'), enter: async (D) => {
    D.set('c1_temple');
    await D.say('vera', '牆上全是水草……這座神殿真的在水底沉了上千年。');
    await D.say('lorne', '地上有新的腳印。有人比我們先來了。');
    await D.say('lin', '水晶在最下面。我們要快一點。');
  } });
  A('sunken3', { prop: { type: 'altar', at: 'altar', color: '#3a8aff', broken: () => F('watershard') } });
  A('sunken3', { when: () => !F('watershard'), trigger: { at: 'bossFront', r: 3, once: 'c1_hydra', run: async (D) => {
    D.music('tension');
    await D.say('lin', '水晶……還在！太好了！', { happy: true });
    D.shake(1, 0.3);
    await D.say('', '水池中央的水面鼓了起來——有什麼巨大的東西從底下爬了上來！', { sys: true });
    await D.say('lorne', '好多顆頭！？');
    await D.say('vera', '是被水晶的哭聲吵醒的守護獸……來了！');
    await D.battle(['boss_hydra'], { boss: true });
    await D.say('lin', '水晶……我聽得見你。你想說什麼？', { mood: 0.1 });
    D.flash('#3a8aff', 900); D.sfx('water');
    await D.say('', '「……孩子……聽我說……我們不是守護者……我們是……」', { sys: true });
    D.spawn({ id: 'gk', name: '灰冕騎士', at: ['altar', 2, 2], dir: -Math.PI / 2, spec: GK, gear: GKG, anywhere: true });
    await D.say('gk', '……又是你們。', { name: '灰冕騎士' });
    await D.say('vera', '灰冕騎士！這次休想得逞！', { browIn: 0.8 });
    await D.say('', '薇拉衝了上去——灰冕騎士只是輕輕揮了一劍。一陣風把她連人帶槍掀到了牆邊。', { sys: true });
    D.shake(0.5, 0.25); D.sfx('wind');
    await D.say('vera', '嗚……！', { mood: -0.8 });
    await D.say('lorne', '薇拉！');
    await D.say('gk', '妳的槍法，還是老毛病：衝得太快，忘了看腳下。', { name: '灰冕騎士' });
    await D.say('vera', '……為什麼……你會知道……', { brow: 0.6 });
    await D.say('gk', '……', { name: '灰冕騎士' });
    D.sfx('dark'); D.flash('#3a8aff', 800); D.breakAltar();
    await D.say('', '灰冕騎士把水晶的「心」握在手中。水晶無聲地碎了。', { sys: true });
    await D.say('gk', '回去吧，薇拉。回到王都，什麼都別問。……這是為了妳好。', { name: '灰冕騎士' });
    D.remove('gk'); D.sfx('wind');
    await D.say('lorne', '可惡……又讓他跑了。', { mood: -0.6 });
    await D.say('vera', '……他叫我「薇拉」的樣子……就像……', { mood: -0.7 });
    await D.say('lin', '大家……水晶的碎片裡，有光。', { mood: 0.2 });
    D.flash('#ffffff', 1000);
    await D.say('', '「……謝謝妳聽見我們，小小的聆晶者。」\n水與光的兩道迴響，落進了小鈴的手心。', { sys: true });
    await D.echo('hyde');
    await D.echo('roland');
    await D.give('watershard');
    await D.say('lin', '水晶裡的人說……「我們不是守護者」。那他們是什麼呢？', { mood: -0.2 });
    await D.say('lorne', '……不知道。但一定有誰知道答案。');
    await D.say('vera', '灰冕騎士……我一定要抓住他，問個清楚。', { browIn: 0.8 });
    await D.fade(true, 800);
    await D.goto('reedvale', 'n', { noFade: false });
  } } });
  // ================================================================ back in Reedvale: the pass is open
  A('reedvale', { when: () => F('watershard') && !F('pass_east'), enter: async (D) => {
    D.spawn({ id: 'miner', name: '鐵爐堡的礦工', look: 'miner', at: ['plaza', 0, 2], dir: Math.PI });
    const N = { name: '鐵爐堡的礦工' };
    await D.say('miner', '喂！你們就是王都來的騎士吧？太好了，終於找到了！', N);
    await D.say('miner', '我是從東邊的礦都鐵爐堡來的。王都東邊山口的落石，我們礦工總算清掉了！', N);
    await D.say('miner', '可是……鐵爐堡出大事了。灰色的傢伙們闖進城裡，把老鐵匠布朗的女兒抓走了！他們說要找「火之晶」！', N);
    await D.say('lorne', '灰冕！他們的下一個目標是火之晶！');
    await D.say('vera', '鐵爐堡在王都的東邊，穿過山口就到了。我們走！');
    D.remove('miner'); D.set('pass_east');
    await D.chapter(2, '火之晶', '鐵匠與熔岩');
    D.toast('目標：往東穿過山口，前往礦都鐵爐堡');
  } });
}
