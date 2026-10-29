// Chapter 8: the Silver Wing. The sky pirates' fortress and Count Ferrum, Nia's father's airship, the floating isles,
// the temple of light and its fallen guardian — and this time, a crystal opened by a song, with Cyrus watching.
import { flag, G } from '../engine/state.js';
import { CYRUS, CYRUSG } from './ch4.js';

const F = flag;
export default function (A, BOSSES) {
  A('skyfort1', { when: () => !F('c8_fort'), enter: async (D) => {
    D.set('c8_fort');
    await D.say('nia', '……這裡以前是我們銀翼空賊團的家。鐵翼那傢伙，把它改得到處都是鐵。', { mood: -0.5 });
    await D.say('brann', '妮雅，帶路吧。這次換我們替妳出氣。', { happy: true });
    await D.say('nia', '……嗯！停機坪在最上面！', { browIn: 0.8 });
  } });
  A('skyfort3', { when: () => !F('airship'), trigger: { at: 'bossFront', r: 3, once: 'c8_count', run: async (D) => {
    D.spawn({ id: 'count', name: '鐵翼伯爵', at: ['boss', 0, 0], dir: 0, spec: { age: 'adult', mustache: '#1c1c1c', colors: { top: '#2a2a3a', bottom: '#1c1c1c' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#1c1c1c' } }, gear: { cape: '#8a1a1a', goggles: '#c8a040', weapon: 'gun' }, scale: 1.3, anywhere: true });
    await D.say('count', '哦？這不是加洛那個老頭的女兒嗎？還活著啊。');
    await D.say('nia', '鐵翼……！你殺了我爸爸，還搶走了銀翼號！', { browIn: 1 });
    await D.say('count', '搶？是莫迪恩大人「買」下來的。那老頭不肯賣，我只好用點手段。');
    await D.say('count', '大賢者需要一艘最快的飛空艇，載著水晶的心，飛到「那個地方」。銀翼號正合適。');
    await D.say('nia', '銀翼號是爸爸的命！誰都不准碰！', { browIn: 1 });
    await D.say('count', '那就來搶啊，小丫頭！');
    D.remove('count');
    await D.battle(['boss_ironwing'], { boss: true });
    await D.say('', '鐵翼伯爵跌坐在地上，鑰匙從他的口袋裡滾了出來。', { sys: true });
    await D.give('airshipkey');
    await D.say('nia', '……爸爸。我拿回來了。', { mood: 0.1 });
    D.music('airship');
    await D.say('', '停機坪上，一艘有著銀色船身和藍色條紋的飛空艇，正靜靜地等著它的主人。', { sys: true });
    await D.say('lorne', '飛空艇……！我們的飛空艇！', { happy: true });
    await D.say('nia', '是「我的」飛空艇。……不過，騎士小哥，想學開船的話，我可以教你。', { happy: true });
    await D.say('lorne', '真、真的！？', { happy: true });
    D.set('airship'); await D.vehicle('airship', 128, 70);
    await D.say('', '{g}【銀翼號】{/g}在世界地圖上走到飛空艇旁按確定鍵起飛。天空中可以飛越山和海，在平地上按確定鍵降落。', { sys: true });
    await D.say('vera', '莫迪恩要用飛空艇載著水晶的心去「那個地方」……我們得搶在他前面。');
    await D.say('lin', '……光之晶。我聽得見，在西邊的天空。天空裡有一座浮島。', { mood: -0.2 });
    await D.fade(true, 800);
    await D.goto('world', 'skyfort');
    D.toast('目標：駕駛銀翼號，前往西方海上的天空浮島');
  } } });
  A('skyisles', { when: () => !F('c8_isle'), enter: async (D) => {
    D.set('c8_isle');
    await D.say('lin', '雲在腳下！草地也在雲上面！', { happy: true });
    await D.say('brann', '……不要往下看。不要往下看。', { mood: -0.6 });
    await D.say('nia', '布朗大叔怕高！？哈哈哈！', { happy: true });
  } });
  A('light1', { when: () => !F('c8_light'), enter: async (D) => {
    D.set('c8_light');
    await D.say('vera', '光之神殿……連牆壁都在發光。');
    await D.say('lin', '可是……光的歌聲，變得好奇怪。一半是歌，一半是尖叫。', { mood: -0.5 });
  } });
  A('light3', { prop: { type: 'altar', at: 'altar', color: '#fff4c0', broken: () => F('lightshard') } });
  A('light3', { when: () => !F('lightshard'), trigger: { at: 'bossFront', r: 3, once: 'c8_angel', run: async (D) => {
    D.spawn({ id: 'angel', name: '墮天使 露西爾', at: ['boss', 0, 0], dir: 0, spec: { age: 'adult', lashes: true, colors: { top: '#f8f4ea', bottom: '#f8f4ea' }, outfit: { top: 'robe', bottom: 'skirt' }, robe: { inner: '#ffe8a0', trim: '#5a3a8a' }, hair: { style: 'ponytail', color: '#ffe8a0' } }, gear: { wings: '#e8e0f0', weapon: 'spear' }, scale: 1.5, anywhere: true });
    await D.say('angel', '……誰……誰都不准靠近……光之晶……');
    await D.say('lin', '妳是光之晶的守護者？妳好痛苦……', { mood: -0.5 });
    await D.say('angel', '一千年……守了一千年……那個賢者的聲音，一直在我耳邊說：「守住它，直到我來拿」……');
    await D.say('angel', '我好累……好累……！', { mood: -0.8 });
    await D.say('vera', '她被莫迪恩的咒縛住了！先讓她停下來！', { browIn: 1 });
    D.remove('angel');
    await D.battle(['boss_fallen'], { boss: true });
    D.spawn({ id: 'cyrus', hero: 'cyrus', at: ['altar', 3, 3], dir: -Math.PI / 2 });
    await D.say('cyrus', '……露西爾也解脫了嗎。');
    await D.say('vera', '哥哥！', { browIn: 0.6 });
    await D.say('cyrus', '我是來拿光之晶的心的。……可是，聽說土之晶是被「歌」打開的。是真的嗎，聆晶者？');
    await D.say('lin', '……嗯。不用搶走心，只要好好地唱，他們就能出來。', { mood: 0.1 });
    await D.say('cyrus', '……讓我看看。', { mood: 0 });
    D.music('hope'); D.flash('#fff4c0', 1500); D.sfx('echo');
    await D.say('', '小鈴唱了起來。光之晶的裂痕裡，光像早晨一樣慢慢地溢出來。墮天使的翅膀，一片一片變回了白色，然後化成了光。', { sys: true });
    D.breakAltar();
    await D.say('', '「……謝謝。我終於可以，去看那個人說過的花了。」', { sys: true });
    await D.say('cyrus', '……', { mood: -0.2 });
    await D.say('cyrus', '我花了三年，用劍撬開了六個牢籠。每一次，都聽得見他們的哭聲。', { mood: -0.5 });
    await D.say('cyrus', '而妳只用了一首歌。……原來，還有這種方法。', { mood: 0.2 });
    await D.say('vera', '哥哥，跟我們一起走吧。莫迪恩才是真正的敵人。', { mood: 0.2 });
    await D.say('cyrus', '……格里姆背叛了灰冕，把我奪來的六顆心，全都偷走了。他把它們藏在北邊黑森林裡的「影之城」，準備交給莫迪恩。');
    await D.say('brann', '影之城……！艾拉也在那裡！', { browIn: 1 });
    await D.say('cyrus', '黑森林被一道虛無的屏障圍著。屏障……只有光之晶的光才能打開。');
    await D.say('cyrus', '我先去黑森林旁的灰燼村。你們準備好了，就到那裡來找我。……這一次，我們一起進去。');
    D.remove('cyrus');
    await D.say('vera', '……「我們一起」。', { mood: 0.5 });
    D.flash('#ffffff', 900);
    await D.say('', '「我的歌，也借給妳。」\n「我的箭，會替妳射穿黑暗。」\n光的兩道迴響，落進了小鈴的手心。', { sys: true });
    await D.echo('seren');
    await D.echo('arte');
    await D.give('lightshard');
    await D.fade(true, 800);
    await D.goto('world', 'skyisles');
    await D.chapter(9, '影之城', '鐵匠的女兒');
    D.toast('目標：駕駛銀翼號，前往西北黑森林旁的灰燼村');
  } } });
}
