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
