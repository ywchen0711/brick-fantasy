// Chapters 11–12 and the ending: the world under the void, friends gathering in ruined Whitehawk, the tower of the
// void and its four elemental lords, Mordain made a god, the Void itself, and the song that sets the echoes free.
import { flag, G, healAll } from '../engine/state.js';
import { quest } from './journal.js';
import { REX } from './ch7.js';
import { STELLA, KNIGHT } from './ch10.js';

const F = flag;
const KING = { age: 'adult', beard: '#a8743a', colors: { top: '#2a3a8a', bottom: '#2a2a3a' }, outfit: { top: 'robe' }, robe: { inner: '#f0e6cc', trim: '#d8a838' }, hair: { style: 'short', color: '#a8743a' } };
export default function (A, BOSSES) {
  // ================================================================ Whitehawk, freed
  A('whitehawk_r', { when: () => F('ch11') && !F('c11_camp'), enter: async (D) => {
    D.set('c11_camp'); D.music('hope');
    D.spawn({ id: 'king', name: '艾德蒙王', spec: KING, gear: { crown: '#ffd84a', cape: '#b8282a' }, at: ['plaza', 0, -3], dir: Math.PI });
    D.spawn({ id: 'rex', name: '雷克斯隊長', spec: REX, gear: { cape: '#2a3a8a', weapon: 'sword' }, at: ['plaza', -2, -2], dir: Math.PI });
    await D.say('rex', '小鬼們！你們回來了！', { happy: true });
    await D.say('king', '……洛恩、薇拉、小鈴。還有新的朋友們。莫迪恩離開之後，咒就解開了。我睡了太久。', { mood: -0.2 });
    await D.say('king', '我全都聽雷克斯說了。……對不起。是我太相信那個人，把你們、把這個國家，都推進了危險裡。');
    await D.say('vera', '陛下……哥哥他，賽勒斯他……', { mood: -0.7 });
    await D.say('king', '……我知道。他是白隼最好的騎士。直到最後都是。', { mood: -0.4 });
    await D.say('rex', '湖中的那座塔……叫「虛空之塔」。塔頂連著天上的裂縫。莫迪恩就在那裡。');
    await D.say('rex', '塔裡有四個元素之王守著。傳說牠們是水晶的影子——水晶的心被莫迪恩吞下之後，牠們就醒了。');
    await D.say('king', '王國剩下的一切，都交給你們了。商店、旅館、教堂，盡量用吧。');
    await D.say('king', '……還有。我聽說，世界的角落出現了比元素之王更強的「晶獸」。如果需要更強的力量，就去挑戰牠們吧。');
    D.remove('king'); D.remove('rex');
    await D.say('', '{g}【第 11 章】{/g}虛空之塔已經出現在王都北邊的湖中。世界地圖上會出現虛無的魔物。\n晶獸的巢穴也出現在世界的四個角落（非常強，可以之後再來）。', { sys: true });
    D.set('c11_told');
  } });
  A('whitehawk_r', { when: () => F('c11_camp'), npc: { id: 'king', name: '艾德蒙王', spec: KING, gear: { crown: '#ffd84a', cape: '#b8282a' }, at: ['plaza', 0, -3], lines: [['我們會在這裡等你們回來。……所有人都會。']] } });
  A('whitehawk_r', { when: () => F('c11_camp'), npc: { id: 'rex', name: '雷克斯隊長', spec: REX, gear: { cape: '#2a3a8a' }, at: ['plaza', -3, -2], talk: async (D) => {
    if (!F('q_rexship')) { D.set('q_rexship'); await D.say('rex', '洛恩，我答應過要教你開船，結果你早就比我會開了。哈哈！'); await D.say('rex', '這是我年輕時的護符。沒什麼大用，就是讓人跑得快一點。'); await D.give('hastecharm'); return; }
    await D.say('rex', '回來的時候，換你教我開飛空艇。說好了！', { happy: true });
  } } });
  A('whitehawk_r', { when: () => F('c11_camp') && F('c9_ella'), npc: { id: 'ella', name: '艾拉', spec: { age: 'kid', cheeks: true, lashes: true, colors: { top: '#c8582a', bottom: '#5a3a2a' }, outfit: { top: 'tee' }, hair: { style: 'ponytail', color: '#8a4a20', clip: '#ffd84a' } }, at: ['plaza', 3, 2], lines: [['爸爸說他要打一把「世界上最好的斧頭」。等他回來，我要當他的第一個徒弟！']] } });
  A('whitehawk_r', { when: () => F('c11_camp'), npc: { id: 'granny', name: '艾斯特奶奶', look: 'elder', seed: 61, specX: { lashes: true, colors: { top: '#3a5ab0', bottom: '#e8e8f0' } }, at: ['plazaW', -1, 2], talk: async (D) => {
    if (F('q_granny2')) { await D.say('granny', '去吧，薇拉。奶奶等妳回家。'); return; }
    D.set('q_granny2');
    await D.say('granny', '薇拉……奶奶從霜燈村搭船來了。聽說了賽勒斯的事。', { mood: -0.5 });
    await D.say('vera', '奶奶……哥哥說……他有讀媽媽的信。他說，他有哭。', { mood: -0.8 });
    await D.say('granny', '……那孩子。總算學會哭了。', { mood: -0.3 });
    await D.say('granny', '薇拉，那頂王冠很適合妳。去吧——做對的事。', { mood: 0.3 });
  } } });

  // ================================================================ the tower of the void
  A('void1', { when: () => !F('c12_in'), enter: async (D) => {
    D.set('c12_in');
    await D.say('lin', '……好多聲音。哭聲、笑聲、歌聲，全部混在一起。', { mood: -0.5 });
    await D.say('brann', '最後一戰了。小鬼們，別給我死了。', { browIn: 0.6 });
    await D.say('nia', '銀翼空賊團的名譽，賭在這一戰！', { browIn: 0.8 });
    await D.say('yoru', '……甜食，回去再吃。', { name: '夜' });
    await D.say('vera', '哥哥……看著吧。', { browIn: 0.8 });
    await D.say('lorne', '走吧，大家！', { browIn: 1 });
    if (!F('ch12')) await D.chapter(12, '晶之歌', '虛空之塔');
  } });
  const lord = (id, n, line) => ({ foes: [id], pre: async (D) => { await D.say('boss', line, { name: n }); }, post: async (D) => { await D.say('', `${n}化成了光，消散在塔的黑暗中。往上的路打開了。`, { sys: true }); } });
  BOSSES.lordfire = lord('boss_lordfire', '炎之王', '……我是火之晶的影子。被吞下的心在燃燒……好燙、好燙！');
  BOSSES.lordice = lord('boss_lordice', '冰之王', '……冷……那個賢者的心，比我還冷……');
  BOSSES.lordthunder = lord('boss_lordthunder', '雷之王', '……轟隆隆……讓開！我要撕裂這座塔！');
  BOSSES.lordearth = lord('boss_lordearth', '土之王', '……塔在吸取大地的力量。打倒我，然後……阻止他。');
  BOSSES.mordain2 = { foes: ['boss_mordain2'], show: 'boss_mordain2', music: 'final', pre: async (D) => {
    await D.say('boss', '……你們來了。看吧，天空的裂縫。那邊就是虛無——星詠消失的地方。', { name: '神化 莫迪恩' });
    await D.say('boss', '五顆心在我的身體裡歌唱。英雄們的力量，全都是我的。只要再打開一點，我就能走進虛無，把她帶回來。', { name: '神化 莫迪恩' });
    await D.say('lin', '莫迪恩爺爺……星詠她，不會希望你這樣做的。', { mood: -0.3 });
    await D.say('boss', '妳怎麼會知道！？', { name: '神化 莫迪恩' });
    await D.say('lin', '因為我聽得見。我身體裡的那一小片星詠，一直在說：「莫迪恩，夠了。」', { mood: -0.2 });
    await D.say('boss', '……閉嘴……閉嘴閉嘴閉嘴！！', { name: '神化 莫迪恩' });
    await D.say('lorne', '大家！這是最後一戰！', { browIn: 1 });
  }, post: async (D) => { await finale(D); } };
}
// ---------------------------------------------------------------- the end
async function finale(D) {
  D.music('void');
  await D.say('', '莫迪恩跪倒在地。五道光從他的胸口飛出，在空中盤旋。', { sys: true });
  await D.say('', '「……我……只是……想再聽一次……她的歌……」', { sys: true });
  D.shake(2, 0.4); D.sfx('quake');
  await D.say('', '天空的裂縫猛地張開。失去了主人的「門」，開始把一切吸進去——塔、光、聲音，連同莫迪恩一起。', { sys: true });
  await D.say('nia', '裂縫在擴大！整個世界都會被吸進去！', { browIn: 1 });
  await D.say('', '裂縫的深處，有什麼東西睜開了眼睛。那是沒有形狀、沒有聲音、什麼都沒有的「虛無」本身。', { sys: true });
  await D.say('vera', '……一千年前封住的東西，醒了。', { mood: -0.6 });
  await D.say('lin', '……大家。我聽見了。', { mood: 0.2 });
  await D.say('lin', '所有的迴響……風、水、火、冰、土、雷、光、闇……還有住在大家身邊的英雄們。他們都在唱歌。', { mood: 0.3 });
  await D.say('lin', '他們說：「這一次，我們自己選擇，要為誰唱歌。」', { happy: true });
  D.music('final'); D.flash('#ffffff', 1500); D.sfx('echo');
  await D.say('lorne', '……好！那就讓虛無聽聽看，我們的歌！！', { browIn: 1 });
  G.s.party.lorne && healAll();
  const r = await D.battle(['boss_void'], { boss: true, music: 'final', canFlee: false });
  // the ending
  D.music('hope');
  await D.say('', '虛無發出最後一聲沒有聲音的嘆息，慢慢地縮小、縮小……', { sys: true });
  await D.say('lin', '……還差一點點。裂縫，要有人在另一邊把它「關上」。', { mood: -0.2 });
  await D.say('lorne', '……小鈴？', { mood: -0.5 });
  await D.say('lin', '星詠一千年前，就是這樣把門關上的。她在門的另一邊，一直唱、一直唱……', { mood: -0.3 });
  await D.say('vera', '不行！小鈴，妳不能——', { mood: -0.9 });
  D.spawn({ id: 'stella', name: '星詠', spec: STELLA, at: ['altar', 0, 2], dir: Math.PI, ghost: true, anywhere: true });
  await D.say('stella', '——不用了。這次，換我來。', { happy: true });
  await D.say('lin', '……星詠？', { mood: 0 });
  await D.say('stella', '謝謝妳，小鈴。謝謝妳把英雄們從牢籠裡放出來。謝謝妳替我，好好地活著。', { happy: true });
  await D.say('stella', '我身體裡的那一小片……就送給妳了。從今以後，妳就只是小鈴。一個會唱歌的普通女孩。');
  D.spawn({ id: 'mordain', name: '莫迪恩', spec: { age: 'adult', colors: { top: '#3a2a5a', bottom: '#3a2a5a' }, outfit: { top: 'robe' }, robe: { inner: '#d8a838', trim: '#d8a838' }, hair: { style: 'short', color: '#3a2418' } }, at: ['altar', -2, 2], dir: Math.PI / 2, ghost: true, anywhere: true });
  await D.say('mordain', '……星詠……', { mood: -0.6 });
  await D.say('stella', '莫迪恩。你等太久了。……一起走吧。這次，我們一起關上門。', { happy: true });
  await D.say('mordain', '……嗯。……孩子們，對不起。……還有，謝謝。', { mood: 0.2 });
  D.flash('#ffffff', 2000);
  D.remove('stella'); D.remove('mordain');
  await D.say('', '兩道光手牽著手，飛進了天空的裂縫。裂縫像花苞一樣，靜靜地合上了。', { sys: true });
  await D.say('', '那一天，稜晶大陸上所有的人，都聽見了一首歌。\n那不是水晶的歌，是英雄們自己的歌。他們唱完最後一個音，便一個一個，回到了該去的地方。', { sys: true });
  D.set('ending'); D.set('postgame');
  await D.fade(true, 1500);
  await D.card(`<div class="ending">
    <b style="font-size:30px">終章　晶之迴響</b><br><br>
    白隼王國重新升起了白隼旗。<br>雷克斯隊長終於學會了怎麼開飛空艇——是洛恩教的。<br><br>
    布朗回到鐵爐堡，和艾拉一起打出了「世界上最好的斧頭」。<br>那把斧頭至今還掛在店門口，誰也不賣。<br><br>
    妮雅重建了銀翼空賊團。他們不偷東西了，改成載客。<br>雖然偶爾還是會「借」一下。<br><br>
    夜在櫻花鄉開了一間小小的和菓子店。<br>店名叫「小夜」。據說老闆只有在客人吃得開心的時候才會笑。</div>`, 0);
  await D.card(`<div class="ending">
    薇拉成為白隼騎士團史上最年輕的副團長。<br>她總是戴著一頂灰色的王冠。<br>每年冬天，她都會回霜燈村，和奶奶一起讀一封信。<br><br>
    洛恩成了「天空騎士」。他的飛空艇上，總是有一個位子空著，<br>留給一個愛唱歌的女孩。<br><br>
    小鈴回到了風之神殿。神殿的水晶已經不在了，<br>可是每到起風的日子，她就會對著天空唱歌。<br><br>
    風會回答她。<br>有時候，是劍的聲音；有時候，是笑聲。<br>還有一次，她發誓聽見了一個溫柔的女聲，<br>和一個有點彆扭的老爺爺的聲音，一起在唱。</div>`, 0);
  await D.card(`<div class="chcard"><small>BRICK FANTASY</small><b>積木幻想：晶之迴響</b><i>全劇終　——謝謝你的遊玩</i></div>`, 0);
  await D.card(`<div class="ending">故事結束了，但冒險還沒有。<br><br>世界上還有「晶獸」在等待挑戰者，<br>世界西北角的小島上，「無盡迴廊」的入口打開了。<br>據說迴廊的最深處，有一個在等人的騎士……<br><br><small>（遊戲會從白隼王都繼續。記得存檔！）</small></div>`, 0);
  await D.goto('whitehawk', 'center');
}
