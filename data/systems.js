/* ============================================================
   TRACK: Systems Thinking
   How to think before the tools. Every level is the same three beats:
     1. a short lesson built on one everyday analogy - the scene, not the answer
     2. a small turn-based game, played before anything is explained
     3. a debrief (chosen by how you did) that names what you just felt,
        then a "same shape, different room" question
   The vocabulary word appears once, in the debrief, after you have felt it,
   so lessons deliberately avoid it.

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
      `Your team looked unbeatable on paper and played like strangers. You kept picking the biggest number, and the biggest number was usually a star out of position, a star who needs the ball, or both. By the end, several people wanted the ball and nobody was minding the goal.`,
      `Nearly everyone does this. The rating is the only number on the screen, it goes up every time you pick a star, and going up feels like winning. But the rating adds up the parts. The games measure how the parts fit.`,
      `The idea: what a group does comes from how its parts fit together, not from adding up how good each one is. When a whole behaves in a way none of its parts do on their own, that is called <i>emergence</i> - and it cuts both ways.`
    ],
    mid: [
      `A decent season. Some of your picks fitted their roles and some were stars you could not say no to. The stars pushed the rating up; the ones out of position, or fighting over the ball, quietly cost you games.`,
      `That is the usual pattern: you trust the fit for a few picks, then a 97 comes along and it feels silly to turn it down.`,
      `The idea: what a group does comes from how its parts fit together, not from adding up how good each one is. When a whole behaves in a way none of its parts do on their own, that is called <i>emergence</i> - and it cuts both ways.`
    ],
    good: [
      `You won most of your games with a team that looked ordinary on paper. You picked people who fitted the role, and you did not fill the side with players who all need the ball.`,
      `Passing on a 97 feels wrong, and most people cannot do it. You did, because a keeper who is a keeper beats a winger in gloves.`,
      `The idea: what a group does comes from how its parts fit together, not from adding up how good each one is. When a whole behaves in a way none of its parts do on their own, that is called <i>emergence</i> - and it cuts both ways.`
    ]
  },
  recognise: {
    q: 'Three of these are the eleven-stars problem. Which one is the odd one out?',
    choices: [
      'A supergroup of five famous musicians makes an album nobody remembers.',
      'A dinner party of your six funniest friends goes flat because they all want the spotlight.',
      'You keep turning a hotel shower hotter because it still feels cold, then it arrives scalding.',
      'A kitchen hires a top chef for every station, and plates still come out late because nobody runs the pass.'
    ],
    odd: 2,
    right: 'The shower is the odd one. Nothing there is about how parts fit - the hot water is simply arriving late while you keep turning the handle. That shape has its own level: <b class="nolink">Delays</b>, the slow shower.',
    wrong: [
      'That one is the pattern. Five great musicians, each used to being the one everyone follows. The album is what happens between them, and nobody was in charge of the between.',
      'That one is the pattern. Six people who can each carry a room, all in one room. How the evening goes belongs to the mix, not to any guest.',
      '',
      'That one is the pattern. Every station is brilliant, but the job that joins them up - calling the orders, checking the plates - was left empty. The weak spot is in the gaps between the parts.'
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
      `The bath got away from you. You were watching the water level - which is what a bath is for - and the level kept moving even right after you had "fixed" it.`,
      `That is because the level never moves by itself. Every turn it changes by exactly what came in minus what went out. If the tap pours 10 and the drain takes 4, the tub gains 6 this turn, and 6 the next, however fine it looks right now. Almost everyone reacts to the level instead of that gap, so they always react late.`,
      `The idea: to hold a pile of anything steady, match what goes in to what goes out, then leave it alone. The pile is a <i>stock</i> - a balance, a reservoir, anything that builds up over time. What fills or drains it is a <i>flow</i>.`
    ],
    mid: [
      `Mostly between the lines, with a scare or two. The moments it slipped were probably just after the drain clogged or the pressure dropped: the level looked fine, so it felt safe to leave it, but the gap had changed underneath you.`,
      `That is the trap. The level tells you what already happened. The gap between in and out tells you what happens next.`,
      `The idea: to hold a pile of anything steady, match what goes in to what goes out, then leave it alone. The pile is a <i>stock</i> - a balance, a reservoir, anything that builds up over time. What fills or drains it is a <i>flow</i>.`
    ],
    good: [
      `Steady hands. You watched the two small numbers under the tub - in and out - and not just the level. When the drain clogged, you closed the gap before the tub told you to.`,
      `Most people chase the level. You managed the gap, which is harder, because when you get it right nothing seems to happen.`,
      `The idea: to hold a pile of anything steady, match what goes in to what goes out, then leave it alone. The pile is a <i>stock</i> - a balance, a reservoir, anything that builds up over time. What fills or drains it is a <i>flow</i>.`
    ]
  },
  recognise: {
    q: 'Three of these are a bathtub. Which one is the odd one out?',
    choices: [
      'Your friend group is more fun together than any one of your friends is on their own.',
      'Your savings keep shrinking even after a pay rise, because your spending crept up by more.',
      'Your inbox grows every week even though you answer loads of emails, because more arrive than you clear.',
      'A lake stays the same size all summer while rivers pour into it, because just as much evaporates.'
    ],
    odd: 0,
    right: 'The friend group is the odd one. Nothing is filling up or draining away there - it is the whole being different from its parts, which was level 1, <b class="nolink">Parts vs the whole</b>.',
    wrong: [
      '',
      'That one is a bathtub. The balance only grows while money in beats money out. A raise helps only if it widens that gap - here spending grew faster, so the tub still drains.',
      'That is a bathtub too. The inbox is the water, new emails are the tap and your replies are the drain. Working hard on the drain does nothing if the tap runs faster.',
      'That one is a bathtub in its calmest form: water pouring in and out at the same rate, so the level never moves. Steady does not mean nothing is happening.'
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
      `You chased the water. It was cold, so you turned it up, and it was still cold, so you turned it up again - and then both turns arrived at once. On the way down you did the same thing in reverse. See-saw.`,
      `Nearly everyone does this, because the only thing your skin can feel is the water on it right now, and that water was set two turns ago. The dial was telling you the truth the whole time. It just was not the number you were feeling.`,
      `The idea: when a result arrives late, act on where things are heading, not on where they are - then wait. The gap between the push and the result is a <i>delay</i>, and it turns sensible people into a see-saw.`
    ],
    mid: [
      `You got there in the end, with a detour through too hot or too cold on the way. Somewhere in the middle you turned the handle again before the last turn had arrived - that is where the wobble came from.`,
      `That is normal. Doing nothing while the water is still wrong feels like giving up, even when the fix is already in the pipe.`,
      `The idea: when a result arrives late, act on where things are heading, not on where they are - then wait. The gap between the push and the result is a <i>delay</i>, and it turns sensible people into a see-saw.`
    ],
    good: [
      `Lovely shower. You turned the handle, then left it alone while the water caught up. The first two turns were always going to be cold - that water was already in the pipe before you arrived.`,
      `Most people cannot bring themselves to do nothing while the water is still wrong. You trusted the dial over your back, which is the whole trick.`,
      `The idea: when a result arrives late, act on where things are heading, not on where they are - then wait. The gap between the push and the result is a <i>delay</i>, and it turns sensible people into a see-saw.`
    ]
  },
  recognise: {
    q: 'Three of these are the slow shower. Which is the odd one out?',
    choices: [
      'You are still hungry, so you eat a second plate, and twenty minutes later you are uncomfortably full.',
      'A country raises interest rates, nothing seems to happen for months, so it raises them again - and the economy stalls hard.',
      'You keep turning up the radiator in a cold flat with an old boiler, and wake at 3am roasting.',
      'Every friend you tell about a new café tells two more, and by Friday there is a queue round the block.'
    ],
    odd: 3,
    right: 'The café is the odd one. Nothing there arrives late - each telling makes more telling, and it snowballs. That is a loop that feeds itself, and it has its own level: <b class="nolink">Reinforcing loops</b>.',
    wrong: [
      'That one is the shower. Your stomach tells your brain it is full about twenty minutes after the fact, so the second plate was ordered by an out-of-date signal.',
      'That one is the shower, just slower. Interest rates take months to reach prices, so the second raise lands on top of the first one that was still on its way.',
      'That one is the shower with a radiator. The old boiler takes an hour to warm the room, so every turn of the dial in the evening arrives at 3am.',
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
      `You flew past 21 like it was not there. High until it was warm, off until it was cold, high again. The radiator was still full of heat when you switched it off, so the room kept climbing - and it was still cold when you switched it back on.`,
      `That on-off-on rhythm is what nearly everyone does, because "too cold, full blast" is the obvious answer to cold. But the room was already trying to settle by itself: the warmer it gets, the faster it leaks heat. Leave the heater at one setting and heat in and heat out meet somewhere, and the room stops there.`,
      `The idea: some things pull themselves back to a resting point, and your job is to pick the point, not to fight the way there. A goal, a gap, and a push that shrinks as the gap shrinks is a <i>balancing loop</i>. Your hunger works like this, and so do shop prices.`
    ],
    mid: [
      `You got there, with a lap or two past 22 or below 20 on the way. The overshoots came from the radiator: it holds heat after you switch it off and takes a while to warm after you switch it on.`,
      `Most people use a heater like a light switch. It is more like a dimmer - and the room does half the work, because it leaks faster the hotter it gets.`,
      `The idea: some things pull themselves back to a resting point, and your job is to pick the point, not to fight the way there. A goal, a gap, and a push that shrinks as the gap shrinks is a <i>balancing loop</i>. Your hunger works like this, and so do shop prices.`
    ],
    good: [
      `Smooth. You used high to get going, then backed off while the room was still cold and the radiator was still hot, and let it settle on low. Backing off before you arrive is the hard bit.`,
      `Low was never going to overshoot, because the room loses more heat the warmer it gets. Heat in and heat out met at about 21 and stayed there. You did not have to fight it.`,
      `The idea: some things pull themselves back to a resting point, and your job is to pick the point, not to fight the way there. A goal, a gap, and a push that shrinks as the gap shrinks is a <i>balancing loop</i>. Your hunger works like this, and so do shop prices.`
    ]
  },
  recognise: {
    q: 'Three of these pull themselves back to a resting point. Which is the odd one out?',
    choices: [
      'You eat a big lunch, skip your usual snack, and are hungry again right on time for dinner.',
      'A bakery sells out of cakes by noon, so it nudges the price up until they last the day.',
      'The more followers an account has, the more new people see it, and the faster it gains followers.',
      'Your body sweats when it is hot and shivers when it is cold, and stays near 37 degrees.'
    ],
    odd: 2,
    right: 'The followers are the odd one. That loop has no resting point: more brings more. It is the opposite shape, and it is the next level, <b class="nolink">Reinforcing loops</b>.',
    wrong: [
      'That one pulls back to a resting point. Hunger rises as you run low and falls when you eat, so a big lunch just moves the timing.',
      'That one settles too. The price rises while cakes are scarce and stops rising once they last - the gap closes as the price moves.',
      '',
      'That is the textbook one. Your body notices the gap from 37 and pushes against it, gently, whichever way it needs.'
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
      `Either the room was empty or the street outside was full. If it was the crowd: the early days looked so small - 3 people, then 9 - that it felt safe to keep saying "tell two friends". Then 27 became 81 became 243.`,
      `Almost everyone misjudges this, because our gut expects things to grow by the same amount each day, not by the same multiple. Something that triples looks like nothing, then nothing, then everything.`,
      `The idea: when more of something brings even more of it, it creeps and then explodes - so you steer it early or not at all. That is a <i>reinforcing loop</i>: rumours, compound interest, and debt that grows on its own interest.`
    ],
    mid: [
      `Close, but a bit off. Maybe you reined it in a day late and turned people away, or put the brakes on too early and played to a half-empty room.`,
      `The last day is always the biggest, because it multiplies everything before it. The move that matters most is the one that feels least urgent: easing off while the numbers still look small.`,
      `The idea: when more of something brings even more of it, it creeps and then explodes - so you steer it early or not at all. That is a <i>reinforcing loop</i>: rumours, compound interest, and debt that grows on its own interest.`
    ],
    good: [
      `A full room and nobody turned away. You let it spread fast while it was small, then eased off while the numbers still looked harmless - exactly when easing off feels wrong.`,
      `Most people wait until the number looks big to act, and by then tomorrow is already going to be huge.`,
      `The idea: when more of something brings even more of it, it creeps and then explodes - so you steer it early or not at all. That is a <i>reinforcing loop</i>: rumours, compound interest, and debt that grows on its own interest.`
    ]
  },
  recognise: {
    q: 'Three of these feed themselves. Which is the odd one out?',
    choices: [
      'Money left in a savings account earns interest, and next year the interest earns interest too.',
      'You leave a mug of tea on your desk and it cools until it matches the room.',
      'An unpaid credit card bill grows because the interest is added on, then charged interest itself.',
      'A group chat gets louder: every message gets two replies, and each reply gets replies.'
    ],
    odd: 1,
    right: 'The tea is the odd one. It heads for a resting point - room temperature - and slows as it gets close. That is a balancing loop, back in level 4, <b class="nolink">Balancing loops</b>.',
    wrong: [
      'That one feeds itself: the bigger the pot, the bigger this year\'s interest, the bigger next year\'s pot. Slow, then fast.',
      '',
      'The same loop as savings, pointed the wrong way. Debt makes interest, and interest makes more debt.',
      'That one feeds itself too. Each reply is a new message that earns replies of its own - which is how 40 unread appear while you are in the shower.'
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
      `You sold a lot of drinks, and your bonus is excellent. The bar is in trouble: the regulars have drifted off somewhere quieter, and next month there will be nobody to sell to.`,
      `You did exactly what the job asked. You were paid per drink, so you made every night about drinks - the shots, the two-for-ones, the loud nights - while the people who pay the rent quietly stopped coming. Nearly everyone plays it this way, because it is the number on the screen and the number on their payslip.`,
      `The idea: sensible people with a narrow view, paid on the wrong number, can steer a whole place off a cliff without anyone doing anything stupid. That is <i>bounded rationality</i> - every choice makes sense from where you stand, and the view from there is too small.`
    ],
    mid: [
      `A decent month for you, a so-so month for the bar. You mixed nights that pleased the till with nights that looked after the regulars.`,
      `That is roughly how most real bars run: a tug of war between tonight's number and the people who pay the rent, settled by mood rather than by design.`,
      `The idea: sensible people with a narrow view, paid on the wrong number, can steer a whole place off a cliff without anyone doing anything stupid. That is <i>bounded rationality</i> - every choice makes sense from where you stand, and the view from there is too small.`
    ],
    good: [
      `You looked after the regulars and ended the month with at least as many as you started with. Your bonus was smaller than it could have been.`,
      `That was a choice against your own number. Most people do not make it - not because they are selfish, but because the bonus is real and the regulars are a vague shape at the edge of the room.`,
      `The idea: sensible people with a narrow view, paid on the wrong number, can steer a whole place off a cliff without anyone doing anything stupid. That is <i>bounded rationality</i> - every choice makes sense from where you stand, and the view from there is too small.`
    ]
  },
  recognise: {
    q: 'Three of these are sensible people steering a place wrong. Which is the odd one out?',
    choices: [
      'A call centre pays staff by calls handled per hour, so they rush every caller off the phone and the same people keep ringing back.',
      'A school judged only on exam results stops teaching anything that is not on the exam.',
      'Every driver takes the shortcut their map app suggests, and the shortcut becomes the slowest road in town.',
      'One small change to a café\'s loyalty card doubles its trade, while five other changes did almost nothing.'
    ],
    odd: 3,
    right: 'The loyalty card is the odd one. That is about finding the one push that moves everything, which is level 10, <b class="nolink">Leverage points</b>.',
    wrong: [
      'That is the pattern. Each person does what they are paid for, and nobody is paid for the caller\'s problem actually being solved.',
      'That is the pattern. Teachers are doing the sensible thing for the number they are judged on - and that number is not learning.',
      'That is the pattern. Each driver\'s choice makes sense from their own screen. Nobody\'s screen shows all the other drivers making the same choice.',
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
      `The promo worked beautifully - for about a week. After that, Friday regulars started waiting for Tuesday's deal, Friday got thinner, and whenever you skipped the promo, Tuesday fell off a cliff because people had learned to wait for it.`,
      `Nearly everyone reaches for the promo, because it works the first time and it works fast. The fix you could see pulled against a problem you could not: it taught your customers a new habit.`,
      `The idea: a quick fix that works now can quietly make the problem worse later, which makes you need the fix again. The name for this shape is <i>fixes that fail</i>.`
    ],
    mid: [
      `You ended up roughly where you started. Maybe you ran the promo, noticed Friday slipping and backed off - but deal-hunters hang around for a while after the deals stop.`,
      `Spotting the slide is the hard part, because the first weeks look like success. You spotted it, just a little late.`,
      `The idea: a quick fix that works now can quietly make the problem worse later, which makes you need the fix again. The name for this shape is <i>fixes that fail</i>.`
    ],
    good: [
      `Slow start, strong finish. Paying for the lunch menu cost you in the first week and felt like losing, while a promo would have looked like winning. By the end, Tuesday had its own reason to exist.`,
      `Most people cannot stomach a dip now for a rise later, especially with a quick bump sitting right there. You could.`,
      `The idea: a quick fix that works now can quietly make the problem worse later, which makes you need the fix again. The name for this shape is <i>fixes that fail</i>.`
    ]
  },
  recognise: {
    q: 'Three of these are fixes that fail. Which is the odd one out?',
    choices: [
      'A pond\'s fish crash because every fisher takes just a bit more than their share.',
      'A city widens a busy road, it fills with even more traffic, so the city widens it again.',
      'You pay off one credit card with another, and next month you are further behind.',
      'A shop runs a sale every weekend to hit its numbers, and now nobody buys anything at full price.'
    ],
    odd: 0,
    right: 'The pond is the odd one. That is lots of people each taking a little too much from something shared: level 9, <b class="nolink">Tragedy of the commons</b>.',
    wrong: [
      '',
      'That one is a fix that fails. A wider road makes driving easier, so more people drive, so the road jams again - and the same fix gets applied again.',
      'That is the pattern. Moving the debt feels like progress, costs a fee, and makes the next shuffle more urgent.',
      'That is the pattern. The sale saves this weekend and teaches customers never to pay full price, so now the shop needs the sale.'
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
      `Every day felt fine by mid-morning, and every morning got worse. The pills fixed the feeling while the thing causing it grew: late nights because you felt fine, and a rebound headache every time a pill wore off.`,
      `Almost everyone reaches for the pill. It works in twenty minutes, it is in the drawer, and the other options do not feel like anything today. That is exactly the problem: the fix that feels like something takes the pressure off the fix that works.`,
      `The idea: when a quick fix handles the symptom, you lose the reason to fix the cause, and the cause gets worse while you are not looking. That is <i>shifting the burden</i> - the load moves onto the quick fix, and you come to depend on it.`
    ],
    mid: [
      `A mix of pills and early nights. Your mornings got a little better, but each pill added a rebound that the good nights then had to pay off.`,
      `That is how it usually goes. The pill days feel like the good days, so they are hard to give up, even though they are the ones making tomorrow worse.`,
      `The idea: when a quick fix handles the symptom, you lose the reason to fix the cause, and the cause gets worse while you are not looking. That is <i>shifting the burden</i> - the load moves onto the quick fix, and you come to depend on it.`
    ],
    good: [
      `Some rough days early on, and by the end you were waking up clear. You put up with the headache while the sleep and water did their slow work.`,
      `That is rare. Sitting with a headache while there is a pill in the drawer feels almost silly. But you were fixing the thing, not the feeling.`,
      `The idea: when a quick fix handles the symptom, you lose the reason to fix the cause, and the cause gets worse while you are not looking. That is <i>shifting the burden</i> - the load moves onto the quick fix, and you come to depend on it.`
    ]
  },
  recognise: {
    q: 'Three of these shift the burden onto a quick fix. Which is the odd one out?',
    choices: [
      'A team always calls the one senior developer to fix outages, so nobody else ever learns the system.',
      'A bath overflows because the tap has been pouring in faster than the drain for an hour.',
      'You use coffee to get through every afternoon, and never look at why you are sleeping badly.',
      'A parent does their kid\'s homework every night, so the kid never learns how to start it.'
    ],
    odd: 1,
    right: 'The bath is the odd one. Nothing there is a quick fix crowding out a real one - it is just more coming in than going out, for too long. That is level 2, <b class="nolink">Stocks and flows</b>.',
    wrong: [
      'That one shifts the burden. The hero fix works every time, so the team never builds its own skill - and needs the hero more each time.',
      '',
      'That is the pattern. Coffee handles the tiredness today and takes the pressure off fixing the sleep that causes it.',
      'That is the pattern. The homework gets done tonight, and the thing that would end the need - the kid learning - never gets its chance.'
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
      `You ate well for a few days. So did everyone, because they saw you take three and did the same. Then the fridge ran low, nobody wanted to pay into a kitty for an empty fridge, and the whole thing fell apart.`,
      `Taking a bit more is the sensible move for any one person - you get the extra portion, and the cost is split four ways. Every housemate does the same sum, and it adds up to nothing left. Almost everyone takes the extra, at least at first.`,
      `The idea: when everyone can take from a shared thing and nobody owns it, each sensible grab adds up to ruin. That is the tragedy of the <i>commons</i> - fridges, fishing grounds, the quiet in a library, the attention in a group chat.`
    ],
    mid: [
      `The fridge survived, just. There were days you took a little extra and watched the others follow, and days you reined it in.`,
      `That is the uncomfortable part: your housemates were not greedy people. They were copying what they saw. The habit in a shared space is set by whoever is most visible.`,
      `The idea: when everyone can take from a shared thing and nobody owns it, each sensible grab adds up to ruin. That is the tragedy of the <i>commons</i> - fridges, fishing grounds, the quiet in a library, the attention in a group chat.`
    ],
    good: [
      `The fridge was still full on day eight, and so was everyone. You took your share and your housemates did the same, because that is what they saw you do.`,
      `Nothing about it felt like winning. You did not get the extra portions, and nobody thanked you. That is why it is rare: the reward for keeping a shared thing alive is that it is still there.`,
      `The idea: when everyone can take from a shared thing and nobody owns it, each sensible grab adds up to ruin. That is the tragedy of the <i>commons</i> - fridges, fishing grounds, the quiet in a library, the attention in a group chat.`
    ]
  },
  recognise: {
    q: 'Three of these are a shared fridge. Which is the odd one out?',
    choices: [
      'Everyone in a group chat posts a few more memes than they read, and people start muting it.',
      'Every village family grazes one extra cow on the shared field, and the grass never grows back.',
      'A thermostat keeps an office at 21 degrees whatever the weather.',
      'Each person in a quiet library whispers "just a bit", and by lunchtime it is as loud as a café.'
    ],
    odd: 2,
    right: 'The thermostat is the odd one. Nobody is taking from anything shared - it is a loop pulling towards a set point. That is level 4, <b class="nolink">Balancing loops</b>.',
    wrong: [
      'That is the pattern. The chat\'s attention is shared, so each extra post costs you nothing and costs everyone a little.',
      'That is where the name comes from. One extra cow is a gain for one family and a tiny cost for everyone - until the field is mud.',
      '',
      'That is the pattern. The quiet belongs to everyone, so each small whisper feels free.'
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
      `You tried the sensible things - cheaper coffee, longer hours, a nicer look - and each one nudged the number up a little. By week eight the shop was still struggling.`,
      `Those were all real improvements with the same weakness: each one added a few walk-ins, once. Nothing about them grew. The idea that looked least like a business plan - learning your regulars' names and orders - was the one that changed how the shop grows. Regulars who feel known come back and bring friends, and the friends become regulars.`,
      `The idea: in most systems a few places move everything and most barely move anything - and the big ones usually change how something grows, not how big it is today. A place like that is a <i>leverage point</i>.`
    ],
    mid: [
      `The shop is doing better. You found the names idea, but maybe a bit late, so it only had a few weeks to grow.`,
      `An idea that changes how something grows gets stronger the earlier you pull it, which is the opposite of how it feels: it pays nothing in its first week, so it seems safe to leave it till later.`,
      `The idea: in most systems a few places move everything and most barely move anything - and the big ones usually change how something grows, not how big it is today. A place like that is a <i>leverage point</i>.`
    ],
    good: [
      `The shop is buzzing. You spotted that remembering people was different from the other ideas - not a bump, but a change to how the shop grows - and you pulled it early enough for it to build on itself.`,
      `Most people spread their pushes evenly over sensible-looking ideas. The small, odd, human one moved everything.`,
      `The idea: in most systems a few places move everything and most barely move anything - and the big ones usually change how something grows, not how big it is today. A place like that is a <i>leverage point</i>.`
    ]
  },
  recognise: {
    q: 'Three of these are a small push in the right place. Which is the odd one out?',
    choices: [
      'Bar staff are paid on drinks sold, so the bar sells lots of drinks and loses its regulars.',
      'A school changes only its start time, from 8am to 9am, and grades, attendance and moods all improve.',
      'A gym puts the stairs by the entrance and tucks the lift round a corner, and far more people take the stairs.',
      'A company starts showing each team its own electricity use, and the bill drops by a fifth.'
    ],
    odd: 0,
    right: 'The bar is the odd one - that is sensible people paid on a narrow number, level 6, <b class="nolink">Bounded rationality</b>. Though notice: changing what the staff are paid on would be a leverage point.',
    wrong: [
      '',
      'That is leverage. One small setting changed how much everyone slept, and sleep sits underneath almost everything else.',
      'That is leverage. The building makes the choice for people. Moving the stairs costs nothing and nudges thousands of decisions a day.',
      'That is leverage too. Nothing changed except who could see what. When people can see the effect of their choices, the choices change.'
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
      `You did not make it to the café. Somewhere along the way the map and the street disagreed, and you went with the map - most likely marching off to the far bridge, because the map said that was the way across.`,
      `That is what nearly everyone does. The map has been right a hundred times and it looks official. The street in front of you is one scruffy detail, easy to wave off as a fluke.`,
      `The idea: the picture in your head is a tool, not the world - when the two disagree, believe the world and redraw the picture. That picture is a <i>mental model</i>, and everyone is running on one.`
    ],
    mid: [
      `You got there, the long way round. You probably walked into the old bridge, or took a while to trust the footbridge right next to it, because it was not on the map.`,
      `Updating once is easy. Accepting that the map was wrong about a second thing is where most people stall.`,
      `The idea: the picture in your head is a tool, not the world - when the two disagree, believe the world and redraw the picture. That picture is a <i>mental model</i>, and everyone is running on one.`
    ],
    good: [
      `Straight there. At the river the old bridge was taped off and a new footbridge sat right beside it, missing from the map. You took it without a second thought.`,
      `That sounds obvious written down. In the moment it means deciding your own eyes outrank an official-looking map, and most people hesitate.`,
      `The idea: the picture in your head is a tool, not the world - when the two disagree, believe the world and redraw the picture. That picture is a <i>mental model</i>, and everyone is running on one.`
    ]
  },
  recognise: {
    q: 'Three of these are someone following an out-of-date map. Which is the odd one out?',
    choices: [
      'You are sure a friend is still annoyed about last month, so you avoid them - they forgot about it weeks ago.',
      'A company keeps advertising to young professionals because that was its customer ten years ago; its buyers are now mostly retired.',
      'A driver keeps taking a route to work that was quick before a new estate was built along it.',
      'A shower goes scalding two turns after you turned it up, because the hot water was still in the pipe.'
    ],
    odd: 3,
    right: 'The shower is the odd one. Your picture of the shower was fine - the result just arrived late. That is level 3, <b class="nolink">Delays</b>.',
    wrong: [
      'That is an out-of-date map. Your picture of the friendship stopped updating a month ago; the friendship did not.',
      'That is the pattern. The customer in the company\'s head was accurate once. Nobody went outside to check.',
      'That is the pattern, almost word for word. The ground changed and the habit did not.',
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
      `Lots shipped, and a bug pile that ended the week bigger than your feature list. The autopilot features looked free, but their bugs turned up two days later - and every time you let the agent loop on the bug list without tests, it fixed some and quietly made most of them back.`,
      `Nearly everyone works this way with an agent, because shipping is instant and visible and the bugs are late and quiet. It is the slow shower again: by the time the reports arrive, you have shipped two more features the same way.`,
      `The idea: an app is a system, so the same shapes apply. Bugs are a stock. A feature's bugs arrive after a delay. An agent fixing its own work with nothing checking it is a reinforcing loop - and tests are what turn it into a balancing loop.`
    ],
    mid: [
      `A reasonable week: some features, some bugs, nothing on fire. You probably mixed quick autopilot days with clean-up days, which keeps the pile level without shrinking it.`,
      `What moves it from fine to good is the thing that feels slowest: tests first. They cost more tokens today and make every later feature and every agent loop cheaper.`,
      `The idea: an app is a system, so the same shapes apply. Bugs are a stock. A feature's bugs arrive after a delay. An agent fixing its own work with nothing checking it is a reinforcing loop - and tests are what turn it into a balancing loop.`
    ],
    good: [
      `Four or more features and a small bug pile. You kept the pile from growing while you shipped - and if you let the agent loop, you had tests in place first, so its fixes stuck.`,
      `It feels slower on day one and faster by day five, which is why most people skip it: day one is the only day you can see.`,
      `The idea: an app is a system, so the same shapes apply. Bugs are a stock. A feature's bugs arrive after a delay. An agent fixing its own work with nothing checking it is a reinforcing loop - and tests are what turn it into a balancing loop.`
    ]
  },
  recognise: {
    q: 'Three of these are a loop feeding itself, like the agent fixing its own bugs. Which is the odd one out?',
    choices: [
      'An agent "fixes" a failing test by editing the test, which breaks two others, which it then "fixes" the same way.',
      'A new feature\'s bug reports only start arriving two days after you ship it.',
      'Each quick patch to messy code makes the code messier, so the next patch is quicker and dirtier still.',
      'The longer the bug list in the agent\'s context, the more each fix costs and the sloppier it gets, so the list grows.'
    ],
    odd: 1,
    right: 'The late bug reports are the odd one. Nothing is feeding itself there - the result is just arriving late. That is the slow shower from level 3, <b class="nolink">Delays</b>.',
    wrong: [
      'That is a loop feeding itself. Every "fix" creates the next thing to fix, and nothing outside the loop is checking.',
      '',
      'That is the pattern. Mess makes quick patches, and quick patches make mess.',
      'That is the pattern. More bugs make worse fixes, and worse fixes make more bugs.'
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
  desc: 'Twelve small games about why things go wrong on their own - slow showers, overflowing baths, rumours, shared fridges. Play first, then find out what you just did.',
  chapters: [
    {
      title: 'Chapter 1 - How things add up',
      desc: 'Wholes, piles, and things that arrive late.',
      nodes: [
        {
          id: 'st-01', name: 'Parts vs the whole', ico: '⚽',
          steps: [
            L('Eleven stars, no team', [
              { p: 'Every few years a football club spends a fortune buying the best player it can find for every position. Sometimes it wins everything. Quite often it finishes fifth, and nobody can quite say why.' },
              { p: 'Every player is brilliant. Put them on the same pitch and something goes missing. Two of them want every free kick. Nobody wants to do the boring running. The keeper and the defenders have never learned how each other think.' }
            ]),
            L('"On paper, we should win"', [
              { p: 'Listen to fans after a bad season and you will hear the same phrase: <strong>on paper</strong>. On paper, this was the best squad in the league. On paper, we should have walked it.' },
              { p: 'On paper means: add up how good each player is. It is a real number, and it is easy to work out. The question is whether it is the number that decides the games.' }
            ]),
            L('Your turn', [
              { p: 'You are picking a team of six: a keeper, two defenders, two midfielders and a striker. Each turn one role comes up and three players are free. Each has a rating out of 100.' },
              { p: 'The big number is your team\'s rating on paper - the total of everyone you have picked. After six picks, the season plays itself.' },
              { call: { k: 'tip', t: 'No trick.', p: 'Pick however you like. There is no wrong way to play - only a way to find out.' } }
            ], 'Pick the team →'),
            football
          ]
        },
        {
          id: 'st-02', name: 'Stocks and flows', ico: '🛁',
          steps: [
            L('The bath you forgot about', [
              { p: 'You start running a bath, go to answer a message, and come back to a flood. The tap was not on full. It did not need to be. It only needed to pour in faster than the plug hole let out, for long enough.' },
              { p: 'Here is the odd thing about a bath: how much water is in it tells you nothing about how fast the tap is running right now. A tub can be nearly empty with the tap on full, or nearly full with the tap off.' }
            ]),
            L('What you can and cannot see', [
              { p: 'You can see the water. You can hear the tap. The plug hole is harder: it drains quietly, and you only notice it when it gets slower - a bit of hair, a bit of soap, and suddenly it is taking less than it did.' },
              { p: 'And the tap is not only yours. Someone runs the kitchen sink and your pressure drops, without anyone telling you.' }
            ]),
            L('Your turn', [
              { p: 'Keep the bath between the two lines - 40 to 70 litres - for eight turns. Each turn you can nudge the tap up or down, open or close the drain, or leave it.' },
              { p: 'The big number is the water in the tub. Under it: how much is coming in and going out each turn. Things will happen to the plumbing. Things always happen to the plumbing.' }
            ], 'Run the bath →'),
            bathtub
          ]
        },
        {
          id: 'st-03', name: 'Delays', ico: '🚿',
          steps: [
            L('The hotel shower', [
              { p: 'You step into a hotel shower. It is freezing. You turn the handle towards hot. Still freezing. You turn it more. Still freezing. You turn it a lot more.' },
              { p: 'Then the scalding water arrives, all at once, and you are flat against the tiles turning it back the other way. And then it goes freezing again.' }
            ]),
            L('Where the water is', [
              { p: 'The handle is right there in your hand. The boiler is somewhere in the basement. Between them is a long pipe, full of water that was set to some temperature a little while ago.' },
              { p: 'Whatever you do to the handle has to push all that old water out of the way before you feel it. Your skin only ever reads the water that is already on it.' }
            ]),
            L('Your turn', [
              { p: 'Ten turns. Keep the water on your back between 36 and 40 degrees - the green band. Each turn you can turn the handle a lot, a bit, or leave it.' },
              { p: 'The big number is what you feel right now. Under it, the dial shows where the handle is pointing.' },
              { call: { k: 'tip', t: 'Take your time.', p: 'Nobody is timing you. The water is.' } }
            ], 'Get in →'),
            shower
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 - Loops',
      desc: 'Things that settle, and things that snowball.',
      nodes: [
        {
          id: 'st-04', name: 'Balancing loops', ico: '🌡️',
          steps: [
            L('The flat that fights back', [
              { p: 'Your flat is cold, so you put the heater on full. An hour later you are in a T-shirt with the window open. An hour after you switch it off you are back in a jumper. Nothing seems to settle.' },
              { p: 'Next door has an old thermostat on the wall, set to 21. The flat is 21 all winter. The thermostat is not clever. It does one boring thing, over and over.' }
            ]),
            L('Heat leaks', [
              { p: 'A warm room is always losing heat - through the windows, the walls, the gap under the door. A radiator takes a while to get hot after you switch it on, and it stays hot for a while after you switch it off.' }
            ]),
            L('Your turn', [
              { p: 'Ten turns. Keep the room between 20 and 22 degrees. Each turn, set the heater to high, low or off.' },
              { p: 'The big number is the room. Under it: what the heater is set to, and how hot the radiator itself feels.' }
            ], 'Turn the heating on →'),
            thermostat
          ]
        },
        {
          id: 'st-05', name: 'Reinforcing loops', ico: '📣',
          steps: [
            L('How a school finds out', [
              { p: 'On Monday, one person knows who kissed who at the party. By Friday the whole school knows, including three teachers and the bus driver. Nobody made an announcement. Each person just told a couple of others.' },
              { p: 'The strange part: for most of the week, almost nobody knew. On Wednesday it could still have stayed quiet. By Thursday it was far too late.' }
            ]),
            L('Now it is your gig', [
              { p: 'Your band has a gig on Saturday. The room holds 150 and you need at least 100 there to cover the hire. No posters, no ads. Just people telling people.' },
              { p: 'You have one person on side: you.' }
            ]),
            L('Your turn', [
              { p: 'Eight days. Each day, decide how many friends everyone who has heard should tell: none, one or two. Everyone does what you ask.' },
              { p: 'The big number is how many people have heard. Get it between 100 and 150 by Saturday.' }
            ], 'Start talking →'),
            rumour
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 - Good people, bad results',
      desc: 'Nobody is the villain. The shape is.',
      nodes: [
        {
          id: 'st-06', name: 'Bounded rationality', ico: '🍸',
          steps: [
            L('A good job', [
              { p: 'You work behind a bar. The owner pays you a bonus on every drink you sell. Seems fair: more drinks, more money for everyone.' },
              { p: 'The regulars - people who come in three nights a week, tip well and bring their friends - are why the bar pays its rent. They are not on the till screen.' }
            ]),
            L('The view from behind the bar', [
              { p: 'From where you stand you can see tonight: who is thirsty, what is on the till, how busy it is. You cannot see next month.' },
              { p: 'Nobody at this bar is trying to wreck it. Everyone is doing the sensible thing for where they stand.' }
            ]),
            L('Your turn', [
              { p: 'Eight nights. Each night, choose how you run the bar. The big number is the drinks you sold that night - the number your bonus is paid on. Under it: how many regulars came in.' }
            ], 'Open up →'),
            bartender
          ]
        },
        {
          id: 'st-07', name: 'Fixes that fail', ico: '🏷️',
          steps: [
            L('The slow Tuesday', [
              { p: 'You run a café. Fridays are rammed. Tuesdays are dead. A friend says: run a Tuesday deal, 40% off. Easy win.' },
              { p: 'The first Tuesday is great - a queue out of the door. You feel very clever.' }
            ]),
            L('Customers remember', [
              { p: 'Customers are not furniture. They notice what you did last week and they plan around it. So do you, when you shop.' }
            ]),
            L('Your turn', [
              { p: 'Eight weeks. Each week, run the Tuesday deal, skip it, or spend the week building a proper lunch menu - which costs money now and takes a week to catch on.' },
              { p: 'The big number is what you took this week. A normal week is $1,600.' }
            ], 'Open the café →'),
            promo
          ]
        },
        {
          id: 'st-08', name: 'Shifting the burden', ico: '💊',
          steps: [
            L('Another morning', [
              { p: 'You wake up with a headache. Again. There is a packet of painkillers by the bed. Twenty minutes later it is gone and your day is fine.' },
              { p: 'It is the third time this week. But it is fine. The pills work.' }
            ]),
            L('What is underneath', [
              { p: 'Headaches like this usually come from something piling up: short nights, not enough water, a phone in your face until one in the morning. None of that clears in twenty minutes. It takes a few days of the boring thing before you notice anything.' }
            ]),
            L('Your turn', [
              { p: 'Eight mornings. Each day pick one thing: a painkiller, an early night, a big glass of water, or screens off at ten.' },
              { p: 'The big number is how bad your head feels today, out of 10. Under it: how bad it was when you woke up.' }
            ], 'Wake up →'),
            headache
          ]
        },
        {
          id: 'st-09', name: 'Tragedy of the commons', ico: '🧊',
          steps: [
            L('The shared fridge', [
              { p: 'Four of you share a flat and a fridge. Everyone puts money in a kitty and whoever is around does the shop. At first it is lovely: the fridge is full, and nobody counts.' },
              { p: 'Then someone notices the good yoghurts go fast. If they do not grab one today, someone else will.' }
            ]),
            L('The kitty', [
              { p: 'The kitty works as long as people believe in it. When the fridge is full, everyone chips in happily. When it is half-empty every time you open it, people start buying their own food and hiding it in their rooms - and nobody pays in for a fridge they never get anything out of.' }
            ]),
            L('Your turn', [
              { p: 'Eight days. Each day choose how much you take: one portion, two, or three. Your housemates see what you took and do the same the next day. Two each is about what the nightly shop can keep up with.' },
              { p: 'The big number is what is left in the fridge.' }
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
            L('The struggling café', [
              { p: 'A little coffee shop on a side street sells about 300 coffees a week. It is not enough. The owner has a list of ideas: cheaper prices, new cups, longer hours, Instagram, oat milk, remembering people\'s names.' },
              { p: 'She has the energy for three of them. Just three.' }
            ]),
            L('Where customers come from', [
              { p: 'Some customers are walk-ins: they pass by, they fancy a coffee, they come in. Others are regulars: they come most days, five coffees a week, and now and then they bring a friend.' }
            ]),
            L('Your turn', [
              { p: 'Eight weeks, three pushes. Each week a few ideas are on the table; pick one, or let the week run. Once you have used three, you are done tinkering.' },
              { p: 'The big number is coffees sold this week.' }
            ], 'Unlock the door →'),
            coffee
          ]
        },
        {
          id: 'st-11', name: 'Mental models', ico: '🗺️',
          steps: [
            L('The confident map', [
              { p: 'You are meeting a friend at a café across the river. The map on your phone shows the route: straight up, over the bridge, café on the corner. Easy.' },
              { p: 'The map is confident. The map is also three months old.' }
            ]),
            L('What you can see', [
              { p: 'Standing in the street, you can see what is right around you: the corner, the next block, the river bank when you reach it. Everything further away, you only know from the map.' }
            ]),
            L('Your turn', [
              { p: 'Get to the café in ten moves or fewer. Squares next to you show what is really there - bright. Everything else shows what the map says - faded.' },
              { p: 'The big number is how many blocks you are from the café, as the crow flies. Walk into something and you lose the move.' }
            ], 'Head out →'),
            mapwalk
          ]
        },
        {
          id: 'st-12', name: 'Your app is a system', ico: '🤖',
          steps: [
            L('A week of shipping', [
              { p: 'You are building an app with an AI agent. It is Monday. You have a list of features, a budget of tokens, and a small pile of bugs.' },
              { p: 'The agent is fast. Ask for a feature and you get one in minutes. It feels like cheating.' }
            ]),
            L('Same shapes, new room', [
              { p: 'You have met every piece of this already. Open bugs are a stock, like water in the tub. Users take a couple of days to find the bugs in a new feature - a delay, like the shower. And an agent fixing its own bugs with nothing checking its work can make new ones as fast as it fixes old ones: a reinforcing loop.' },
              { p: 'Tokens are a flow: every prompt spends some, and a long bug list makes every prompt longer.' }
            ]),
            L('Your turn', [
              { p: 'Eight days. Each day pick one: ship a feature on autopilot, write tests and then ship, fix bugs by hand, or let the agent loop on the bug list.' },
              { p: 'The big number is open bugs. Aim to ship at least four features and finish with three bugs or fewer - counting the reports already on their way.' }
            ], 'Open the laptop →'),
            vibe
          ]
        }
      ]
    }
  ]
};
