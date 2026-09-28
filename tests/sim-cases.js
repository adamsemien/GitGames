/* ============================================================
   Simulate level tests - shared by tests/sim.test.mjs (node) and
   tests/sim.html (any browser). No framework: each check is a name and
   a function that throws on failure.

   1. Shape: every sim level has the parts the renderer needs, and its
      copy follows the track's rules.
   2. Replays: each level's step() is run through fixed action lists and
      the end state and score band are asserted. These pin the numbers
      the debriefs were written against - retune a game, update these.
   3. Purity: step() never mutates the state it is given, and the same
      actions always give the same result.
   ============================================================ */
import { systems } from '../data/systems.js';
import { TRACKS } from '../data/tracks.js';
import { GLOSSARY } from '../data/reference.js';

const nodes = systems.chapters.flatMap(c => c.nodes);
const simOf = id => nodes.find(n => n.id === id).steps.find(s => s.t === 'sim');

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); }
  return o;
}

/* Replay a game from fixed actions, exactly as the renderer does, but with
   every state frozen so a step() that mutates its input throws. */
export function replay(sim, actions) {
  let st = deepFreeze(sim.init());
  const history = [];
  for (const id of actions) {
    const offered = (typeof sim.actions === 'function' ? sim.actions(st) : sim.actions).map(a => a.id);
    if (!offered.includes(id)) throw new Error(`"${id}" is not offered on turn ${history.length + 1} (offered: ${offered.join(', ')})`);
    const before = st;
    st = deepFreeze(sim.step(st, id));
    history.push({ action: id, before, after: st });
    if (sim.over && sim.over(st)) break;
  }
  return { state: st, history, score: sim.score(history), view: sim.view(st) };
}

const eq = (got, want, what) => { if (got !== want) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };
const ok = (cond, what) => { if (!cond) throw new Error(what); };
const R = n => Math.round(n);
const rep = (a, n) => Array(n).fill(a);

