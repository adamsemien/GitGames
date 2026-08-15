/* Tiny SVG diagram kit — no deps, theme-aware via currentColor-ish literals. */

const CY = '#39e6ff', MG = '#ff4fd8', LM = '#7cff7c', AM = '#ffc44d', VI = '#a07cff', DIM = '#8f93b5';

const dot = (x, y, c, r = 13) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="2"/>`;
const line = (x1, y1, x2, y2, c = DIM, dash = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2" ${dash ? 'stroke-dasharray="5 5"' : ''} opacity=".7"/>`;
const txt = (x, y, s, c = '#eef0ff', size = 11, anchor = 'middle', weight = 600) =>
  `<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="ui-monospace,Menlo,monospace">${s}</text>`;
const box = (x, y, w, h, c, label, sub) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" fill-opacity=".10" stroke="${c}" stroke-width="1.5"/>` +
  txt(x + w / 2, y + 24, label, c, 12) + (sub ? txt(x + w / 2, y + 43, sub, DIM, 10, 'middle', 500) : '');

const wrap = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

/* ---- diagrams ---- */

export const threeAreas = wrap(560, 190,
  box(10, 30, 155, 62, DIM, 'Working tree', 'files you edit') +
  box(200, 30, 155, 62, AM, 'Staging area', 'what goes next') +
  box(390, 30, 160, 62, LM, 'Repository', 'permanent history') +
  line(165, 61, 200, 61, AM) + line(355, 61, 390, 61, LM) +
  txt(182, 118, 'git add', AM, 11) + txt(372, 118, 'git commit', LM, 11) +
  line(470, 100, 470, 140, CY, 1) + line(88, 140, 470, 140, CY, 1) + line(88, 140, 88, 100, CY, 1) +
  txt(280, 162, 'git checkout / git restore  ⟵  pull files back out', CY, 10)
);

export const commitChain = wrap(520, 130,
  line(50, 60, 470, 60) +
  dot(60, 60, CY) + dot(180, 60, CY) + dot(300, 60, CY) + dot(430, 60, MG, 15) +
  txt(60, 64, 'a1', CY, 10) + txt(180, 64, 'b2', CY, 10) + txt(300, 64, 'c3', CY, 10) + txt(430, 64, 'd4', MG, 10) +
  txt(60, 96, 'first', DIM, 10) + txt(180, 96, '+login', DIM, 10) + txt(300, 96, 'fix bug', DIM, 10) +
  txt(430, 96, 'newest', MG, 10) + txt(430, 24, 'HEAD  →  main', MG, 11)
);

export const branchDiverge = wrap(520, 200,
  line(40, 130, 200, 130) + line(200, 130, 280, 70, MG) + line(280, 70, 430, 70, MG) + line(200, 130, 430, 130) +
  dot(50, 130, CY) + dot(140, 130, CY) + dot(200, 130, CY) +
  dot(300, 70, MG) + dot(400, 70, MG) + dot(300, 130, CY) + dot(410, 130, CY) +
  txt(455, 74, 'feature', MG, 11, 'start') + txt(455, 134, 'main', CY, 11, 'start') +
  txt(200, 172, 'they share history up to here, then split', DIM, 10)
);

export const mergeVsRebase = wrap(540, 250,
  txt(10, 18, 'MERGE — keeps both paths, adds a knot', LM, 11, 'start') +
  line(30, 70, 180, 70) + line(180, 70, 240, 42, MG) + line(240, 42, 340, 42, MG) + line(340, 42, 400, 70, MG) + line(180, 70, 400, 70) +
  dot(40, 70, CY, 10) + dot(180, 70, CY, 10) + dot(270, 42, MG, 10) + dot(340, 42, MG, 10) + dot(300, 70, CY, 10) + dot(410, 70, LM, 12) +
  txt(455, 74, 'merge commit', LM, 10, 'start') +
  txt(10, 150, 'REBASE — replays your work on top, one clean line', AM, 11, 'start') +
  line(30, 200, 470, 200) +
  dot(40, 200, CY, 10) + dot(140, 200, CY, 10) + dot(240, 200, CY, 10) + dot(330, 200, AM, 10) + dot(420, 200, AM, 10) +
  txt(330, 232, 'your commits, rewritten', AM, 10) + txt(90, 232, 'main', CY, 10)
);

