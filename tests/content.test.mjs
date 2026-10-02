// Run: node tests/content.test.mjs      (exits 1 on any failure)
// Checks the content and configuration the week-0 traction test depends on:
// the public config shape, the Survive path, the free set, Ship It Safely,
// the service worker manifest, and that a save made under the previous
// release still loads with nothing lost.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TRACKS } from '../data/tracks.js';
import { safely } from '../data/safely.js';
import { CONFIG } from '../config.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(ROOT, f), 'utf8');
const APP = read('app.js');

const NODE_INDEX = new Map();
TRACKS.forEach(track => track.chapters.forEach((chapter, ci) => chapter.nodes.forEach(node =>
  NODE_INDEX.set(node.id, { node, track, chapter, ci }))));

const eq = (got, want, what) => { if (got !== want) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };
const ok = (cond, what) => { if (!cond) throw new Error(what); };
const deepEq = (a, b, what) => eq(JSON.stringify(a), JSON.stringify(b), what);

/* The free set and the Survive path, read from the app source so the test
   fails if either list moves away from what the traction test promises. */
const SURVIVE_WANT = ['g-08', 'vb-04', 'db-07', 'db-11', 'pg-17'];
const surviveMatch = APP.match(/const SURVIVE_PATH = \[([^\]]*)\]/);
const SURVIVE_PATH = surviveMatch ? surviveMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')) : [];
const FREE_TRACKS = new Set(['systems', 'terminal']);
const FREE_CHAPTERS = { github: 3, ground: 1, debugging: 1 };
const FREE_LEVELS = new Set([...SURVIVE_WANT, 'ss-01']);
const isFreeWant = id => {
  if (FREE_LEVELS.has(id)) return true;
  const e = NODE_INDEX.get(id);
  return FREE_TRACKS.has(e.track.id) || e.ci < (FREE_CHAPTERS[e.track.id] || 0);
};

const EVENTS = ['gg_onboarding_answer', 'gg_level_start', 'gg_level_finish', 'gg_step_miss', 'gg_email_submit',
  'gg_unlock_click', 'gg_unlock_success', 'gg_share_click', 'gg_daily_done'];

