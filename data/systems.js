/* ============================================================
   TRACK: Systems Thinking
   How to think before the tools. Every level is the same three beats:
     1. a short plain-English lesson: what the idea is, everyday examples,
        what to do about it, then how the game works
     2. a small turn-based game to try the idea out
     3. a short debrief (chosen by how you did): what happened, then the
        lesson in one or two sentences, then a "spot it" question
   Plain explanations first, no extended analogies - players found the
   analogy-first version too indirect.

   Game shape (rendered by the one SIM renderer in app.js):
     init() -> state            step(state, actionId) -> new state (pure)
     actions: [{id,label}] | (state) => [...]    turns: 6-10
     view(state) -> { value, label, tone, pre?, unit?, sub?, gauge?, board?, msg? }
     score(history) -> { stats:[a, b], band:'bad'|'mid'|'good' }
   step() must be deterministic: tests/sim.test.mjs replays fixed action
   lists and asserts the end state. Change a number, update the test.
   ============================================================ */

const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const count = (list, f) => list.filter(f).length;
const band = (n, good, mid) => n >= good ? 'good' : n >= mid ? 'mid' : 'bad';

/* ------------------------------------------------------------
   1. PARTS VS THE WHOLE - eleven stars that lose
   ------------------------------------------------------------ */
const SQUAD = [
  { role: 'Keeper', opts: [
    { id: 'ines', name: 'Ines', r: 74, fit: true, ego: false, note: 'keeper, does the basics' },
    { id: 'marco', name: 'Marco', r: 95, fit: false, ego: true, note: 'star winger, "can do keeper"' },
    { id: 'petra', name: 'Petra', r: 84, fit: true, ego: true, note: 'keeper, wants the free kicks' }] },
  { role: 'Defender', opts: [
    { id: 'zed', name: 'Zed', r: 96, fit: false, ego: true, note: 'star striker, hates defending' },
    { id: 'tom', name: 'Tom', r: 72, fit: true, ego: false, note: 'defender, does the boring bits' },
    { id: 'kofi', name: 'Kofi', r: 85, fit: true, ego: true, note: 'defender, loves a solo run' }] },
  { role: 'Defender', opts: [
    { id: 'rui', name: 'Rui', r: 83, fit: true, ego: true, note: 'defender, flashy' },
    { id: 'luca', name: 'Luca', r: 93, fit: false, ego: true, note: 'star playmaker' },
    { id: 'ade', name: 'Ade', r: 75, fit: true, ego: false, note: 'defender, talks all game' }] },
  { role: 'Midfield', opts: [
    { id: 'sol', name: 'Sol', r: 76, fit: true, ego: false, note: 'midfielder, passes to everyone' },
    { id: 'mei', name: 'Mei', r: 86, fit: true, ego: true, note: 'midfielder, wants every ball' },
    { id: 'dani', name: 'Dani', r: 97, fit: false, ego: true, note: 'best striker in the league' }] },
  { role: 'Midfield', opts: [
    { id: 'vik', name: 'Vik', r: 94, fit: false, ego: true, note: 'star winger' },
    { id: 'ola', name: 'Ola', r: 84, fit: true, ego: true, note: 'midfielder, shoots from anywhere' },
    { id: 'jo', name: 'Jo', r: 73, fit: true, ego: false, note: 'midfielder, runs all day' }] },
  { role: 'Striker', opts: [
    { id: 'bea', name: 'Bea', r: 77, fit: true, ego: false, note: 'striker, sets others up' },
    { id: 'kai', name: 'Kai', r: 90, fit: false, ego: true, note: 'star midfielder, wants to score' },
    { id: 'rex', name: 'Rex', r: 98, fit: true, ego: true, note: 'most famous player alive' }] }
];
const PLAYERS = Object.fromEntries(SQUAD.flatMap(s => s.opts.map(o => [o.id, o])));

/* How the team actually plays: a player out of position gives about half,
   more than two players who need the ball start costing games, and every
   player who makes others better adds a little on top. */
function teamStrength(ids) {
  const ps = ids.map(id => PLAYERS[id]);
  const parts = ps.reduce((a, p) => a + (p.fit ? p.r : p.r * 0.55) + (p.ego ? 0 : 8), 0);
  const clash = Math.max(0, count(ps, p => p.ego) - 2) * 40;
  return parts - clash;
}
const winsOf = ids => clamp(Math.round((teamStrength(ids) - 300) / 19), 0, 10);

const football = {
  t: 'sim', title: 'Pick your six',
  brief: 'Each turn, one role needs filling and three players are free. Pick one.',
  turns: 6,
  init: () => ({ picks: [] }),
  actions: st => SQUAD[Math.min(st.picks.length, 5)].opts.map(o => ({ id: o.id, label: `${o.name} - ${o.r} - ${o.note}` })),
  step: (st, id) => ({ picks: st.picks.concat(id) }),
  view: st => {
    const paper = st.picks.reduce((a, id) => a + PLAYERS[id].r, 0);
    const avg = st.picks.length ? paper / st.picks.length : 0;
    const next = SQUAD[st.picks.length];
    return {
      value: paper, label: 'Team rating on paper',
      tone: !st.picks.length ? 'cool' : avg >= 88 ? 'good' : avg >= 80 ? 'warn' : 'cool',
      sub: (st.picks.length ? 'So far: ' + st.picks.map(id => `${PLAYERS[id].name} (${SQUAD[st.picks.indexOf(id)].role})`).join(', ') + '. ' : '') +
        (next ? `Now picking: <b>${next.role}</b>` : '<b>Squad complete.</b> The season plays itself.')
    };
  },
  score: h => {
    const picks = h[h.length - 1].after.picks;
    const w = winsOf(picks);
    return {
      stats: [{ label: 'Rating on paper', value: picks.reduce((a, id) => a + PLAYERS[id].r, 0) },
              { label: 'Games won', value: w, unit: ' of 10' }],
      band: band(w, 8, 4)
    };
  },
  debrief: {
    bad: [
      'You won only a few games. Your team looked great on paper because you picked the highest ratings, but many of those players were out of position or all wanted the ball.',
      'The lesson: a group\'s results come from how its parts fit together, not from adding up how good each part is. This is called <i>emergence</i>.'
    ],
    mid: [
      'You won some and lost some. A few picks fitted their roles and a few were stars who didn\'t.',
      'The lesson: a group\'s results come from how its parts fit together, not from adding up how good each part is. This is called <i>emergence</i>.'
    ],
    good: [
      'You won most games with a team that looked ordinary on paper, because you picked players who fitted their roles and didn\'t stack the team with ball-hogs.',
      'The lesson: a group\'s results come from how its parts fit together, not from adding up how good each part is. This is called <i>emergence</i>.'
    ]
  },
  recognise: {
    q: 'Which one is NOT about how the parts fit together?',
    choices: [
      'Five famous musicians form a band and make a forgettable album.',
      'A dinner party of your six funniest friends goes flat because they all talk over each other.',
      'You keep turning a shower hotter because it still feels cold, then it suddenly goes scalding.',
      'A restaurant hires a top chef for every station, but nobody organises the orders, so the food comes out late.'
    ],
    odd: 2,
    right: 'Right. The shower is about a delay - the hot water arrives late. That\'s level 3, <b class="nolink">Delays</b>.',
    wrong: [
      'That one IS about fit. Each musician is great, but they don\'t work well together.',
      'That one IS about fit. Great guests, but together they cancel each other out.',
      '',
      'That one IS about fit. Every chef is great, but the job that connects them is missing.'
    ]
  }
};

/* ------------------------------------------------------------
   2. STOCKS AND FLOWS - the bathtub
   ------------------------------------------------------------ */
