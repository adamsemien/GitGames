/* ============================================================
   GitGames — engine
   Tracks live in ./data/*.js and are registered in ./data/tracks.js
   Adding a track = add a file + one line in tracks.js. Nothing here changes.
   ============================================================ */
import { TRACKS } from './data/tracks.js';
import { GLOSSARY, CHEATS } from './data/reference.js';

/* ============================================================
   STATE
   ============================================================ */
const KEY = 'gitgames.v3';
const OLD_KEY = 'gitgames.v2';
const state = load();

function blank() { return { xp: 0, bestStreak: 0, done: {}, misses: {}, lastSeen: {} }; }

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.done) return Object.assign(blank(), s);
  } catch (_) {}
  try { // one-time migration from the pre-review save format
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old && old.done) return Object.assign(blank(), old);
  } catch (_) {}
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

const RANKS = [
  [0, 'Rookie'], [150, 'Committer'], [400, 'Brancher'], [800, 'Merger'],
  [1300, 'Rebaser'], [1900, 'Maintainer'], [2600, 'Git Wizard'], [3600, 'Legend']
];
const rank = xp => RANKS.reduce((a, r) => xp >= r[0] ? r[1] : a, 'Rookie');

const DAY = 864e5;
const STALE_AFTER = 4 * DAY; // a cleared level becomes review-eligible again after this

/* ============================================================
   DOM HELPERS
   ============================================================ */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };
const hasKeyboard = () => window.matchMedia('(pointer:fine)').matches;
const stripTags = h => String(h).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
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

/* ============================================================
   INDEXES — built once from the track data
   ============================================================ */
const nodesOf = tr => tr.chapters.flatMap(c => c.nodes);
const doneCount = tr => nodesOf(tr).filter(n => state.done[n.id]).length;
const trackXp = tr => nodesOf(tr).reduce((a, n) => a + (state.done[n.id]?.xp || 0), 0);

const NODE_INDEX = new Map(); // nodeId -> {node, track, chapter}
TRACKS.forEach(track => track.chapters.forEach(chapter => chapter.nodes.forEach(node => {
  NODE_INDEX.set(node.id, { node, track, chapter });
})));

/* glossary lookup, longest term first so "pull request" wins over "pull" */
const TERMS = new Map();
GLOSSARY.forEach(g => g.items.forEach(it => {
  TERMS.set(it.term.toLowerCase(), it);
  (it.also || []).forEach(alias => TERMS.set(alias.toLowerCase(), it));
}));
const TERM_KEYS = [...TERMS.keys()].sort((a, b) => b.length - a.length);