const CHECKS = [
  ['config.js has exactly the seven public keys', () => {
    deepEq(Object.keys(CONFIG), ['POSTHOG_KEY', 'POSTHOG_HOST', 'LOOPS_FORM_URL', 'STRIPE_PAYMENT_LINK', 'UNLOCK_CODE_SHA256', 'TEAM_BOOKING_URL', 'SITE_URL'], 'keys');
    Object.entries(CONFIG).forEach(([k, v]) => eq(typeof v, 'string', k + ' is a string'));
  }],
  ['config.js holds no secret-shaped value', () => {
    Object.entries(CONFIG).forEach(([k, v]) => ok(!/^(sk_live|sk_test|rk_live|whsec_|ghp_|eyJ)/.test(v), k + ' looks like a secret'));
    ok(CONFIG.UNLOCK_CODE_SHA256 === '' || /^[0-9a-f]{64}$/i.test(CONFIG.UNLOCK_CODE_SHA256), 'UNLOCK_CODE_SHA256 is empty or a hex SHA-256, never the code');
  }],
  ['node ids are unique across every track', () => {
    const all = TRACKS.flatMap(t => t.chapters.flatMap(c => c.nodes.map(n => n.id)));
    eq(new Set(all).size, all.length, 'unique ids');
  }],
  ['the Survive path is the five levels, in order, and all exist', () => {
    deepEq(SURVIVE_PATH, SURVIVE_WANT, 'SURVIVE_PATH in app.js');
    SURVIVE_WANT.forEach(id => ok(NODE_INDEX.has(id), id + ' exists'));
  }],
  ['the free set in app.js matches the promised free set', () => {
    const src = APP;
    ok(src.includes("const FREE_TRACKS = new Set(['systems', 'terminal']);"), 'FREE_TRACKS');
    ok(src.includes('const FREE_CHAPTERS = { github: 3, ground: 1, debugging: 1 };'), 'FREE_CHAPTERS');
    ok(src.includes("const FREE_LEVELS = new Set([...SURVIVE_PATH, 'ss-01']);"), 'FREE_LEVELS');
    // Spot checks on the boundary of every rule.
    ok(isFreeWant('g-08') && isFreeWant('g-10'), 'github chapters 1 to 3 free');
    ok(!isFreeWant('g-11') || NODE_INDEX.get('g-11').ci < 3, 'github chapter 4 is Pro');
    const g4 = NODE_INDEX.get(NODE_INDEX.get('g-08').track.chapters[3].nodes[0].id);
    ok(!isFreeWant(g4.node.id), 'first level of Git chapter 4 is Pro');
    ok(isFreeWant('ss-01') && !isFreeWant('ss-02') && !isFreeWant('ss-06'), 'Safely level 1 free, 2 to 6 Pro');
    ok(isFreeWant('db-07') && isFreeWant('db-11') && isFreeWant('pg-17') && isFreeWant('vb-04'), 'Survive levels free');
    ok(!isFreeWant('vb-05') && !isFreeWant('db-08'), 'neighbours of Survive levels stay Pro');
    const terminalIds = TRACKS.find(t => t.id === 'terminal').chapters.flatMap(c => c.nodes.map(n => n.id));
    const systemsIds = TRACKS.find(t => t.id === 'systems').chapters.flatMap(c => c.nodes.map(n => n.id));
    [...terminalIds, ...systemsIds].forEach(id => ok(isFreeWant(id), id + ' free'));
    ['apis', 'tooling', 'harness', 'claude-code', 'codex', 'ghostty'].forEach(tid => {
      const t = TRACKS.find(x => x.id === tid); ok(t, tid + ' exists');
      t.chapters.forEach(c => c.nodes.forEach(n => ok(!isFreeWant(n.id), n.id + ' is Pro')));
    });
  }],
  ['Ship It Safely is registered with exactly six levels', () => {
    ok(TRACKS.includes(safely), 'registered in tracks.js');
    eq(safely.id, 'safely', 'id');
    const nodes = safely.chapters.flatMap(c => c.nodes);
    eq(nodes.length, 6, 'levels');
    deepEq(nodes.map(n => n.id), ['ss-01', 'ss-02', 'ss-03', 'ss-04', 'ss-05', 'ss-06'], 'ids');
  }],
  ['every Ship It Safely level has a lesson and a check', () => {
    safely.chapters.flatMap(c => c.nodes).forEach(n => {
      ok(n.steps.some(s => s.t === 'lesson'), n.id + ' has a lesson');
      ok(n.steps.some(s => s.t === 'quiz' || s.t === 'build'), n.id + ' has a quiz or build');
      n.steps.forEach((s, i) => {
        if (s.t === 'quiz') { ok(Array.isArray(s.choices) && s.choices.length >= 2, `${n.id}#${i} choices`); ok(s.a >= 0 && s.a < s.choices.length, `${n.id}#${i} answer index`); ok(!!s.why, `${n.id}#${i} why`); }
        if (s.t === 'build') { ok(s.answer.length >= 2, `${n.id}#${i} answer`); ok(!!s.why, `${n.id}#${i} why`); }
      });
    });
  }],
  ['every Ship It Safely level names its doc source', () => {
    const src = read('data/safely.js');
    ['ss-01', 'ss-02', 'ss-03', 'ss-04', 'ss-05', 'ss-06'].forEach(id => {
      const at = src.indexOf(`id: '${id}'`);
      const before = src.slice(Math.max(0, at - 700), at);
      ok(/Source/.test(before) && /https?:\/\//.test(before) || /Sources/.test(before), id + ' has a source comment');
    });
  }],
  ['the nine analytics events are in app.js', () => {
    EVENTS.forEach(e => ok(APP.includes(e), e));
  }],
  ['home stats say Best combo, not Best streak', () => {
    const html = read('index.html');
    ok(html.includes('Best combo'), 'Best combo present');
    ok(!html.includes('Best streak'), 'Best streak gone');
  }],
  ['onboarding asks one question with the five options', () => {
    const html = read('index.html');
    ok(html.includes('What do you build with?'), 'question');
    const opts = [...html.matchAll(/class="onb-opt"[^>]*>([^<]+)</g)].map(m => m[1].trim());
    deepEq(opts, ['Lovable, Bolt or Replit', 'Cursor', 'Claude Code', 'Codex', 'Not building yet'], 'options');
  }],
  ['service worker cache is v2 and lists the new files', () => {
    const sw = read('sw.js');
    ok(sw.includes("const CACHE = 'gitgames-v2';"), 'CACHE');
    ['./config.js', './team.html', './privacy.html'].forEach(f => ok(sw.includes(`'${f}'`), f + ' in ASSETS'));
  }],
  ['team and privacy pages carry what they promise', () => {
    const team = read('team.html'), priv = read('privacy.html');
    ok(team.includes('id="team-pack"'), 'team pack section');
    ok(team.includes('id="team-book"') && team.includes('TEAM_BOOKING_URL'), 'booking button wired to TEAM_BOOKING_URL');
    ok(/Analytics events/.test(priv) && /Optional email/.test(priv) && /Local progress/.test(priv), 'privacy lists the three items');
    eq((priv.match(/<li>/g) || []).length, 3, 'exactly three collected items');
  }],
  ['no em dash in the new files', () => {
    ['config.js', 'data/safely.js', 'team.html', 'privacy.html', 'tests/content.test.mjs', '.github/workflows/ci.yml'].forEach(f =>
      ok(!read(f).includes(String.fromCharCode(0x2014)), f + ' has an em dash'));
  }],
  ['a save from the previous release loads with nothing lost', () => {
    const fx = JSON.parse(read('tests/fixtures/progress-v3.json'));
    // Mirrors app.js load(): a saved object is laid over the blank state.
    const blank = { xp: 0, bestStreak: 0, done: {}, misses: {}, lastSeen: {}, outUsed: {}, onb: null, emailAsked: false, days: {}, daily: {}, resume: null };
    const loaded = Object.assign(blank, fx);
    eq(loaded.xp, fx.xp, 'xp');
    deepEq(loaded.done, fx.done, 'done');
    deepEq(loaded.misses, fx.misses, 'misses');
    Object.keys(fx.done).forEach(id => ok(NODE_INDEX.has(id), id + ' still exists'));
    Object.values(fx.misses).forEach(m => {
      const e = NODE_INDEX.get(m.nodeId);
      ok(e, m.nodeId + ' still exists');
      const step = e.node.steps[m.si];
      ok(step && step.t !== 'lesson', `${m.nodeId}#${m.si} is still a check`);
    });
    ok(Object.keys(fx.done).length >= 3, 'fixture has at least three cleared levels');
  }]
];

const results = CHECKS.map(([name, fn]) => { try { fn(); return { name, pass: true }; } catch (e) { return { name, pass: false, error: e.message }; } });
results.forEach(r => console.log(`${r.pass ? 'ok  ' : 'FAIL'} ${r.name}${r.pass ? '' : '\n     ' + r.error}`));
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
