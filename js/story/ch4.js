// Chapter 4: the ice crystal. Frostlamp under an endless winter, Vera's grandmother and a letter never sent, the ice
// palace — and behind the grey helm, the brother Vera has been looking for.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';
import { GK, GKG } from './ch1.js';

const F = flag;
export const CYRUS = { age: 'adult', swordBrows: true, scar: true, colors: { top: '#5a5a66', bottom: '#2a2a32' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#e8ecf6' } };
export const CYRUSG = { cape: '#4a4a56', crown: '#9a9aa6', shoulder: '#6a6a76', weapon: 'sword' };
export default function (A, BOSSES) {
  // ================================================================ Frostlamp
  A('frostlamp', { when: () => !F('c4_in'), enter: async (D) => {
    D.set('c4_in');
    await D.say('lin', '好、好冷……鼻子要掉下來了……', { mood: -0.4 });
    await D.say('nia', '飛空艇上可比這冷多了。小鈴，把我的圍巾拿去。', { happy: true });
    await D.say('vera', '……霜燈村。媽媽的故鄉。', { mood: 0.2 });
    await D.say('lorne', '薇拉的媽媽是這裡的人？');
    await D.say('vera', '嗯。奶奶還住在這裡。我小時候每年冬天都會來……五年前媽媽過世之後，就沒再來過了。');
    D.toast('目標：在霜燈村打聽灰冕的下落');
  } });
  A('frostlamp', { npc: { id: 'granny', name: '艾斯特奶奶', look: 'elder', seed: 61, at: ['plazaW', -2, -3], mark: () => !F('c4_granny'), specX: { lashes: true, colors: { top: '#3a5ab0', bottom: '#e8e8f0' } }, talk: async (D) => {
    if (!F('c4_granny')) {
      await D.say('granny', '……薇拉？是薇拉嗎？哎呀，長這麼大了！', { happy: true });
      await D.say('vera', '奶奶……！', { happy: true });
      await D.say('granny', '來，讓奶奶看看。眼睛跟妳媽媽一模一樣。……妳是來找賽勒斯的吧？');
      await D.emote('vera', '!');
      await D.say('vera', '哥哥……來過這裡？', { brow: 0.8 });
      await D.say('granny', '三年前來過一次，說是任務，問了很多北邊冰晶宮的事。然後……兩個星期前，他又來了。');
      await D.say('granny', '臉色好蒼白，戴著一頂奇怪的灰色頭盔。他抱著我說「對不起」，然後就往冰原去了。');
      await D.say('vera', '灰色的……頭盔……', { mood: -0.6 });
      await D.say('lorne', '薇拉……', { mood: -0.3 });
      await D.say('granny', '薇拉，這個妳拿著。這是妳媽媽寫給賽勒斯的信，那孩子出任務去了，一直沒能交給他。');
      await D.give('lettervera');
      await D.say('granny', '找到他的話，替奶奶交給他。告訴他……不管他做了什麼，奶奶都等他回家。');
      await D.say('vera', '……嗯。我一定會交給他。', { mood: -0.2 });
      D.set('c4_granny'); D.set('ch4palace');
      D.toast('目標：穿過北邊的永凍冰原，前往冰晶宮');
    } else if (!F('iceshard')) await D.say('granny', '冰晶宮在冰原的最北邊。穿暖一點，路上小心。');
    else await D.say('granny', '雪……停了呢。薇拉，下次要帶賽勒斯一起回來喔。', { happy: true });
  } } });
  A('frostlamp', { npc: { id: 'fl_kid', name: '凍僵的小孩', look: 'kid', seed: 63, at: ['plaza', 4, 4], mark: () => !F('q_warm'), talk: async (D) => {
    if (F('q_warm')) { await D.say('fl_kid', '暖爐好暖和！謝謝大哥哥大姐姐！', { happy: true }); return; }
    if (D.has('firebomb', 2)) { await D.say('fl_kid', '那是火焰瓶嗎？可以給我兩個嗎？家裡的暖爐點不起來……'); const c = await D.choose('', ['給他兩個火焰瓶', '不要']); if (c === 0) { D.take('firebomb', 2); D.set('q_warm'); await D.say('fl_kid', '哇，好暖！這是我在雪地裡撿到的紅色果實，給你們！', { happy: true }); await D.give('seed_hp'); } return; }
    await D.say('fl_kid', '好冷……家裡的柴火燒光了，暖爐點不起來……要是有兩個「火焰瓶」就好了。'); D.set('q_warm_start');
  } } });
  A('frostlamp', { npc: { id: 'fl_hunter', look: 'man', seed: 65, at: ['plazaN', 3, 1], name: '獵人', specX: { beard: '#5a3a1a' }, lines: [['冰原上的雪人會吐寒氣，用火燒最有效。'], ['三年前，有個銀髮的年輕騎士請我帶路去冰晶宮。他說他在找「水晶的真相」。']] } });
  A('frostlamp', { npc: { id: 'fl_w', look: 'woman', seed: 67, at: ['plazaE', 2, 2], wander: 2, name: '村民', lines: [['雪已經下了三個月。往年這時候早就融了。'], ['聽說冰晶宮裡有一條冰龍。龍會吃人嗎？']] } });
  quest({ id: 'warm', n: '暖爐的火', start: 'q_warm_start', end: 'q_warm', d: '霜燈村的小孩家裡沒有柴火，需要兩個火焰瓶。', hint: () => `目前有 ${G.s.inv.firebomb || 0} 個火焰瓶。` });

  // ================================================================ the ice field and the ice palace
  A('icefield', { when: () => !F('c4_field'), enter: async (D) => {
    D.set('c4_field');
    await D.say('brann', '一片白。連天和地都分不清了。');
    await D.say('vera', '……哥哥走過這條路。', { mood: -0.3 });
  } });
  A('ice1', { when: () => !F('c4_palace'), enter: async (D) => {
    D.set('c4_palace');
    await D.say('lin', '整座宮殿都是冰做的……好像在鏡子裡面。');
    await D.say('vera', '大家。……如果灰冕騎士是我想的那個人，讓我先跟他說話。', { mood: -0.4 });
    await D.say('lorne', '……嗯。我們陪著妳。');
  } });
  BOSSES.cyrus1 = { foes: ['boss_cyrus1'], show: 'boss_cyrus1', pre: async (D) => {
    await D.say('boss', '……你們還是來了。', { name: '灰冕騎士' });
    await D.say('vera', '……把頭盔拿下來。', { mood: -0.5 });
    await D.say('boss', '……', { name: '灰冕騎士' });
    await D.say('vera', '拿下來！哥哥！', { browIn: 1 });
    await D.say('boss', '……打贏我，我就拿下來。這是妳小時候最常說的吧，薇拉。', { name: '灰冕騎士' });
  }, post: async (D) => {
    D.remove('boss');
    D.spawn({ id: 'cyrus', hero: 'cyrus', at: 'boss', dir: 0 });
    D.sfx('brk');
    await D.say('', '頭盔裂開，掉在冰上。底下是一張蒼白、帶著傷疤、和薇拉一樣有著銀髮的臉。', { sys: true });
    await D.say('cyrus', '……長高了呢，薇拉。');
    await D.say('vera', '哥哥……！為什麼……為什麼是你……！', { mood: -0.8 });
    await D.say('cyrus', '三年前，我奉命去北方的遺跡調查。在那裡，我聽到了水晶真正的聲音。');
    await D.say('cyrus', '水晶不是守護者。它們是牢籠。迴響——那些英雄的魂——一千年來被關在裡面，替某個人「唱歌」。');
    await D.say('lin', '……「我們不是守護者」。水晶裡的人也這麼說過。', { mood: -0.4 });
    await D.say('cyrus', '妳聽得見，所以妳應該懂。我拿走水晶的心，是為了打開牢籠。');
    await D.say('brann', '那艾拉呢！？你們灰冕抓走我女兒，也是為了打開牢籠！？', { browIn: 1 });
    await D.say('cyrus', '……那是格里姆的人。灰冕裡，有一群人在我背後收集水晶的心——交給另一個人。我正在追查。', { mood: -0.4 });
    await D.say('lorne', '另一個人？是誰！？');
    await D.say('cyrus', '……還沒有證據。在那之前，我不能說。', { mood: -0.3 });
    await D.say('cyrus', '冰之晶在上面一層。我先走了。……別跟來。這裡的冰龍，不是你們應付得了的。');
    D.remove('cyrus');
    await D.say('vera', '哥哥！！', { mood: -0.8 });
    await D.say('nia', '……追吧。不管他說什麼，妳都不想就這樣讓他走吧？', { mood: 0.1 });
    await D.say('vera', '……嗯！', { browIn: 0.6 });
  } };
  A('ice3', { prop: { type: 'altar', at: 'altar', color: '#7ad8ff', broken: () => F('iceshard') } });
  A('ice3', { when: () => !F('iceshard'), trigger: { at: 'bossFront', r: 3, once: 'c4_dragon', run: async (D) => {
    D.spawn({ id: 'cyrus', hero: 'cyrus', at: ['altar', 1, 3], dir: Math.PI });
    D.shake(1, 0.3); D.sfx('ice');
    await D.say('cyrus', '……嗚！', { mood: -0.8 });
    await D.say('', '賽勒斯單膝跪在冰上。冰之晶的上方，一條巨大的冰龍張開了翅膀。', { sys: true });
    await D.say('vera', '哥哥！', { browIn: 1 });
    await D.say('cyrus', '叫你們別跟來了……！');
    await D.say('lorne', '少囉嗦！薇拉的哥哥，就是我們的夥伴！大家，上！', { browIn: 1 });
    await D.battle(['boss_icedragon'], { boss: true });
    await D.say('cyrus', '……打倒了冰龍。你們……真的變強了。');
    D.face('vera', 'cyrus');
    await D.say('vera', '哥哥。這個……是奶奶要我交給你的。媽媽寫給你的信。', { mood: -0.2 });
    await D.say('', '賽勒斯打開信。冰晶宮安靜得只剩下他讀信的呼吸聲。', { sys: true });
    await D.say('', '「賽勒斯，二十歲生日快樂。你從小就是個溫柔的孩子，總是把別人的眼淚看得比自己重。媽媽只希望你記得——你也可以哭。」', { sys: true });
    await D.say('cyrus', '……媽……', { mood: -0.9 });
    await D.say('cyrus', '……薇拉。去西方沙漠的「古代遺跡」。遺跡最深處的牆上，畫著一千年前發生的事。', { mood: -0.3 });
    await D.say('cyrus', '看了那幅畫，妳就會明白我為什麼要這麼做。……然後，再決定要不要阻止我。');
    D.sfx('dark'); D.flash('#7ad8ff', 800); D.breakAltar();
    await D.say('', '賽勒斯握住冰之晶的心。這一次，他回頭看了薇拉一眼，才轉身離開。', { sys: true });
    D.remove('cyrus');
    await D.say('vera', '……哥哥。', { mood: -0.6 });
    await D.say('lorne', '薇拉。我們一起去沙漠吧。看了那幅畫，再一起決定。', { mood: 0.2 });
    await D.say('vera', '……謝謝你，洛恩。', { mood: 0.3 });
    D.flash('#ffffff', 900);
    await D.say('', '「……冬天，終於可以結束了。」\n「我的槍，就借給妳吧。」\n冰與龍的兩道迴響，落進了小鈴的手心。', { sys: true });
    await D.echo('yuki');
    await D.echo('hien');
    await D.give('iceshard');
    await D.fade(true, 800);
    await D.goto('frostlamp', 'n');
    await D.say('nia', '西方沙漠……那裡有個大城市叫「金沙城」。搭海燕號往西就到了。');
    await D.chapter(5, '土之晶', '沙中的真相');
    D.toast('目標：搭海燕號往西，前往沙漠的金沙城');
  } } });
}