const bathtub = {
  t: 'sim', title: 'Keep the bath between the lines',
  brief: 'The number is the water in the tub. Keep it between 40 and 70 litres.',
  turns: 8,
  init: () => ({ level: 50, tap: 10, drain: 4, t: 0, spilt: 0, msg: '' }),
  actions: [
    { id: 'tapUp', label: 'Tap up' }, { id: 'tapDown', label: 'Tap down' },
    { id: 'drainUp', label: 'Open the drain' }, { id: 'drainDown', label: 'Close the drain' },
    { id: 'leave', label: 'Leave it' }
  ],
  step: (st, a) => {
    let { tap, drain } = st;
    if (a === 'tapUp') tap += 3;
    if (a === 'tapDown') tap -= 3;
    if (a === 'drainUp') drain += 3;
    if (a === 'drainDown') drain -= 3;
    const t = st.t + 1;
    let msg = '';
    if (t === 3) { drain -= 4; msg = 'Something is clogging the plug hole. The drain is slower now.'; }
    if (t === 6) { tap -= 3; msg = 'Someone is running the kitchen tap. Your water pressure drops.'; }
    tap = clamp(tap, 0, 15); drain = clamp(drain, 0, 15);
    const raw = st.level + tap - drain;
    return { level: clamp(raw, 0, 100), tap, drain, t, spilt: st.spilt + Math.max(0, raw - 100), msg };
  },
  view: st => ({
    value: st.level, unit: ' L', label: 'Water in the tub',
    tone: st.level >= 40 && st.level <= 70 ? 'good' : st.level < 40 ? (st.level < 30 ? 'bad' : 'cool') : (st.level > 80 ? 'bad' : 'warn'),
    gauge: { min: 0, max: 100, lo: 40, hi: 70, minLabel: 'empty', maxLabel: 'overflowing' },
    sub: `Tap pouring in <b>${st.tap}</b> a turn · Drain taking <b>${st.drain}</b> a turn`,
    msg: st.msg
  }),
  score: h => {
    const levels = h.map(x => x.after.level);
    const inside = count(levels, l => l >= 40 && l <= 70);
    const worst = Math.max(0, ...levels.map(l => l < 40 ? 40 - l : l > 70 ? l - 70 : 0));
    return {
      stats: [{ label: 'Turns between the lines', value: inside, unit: ' of 8' },
              { label: 'Furthest outside', value: worst, unit: ' L' }],
      band: band(inside, 7, 4)
    };
  },
  debrief: {
    bad: [
      'The bath went outside the lines. You were probably watching the water level, but the level keeps moving as long as the water coming in and going out are different.',
      'The lesson: a <i>stock</i> (the water) only changes by its <i>flows</i> - what comes in minus what goes out. Make them equal and the stock stays steady.'
    ],
    mid: [
      'Mostly between the lines, but it slipped when the drain clogged or the pressure dropped. The flows changed and the level followed.',
      'The lesson: a <i>stock</i> (the water) only changes by its <i>flows</i> - what comes in minus what goes out. Make them equal and the stock stays steady.'
    ],
    good: [
      'You kept in and out roughly equal, so the level stayed steady - and you adjusted when the drain clogged.',
      'The lesson: a <i>stock</i> (the water) only changes by its <i>flows</i> - what comes in minus what goes out. Make them equal and the stock stays steady.'
    ]
  },
  recognise: {
    q: 'Which one is NOT something filling up or draining?',
    choices: [
      'Your friend group is more fun together than any one friend on their own.',
      'Your savings shrink even after a pay rise, because your spending went up more.',
      'Your inbox keeps growing because more emails arrive than you answer.',
      'A lake stays the same size because the same amount flows in as evaporates.'
    ],
    odd: 0,
    right: 'Right. A fun friend group is about how people fit together - level 1, <b class="nolink">Parts vs the whole</b>.',
    wrong: [
      '',
      'That one IS a stock: savings only grow if money in beats money out.',
      'That one IS a stock: the inbox is the pile, new emails flow in, replies flow out.',
      'That one IS a stock: in equals out, so the level stays the same.'
    ]
  }
};

/* ------------------------------------------------------------
   3. DELAYS - the slow shower   (the reference build)
   The handle sets the water leaving the boiler. That water takes two
   turns to travel the pipe, so what you feel now was set two turns ago.
   The dial shows where the handle points - the truth is on screen, it
   is just not the number your skin is reading.
   ------------------------------------------------------------ */
const COMFY_LO = 36, COMFY_HI = 40;
const showerTone = w => w < COMFY_LO ? 'cool' : w <= COMFY_HI ? 'good' : w <= 44 ? 'warn' : 'bad';
const showerMsg = (w, prev) =>
  w > 46 ? 'Scalding. You are flat against the tiles.'
  : w > COMFY_HI ? 'Too hot.'
  : w < 32 ? 'Freezing.'
  : w < COMFY_LO ? 'Still too cold.'
  : prev < COMFY_LO || prev > COMFY_HI ? 'Oh, that is nice.' : '';