/* search index */
const SEARCH_INDEX = [];
NODE_INDEX.forEach(({ node, track, chapter }) => {
  const text = node.steps.map(s => {
    if (s.t === 'lesson') return s.title + ' ' + stripTags(s.body.map(b =>
      b.p || b.h || (b.ul || []).join(' ') || (b.call ? b.call.t + ' ' + b.call.p : '') || '').join(' '));
    if (s.t === 'quiz') return stripTags(s.q + ' ' + s.choices.join(' ') + ' ' + s.why);
    if (s.t === 'keys') return stripTags(s.goal + ' ' + s.line + ' ' + (s.keys || []).join(' ') + ' ' + s.reveal + ' ' + s.why);
    return stripTags(s.brief + ' ' + s.answer.join(' ') + ' ' + s.why);
  }).join(' ');
  SEARCH_INDEX.push({ kind: 'level', id: node.id, title: node.name, sub: track.name + ' · ' + chapter.title, ico: node.ico, text: (node.name + ' ' + text).toLowerCase(), raw: text });
});
GLOSSARY.forEach(g => g.items.forEach(it => {
  SEARCH_INDEX.push({ kind: 'term', id: it.term, title: it.term, sub: 'Glossary · ' + g.group, ico: '📖', text: (it.term + ' ' + stripTags(it.def)).toLowerCase(), raw: stripTags(it.def) });
}));

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  $('#stat-xp').textContent = state.xp;
  $('#stat-rank').textContent = rank(state.xp);
  $('#stat-done').textContent = Object.keys(state.done).length;
  $('#stat-streak').textContent = state.bestStreak;

  const due = reviewPool().length;
  const badge = $('#review-badge');
  badge.hidden = due === 0;
  badge.textContent = due > 99 ? '99+' : due;
  $('#review-sub').textContent = due === 0
    ? (Object.keys(state.done).length ? 'All caught up' : 'Clear a level to unlock')
    : due + (due === 1 ? ' question due' : ' questions due');
  $('#btn-review').classList.toggle('armed', due > 0);

  const list = $('#track-list');
  list.innerHTML = '';
  TRACKS.forEach(tr => {
    const total = nodesOf(tr).length, dn = doneCount(tr);
    const card = el('button', 'track-card');
    card.style.setProperty('--glow', tr.glow);
    card.innerHTML = `
      <div class="tc-top"><span class="tc-emoji">${tr.emoji}</span><span class="tc-name">${esc(tr.name)}</span></div>
      <p class="tc-desc">${esc(tr.desc)}</p>
      <div class="tc-meta">
        <span class="pill">${total} levels</span>
        <span class="pill">${esc(tr.time)}</span>
        <span>${dn === total ? '✓ complete' : dn ? dn + ' complete' : 'Not started'}</span>
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
   cur.steps is [{step, key}] so review sessions can mix steps
   from different levels while still clearing the right misses.
   ============================================================ */
let cur = null;

function playNode(tr, node) {
  cur = {
    track: tr, node, review: false,
    steps: node.steps.map((step, i) => ({ step, key: node.id + '#' + i })),
    i: 0, xp: 0, streak: 0, misses: 0
  };
  $('#play-title').textContent = node.name;
  $('#play-sub').textContent = tr.name;
  startPlay();
}

function playReview() {
  const pool = reviewPool();
  if (!pool.length) return toast('Nothing due — go clear a level');
  const picked = pool.slice(0, 10);
  cur = { track: null, node: null, review: true, steps: picked, i: 0, xp: 0, streak: 0, misses: 0 };
  $('#play-title').textContent = 'Review';
  $('#play-sub').textContent = picked.length + ' question' + (picked.length === 1 ? '' : 's') + ' from your weak spots';
  startPlay();
}

function startPlay() { updCombo(); show('play'); renderStep(); }

function updCombo() {
  const c = $('#combo');
  c.querySelector('b').textContent = cur ? cur.streak : 0;
  c.classList.toggle('hot', cur && cur.streak >= 3);
}

function releaseKeys() {
  if (cur && cur.keyHandler) { document.removeEventListener('keydown', cur.keyHandler, true); cur.keyHandler = null; }
}

function renderStep() {
  releaseKeys();
  const { steps, i } = cur;
  $('#play-progress').style.width = (i / steps.length * 100) + '%';
  const stage = $('#stage'); stage.innerHTML = '';
  if (i >= steps.length) return finishNode();
  const { step, key } = steps[i];
  cur.stepKey = key;
  ({ lesson: stepLesson, quiz: stepQuiz, build: stepBuild, keys: stepKeys })[step.t](stage, step);
  window.scrollTo(0, 0);
}

function nextStep(gain) { cur.xp += gain || 0; cur.i++; renderStep(); }

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
  linkTerms(card);
  stage.appendChild(card);
  const cta = el('div', 'cta');
  const b = el('button', 'btn', s.cta || 'Got it →');
  b.onclick = () => { buzz(6); nextStep(10); };
  cta.appendChild(b);
  stage.appendChild(cta);
}

/* ---------- auto-linked vocabulary ----------
   Walks text nodes only, skipping code / terminal / diagram content, and
   links the FIRST occurrence of each glossary term per lesson. */
function linkTerms(root) {
  const used = new Set();
  const SKIP_TAG = new Set(['CODE', 'PRE', 'A', 'BUTTON', 'SVG', 'TEXT', 'SCRIPT', 'STYLE']);
  const SKIP_CLASS = ['termbox', 'diagram', 'gl-cmd'];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      for (let p = n.parentNode; p && p !== root; p = p.parentNode) {
        if (SKIP_TAG.has(p.nodeName.toUpperCase())) return NodeFilter.FILTER_REJECT;
        if (p.classList && SKIP_CLASS.some(c => p.classList.contains(c))) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const texts = []; let t;
  while ((t = walker.nextNode())) texts.push(t);

  // Word boundaries only where the term actually starts/ends with a word
  // character — otherwise `$PATH`, `~/.zshrc` and `.gitignore` never match.
  const pattern = t => (/^\w/.test(t) ? '\\b' : '') + escRe(t) + (/\w$/.test(t) ? '\\b' : '');

  texts.forEach(textNode => {
    const text = textNode.nodeValue;

    // Collect every candidate first, then apply right-to-left. Scanning
    // forwards and advancing past each hit silently drops any shorter term
    // that sits earlier in the sentence — "zsh" always lost to "bash".
    const found = [];
    for (const term of TERM_KEYS) {
      if (used.has(term)) continue;
      const m = text.match(new RegExp(pattern(term), 'i'));
      if (m) found.push({ term, start: m.index, end: m.index + m[0].length, hit: m[0] });
    }
    found.sort((a, b) => (b.end - b.start) - (a.end - a.start)); // longest wins an overlap
    const kept = [];
    for (const f of found) {
      if (kept.some(k => f.start < k.end && k.start < f.end)) continue;
      kept.push(f);
      used.add(f.term);
    }

    kept.sort((a, b) => b.start - a.start).forEach(f => {
      const rest = textNode.splitText(f.start);
      rest.nodeValue = rest.nodeValue.slice(f.hit.length);
      const btn = el('button', 'term');
      btn.type = 'button';
      btn.textContent = f.hit;
      btn.dataset.term = f.term;
      rest.parentNode.insertBefore(btn, rest);
    });
  });
}

document.addEventListener('click', e => {
  const b = e.target.closest('.term');
  if (b) { buzz(5); openSheet(b.dataset.term); }
  if (e.target.closest('[data-close-sheet]')) closeSheet();
});

let sheetTimer = null;
function openSheet(termKey) {
  const it = TERMS.get(termKey);
  if (!it) return;
  clearTimeout(sheetTimer);            // cancel a close still in flight
  $('#sheet-term').textContent = it.term;
  $('#sheet-def').innerHTML = it.def;
  const cmd = $('#sheet-cmd');
  cmd.hidden = !it.cmd;
  if (it.cmd) cmd.textContent = it.cmd;
  // App and tool entries can carry a homepage — shown here rather than inline
  // in a lesson, so a definition never yanks you out of the level.
  const link = $('#sheet-link');
  link.hidden = !it.url;
  if (it.url) { link.href = it.url; link.textContent = it.url.replace(/^https?:\/\//, '') + ' ↗'; }
  const s = $('#sheet');
  s.hidden = false;
  // Forcing a reflow gives the transition its start state synchronously.
  // requestAnimationFrame does NOT fire in a backgrounded tab — using it here
  // left the sheet shown-but-not-open: an invisible full-screen click blocker.
  void s.offsetHeight;
  s.classList.add('open');
}
function closeSheet() {
  const s = $('#sheet');
  if (s.hidden) return;
  clearTimeout(sheetTimer);
  s.classList.remove('open');
  sheetTimer = setTimeout(() => { s.hidden = true; }, 220);
}
$('#sheet-glossary').onclick = () => { closeSheet(); openGlossary(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

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
  stage.appendChild(el('div', 'cta'));
}

/* ---------- build: tap chips OR type, interchangeably ---------- */
function stepBuild(stage, s) {
  const card = el('div', 'card');
  card.innerHTML = `<div class="kicker">Build the command</div><h2>${s.brief}</h2>` +
    (s.hint ? `<p class="build-hint">${s.hint}</p>` : '');

  const line = el('div', 'cmdline');
  const chips = el('div', 'chips');
  const tools = el('div', 'builder-tools');
  const picked = [];
  let answered = false;

  const pool = shuffle([...new Set([...s.answer, ...(s.chips || [])])]);

  const input = document.createElement('input');
  input.className = 'cmdinput';
  input.type = 'text';
  input.autocapitalize = 'none';
  input.autocorrect = 'off';
  input.spellcheck = false;
  input.enterKeyHint = 'go';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-label', 'Type the command, or tap the tokens below');

  const commit = () => {
    const v = input.value.trim();
    if (!v) return false;
    v.split(/\s+/).forEach(tok => picked.push(tok));
    input.value = '';
    drawLine(); drawChips();
    return true;
  };

  input.addEventListener('keydown', e => {
    if (answered) return;
    if (e.key === ' ') { if (input.value.trim()) { e.preventDefault(); commit(); } }
    else if (e.key === 'Enter') { e.preventDefault(); commit(); submit(); }
    else if (e.key === 'Tab') {
      const v = input.value.trim();
      if (!v) return;
      const hits = pool.filter(t => t.toLowerCase().startsWith(v.toLowerCase()));
      if (hits.length === 1) { e.preventDefault(); input.value = hits[0]; commit(); }
      else if (hits.length > 1) { e.preventDefault(); toast(hits.slice(0, 6).join('   ')); }
    }
    else if (e.key === 'Backspace' && !input.value && picked.length) {
      e.preventDefault(); picked.pop(); drawLine(); drawChips();
    }
  });
  input.addEventListener('input', () => {
    if (/\s/.test(input.value)) commit();          // handles paste
    check.disabled = !(picked.length || input.value.trim());
  });

  function drawLine() {
    const focused = document.activeElement === input;
    line.innerHTML = '<span class="prompt">$</span>';
    picked.forEach((tok, k) => {
      const t = el('button', 'tok', esc(tok));
      t.type = 'button';
      t.title = 'Remove';
      t.onclick = () => { if (answered) return; buzz(5); picked.splice(k, 1); drawLine(); drawChips(); };
      line.appendChild(t);
    });
    if (!answered) {
      line.appendChild(input);
      input.placeholder = picked.length ? '' : (hasKeyboard() ? 'type here, or tap below' : 'tap below, or type');
      if (focused) input.focus();
    }
    check.disabled = !(picked.length || input.value.trim());
  }

  function drawChips() {
    chips.innerHTML = '';
    const counts = {};
    picked.forEach(p => counts[p] = (counts[p] || 0) + 1);
    const seen = {};
    pool.forEach(tok => {
      seen[tok] = (seen[tok] || 0) + 1;
      const c = el('button', 'chip' + (counts[tok] >= seen[tok] ? ' used' : ''), esc(tok));
      c.type = 'button';
      c.onclick = () => { if (answered) return; buzz(5); picked.push(tok); drawLine(); drawChips(); };
      chips.appendChild(c);
    });
  }

  const undo = el('button', 'mini-btn', '⌫ Undo');
  undo.onclick = () => { if (answered || !picked.length) return; buzz(5); picked.pop(); drawLine(); drawChips(); };
  const clr = el('button', 'mini-btn', '✕ Clear');
  clr.onclick = () => { if (answered) return; buzz(5); picked.length = 0; input.value = ''; drawLine(); drawChips(); };
  tools.append(undo, clr);

  const check = el('button', 'btn');
  check.textContent = 'Run it ▸';
  check.disabled = true;

  function submit() {
    if (answered) return;
    commit();
    if (!picked.length) return;
    const right = picked.join(' ') === s.answer.join(' ');
    if (!right) {
      line.classList.add('bad'); buzz([30, 40, 30]);
      setTimeout(() => line.classList.remove('bad'), 400);
      cur.streak = 0; updCombo();
      cur.misses++;
      recordMiss();
      if (cur.misses % 2 === 0 && !card.querySelector('.hint-note')) {
        const h = el('div', 'callout hint-note',
          `<b>Hint</b> ${s.hint2 || 'It starts with <code>' + esc(s.answer.slice(0, 2).join(' ')) + '</code>.'}`);
        card.insertBefore(h, line);
      }
      if (cur.misses >= 3 && !tools.querySelector('.give')) {
        const gv = el('button', 'mini-btn give', '👀 Show answer');
        gv.onclick = () => {
          answered = true;
          picked.length = 0; picked.push(...s.answer);
          drawLine(); line.classList.add('ok');
          resolve(false, s.why, card, 0);
        };
        tools.appendChild(gv);
      }
      return;
    }
    answered = true;
    line.classList.add('ok');
    drawLine();
    resolve(true, s.why, card, 30);
  }
  check.onclick = submit;

  card.append(line, chips, tools);
  stage.appendChild(card);
  const cta = el('div', 'cta'); cta.appendChild(check); stage.appendChild(cta);
  drawLine(); drawChips();
  if (hasKeyboard()) setTimeout(() => input.focus(), 60);
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ============================================================
   KEYS — the line simulator ("keystroke golf")
   A real readline-ish model of the command line. Press the actual
   chords on a desktop, tap the same chords on a phone; both drive
   one state machine. Scored against par, so it measures speed
   rather than recall.
   ============================================================ */
const ALNUM = /[A-Za-z0-9]/;

/* Option on macOS emits a symbol (⌥d → "∂"), so fall back to the physical key. */
function chordOf(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.metaKey) parts.push('meta');
  let k = e.key;
  if (e.altKey && /^Key[A-Z]$/.test(e.code)) k = e.code.slice(3);
  else if (e.altKey && e.code === 'Period') k = '.';
  parts.push(k.toLowerCase());
  return parts.join('+');
}

const KEYMAP = {
  'ctrl+a': 'home', 'ctrl+e': 'end',
  'ctrl+b': 'left', 'ctrl+f': 'right',
  'arrowleft': 'left', 'arrowright': 'right',
  'alt+arrowleft': 'wordLeft', 'alt+arrowright': 'wordRight',
  'alt+b': 'wordLeft', 'alt+f': 'wordRight',
  'backspace': 'backspace', 'ctrl+h': 'backspace',
  'ctrl+d': 'delChar',
  'ctrl+w': 'killWordBack', 'alt+backspace': 'killWordAlnum', 'alt+d': 'killWordFwd',
  'ctrl+u': 'killToStart', 'ctrl+k': 'killToEnd',
  'ctrl+y': 'yank', 'ctrl+t': 'transpose',
  'arrowup': 'histPrev', 'arrowdown': 'histNext',
  'ctrl+r': 'searchStart', 'ctrl+g': 'abort', 'alt+.': 'lastArg'
};

/* Label → action, for the on-screen keypad (phones have no Ctrl key). */
const KEYPAD = {
  '⌃A': 'home', '⌃E': 'end', '⌃B': 'left', '⌃F': 'right',
  '←': 'left', '→': 'right', '⌫': 'backspace', '⌃D': 'delChar',
  '⌥←': 'wordLeft', '⌥→': 'wordRight',
  '⌃W': 'killWordBack', '⌥⌫': 'killWordAlnum', '⌥D': 'killWordFwd',
  '⌃U': 'killToStart', '⌃K': 'killToEnd',
  '⌃Y': 'yank', '⌃T': 'transpose',
  '↑': 'histPrev', '↓': 'histNext', '⌃R': 'searchStart', '⌃G': 'abort', '⌥.': 'lastArg'
};

function applyAction(st, act) {
  const s = { ...st };
  const L = s.line, c = s.cursor;

  // ⌃W is whitespace-delimited (bash's unix-word-rubout); ⌥⌫ stops at any
  // non-alphanumeric. That difference is the whole point of one of the levels.
  const backTo = (from, alnumOnly) => {
    let i = from;
    if (alnumOnly) { while (i > 0 && !ALNUM.test(L[i - 1])) i--; while (i > 0 && ALNUM.test(L[i - 1])) i--; }
    else { while (i > 0 && L[i - 1] === ' ') i--; while (i > 0 && L[i - 1] !== ' ') i--; }
    return i;
  };
  const fwdTo = from => {
    let i = from;
    while (i < L.length && !ALNUM.test(L[i])) i++;
    while (i < L.length && ALNUM.test(L[i])) i++;
    return i;
  };

  switch (act) {
    case 'home': s.cursor = 0; break;
    case 'end': s.cursor = L.length; break;
    case 'left': s.cursor = Math.max(0, c - 1); break;
    case 'right': s.cursor = Math.min(L.length, c + 1); break;
    case 'wordLeft': s.cursor = backTo(c, true); break;
    case 'wordRight': s.cursor = fwdTo(c); break;
    case 'backspace': if (c > 0) { s.line = L.slice(0, c - 1) + L.slice(c); s.cursor = c - 1; } break;
    case 'delChar': if (c < L.length) s.line = L.slice(0, c) + L.slice(c + 1); break;
    case 'killWordBack': case 'killWordAlnum': {
      const i = backTo(c, act === 'killWordAlnum');
      if (i === c) break;
      s.kill = L.slice(i, c); s.line = L.slice(0, i) + L.slice(c); s.cursor = i; break;
    }
    case 'killWordFwd': { const j = fwdTo(c); if (j === c) break; s.kill = L.slice(c, j); s.line = L.slice(0, c) + L.slice(j); break; }
    case 'killToStart': if (c) { s.kill = L.slice(0, c); s.line = L.slice(c); s.cursor = 0; } break;
    case 'killToEnd': if (c < L.length) { s.kill = L.slice(c); s.line = L.slice(0, c); } break;
    case 'yank': if (s.kill) { s.line = L.slice(0, c) + s.kill + L.slice(c); s.cursor = c + s.kill.length; } break;
    case 'transpose': {
      const i = Math.min(c, L.length - 1);
      if (i > 0) { s.line = L.slice(0, i - 1) + L[i] + L[i - 1] + L.slice(i + 1); s.cursor = Math.min(L.length, i + 1); }
      break;
    }
    case 'histPrev':
      if (s.history.length) {
        if (s.histIdx < 0) s.saved = L;
        s.histIdx = Math.min(s.history.length - 1, s.histIdx + 1);
        s.line = s.history[s.histIdx]; s.cursor = s.line.length;
      }
      break;
    case 'histNext':
      if (s.history.length && s.histIdx >= 0) {
        s.histIdx--;
        s.line = s.histIdx < 0 ? (s.saved || '') : s.history[s.histIdx];
        s.cursor = s.line.length;
      }
      break;
    case 'searchStart': s.mode = 'search'; s.search = ''; s.saved = L; break;
    case 'abort':
      if (s.mode === 'search') { s.mode = null; s.search = ''; s.line = s.saved || ''; s.cursor = s.line.length; }
      break;
    case 'lastArg': {
      const h = s.history[0];
      if (h) { const p = h.trim().split(/\s+/); const last = p[p.length - 1]; s.line = L.slice(0, c) + last + L.slice(c); s.cursor = c + last.length; }
      break;
    }
  }
  return s;
}

function searchMatch(st) {
  if (!st.search) return st.saved || '';
  return st.history.find(h => h.includes(st.search)) || st.line;
}

function stepKeys(stage, s) {
  const card = el('div', 'card');
  card.innerHTML = `<div class="kicker">Keystroke golf</div><h2>${s.goal}</h2>` +
    (s.hint ? `<p class="build-hint">${s.hint}</p>` : '');

  let st = {
    line: s.line, cursor: s.cursor == null ? s.line.length : s.cursor,
    kill: '', history: s.history || [], histIdx: -1, saved: '', mode: null, search: ''
  };
  const start = { ...st };
  let presses = 0, done = false;

  const sim = el('div', 'keysim');
  const lineEl = el('div', 'ksline');
  const meta = el('div', 'ksmeta');
  const goalEl = el('div', 'kstarget');
  const pad = el('div', 'keypad');
  const tools = el('div', 'builder-tools');

  // Trailing spaces are load-bearing here (⌃W leaves one behind) but invisible,
  // so show them explicitly in the goal.
  goalEl.innerHTML = `<span>you want</span><code>${
    esc(s.target.line).replace(/ +$/, m => '␣'.repeat(m.length)) || '·empty line·'}</code>`;

  function draw() {
    const before = esc(st.line.slice(0, st.cursor));
    const at = st.line[st.cursor];
    const after = esc(st.line.slice(st.cursor + 1));
    const prompt = st.mode === 'search'
      ? `<span class="ksprompt search">(reverse-i-search)\`${esc(st.search)}':</span>`
      : `<span class="ksprompt">$</span>`;
    lineEl.innerHTML = prompt + `<span class="kstext">${before}<i class="kcur">${at ? esc(at) : '&nbsp;'}</i>${after}</span>`;
    meta.innerHTML = `<span class="par">PAR ${s.par}</span>` +
      `<span class="presses${presses > s.par ? ' over' : ''}">${presses} key${presses === 1 ? '' : 's'}</span>`;
  }

  function check() {
    if (done) return;
    const okLine = st.line === s.target.line;
    const okCur = s.target.cursor == null || st.cursor === s.target.cursor;
    if (!okLine || !okCur) return;
    done = true;
    detach();
    lineEl.classList.add('ok');
    const underPar = presses <= s.par;
    const note = underPar
      ? `<b class="par-hit">⛳️ Par ${s.par} — hit in ${presses}.</b> `
      : `<b class="par-miss">${presses} keystrokes; par is ${s.par}.</b> `;
    if (!underPar && presses > s.par + 4) recordMiss();
    resolve(true, note + s.why, card, underPar ? 40 : 25);
  }

  function fire(act, isChar, ch) {
    if (done) return;
    presses++;
    if (st.mode === 'search') {
      if (act === 'abort') st = applyAction(st, 'abort');
      else if (act === 'searchStart' || isChar) {
        if (isChar) st = { ...st, search: st.search + ch };
        st = { ...st, line: searchMatch(st) };
        st.cursor = st.line.length;
      } else if (act === 'backspace') {
        st = { ...st, search: st.search.slice(0, -1) };
        st = { ...st, line: searchMatch(st) };
        st.cursor = st.line.length;
      } else if (act === 'accept') { st = { ...st, mode: null, search: '' }; }
      else st = applyAction(st, act);
    } else if (isChar) {
      st = { ...st, line: st.line.slice(0, st.cursor) + ch + st.line.slice(st.cursor), cursor: st.cursor + 1 };
    } else if (act) {
      st = applyAction(st, act);
    } else { presses--; return; }
    buzz(4);
    draw();
    check();
  }

  const onKey = e => {
    if (done) return;
    const chord = chordOf(e);
    const act = KEYMAP[chord];
    const isChar = !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1;
    if (chord === 'enter' && st.mode === 'search') { e.preventDefault(); return fire('accept'); }
    if (!act && !isChar) return;
    e.preventDefault();
    fire(act, isChar, e.key);
  };
  function detach() { document.removeEventListener('keydown', onKey, true); if (cur) cur.keyHandler = null; }
  document.addEventListener('keydown', onKey, true);
  cur.keyHandler = onKey;

  // A label that is not a chord and is a single character becomes a letter key,
  // so ⌃R search is solvable on a phone, which has no keyboard here.
  (s.keys || Object.keys(KEYPAD)).forEach(label => {
    const act = KEYPAD[label];
    const isChar = !act && [...label].length === 1;
    if (!act && !isChar) return;
    const b = el('button', 'kbtn' + (isChar ? ' char' : ''), esc(label));
    b.type = 'button';
    b.onclick = () => fire(act, isChar, label);
    pad.appendChild(b);
  });

  const reset = el('button', 'mini-btn', '↺ Reset line');
  reset.onclick = () => { if (done) return; st = { ...start }; presses = 0; draw(); };
  const showMe = el('button', 'mini-btn', '👀 Show me');
  showMe.onclick = () => {
    if (done) return;
    if (!card.querySelector('.hint-note')) {
      card.insertBefore(el('div', 'callout hint-note', `<b>The chord</b> ${s.reveal}`), sim);
      recordMiss();
    }
  };
  tools.append(reset, showMe);

  sim.append(lineEl, meta);
  card.append(sim, goalEl, pad, tools);
  stage.appendChild(card);
  stage.appendChild(el('div', 'cta'));
  draw();
}

