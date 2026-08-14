# GitGames

A neon arcade that teaches you Git, GitHub, and the AI-coding stack — built to be played one-handed on a phone.

**Play it → https://adamsemien.github.io/GitGames/**

No typing. You build real commands by tapping tokens into a simulated terminal, and each concept comes with a diagram, a check, and a reason.

---

## Tracks

| Track | Levels | What it covers |
|---|---|---|
| 🐙 **Git & GitHub** | 34 | Repos, the three areas, commits, HEAD, undo, reflog, branches, merges, conflicts, remotes, forks, PRs, merge strategies, Actions, rebase, interactive rebase, cherry-pick, stash, bisect, worktrees, tags, submodules |
| 🤖 **Claude Code** | 14 | Input modes, plan mode, rewind, context economics, CLAUDE.md, custom commands, subagents, skills, hooks, MCP, worktrees + parallel agents, headless mode, thinking budget |
| 👻 **Terminal & Ghostty** | 12 | Terminal vs shell, splits and tabs, scrollback and search, command palette, the quick terminal, config anatomy, `macos-option-as-alt`, config auditing, shell tooling, workspace layout |
| 🧬 **Codex** | 8 | Sandboxes and approval policies, interactive vs `exec`, AGENTS.md, config profiles, MCP, the reviewer pattern |
| 🌊 **The Vibe Stack** | 12 | Spec-first, small commits, second-opinion review, secrets, environments, migrations, webhooks, preview deploys and rollback, debugging with agents, prompt injection, cost economics |

**80 levels · 169 steps · 40 glossary entries · a full cheat sheet**

Ghostty content is verified against Ghostty 1.3.1 defaults (`ghostty +show-config --default`).

## How it plays

- **Lesson** — the concept, with SVG diagrams and terminal output
- **Build** — assemble a real command by tapping tokens; wrong answers shake, then hint, then reveal
- **Quiz** — a check with an explanation of *why*, not just *what*

XP, streak combos, ranks from Rookie to Legend. Progress is saved in `localStorage`, so it survives closing the tab. Installable to the home screen and works offline.

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
export const TRACKS = [github, claudeCode, ghostty, codex, vibe, myTrack];
```

That is the whole extension point — `app.js` never changes. Node `id`s must be unique across all tracks (they key the saved progress). For `build` steps, decoy `chips` are merged with the answer tokens and shuffled.

## Layout

```
index.html      screens + shell
styles.css      design tokens, all UI
app.js          engine: state, routing, the three step types
sw.js           offline cache (production only)
data/
  tracks.js     registry — the one file you edit to add a track
  github.js     Git & GitHub
  claude-code.js
  ghostty.js
  codex.js
  vibe.js
  reference.js  glossary + cheat sheet
  svg.js        diagram kit
```

## License

MIT