const shower = {
  t: 'sim', title: 'The slow shower',
  brief: 'Keep the water on your back between 36 and 40 degrees for ten turns.',
  turns: 10,
  init: () => ({ water: 30, handle: 30, pipe: [30, 30], msg: '' }),
  actions: [
    { id: 'hot6', label: 'Much hotter' }, { id: 'cold6', label: 'Much cooler' },
    { id: 'hot2', label: 'A bit hotter' }, { id: 'cold2', label: 'A bit cooler' },
    { id: 'leave', label: 'Leave it' }
  ],
  step: (st, a) => {
    const turn = { hot6: 6, hot2: 2, leave: 0, cold2: -2, cold6: -6 }[a] || 0;
    const handle = clamp(st.handle + turn, 15, 60);
    const water = st.pipe[0];
    return { water, handle, pipe: [st.pipe[1], handle], msg: showerMsg(water, st.water) };
  },
  view: st => ({
    value: st.water, unit: '°', label: 'Water on your back',
    tone: showerTone(st.water),
    gauge: { min: 20, max: 55, lo: COMFY_LO, hi: COMFY_HI, minLabel: 'cold', maxLabel: 'scalding' },
    sub: `The handle points at <b>${st.handle}°</b> on the dial`,
    msg: st.msg
  }),
  score: h => {
    const comfy = count(h, x => x.after.water >= COMFY_LO && x.after.water <= COMFY_HI);
    const moves = count(h, x => x.action !== 'leave');
    return {
      stats: [{ label: 'Comfortable turns', value: comfy, unit: ' of 10' },
              { label: 'Times you turned the handle', value: moves }],
      band: band(comfy, 7, 3)
    };
  },
  debrief: {
    bad: [
      'The water swung between too cold and too hot. You kept turning the handle because nothing seemed to change - then all those turns arrived at once.',
      'The lesson: when there\'s a <i>delay</i> between action and result, make one change and wait for it to land. Go by where things are heading (the dial), not only by what you feel right now.'
    ],
    mid: [
      'You got there, but overshot on the way by turning the handle again before your last change had arrived.',
      'The lesson: when there\'s a <i>delay</i> between action and result, make one change and wait for it to land. Go by where things are heading (the dial), not only by what you feel right now.'
    ],
    good: [
      'You made a change and then waited for it. The first two turns were always going to be cold - that water was already in the pipe.',
      'The lesson: when there\'s a <i>delay</i> between action and result, make one change and wait for it to land. Go by where things are heading (the dial), not only by what you feel right now.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a delay?',
    choices: [
      'You eat a second plate because you\'re still hungry, and 20 minutes later you\'re stuffed.',
      'A bank raises interest rates, sees no change for months, raises them again - and the economy slows sharply.',
      'You keep turning up an old slow radiator in the evening and wake up at 3am roasting.',
      'Everyone who tries a new café tells two friends, and by Friday there\'s a queue round the block.'
    ],
    odd: 3,
    right: 'Right. The café grows because each person brings more people - that\'s level 5, <b class="nolink">Reinforcing loops</b>, not a delay.',
    wrong: [
      'That one IS a delay: feeling full takes about 20 minutes to catch up with eating.',
      'That one IS a delay: interest rates take months to have an effect.',
      'That one IS a delay: the radiator takes hours to heat the room.',
      ''
    ]
  }
};

/* ------------------------------------------------------------
   4. BALANCING LOOPS - the thermostat
   The room leaks heat faster the warmer it is, so any steady heater
   setting has a resting temperature: low rests at about 21. The radiator
   is slow to warm and slow to cool, so high overshoots if you ride it
   all the way to 21. Tuned so on/off play scores 2-3 turns in the band
   and "high, high, off, then low" scores 8.
   ------------------------------------------------------------ */
const POWER = { high: 12, low: 4, off: 0 };
const roomTone = t => { const r = Math.round(t); return r < 20 ? 'cool' : r <= 22 ? 'good' : r <= 24 ? 'warn' : 'bad'; };
const radFeel = r => r > 8 ? 'too hot to touch' : r > 4.5 ? 'hot' : r > 1.5 ? 'warm' : 'cold';
const thermostat = {
  t: 'sim', title: 'Keep the room at 21',
  brief: 'Keep the room between 20 and 22 degrees for ten turns.',
  turns: 10,
  init: () => ({ temp: 12, rad: 0, power: 'off' }),
  actions: [
    { id: 'high', label: 'Heater on high' }, { id: 'low', label: 'Heater on low' }, { id: 'off', label: 'Heater off' }
  ],
  step: (st, a) => {
    const p = POWER[a] ?? 0;
    const rad = st.rad + (p - st.rad) * 0.3;       // radiators are slow both ways
    const temp = st.temp + rad - 0.3 * (st.temp - 8);
    return { temp, rad, power: a };
  },
  view: st => ({
    value: st.temp, unit: '°', label: 'Room temperature',
    tone: roomTone(st.temp),
    gauge: { min: 10, max: 32, lo: 19.5, hi: 22.5, minLabel: '10°', maxLabel: '32°' },
    sub: `Heater: <b>${st.power}</b> · the radiator is <b>${radFeel(st.rad)}</b>`
  }),
  score: h => {
    const zone = count(h, x => Math.round(x.after.temp) >= 20 && Math.round(x.after.temp) <= 22);
    const hottest = Math.max(...h.map(x => x.after.temp));
    return {
      stats: [{ label: 'Turns at 20 to 22', value: zone, unit: ' of 10' },
              { label: 'Hottest it got', value: hottest, unit: '°' }],
      band: band(zone, 6, 4)
    };
  },
  debrief: {
    bad: [
      'The room kept swinging past 22 and back below 20. Switching high on and off doesn\'t work, because the radiator keeps heating after you turn it off.',
      'The lesson: a <i>balancing loop</i> pulls things back toward a target on its own. Choose the right setting and let it settle, instead of fighting it.'
    ],
    mid: [
      'You got close, but overshot a few times - usually from leaving it on high too long.',
      'The lesson: a <i>balancing loop</i> pulls things back toward a target on its own. Choose the right setting and let it settle, instead of fighting it.'
    ],
    good: [
      'You warmed up on high, backed off before reaching 21, and let low hold it steady.',
      'The lesson: a <i>balancing loop</i> pulls things back toward a target on its own. Choose the right setting and let it settle, instead of fighting it.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a balancing loop?',
    choices: [
      'You eat a big lunch, skip your snack, and get hungry right on time for dinner.',
      'A bakery raises the price of cakes that sell out by noon, until they last all day.',
      'The more followers an account has, the more people see it, and the faster it gains followers.',
      'Your body sweats when hot and shivers when cold, and stays near 37 degrees.'
    ],
    odd: 2,
    right: 'Right. More followers bringing more followers keeps growing instead of settling - that\'s the next level, level 5, <b class="nolink">Reinforcing loops</b>.',
    wrong: [
      'That one IS a balancing loop: hunger rises when you\'re low and drops when you eat.',
      'That one IS a balancing loop: the price moves until supply and demand match.',
      '',
      'That one IS a balancing loop: your body pushes back toward 37 degrees.'
    ]
  }
};

/* ------------------------------------------------------------
   5. REINFORCING LOOPS - the rumour
   ------------------------------------------------------------ */
const GIG_MIN = 100, GIG_MAX = 150, TOWN = 5000;
const gigTone = n => n < GIG_MIN ? 'cool' : n <= GIG_MAX ? 'good' : n <= 300 ? 'warn' : 'bad';
const rumour = {
  t: 'sim', title: 'Fill the room',
  brief: 'Get between 100 and 150 people to hear about the gig by Saturday.',
  turns: 8,
  init: () => ({ heard: 1, day: 0, rate: 0 }),
  actions: [
    { id: 'zero', label: 'Keep it quiet today' },
    { id: 'one', label: 'Everyone tells one friend' },
    { id: 'two', label: 'Everyone tells two friends' }
  ],
  step: (st, a) => {
    const rate = { zero: 0, one: 1, two: 2 }[a] ?? 0;
    return { heard: Math.min(TOWN, st.heard + st.heard * rate), day: st.day + 1, rate };
  },
  view: st => ({
    value: st.heard, label: 'People who have heard',
    tone: gigTone(st.heard),
    sub: `The room holds <b>${GIG_MAX}</b>. You need <b>${GIG_MIN}</b> to cover the hire.` +
      (st.day ? ` Days to go: <b>${8 - st.day}</b>` : ''),
    msg: st.heard >= TOWN ? 'The whole town has heard. Your mum has heard.' : ''
  }),
  score: h => {
    const n = h[h.length - 1].after.heard;
    return {
      stats: [{ label: 'Heard about it', value: n }, { label: 'Turned away at the door', value: Math.max(0, n - GIG_MAX) }],
      band: n >= GIG_MIN && n <= GIG_MAX ? 'good' : n >= 60 && n <= 300 ? 'mid' : 'bad'
    };
  },
  debrief: {
    bad: [
      'You ended well outside 100 to 150. If the crowd got too big: the numbers looked tiny at first (3, then 9), so you kept spreading it - then it tripled past the limit.',
      'The lesson: a <i>reinforcing loop</i> grows by multiplying, so it starts slow and then explodes. Slow it down while the numbers still look small.'
    ],
    mid: [
      'Close, but you slowed it down a day too late (too many people) or too early (not enough).',
      'The lesson: a <i>reinforcing loop</i> grows by multiplying, so it starts slow and then explodes. Slow it down while the numbers still look small.'
    ],
    good: [
      'You spread it fast while the numbers were small, then slowed down before they got big.',
      'The lesson: a <i>reinforcing loop</i> grows by multiplying, so it starts slow and then explodes. Slow it down while the numbers still look small.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a reinforcing loop?',
    choices: [
      'Savings earn interest, and next year the interest earns interest too.',
      'A cup of tea cools down until it\'s the same temperature as the room.',
      'An unpaid credit card bill grows because you\'re charged interest on the interest.',
      'Every message in a group chat gets two replies, and each reply gets more replies.'
    ],
    odd: 1,
    right: 'Right. The tea settles at room temperature - that\'s a target, so it\'s level 4, <b class="nolink">Balancing loops</b>.',
    wrong: [
      'That one IS a reinforcing loop: more money earns more interest, which makes more money.',
      '',
      'That one IS a reinforcing loop: more debt means more interest, which means more debt.',
      'That one IS a reinforcing loop: each reply creates more replies.'
    ]
  }
};

/* ------------------------------------------------------------
   6. BOUNDED RATIONALITY - the bartender paid per drink
   ------------------------------------------------------------ */
const BAR = {
  push: { label: 'Push doubles and shots', drinks: r => r * 4, reg: -4, msg: 'Loud night. A few regulars left early and did not say goodbye.' },
  deal: { label: 'Two-for-one to fill the room', drinks: r => r * 3 + 40, reg: -3, msg: 'Packed with strangers. The regulars could not get a seat.' },
  normal: { label: 'Friendly service, normal pours', drinks: r => r * 2 + 10, reg: 1, msg: 'A good, ordinary night.' },
  cut: { label: 'Cut off the loud ones early', drinks: r => r * 2 - 5, reg: 3, msg: 'Quiet and easy. A regular brought a friend.' }
};
const bartender = {
  t: 'sim', title: 'Behind the bar',
  brief: 'You get a bonus on every drink you sell. Eight nights. Run the bar.',
  turns: 8,
  init: () => ({ regulars: 40, came: 40, tonight: 0, total: 0, night: 0, msg: '' }),
  actions: Object.entries(BAR).map(([id, b]) => ({ id, label: b.label })),
  step: (st, a) => {
    const b = BAR[a] || BAR.normal;
    const drinks = Math.max(0, b.drinks(st.regulars));
    return { regulars: clamp(st.regulars + b.reg, 0, 80), came: st.regulars, tonight: drinks,
      total: st.total + drinks, night: st.night + 1, msg: b.msg };
  },
  view: st => ({
    value: st.tonight, label: st.night ? 'Drinks you sold tonight' : 'Drinks sold so far',
    tone: !st.night ? 'cool' : st.tonight >= 140 ? 'good' : st.tonight >= 90 ? 'warn' : 'cool',
    sub: st.night ? `Regulars who came in: <b>${st.came}</b> · your bonus so far: <b>${st.total}</b> drinks` : `About <b>${st.regulars}</b> regulars come in on a normal night.`,
    msg: st.msg
  }),
  score: h => {
    const end = h[h.length - 1].after;
    return {
      stats: [{ label: 'Drinks you sold', value: end.total }, { label: 'Regulars still coming', value: end.regulars }],
      band: band(end.regulars, 40, 25)
    };
  },
  debrief: {
    bad: [
      'Your bonus was big, but most regulars stopped coming. Pushing drinks paid you well every night and slowly drove away the people the bar depends on.',
      'The lesson: when people are rewarded on one narrow number, sensible choices can hurt the whole system. That\'s <i>bounded rationality</i>. To change the behaviour, change what people are rewarded on or what they can see.'
    ],
    mid: [
      'You mixed nights that boosted your bonus with nights that looked after the regulars. The bar is okay, not great.',
      'The lesson: when people are rewarded on one narrow number, sensible choices can hurt the whole system. That\'s <i>bounded rationality</i>. To change the behaviour, change what people are rewarded on or what they can see.'
    ],
    good: [
      'You kept the regulars coming, even though it meant a smaller bonus.',
      'The lesson: when people are rewarded on one narrow number, sensible choices can hurt the whole system. That\'s <i>bounded rationality</i>. To change the behaviour, change what people are rewarded on or what they can see.'
    ]
  },
  recognise: {
    q: 'Which one is NOT people chasing a narrow reward?',
    choices: [
      'Call centre staff are judged on short calls, so they rush callers, who then call back again.',
      'A school judged only on exam results stops teaching anything that isn\'t on the exam.',
      'A salesperson paid per sale pushes deals customers don\'t need, and customers stop coming back.',
      'One small change to a café\'s loyalty card doubles its sales, while five other changes did almost nothing.'
    ],
    odd: 3,
    right: 'Right. The loyalty card is one small change with a big effect - level 10, <b class="nolink">Leverage points</b>.',
    wrong: [
      'That one IS the pattern: staff do what they\'re measured on, not what solves the caller\'s problem.',
      'That one IS the pattern: teachers follow the number they\'re judged on.',
      'That one IS the pattern: the salesperson follows their commission, and the business loses customers.',
      ''
    ]
  }
};

/* ------------------------------------------------------------
   7. FIXES THAT FAIL - the Tuesday promo
   A promo fills Tuesday now and teaches Friday regulars to wait for
   the deal. The real fix costs money now and pays a week later.
   ------------------------------------------------------------ */
const promo = {
  t: 'sim', title: 'Save slow Tuesdays',
  brief: 'Eight weeks. Fridays are full, Tuesdays are dead. Decide what to do each week.',
  turns: 8,
  init: () => ({ tueBase: 40, hunters: 0, pending: 0, week: 0, takings: 1600, tue: 40, fri: 120, msg: '' }),
  actions: [
    { id: 'promo', label: 'Run a 40%-off Tuesday' },
    { id: 'none', label: 'No promo this week' },
    { id: 'fix', label: 'Build a proper lunch menu' }
  ],
  step: (st, a) => {
    const tueBase = st.tueBase + st.pending;
    const fri = Math.max(40, 120 - st.hunters);
    let tue, tueTake, hunters = st.hunters, pending = 0, cost = 0, msg;
    if (a === 'promo') {
      tue = tueBase + 40; tueTake = tue * 6; hunters += 12;
      msg = st.hunters ? 'Tuesday is buzzing. Friday felt a bit thin, though.' : 'A queue out of the door on a Tuesday!';
    } else {
      tue = Math.max(10, Math.round(tueBase - st.hunters / 2)); tueTake = tue * 10;
      hunters = Math.max(0, hunters - 4);
      if (a === 'fix') { cost = 200; pending = 12; msg = 'The menu cost money this week. It will take a week to catch on.'; }
      else msg = st.hunters ? 'No deal this Tuesday. The deal-hunters stayed home.' : 'A normal week.';
    }
    return { tueBase, hunters, pending, week: st.week + 1, tue, fri, takings: tueTake + fri * 10 - cost, msg };
  },
  view: st => ({
    value: st.takings, pre: '$', label: st.week ? 'Takings this week' : 'A normal week',
    tone: st.takings >= 1700 ? 'good' : st.takings >= 1400 ? 'warn' : 'bad',
    sub: `Tuesday: <b>${st.tue}</b> customers · Friday: <b>${st.fri}</b> customers`,
    msg: st.msg
  }),
  score: h => {
    const first = h[0].after.takings, last = h[h.length - 1].after.takings;
    return {
      stats: [{ label: 'Takings, week 1', value: first, pre: '$' }, { label: 'Takings, week 8', value: last, pre: '$' }],
      band: last >= 1700 ? 'good' : last >= 1400 ? 'mid' : 'bad'
    };
  },
  debrief: {
    bad: [
      'The promo gave you a quick bump, then takings slid. Friday customers started waiting for Tuesday\'s deal, and when you stopped the promo, Tuesday crashed too.',
      'The lesson: a quick fix with a side effect can make the problem worse over time, so you need it again and again. These are called <i>fixes that fail</i>. Look for the fix that deals with the cause.'
    ],
    mid: [
      'You ended roughly where you started. The promo\'s side effects cancelled out its bump.',
      'The lesson: a quick fix with a side effect can make the problem worse over time, so you need it again and again. These are called <i>fixes that fail</i>. Look for the fix that deals with the cause.'
    ],
    good: [
      'The lunch menu cost you money at first, then raised takings every week after.',
      'The lesson: a quick fix with a side effect can make the problem worse over time, so you need it again and again. These are called <i>fixes that fail</i>. Look for the fix that deals with the cause.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a fix that fails?',
    choices: [
      'Fish in a lake run out because every fisher takes a bit more than their share.',
      'A city widens a busy road, more people start driving, and it\'s jammed again.',
      'You pay off one credit card with another, and next month you owe more.',
      'A shop holds a sale every weekend, and now nobody pays full price.'
    ],
    odd: 0,
    right: 'Right. The fish run out because many people overuse something shared - level 9, <b class="nolink">Tragedy of the commons</b>.',
    wrong: [
      '',
      'That one IS a fix that fails: the wider road attracts more cars.',
      'That one IS a fix that fails: moving the debt adds fees and a bigger bill.',
      'That one IS a fix that fails: the sale teaches customers to wait for sales.'
    ]
  }
};

/* ------------------------------------------------------------
   8. SHIFTING THE BURDEN - the morning headache
   The pill kills today's pain and adds a rebound; the slow fixes
   leave today alone and shrink what causes tomorrow's.
   ------------------------------------------------------------ */
const HEAD = {
  pill: { label: 'Take a painkiller', relief: 6, cause: 0.25, rebound: 1 },
  sleep: { label: 'Early night', relief: 0, cause: -1.5, rebound: -0.5 },
  water: { label: 'Big glass of water', relief: 1, cause: -0.5, rebound: -0.5 },
  screens: { label: 'Screens off at ten', relief: 0, cause: -1, rebound: -0.5 }
};
const headache = {
  t: 'sim', title: 'Another morning',
  brief: 'Eight mornings. One choice a day. The number is how bad your head feels today.',
  turns: 8,
  init: () => ({ cause: 6, rebound: 0, woke: 6, felt: 6, next: 6, day: 0 }),
  actions: Object.entries(HEAD).map(([id, x]) => ({ id, label: x.label })),
  step: (st, a) => {
    const x = HEAD[a] || HEAD.water;
    const woke = st.next;
    const felt = Math.max(0, woke - x.relief);
    const cause = clamp(st.cause + x.cause, 0, 10);
    const rebound = clamp(st.rebound + x.rebound, 0, 6);
    return { cause, rebound, woke, felt, next: clamp(Math.round(cause + rebound), 0, 10), day: st.day + 1 };
  },
  view: st => ({
    value: st.felt, unit: ' / 10', label: st.day ? 'How your head feels today' : 'How your head feels',
    tone: st.felt <= 2 ? 'good' : st.felt <= 5 ? 'warn' : 'bad',
    sub: st.day ? `You woke up at <b>${st.woke}</b> out of 10` : 'You woke up with a headache. Again.'
  }),
  score: h => {
    const end = h[h.length - 1].after;
    return {
      stats: [{ label: 'Days you felt fine', value: count(h, x => x.after.felt <= 2), unit: ' of 8' },
              { label: 'Headache when you wake tomorrow', value: end.next, unit: ' / 10' }],
      band: end.next <= 2 ? 'good' : end.next <= 6 ? 'mid' : 'bad'
    };
  },
  debrief: {
    bad: [
      'Each day felt fine after the pill, but every morning got worse. The pills hid the pain while the real cause (sleep) and rebound headaches built up.',
      'The lesson: a quick fix for the symptom can stop you fixing the real cause, which then gets worse. That\'s <i>shifting the burden</i>. Use the quick fix if you must, but do the slow fix too.'
    ],
    mid: [
      'A mix of pills and good nights. Your mornings got a bit better, but each pill added a rebound headache.',
      'The lesson: a quick fix for the symptom can stop you fixing the real cause, which then gets worse. That\'s <i>shifting the burden</i>. Use the quick fix if you must, but do the slow fix too.'
    ],
    good: [
      'A few rough days, then you were waking up clear. You fixed the cause, not just the pain.',
      'The lesson: a quick fix for the symptom can stop you fixing the real cause, which then gets worse. That\'s <i>shifting the burden</i>. Use the quick fix if you must, but do the slow fix too.'
    ]
  },
  recognise: {
    q: 'Which one is NOT shifting the burden?',
    choices: [
      'A team always calls the same senior developer to fix problems, so nobody else learns how.',
      'A bath overflows because the tap has been running faster than the drain for an hour.',
      'You drink coffee to get through every afternoon instead of fixing your sleep.',
      'A parent does their kid\'s homework every night, so the kid never learns to do it.'
    ],
    odd: 1,
    right: 'Right. The bath is just more coming in than going out - level 2, <b class="nolink">Stocks and flows</b>.',
    wrong: [
      'That one IS shifting the burden: the quick fix (the expert) stops the team learning.',
      '',
      'That one IS shifting the burden: coffee hides the tiredness, so the sleep never gets fixed.',
      'That one IS shifting the burden: the homework gets done, but the kid never learns.'
    ]
  }
};

/* ------------------------------------------------------------
   9. TRAGEDY OF THE COMMONS - the shared fridge
   Housemates copy what you took yesterday. The kitty only restocks a
   fridge people believe in: under 20 portions it halves, under 10 it stops.
   ------------------------------------------------------------ */
const restockFor = f => f >= 20 ? 8 : f >= 10 ? 4 : 0;
const fridge = {
  t: 'sim', title: 'One fridge, four people',
  brief: 'Eight days. Choose how much you take. Your housemates copy what they saw you do.',
  turns: 8,
  init: () => ({ food: 40, copy: 2, you: 0, them: 0, ate: 0, day: 0, restock: 8 }),
  actions: [
    { id: '1', label: 'Take one portion' }, { id: '2', label: 'Take two portions' }, { id: '3', label: 'Take three portions' }
  ],
  step: (st, a) => {
    const want = clamp(+a || 2, 1, 3);
    let food = st.food;
    const you = Math.min(want, food); food -= you;
    const them = Math.min(st.copy * 3, food); food -= them;
    const restock = restockFor(food);
    return { food: Math.min(40, food + restock), copy: want, you, them, ate: st.ate + you, day: st.day + 1, restock };
  },
  view: st => ({
    value: st.food, label: 'Portions in the fridge',
    tone: st.food >= 30 ? 'good' : st.food >= 15 ? 'warn' : 'bad',
    gauge: { min: 0, max: 40, lo: 30, hi: 40, minLabel: 'empty', maxLabel: 'full' },
    sub: st.day ? `You took <b>${st.you}</b> · the other three took <b>${st.them}</b> between them` : 'The fridge is full. The kitty does a shop every night.',
    msg: !st.day ? '' : st.restock === 0 ? 'Nobody is paying into the kitty any more. No shop tonight.'
      : st.restock < 8 ? 'Someone skipped the kitty this week - "what\'s the point, it is always empty".' : ''
  }),
  score: h => {
    const end = h[h.length - 1].after;
    return {
      stats: [{ label: 'Portions you ate', value: end.ate }, { label: 'Left in the fridge', value: end.food }],
      band: band(end.food, 30, 15)
    };
  },
  debrief: {
    bad: [
      'The fridge ran out. You took extra, your housemates copied you, and once the fridge got low nobody wanted to pay into the kitty.',
      'The lesson: when everyone takes a bit more from something shared, it runs out. That\'s the tragedy of the <i>commons</i>. Taking a fair share - and being seen to - keeps it going.'
    ],
    mid: [
      'The fridge survived but got low. On the days you took extra, everyone else took more too.',
      'The lesson: when everyone takes a bit more from something shared, it runs out. That\'s the tragedy of the <i>commons</i>. Taking a fair share - and being seen to - keeps it going.'
    ],
    good: [
      'You took a fair share, your housemates did the same, and the fridge stayed full.',
      'The lesson: when everyone takes a bit more from something shared, it runs out. That\'s the tragedy of the <i>commons</i>. Taking a fair share - and being seen to - keeps it going.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a tragedy of the commons?',
    choices: [
      'Everyone in a group chat posts more than they read, and people start muting it.',
      'Every family in a village grazes one extra cow on the shared field, and the grass dies.',
      'A thermostat keeps an office at 21 degrees whatever the weather.',
      'Everyone in a quiet library whispers \'just a bit\', and it ends up as loud as a café.'
    ],
    odd: 2,
    right: 'Right. The thermostat holds a target - that\'s level 4, <b class="nolink">Balancing loops</b>, not overusing something shared.',
    wrong: [
      'That one IS the commons: everyone\'s attention is shared, and each extra post uses some up.',
      'That one IS the commons: one extra cow helps one family and damages the field for everyone.',
      '',
      'That one IS the commons: the quiet is shared, and each whisper uses a little of it.'
    ]
  }
};

/* ------------------------------------------------------------
   10. LEVERAGE POINTS - the coffee shop with six dials
   Five dials add a few walk-ins once. One changes how the regulars
   grow - and it is worth more the earlier you pull it.
   ------------------------------------------------------------ */
const DIALS = [
  { id: 'price', label: 'Cut prices 10%', walk: 12, msg: 'A few more walk-ins. Smaller margins, though.' },
  { id: 'paint', label: 'Repaint and new cups', walk: 4, msg: 'It looks lovely. Hardly anyone noticed.' },
  { id: 'hours', label: 'Open an hour earlier', walk: 10, msg: 'Some early commuters. You are more tired.' },
  { id: 'insta', label: 'Post on Instagram daily', walk: 8, msg: 'A handful of new faces, once.' },
  { id: 'milk', label: 'Add oat milk and cake', walk: 6, msg: 'The cake sells. The coffee count barely moves.' },
  { id: 'names', label: 'Learn every regular\'s name and order', walk: 0, growth: 0.25, msg: 'Nothing much this week. The regulars noticed, though.' }
];
const coffeeOf = st => st.walk + st.regulars * 5;
const coffee = {
  t: 'sim', title: 'Three pushes',
  brief: 'Eight weeks, three pushes. Each week pick one of the ideas on offer, or let the week run.',
  turns: 8,
  init: () => ({ walk: 150, regulars: 30, growth: 0, pushes: 3, week: 0, used: [], msg: '' }),
  actions: st => {
    const rest = DIALS.filter(d => !st.used.includes(d.id));
    const run = { id: 'run', label: 'Let the week run' };
    if (!st.pushes || !rest.length) return [run];
    const start = (st.week * 2) % rest.length;
    const offer = [0, 1, 2].map(k => rest[(start + k) % rest.length]).filter((d, k, a) => a.indexOf(d) === k);
    return offer.map(d => ({ id: d.id, label: d.label })).concat(run);
  },
  step: (st, a) => {
    const d = DIALS.find(x => x.id === a);
    const pushed = d && st.pushes > 0 && !st.used.includes(d.id);
    const walk = st.walk + (pushed ? d.walk : 0);
    const growth = pushed && d.growth ? d.growth : st.growth;
    return {
      walk, growth, regulars: st.regulars * (1 + growth),
      pushes: st.pushes - (pushed ? 1 : 0), week: st.week + 1,
      used: pushed ? st.used.concat(d.id) : st.used,
      msg: pushed ? d.msg : growth ? 'The regulars are bringing friends. Some of the friends are becoming regulars.' : 'A quiet week.'
    };
  },
  view: st => {
    const n = coffeeOf(st);
    return {
      value: n, label: 'Coffees sold this week',
      tone: n >= 600 ? 'good' : n >= 380 ? 'warn' : 'bad',
      sub: `Pushes left: <b>${st.pushes}</b> · regulars: <b>${Math.round(st.regulars)}</b> · walk-ins: <b>${st.walk}</b>`,
      msg: st.msg
    };
  },
  score: h => {
    const last = coffeeOf(h[h.length - 1].after);
    return {
      stats: [{ label: 'Coffees a week at the start', value: coffeeOf(h[0].before) }, { label: 'Coffees a week now', value: last }],
      band: last >= 600 ? 'good' : last >= 380 ? 'mid' : 'bad'
    };
  },
  debrief: {
    bad: [
      'Sales barely moved. The ideas you picked each added a few customers once, but nothing kept growing.',
      'The lesson: look for the change that affects how something grows, not just how big it is today. That\'s a <i>leverage point</i>. Here it was learning regulars\' names - they come back and bring friends, who become regulars too.'
    ],
    mid: [
      'Sales went up. You found the names idea, but used it late, so it had less time to grow.',
      'The lesson: look for the change that affects how something grows, not just how big it is today. That\'s a <i>leverage point</i>. Here it was learning regulars\' names - they come back and bring friends, who become regulars too.'
    ],
    good: [
      'You used the names idea early, and your regulars kept multiplying.',
      'The lesson: look for the change that affects how something grows, not just how big it is today. That\'s a <i>leverage point</i>. Here it was learning regulars\' names - they come back and bring friends, who become regulars too.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a small change with a big effect?',
    choices: [
      'Bar staff are paid per drink sold, so they push drinks and the bar loses its regulars.',
      'A school moves its start time from 8am to 9am, and grades, attendance and moods all improve.',
      'A gym puts the stairs by the entrance and the lift round the corner, and far more people use the stairs.',
      'A company shows each team its own electricity use, and the bill drops by a fifth.'
    ],
    odd: 0,
    right: 'Right. The bar is people chasing a narrow reward - level 6, <b class="nolink">Bounded rationality</b>. Changing how the staff are paid would be the leverage point.',
    wrong: [
      '',
      'That one IS leverage: one small change gave everyone more sleep, which improved everything else.',
      'That one IS leverage: moving the stairs costs nothing and changes thousands of choices a day.',
      'That one IS leverage: just letting people see their usage changed their behaviour.'
    ]
  }
};

/* ------------------------------------------------------------
   11. MENTAL MODELS - the map is not the territory
   You see the real ground on the squares around you; everywhere else
   shows the map. The map's bridge has fallen. A new footbridge next to
   it is not on the map. The map's "closed" bridge is open.
   ------------------------------------------------------------ */
const MAP_W = 4, MAP_H = 5, CAFE = [0, 0], START = [0, 4];
// '.' street  'w' water  'B' bridge  'X' closed
const MAP = ['....', '....', 'BwwX', '....', '....'];
const REAL = ['....', '....', 'XBwB', '....', '....'];
const cellOf = (rows, x, y) => rows[y][x];
const near = (st, x, y) => Math.abs(st.x - x) <= 1 && Math.abs(st.y - y) <= 1;
const seenKey = (x, y) => x + ',' + y;
const lookAround = (seen, x, y) => {
  const out = new Set(seen);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < MAP_W && ny < MAP_H) out.add(seenKey(nx, ny));
  }
  return [...out].sort();
};
const walkable = c => c === '.' || c === 'B';
const MOVES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
const ICON = { '.': '·', w: '🟦', B: '🌉', X: '🚧' };
const mapwalk = {
  t: 'sim', title: 'Across the river',
  brief: 'Get to the café ☕ in ten moves or fewer. You can see the squares right next to you; the rest is what the map says.',
  turns: 10,
  init: () => ({ x: START[0], y: START[1], moves: 0, bumps: 0, seen: lookAround([], START[0], START[1]), msg: '' }),
  actions: [
    { id: 'n', label: '↑ North' }, { id: 's', label: '↓ South' }, { id: 'w', label: '← West' }, { id: 'e', label: '→ East' }
  ],
  over: st => st.x === CAFE[0] && st.y === CAFE[1],
  step: (st, a) => {
    const [dx, dy] = MOVES[a] || [0, 0];
    const nx = st.x + dx, ny = st.y + dy;
    const off = nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H;
    if (off || !walkable(cellOf(REAL, nx, ny))) {
      const c = off ? '' : cellOf(REAL, nx, ny);
      return { ...st, moves: st.moves + 1, bumps: st.bumps + 1,
        msg: off ? 'That is the edge of town.' : c === 'X' ? 'The old bridge is gone. There is tape across it and a sign: "use the footbridge".' : 'That is the river.' };
    }
    const seen = lookAround(st.seen, nx, ny);
    const arrived = nx === CAFE[0] && ny === CAFE[1];
    const spotted = seen.includes(seenKey(1, 2)) && !st.seen.includes(seenKey(1, 2));
    return { x: nx, y: ny, moves: st.moves + 1, bumps: st.bumps, seen,
      msg: arrived ? 'Coffee.' : spotted ? 'There is a footbridge here that is not on the map.' : '' };
  },
  view: st => {
    const board = [];
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) {
        const seen = st.seen.includes(seenKey(x, y));
        const c = seen ? cellOf(REAL, x, y) : cellOf(MAP, x, y);
        let icon = ICON[c];
        if (x === CAFE[0] && y === CAFE[1]) icon = '☕';
        if (x === st.x && y === st.y) icon = '🙂';
        row.push(seen ? icon : `<i class="fog">${icon}</i>`);
      }
      board.push(row);
    }
    const d = Math.abs(st.x - CAFE[0]) + Math.abs(st.y - CAFE[1]);
    return {
      value: d, label: d ? 'Blocks from the café, as the crow flies' : 'You made it',
      tone: d === 0 ? 'good' : st.moves >= 10 ? 'bad' : d <= 2 ? 'warn' : 'cool',
      board,
      sub: `Moves used: <b>${st.moves}</b> of 10 · faded squares are the map, bright ones are what you can see`,
      msg: st.msg
    };
  },
  score: h => {
    const end = h[h.length - 1].after;
    const arrived = end.x === CAFE[0] && end.y === CAFE[1];
    return {
      stats: [{ label: arrived ? 'Moves to the café' : 'Moves (did not arrive)', value: end.moves },
              { label: 'Times you walked into something', value: end.bumps }],
      band: !arrived ? 'bad' : end.moves <= 6 ? 'good' : 'mid'
    };
  },
  debrief: {
    bad: [
      'You didn\'t reach the café. The map said one thing, the street showed another, and you went with the map.',
      'The lesson: the picture in your head - your <i>mental model</i> - can be out of date. When what you see disagrees with it, believe what you see and update the picture.'
    ],
    mid: [
      'You got there the long way round - after walking into the broken bridge, or taking a while to trust the new footbridge.',
      'The lesson: the picture in your head - your <i>mental model</i> - can be out of date. When what you see disagrees with it, believe what you see and update the picture.'
    ],
    good: [
      'You saw the old bridge was closed and took the new footbridge straight away.',
      'The lesson: the picture in your head - your <i>mental model</i> - can be out of date. When what you see disagrees with it, believe what you see and update the picture.'
    ]
  },
  recognise: {
    q: 'Which one is NOT an out-of-date mental model?',
    choices: [
      'You avoid a friend because you think they\'re still upset - they got over it weeks ago.',
      'A company keeps advertising to young professionals, but its customers are now mostly retired.',
      'You keep taking a route to work that used to be quick, before new roadworks started.',
      'A shower goes scalding two turns after you turned it up, because the hot water was still in the pipe.'
    ],
    odd: 3,
    right: 'Right. The shower is a result arriving late - level 3, <b class="nolink">Delays</b>.',
    wrong: [
      'That one IS an old mental model: your picture of the friendship didn\'t update.',
      'That one IS an old mental model: the company never checked who its customers are now.',
      'That one IS an old mental model: the road changed and your habit didn\'t.',
      ''
    ]
  }
};

/* ------------------------------------------------------------
   12. APPLIED - your app is a system
   Bugs are a stock. A feature's bugs arrive two days after you ship it
   (the shower). An agent fixing its own work with no tests makes new bugs
   as it goes, and more bugs mean more loops (the rumour). Tests turn
   that loop into a balancing one.
   ------------------------------------------------------------ */
const APP = {
  auto: { label: 'Ship a feature on autopilot' },
  tested: { label: 'Write tests, then ship' },
  hand: { label: 'Fix bugs by hand' },
  loop: { label: 'Let the agent loop on the bugs' }
};
const vibe = {
  t: 'sim', title: 'A week with an agent',
  brief: 'Eight days. Ship at least four features and finish with three bugs or fewer.',
  turns: 8,
  init: () => ({ bugs: 2, pipe: [0, 0], features: 0, tokens: 0, tests: 0, day: 0, msg: '' }),
  actions: Object.entries(APP).map(([id, x]) => ({ id, label: x.label })),
  step: (st, a) => {
    let { bugs, features, tokens, tests } = st;
    let later = 0, tomorrow = 0, msg = '';
    const bloat = Math.max(0, bugs - 4) * 5;                  // a long bug list stuffs every prompt
    if (a === 'auto') { features++; tokens += 30 + bloat; later = Math.max(1, 4 - tests); msg = 'Shipped in minutes. Nobody has used it yet.'; }
    else if (a === 'tested') { features++; tokens += 50 + bloat; tests++; later = tests >= 2 ? 0 : 1; msg = 'Slower. The tests caught two things before users did.'; }
    else if (a === 'hand') { const f = Math.min(3, bugs); bugs -= f; tokens += 10; msg = `You fixed ${f} yourself.`; }
    else if (a === 'loop') {
      const f = Math.min(5, bugs); bugs -= f; tokens += 60 + bloat;
      tomorrow = tests >= 2 ? 0 : Math.ceil(f * 0.8);
      msg = tests >= 2 ? `The agent fixed ${f}. The tests kept its fixes honest.` : `The agent fixed ${f}. It also changed things nobody asked it to.`;
    }
    const arriving = st.pipe[0];
    bugs += arriving;
    if (arriving) msg += ` ${arriving} new bug report${arriving === 1 ? '' : 's'} came in.`;
    return { bugs, pipe: [st.pipe[1] + tomorrow, later], features, tokens, tests, day: st.day + 1, msg: msg.trim() };
  },
  view: st => ({
    value: st.bugs, label: 'Bugs open',
    tone: st.bugs <= 3 ? 'good' : st.bugs <= 7 ? 'warn' : 'bad',
    sub: `Features shipped: <b>${st.features}</b> · tokens spent: <b>${st.tokens}k</b>`,
    msg: st.msg
  }),
  score: h => {
    const end = h[h.length - 1].after;
    const waiting = end.bugs + end.pipe[0] + end.pipe[1];      // the reports already on their way count
    return {
      stats: [{ label: 'Features shipped', value: end.features }, { label: 'Bugs waiting on Monday', value: waiting }],
      band: end.features >= 4 && waiting <= 3 ? 'good' : waiting >= 8 || end.features <= 1 ? 'bad' : 'mid'
    };
  },
  debrief: {
    bad: [
      'Lots shipped, but bugs piled up. Autopilot bugs showed up two days later, and the agent loop without tests created new bugs while fixing old ones.',
      'The lesson: your app follows the same rules as everything else. Bugs are a stock, bug reports arrive after a delay, and an AI agent fixing its own code without tests is a reinforcing loop. Tests turn it into a balancing loop.'
    ],
    mid: [
      'A fine week: features shipped and the bug count stayed about level, but it didn\'t shrink. Writing tests first would have helped.',
      'The lesson: your app follows the same rules as everything else. Bugs are a stock, bug reports arrive after a delay, and an AI agent fixing its own code without tests is a reinforcing loop. Tests turn it into a balancing loop.'
    ],
    good: [
      'Four or more features and only a few bugs. Tests kept the bug pile under control.',
      'The lesson: your app follows the same rules as everything else. Bugs are a stock, bug reports arrive after a delay, and an AI agent fixing its own code without tests is a reinforcing loop. Tests turn it into a balancing loop.'
    ]
  },
  recognise: {
    q: 'Which one is NOT a loop feeding itself?',
    choices: [
      'An agent \'fixes\' a failing test by editing the test, which breaks two others, which it \'fixes\' the same way.',
      'Bug reports for a new feature only start arriving two days after you ship it.',
      'Each quick patch makes the code messier, so the next patch is even quicker and messier.',
      'The longer the bug list in the agent\'s context, the worse each fix gets, so the list keeps growing.'
    ],
    odd: 1,
    right: 'Right. Bug reports arriving late is a delay - level 3, <b class="nolink">Delays</b>.',
    wrong: [
      'That one IS a loop feeding itself: each fix creates the next problem.',
      '',
      'That one IS a loop feeding itself: mess causes quick patches, which cause more mess.',
      'That one IS a loop feeding itself: more bugs make worse fixes, which make more bugs.'
    ]
  }
};

/* ------------------------------------------------------------
   LESSONS + TRACK
   ------------------------------------------------------------ */
export const systems = {
  id: 'systems',
  name: 'Systems Thinking',
  emoji: '🌀',
  glow: '#ffc44d',
  time: '~60 min',
  lead: 'Start here. GitGames teaches you how to think before it teaches you the tools.',
  terms: 'own',
  desc: 'Twelve simple ideas about how things work - why showers overshoot, rumours explode and shared fridges run empty. Each one explained plainly, then tried out in a quick game.',
  chapters: [
    {
      title: 'Chapter 1 - How things add up',
      desc: 'Groups, piles, and results that arrive late.',
      nodes: [
        {
          id: 'st-01', name: 'Parts vs the whole', ico: '⚽',
          steps: [
            L('What it means', [
              { p: 'A team, a band or a group project is more than a list of its members. How well the parts work together matters more than how good each part is on its own.' },
              { ul: [
                'A team of star players who all want the ball can lose to a team of average players who work together.',
                'A group project with four brilliant people can fail if nobody does the job of pulling it together.',
                'The best ingredients don\'t make a good meal if they don\'t go together.'
              ] },
              { call: { k: 'tip', t: 'The word:', p: 'This is called emergence - the whole behaves differently from the parts.' } }
            ]),
            L('What to look for', [
              { p: 'When something isn\'t working, don\'t only ask "which part is weak?" Ask how the parts fit together.' },
              { ul: [
                'Is every job covered?',
                'Are too many people trying to do the same job?',
                'Is there a gap between the parts that nobody owns?'
              ] }
            ]),
            L('The game', [
              { p: 'Pick a team of six, one position at a time. Each player has a rating out of 100.' },
              { p: 'The big number adds up the ratings - but that\'s not what wins games. What wins is players who fit their position, and not too many who all want the ball.' },
              { call: { k: 'tip', t: 'Goal:', p: 'Win at least 8 of 10 games.' } }
            ], 'Pick the team →'),
            football
          ]
        },
        {
          id: 'st-02', name: 'Stocks and flows', ico: '🛁',
          steps: [
            L('What it means', [
              { p: 'A stock is an amount of something that builds up over time. A flow is what adds to it or takes away from it.' },
              { ul: [
                'Water in a bath (stock) - the tap and the drain (flows).',
                'Money in your account (stock) - your pay and your spending (flows).',
                'Emails in your inbox (stock) - new emails and the ones you answer (flows).'
              ] }
            ]),
            L('The rule', [
              { p: 'A stock only changes by flow in minus flow out. If more comes in than goes out, it keeps rising every turn - even if it looks fine right now.' },
              { ul: [
                'Tap pours 10, drain takes 4: the bath gains 6 every turn.',
                'Earn $2,000, spend $2,100: your savings drop $100 every month.'
              ] },
              { call: { k: 'tip', t: 'So:', p: 'To keep a stock steady, make in and out equal.' } }
            ]),
            L('The game', [
              { p: 'Keep the bath between 40 and 70 litres for 8 turns. Each turn you can change the tap or the drain, or leave it.' },
              { p: 'Watch the in and out numbers under the water level. Things will change during the game - the drain gets clogged, the water pressure drops.' }
            ], 'Run the bath →'),
            bathtub
          ]
        },
        {
          id: 'st-03', name: 'Delays', ico: '🚿',
          steps: [
            L('What it means', [
              { p: 'A delay is a gap between doing something and seeing the result.' },
              { p: 'A shower is the classic example. When you turn the handle, the water you feel was already in the pipe, so the change reaches you a little later.' },
              { ul: [
                'You eat, but only feel full 20 minutes later.',
                'You start working out, but see results weeks later.',
                'You turn up the radiator, but the room warms up an hour later.'
              ] }
            ]),
            L('Why delays cause trouble', [
              { p: 'When the result is late, it\'s easy to think your first change didn\'t work, so you do more. Then everything arrives at once and you overshoot.' },
              { call: { k: 'tip', t: 'So:', p: 'Make one change, then wait long enough to see its effect before changing again.' } }
            ]),
            L('The game', [
              { p: 'Keep the shower between 36 and 40 degrees for 10 turns. Each turn, turn the handle a lot, a bit, or leave it.' },
              { p: 'Changes take two turns to reach you. The dial under the temperature shows where the handle is set - that\'s where the water is heading.' }
            ], 'Get in →'),
            shower
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 - Loops',
      desc: 'Things that settle down, and things that snowball.',
      nodes: [
        {
          id: 'st-04', name: 'Balancing loops', ico: '🌡️',
          steps: [
            L('What it means', [
              { p: 'A balancing loop is anything that pushes back toward a target.' },
              { ul: [
                'A thermostat: too cold, the heat comes on; warm enough, it goes off.',
                'Your body: too hot, you sweat; too cold, you shiver.',
                'Hunger: you get hungry when you\'re low on food, and stop when you\'ve eaten.'
              ] }
            ]),
            L('How it behaves', [
              { p: 'A balancing loop pushes hard when you\'re far from the target and gently when you\'re close, so things settle down.' },
              { p: 'The catch: if there\'s a delay - like a radiator that takes time to heat up and cool down - switching hard on and off makes you overshoot.' },
              { call: { k: 'tip', t: 'So:', p: 'Pick the right setting and let it settle.' } }
            ]),
            L('The game', [
              { p: 'Keep the room between 20 and 22 degrees for 10 turns. Each turn, set the heater to high, low or off.' },
              { p: 'The room loses heat faster the warmer it gets. Low settles at about 21 on its own, but slowly. High is fast, but the radiator stays hot after you switch it off.' }
            ], 'Turn the heating on →'),
            thermostat
          ]
        },
        {
          id: 'st-05', name: 'Reinforcing loops', ico: '📣',
          steps: [
            L('What it means', [
              { p: 'A reinforcing loop is when more of something leads to even more of it.' },
              { ul: [
                'A rumour: everyone who hears it tells more people.',
                'Savings: interest earns more interest.',
                'Debt: interest makes the debt bigger, which makes more interest.',
                'A viral post: more views bring more shares, which bring more views.'
              ] }
            ]),
            L('How it behaves', [
              { p: 'It starts slow, then explodes. If something triples every day, it goes 1, 3, 9, 27, 81, 243. It looks tiny for days, then it\'s suddenly huge.' },
              { call: { k: 'tip', t: 'So:', p: 'Act early, while the numbers still look small.' } }
            ]),
            L('The game', [
              { p: 'Your band has a gig. The room holds 150 people and you need at least 100.' },
              { p: 'Each day for 8 days, choose how many friends everyone who\'s heard should tell: none, one or two. Get between 100 and 150 by the end.' }
            ], 'Start talking →'),
            rumour
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 - Good people, bad results',
      desc: 'When sensible choices add up to a bad outcome.',
      nodes: [
        {
          id: 'st-06', name: 'Bounded rationality', ico: '🍸',
          steps: [
            L('What it means', [
              { p: 'Bounded rationality means people make sensible choices based on what they can see and what they\'re rewarded for - but they can\'t see the whole picture. So good people can make things worse without meaning to.' },
              { ul: [
                'Staff paid per sale push deals customers don\'t need, and customers stop coming back.',
                'A call centre judged on short calls rushes callers, who then call back.',
                'A school judged on test scores only teaches the test.'
              ] }
            ]),
            L('What to do about it', [
              { p: 'When people keep making a bad choice, look at what they\'re rewarded on and what they can see.' },
              { call: { k: 'tip', t: 'So:', p: 'Change the reward, or show people the bigger picture, and their choices change.' } }
            ]),
            L('The game', [
              { p: 'You\'re a bartender paid a bonus for every drink you sell. For 8 nights, choose how to run the bar.' },
              { p: 'The big number is drinks sold - your bonus. Also keep an eye on the regulars. They\'re what keeps the bar in business.' }
            ], 'Open up →'),
            bartender
          ]
        },
        {
          id: 'st-07', name: 'Fixes that fail', ico: '🏷️',
          steps: [
            L('What it means', [
              { p: 'Fixes that fail are quick solutions that help now but make the problem worse later - so you need them again and again.' },
              { ul: [
                'Discounts bring customers now, but teach them to wait for discounts.',
                'Borrowing to pay a bill fixes today and makes a bigger bill later.',
                'Widening a road eases traffic, until more people start driving on it.'
              ] }
            ]),
            L('How to spot it', [
              { p: 'Before a quick fix, ask: what will this cause in a few weeks?' },
              { call: { k: 'tip', t: 'So:', p: 'If the fix has a side effect that brings the problem back, look for a slower fix that deals with the cause.' } }
            ]),
            L('The game', [
              { p: 'You run a café. Tuesdays are quiet. A normal week makes $1,600.' },
              { p: 'For 8 weeks, choose: run a 40%-off Tuesday, skip it, or spend money on a better lunch menu (it costs you this week and pays off from next week). The big number is what you take each week.' }
            ], 'Open the café →'),
            promo
          ]
        },
        {
          id: 'st-08', name: 'Shifting the burden', ico: '💊',
          steps: [
            L('What it means', [
              { p: 'Shifting the burden is when a quick fix treats the symptom, so you stop fixing the real cause - and the real cause gets worse.' },
              { ul: [
                'Painkillers for headaches that come from bad sleep.',
                'Coffee to get through the day instead of fixing your sleep.',
                'Always getting the same expert to fix a problem, so nobody else learns how.'
              ] }
            ]),
            L('Why it\'s a trap', [
              { p: 'The quick fix works, so it feels like the problem is handled. Meanwhile the cause grows, and you rely on the quick fix more and more.' },
              { call: { k: 'tip', t: 'So:', p: 'Use the quick fix if you need it, but fix the cause too.' } }
            ]),
            L('The game', [
              { p: 'Eight mornings with a headache. Each day pick one: a painkiller, an early night, a glass of water, or screens off at ten.' },
              { p: 'The big number is how bad your head feels today, out of 10. Painkillers work fast but can cause rebound headaches. Sleep, water and screens-off work slowly.' }
            ], 'Wake up →'),
            headache
          ]
        },
        {
          id: 'st-09', name: 'Tragedy of the commons', ico: '🧊',
          steps: [
            L('What it means', [
              { p: 'A commons is something shared that nobody owns - a shared fridge, a park, fish in the sea, a group chat.' },
              { p: 'The tragedy of the commons: taking a bit extra makes sense for each person, but when everyone does it, the shared thing runs out.' }
            ]),
            L('What helps', [
              { p: 'Shared things last when people agree on a fair share and can see what others are doing.' },
              { call: { k: 'tip', t: 'Remember:', p: 'People copy what they see, so your behaviour sets the norm.' } }
            ]),
            L('The game', [
              { p: 'Four housemates share one fridge. For 8 days, take one, two or three portions a day. Your housemates copy what you took the day before.' },
              { p: 'Two each is what the nightly shop can keep up with. If the fridge gets low, people stop paying into the shopping kitty.' }
            ], 'Open the fridge →'),
            fridge
          ]
        }
      ]
    },
    {
      title: 'Chapter 4 - Changing a system',
      desc: 'Where to push, what to trust, and your own app.',
      nodes: [
        {
          id: 'st-10', name: 'Leverage points', ico: '☕',
          steps: [
            L('What it means', [
              { p: 'A leverage point is a place where a small change makes a big difference.' },
              { p: 'Most changes only nudge things once. The powerful ones change how something grows.' },
              { ul: [
                'Saving 10% of every paycheck, instead of one big deposit once.',
                'A café remembering customers\' names, so they come back and bring friends, instead of a one-off discount.'
              ] }
            ]),
            L('Timing matters', [
              { p: 'A change that affects growth gets stronger over time.' },
              { call: { k: 'tip', t: 'So:', p: 'The earlier you make it, the bigger the effect.' } }
            ]),
            L('The game', [
              { p: 'A coffee shop sells 300 coffees a week. There are six ideas, and you can use three of them over 8 weeks.' },
              { p: 'Most ideas add a few customers once. One changes how the shop grows. Find it and use it early.' }
            ], 'Unlock the door →'),
            coffee
          ]
        },
        {
          id: 'st-11', name: 'Mental models', ico: '🗺️',
          steps: [
            L('What it means', [
              { p: 'A mental model is the picture in your head of how something works - like a map. It helps you, but it can be wrong or out of date.' },
              { ul: [
                'You think a friend is still upset, but they\'ve moved on.',
                'A company markets to the customers it had ten years ago.',
                'You take a route that used to be fast, before the roadworks.'
              ] }
            ]),
            L('How to stay up to date', [
              { p: 'When something surprises you, that\'s a sign your picture is wrong somewhere.' },
              { call: { k: 'tip', t: 'So:', p: 'When what you see disagrees with what you expected, believe what you see and update the picture.' } }
            ]),
            L('The game', [
              { p: 'Walk to the café in 10 moves or fewer.' },
              { p: 'Faded squares show what the map says. The bright squares around you show what\'s really there. The map is out of date.' }
            ], 'Head out →'),
            mapwalk
          ]
        },
        {
          id: 'st-12', name: 'Your app is a system', ico: '🤖',
          steps: [
            L('Same ideas, in your app', [
              { p: 'Everything in this track shows up when you build software with AI.' },
              { ul: [
                'Bugs are a stock: they pile up when they arrive faster than you fix them.',
                'Bug reports come after a delay: users find a feature\'s bugs a few days after you ship it.',
                'An AI agent fixing its own code with no tests is a reinforcing loop: its fixes can create new bugs, which it then tries to fix.',
                'Tokens are a flow: every prompt costs some, and a long bug list makes each prompt bigger.'
              ] }
            ]),
            L('What helps', [
              { p: 'Tests turn the agent loop into a balancing loop. They catch bad fixes before they pile up.' },
              { call: { k: 'tip', t: 'The trade:', p: 'Tests are slower today and faster for the rest of the week.' } }
            ]),
            L('The game', [
              { p: 'Eight days. Each day, choose one: ship a feature on autopilot, write tests then ship, fix bugs by hand, or let the agent loop on the bugs.' },
              { p: 'Goal: at least 4 features, and 3 bugs or fewer at the end - counting the reports still on their way.' }
            ], 'Open the laptop →'),
            vibe
          ]
        }
      ]
    }
  ]
};
