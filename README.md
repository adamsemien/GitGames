# GitGames

A neon arcade that teaches you Git, GitHub, and the AI-coding stack — built to be played one-handed on a phone.

**Play it → https://adamsemien.github.io/GitGames/**

Build real commands by **tapping tokens or typing them** — the two are interchangeable, so it works one-handed on a phone and full-speed on a desktop. Every concept comes with a diagram, a check, and a reason. Know a chunk already? **Test out** of any level or whole section and clear it without sitting through the lessons.

---

## Tracks

| Track | Levels | What it covers |
|---|---|---|
| 🌀 **Systems Thinking** | 12 | Start here. How to think before the tools: parts vs the whole, stocks and flows, delays, balancing and reinforcing loops, bounded rationality, fixes that fail, shifting the burden, the commons, leverage points, mental models - and your app as a system. Every level is a small game you play before anything is explained |
| 🐙 **Git & GitHub** | 34 | Repos, the three areas, commits, HEAD, undo, reflog, branches, merges, conflicts, remotes, forks, PRs, merge strategies, Actions, rebase, interactive rebase, cherry-pick, stash, bisect, worktrees, tags, submodules |
| 🌐 **APIs & Webhooks** | 13 | What an API is, HTTP verbs, status codes, headers, JSON, curl, API keys vs bearer tokens vs OAuth, rate limits and backoff, idempotency, webhooks as inversion of control, signature verification, the raw-body trap, local tunnelling |
| 🔧 **Tooling** | 12 | Runtime vs package manager vs bundler, package.json, lockfiles, semver, linters/formatters/typecheckers, tests as a contract, what "build" does — plus the agent's own tools, permission modes and blast radius |
| ⚙️ **Agents & Harnesses** | 15 | Model vs harness vs agent, the agent loop, how agents actually fail, subagents, injection through tools, the four environments, sandbox vs container vs VM, blast radius, CLAUDE.md vs AGENTS.md, Claude Code vs Codex, when *not* to use a harness |
| 🤖 **Claude Code** | 14 | Input modes, plan mode, rewind, context economics, CLAUDE.md, custom commands, subagents, skills, hooks, MCP, worktrees + parallel agents, headless mode, thinking budget |
| 🧬 **Codex** | 8 | Sandboxes and approval policies, interactive vs `exec`, AGENTS.md, config profiles, MCP, the reviewer pattern |
| 👻 **Terminal & Ghostty** | 12 | Terminal vs shell, splits and tabs, scrollback and search, command palette, the quick terminal, config anatomy, `macos-option-as-alt`, config auditing, shell tooling, workspace layout |
| 🌊 **The Vibe Stack** | 12 | Spec-first, small commits, second-opinion review, secrets, environments, migrations, webhooks, preview deploys and rollback, debugging with agents, prompt injection, cost economics |

**166 levels · 391 steps · 162 glossary terms · a full cheat sheet**

Ghostty content is verified against Ghostty 1.3.1 defaults (`ghostty +show-config --default`).

## How it plays

- **Lesson** — the concept, with SVG diagrams and terminal output. Any glossary term is auto-linked; tap it for a definition without losing your place.
- **Build** — assemble a real command. Tap the tokens, or type it: `Space` commits a token, `Tab` autocompletes, `Enter` runs. Mix both freely. Wrong answers shake, then hint, then reveal.
- **Quiz** — a check with an explanation of *why*, not just *what*
- **Simulate** - a small turn-based game you play *before* the idea is explained: a shower that answers two turns late, a bath with a clogging drain, a rumour you can only steer early. After the last turn you get two numbers, a debrief matched to how you did, and a "same shape, different room" question. Review brings back only that question, never the game

- **Test out** — already know it? Skip the lessons and prove it. Every section header has a **⚡ Test out** button, and any lesson offers the same for its own level until you answer the first check. You get that level's or that section's checks with the lessons stripped out and *one attempt per question* — no hints, no retries. Clear the pass mark — 80% of the questions, rounded up, so a short test has to be perfect — and every level it covered clears at once; fail and you lose nothing but the shortcut — the misses land in Review and you play that one through. Keystroke levels are muscle memory rather than knowledge, so no question comes from them — passing the section still marks them off, and they are still there to play.

**Review** tracks every question you get wrong and serves them back later, mixed with checks from levels you cleared a while ago — two minutes, no lessons. **Search** covers every lesson, quiz and glossary term. **Move progress** exports a code you paste on another device.

XP, streak combos, ranks from Rookie to Legend. Progress is saved in `localStorage`. Installable to the home screen and works offline.

## Running it locally

No build step, no dependencies. It is plain ES modules.

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Adding a track

The engine is content-agnostic. Adding a track touches two files.

1. Create `data/my-track.js`:

```js
export const myTrack = {
  id: 'my-track',
  name: 'My Track',
  emoji: '🎯',
  glow: '#39e6ff',
  time: '~20 min',
  desc: 'One line shown on the home card.',
  chapters: [{
    title: 'Chapter 1 — Basics',
    desc: 'Optional subtitle.',
    nodes: [{
      id: 'mt-01', name: 'First level', ico: '🚀',
      steps: [
        { t: 'lesson', title: 'The idea', body: [
          { p: 'Paragraph. <code>inline code</code> works.' },
          { ul: ['A bullet', 'Another bullet'] },
          { term: '<span class="c">$ some command</span>\n<span class="o">output</span>' },
          { call: { k: 'tip', t: 'Label:', p: 'A callout. k is tip | warn | omitted.' } }
        ]},
        { t: 'build', brief: 'Do the thing.', answer: ['git', 'init'],
          chips: ['clone', 'add'], why: 'Explanation shown after.', hint: 'Optional nudge.' },
        { t: 'quiz', q: 'Question?', choices: ['A', 'B'], a: 1, why: 'Why B is right.' }
      ]
    }]
  }]
};
```

2. Register it in `data/tracks.js`:

```js
import { myTrack } from './my-track.js';
export const TRACKS = [github, apis, tooling, harness, claudeCode, codex, ghostty, vibe, myTrack];
```

That is the whole extension point — `app.js` never changes. For a `sim` step (a turn-based game with pure `init`/`step`/`view`/`score` functions), copy a level from `data/systems.js` - the shape is documented at the top of that file - and run the tests below. Node `id`s must be unique across all tracks (they key the saved progress). For `build` steps, decoy `chips` are merged with the answer tokens and shuffled.

Adding a glossary entry to `data/reference.js` makes that term auto-link everywhere it appears in any lesson, including tracks added later. Use `also: [...]` for aliases.

## Tests

The Simulate games are pure functions, so they are tested by replaying fixed action lists and checking where each one lands:

```bash
node tests/sim.test.mjs
```

Or serve the repo and open `/tests/sim.html` in any browser - it runs the same checks.

## Layout

```
index.html      screens + shell
styles.css      design tokens, all UI
app.js          engine: state, routing, the three step types
sw.js           offline cache (production only)
data/
  tracks.js     registry — the one file you edit to add a track
  systems.js    Systems Thinking (Simulate levels)
  github.js     Git & GitHub
  claude-code.js
  ghostty.js
  codex.js
  vibe.js
  apis.js
  tooling.js
  harness.js
  reference.js  glossary (also powers auto-linking) + cheat sheet
  svg.js        diagram kit
tests/
  sim-cases.js  Simulate checks, shared by the two runners below
  sim.test.mjs  node runner
  sim.html      browser runner
```

## License

MIT
