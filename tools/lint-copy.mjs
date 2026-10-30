// Copy gate. Pulls every player-facing string, runs Vale (house rules: no em
// dashes, no "it's not X, it's Y", no sparkles, consistent terms, no
// placeholder copy) and Harper (grammar), and reports by level.
//
// Vale is a RATCHET: tools/copy-baseline.json holds today's count per rule.
// New violations fail. Fixes pass and print how far the count dropped - run
// with --update-baseline in the same PR to lock the lower number in.
// Harper is ADVISORY: on this corpus it is mostly false positives on correct
// technical English ("stack trace", "out of date"), so it reports, never fails.
//
// Copy fixes proposed by an agent go through a PR. Nothing here rewrites copy.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'tools', 'copy-baseline.json');
const VALE = process.env.VALE_BIN || 'vale';
const update = process.argv.includes('--update-baseline');
const skipHarper = process.argv.includes('--no-harper');

execFileSync('node', [join(ROOT, 'tools', 'extract-strings.mjs')], { stdio: 'inherit' });
const index = JSON.parse(readFileSync(join(ROOT, 'build', 'strings', 'index.json'), 'utf8'));
const keyAt = (file, line) => {
  let best = null;
  for (const it of index) if (it.file === file && it.line <= line) best = it; else if (it.file === file && it.line > line) break;
  return best;
};

// ---- Vale --------------------------------------------------------------
function vale(paths) {
  try {
    return JSON.parse(execFileSync(VALE, ['--config', join(ROOT, '.vale.ini'), '--output=JSON', ...paths], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
  } catch (e) {
    if (e.stdout) return JSON.parse(e.stdout);                       // vale exits 1 when it finds errors
    throw e;
  }
}

// The canaries prove the rules still fire. A gate that never fails is unproven.
const canary = vale(['tests/copy/canary-bad.md', 'tests/copy/canary-good.md']);
// Every non-blank line of canary-bad must be caught; canary-good must be clean.
const badLines = readFileSync(join(ROOT, 'tests/copy/canary-bad.md'), 'utf8').split('\n')
  .map((l, i) => l.trim() ? i + 1 : 0).filter(Boolean);
const caught = new Set((canary['tests/copy/canary-bad.md'] || []).map(a => a.Line));
const missed = badLines.filter(n => !caught.has(n));
const good = (canary['tests/copy/canary-good.md'] || []).length;
if (missed.length || good !== 0) {
  console.error(`copy gate is broken: canary-bad lines not caught: [${missed.join(', ')}]; canary-good hits: ${good} (expected 0)`);
  process.exit(3);
}

const results = vale(['build/strings']);
const counts = {}, hits = [];
for (const [path, alerts] of Object.entries(results)) {
  const file = path.split('/').pop();
  for (const a of alerts) {
    counts[a.Check] = (counts[a.Check] || 0) + 1;
    const it = keyAt(file, a.Line);
    hits.push({ rule: a.Check, where: it ? it.key : `${file}:${a.Line}`, match: a.Match, message: a.Message });
  }
}

// ---- Harper (advisory) -------------------------------------------------
const harperHits = [];
if (!skipHarper) {
  const { LocalLinter, Dialect } = await import('harper.js');
  const { binaryInlined } = await import('harper.js/binaryInlined');
  // GitGames copy is written in British English today; set GITGAMES_DIALECT=American to switch.
  const linter = new LocalLinter({ binary: binaryInlined, dialect: Dialect[process.env.GITGAMES_DIALECT || 'British'] });
  await linter.setup();
  // Spelling, Style, Typo, Capitalization and Formatting are left out: they flag
  // tech vocabulary (zsh, reflog, Ghostty) and extraction artefacts, not grammar.
  const KEEP = new Set(['Agreement', 'Grammar', 'Repetition', 'Usage', 'Punctuation', 'Miscellaneous', 'Redundancy', 'WordChoice']);
  for (const it of index) {
    for (const l of await linter.lint(it.text, { language: 'plaintext' })) {
      if (!KEEP.has(l.lint_kind())) continue;
      const s = l.span();
      harperHits.push({ kind: l.lint_kind(), where: it.key, message: l.message(),
        context: it.text.slice(Math.max(0, s.start - 40), s.start) + '[' + it.text.slice(s.start, s.end) + ']' + it.text.slice(s.end, s.end + 40) });
    }
  }
}

// ---- Report ------------------------------------------------------------
mkdirSync(join(ROOT, 'build'), { recursive: true });
writeFileSync(join(ROOT, 'build', 'copy-report.json'), JSON.stringify({ vale: hits, harper: harperHits }, null, 1));

const baseline = (() => { try { return JSON.parse(readFileSync(BASELINE, 'utf8')); } catch { return {}; } })();
if (update) {
  writeFileSync(BASELINE, JSON.stringify(Object.fromEntries(Object.entries(counts).sort()), null, 2) + '\n');
  console.log('baseline updated:', counts);
  process.exit(0);
}

let failed = false;
console.log('\nVale (blocking, ratcheted)');
for (const rule of new Set([...Object.keys(counts), ...Object.keys(baseline)])) {
  const now = counts[rule] || 0, was = baseline[rule] || 0;
  const tag = now > was ? 'FAIL' : now < was ? 'down' : 'ok  ';
  if (now > was) failed = true;
  console.log(`  ${tag} ${rule}: ${now} (baseline ${was})`);
}
if (failed) {
  console.log('\nNew violations (anything above baseline is in this list - search it for your change):');
  for (const rule of Object.keys(counts).filter(r => (counts[r] || 0) > (baseline[r] || 0)))
    for (const h of hits.filter(h => h.rule === rule)) console.log(`  ${h.rule}  ${h.where}  "${h.match}"`);
}
if (Object.keys(counts).some(r => counts[r] < (baseline[r] || 0)))
  console.log('\nSome counts dropped. Run `npm run lint:copy -- --update-baseline` in this PR to lock them in.');

console.log(`\nHarper (advisory): ${harperHits.length} grammar notes - see build/copy-report.json`);
console.log(`Vale details: ${hits.length} hits - see build/copy-report.json`);
process.exit(failed ? 1 : 0);
