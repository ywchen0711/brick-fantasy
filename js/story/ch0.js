// Prologue: the Wings of Whitehawk. Two squires, a patrol in the airship, a crash in the wind canyon, a girl who hears
// the crystals, and a grey knight who takes the wind crystal's heart.
import { G, flag, setFlag, addMember } from '../engine/state.js';

const F = flag;
export async function start(D) {
  addMember('lorne', 1); addMember('vera', 1);
  G.s.flags.ch0 = true;
  await D.card(`<div class="ending">千年之前，「虛無」吞噬了世界。<br>最初的聆晶者，把英雄們的魂唱進了八顆水晶。<br>從此，水晶的歌聲守護著稜晶大陸。<br><br>人們說，那歌聲是英雄們的祝福。<br>……從來沒有人問過，<br>英雄們自己，想不想唱。</div>`, 9000);
  await D.chapter(0, '白隼之翼', '序章');
  await D.goto('whitehawk', 'center');
}
export default function (A, BOSSES) {
  // ================================================================ Whitehawk, the morning of the patrol
  A('whitehawk', { when: () => !F('p_open'), enter: async (D) => {
    D.music('whitehawk');
    await D.say('lorne', '（白隼王都的早晨。鐘聲、麵包香、還有……）');
    await D.say('vera', '洛恩！你又在發呆。', { mood: -0.2 });
    await D.say('lorne', '哇！薇拉！我才沒有發呆，我是在……想像自己駕駛飛空艇的樣子！', { happy: true });
    await D.say('vera', '那叫做發呆。今天是我們第一次跟著雷克斯隊長出巡，遲到的話你就準備刷一個月的馬廄吧。');
    await D.say('lorne', '第一次搭飛空艇耶！你不興奮嗎？');
    await D.say('vera', '……有一點。', { mood: 0.6 });
    await D.say('vera', '總之，先去王座之間晉見國王陛下。城堡在廣場的北邊。');
    D.set('p_open');
    D.toast('目標：到北邊的城堡晉見國王');
  } });
  A('whitehawk', { when: () => !F('ch0king'), npc: { id: 'guard1', look: 'guard', at: ['castleGate', 2, 1], name: '城門衛兵', lines: [['見習騎士洛恩、薇拉。陛下在王座之間等你們。', '直接往北走進城門就可以了。']] } });
  A('whitehawk', { when: () => !F('ch1'), npc: { id: 'wh_kid', look: 'kid', at: ['plaza', -3, 4], wander: 3, name: '小男孩', lines: [['騎士哥哥！聽說飛空艇會飛到雲上面！', '我長大也要當騎士！'], ['大人說，水晶的歌聲最近變小聲了……是水晶感冒了嗎？']] } });
  A('whitehawk', { when: () => !F('ch1'), npc: { id: 'wh_baker', look: 'woman', at: ['plaza', 4, -3], name: '麵包店的大嬸', lines: [['洛恩，今天也要努力喔！這個拿去，早餐要吃！'], ['薇拉那孩子啊，自從她哥哥失蹤之後，就一直把自己繃得緊緊的。你要多照顧她。']] } });
  A('whitehawk', { when: () => !F('ch1'), npc: { id: 'wh_old', look: 'elder', at: ['plazaW', 0, 3], name: '老人', lines: [['千年前，最初的聆晶者把英雄們的魂唱進水晶……', '我小時候，水晶的歌聲清楚得連夢裡都聽得到呢。'], ['大賢者莫迪恩大人？他從我爺爺的爺爺那一代就在了。據說他是世界上最老的人。']] } });

  // ================================================================ the throne room
  A('castle', { when: () => !F('ch0king'), npc: { id: 'king', name: '艾德蒙王', at: 'king', dir: 0, spec: { age: 'adult', beard: '#a8743a', colors: { top: '#2a3a8a', bottom: '#2a2a3a' }, outfit: { top: 'robe' }, robe: { inner: '#f0e6cc', trim: '#d8a838' }, hair: { style: 'short', color: '#a8743a' } }, gear: { crown: '#ffd84a', cape: '#b8282a' }, fixed: true } });
  A('castle', { when: () => !F('ch1'), npc: { id: 'mordain', name: '大賢者 莫迪恩', at: ['king', 3, 2], dir: -0.5, spec: { age: 'elder', beard: '#e8e8e8', colors: { top: '#3a2a5a', bottom: '#3a2a5a' }, outfit: { top: 'robe' }, robe: { inner: '#d8a838', trim: '#d8a838' }, hair: { style: 'bald' } }, gear: { beardLong: '#e8e8e8', weapon: 'staff', wcolor: '#a050ff', cape: '#2a1a4a' }, fixed: true, lines: [['水晶的歌聲……是這片大陸的心跳。'], ['孩子們，願水晶守護你們。']] } });
  A('castle', { when: () => !F('ch0king'), npc: { id: 'rex', name: '雷克斯隊長', at: ['king', -3, 3], dir: 0.6, spec: { age: 'adult', stubble: true, swordBrows: true, colors: { top: '#c8ccd4', bottom: '#2a3a6a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#5a3a1a' } }, gear: { cape: '#2a3a8a', shoulder: '#c8ccd4', weapon: 'sword' }, fixed: true } });
  A('castle', { when: () => !F('ch0king'), enter: async (D) => {
    await D.walk('lorne', [[9, 10], [9, 8], [9, 7]], 3);
    await D.say('king', '來了啊，年輕的騎士們。抬起頭來吧。');
    await D.say('lorne', '見、見習騎士洛恩，前來報到！');
    await D.say('vera', '見習騎士薇拉・艾斯特，前來報到。');
    await D.say('king', '你們應該都察覺到了——這幾個月來，水晶的歌聲一天比一天微弱。');
    await D.say('king', '尤其是北方的風之神殿。神殿的巫女們說，風之晶「在哭」。');
    await D.say('mordain', '水晶的歌聲，是封住「虛無」的力量。若是歌聲斷絕，千年前的災厄就會再次降臨。');
    await D.say('king', '雷克斯，你帶著兩人搭白隼號前往風之神殿巡查。這是他們成為正式騎士的第一個任務。');
    await D.say('rex', '是！包在我身上。小鬼們，別給我丟臉啊！', { happy: true });
    await D.say('mordain', '……薇拉，妳和妳哥哥賽勒斯真像。他也是在這裡，接下了他的第一個任務。');
    await D.say('vera', '……謝謝大賢者大人。哥哥他……一定還活著。', { mood: -0.2 });
    await D.say('mordain', '是啊。水晶會指引迷途的人回來的。');
    await D.say('king', '去吧。願水晶守護你們。');
    D.set('ch0king');
    await D.fade(true, 800);
    await D.goto('deck', 'door', { noFade: true });
  } });

  // ================================================================ the airship, and the attack
  A('deck', { when: () => !F('ch0crash'), npc: { id: 'rex', name: '雷克斯隊長', at: 'helm', spec: { age: 'adult', stubble: true, swordBrows: true, colors: { top: '#c8ccd4', bottom: '#2a3a6a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#5a3a1a' } }, gear: { cape: '#2a3a8a', shoulder: '#c8ccd4' }, fixed: true } });
  A('deck', { when: () => !F('ch0crash'), npc: { id: 'crew', look: 'sailor', at: ['center', 3, 1], name: '船員', fixed: true } });
  A('deck', { when: () => !F('ch0crash'), enter: async (D) => {
    D.music('airship');
    await D.walk('lorne', [[6, 6], [6, 4], [6, 3]], 3);
    await D.say('lorne', '哇啊——！看！雲在我們腳下！王都變得好小！', { happy: true });
    await D.say('vera', '把頭縮回來，掉下去我可不會救你。', { mood: 0.6 });
    await D.say('rex', '哈哈！我第一次上船的時候也是這副德性。洛恩，你知道「天空騎士」嗎？');
    await D.say('lorne', '當然！能駕駛飛空艇的騎士！我的夢想！');
    await D.say('rex', '那就好好表現吧。等你們回來，我教你們開船。');
    await D.say('crew', '隊長！前方雲層裡有東西在動——！', { name: '船員' });
    D.shake(1, 0.3); D.flash('#ffffff', 600); D.sfx('thunder');
    await D.wait(500);
    D.spawn({ id: 'gk', name: '？？？', at: ['bow', 0, -1], spec: { age: 'adult', swordBrows: true, colors: { top: '#5a5a66', bottom: '#2a2a32' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#e8ecf6' }, mask: '#6a6a76' }, gear: { cape: '#4a4a56', crown: '#9a9aa6', shoulder: '#6a6a76', weapon: 'sword', helm: '#6a6a76' }, anywhere: true });
    await D.emote('lorne', '!');
    await D.say('gk', '……白隼號。回去吧。這不是你們該看的東西。', { name: '灰冕騎士' });
    await D.say('rex', '灰色的王冠……！你們兩個，退後！');
    D.shake(1.2, 0.35); D.flash('#ff8a2a', 700); D.sfx('fire');
    await D.say('lorne', '船、船要掉下去了——！！');
    D.set('ch0crash');
    await D.fade(true, 1200);
    D.music('sad');
    await D.wait(800);
    await D.goto('windcanyon', 's', { noFade: true, stayDark: true, x: 24, z: 66 });
  } });

  // ================================================================ the wind canyon
  A('windcanyon', { when: () => !F('p_wake'), enter: async (D) => {
    await D.fade(false, 1500);
    await D.say('vera', '……洛恩。洛恩！快醒醒！');
    await D.say('lorne', '嗚……我們……還活著？', { mood: -0.3 });
    await D.say('vera', '我們被甩出船外，掉在峽谷的樹上。雷克斯隊長和白隼號……不知道掉到哪裡去了。', { mood: -0.4 });
    await D.say('lorne', '那個灰色的騎士……他到底是什麼人？');
    await D.say('vera', '不知道。但他往北飛了——那是風之神殿的方向。');
    await D.say('lorne', '那我們就去神殿！隊長說不定也在那邊！');
    await D.say('vera', '……嗯。小心點，峽谷裡有魔物。');
    D.music('field');
    D.set('p_wake');
    await D.say('', '{g}【戰鬥的基本】{/g}\n敵人頭上的藍色條是「防禦」。攻擊會削減它，打中{g}弱點{/g}會大幅削減。\n防禦歸零，敵人就會{g}破防（BREAK）{/g}：失去下一回合，受到的傷害增加五成！', { sys: true });
    await D.say('', '{g}【弱點與額外回合】{/g}\n敵人的弱點一開始是「？」。打中弱點後就會顯示出來，\n而且打中弱點的人可以{g}立刻再行動一次{/g}（額外回合）。洛恩的劍帶有「斬」，薇拉的槍帶有「突」。', { sys: true });
    const r = await D.battle(['slime', 'slime']);
    await D.say('', '{g}【共鳴】{/g}\n打中弱點、讓敵人破防，左下角的「共鳴」就會累積。\n共鳴滿一格，就能使用強大的{g}共鳴技{/g}（需要裝備「迴響」）。', { sys: true });
    await D.say('vera', '史萊姆怕火……洛恩，你的「火焰斬」學會了沒？', { mood: 0.3 });
    await D.say('lorne', '還、還差一點點！');
    D.toast('目標：往北穿過峽谷，前往風之神殿');
  } });
  A('windcanyon', { trigger: { at: 'mid0', r: 3, once: 'p_lin', run: async (D) => {
    D.spawn({ id: 'lin', hero: 'lin', name: '少女', at: ['mid0', 0, -4], dir: 0 });
    await D.say('lin', '不要過來——！', { name: '少女' });
    await D.emote('lorne', '!');
    await D.say('lorne', '有人被魔物追！');
    await D.walk('lin', [[0, 0]].map(() => [D.G().map.x, D.G().map.z - 2]), 5);
    await D.battle(['goblin', 'goblin', 'canyonwolf']);
    await D.say('lin', '謝、謝謝你們……', { name: '少女' });
    await D.say('vera', '妳一個人在這種地方做什麼？很危險的。');
    await D.say('lin', '我叫小鈴，住在風之神殿。今天早上……風開始哭了。好大聲、好大聲。', { name: '小鈴' });
    await D.say('lin', '然後一個灰色的人走進神殿，巫女姐姐們叫我快逃……');
    await D.say('lorne', '灰色的人……是那個騎士！');
    await D.say('lin', '你們要去神殿嗎？帶我一起去！水晶在叫我……它說「好痛」。', { mood: -0.4 });
    await D.say('vera', '水晶……在說話？', { brow: 0.5 });
    await D.say('lin', '嗯。大家都聽不見，可是我聽得見。巫女姐姐說，我是「聆晶者」。');
    await D.say('lorne', '好，一起走吧！我們會保護妳的！');
    D.remove('lin');
    await D.join('lin', 1);
    await D.say('', '{g}【小鈴】{/g}會使用「治癒」回復隊友，也能用「聆聽」看穿敵人的弱點和 HP。', { sys: true });
  } } });

  // ================================================================ the wind temple
  A('windtemple1', { when: () => !F('p_temple'), enter: async (D) => {
    D.set('p_temple');
    await D.say('lin', '……好安靜。巫女姐姐們都不在了。');
    await D.say('vera', '地上有打鬥的痕跡。大家小心。');
    await D.say('lin', '水晶在最深處。下面一層的祭壇。');
  } });
  A('windtemple2', { prop: { type: 'altar', at: 'altar', color: '#6ae88a', broken: () => F('windOpen') } });
  A('windtemple2', { when: () => !F('windOpen'), trigger: { at: 'bossFront', r: 3, once: 'p_roc', run: async (D) => {
    D.music('tension');
    D.spawn({ id: 'gk', name: '灰冕騎士', at: ['altar', 0, 1], dir: Math.PI, spec: { age: 'adult', swordBrows: true, colors: { top: '#5a5a66', bottom: '#2a2a32' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#e8ecf6' }, mask: '#6a6a76' }, gear: { cape: '#4a4a56', crown: '#9a9aa6', shoulder: '#6a6a76', weapon: 'sword', helm: '#6a6a76' }, anywhere: true });
    await D.say('lorne', '找到你了！灰色騎士！');
    await D.say('gk', '……還活著嗎。命真硬。');
    await D.say('lin', '住手！你在弄痛水晶！它在哭！', { mood: -0.5 });
    await D.say('gk', '……妳聽得見？', { name: '灰冕騎士' });
    await D.say('gk', '那妳更該明白。水晶的歌，從來就不是祝福。');
    await D.say('vera', '少說廢話！你把雷克斯隊長怎麼了！');
    await D.say('gk', '我沒空陪你們玩。……風蝕，交給你了。');
    D.shake(0.8, 0.3); D.sfx('wind');
    await D.say('', '巨大的鷹從神殿的天井俯衝下來！', { sys: true });
    await D.battle(['boss_roc'], { boss: true });
    await D.say('gk', '……能打倒風蝕。看來你們不只是運氣好。');
    D.sfx('dark'); D.flash('#6ae88a', 900);
    await D.say('', '灰冕騎士把手伸進水晶。綠色的光被他握在掌心，水晶發出玻璃碎裂的聲音——', { sys: true });
    D.set('windOpen');
    D.breakAltar();
    await D.say('lin', '啊……啊啊……！', { mood: -0.8 });
    await D.say('gk', '「心」我拿走了。剩下的……就讓它們自由吧。');
    await D.say('lorne', '站住！');
    await D.say('gk', '再見了，白隼的小騎士們。……薇拉，別再追了。', { name: '灰冕騎士' });
    D.remove('gk'); D.sfx('wind');
    await D.emote('vera', '!');
    await D.say('vera', '……他、他剛剛叫我的名字？', { brow: 0.6 });
    await D.say('lin', '大家……水晶碎掉了，可是……有東西留下來了。好溫暖……', { mood: 0.2 });
    D.flash('#ffffff', 1200); D.sfx('echo');
    await D.say('', '碎掉的水晶中，浮出兩道光。一道像劍，一道像風。它們繞著小鈴轉了一圈，輕輕地落進她的手心。', { sys: true });
    await D.say('', '「……終於……聽見我們了……」', { sys: true });
    await D.echo('arthur');
    await D.echo('sylph');
    await D.say('lin', '是英雄們的「迴響」……！他們說，願意借力量給我們。', { happy: true });
    await D.say('', '{g}【迴響】{/g}\n在選單的「迴響」把迴響裝備給隊友：能力提升、可以使用迴響的技能，\n共鳴滿時還能使用{g}共鳴技{/g}。戰鬥獲得的 EP 會讓迴響升級，學會新技能。', { sys: true });
    await D.give('windshard');
    await D.say('vera', '我們得回王都報告。灰冕騎士奪走了風之晶的心……其他的水晶也很危險。');
    await D.say('lorne', '小鈴，妳跟我們一起去王都吧。妳的力量，國王陛下一定需要。');
    await D.say('lin', '……嗯！', { happy: true });
    await D.fade(true, 800);
    await D.goto('world', 'windtemple', { noFade: false });
    D.toast('目標：回到白隼王都報告（王都在西南方）');
  } } });

  // ================================================================ back in Whitehawk: the report, and chapter 1
  A('whitehawk', { when: () => F('windOpen') && !F('ch1'), npc: { id: 'guard1', look: 'guard', at: ['castleGate', 2, 1], name: '城門衛兵', lines: [['你們回來了！雷克斯隊長被巡邏隊找到了，他受了傷，在教堂休息。', '陛下在等你們的報告。']] } });
  A('castle', { when: () => F('windOpen') && !F('ch1'), npc: { id: 'king', name: '艾德蒙王', at: 'king', dir: 0, spec: { age: 'adult', beard: '#a8743a', colors: { top: '#2a3a8a', bottom: '#2a2a3a' }, outfit: { top: 'robe' }, robe: { inner: '#f0e6cc', trim: '#d8a838' }, hair: { style: 'short', color: '#a8743a' } }, gear: { crown: '#ffd84a', cape: '#b8282a' }, fixed: true } });
  A('castle', { when: () => F('windOpen') && !F('ch1'), enter: async (D) => {
    await D.walk('lorne', [[9, 10], [9, 8], [9, 7]], 3);
    await D.say('king', '你們平安回來了……辛苦了。雷克斯也撿回一條命。');
    await D.say('lorne', '陛下，風之晶……被灰冕騎士奪走了「心」，碎掉了。', { mood: -0.4 });
    await D.say('mordain', '……「灰冕」。灰色的王冠。我聽過這個名號。');
    await D.say('mordain', '他們是一群相信「水晶是邪惡之物」的狂徒。若讓他們得逞，八顆水晶都會碎去，虛無將再度降臨。');
    await D.say('king', '而這位少女……就是神殿的聆晶者嗎？');
    await D.say('lin', '我、我叫小鈴！英雄們的迴響，願意幫助我們。', { happy: true });
    await D.say('mordain', '……！迴響回應了一個孩子？', { brow: 0.6 });
    await D.say('mordain', '……真是了不起。千年來，從未有人能做到。好好保護她吧。');
    await D.say('king', '洛恩、薇拉、小鈴。我任命你們追查灰冕騎士，守護剩下的水晶。');
    await D.say('mordain', '離這裡最近的，是南方蘆葦村附近的「沉沒神殿」——水之晶。去吧。');
    await D.say('king', '這些是旅費。王都的商店可以買到旅行需要的東西。');
    await D.gil(1000);
    await D.give('potion', 5);
    await D.say('vera', '（灰冕騎士……為什麼他會知道我的名字……）', { mood: -0.2 });
    await D.chapter(1, '水之晶', '沉沒的神殿');
    D.toast('目標：前往王都南邊的蘆葦村');
  } });
  A('whitehawk', { when: () => F('ch1') && !F('ch7'), npc: { id: 'rex', name: '雷克斯隊長', at: ['churchKeeper', -1, 1], spec: { age: 'adult', stubble: true, swordBrows: true, colors: { top: '#c8ccd4', bottom: '#2a3a6a' }, outfit: { top: 'coat' }, hair: { style: 'short', color: '#5a3a1a' } }, gear: { cape: '#2a3a8a' },
    lines: [['臭小鬼們，你們居然活下來了。了不起！', '那個灰冕騎士……他的劍法，我總覺得在哪裡見過。'], ['等我傷好了，一定把白隼號修好。到時候教你們開船，說話算話！']] } });
}
