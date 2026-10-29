// Chapter 3: the sea. Bluesail, a pickpocket who is really a sky pirate, the coral cave at low tide, the pirates'
// fortress and Captain Hook, the kraken, and a ship of our own.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
const NIA = { name: '金髮少女' };
export default function (A, BOSSES) {
  // ================================================================ Bluesail
  A('bluesail', { when: () => !F('c3_in'), enter: async (D) => {
    D.set('c3_in'); D.music('port');
    await D.say('lin', '是海！好大！好藍！', { happy: true });
    await D.say('brann', '哈，第一次看到海嗎？鹹的喔。');
    D.spawn({ id: 'nia', hero: 'nia', at: ['plaza', 3, 2], dir: Math.PI });
    await D.walk('nia', [[D.G().map.x + 1, D.G().map.z - 1], [D.G().map.x - 1, D.G().map.z + 1]], 7);
    D.sfx('coin');
    await D.say('nia', '啊，抱歉抱歉～借過一下！', { ...NIA, happy: true });
    D.remove('nia');
    await D.say('lorne', '……咦？我的錢包！？', { brow: 0.8 });
    await D.say('vera', '被偷了。你真是全大陸最好偷的人。');
    D.G().gil = Math.max(0, D.G().gil - 100);
    await D.say('brann', '那丫頭往南邊碼頭跑了。去問問港務長吧！');
    D.toast('目標：向碼頭的港務長打聽小偷的下落');
  } });
  A('bluesail', { npc: { id: 'harbor', name: '港務長', look: 'sailor', seed: 41, at: ['dock', 0, -3], mark: () => F('c3_in') && !F('lowtide'), talk: async (D) => {
    if (!F('lowtide')) {
      await D.say('harbor', '金髮的丫頭？喔，是那個空賊吧。她三天前從天上掉下來——字面上的意思，坐著一艘小滑翔機。');
      await D.say('harbor', '她剛剛往南邊的沙洲跑了。正好退潮，沙洲露出來了，可以一直走到「珊瑚洞窟」。');
      await D.say('lorne', '空賊……？');
      await D.say('harbor', '話說回來，你們是王都的騎士吧？港口現在麻煩大了。海裡出現了一隻叫「克拉肯」的大海魔，南邊海賊島的海賊們又霸佔了航路。');
      await D.say('harbor', '我們港口最好的船「海燕號」，也被海賊搶走了。現在一艘船都出不了港。');
      await D.say('vera', '灰冕的人呢？有沒有看到帶著箱子的灰衣人？');
      await D.say('harbor', '灰衣人……有。他們在海魔出現之前搭船往北走了。北邊是雪國。');
      await D.say('brann', '……又慢了一步。', { mood: -0.5 });
      await D.say('lorne', '先去追那個空賊吧！沙洲在藍帆港的南邊！');
      D.set('lowtide'); D.toast('目標：退潮了！從藍帆港南邊的沙洲走到珊瑚洞窟');
    } else if (!F('ship')) await D.say('harbor', '海燕號被海賊搶走了。要是能搶回來就好了……');
    else await D.say('harbor', '海燕號就交給你們了！北邊是雪國，西邊是沙漠，東邊是櫻花鄉。好好航行吧！', { happy: true });
  } } });
  A('bluesail', { npc: { id: 'keeper', name: '燈塔看守', look: 'elder', seed: 43, at: ['dockR', 0, -2], mark: () => !F('q_oil'), talk: async (D) => {
    if (F('q_oil')) { await D.say('keeper', '燈塔又亮起來了。夜裡的船都看得見回家的路了。', { happy: true }); return; }
    if (D.has('lighthouseoil')) { await D.say('keeper', '這是……燈塔的特製燈油！在海賊那裡找到的？'); D.take('lighthouseoil'); D.set('q_oil'); await D.say('keeper', '謝謝你們！這個戒指，是我年輕時從雷雨裡撈起來的。', { happy: true }); await D.give('thunderring'); return; }
    await D.say('keeper', '燈塔的燈油被海賊搶走了。沒有燈，夜裡的漁船都回不了家……'); D.set('q_oil_start');
  } } });
  A('bluesail', { npc: { id: 'bs_s1', look: 'sailor', seed: 47, at: ['plaza', -6, 4], wander: 2, name: '水手', lines: [['克拉肯的觸手比船桅還粗！我親眼看到的！'], ['南邊的海賊島，以前是燈塔守的小島。現在被海賊佔了。']] } });
  A('bluesail', { npc: { id: 'bs_w1', look: 'woman', seed: 49, at: ['plazaN', 4, 0], name: '魚販', lines: [['船出不了港，魚都賣光了。'], ['那個金髮的空賊丫頭？她會幫碼頭的小孩修玩具。不是壞人啦，只是手腳不太乾淨。']] } });
  A('bluesail', { npc: { id: 'bs_k1', look: 'kid', seed: 51, at: ['plaza', 4, 6], wander: 3, name: '小孩', lines: [['天上掉下來的姐姐說，她要開飛空艇帶我去看雲！']] } });
  quest({ id: 'oil', n: '燈塔的燈油', start: 'q_oil_start', end: 'q_oil', d: '藍帆港的燈塔看守的燈油被海賊搶走了。', hint: () => '海賊要塞裡也許找得到。' });

  // ================================================================ the coral cave
  A('coral1', { when: () => !F('c3_coral'), enter: async (D) => {
    D.set('c3_coral');
    await D.say('lin', '牆壁在發光……好漂亮。', { happy: true });
    await D.say('brann', '是發光珊瑚。別碰，會被螫。');
    await D.say('vera', '地上有小小的腳印。那個空賊在前面。');
  } });
  A('coral2', { prop: { type: 'altar', at: 'goal', color: '#5ac8a8', broken: () => F('c3_ivy'), talk: async (D) => {
    if (F('c3_ivy')) return;
    await D.say('lin', '這裡……有一個小小的祭壇。水晶的碎片在唱歌。');
    D.flash('#5ac8a8', 900);
    await D.say('', '「我在這裡等了好久喔。陪我一起去旅行，好不好？」', { sys: true });
    D.set('c3_ivy');
    await D.echo('ivy');
  } } });
  A('coral2', { when: () => !F('c3_nia'), trigger: { at: 'room1', r: 3, once: 'c3_niafight', run: async (D) => {
    D.spawn({ id: 'nia', hero: 'nia', at: ['room1', 0, -2], dir: 0 });
    await D.say('nia', '走開！走開啦！這隻螃蟹也太大了吧！？', NIA);
    await D.say('lorne', '是那個小偷！她被魔物包圍了！');
    await D.say('brann', '先救人再說！');
    await D.battle(['giantcrab', 'hermit', 'hermit']);
    D.face('nia', 'lorne');
    await D.say('nia', '……呼。得救了。謝啦。', NIA);
    await D.say('nia', '喏，錢包還你。裡面就一百塊，我還以為騎士都很有錢呢。', { ...NIA, happy: true });
    D.G().gil += 100;
    await D.say('lorne', '你、你這個人……！');
    await D.say('nia', '我叫妮雅，空賊團「銀翼」的——嗯，前頭目的女兒。', { name: '妮雅' });
    await D.say('nia', '三個月前，「鐵翼伯爵」那個混蛋偷襲了我們。爸爸……死了。我們的飛空艇「銀翼號」也被搶走，扣在他的空賊要塞裡。', { name: '妮雅', mood: -0.5 });
    await D.say('nia', '我要搶回銀翼號。可是要去要塞，得先有一艘船，所以我想去海賊島「借」一艘。', { name: '妮雅' });
    await D.say('brann', '「借」……', { brow: 0.5 });
    await D.say('vera', '海賊島的海賊搶走了港口的海燕號。我們本來就要把它搶回來。');
    await D.say('nia', '真的？那我們目標一樣嘛！一起去吧，騎士小哥！', { name: '妮雅', happy: true });
    await D.say('lin', '……妮雅姐姐。妳的口袋裡，有東西在唱歌。');
    await D.say('nia', '咦？這個？這是爸爸留下的水晶碎片。他說是從一個古代盜賊的墓裡挖出來的……', { name: '妮雅' });
    D.flash('#6a8a5a', 900);
    await D.say('', '「呵呵，小丫頭，妳爸爸可是我見過最好的小偷。……我來幫幫他女兒吧。」', { sys: true });
    D.remove('nia'); D.set('c3_nia');
    await D.join('nia', Math.max(16, G.s.party.lorne.lv));
    await D.echo('shippu');
    await D.say('nia', '……爸爸。', { mood: -0.2 });
    await D.say('nia', '好！洞窟的另一頭有漁夫的小船，從那裡划去海賊島！', { happy: true });
    await D.say('', '{g}【妮雅】{/g}用「偷竊」可以從敵人身上偷到道具，「雷擊彈」是雷屬性射擊。', { sys: true });
    D.toast('目標：走到洞窟深處，搭小船前往海賊島');
  } } });
  A('coral2', { when: () => F('c3_nia') && !F('ch3pirate'), trigger: { at: 'goal', r: 2, once: 'c3_boat', run: async (D) => {
    await D.say('nia', '就是這艘！小是小了點，划到海賊島沒問題。');
    await D.say('brann', '……這船裝得下我嗎？', { brow: 0.4 });
    D.set('ch3pirate');
    await D.fade(true, 900);
    await D.goto('pirateisle', 's', { noFade: false });
  } } });
  // ================================================================ the pirates' isle and fortress
  A('pirateisle', { when: () => !F('c3_isle'), enter: async (D) => {
    D.set('c3_isle');
    await D.say('nia', '海賊島到了。要塞在島的北邊。海燕號應該就停在要塞的碼頭。');
    await D.say('lorne', '好，殺進去！');
    await D.say('vera', '……不要說得像我們才是海賊一樣。');
  } });
  A('piratefort1', { when: () => F('q_oil_start') && !F('q_oil_got'), prop: { type: 'pickup', at: 'chest1', item: 'lighthouseoil', flag: 'q_oil_got', text: '桶子上寫著「藍帆港燈塔專用」。', color: '#ffb02a' } });
  A('piratefort2', { when: () => !F('ship'), trigger: { at: 'bossFront', r: 3, once: 'c3_hook', run: async (D) => {
    D.spawn({ id: 'hook', name: '鐵鉤船長', at: ['boss', 0, 0], dir: 0, spec: { age: 'adult', stubble: true, colors: { top: '#2a2a4a', bottom: '#3a2a1a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#1c1c1c' }, hat: { type: 'cap', color: '#c8282a' }, beard: '#1c1c1c' }, gear: { weapon: 'sword', scarf: '#c8282a' }, scale: 1.3, anywhere: true });
    await D.say('hook', '哈哈哈！小鬼們，敢闖進鐵鉤船長的要塞，膽子不小啊！');
    await D.say('nia', '把海燕號還給藍帆港！還有那隻海魔，是不是你們養的！？');
    await D.say('hook', '克拉肯？那傢伙才不聽任何人的話！我們只是趁牠擋住航路，順便做點生意罷了！');
    await D.say('brann', '少廢話。把船交出來。');
    await D.say('hook', '想要船？打贏我再說！小子們，上！');
    D.remove('hook');
    await D.battle(['boss_hook'], { boss: true });
    D.spawn({ id: 'hook', name: '鐵鉤船長', at: ['boss', 0, 0], dir: 0, spec: { age: 'adult', stubble: true, colors: { top: '#2a2a4a', bottom: '#3a2a1a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#1c1c1c' }, hat: { type: 'cap', color: '#c8282a' }, beard: '#1c1c1c' }, gear: { scarf: '#c8282a' }, scale: 1.3, anywhere: true });
    await D.say('hook', '嗚啊……好、好啦！船給你們！船契也給你們！', { mood: -0.6 });
    await D.give('shipdeed');
    await D.say('hook', '可是我先說好……克拉肯還在外海。開船出去，可是會被吃掉的喔！');
    await D.say('lorne', '那就連牠一起打倒！');
    await D.say('nia', '……騎士小哥，你是不是不太會害怕？', { happy: true });
    await D.fade(true, 900);
    await D.goto('deck', 'door', { noFade: false });
  } } });
  // ================================================================ the Seaswallow, and the kraken
  A('deck', { when: () => F('c3_hook') && !F('ship'), enter: async (D) => {
    D.music('airship');
    await D.say('nia', '海燕號，出航！哇，好久沒有掌舵了！', { happy: true });
    await D.say('lin', '船在晃……嗚……', { mood: -0.4 });
    await D.say('brann', '小丫頭，看遠方。看遠方就不會暈。');
    D.shake(1.2, 0.35); D.sfx('water');
    await D.say('vera', '海面下有東西——！');
    await D.say('', '巨大的觸手從海裡衝了出來，纏住了船身！', { sys: true });
    await D.say('nia', '克拉肯！大家抓緊！', { browIn: 1 });
    await D.battle(['boss_kraken'], { boss: true, look: { g: 7, g2: 6, tree: null, sky: ['#3a6ab0', '#a8d0f0'], fog: '#8ab8e0', amb: 0.6 } });
    await D.say('', '克拉肯發出一聲悲鳴，沉回了深海。海面恢復了平靜。', { sys: true });
    await D.say('lorne', '贏、贏了……！', { happy: true });
    await D.say('nia', '哈哈！看到沒！這就是空賊的掌舵技術！', { happy: true });
    await D.fade(true, 900);
    D.set('ship'); await D.vehicle('ship', 134, 162);
    await D.goto('bluesail', 'dock', { noFade: false });
    await D.say('harbor', '海燕號回來了！而且你們打倒了克拉肯！？', { name: '港務長' });
    await D.say('harbor', '這艘船就交給你們吧！藍帆港的大家都會感謝你們的！', { name: '港務長', happy: true });
    await D.say('', '{g}【海燕號】{/g}在世界地圖上走到船旁邊按確定鍵就能上船。海上按確定鍵可以在旁邊的陸地靠岸。', { sys: true });
    await D.say('nia', '有了船，就能去北方的雪國追灰冕了。然後……我要去搶回銀翼號。', { mood: 0.2 });
    await D.say('vera', '雪國的村子叫「霜燈村」，在北方大陸的南岸。');
    await D.chapter(4, '冰之晶', '灰冕的真面目');
    D.toast('目標：搭海燕號往北，前往雪國的霜燈村');
  } });
}