export const remoteSync = wrap(540, 200,
  box(20, 20, 200, 66, CY, 'Your laptop', 'local repo') +
  box(320, 20, 200, 66, MG, 'GitHub', 'origin (remote)') +
  line(220, 40, 320, 40, LM) + txt(270, 32, 'push', LM, 11) +
  line(320, 68, 220, 68, AM) + txt(270, 84, 'fetch / pull', AM, 11) +
  txt(270, 130, 'clone = copy the whole thing down, once', DIM, 11) +
  txt(270, 156, 'origin is just a nickname for a URL', DIM, 11) +
  txt(270, 180, 'nothing is shared until you push', VI, 11)
);

export const worktreeDiagram = wrap(540, 230,
  box(20, 20, 500, 42, VI, 'ONE repository — one .git database, one history') +
  line(120, 62, 120, 100, VI) + line(400, 62, 400, 100, VI) + line(270, 62, 270, 100, VI) +
  box(20, 100, 150, 66, CY, '~/proj', 'branch: main') +
  box(195, 100, 150, 66, MG, '~/proj-fix', 'branch: hotfix') +
  box(370, 100, 150, 66, AM, '~/proj-exp', 'branch: spike') +
  txt(270, 200, 'three folders open at once — no stashing, no switching', DIM, 11) +
  txt(270, 220, 'a branch can only be checked out in one worktree at a time', DIM, 10)
);

export const prFlow = wrap(540, 160,
  dot(45, 60, CY, 12) + txt(45, 96, 'branch', DIM, 10) +
  line(58, 60, 145, 60) + dot(158, 60, CY, 12) + txt(158, 96, 'commit', DIM, 10) +
  line(171, 60, 258, 60) + dot(271, 60, MG, 12) + txt(271, 96, 'push', DIM, 10) +
  line(284, 60, 371, 60) + dot(384, 60, AM, 12) + txt(384, 96, 'open PR', DIM, 10) +
  line(397, 60, 470, 60) + dot(487, 60, LM, 14) + txt(487, 96, 'merge', LM, 10) +
  txt(270, 136, 'review + CI happen at the PR — that is the whole point', DIM, 11)
);

export const detachedHead = wrap(520, 150,
  line(50, 80, 460, 80) +
  dot(60, 80, DIM, 11) + dot(170, 80, DIM, 11) + dot(285, 80, CY, 13) + dot(430, 80, DIM, 11) +
  txt(430, 46, 'main', DIM, 11) + txt(285, 40, 'HEAD', CY, 12) + txt(285, 118, 'you are standing here,', CY, 10) +
  txt(285, 134, 'not on any branch — commits here can get lost', DIM, 10)
);

/* ---- phase 1 diagrams ---- */

export const httpCycle = wrap(540, 210,
  box(15, 22, 175, 60, CY, 'Your app', 'the client') +
  box(350, 22, 175, 60, MG, 'Their server', 'the API') +
  line(190, 40, 350, 40, LM) + txt(270, 32, 'REQUEST', LM, 11) +
  txt(270, 58, 'GET /v1/users/42', DIM, 10) +
  line(350, 68, 190, 68, AM) + txt(270, 84, 'RESPONSE', AM, 11) +
  txt(270, 104, '200 OK  +  { "id": 42, … }', DIM, 10) +
  txt(270, 142, 'method + path + headers + body  →  status + headers + body', '#eef0ff', 11) +
  txt(270, 168, 'that is the entire protocol. everything else is detail.', DIM, 10) +
  txt(270, 192, 'stateless: the server remembers nothing between calls', VI, 10)
);

