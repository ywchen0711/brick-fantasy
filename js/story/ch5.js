// Chapter 5: the earth crystal. Goldsand, a runaway dashbird chick, the dancer's contest, the ancient ruins and the
// mural of what happened a thousand years ago — the sage with the purple-gemmed staff — and Lin's song.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';

const F = flag;
export default function (A, BOSSES) {
  // ================================================================ Goldsand
  A('goldsand', { when: () => !F('c5_in'), enter: async (D) => {
    D.set('c5_in');
    await D.say('nia', '金沙城！全大陸最熱鬧的市場！小心你的錢包喔，騎士小哥～', { happy: true });
    await D.say('lorne', '最該小心的人就站在我旁邊……');
    await D.say('vera', '古代遺跡在城外大沙海的南邊。我們先打聽怎麼去。');
    D.toast('目標：在金沙城打聽古代遺跡的事');
  } });
  A('goldsand', { npc: { id: 'hassan', name: '學者 哈桑', look: 'elder', seed: 71, at: ['plazaN', -3, 0], specX: { glasses: '#3a3a3a', colors: { top: '#c8a868', bottom: '#5a4a3a' } }, mark: () => !F('c5_hassan'), talk: async (D) => {
    if (!F('c5_hassan')) {
      await D.say('hassan', '古代遺跡？呵呵，年輕人，那可是我研究了四十年的地方。');
      await D.say('hassan', '遺跡在大沙海的最南端。可是遺跡前面有一片流沙，人的腳一踩下去就會被吞掉。');
      await D.say('hassan', '只有「奔奔鳥」跑得夠快、夠輕，能踩著流沙過去。城東的馬廄有在養。');
      await D.say('hassan', '對了……遺跡最深處有一面壁畫，我年輕時看過一次。畫的是一個拿著杖的賢者，和八個發光的人。我一直看不懂它的意思。');
      await D.say('vera', '……就是那幅畫。', { mood: -0.3 });
      D.set('c5_hassan');
      D.toast('目標：到馬廄借奔奔鳥');
    } else if (!F('earthshard')) await D.say('hassan', '遺跡的機關很古老，裡面的守護者還會動。小心點。');
    else {
      await D.say('hassan', '你們看到了壁畫……賢者把英雄們的魂封進水晶，自己喝下水晶的力量，得到永生？');
      await D.say('hassan', '如果那是真的……那位賢者，現在還活著。');
      await D.say('lin', '……', { mood: -0.5 });
    }
  } } });
  A('goldsand', { npc: { id: 'stable', name: '馬廄老闆', look: 'man', seed: 73, at: ['plazaE', 4, 2], specX: { colors: { top: '#e8a838', bottom: '#5a4a3a' } }, mark: () => F('c5_hassan') && !F('dashbird'), talk: async (D) => {
    if (F('dashbird')) { await D.say('stable', '奔奔鳥跑得還快嗎？想騎的時候吹哨子（R 鍵／🐤 按鈕），牠就會跑來。', { happy: true }); return; }
    if (D.has('chick')) {
      await D.say('stable', '這、這是小奔！你們找到了！', { happy: true }); D.take('chick'); D.set('dashbird');
      await D.say('stable', '我答應過的。這個哨子給你們——世界地圖上吹一下，最快的奔奔鳥就會跑來載你們。');
      await D.give('dashwhistle'); D.set('ch5ruins');
      await D.say('', '{g}【奔奔鳥】{/g}在世界地圖上按 R 鍵（手機按 🐤）騎上奔奔鳥：跑得快、不會遇到敵人、可以越過流沙。再按一次下來。', { sys: true });
      D.toast('目標：騎奔奔鳥越過流沙，前往大沙海南方的古代遺跡');
      return;
    }
    await D.say('stable', '要借奔奔鳥？唉……我現在可沒心情。最小的雛鳥「小奔」昨天跑出城，跑進大沙海裡去了。');
    await D.say('stable', '要是你們能把小奔找回來，我就把最快的奔奔鳥借給你們！牠應該躲在沙海的某個角落發抖……'); D.set('q_chick');
  } } });
  A('goldsand', { npc: { id: 'safa', name: '舞孃團長 莎法', look: 'woman', seed: 75, at: ['plaza', 5, -4], specX: { colors: { top: '#ff6a9a', bottom: '#ffd84a' }, eyeShadow: 'rgba(200,60,120,.3)' }, mark: () => !F('q_dance'), talk: async (D) => dance(D) } });
  A('goldsand', { npc: { id: 'gs_m', look: 'merchant', seed: 77, at: ['plazaW', -2, 3], name: '香料商人', lines: [['沙漠的夜晚冷得要命，白天熱得要命。'], ['金沙城的女王最喜歡舞蹈。每年都有舞蹈大賽喔。']] } });
  A('goldsand', { npc: { id: 'gs_k', look: 'kid', seed: 79, at: ['plaza', -4, 5], wander: 3, name: '小孩', lines: [['沙蟲王會從沙子底下跳出來，一口吞掉一頭駱駝！我爺爺說的！']] } });
  quest({ id: 'chick', n: '迷路的小奔', start: 'q_chick', end: 'dashbird', d: '金沙城馬廄的奔奔鳥雛鳥跑進大沙海了。', hint: () => '在大沙海的角落找找看。' });
  quest({ id: 'dance', n: '舞蹈大賽', start: 'q_dance_start', end: 'q_dance', d: '金沙城的舞孃團長莎法在找能跳「沙之舞」的舞者。', hint: () => (D_has('dancefan') ? '帶著舞孃之扇去找莎法。' : '舞孃之扇好像掉在古代遺跡裡。') });

  // ================================================================ the desert
  A('desert', { when: () => !F('c5_desert'), enter: async (D) => {
    D.set('c5_desert');
    await D.say('brann', '熱、熱死了……我的鬍子要燒起來了……', { mood: -0.5 });
    await D.say('lin', '布朗叔叔的鬍子在冒煙！', { happy: true });
  } });
  A('desert', { when: () => F('q_chick') && !F('c5_chick'), prop: { type: 'pickup', at: 'chest3', item: 'chick', flag: 'c5_chick', text: '仙人掌的影子底下，一隻毛茸茸的奔奔鳥寶寶在發抖。「啾……」', color: '#ffd84a' } });
  A('desert', { when: () => F('earthshard') && !F('c5_king'), enter: async (D) => {
    D.set('c5_king');
    D.shake(1.5, 0.4);
    await D.say('nia', '地、地面在晃！？', { browIn: 1 });
    await D.say('', '沙丘裂開，一隻比房子還大的沙蟲衝上了天空！', { sys: true });
    await D.say('lorne', '是那個小孩說的沙蟲王！');
    await D.battle(['boss_sandking'], { boss: true });
    await D.say('brann', '呼……總算知道駱駝的感受了。', { happy: true });
  } });

  // ================================================================ the ruins
  A('ruins1', { when: () => !F('c5_ruins'), enter: async (D) => {
    D.set('c5_ruins');
    await D.say('lin', '牆壁上到處都是畫……還有字。');
    await D.say('vera', '是古代文字。我在騎士學院學過一點點……「八星之歌，封於晶中」。');
  } });
  A('ruins1', { when: () => F('q_dance_start') && !F('c5_fan'), prop: { type: 'pickup', at: 'chest1', item: 'dancefan', flag: 'c5_fan', text: '石棺旁邊放著一把精美的扇子。', color: '#ff8ab0' } });
  BOSSES.guardian = { foes: ['boss_guardian'], post: async (D) => {
    await D.say('', '古代守護者的眼睛熄滅了。它的胸口掉出一把鏡子般的鑰匙。', { sys: true });
    await D.give('mirrorkey');
    await D.say('vera', '「鏡之鑰」……最深處的門，要用這個打開。');
  } };
  A('ruins3', { prop: { type: 'altar', at: 'altar', color: '#c8904a', broken: () => F('earthshard') } });
  A('ruins3', { when: () => !F('earthshard'), trigger: { at: 'bossFront', r: 3, once: 'c5_mural', run: async (D) => {
    D.music('sad');
    await D.say('lin', '土之晶……！它還在，沒有人碰過！');
    await D.say('vera', '還有……這就是那面壁畫。', { mood: -0.2 });
    await D.say('', '巨大的壁畫上，八個發光的人跪在地上。一個少女在中央唱歌，她的歌聲像繩子一樣，把八個人的光拉進八顆水晶裡。', { sys: true });
    await D.say('', '少女的身後，站著一個拿著長杖的賢者。杖頂鑲著一顆紫色的寶石。賢者的手伸向水晶，水晶的光流進他的身體。', { sys: true });
    await D.say('vera', '「千年之前，虛無降臨。星詠之巫女以歌為引，請八英雄之魂入晶，以鎮虛無。」', { mood: -0.2 });
    await D.say('vera', '「然，賢者負其約。晶不開，魂不歸。賢者飲晶之力，得永生——」', { mood: -0.6 });
    await D.say('brann', '……把人關起來，喝他們的力量，自己長生不老？', { browIn: 1 });
    await D.say('lin', '那根杖……紫色的寶石……', { mood: -0.6 });
    await D.say('lin', '我見過。在王都的城堡裡……是莫迪恩爺爺的杖。', { mood: -0.8 });
    await D.emote('lorne', '!');
    await D.say('lorne', '……大賢者大人！？怎麼可能……他是王國最受尊敬的人啊！', { brow: 0.8 });
    await D.say('nia', '「世界上最老的人」……如果他真的活了一千年呢？', { mood: -0.4 });
    await D.say('vera', '……哥哥說的「另一個人」。', { mood: -0.6 });
    await D.say('', '土之晶低低地鳴響著。小鈴把手貼在水晶上。', { sys: true });
    await D.say('lin', '……你也想出去嗎？', { mood: -0.2 });
    await D.say('', '「……想。好想再看一次天空。」', { sys: true });
    await D.say('lin', '……我試試看。不是把心搶走……是唱歌。像壁畫上的那個人一樣，唱一首「打開」的歌。');
    D.music('hope'); D.flash('#c8904a', 1500); D.sfx('echo');
    await D.say('', '小鈴閉上眼睛，輕輕地唱了起來。那是誰也沒聽過的旋律，卻讓人想起很久很久以前的春天。', { sys: true });
    await D.say('', '水晶上浮現出無數細細的裂痕，光從裂縫裡流了出來——溫柔地，像是嘆了一口氣。', { sys: true });
    D.breakAltar();
    await D.say('', '「……謝謝妳。原來，被放出來是這種感覺啊。」\n「我也一起去吧！讓我看看外面的機械發展到什麼程度了！」', { sys: true });
    await D.echo('gaia');
    await D.echo('karl');
    await D.give('earthshard');
    await D.say('lorne', '小鈴……妳打開了水晶！而且，跟灰冕騎士拿走心的時候不一樣，沒有哭聲。', { happy: true });
    await D.say('lin', '……嗯。他們在笑。', { happy: true });
    await D.say('vera', '我們得確認真相。最後一顆還在東方的雷之晶……如果莫迪恩大人真的在收集水晶的心，他一定會去那裡。', { mood: -0.2 });
    await D.say('nia', '東方的櫻花鄉。搭海燕號往東。', { mood: 0 });
    await D.fade(true, 800);
    await D.goto('world', 'ruins');
    await D.chapter(6, '雷之晶', '影之刃');
    D.toast('目標：搭海燕號往東，前往櫻花鄉');
  } } });
}
const D_has = (id) => !!G.s.inv[id];
// the dancer's contest: three steps of the sand dance, learned from the words on the fan
async function dance(D) {
  if (F('q_dance')) { await D.say('safa', '妳的舞，女王陛下到現在都還在誇呢。', { happy: true }); return; }
  if (!D.has('dancefan')) {
    await D.say('safa', '你們看起來很能幹呢。我們舞孃團在找能跳「沙之舞」的人。');
    await D.say('safa', '可是跳沙之舞，需要傳說中的「舞孃之扇」。它在很久以前，被埋進了古代遺跡……'); D.set('q_dance_start'); return;
  }
  await D.say('safa', '這是……舞孃之扇！扇面上寫著沙之舞的舞步！誰要來跳？');
  await D.say('nia', '……小鈴，妳上吧。', { happy: true });
  await D.say('lin', '咦咦！？我、我嗎！？', { brow: 0.6 });
  await D.say('', '扇面上寫著：「先如風起，再如沙落，終如月升。」', { sys: true });
  const steps = [['如風一般轉圈', '如沙一般蹲下', '如月一般舉手'], ['如沙一般蹲下', '如月一般舉手', '如風一般轉圈'], ['如月一般舉手', '如風一般轉圈', '如沙一般蹲下']];
  const want = ['如風一般轉圈', '如沙一般蹲下', '如月一般舉手'];
  let ok = 0;
  for (let i = 0; i < 3; i++) { const c = await D.choose(`第 ${i + 1} 步……`, steps[i], 'lin'); if (steps[i][c] === want[i]) { ok++; D.sfx('ok'); } else D.sfx('buzz'); }
  if (ok < 3) { await D.say('safa', `${ok} 步對了……可惜！再挑戰一次吧！扇面上的字要看清楚喔。`); return; }
  D.sfx('levelup');
  await D.say('safa', '太美了……！觀眾都站起來了！這才是真正的沙之舞！', { happy: true });
  D.flash('#ff8ab0', 900);
  await D.say('', '扇子發出粉紅色的光——「好久沒有人這樣跳我的舞了。小妹妹，我們一起去跳更多的舞吧！」', { sys: true });
  D.set('q_dance');
  await D.echo('sara');
}