/* ---------- answer resolution + miss tracking ---------- */
function recordMiss() {
  const key = cur.stepKey;
  if (!key) return;
  const [nodeId, si] = key.split('#');
  const m = state.misses[key] || { n: 0, nodeId, si: +si };
  m.n++; m.ts = Date.now();
  state.misses[key] = m;
  save();
}
function clearMiss() {
  const key = cur.stepKey;
  if (key && state.misses[key]) { delete state.misses[key]; save(); }
}

function resolve(right, why, card, gain) {
  if (right) {
    cur.streak++;
    if (cur.streak > state.bestStreak) state.bestStreak = cur.streak;
    clearMiss();
    buzz(12);
  } else {
    cur.streak = 0;
    recordMiss();
  }
  updCombo();

  const bonus = right && cur.streak >= 3 ? 10 : 0;
  const fb = el('div', 'feedback ' + (right ? 'good' : 'bad'));
  fb.innerHTML = `<b>${right
    ? (cur.streak >= 3 ? `🔥 ${cur.streak} in a row! +${gain + bonus} XP` : `✓ Correct  +${gain} XP`)
    : '✗ Not quite'}</b>${why}`;
  card.appendChild(fb);
  linkTerms(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  let cta = $('#stage').querySelector('.cta');
  if (!cta) { cta = el('div', 'cta'); $('#stage').appendChild(cta); }
  cta.innerHTML = '';
  const n = el('button', 'btn', cur.i + 1 >= cur.steps.length ? 'Finish →' : 'Continue →');
  n.onclick = () => { buzz(6); nextStep(gain + bonus); };
  cta.appendChild(n);
  save();
}

/* ---------- finish ---------- */
function finishNode() {
  const stage = $('#stage');
  $('#play-progress').style.width = '100%';
  stage.innerHTML = '';

  if (cur.review) {
    const left = reviewPool().length;
    const c = el('div', 'complete');
    c.innerHTML = `
      <div class="big">🎯</div>
      <h2>Review done</h2>
      <p>${left ? `<b>${left}</b> still due. Little and often beats one long session.` : 'Nothing left due. That knowledge is sticking.'}</p>
      <div class="score-grid">
        <div><b>+${cur.xp}</b><span>XP gained</span></div>
        <div><b>${cur.steps.length}</b><span>Reviewed</span></div>
        <div><b>${left}</b><span>Still due</span></div>
      </div>`;
    state.xp += cur.xp;
    save();
    const b1 = el('button', 'btn', left ? 'Review more →' : 'Back to tracks');
    b1.onclick = () => { buzz(8); left ? playReview() : (renderHome(), show('home')); };
    const b2 = el('button', 'btn sec', 'Home');
    b2.style.marginTop = '10px';
    b2.onclick = () => { buzz(6); renderHome(); show('home'); };
    c.append(b1, b2);
    stage.appendChild(c);
    renderHome();
    return;
  }

  const { track, node, xp } = cur;
  const prev = state.done[node.id];
  const best = Math.max(prev?.xp || 0, xp);
  const fresh = !prev;
  const delta = best - (prev?.xp || 0);
  state.done[node.id] = { xp: best };
  state.lastSeen[node.id] = Date.now();
  state.xp += delta;
  save();

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
  const b1 = el('button', 'btn', nextNode ? `Next: ${esc(nextNode.name)} →` : 'Back to tracks');
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
   REVIEW POOL
   Missed questions first (most-missed first), then checks from
   levels you cleared a while ago. Lessons are never reviewed.
   ============================================================ */
function reviewPool() {
  const out = [];
  const seen = new Set();

  Object.entries(state.misses)
    .sort((a, b) => b[1].n - a[1].n || a[1].ts - b[1].ts)
    .forEach(([key, m]) => {
      const entry = NODE_INDEX.get(m.nodeId);
      const step = entry?.node.steps[m.si];
      if (!step || step.t === 'lesson') return;
      out.push({ step, key }); seen.add(key);
    });

  const now = Date.now();
  const stale = [];
  Object.keys(state.done).forEach(nodeId => {
    if ((now - (state.lastSeen[nodeId] || 0)) < STALE_AFTER) return;
    const entry = NODE_INDEX.get(nodeId);
    if (!entry) return;
    entry.node.steps.forEach((step, i) => {
      const key = nodeId + '#' + i;
      if (step.t === 'lesson' || seen.has(key)) return;
      stale.push({ step, key, ts: state.lastSeen[nodeId] || 0 });
    });
  });
  stale.sort((a, b) => a.ts - b.ts);
  return out.concat(stale);
}

/* ============================================================
   SEARCH
   ============================================================ */
function runSearch(q) {
  const box = $('#search-results');
  box.innerHTML = '';
  const term = q.trim().toLowerCase();
  if (term.length < 2) {
    box.appendChild(el('p', 'search-empty', 'Type at least two characters. Try <b>worktree</b>, <b>webhook</b>, <b>sandbox</b> or <b>rebase</b>.'));
    return;
  }
  const hits = SEARCH_INDEX
    .map(r => ({ r, i: r.text.indexOf(term) }))
    .filter(x => x.i >= 0)
    .sort((a, b) =>
      (a.r.title.toLowerCase().indexOf(term) === 0 ? -1 : 0) - (b.r.title.toLowerCase().indexOf(term) === 0 ? -1 : 0)
      || a.i - b.i)
    .slice(0, 40);

  $('#search-sub').textContent = hits.length ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : 'No results';
  if (!hits.length) {
    box.appendChild(el('p', 'search-empty', `Nothing matches “${esc(q)}”.`));
    return;
  }

  hits.forEach(({ r, i }) => {
    const start = Math.max(0, i - 42);
    const snippet = (start ? '…' : '') + r.raw.slice(start, start + 150) + (r.raw.length > start + 150 ? '…' : '');
    const b = el('button', 'result');
    b.innerHTML = `<span class="res-ico">${r.ico}</span>
      <span class="res-body"><b>${esc(r.title)}</b><i>${esc(r.sub)}</i><em>${esc(snippet)}</em></span>`;
    b.onclick = () => {
      buzz(6);
      if (r.kind === 'term') return openSheet(r.title.toLowerCase());
      const entry = NODE_INDEX.get(r.id);
      if (entry) { curTrack = entry.track; playNode(entry.track, entry.node); }
    };
    box.appendChild(b);
  });
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
      d.id = 'gl-' + it.term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      d.innerHTML = `<h4>${esc(it.term)}</h4><p>${it.def}</p>` + (it.cmd ? `<div class="gl-cmd">${esc(it.cmd)}</div>` : '');
      body.appendChild(d);
    });
  });
  show('reader');
}
const openGlossary = () => openReader('Glossary', GLOSSARY.reduce((a, g) => a + g.items.length, 0) + ' terms, plain English', GLOSSARY);

