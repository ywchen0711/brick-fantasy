// Chapter 10: the corridor of time. The academy city Mordain built, Professor Elda's story of the sage's apprentice,
// visions of a thousand years ago, Mordain himself — and the price Cyrus pays to keep Lin.
import { flag, G, removeMember } from '../engine/state.js';
import { quest } from './journal.js';
import { MORD, MORDG } from './ch7.js';

const F = flag;
const STELLA = { age: 'adult', lashes: true, colors: { top: '#f8f8ff', bottom: '#c8d8ff' }, outfit: { top: 'robe', bottom: 'skirt' }, robe: { inner: '#c8d8ff', trim: '#ffffff' }, hair: { style: 'ponytail', color: '#c8d8ff' } };
const KNIGHT = { age: 'adult', swordBrows: true, colors: { top: '#3a3a5a', bottom: '#2a2a3a' }, outfit: { top: 'coat' }, hair: { style: 'spiky', color: '#2a2a3a' } };
const YOUNGM = { age: 'adult', colors: { top: '#3a2a5a', bottom: '#3a2a5a' }, outfit: { top: 'robe' }, robe: { inner: '#d8a838', trim: '#d8a838' }, hair: { style: 'short', color: '#3a2418' } };
export { STELLA, KNIGHT };
export default function (A, BOSSES) {
  A('academy', { when: () => !F('c10_in'), enter: async (D) => {
    D.set('c10_in');
    await D.say('nia', '學院都市……街上的人都在看書。怎麼這麼安靜？');
    await D.say('cyrus', '這裡的學者，大半都把莫迪恩當成神。小心說話。');
    await D.say('vera', '時之迴廊的入口在城的北邊。不過……先找找知道莫迪恩過去的人吧。');
    D.toast('目標：在學院都市打聽莫迪恩的過去');
  } });
  A('academy', { npc: { id: 'elda', name: '艾達教授', look: 'elder', seed: 111, at: ['plazaW', -3, -2], specX: { lashes: true, glasses: '#d8a838', colors: { top: '#5a3a8a', bottom: '#3a2a5a' } }, mark: () => !F('c10_elda'), talk: async (D) => {
    if (F('c10_elda')) { await D.say('elda', '莫迪恩……他只是一個太害怕失去的人。可是，那不能成為他把別人關起來的理由。'); return; }
    await D.say('elda', '……你們是來阻止他的吧。我等你們很久了。');
    await D.say('elda', '我是莫迪恩的學生，跟了他六十年。我知道他所有的事——包括他不想讓任何人知道的事。');
    await D.say('elda', '一千年前，莫迪恩是賢者歐文的弟子。他和最初的聆晶者「星詠」，還有守護星詠的騎士，是一起旅行的夥伴。');
    await D.say('elda', '虛無降臨的時候，星詠用歌聲把八位英雄的魂請進水晶，封住了虛無。可是那首歌……要用唱的人的命來換。');
    await D.say('lin', '……星詠她……死了嗎？', { mood: -0.5 });
    await D.say('elda', '是的。莫迪恩愛著星詠。他無法接受她的死。');
    await D.say('elda', '於是他把水晶封死，讓英雄們的魂永遠出不來。他喝下水晶的力量活了一千年——只為了一件事：找到「星詠的碎片」，把她找回來。');
    await D.say('cyrus', '……星詠的碎片？', { brow: 0.5 });
    await D.say('elda', '星詠死的時候，她的一小片魂留在了風之晶裡。十三年前，風之晶裡生出了一個孩子。');
    await D.emote('lin', '!');
    await D.say('lin', '……我？', { mood: -0.8 });
    await D.say('elda', '小鈴。妳就是星詠的碎片。莫迪恩要用水晶的心，和妳的魂，把星詠「做」出來。……就算那代價是妳的存在。', { mood: -0.6 });
    await D.say('lorne', '開什麼玩笑！！小鈴就是小鈴！誰都不能把她變成別人！', { browIn: 1 });
    await D.say('brann', '……說得好，小子。', { browIn: 1 });
    await D.say('elda', '這個給你們。是歐文大賢者留下的書——他的迴響還在書裡。他一直想阻止自己的弟子。');
    D.flash('#f0e0a0', 900);
    await D.say('', '「……那孩子是我教壞的。孩子們，請你們，替我把他帶回來。」', { sys: true });
    D.set('c10_elda'); D.set('c10_door');
    await D.echo('owen');
    await D.say('elda', '時之迴廊在北門外。願星辰指引你們。');
    D.toast('目標：從北門進入時之迴廊');
  } } });
  A('academy', { npc: { id: 'ac_s1', look: 'man', seed: 113, at: ['plaza', 4, 4], wander: 2, name: '學生', specX: { glasses: '#3a3a3a' }, lines: [['莫迪恩大人是我們的光！他活了比任何人都久，所以比任何人都有智慧！'], ['時之迴廊是禁地。據說裡面的時間是亂的，會看到過去的幻影。']] } });
  A('academy', { npc: { id: 'ac_s2', look: 'woman', seed: 115, at: ['plazaE', 3, -2], name: '圖書館員', lines: [['最近，大賢者大人帶著好幾個發光的箱子進了時之迴廊。然後就再也沒出來。']] } });

  // ================================================================ the corridor of time: visions
  A('time1', { when: () => !F('c10_v1'), trigger: { at: 'room5', r: 3, once: 'c10_v1', run: async (D) => {
    D.spawn({ id: 'v_stella', name: '星詠（幻影）', spec: STELLA, at: ['room5', -1, -1], dir: Math.PI / 2, ghost: true });
    D.spawn({ id: 'v_knight', name: '騎士（幻影）', spec: KNIGHT, gear: { cape: '#5a1a8a', weapon: 'sword' }, at: ['room5', 1, -1], dir: -Math.PI / 2, ghost: true });
    await D.say('v_stella', '……我決定了。我要唱那首歌。');
    await D.say('v_knight', '不行！那首歌會要了妳的命！讓我去，讓我代替妳——');
    await D.say('v_stella', '你的劍，要留著守護大家。……答應我，好好活下去。', { happy: true });
    await D.say('v_knight', '……星詠……');
    D.remove('v_stella'); D.remove('v_knight');
    await D.say('lin', '……那就是星詠。她的聲音……跟我好像。', { mood: -0.3 });
    await D.say('vera', '還有那個騎士……他後來怎麼了呢。', { mood: -0.3 });
  } } });
  A('time2', { when: () => !F('c10_v2'), trigger: { at: 'room6', r: 3, once: 'c10_v2', run: async (D) => {
    D.spawn({ id: 'v_mord', name: '年輕的莫迪恩（幻影）', spec: YOUNGM, gear: { weapon: 'staff', wcolor: '#a050ff' }, at: ['room6', 0, -1], dir: 0, ghost: true });
    await D.say('v_mord', '星詠……妳說要大家好好活下去。');
    await D.say('v_mord', '那我就活下去。活一百年、一千年。活到找回妳的那一天。', { mood: -0.5 });
    await D.say('v_mord', '對不起了，英雄們。你們的魂，就借我用一下吧。……直到永遠。', { mood: -0.8 });
    D.remove('v_mord');
    await D.say('cyrus', '……「借用」一千年。', { browIn: 0.8 });
    await D.say('lin', '……他好寂寞。可是，他做錯了。', { mood: -0.4 });
    D.flash('#c8a8ff', 900);
    await D.say('', '「……時間是不能倒轉的喔，孩子們。我用了三百年才懂。」\n迴廊的時間停了一瞬，一道迴響落進小鈴手中。', { sys: true });
    await D.echo('shigure');
  } } });
  A('time3', { prop: { type: 'altar', at: 'altar', color: '#c8a8ff', broken: () => F('c10_done') } });
  A('time3', { when: () => !F('c10_done'), trigger: { at: 'bossFront', r: 3, once: 'c10_mord', run: async (D) => {
    D.music('tension');
    D.spawn({ id: 'mordain', name: '大賢者 莫迪恩', at: ['altar', 0, 1], dir: Math.PI, spec: MORD, gear: MORDG, anywhere: true });
    await D.say('mordain', '……你們真的走到這裡了。了不起。我一直很喜歡你們這些孩子。');
    await D.say('lorne', '莫迪恩！把水晶的心交出來！', { browIn: 1 });
    await D.say('mordain', '五顆心，已經在我手中。剩下的，只差一樣——', {});
    await D.say('mordain', '星詠。我的星詠。妳終於回來了。', { happy: true });
    await D.say('lin', '……我不是星詠。我是小鈴。', { mood: -0.3 });
    await D.say('mordain', '妳現在是小鈴。等一下，就會是星詠了。', { happy: true });
    await D.say('vera', '你為了一個死去的人，把八個英雄關了一千年，現在還要奪走小鈴！？', { browIn: 1 });
    await D.say('mordain', '……妳懂什麼。看著最重要的人在面前消失，是什麼感覺——', { mood: -0.6 });
    await D.say('cyrus', '……我懂。所以我才更不能讓你這麼做。', { browIn: 0.8 });
    await D.say('mordain', '那就來吧。讓我看看，你們這些「迴響」借來的力量，能不能贏過「迴響」的主人！');
    D.remove('mordain');
    await D.battle(['boss_mordain1'], { boss: true, music: 'final' });
    D.spawn({ id: 'mordain', name: '大賢者 莫迪恩', at: ['altar', 0, 1], dir: Math.PI, spec: MORD, gear: MORDG, anywhere: true });
    await D.say('mordain', '……嗚。不愧是……星詠選中的孩子們……', { mood: -0.6 });
    await D.say('mordain', '可是，我等了一千年。我不會在這裡停下！', { browIn: 1 });
    D.sfx('dark'); D.flash('#a050ff', 600);
    await D.say('', '莫迪恩的杖射出一道黑紫色的光，筆直地射向小鈴——', { sys: true });
    await D.say('lorne', '小鈴！！', { browIn: 1 });
    await D.say('', '——一個灰色的身影擋在了光的前面。', { sys: true });
    D.shake(0.6, 0.25); D.sfx('ko');
    await D.say('vera', '……哥哥！？', { mood: -0.9 });
    await D.say('cyrus', '……咳。這種程度……灰冕騎士……還撐得住……', { mood: -0.8 });
    await D.say('mordain', '愚蠢……！為了一個不相干的孩子……！', { brow: 0.6 });
    await D.say('mordain', '……算了。沒有碎片，就用五顆心強行打開「門」。星詠，等我。我會從虛無的另一端，把妳帶回來！');
    D.sfx('quake'); D.shake(2, 0.4); D.flash('#ffffff', 1200);
    D.remove('mordain');
    await D.say('', '莫迪恩把五顆水晶的心按進自己的胸口。光吞沒了他，迴廊的牆壁開始崩塌——然後，他消失了。', { sys: true });
    D.music('sad');
    await D.say('vera', '哥哥……哥哥！撐住！小鈴，快用治癒——', { mood: -0.9 });
    await D.say('lin', '我、我在用了！可是……治不好……光一直流出去……', { mood: -0.9 });
    await D.say('cyrus', '……沒用的。那道光……是用來把魂抽出來的。……還好，打中的是我。', { mood: -0.3 });
    await D.say('cyrus', '薇拉。……這個給妳。', { mood: 0 });
    await D.say('', '賽勒斯把灰色的王冠，放進薇拉的手心。', { sys: true });
    await D.say('cyrus', '我戴著它，做了很多錯事。……妳戴著它，去做對的事吧。', { mood: 0.2 });
    await D.say('cyrus', '告訴奶奶……我有讀媽媽的信。我……有哭喔。', { mood: 0.3 });
    await D.say('vera', '……你這個……笨蛋哥哥……！', { mood: -1 });
    await D.say('cyrus', '……洛恩。我妹妹……就拜託你了。', { mood: 0.4 });
    await D.say('lorne', '……嗯。我發誓。', { mood: -0.6 });
    await D.say('', '賽勒斯閉上眼睛。他的身體化成點點的光，一顆一顆飄向迴廊的天井。\n其中一點光，在小鈴的面前停了一下，像是在說「謝謝」。', { sys: true });
    D.leave('cyrus');
    await D.give('cyruscrown');
    D.set('c10_done');
    await D.wait(800);
    D.shake(2.5, 0.5);
    await D.say('nia', '整個迴廊在晃！快逃！', { browIn: 1 });
    await D.fade(true, 1000);
    D.set('ch11');
    await D.goto('world', 'academy');
    D.music('void');
    D.shake(2, 0.4);
    await D.say('', '世界在震動。王都北邊的湖中央，一座漆黑的塔衝破水面，直直地刺向天空。天空裂開了，裂縫的另一邊，是什麼都沒有的「虛無」。', { sys: true });
    await D.say('yoru', '……那就是莫迪恩要去的「門」。', { name: '夜' });
    await D.say('vera', '……', { mood: -0.8 });
    await D.say('lorne', '薇拉……', { mood: -0.5 });
    await D.say('vera', '……我沒事。哥哥把小鈴交給我們了。我們要去把那座塔，連同莫迪恩的夢一起，打碎。', { browIn: 0.8 });
    await D.chapter(11, '虛無降臨', '最後的旅途');
    D.toast('目標：先到白隼王都看看。然後前往湖中的虛空之塔');
  } } });
}
