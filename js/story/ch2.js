// Chapter 2: the fire crystal. Forgeholm, a blacksmith whose daughter was taken, General Glen of the Grey Crown in the
// lava tunnels, the lava golem, and a question Lin asks the grey knight.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';
import { GK, GKG } from './ch1.js';

const F = flag;
export default function (A, BOSSES) {
  // ================================================================ Forgeholm
  A('forgeholm', { when: () => !F('c2_brann'), enter: async (D) => {
    D.music('town');
    D.spawn({ id: 'brann', hero: 'brann', at: ['plaza', 0, -2], dir: 0 });
    D.spawn({ id: 'guild', name: '礦工公會長', look: 'miner', seed: 5, at: ['plaza', 0, -5], dir: Math.PI });
    await D.say('brann', '你們礦工公會是一群懦夫！我女兒被抓走了，你們居然叫我「等王都派人來」！？', { browIn: 1 });
    await D.say('guild', '布朗，冷靜點！熔岩坑道裡現在全是魔物，進去就是送死！', { name: '礦工公會長' });
    await D.say('brann', '那就讓我去送死！艾拉才十二歲！');
    await D.say('lorne', '那個……我們就是王都派來的人。');
    D.face('brann', 'lorne');
    await D.say('brann', '……啊？三個小鬼？', { brow: 0.6 });
    await D.say('vera', '白隼王國見習騎士，薇拉。灰冕的人往哪裡去了？');
    await D.say('brann', '……熔岩坑道。那些灰色的傢伙說要找「火之晶」，硬逼艾拉帶路——她從小跟著我進出礦坑，路熟得很。');
    await D.say('lin', '火之晶也在哭……我們一起去救艾拉吧！', { happy: false });
    await D.say('brann', '……哼。王都的騎士都派小鬼來，看來是真的沒人了。');
    await D.say('brann', '好吧！老子布朗，鐵爐堡最好的鐵匠。這把斧頭砍過的岩石比你們吃過的飯還多。帶我一起去！', { happy: true });
    D.remove('brann'); D.remove('guild');
    await D.join('brann', 12);
    D.set('c2_brann'); D.set('ch2mine');
    await D.say('brann', '熔岩坑道在東邊的赤岩荒原再過去。走東門出去！');
    await D.say('', '{g}【隊伍】{/g}布朗的「重擊」破防力很高。隊伍最多四人上場，可以在選單的「隊伍」更換順序。', { sys: true });
    D.toast('目標：從東門出去，穿過赤岩荒原前往熔岩坑道');
  } });
  A('forgeholm', { when: () => F('c2_brann'), npc: { id: 'guild', name: '礦工公會長', look: 'miner', seed: 5, at: ['plaza', 0, -5], talk: async (D) => {
    if (!F('fireshard')) { await D.say('guild', '布朗那傢伙就交給你們了。熔岩坑道的魔物怕冰和水。冰凍瓶在道具店有賣。'); return; }
    if (!F('ch3')) {
      await D.say('guild', '你們回來了！布朗……艾拉呢？');
      await D.say('brann', '……沒找到。灰冕的將軍說，她被送去給「大人物」了。', { mood: -0.6 });
      await D.say('guild', '……我這裡也有消息。昨天有礦工看到灰色的人，帶著一個鎖起來的箱子，往南邊的港都藍帆港去了。');
      await D.say('brann', '箱子……！', { browIn: 1 });
      await D.say('vera', '藍帆港……從那裡出海的話，就追不上了。');
      await D.say('lorne', '那就快點出發！藍帆港在王都的東南邊，海邊！');
      await D.chapter(3, '海與空賊', '藍帆港的少女');
      D.toast('目標：前往王都東南海邊的港都藍帆港');
      return;
    }
    await D.say('guild', '布朗，艾拉一定還活著。那孩子跟你一樣頑固！');
  } } });
  A('forgeholm', { when: () => F('c2_brann'), npc: { id: 'apprentice', name: '學徒小鐵', look: 'kid', seed: 9, at: ['smithKeeper', 0, 0], talk: async (D) => {
    if (!F('q_ore') && D.has('ore', 3)) { await D.say('apprentice', '那是礦石！師父不在的時候我想練習打鐵……可以給我三塊嗎？'); const c = await D.choose('', ['給他三塊礦石', '不要']); if (c === 0) { D.take('ore', 3); D.set('q_ore'); await D.say('apprentice', '謝謝！這是我打的第一個作品，送你們！', { happy: true }); await D.give('guardring'); } return; }
    if (F('q_ore')) { await D.say('apprentice', '等師父回來，我要打一把比師父還好的斧頭！'); return; }
    await D.say('apprentice', '我是布朗師父的學徒！師父的女兒艾拉姐姐，是我最好的朋友……');
    await D.say('apprentice', '師父不在，我想自己練習打鐵，可是沒有礦石。熔岩坑道的魔物身上常有礦石……如果有三塊就好了。'); D.set('q_ore_start');
  } } });
  A('forgeholm', { npc: { id: 'fg_m1', look: 'miner', seed: 31, at: ['plazaE', 2, 3], wander: 2, name: '礦工', lines: [['赤岩荒原的禿鷹會搶便當，小心點。'], ['鐵爐堡的鋼，全大陸最硬！你們的劍要不要換一把？']] } });
  A('forgeholm', { npc: { id: 'fg_w1', look: 'woman', seed: 33, at: ['plazaW', -3, -2], name: '礦工的妻子', lines: [['布朗以前很溫柔的。艾拉的媽媽過世以後，他就把所有的溫柔都打進了鐵裡。']] } });
  A('forgeholm', { npc: { id: 'fg_k1', look: 'kid', seed: 35, at: ['plaza', 5, 4], wander: 3, name: '小孩', lines: [['熔岩坑道最裡面有一顆紅色的大水晶！我爸爸說的！']] } });
  quest({ id: 'ore', n: '學徒的第一件作品', start: 'q_ore_start', end: 'q_ore', d: '鐵爐堡的學徒小鐵想要三塊礦石練習打鐵。', hint: () => `目前有 ${G.s.inv.ore || 0} 塊礦石（岩石魔像、機械礦車常掉）。` });

  // ================================================================ the badlands
  A('badlands', { when: () => !F('c2_bad'), enter: async (D) => {
    D.set('c2_bad');
    await D.say('brann', '赤岩荒原。這裡的岩石是紅的，因為底下就是熔岩。');
    await D.say('lin', '好熱……', { mood: -0.3 });
    await D.say('brann', '哈哈！這才哪到哪。坑道裡更熱。小丫頭，水要省著喝。');
  } });

  // ================================================================ the lava tunnels
  A('lava1', { when: () => !F('c2_lava'), enter: async (D) => {
    D.set('c2_lava');
    await D.say('brann', '……艾拉留下的記號。在牆上刻一個小火焰，這是我教她的。', { mood: 0.2 });
    await D.say('lorne', '她在告訴你方向！');
    await D.say('brann', '那孩子……好樣的。', { happy: true });
  } });
  BOSSES.glen = { foes: ['boss_glen'], pre: async (D) => {
    await D.say('boss', '站住。再往前就是火之晶的祭壇。', { name: '灰冕將軍 葛倫' });
    await D.say('brann', '艾拉在哪裡！？把我女兒還來！', { browIn: 1 });
    await D.say('boss', '那個小丫頭？她把我們帶到這裡，已經沒用了。我們把她送去給「大人」了。', { name: '灰冕將軍 葛倫' });
    await D.say('lorne', '「大人」……是灰冕騎士嗎？');
    await D.say('boss', '哈！那個軟弱的傢伙？他只想讓水晶裡的魂「安息」。我們的大人，要的可是更偉大的東西。', { name: '灰冕將軍 葛倫' });
    await D.say('vera', '你們……灰冕不是一夥的？', { brow: 0.5 });
    await D.say('boss', '話太多了。鐵壁葛倫，在此送你們上路！', { name: '灰冕將軍 葛倫' });
  }, post: async (D) => {
    await D.say('', '葛倫單膝跪下，鎧甲的縫隙冒出黑煙。', { sys: true });
    await D.say('brann', '說！艾拉被送去哪了！');
    await D.say('', '「……北方……影之……」葛倫的身體化成了灰，被熱風吹散了。', { sys: true });
    await D.say('brann', '……可惡！！', { mood: -0.8 });
    await D.say('lin', '布朗叔叔……', { mood: -0.4 });
    await D.say('lorne', '「影之……」什麼？他到底想說什麼……');
    await D.say('vera', '至少知道她還活著。布朗先生，我們一定會找到她。');
    await D.say('brann', '……嗯。先去祭壇。不能讓那些傢伙再碰水晶一下！');
  } };
  A('lava3', { prop: { type: 'altar', at: 'altar', color: '#ff6a2a', broken: () => F('fireshard') } });
  A('lava3', { when: () => !F('fireshard'), trigger: { at: 'bossFront', r: 3, once: 'c2_golem', run: async (D) => {
    await D.say('lin', '火之晶！還沒有被拿走！');
    D.shake(1.2, 0.35);
    await D.say('', '祭壇前的熔岩翻滾起來，岩漿凝成了一個巨人的形狀——', { sys: true });
    await D.say('brann', '熔岩巨像！礦工的傳說是真的……它在守護水晶！');
    await D.say('vera', '牠怕冰和水！大家準備！');
    await D.battle(['boss_lavagolem'], { boss: true });
    D.spawn({ id: 'gk', name: '灰冕騎士', at: ['altar', -2, 2], dir: Math.PI / 2, spec: GK, gear: GKG, anywhere: true });
    await D.say('gk', '……連熔岩巨像都能打倒。你們變強了。', { name: '灰冕騎士' });
    await D.say('brann', '灰冕！你把我女兒怎麼了！？', { browIn: 1 });
    await D.say('gk', '女兒？……葛倫那些人的事，與我無關。灰冕已經不是一條心了。', { name: '灰冕騎士' });
    await D.say('lin', '等一下！', { mood: -0.2 });
    await D.say('lin', '為什麼……為什麼要讓水晶哭？你明明也聽得見，對不對？', { mood: -0.4 });
    await D.say('gk', '……', { name: '灰冕騎士' });
    await D.say('gk', '妳聽不見嗎，聆晶者？它們「本來」就在哭。一千年了，從來沒有停過。', { name: '灰冕騎士' });
    await D.say('gk', '我奪走水晶的心，是為了讓哭聲停下來。', { name: '灰冕騎士' });
    await D.say('lin', '……', { mood: -0.6 });
    D.sfx('dark'); D.flash('#ff6a2a', 800); D.breakAltar();
    await D.say('', '火之晶碎了。灰冕騎士轉身離去，背影消失在熱浪裡。', { sys: true });
    D.remove('gk');
    await D.say('vera', '本來就在哭……？他到底知道什麼……', { mood: -0.4 });
    D.flash('#ffffff', 900);
    await D.say('', '「……哈哈，好久沒這麼痛快地燒一場了！」\n「小姑娘，借妳我的拳頭。」\n火與拳的兩道迴響，落進小鈴的手中。', { sys: true });
    await D.echo('marin');
    await D.echo('gou');
    await D.give('fireshard');
    await D.say('brann', '……喂，小鬼們。', { mood: 0 });
    await D.say('brann', '老子決定了，接下來跟你們走。灰冕的人去哪，我就去哪——直到找回艾拉為止。');
    await D.say('lorne', '布朗先生……謝謝你！', { happy: true });
    await D.say('brann', '叫我布朗就好。「先生」聽了渾身發癢。', { happy: true });
    await D.fade(true, 800);
    await D.goto('forgeholm', 'e');
  } } });
}