/* ---------- sync code ---------- */
function openSync() {
  $('#reader-title').textContent = 'Move progress';
  $('#reader-sub').textContent = 'Phone ⇄ desktop, no account needed';
  const body = $('#reader-body'); body.innerHTML = '';

  const payload = { v: 3, x: state.xp, s: state.bestStreak, d: state.done, m: state.misses, l: state.lastSeen };
  let code = '';
  try { code = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); } catch (_) {}

  body.appendChild(el('h3', 'reader-h', 'Export from this device'));
  const outBox = el('div', 'gl-item');
  outBox.innerHTML = `<p>Copy this code, then paste it into GitGames on your other device. It carries your XP, cleared levels and review history.</p>`;
  const ta = el('textarea', 'sync-box'); ta.readOnly = true; ta.value = code; ta.rows = 4;
  const copy = el('button', 'btn', '📋 Copy code');
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(code); toast('Copied'); }
    catch (_) { ta.select(); toast('Select and copy manually'); }
  };
  outBox.append(ta, copy);
  body.appendChild(outBox);

  body.appendChild(el('h3', 'reader-h', 'Import to this device'));
  const inBox = el('div', 'gl-item');
  inBox.innerHTML = `<p>Pasting merges with what is already here — it keeps the higher XP for any level you have cleared on both. Nothing is lost.</p>`;
  const inTa = el('textarea', 'sync-box'); inTa.rows = 4; inTa.placeholder = 'Paste your code here…';
  inTa.autocapitalize = 'none'; inTa.spellcheck = false;
  const imp = el('button', 'btn sec', '⬇︎ Import and merge');
  imp.onclick = () => {
    const v = inTa.value.trim();
    if (!v) return toast('Paste a code first');
    let data;
    try { data = JSON.parse(decodeURIComponent(escape(atob(v)))); }
    catch (_) { return toast('That does not look like a GitGames code'); }
    if (!data || typeof data !== 'object' || !data.d) return toast('That code is not valid');
    Object.entries(data.d).forEach(([id, rec]) => {
      if (!NODE_INDEX.has(id)) return;                       // ignore levels this build does not have
      const mine = state.done[id];
      const theirXp = Math.max(0, Math.min(500, +rec?.xp || 0));
      if (!mine || theirXp > mine.xp) state.done[id] = { xp: theirXp };
    });
    Object.entries(data.m || {}).forEach(([k, m]) => {
      if (NODE_INDEX.has(String(k).split('#')[0]) && !state.misses[k]) state.misses[k] = m;
    });
    Object.entries(data.l || {}).forEach(([id, ts]) => {
      if (NODE_INDEX.has(id)) state.lastSeen[id] = Math.max(state.lastSeen[id] || 0, +ts || 0);
    });
    state.bestStreak = Math.max(state.bestStreak, +data.s || 0);
    state.xp = Object.values(state.done).reduce((a, r) => a + (r.xp || 0), 0);
    save();
    renderHome();
    toast(`Merged — ${Object.keys(state.done).length} levels, ${state.xp} XP`);
    show('home');
  };
  inBox.append(inTa, imp);
  body.appendChild(inBox);

  show('reader');
}

