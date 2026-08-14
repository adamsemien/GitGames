/* ============================================================
   GitGames — engine
   Tracks live in ./data/*.js and are registered in ./data/tracks.js
   Adding a track = add a file + one line in tracks.js. Nothing here changes.
   ============================================================ */
import { TRACKS } from './data/tracks.js';
import { GLOSSARY, CHEATS } from './data/reference.js';

/* ---------- state ---------- */
const KEY = 'gitgames.v2';
const state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.done) return s;
  } catch (_) {}
  return { xp: 0, bestStreak: 0, done: {} };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

const RANKS = [
  [0, 'Rookie'], [150, 'Committer'], [400, 'Brancher'], [800, 'Merger'],
  [1300, 'Rebaser'], [1900, 'Maintainer'], [2600, 'Git Wizard'], [3600, 'Legend']
];
const rank = xp => RANKS.reduce((a, r) => xp >= r[0] ? r[1] : a, 'Rookie');

/* ---------- tiny dom helpers ---------- */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
}
function confetti() {
  const box = $('#confetti');
  const cols = ['#39e6ff', '#ff4fd8', '#7cff7c', '#ffc44d', '#a07cff'];
  for (let i = 0; i < 46; i++) {
    const c = el('i', 'cf');
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = '-20px';
    c.style.background = cols[i % cols.length];
    c.style.animationDuration = (1.5 + Math.random() * 1.6) + 's';
    c.style.animationDelay = (Math.random() * .5) + 's';
    box.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

/* ---------- track/level lookups ---------- */
const nodesOf = tr => tr.chapters.flatMap(c => c.nodes);
const doneCount = tr => nodesOf(tr).filter(n => state.done[n.id]).length;
const trackXp = tr => nodesOf(tr).reduce((a, n) => a + (state.done[n.id]?.xp || 0), 0);

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  $('#stat-xp').textContent = state.xp;
  $('#stat-rank').textContent = rank(state.xp);
  $('#stat-done').textContent = Object.keys(state.done).length;
  $('#stat-streak').textContent = state.bestStreak;

  const list = $('#track-list');
  list.innerHTML = '';
  TRACKS.forEach(tr => {
    const total = nodesOf(tr).length, dn = doneCount(tr);
    const card = el('button', 'track-card');
    card.style.setProperty('--glow', tr.glow);
    card.innerHTML = `
      <div class="tc-top"><span class="tc-emoji">${tr.emoji}</span><span class="tc-name">${tr.name}</span></div>
      <p class="tc-desc">${tr.desc}</p>
      <div class="tc-meta">
        <span class="pill">${total} levels</span>
        <span class="pill">${tr.time}</span>
        <span>${dn ? dn + ' complete' : 'Not started'}</span>
      </div>
      <div class="tc-rail"><i style="width:${total ? (dn / total * 100) : 0}%"></i></div>`;
    card.onclick = () => { buzz(8); openTrack(tr); };
    list.appendChild(card);
  });
}

/* ============================================================
   LEVEL SELECT
   ============================================================ */
let curTrack = null;
function openTrack(tr) {
  curTrack = tr;
  const all = nodesOf(tr), dn = doneCount(tr);
  $('#lv-track-name').textContent = tr.name;
  $('#lv-track-sub').textContent = `${dn} of ${all.length} levels cleared`;
  $('#lv-track-xp').textContent = trackXp(tr) + ' XP';
  $('#lv-progress').style.width = (all.length ? dn / all.length * 100 : 0) + '%';

  const wrap = $('#chapter-list'); wrap.innerHTML = '';
  let idx = 0;
  const firstUndone = all.find(n => !state.done[n.id]);

  tr.chapters.forEach(ch => {
    const c = el('section', 'chapter');
    c.appendChild(el('h3', '', esc(ch.title)));
    if (ch.desc) c.appendChild(el('p', 'ch-desc', esc(ch.desc)));
    const grid = el('div', 'node-grid');
    ch.nodes.forEach(n => {
      idx++;
      const isDone = !!state.done[n.id];
      const isNext = firstUndone && n.id === firstUndone.id;
      const b = el('button', 'node' + (isDone ? ' done' : '') + (isNext ? ' next' : ''));
      b.innerHTML = `<span class="n-num">${String(idx).padStart(2, '0')}</span>
        <span class="n-ico">${isDone ? '✓' : n.ico}</span>
        <span class="n-lbl">${esc(n.name)}</span>`;
      b.onclick = () => { buzz(8); playNode(tr, n); };
      grid.appendChild(b);
    });
    c.appendChild(grid);
    wrap.appendChild(c);
  });
  show('levels');
}

/* ============================================================
   PLAY
   ============================================================ */
let cur = null; // {track,node,i,xp,streak,perfect}

function playNode(tr, node) {
  cur = { track: tr, node, i: 0, xp: 0, streak: 0, misses: 0 };
  $('#play-title').textContent = node.name;
  $('#play-sub').textContent = tr.name;
  updCombo();
  show('play');
  renderStep();
}

function updCombo() {
  const c = $('#combo');
  c.querySelector('b').textContent = cur ? cur.streak : 0;
  c.classList.toggle('hot', cur && cur.streak >= 3);
}

function renderStep() {
  const { node, i } = cur;
  $('#play-progress').style.width = (i / node.steps.length * 100) + '%';
  const stage = $('#stage'); stage.innerHTML = '';
  if (i >= node.steps.length) return finishNode();
  const step = node.steps[i];
  ({ lesson: stepLesson, quiz: stepQuiz, build: stepBuild })[step.t](stage, step);
  window.scrollTo(0, 0);
}

function nextStep(gain) {
  cur.xp += gain || 0;
  cur.i++;
  renderStep();
}

/* ---------- lesson ---------- */
function blocksToHtml(body) {
  return body.map(b => {
    if (b.p) return `<p>${b.p}</p>`;
    if (b.h) return `<h3 class="kicker">${esc(b.h)}</h3>`;
    if (b.ul) return `<ul>${b.ul.map(x => `<li>${x}</li>`).join('')}</ul>`;
    if (b.term) return `<div class="termbox">${b.term}</div>`;
    if (b.svg) return `<div class="diagram">${b.svg}</div>`;
    if (b.call) return `<div class="callout ${b.call.k || ''}"><b>${esc(b.call.t)}</b> ${b.call.p}</div>`;
    return '';
  }).join('');
}

function stepLesson(stage, s) {
  const card = el('div', 'card');
  card.innerHTML = `<h2>${esc(s.title)}</h2>${blocksToHtml(s.body)}`;
  stage.appendChild(card);
  const cta = el('div', 'cta');
  const b = el('button', 'btn', s.cta || 'Got it →');
  b.onclick = () => { buzz(6); nextStep(10); };
  cta.appendChild(b);
  stage.appendChild(cta);
}

/* ---------- quiz ---------- */
function stepQuiz(stage, s) {
  const card = el('div', 'card');
  card.innerHTML = `<div class="kicker">Quick check</div><h2>${s.q}</h2>`;
  const box = el('div', 'choices');
  const letters = 'ABCD';
  let answered = false;

  s.choices.forEach((txt, k) => {
    const b = el('button', 'choice', `<span class="ltr">${letters[k]}</span><span>${txt}</span>`);
    b.onclick = () => {
      if (answered) return;
      answered = true;
      const right = k === s.a;
      box.querySelectorAll('.choice').forEach((n, j) => {
        n.disabled = true;
        if (j === s.a) n.classList.add(right && j === k ? 'right' : 'reveal');
        if (j === k && !right) n.classList.add('wrong');
      });
      resolve(right, s.why, card, right ? 25 : 0);
    };
    box.appendChild(b);
  });
  card.appendChild(box);
  stage.appendChild(card);
  stage.appendChild(el('div', 'cta')); // filled in by resolve()
}

/* ---------- build (tap-to-assemble command) ---------- */
function stepBuild(stage, s) {
  const card = el('div', 'card');
  card.innerHTML = `<div class="kicker">Build the command</div><h2>${s.brief}</h2>` +
    (s.hint ? `<p style="color:var(--dim);font-size:14px">${s.hint}</p>` : '');

  const line = el('div', 'cmdline');
  const chips = el('div', 'chips');
  const tools = el('div', 'builder-tools');
  const picked = [];
  let answered = false;

  const pool = shuffle([...new Set([...s.answer, ...(s.chips || [])])]);

  function drawLine() {
    line.innerHTML = '<span class="prompt">$</span>';
    picked.forEach((tok, k) => {
      const t = el('button', 'tok', esc(tok));
      t.onclick = () => { if (answered) return; buzz(5); picked.splice(k, 1); drawLine(); drawChips(); };
      line.appendChild(t);
    });
    if (!answered) line.appendChild(el('span', 'caret'));
    check.disabled = picked.length === 0;
  }
  function drawChips() {
    chips.innerHTML = '';
    const counts = {};
    picked.forEach(p => counts[p] = (counts[p] || 0) + 1);
    const seen = {};
    pool.forEach(tok => {
      seen[tok] = (seen[tok] || 0) + 1;
      const c = el('button', 'chip' + (counts[tok] >= seen[tok] ? ' used' : ''), esc(tok));
      c.onclick = () => { if (answered) return; buzz(5); picked.push(tok); drawLine(); drawChips(); };
      chips.appendChild(c);
    });
  }

  const undo = el('button', 'mini-btn', '⌫ Undo');
  undo.onclick = () => { if (answered || !picked.length) return; buzz(5); picked.pop(); drawLine(); drawChips(); };
  const clr = el('button', 'mini-btn', '✕ Clear');
  clr.onclick = () => { if (answered) return; buzz(5); picked.length = 0; drawLine(); drawChips(); };
  tools.append(undo, clr);

  const check = el('button', 'btn');
  check.textContent = 'Run it ▸';
  check.disabled = true;
  check.onclick = () => {
    if (answered) return;
    const right = picked.join(' ') === s.answer.join(' ');
    if (!right && cur.misses < 99) {
      line.classList.add('bad'); buzz([30, 40, 30]);
      setTimeout(() => line.classList.remove('bad'), 400);
      cur.streak = 0; updCombo();
      cur.misses++;
      if (cur.misses % 2 === 0 && !card.querySelector('.hint-note')) {
        const h = el('div', 'callout hint-note', `<b>Hint</b> ${s.hint2 || 'It starts with <code>' + esc(s.answer[0] + ' ' + (s.answer[1] || '')) + '</code>.'}`);
        card.insertBefore(h, line);
      }
      const gv = el('button', 'mini-btn', '👀 Show answer');
      if (cur.misses >= 3 && !tools.querySelector('.give')) {
        gv.className = 'mini-btn give';
        gv.onclick = () => { answered = true; picked.length = 0; picked.push(...s.answer); drawLine(); line.classList.add('ok'); resolve(false, s.why, card, 0); };
        tools.appendChild(gv);
      }
      return;
    }
    answered = true;
    line.classList.add('ok');
    drawLine();
    resolve(true, s.why, card, 30);
  };

  card.append(line, chips, tools);
  stage.appendChild(card);
  const cta = el('div', 'cta'); cta.appendChild(check); stage.appendChild(cta);
  drawLine(); drawChips();
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- shared answer resolution ---------- */
function resolve(right, why, card, gain) {
  if (right) { cur.streak++; if (cur.streak > state.bestStreak) { state.bestStreak = cur.streak; } buzz(12); }
  else { cur.streak = 0; }
  updCombo();

  const bonus = right && cur.streak >= 3 ? 10 : 0;
  const fb = el('div', 'feedback ' + (right ? 'good' : 'bad'));
  fb.innerHTML = `<b>${right ? (cur.streak >= 3 ? `🔥 ${cur.streak} in a row! +${gain + bonus} XP` : `✓ Correct  +${gain} XP`) : '✗ Not quite'}</b>${why}`;
  card.appendChild(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  let cta = $('#stage').querySelector('.cta');
  if (!cta) { cta = el('div', 'cta'); $('#stage').appendChild(cta); }
  cta.innerHTML = '';
  const n = el('button', 'btn', 'Continue →');
  n.onclick = () => { buzz(6); nextStep(gain + bonus); };
  cta.appendChild(n);
  save();
}

/* ---------- finish ---------- */
function finishNode() {
  const { track, node, xp } = cur;
  const prev = state.done[node.id];
  const best = Math.max(prev?.xp || 0, xp);
  const fresh = !prev;
  const delta = best - (prev?.xp || 0);
  state.done[node.id] = { xp: best };
  state.xp += delta;
  save();

  const stage = $('#stage');
  $('#play-progress').style.width = '100%';
  stage.innerHTML = '';
  const total = nodesOf(track).length, dn = doneCount(track);
  const trackDone = dn === total;

  const c = el('div', 'complete');
  c.innerHTML = `
    <div class="big">${trackDone ? '👑' : fresh ? '🏆' : '⚡'}</div>
    <h2>${trackDone ? 'Track complete!' : fresh ? 'Level cleared' : 'Replayed'}</h2>
    <p>${trackDone ? `You finished every level in ${esc(track.name)}. That is genuinely expert territory.`
      : `<b>${esc(node.name)}</b> is in the bag.`}</p>
    <div class="score-grid">
      <div><b>+${delta}</b><span>XP gained</span></div>
      <div><b>${state.xp}</b><span>Total XP</span></div>
      <div><b>${dn}/${total}</b><span>Track</span></div>
    </div>`;

  const nextNode = nodesOf(track).find(n => !state.done[n.id]);
  const b1 = el('button', 'btn', nextNode ? `Next: ${nextNode.name} →` : 'Back to tracks');
  b1.onclick = () => { buzz(8); nextNode ? playNode(track, nextNode) : (renderHome(), show('home')); };
  const b2 = el('button', 'btn sec', 'Level map');
  b2.style.marginTop = '10px';
  b2.onclick = () => { buzz(6); openTrack(track); };
  c.append(b1, b2);
  stage.appendChild(c);

  if (fresh) { confetti(); buzz([15, 50, 15]); }
  if (trackDone) toast('👑 ' + track.name + ' mastered');
  renderHome();
}

/* ============================================================
   REFERENCE SCREENS
   ============================================================ */
function openReader(title, sub, groups) {
  $('#reader-title').textContent = title;
  $('#reader-sub').textContent = sub;
  const body = $('#reader-body'); body.innerHTML = '';
  groups.forEach(g => {
    body.appendChild(el('h3', 'reader-h', esc(g.group)));
    g.items.forEach(it => {
      const d = el('div', 'gl-item');
      d.innerHTML = `<h4>${esc(it.term)}</h4><p>${it.def}</p>` + (it.cmd ? `<div class="gl-cmd">${esc(it.cmd)}</div>` : '');
      body.appendChild(d);
    });
  });
  show('reader');
}

/* ============================================================
   WIRE UP
   ============================================================ */
document.querySelectorAll('[data-back]').forEach(b => {
  b.onclick = () => {
    buzz(6);
    const to = b.dataset.back;
    if (to === 'levels' && curTrack) openTrack(curTrack);
    else { renderHome(); show('home'); }
  };
});
$('#btn-glossary').onclick = () => { buzz(8); openReader('Glossary', 'Every term, plain English', GLOSSARY); };
$('#btn-cheats').onclick = () => { buzz(8); openReader('Cheat sheet', 'The commands that actually matter', CHEATS); };
$('#btn-reset').onclick = () => {
  if (!confirm('Wipe all XP and progress? This cannot be undone.')) return;
  state.xp = 0; state.bestStreak = 0; state.done = {}; save(); renderHome(); toast('Progress reset');
};

renderHome();
show('home');

// Offline support in production only — a service worker during local dev
// just serves you yesterday's code and wastes an afternoon.
if ('serviceWorker' in navigator && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