/* [level, name, actions, check(result)] */
const REPLAYS = [
  ['st-01', 'all the stars: best paper rating, no wins', ['marco', 'zed', 'luca', 'dani', 'vik', 'rex'],
    r => { eq(r.score.stats[0].value, 573, 'paper'); eq(r.score.stats[1].value, 0, 'wins'); eq(r.score.band, 'bad', 'band'); }],
  ['st-01', 'role players plus two stars who fit: lower paper, all wins', ['ines', 'tom', 'ade', 'mei', 'jo', 'rex'],
    r => { eq(r.score.stats[0].value, 478, 'paper'); eq(r.score.stats[1].value, 10, 'wins'); eq(r.score.band, 'good', 'band'); }],
  ['st-01', 'every flashy fit: too many egos', ['petra', 'kofi', 'rui', 'mei', 'ola', 'rex'],
    r => { eq(r.score.stats[1].value, 3, 'wins'); eq(r.score.band, 'bad', 'band'); }],

  ['st-02', 'leave it: the tub overflows', rep('leave', 8),
    r => { eq(r.state.level, 100, 'level'); ok(r.state.spilt > 0, 'should have spilt'); eq(r.score.band, 'bad', 'band'); }],
  ['st-02', 'close the gap early: steady all the way', ['tapDown', 'tapDown', 'leave', 'tapDown', 'leave', 'leave', 'leave', 'leave'],
    r => { eq(r.score.stats[0].value, 8, 'turns inside'); eq(r.score.band, 'good', 'band'); }],

  ['st-03', 'chase the water: see-saw', ['hot6', 'hot6', 'hot6', 'leave', 'cold6', 'cold6', 'cold6', 'cold6', 'leave', 'hot6'],
    r => { eq(r.score.stats[0].value, 2, 'comfy turns'); eq(r.score.band, 'bad', 'band'); eq(r.state.water, 24, 'final water'); }],
  ['st-03', 'turn, then wait: the reference good run', ['hot6', 'hot2', ...rep('leave', 8)],
    r => { eq(r.score.stats[0].value, 8, 'comfy turns'); eq(r.score.stats[1].value, 2, 'handle moves'); eq(r.state.water, 38, 'final water'); eq(r.score.band, 'good', 'band'); }],
  ['st-03', 'the first two turns are always cold (the pipe)', ['hot6', 'hot6'],
    r => { eq(r.history[0].after.water, 30, 'turn 1'); eq(r.history[1].after.water, 30, 'turn 2'); eq(r.state.handle, 42, 'handle'); }],
  ['st-03', 'a change reaches the water exactly two turns later', ['hot6', 'leave', 'leave'],
    r => { eq(r.history[1].after.water, 30, 'turn 2'); eq(r.history[2].after.water, 36, 'turn 3'); }],

  ['st-04', 'on until 21, then off: overshoots', ['high', 'high', 'off', 'off', 'off', 'high', 'high', 'off', 'high', 'off'],
    r => { ok(r.score.stats[1].value > 23, 'should overshoot past 23'); eq(r.score.band, 'bad', 'band'); }],
  ['st-04', 'high, high, off, then low: settles at 21', ['high', 'high', 'off', ...rep('low', 7)],
    r => { eq(r.score.stats[0].value, 8, 'turns in band'); eq(R(r.state.temp), 21, 'final temp'); eq(r.score.band, 'good', 'band'); }],
  ['st-04', 'low all the way gets there, too late', rep('low', 10),
    r => { eq(R(r.state.temp), 20, 'final temp'); eq(r.score.band, 'bad', 'band'); }],

  ['st-05', 'two friends every day: the whole town', rep('two', 8),
    r => { eq(r.state.heard, 5000, 'heard'); eq(r.score.band, 'bad', 'band'); }],
  ['st-05', 'fast while small, then ease off', ['two', 'two', 'two', 'one', 'one', 'zero', 'zero', 'zero'],
    r => { eq(r.state.heard, 108, 'heard'); eq(r.score.band, 'good', 'band'); }],
  ['st-05', 'one friend a day: still overshoots', rep('one', 8),
    r => { eq(r.state.heard, 256, 'heard'); eq(r.score.band, 'mid', 'band'); }],

  ['st-06', 'push doubles every night: big bonus, no regulars', rep('push', 8),
    r => { eq(r.state.total, 832, 'drinks'); eq(r.state.regulars, 8, 'regulars'); eq(r.score.band, 'bad', 'band'); }],
  ['st-06', 'normal nights: smaller bonus, more regulars', rep('normal', 8),
    r => { eq(r.state.total, 776, 'drinks'); eq(r.state.regulars, 48, 'regulars'); eq(r.score.band, 'good', 'band'); }],

  ['st-07', 'promo every week: bump, then slide', rep('promo', 8),
    r => { eq(r.score.stats[0].value, 1680, 'week 1'); eq(r.score.stats[1].value, 880, 'week 8'); eq(r.score.band, 'bad', 'band'); }],
  ['st-07', 'fix first: dip, then climb', ['fix', 'fix', 'fix', ...rep('none', 5)],
    r => { eq(r.score.stats[0].value, 1400, 'week 1'); eq(r.score.stats[1].value, 1960, 'week 8'); eq(r.score.band, 'good', 'band'); }],
  ['st-07', 'stopping the promo hurts: the habit stays', ['promo', 'promo', 'promo', 'none'],
    r => { eq(r.history[3].after.takings, 1060, 'week 4'); }],

  ['st-08', 'a pill every day: fine days, worse mornings', rep('pill', 8),
    r => { eq(r.history[0].after.felt, 0, 'day 1 felt'); eq(r.state.next, 10, 'waking tomorrow'); eq(r.score.band, 'bad', 'band'); }],
  ['st-08', 'early nights: rough start, clear finish', rep('sleep', 8),
    r => { eq(r.history[0].after.felt, 6, 'day 1 felt'); eq(r.state.next, 0, 'waking tomorrow'); eq(r.score.band, 'good', 'band'); }],

  ['st-09', 'take three: everyone copies, the fridge dies', rep('3', 8),
    r => { eq(r.state.food, 0, 'food'); eq(r.state.ate, 21, 'you ate'); eq(r.score.band, 'bad', 'band'); }],
  ['st-09', 'take two: the fridge lasts', rep('2', 8),
    r => { eq(r.state.food, 40, 'food'); eq(r.state.ate, 16, 'you ate'); eq(r.score.band, 'good', 'band'); }],

  ['st-10', 'the three sensible ideas: barely moves', ['price', 'insta', 'run', 'paint', ...rep('run', 4)],
    r => { eq(R(r.score.stats[1].value), 324, 'coffees now'); eq(r.score.band, 'bad', 'band'); }],
  ['st-10', 'names as soon as it is offered', ['run', 'run', 'names', ...rep('run', 5)],
    r => { eq(R(r.score.stats[1].value), 722, 'coffees now'); eq(r.score.band, 'good', 'band'); }],
  ['st-10', 'names pulled late: only a few weeks to grow', ['price', 'insta', 'run', 'run', 'run', 'names', 'run', 'run'],
    r => { eq(R(r.score.stats[1].value), 463, 'coffees now'); eq(r.score.band, 'mid', 'band'); }],

  ['st-11', 'trust the ground: straight over the footbridge', ['n', 'e', 'n', 'n', 'n', 'w'],
    r => { eq(r.state.x, 0, 'x'); eq(r.state.y, 0, 'y'); eq(r.state.moves, 6, 'moves'); eq(r.score.band, 'good', 'band'); }],
  ['st-11', 'follow the map to the far bridge: out of moves', ['n', 'n', 'e', 'e', 'e', 'n', 'n', 'n', 'w', 'w'],
    r => { eq(r.state.bumps, 1, 'bumps'); eq(r.state.moves, 10, 'moves'); eq(r.score.band, 'bad', 'band'); }],
  ['st-11', 'bump the old bridge, then take the footbridge', ['n', 'n', 'e', 'n', 'n', 'n', 'w'],
    r => { eq(r.state.moves, 7, 'moves'); eq(r.score.band, 'mid', 'band'); }],

  ['st-12', 'autopilot all week', rep('auto', 8),
    r => { eq(r.state.features, 8, 'features'); eq(r.score.stats[1].value, 34, 'bugs waiting'); eq(r.score.band, 'bad', 'band'); }],
  ['st-12', 'tests first, then the agent loop', ['tested', 'tested', 'auto', 'auto', 'loop', 'auto', 'hand', 'loop'],
    r => { eq(r.state.features, 5, 'features'); eq(r.score.stats[1].value, 2, 'bugs waiting'); eq(r.score.band, 'good', 'band'); }],
  ['st-12', 'autopilot and patch by hand: treading water', ['auto', 'hand', 'auto', 'hand', 'auto', 'hand', 'auto', 'hand'],
    r => { eq(r.score.stats[1].value, 7, 'bugs waiting'); eq(r.score.band, 'mid', 'band'); }]
];

