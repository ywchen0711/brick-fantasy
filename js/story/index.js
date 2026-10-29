// The story, chapter by chapter. Each chapter adds people, happenings and bosses to the places:
//   A(mapId, { npc | trigger | enter | prop, when })   and   BOSSES[id] = { foes, pre, post, when, show }
import { G, flag } from '../engine/state.js';
import ch0 from './ch0.js';
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import ch3 from './ch3.js';
import ch4 from './ch4.js';
import ch5 from './ch5.js';
import ch6 from './ch6.js';
import ch7 from './ch7.js';
import ch8 from './ch8.js';
import ch9 from './ch9.js';
import ch10 from './ch10.js';
import ch11 from './ch11.js';
import post from './post.js';
import towns from './towns.js';

export const CONTENT = {}, BOSSES = {};
const A = (map, en) => { (CONTENT[map] ||= []).push(en); };
for (const ch of [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, post, towns]) ch(A, BOSSES);
export { start } from './ch0.js';
