// What to do next (shown in the menu), and the side quests' list. Both are worked out from the flags.
import { G, flag } from '../engine/state.js';

const MAIN = [
  ['ending', '故事結束了。無盡迴廊和晶獸還在等著你。'],
  ['ch12', '登上虛空之塔頂端，阻止神化的莫迪恩與「虛無」。'],
  ['ch11', '世界被虛無吞噬中。集結力量，前往王都北邊湖中升起的虛空之塔。（晶獸的巢穴也出現了）'],
  ['ch10', '搭飛空艇降落在學院都市艾爾德（王都東南的高台），進入時之迴廊追上莫迪恩。'],
  ['ch9castle', '穿過黑森林，前往北邊的影之城。'],
  ['ch9', '駕駛銀翼號，前往西北黑森林旁的灰燼村。'],
  ['airship', '飛空艇到手了！去西方海上的天空浮島，尋找光之神殿。'],
  ['ch8fort', '潛入王都東北山頂的空賊要塞，奪回銀翼號。'],
  ['ch8', '從地下水道逃出王都。'],
  ['ch7', '回到白隼王都，向國王報告。'],
  ['ch6tower', '穿過櫻花鄉北邊的幽竹林，登上雷鳴之塔。'],
  ['ch6', '搭海燕號往東，前往櫻花鄉。'],
  ['ch5ruins', '騎著奔奔鳥越過流沙，前往大沙海南方的古代遺跡。'],
  ['ch5', '搭海燕號往西，前往沙漠的金沙城。'],
  ['ch4palace', '穿過永凍冰原，前往北方的冰晶宮。'],
  ['ch4', '搭海燕號往北，前往雪國的霜燈村。'],
  ['ship', '有船了！從藍帆港出海吧。'],
  ['ch3pirate', '搭上漁船，前往南方海上的海賊島。'],
  ['lowtide', '退潮了！從藍帆港南邊的沙洲走到珊瑚洞窟。'],
  ['ch3', '前往王都東南方海邊的港都藍帆港。'],
  ['ch2mine', '穿過赤岩荒原，進入東邊的熔岩坑道。'],
  ['ch2', '在礦都鐵爐堡打聽火之晶的消息。'],
  ['pass_east', '東邊山口的落石清除了。往東前往礦都鐵爐堡。'],
  ['ch1swamp', '穿過迷霧沼澤，前往南方的沉沒神殿。'],
  ['ch1', '前往王都南邊的蘆葦村。'],
  ['windOpen', '回王都報告。'],
  ['ch0crash', '穿過風吟峽谷，前往北邊的風之神殿。'],
  ['ch0', '到王座之間晉見國王。'],
];
export function objective() { for (const [f, t] of MAIN) if (flag(f)) return t; return '到王座之間晉見國王。'; }
// side quests: shown once their flag to show is set
export const QUESTS = [];
export const quest = (q) => QUESTS.push({ show: () => flag(q.start), done: () => flag(q.end), ...q });
