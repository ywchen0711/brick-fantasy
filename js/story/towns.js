// People in the towns who are not tied to one chapter: the knights' trainer, a fortune teller who knows where the
// echoes are, and the folk of Whitehawk after the story.
import { flag, G } from '../engine/state.js';
import { ECHOES, echoLevel } from '../data/echoes.js';
import { quest } from './journal.js';

const F = flag;
export default function (A, BOSSES) {
  // a fortune teller in every big town: tells which echoes are still missing, and where to look
  const HINT = { sara: '金沙城的舞孃團長在找跳舞的人。', ivy: '珊瑚洞窟的深處，有一個小小的祭壇。', kin: '……王都的地牢裡，好像有一把會唱歌的琴。', shigure: '時之迴廊裡，時間會停下來的地方。', owen: '學院都市的老教授，藏著一本書。', stella: '無盡迴廊的第十層。', endknight: '無盡迴廊的最深處。' };
  const teller = async (D) => {
    const missing = Object.keys(ECHOES).filter((id) => !G.s.echoes[id]);
    await D.say('teller', `我是占卜師。讓我看看你們的星……你們已經和 ${Object.keys(G.s.echoes).length} 位迴響結下了緣。`, { name: '占卜師' });
    const h = missing.find((id) => HINT[id]);
    if (!missing.length) await D.say('teller', '……二十四顆星，全都在你們身邊閃耀著。了不起。', { name: '占卜師' });
    else if (h) await D.say('teller', `星星說……「${HINT[h]}」`, { name: '占卜師' });
    else await D.say('teller', '剩下的星，跟著故事走，自然就會遇見。', { name: '占卜師' });
    const mastered = Object.keys(G.s.echoes).filter((id) => echoLevel(G.s.echoes[id].ep) >= 10).length;
    await D.say('teller', `精通的迴響：${mastered} 位。精通的迴響技能，可以放進任何人的「技能欄」喔。`, { name: '占卜師' });
  };
  for (const town of ['whitehawk', 'forgeholm', 'bluesail', 'goldsand', 'academy', 'whitehawk_r'])
    A(town, { npc: { id: 'teller', name: '占卜師', look: 'woman', seed: 131, at: ['plazaE', 4, 4], specX: { colors: { top: '#5a2a7a', bottom: '#2a1a3a' }, eyeShadow: 'rgba(120,60,200,.35)' }, gear: { hood: '#5a2a7a' }, talk: teller } });
  // the knights' trainer in Whitehawk: tips about fighting
  A('whitehawk', { npc: { id: 'trainer', name: '騎士教官', look: 'guard', seed: 137, at: ['plazaW', -4, -3], talk: async (D) => {
    const tips = [
      '聽好！敵人的弱點一開始看不到。先用不同屬性打打看，打中弱點，「？」就會變成圖示。小鈴的「聆聽」可以直接看穿。',
      '打中弱點的人，可以馬上再行動一次！先用弱點削防禦，再趁破防的時候用大招，這是基本中的基本。',
      '頭目蓄力的時候，頭上的牌子會變紅。在牠出招之前讓牠破防，大招就會被打斷！',
      '共鳴滿了就用！一格放共鳴技，兩格放合體技——合體技要兩個人裝備「搭檔」的迴響。在選單的迴響頁可以看到搭檔是誰。',
      '迴響升到 Lv10 就算精通。精通的迴響技能可以放進任何人的技能欄。多練幾個迴響，隊伍會強很多。',
      '打不過的時候，就去練等級、換裝備、用道具。戰鬥中按「自動」和「加速」，練功會輕鬆很多。',
    ];
    const i = (G.s.flags.tipN = ((G.s.flags.tipN || 0) + 1) % tips.length);
    await D.say('trainer', tips[i]);
  } } });
  A('whitehawk', { when: () => F('ending'), npc: { id: 'wh_p1', look: 'kid', seed: 139, at: ['plaza', 3, 5], wander: 3, name: '小男孩', lines: [['天空騎士洛恩！我長大也要開飛空艇！'], ['昨天起風的時候，我好像聽到有人在唱歌耶。']] } });
  A('whitehawk', { when: () => F('ending'), npc: { id: 'rex2', name: '雷克斯隊長', look: 'guard', seed: 141, at: ['castleGate', -2, 2], lines: [['洛恩教的開船，比我教的好多了。……這句話不准說出去！']] } });
}
