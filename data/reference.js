/* ============================================================
   Glossary + cheat sheet (the reference screens)
   ============================================================ */

export const GLOSSARY = [
  {
    group: 'Core Git',
    items: [
      { term: 'Repository (repo)', def: 'A project folder Git is watching. The folder plus a hidden <code>.git</code> directory holding the entire history.' },
      { term: 'Commit', def: 'A permanent snapshot of the whole project with an author, message, timestamp, and a pointer to its parent commit.' },
      { term: 'Hash / SHA', def: 'The fingerprint identifying a commit, like <code>e3f1a9c</code>. Derived from the content, author, message and parent — change anything and it changes.' },
      { term: 'Working tree', def: 'The actual files on disk that you edit.' },
      { term: 'Staging area (index)', def: 'The basket of changes that will go into your next commit. Filled with <code>git add</code>.' },
      { term: 'HEAD', def: 'A pointer to the commit you currently have checked out. Usually points at a branch.' },
      { term: 'Detached HEAD', def: 'HEAD pointing straight at a commit rather than a branch. Safe to look around; make a branch before committing.' },
      { term: 'Branch', def: 'A movable pointer to a commit. Not a copy — literally a small file containing a hash, which is why branching is instant.' },
      { term: 'Tag', def: 'A permanent label on one commit, used to mark releases. Unlike branches, tags never move.' }
    ]
  },
  {
    group: 'Moving work around',
    items: [
      { term: 'Merge', def: 'Joins two branches. Fast-forward if the target has no new commits, otherwise creates a merge commit with two parents.' },
      { term: 'Rebase', def: 'Replays your commits on top of another branch, producing linear history. Creates new hashes — never do it to shared branches.' },
      { term: 'Cherry-pick', def: 'Copies one commit from anywhere onto your current branch as a new commit.' },
      { term: 'Stash', def: 'Temporarily pockets uncommitted changes so you get a clean working tree. <code>-u</code> also grabs untracked files.' },
      { term: 'Conflict', def: 'Two branches changed the same lines. Git marks both versions and asks you to decide. <code>--abort</code> always backs out safely.' },
      { term: 'Squash', def: 'Combining several commits into one. Common when merging a messy PR.' },
      { term: 'Revert', def: 'Creates a NEW commit that undoes an old one. The safe undo for anything already pushed.' },
      { term: 'Reset', def: 'Moves the branch pointer backwards. <code>--soft</code> keeps changes staged, <code>--mixed</code> unstages, <code>--hard</code> destroys them.' },
      { term: 'Reflog', def: 'A local log of everywhere HEAD has been. The recovery tool for bad resets, rebases and deleted branches.' }
    ]
  },
  {
    group: 'Remotes & GitHub',
    items: [
      { term: 'Remote', def: 'A named URL for another copy of the repo. <code>origin</code> is the conventional name for the one you cloned from.' },
      { term: 'Clone', def: 'Downloads a full copy of a repo including all history, and wires up <code>origin</code>.' },
      { term: 'Fetch', def: 'Downloads new commits from a remote but changes nothing in your working tree.' },
      { term: 'Pull', def: 'Fetch plus merge (or rebase). It does change your files.' },
      { term: 'Push', def: 'Uploads your commits to a remote. <code>-u</code> on the first push sets up tracking.' },
      { term: 'Fork', def: 'A GitHub-level copy of someone else\'s repo into your account, so you can push and then open a PR back.' },
      { term: 'Upstream', def: 'The conventional remote name for the original repo you forked from.' },
      { term: 'Pull request', def: 'A GitHub feature, not a Git command: a page proposing that one branch be merged, with review, comments and CI attached.' },
      { term: 'Worktree', def: 'An extra folder checked out to a different branch, sharing one <code>.git</code>. Lets you have several branches open at once.' },
      { term: 'Submodule', def: 'Another repo pinned at a fixed commit inside yours. Clone with <code>--recurse-submodules</code> or you get empty folders.' }
    ]
  },
  {
    group: 'Agents & terminal',
    items: [
      { term: 'CLAUDE.md', def: 'Auto-loaded standing instructions for Claude Code. Home directory for personal rules, repo root for team rules.' },
      { term: 'AGENTS.md', def: 'A tool-neutral instructions file at the repo root that Codex and other agents read. Good single source of truth.' },
      { term: 'Plan mode', def: 'Claude Code mode (Shift+Tab) where it can research but not edit until you approve a plan.' },
      { term: 'Subagent', def: 'A separate agent with its own context window and tool set. Returns a summary, keeping its exploration out of your main context.' },
      { term: 'Skill', def: 'A folder with a SKILL.md of reusable expertise, loaded automatically when a task matches its description.' },
      { term: 'Hook', def: 'A shell command the harness runs at a lifecycle point (PreToolUse, PostToolUse, Stop…). Always fires — unlike an instruction.' },
      { term: 'MCP', def: 'Model Context Protocol — the open standard for connecting external tools and data sources to an agent.' },
      { term: 'Prompt injection', def: 'Malicious instructions hidden in content an agent reads. Defence: tool results are data, only the user gives instructions.' },
      { term: 'Terminal emulator', def: 'The app window (Ghostty, iTerm2). Owns fonts, splits, tabs, hotkeys. Runs no commands itself.' },
      { term: 'Shell', def: 'The program inside the window (zsh, bash, fish) that interprets and runs what you type. Configured in <code>~/.zshrc</code>.' },
      { term: 'Shell integration', def: 'Markers the shell emits so the terminal knows where each command begins and ends — powers prompt-jumping and smarter selection.' },
      { term: 'Quick terminal', def: 'Ghostty\'s global drop-down terminal, toggled from any app with a <code>global:</code> keybind.' }
    ]
  }
];

