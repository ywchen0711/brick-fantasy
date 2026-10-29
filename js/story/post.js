// After the story: the crystal beasts in the four corners, the endless corridor, Stella's trial, and the knight at the
// bottom of it all, who has been waiting a thousand years.
import { flag, G } from '../engine/state.js';
import { quest } from './journal.js';
import { STELLA, KNIGHT } from './ch10.js';

const F = flag;
export default function (A, BOSSES) {
  const beast = (id, n, line, after) => ({ foes: [id], pre: async (D) => { await D.say('', line, { sys: true }); }, post: async (D) => { await D.say('', after, { sys: true }); } });
  BOSSES.sb_phoenix = beast('sb_phoenix', '不死鳥', '巢穴深處，熔岩中浮起一隻燃燒的巨鳥。牠的眼睛裡沒有敵意，只有試煉。', '不死鳥化成火焰，又從火焰中重生——牠對你們低下了頭，然後飛走了。');
  BOSSES.sb_leviathan = beast('sb_leviathan', '利維坦', '海蝕洞的水面捲起漩渦。一條比船還長的海龍抬起了頭。', '利維坦沉回深海。洞窟裡留下了一顆發光的鱗片。');
  BOSSES.sb_behemoth = beast('sb_behemoth', '貝希摩斯', '大地震動。一頭長著巨角的紫色巨獸從黑暗中走了出來。', '貝希摩斯倒下了。牠臨走前，用角輕輕碰了碰洛恩的肩膀。');
  BOSSES.sb_bahamut = beast('sb_bahamut', '巴哈姆特', '冰窟的最深處，龍王展開了天空一樣大的翅膀。「讓我看看，人類的歌。」', '「……很好的歌。」龍王留下這句話，飛向了天空。');
  quest({ id: 'beasts', n: '晶獸', start: 'ch11', end: 'beat_lair_bahamut', d: '世界的四個角落出現了晶獸：東南火山島的不死鳥、西南海蝕洞的利維坦、東方小島的貝希摩斯，還有西北冰島的巴哈姆特（破關後）。', hint: () => ['lair_phoenix', 'lair_levia', 'lair_behemoth', 'lair_bahamut'].filter((k) => F('beat_' + k)).length + ' / 4' });
  quest({ id: 'abyss', n: '無盡迴廊', start: 'postgame', end: 'beat_abyss20', d: '世界西北角的小島上，無盡迴廊的入口打開了。據說最深處有一個在等人的騎士。', hint: () => { for (let i = 20; i >= 1; i -= 5) if (F('beat_abyss' + i)) return `已經突破第 ${i} 層`; return '從第 1 層開始'; } });
  A('abyss1', { when: () => !F('pg_abyss'), enter: async (D) => {
    D.set('pg_abyss');
    await D.say('lin', '……這裡好深。好像一直通到時間的最底下。', { mood: -0.2 });
    await D.say('lorne', '每五層有一個守門的強敵。打倒了才能繼續往下走。');
    await D.say('vera', '一層一層來吧。累了就回去，反正迴廊不會跑掉。');
  } });
  BOSSES.trueknight = { foes: ['trueknight', 'truemage', 'truemage'], show: 'trueknight', pre: async (D) => { await D.say('', '黑色的騎士帶著兩個魔導士，擋住了往下的路。', { sys: true }); } };
  BOSSES.truechaos = { foes: ['truechaos', 'trueeye', 'trueeye'], show: 'truechaos', pre: async (D) => { await D.say('', '混沌在迴廊的中央旋轉著。所有的屬性都在它體內打架。', { sys: true }); } };
  BOSSES.sb_stella = { foes: ['sb_stella'], show: 'sb_stella', pre: async (D) => {
    await D.say('boss', '……又見面了，小鈴。這是我留在時間底下的影子。', { name: '星詠的影子' });
    await D.say('boss', '我想知道，你們的歌，能不能贏過一千年前的我。……來吧。', { name: '星詠的影子' });
  }, post: async (D) => {
    await D.say('', '「……好溫暖的歌。比我那時候的，還要溫暖。」', { sys: true });
    await D.echo('stella');
  } };
  BOSSES.sb_endknight = { foes: ['sb_endknight'], show: 'sb_endknight', pre: async (D) => {
    await D.say('boss', '……你們，就是她說的那些孩子嗎。', { name: '終焉騎士' });
    await D.say('boss', '一千年前，我沒能守住她。她叫我「好好活下去」，我卻只會揮劍。揮著揮著，連自己的名字都忘了。', { name: '終焉騎士' });
    await D.say('lin', '……你是星詠的騎士。時之迴廊的幻影裡，那個想代替她的人。', { mood: -0.2 });
    await D.say('boss', '來吧。用你們的劍告訴我——她最後，笑了嗎。', { name: '終焉騎士' });
  }, post: async (D) => {
    await D.say('boss', '……原來如此。她和那個彆扭的賢者，一起關上了門啊。', { name: '終焉騎士', happy: true });
    await D.say('boss', '……那我也該去找她了。我的劍，就留給你們。', { name: '終焉騎士' });
    await D.echo('endknight');
    await D.say('', '{g}全部 24 位迴響都到齊了。{/g}恭喜你，真正的冒險者。', { sys: true });
  } };
}