/* ============================================================
   WIRE UP
   ============================================================ */
document.querySelectorAll('[data-back]').forEach(b => {
  b.onclick = () => {
    buzz(6);
    releaseKeys();
    const to = b.dataset.back;
    if (to === 'levels' && curTrack && !cur?.review) openTrack(curTrack);
    else { renderHome(); show('home'); }
  };
});
$('#btn-glossary').onclick = () => { buzz(8); openGlossary(); };
$('#btn-cheats').onclick = () => { buzz(8); openReader('Cheat sheet', 'The commands that actually matter', CHEATS); };
$('#btn-sync').onclick = () => { buzz(8); openSync(); };
$('#btn-review').onclick = () => { buzz(8); playReview(); };
$('#btn-search').onclick = () => {
  buzz(8); show('search'); runSearch('');
  if (hasKeyboard()) setTimeout(() => $('#search-input').focus(), 60);
};
$('#search-input').addEventListener('input', e => runSearch(e.target.value));
$('#btn-reset').onclick = () => {
  if (!confirm('Wipe all XP, progress and review history? This cannot be undone.')) return;
  Object.assign(state, blank());
  save(); renderHome(); toast('Progress reset');
};

renderHome();
show('home');

// Offline support in production only — a service worker during local dev
// just serves you yesterday's code and wastes an afternoon.
if ('serviceWorker' in navigator && !/^(localhost|127\.|\[::1\])/.test(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