export const CHEATS = [
  {
    group: 'Every day',
    items: [
      { term: 'Where am I?', def: 'Branch, staged, unstaged, untracked — run it constantly.', cmd: 'git status' },
      { term: 'Readable history', def: 'Worth aliasing to <code>git lg</code>.', cmd: 'git log --oneline --graph --all --decorate' },
      { term: 'Stage and commit', def: '<code>-p</code> walks you through chunk by chunk.', cmd: 'git add -p\ngit commit -m "Fix null user crash"' },
      { term: 'Preview your commit', def: 'Catches stray debug code before anyone sees it.', cmd: 'git diff --staged' },
      { term: 'New branch', def: 'Modern form of <code>checkout -b</code>.', cmd: 'git switch -c fix/navbar' },
      { term: 'First push of a branch', def: '<code>-u</code> sets tracking so plain push/pull work after.', cmd: 'git push -u origin fix/navbar' }
    ]
  },
  {
    group: 'Getting out of trouble',
    items: [
      { term: 'Discard file edits', def: 'Destroys uncommitted changes to that file.', cmd: 'git restore src/app.js' },
      { term: 'Unstage, keep edits', def: '', cmd: 'git restore --staged src/app.js' },
      { term: 'Undo last commit, keep work', def: 'Local only.', cmd: 'git reset --soft HEAD~1' },
      { term: 'Undo a pushed commit', def: 'Safe on shared branches — adds a new commit.', cmd: 'git revert <hash>' },
      { term: 'Find lost commits', def: 'The panic button. Then reset to the hash you want.', cmd: 'git reflog' },
      { term: 'Bail out of a merge or rebase', def: 'Restores the exact pre-operation state.', cmd: 'git merge --abort\ngit rebase --abort' }
    ]
  },
  {
    group: 'Power moves',
    items: [
      { term: 'Clean up before a PR', def: 'squash / fixup / reword / drop your last N commits.', cmd: 'git rebase -i HEAD~5' },
      { term: 'Update branch onto latest main', def: 'Linear history, no merge commit.', cmd: 'git switch feature && git rebase main' },
      { term: 'Grab one commit', def: '', cmd: 'git cherry-pick 9a4b2c1' },
      { term: 'Park work incl. new files', def: 'Then <code>git stash pop</code>.', cmd: 'git stash push -u -m "half-done navbar"' },
      { term: 'Find the breaking commit', def: 'Binary search — ~10 steps across 1000 commits.', cmd: 'git bisect start\ngit bisect bad\ngit bisect good v1.4.0\ngit bisect run npm test' },
      { term: 'Second branch in a second folder', def: 'Shares one .git. Perfect for parallel agents.', cmd: 'git worktree add ../proj-hotfix hotfix\ngit worktree list\ngit worktree remove ../proj-hotfix' },
      { term: 'Safer force push', def: 'Refuses if someone else pushed since your last fetch.', cmd: 'git push --force-with-lease' },
      { term: 'Clean up merged branches', def: '', cmd: 'git fetch --prune\ngit branch --merged | grep -v main | xargs git branch -d' }
    ]
  },
  {
    group: 'Ghostty hotkeys (macOS)',
    items: [
      { term: 'Splits', def: 'Zoom is the one to learn first.', cmd: '⌘D          split right\n⌘⇧D         split down\n⌘⌥ ← ↑ ↓ →   move between splits\n⌘⌃ ← ↑ ↓ →   resize by 10\n⌘⌃=         equalize\n⌘⇧↵         zoom focused split' },
      { term: 'Tabs & windows', def: '', cmd: '⌘T          new tab\n⌘1…⌘8       jump to tab N   (⌘9 = last)\n⌘⇧[ / ⌘⇧]   prev / next tab\n⌘N          new window\n⌘W          close surface' },
      { term: 'Scrollback', def: 'Prompt jumping needs shell integration on.', cmd: '⌘F          search   (⌘G next, ⌘⇧G prev)\n⌘↑ / ⌘↓     jump to prev / next prompt\n⌘K          clear screen\n⌘⇧J         dump screen to a file' },
      { term: 'Config & palette', def: '', cmd: '⌘⇧P         command palette\n⌘,          open config\n⌘⇧,         reload config\n⌘+ / ⌘- / ⌘0  font size' },
      { term: 'Inspect Ghostty itself', def: 'On macOS the binary lives inside the app bundle.', cmd: 'ghostty +list-themes\nghostty +list-keybinds --default\nghostty +show-config --default --docs\nghostty +validate-config' }
    ]
  },
  {
    group: 'Shell (readline — works everywhere)',
    items: [
      { term: 'Line editing', def: 'Works in zsh, bash, psql, node, python — anything readline.', cmd: '⌃A / ⌃E     start / end of line\n⌥← / ⌥→     move one word\n⌃W          delete previous word\n⌃U          clear the line\n⌃R          reverse history search\n⌃L          clear screen' },
      { term: 'Tools worth installing', def: 'Start with zoxide and fzf.', cmd: 'brew install starship fzf zoxide eza ripgrep bat atuin gh' }
    ]
  },
  {
    group: 'Agents',
    items: [
      { term: 'Claude Code essentials', def: '', cmd: 'Shift+Tab   cycle plan / auto-accept mode\nEsc         interrupt now\nEsc Esc     rewind and edit an earlier message\n@file       reference a file precisely\n!cmd        run a shell command into context\n#note       write to CLAUDE.md memory\n/clear      wipe context between tasks' },
      { term: 'Claude Code headless', def: 'Reads stdin, writes stdout — composes with anything.', cmd: 'claude -p "summarise the last 5 commits"\ngit diff | claude -p "review this diff"\nclaude -c            # continue last session\nclaude --resume      # pick a session' },
      { term: 'Codex', def: 'Confirm flags with <code>codex --help</code> for your version.', cmd: 'codex                       # interactive\ncodex exec "add tests"      # headless\ngit diff | codex exec "review this for bugs"\ncodex --profile review      # read-only profile' },
      { term: 'Parallel agents, safely', def: 'One worktree per agent. Never two in one folder.', cmd: 'git worktree add ../proj-a feature-a\ngit worktree add ../proj-b feature-b\ncd ../proj-a && claude' }
    ]
  }
];