export const webhookFlow = wrap(540, 235,
  txt(12, 18, 'NORMAL API — you ask, they answer', CY, 11, 'start') +
  box(20, 30, 160, 46, CY, 'You') + box(340, 30, 160, 46, DIM, 'Stripe') +
  line(180, 44, 340, 44, CY) + txt(260, 38, '"did it pay?"', CY, 10) +
  line(340, 62, 180, 62, DIM) + txt(260, 74, '"not yet"  ×1000', DIM, 10) +
  txt(12, 128, 'WEBHOOK — they call you, once, when it happens', MG, 11, 'start') +
  box(20, 140, 160, 46, MG, 'Your endpoint') + box(340, 140, 160, 46, DIM, 'Stripe') +
  line(340, 163, 180, 163, MG) + txt(260, 156, 'POST  payment.succeeded', MG, 10) +
  txt(270, 212, 'the call is inverted — which is why it needs its own auth', AM, 11)
);

export const harnessLoop = wrap(540, 225,
  box(190, 14, 160, 44, VI, 'MODEL', 'predicts text') +
  line(270, 58, 270, 84, VI) +
  box(160, 84, 220, 48, CY, 'HARNESS', 'runs the loop, owns the tools') +
  line(160, 108, 70, 108, LM) + line(380, 108, 470, 108, AM) +
  box(15, 140, 120, 42, LM, 'TOOLS', 'read · bash') +
  box(390, 140, 130, 42, AM, 'PERMISSION', 'ask · allow · deny') +
  txt(270, 158, 'prompt → model picks a tool → harness runs it', '#eef0ff', 11) +
  txt(270, 180, '→ result goes back in → repeat until done', '#eef0ff', 11) +
  txt(270, 210, 'the model cannot touch your disk. the harness can.', MG, 11)
);

export const envLayers = wrap(540, 240,
  box(15, 20, 505, 40, DIM, 'YOUR MACHINE — everything is reachable') +
  box(35, 72, 470, 40, CY, 'CONTAINER / VM — its own filesystem and network') +
  box(60, 124, 425, 40, LM, 'SANDBOX — a folder and a rule set') +
  box(90, 176, 370, 40, AM, 'READ-ONLY — it can look, it cannot change') +
  txt(270, 232, 'each layer shrinks the blast radius. pick by what a mistake costs.', DIM, 10)
);

/* ---- terminal 101 ---- */

export const terminalLayers = wrap(540, 250,
  box(15, 18, 505, 54, MG, 'TERMINAL EMULATOR — Ghostty, iTerm2, Terminal.app',
    'the window · fonts, colours, tabs, splits, copy & paste') +
  line(270, 72, 270, 96, MG) +
  box(60, 96, 420, 54, CY, 'SHELL — zsh, bash, fish',
    'reads your line · history, tab completion, aliases') +
  line(270, 150, 270, 174, CY) +
  box(130, 174, 280, 46, LM, 'THE PROGRAM', 'git, npm, node, curl') +
  txt(270, 240, '⌘C is the window.  ⌃C is the shell.  different keys, different layers.', AM, 11)
);

export const lineAnatomy = wrap(540, 165,
  txt(14, 22, 'ONE LINE, THREE PLACES YOUR CURSOR CAN GO', DIM, 10, 'start') +
  `<rect x="14" y="36" width="512" height="44" rx="10" fill="#04040b" stroke="${DIM}" stroke-width="1.5"/>` +
  txt(30, 64, '$ git commit -m "fix teh bug"', '#cfd4f0', 13, 'start', 400) +
  line(44, 88, 44, 104, LM) + txt(44, 120, '⌃A', LM, 11) + txt(44, 136, 'start', DIM, 9) +
  line(250, 88, 250, 104, CY) + txt(250, 120, '⌥← ⌥→', CY, 11) + txt(250, 136, 'word', DIM, 9) +
  line(455, 88, 455, 104, MG) + txt(455, 120, '⌃E', MG, 11) + txt(455, 136, 'end', DIM, 9)
);