const VOCAB = {
  'st-01': ['emergence'], 'st-02': ['stock', 'flow'], 'st-03': ['delay'], 'st-04': ['balancing loop'],
  'st-05': ['reinforcing loop'], 'st-06': ['bounded rationality'], 'st-07': ['fixes that fail'],
  'st-08': ['shifting the burden'], 'st-09': ['commons'], 'st-10': ['leverage point'], 'st-11': ['mental model']
};

export function cases() {
  const out = [];
  const add = (name, fn) => out.push({ name, fn });

  add('track is registered first, with a home-screen lead line', () => {
    eq(TRACKS[0].id, 'systems', 'first track');
    ok(/think/i.test(systems.lead || ''), 'lead line mentions thinking');
    eq(systems.terms, 'own', 'links only its own glossary terms');
  });
  add('12 levels, node ids unique across every track', () => {
    eq(nodes.length, 12, 'levels');
    const all = TRACKS.flatMap(t => t.chapters.flatMap(c => c.nodes.map(n => n.id)));
    eq(new Set(all).size, all.length, 'unique ids');
  });
  add('copy uses spaced hyphens, never em or en dashes', () => {
    const text = JSON.stringify(systems, (k, v) => typeof v === 'function' ? String(v) : v);
    ok(!/[\u2014\u2013]/.test(text), 'found an em or en dash in data/systems.js');
    const gl = GLOSSARY.find(g => g.group === 'Systems thinking');
    ok(!/[\u2014\u2013]/.test(JSON.stringify(gl)), 'found a dash in the systems glossary');
  });
  add('glossary: every track term is scoped to this track', () => {
    const gl = GLOSSARY.find(g => g.group === 'Systems thinking');
    ok(gl && gl.items.length >= 9, 'at least the 9 required terms');
    ['stock', 'flow', 'delay', 'balancing loop', 'reinforcing loop', 'leverage point', 'mental model', 'bounded rationality', 'commons']
      .forEach(t => ok(gl.items.some(i => i.term.toLowerCase() === t), 'missing term: ' + t));
    gl.items.forEach(i => eq(i.track, 'systems', i.term + ' scope'));
  });

  nodes.forEach(n => {
    const sim = n.steps.find(s => s.t === 'sim');
    add(`${n.id} shape: 3-5 lessons, then one game, no quiz`, () => {
      const lessons = n.steps.filter(s => s.t === 'lesson').length;
      ok(lessons >= 3 && lessons <= 5, `${lessons} lessons`);
      eq(n.steps.filter(s => s.t === 'sim').length, 1, 'sim steps');
      eq(n.steps[n.steps.length - 1].t, 'sim', 'last step');
      eq(n.steps.filter(s => s.t === 'quiz').length, 0, 'quiz steps');
    });
    add(`${n.id} game: 6-10 turns, 1-5 actions a turn, readable views`, () => {
      ok(sim.turns >= 6 && sim.turns <= 10, 'turns ' + sim.turns);
      let st = sim.init();
      for (let t = 0; t < sim.turns; t++) {
        const acts = typeof sim.actions === 'function' ? sim.actions(st) : sim.actions;
        ok(acts.length >= 1 && acts.length <= 5, `turn ${t + 1}: ${acts.length} actions`);
        acts.forEach(a => ok(!/<[a-z]/i.test(a.label), 'action labels are plain text: ' + a.label));
        const v = sim.view(st);
        ok(Number.isFinite(+v.value), 'view value is a number');
        ok(['good', 'warn', 'bad', 'cool'].includes(v.tone), 'tone ' + v.tone);
        ok(v.label, 'view label');
        st = sim.step(st, acts[t % acts.length].id);
        if (sim.over && sim.over(st)) break;
      }
    });
    add(`${n.id} debrief: 2-3 paragraphs per band, names its idea`, () => {
      ['bad', 'mid', 'good'].forEach(b => {
        const d = sim.debrief[b];
        ok(Array.isArray(d) && d.length >= 2 && d.length <= 3, `${b}: ${d && d.length} paragraphs`);
        (VOCAB[n.id] || []).forEach(w => ok(new RegExp('<i>' + w + 's?</i>', 'i').test(d.join(' ')), `${b} band names "${w}" in italics`));
      });
    });
    add(`${n.id} recognise: 4 situations, one odd, feedback for each`, () => {
      const r = sim.recognise;
      eq(r.choices.length, 4, 'choices');
      ok(r.odd >= 0 && r.odd < 4, 'odd index');
      ok(r.right && /<b class="nolink">/.test(r.right), 'right answer names the level that covers it');
      r.choices.forEach((c, k) => { if (k !== r.odd) ok(r.wrong[k] && r.wrong[k].length > 20, `wrong[${k}] explains the pattern`); });
    });
    add(`${n.id} first lesson explains the idea in plain words`, () => {
      const first = JSON.stringify(n.steps[0].body).toLowerCase();
      (VOCAB[n.id] || []).forEach(w => ok(first.includes(w), `first lesson names "${w}"`));
      n.steps.filter(s => s.t === 'lesson').forEach(s => ok(!s.body.some(b => b.svg), 'no diagrams needed'));
    });
  });

  REPLAYS.forEach(([id, name, actions, check]) => add(`${id} replay - ${name}`, () => {
    const a = replay(simOf(id), actions), b = replay(simOf(id), actions);
    eq(JSON.stringify(a.state), JSON.stringify(b.state), 'same actions, same end state');
    check(a);
  }));

  return out;
}

export function runAll() {
  return cases().map(c => {
    try { c.fn(); return { name: c.name, pass: true }; }
    catch (e) { return { name: c.name, pass: false, error: e.message }; }
  });
}
