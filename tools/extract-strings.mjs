// Pull every player-facing string out of the app so the copy linters can read it.
// Writes build/strings/<source>.md (one string per block, keyed by an HTML
// comment Vale ignores) and build/strings/index.json (line -> key -> text).
//
// Code is not copy: build answers, terminal blocks, diagrams, <code> spans,
// ids, URLs and commands are left out, so a command like `git log --oneline`
// never trips a prose rule.
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as acorn from 'acorn';
import * as walkAst from 'acorn-walk';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'build', 'strings');

// Keys whose values are code, ids or styling - never prose.
const SKIP = new Set(['id', 'ico', 'emoji', 'glow', 'answer', 'chips', 'term', 'svg', 'cmd', 'url', 'also',
  'line', 'target', 'keys', 'cursor', 'unit', 'pre', 'k', 'terms', 'track']);

const ENT = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
  '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&rarr;': '→', '&larr;': '←' };

export function toProse(html) {
  return String(html)
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, 'CODE')
    .replace(/<kbd[^>]*>[\s\S]*?<\/kbd>/gi, 'KEY')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, m => ENT[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

const isProse = s => /[A-Za-z]{2,}/.test(s) && /\s/.test(s.trim());

function walk(v, path, out) {
  if (typeof v === 'string') { const t = toProse(v); if (isProse(t)) out.push({ key: path, text: t }); return; }
  if (typeof v === 'function' || v == null) return;
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, out)); return; }
  if (typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, path ? `${path}.${k}` : k, out);
}

// Readable keys: "github > g-01 Git vs GitHub > step 2 quiz.why"
function trackStrings(tr) {
  const out = [];
  walk({ name: tr.name, desc: tr.desc, lead: tr.lead, time: tr.time }, tr.id, out);
  tr.chapters.forEach((ch, ci) => {
    walk({ title: ch.title, desc: ch.desc }, `${tr.id} > chapter ${ci + 1}`, out);
    ch.nodes.forEach(n => {
      walk({ name: n.name }, `${tr.id} > ${n.id}`, out);
      n.steps.forEach((s, si) => {
        walk(s, `${tr.id} > ${n.id} ${n.name} > step ${si + 1} ${s.t}`, out);
        // Sim actions can be a function of state; the starting set is what players see first.
        if (s.t === 'sim') {
          try {
            const acts = typeof s.actions === 'function' ? s.actions(s.init()) : [];
            walk(acts.map(a => a.label), `${tr.id} > ${n.id} > step ${si + 1} sim.actions`, out);
            walk(s.view(s.init()), `${tr.id} > ${n.id} > step ${si + 1} sim.view(start)`, out);
          } catch (_) { /* a sim that needs state we do not have: skip its dynamic copy */ }
        }
      });
    });
  });
  return out;
}

// app.js: quoted and template literals that read like sentences.
// app.js: string and template literals, found by parsing (a regex tokenizer
// desyncs on apostrophes inside templates). Template holes become "N".
function sourceStrings(file) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const out = [];
  const push = (raw, loc) => {
    if (/^[.#\[]|^[\w-]+$|querySelector/.test(raw.trim())) return;      // selectors, class names, keys
    const t = toProse(raw);
    const words = t.split(' ').filter(w => /^[A-Za-z][a-z'’]+[.,!?:]?$/.test(w));
    if (isProse(t) && words.length >= 2) out.push({ key: `${file}:${loc.start.line}`, text: t });
  };
  walkAst.simple(ast, {
    Literal(n) { if (typeof n.value === 'string') push(n.value, n.loc); },
    TemplateLiteral(n) { push(n.quasis.map(q => q.value.cooked ?? '').join('N'), n.loc); },
  });
  return out;
}

function htmlStrings(file) {
  const src = readFileSync(join(ROOT, file), 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const out = [];
  const lines = src.split('\n');
  lines.forEach((l, i) => {
    for (const a of l.matchAll(/(?:title|placeholder|aria-label|content)="([^"]+)"/g)) {
      const t = toProse(a[1]); if (isProse(t)) out.push({ key: `${file}:${i + 1} attr`, text: t });
    }
    const t = toProse(l.replace(/<!--[\s\S]*?-->/g, ''));
    if (isProse(t)) out.push({ key: `${file}:${i + 1}`, text: t });
  });
  return out;
}

export async function extract() {
  const { TRACKS } = await import(join(ROOT, 'data', 'tracks.js'));
  const { GLOSSARY, CHEATS } = await import(join(ROOT, 'data', 'reference.js'));
  const groups = {};
  for (const tr of TRACKS) groups['track-' + tr.id] = trackStrings(tr);
  const g = []; walk(GLOSSARY, 'glossary', g); groups.glossary = g;
  const c = []; walk(CHEATS, 'cheats', c); groups.cheats = c;
  groups.app = sourceStrings('app.js');
  groups.html = htmlStrings('index.html');
  return groups;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const groups = await extract();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const index = [];
  let total = 0;
  for (const [name, items] of Object.entries(groups)) {
    const file = name + '.md';
    let body = '', line = 1;
    for (const it of items) {
      body += `<!-- ${it.key.replace(/--/g, '- -')} -->\n`;
      line++;
      index.push({ file, line, key: it.key, text: it.text });
      body += it.text + '\n\n';
      line += 2;
    }
    writeFileSync(join(OUT, file), body);
    total += items.length;
  }
  writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`extracted ${total} strings from ${Object.keys(groups).length} sources into build/strings/`);
}
