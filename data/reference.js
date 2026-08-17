/* ============================================================
   Glossary + cheat sheet.
   The glossary also powers auto-linking inside lessons — any `term`
   or `also` alias found in lesson prose becomes tappable.
   Keep aliases specific; a one-word alias that is also ordinary
   English will link in places you did not mean.
   ============================================================ */

export const GLOSSARY = [
  {
    group: 'Core Git',
    items: [
      { term: 'Repository', also: ['repo'], def: 'A project folder Git is watching. The folder plus a hidden <code>.git</code> directory holding the entire history.' },
      { term: 'Commit', def: 'A permanent snapshot of the whole project with an author, message, timestamp, and a pointer to its parent commit.' },
      { term: 'Hash', also: ['SHA', 'commit hash'], def: 'The fingerprint identifying a commit, like <code>e3f1a9c</code>. Derived from the content, author, message and parent — change anything and it changes.' },
      { term: 'Working tree', def: 'The actual files on disk that you edit.' },
      { term: 'Staging area', also: ['the index'], def: 'The basket of changes that will go into your next commit. Filled with <code>git add</code>.' },
      { term: 'HEAD', def: 'A pointer to the commit you currently have checked out. Usually points at a branch.' },
      { term: 'Detached HEAD', def: 'HEAD pointing straight at a commit rather than a branch. Safe to look around; make a branch before committing.' },
      { term: 'Branch', def: 'A movable pointer to a commit. Not a copy — literally a small file containing a hash, which is why branching is instant.' },
      { term: 'Tag', def: 'A permanent label on one commit, used to mark releases. Unlike branches, tags never move.' },
      { term: 'Diff', def: 'The set of line-by-line changes between two states. The unit of code review.' },
      { term: '.gitignore', def: 'A file listing paths Git should not track. Only affects files that are not already tracked.' },
      { term: 'Reflog', def: 'A local log of everywhere HEAD has been. The recovery tool for bad resets, rebases and deleted branches.', cmd: 'git reflog' }
    ]
  },
  {
    group: 'Moving work around',
    items: [
      { term: 'Merge', def: 'Joins two branches. Fast-forward if the target has no new commits, otherwise creates a merge commit with two parents.' },
      { term: 'Fast-forward', def: 'A merge where the target branch had no new commits, so Git just slides the pointer forward. No merge commit, perfectly linear.' },
      { term: 'Rebase', def: 'Replays your commits on top of another branch, producing linear history. Creates new hashes — never do it to shared branches.' },
      { term: 'Cherry-pick', def: 'Copies one commit from anywhere onto your current branch as a new commit.', cmd: 'git cherry-pick <hash>' },
      { term: 'Stash', def: 'Temporarily pockets uncommitted changes so you get a clean working tree. <code>-u</code> also grabs untracked files.', cmd: 'git stash push -u' },
      { term: 'Conflict', also: ['merge conflict'], def: 'Two branches changed the same lines. Git marks both versions and asks you to decide. <code>--abort</code> always backs out safely.' },
      { term: 'Squash', def: 'Combining several commits into one. Common when merging a messy pull request.' },
      { term: 'Revert', def: 'Creates a NEW commit that undoes an old one. The safe undo for anything already pushed.', cmd: 'git revert <hash>' },
      { term: 'Reset', def: 'Moves the branch pointer backwards. <code>--soft</code> keeps changes staged, <code>--mixed</code> unstages, <code>--hard</code> destroys them.' },
      { term: 'Bisect', def: 'Binary search through history to find the commit that introduced a bug. Roughly 10 steps across 1000 commits.', cmd: 'git bisect run npm test' }
    ]
  },
  {
    group: 'Remotes & GitHub',
    items: [
      { term: 'Remote', def: 'A named URL for another copy of the repo. <code>origin</code> is the conventional name for the one you cloned from.' },
      { term: 'Origin', def: 'The default name for the remote you cloned from. It has no special powers — it is just a nickname for a URL.' },
      { term: 'Clone', def: 'Downloads a full copy of a repo including all history, and wires up <code>origin</code>.' },
      { term: 'Fetch', def: 'Downloads new commits from a remote but changes nothing in your working tree.' },
      { term: 'Pull', def: 'Fetch plus merge (or rebase). Unlike fetch, it does change your files.' },
      { term: 'Push', def: 'Uploads your commits to a remote. <code>-u</code> on the first push sets up tracking.' },
      { term: 'Force push', def: 'Overwrites remote history. Use <code>--force-with-lease</code>, which refuses if someone else pushed since your last fetch.' },
      { term: 'Fork', def: 'A GitHub-level copy of someone else\'s repo into your account, so you can push and then open a pull request back.' },
      { term: 'Upstream', def: 'The conventional remote name for the original repo you forked from.' },
      { term: 'Pull request', also: ['PR'], def: 'A GitHub feature, not a Git command: a page proposing that one branch be merged, with review, comments and CI attached.' },
      { term: 'Worktree', def: 'An extra folder checked out to a different branch, sharing one <code>.git</code>. Lets you have several branches open at once.', cmd: 'git worktree add ../proj-fix hotfix' },
      { term: 'Submodule', def: 'Another repo pinned at a fixed commit inside yours. Clone with <code>--recurse-submodules</code> or you get empty folders.' },
      { term: 'Branch protection', def: 'A GitHub rule requiring checks to pass or reviews to be approved before anything can merge into a branch.' },
      { term: 'GitHub Actions', also: ['CI'], def: 'Workflows that run automatically on push or pull request — tests, linting, builds, deploys. Files live in <code>.github/workflows/</code>.' }
    ]
  },
  {
    group: 'The web & APIs',
    items: [
      { term: 'API', def: 'A published list of things you may ask another program to do, and the exact shape you must ask in. The only door in.' },
      { term: 'HTTP', def: 'The protocol the web runs on. A request (method, path, headers, body) gets a response (status, headers, body).' },
      { term: 'Endpoint', def: 'One specific URL an API exposes, usually paired with a method — <code>POST /v1/customers</code>.' },
      { term: 'Request', def: 'What you send: a method, a path, headers, and often a JSON body.' },
      { term: 'Response', def: 'What comes back: a status code, headers, and usually a JSON body.' },
      { term: 'Stateless', def: 'The server keeps no memory of you between requests. Every request must carry everything needed to answer it — which is why your key goes on all of them.' },
      { term: 'Status code', def: 'The three-digit result of a request. 2xx worked, 3xx look elsewhere, 4xx you were wrong, 5xx they were wrong.' },
      { term: 'JSON', def: 'The text format almost every API speaks — objects, arrays, strings, numbers. Human-readable and machine-parseable.' },
      { term: 'Header', def: 'A key-value pair carrying metadata on a request or response: who you are, what format you speak, how long to cache.' },
      { term: 'API key', def: 'One long secret string that IS your identity to a service. Server-side only, always. Catastrophic if leaked.' },
      { term: 'Bearer token', def: 'A short-lived credential sent as <code>Authorization: Bearer …</code>. "Bearer" means whoever holds it can use it — treat it like cash.' },
      { term: 'OAuth', def: 'The "Sign in with Google" flow. Lets a user grant your app limited access to their account elsewhere without sharing their password.' },
      { term: 'Signing secret', def: 'A shared secret used to prove an incoming request is genuine, by hashing the request body. How webhooks are secured.' },
      { term: 'Rate limit', def: 'A cap on how often you may call an API. Exceeding it returns <code>429</code>. Respond with exponential backoff, not a retry loop.' },
      { term: 'Backoff', also: ['exponential backoff'], def: 'Waiting progressively longer between retries — 1s, 2s, 4s, 8s — plus jitter so all clients do not retry in unison.' },
      { term: 'Idempotent', also: ['idempotency', 'idempotency key'], def: 'Doing it twice has the same effect as doing it once. An idempotency key lets you safely retry a request that may already have succeeded.' },
      { term: 'Webhook', def: 'An inverted API call: you give a service a URL, and it POSTs to you when something happens. A public endpoint that needs its own auth.' },
      { term: 'Raw body', def: 'The exact bytes of a request before any parsing. Webhook signatures are computed over these, so parsing first breaks verification.' },
      { term: 'Tunnel', def: 'A temporary public URL that forwards to your local machine, so external services can reach <code>localhost</code>.', cmd: 'stripe listen --forward-to localhost:3000/api/webhooks/stripe' },
      { term: 'curl', def: 'A command-line HTTP client. The fastest way to test an API with none of your own code in the way.', cmd: 'curl -i https://api.example.com/v1/users -H "Authorization: Bearer $TOKEN"' },
      { term: 'REST', def: 'A common API style: resources at paths, actions expressed as HTTP methods. Not a standard, a convention.' },
      { term: 'GraphQL', def: 'An API style with one endpoint where the client specifies exactly which fields it wants. Fewer round trips, more server complexity.' },
      { term: 'OpenAPI', def: 'A machine-readable description of an API. Feed it to an agent and it can generate a correct client instead of guessing.' }
    ]
  },
  {
    group: 'Tooling & environments',
    items: [
      { term: 'Runtime', def: 'The program that actually executes your code — Node, Bun, Deno, the browser.' },
      { term: 'Package manager', def: 'Downloads and organises other people\'s code. npm, pnpm, yarn, bun.' },
      { term: 'Bundler', def: 'Turns many source files into a few optimised ones a browser or server can run. Turbopack, Vite, webpack, esbuild.' },
      { term: 'Transpile', def: 'Convert code from one form to another — TypeScript and JSX into plain JavaScript.' },
      { term: 'package.json', def: 'Your project manifest: name, scripts, dependencies. The <code>scripts</code> block tells you how to run anything in four seconds.' },
      { term: 'Lockfile', def: 'Records the exact version of every package actually installed, so every machine and CI run gets identical code. Always committed.' },
      { term: 'Semver', also: ['semantic versioning'], def: 'MAJOR.MINOR.PATCH. Major breaks things, minor adds features, patch fixes bugs. <code>^15.4.2</code> allows any 15.x.x.' },
      { term: 'Dependency', def: 'A package your project needs. <code>dependencies</code> run in production; <code>devDependencies</code> are only for building and testing.' },
      { term: 'Linter', def: 'Flags bad ideas in code — unused variables, missing await, forbidden patterns. Catches real bugs, unlike a formatter.' },
      { term: 'Formatter', def: 'Rewrites code layout consistently. Purely cosmetic, fully automatic, not worth arguing about.' },
      { term: 'Typechecker', def: 'Verifies that values actually fit together before anything runs. <code>tsc</code> for TypeScript.' },
      { term: 'Build', def: 'Converting source into something deployable — transpile, bundle, minify, inline build-time values. Stricter than dev mode, which is why it catches things dev misses.' },
      { term: 'Environment', def: 'Local, preview, staging or production. The code is often identical; what differs is whose data and money you can damage.' },
      { term: 'Environment variable', also: ['env var'], def: 'Configuration passed in from outside the code — API keys, database URLs. Real values live in your host, never in the repo.' },
      { term: 'Sandbox', def: 'A policy limiting what a process may touch — this folder, these commands, maybe no network. Only as strong as the policy; always ask what it actually restricts.' },
      { term: 'Container', also: ['Docker'], def: 'An isolated filesystem, process space and network sharing your kernel. Strong isolation, cheap to create and throw away.' },
      { term: 'Virtual machine', also: ['VM'], def: 'A fully simulated computer. The strongest isolation available, and the heaviest.' },
      { term: 'Blast radius', def: 'What is destroyed if something goes as badly as possible. The number you are really setting when you configure permissions.' },
      { term: 'Migration', def: 'A versioned change to your database schema. The one part of the stack Git cannot undo — read every generated migration before it runs.' },
      { term: 'Connection pooling', def: 'Reusing database connections instead of opening one per request. Essential on serverless, where thousands of instances can each try to connect.' }
    ]
  },
  {
    group: 'Agents & harnesses',
    items: [
      { term: 'Model', def: 'The thing that turns text into text — Claude, GPT, Gemini. On its own it cannot open a file or run a command.' },
      { term: 'Harness', def: 'The program that runs the agent loop: offers tools, executes the ones the model requests, feeds results back, enforces permissions. Claude Code and Codex are harnesses.' },
      { term: 'Agent', def: 'A model running inside a harness with tools and a goal. The emergent thing, not a separate product.' },
      { term: 'Agent loop', def: 'Goal in → model requests a tool → harness runs it → result appended → repeat. Every agent product is this plus opinions.' },
      { term: 'Agent tool', def: 'A capability the harness offers the model — read, write, bash, search, fetch. Bash is the one with an unbounded worst case.' },
      { term: 'Context window', also: ['context'], def: 'Everything currently in the conversation. It all competes for attention, which is why long sessions degrade and <code>/clear</code> matters.' },
      { term: 'Token', def: 'The unit models read and write in — roughly ¾ of a word. Context limits and costs are both measured in these.' },
      { term: 'Subagent', def: 'A separate agent with its own context and tools. Returns a summary, keeping its exploration out of your main conversation.' },
      { term: 'Plan mode', def: 'A Claude Code mode (Shift+Tab) where it can research but not edit until you approve a plan. The best default for anything non-trivial.' },
      { term: 'CLAUDE.md', def: 'Auto-loaded standing instructions for Claude Code. <code>~/.claude/CLAUDE.md</code> for you everywhere, repo root for the team.' },
      { term: 'AGENTS.md', def: 'A tool-neutral standing-instructions file at the repo root, read by Codex and a growing number of other tools. Good single source of truth.' },
      { term: 'Skill', def: 'A folder with a SKILL.md of reusable expertise, loaded automatically when a task matches its description.' },
      { term: 'Hook', def: 'A shell command the harness runs at a lifecycle point (PreToolUse, PostToolUse, Stop). Always fires — unlike an instruction, which the model can deprioritise.' },
      { term: 'MCP', def: 'Model Context Protocol — the open standard for connecting external tools and data sources to an agent.' },
      { term: 'Prompt injection', def: 'Malicious instructions hidden in content an agent reads. Defence: instructions come from you, everything a tool returns is data.' },
      { term: 'Hallucination', def: 'Confidently generated content that is not true — an invented API method, a package that was never published. Fluency is not evidence.' },
      { term: 'Headless', def: 'Running an agent non-interactively with one prompt, reading stdin and writing stdout, so it composes with pipes, scripts and CI.', cmd: 'git diff | claude -p "review this diff"' },
      { term: 'Approval policy', def: 'When the harness must stop and ask you. Separate from the sandbox, which decides what it could touch if allowed.' }
    ]
  },
  {
    group: 'Terminal — the basics',
    items: [
      { term: 'Command line', also: ['CLI'], def: 'Driving a computer by typing commands instead of clicking. "CLI" stands for command-line interface — the opposite of a GUI, the windows-and-buttons kind.' },
      { term: 'Terminal emulator', also: ['terminal'], def: 'The app window — Ghostty, iTerm2, Terminal.app. Owns fonts, colours, tabs, splits and copy/paste. It runs no commands itself; it just draws text and passes your keystrokes down.' },
      { term: 'Shell', def: 'The program running inside the terminal window that actually reads your line, works out what you meant, and launches programs. On a modern Mac that is <b>zsh</b>.' },
      { term: 'zsh', def: 'The Z shell — the default shell on macOS since 2019. Fully compatible with most bash instructions you will find online. Its config file is <code>~/.zshrc</code>.', url: 'https://zsh.sourceforge.io' },
      { term: 'bash', def: 'The shell that was standard everywhere for decades, and still the default on most Linux servers. Nearly all tutorials are written for it; nearly all of them work in zsh too.' },
      { term: 'fish', def: 'A third shell, built around good defaults — syntax highlighting and autosuggestions out of the box. Deliberately not fully bash-compatible, so some copy-pasted commands need adjusting.', url: 'https://fishshell.com' },
      { term: 'Prompt', def: 'The text before your cursor telling you where you are — often the folder, the git branch, and a <code>$</code>. Drawn by the shell, and entirely cosmetic.' },
      { term: '~/.zshrc', also: ['zshrc', 'shell config'], def: 'Your zsh config file, in your home folder. Aliases, <code>$PATH</code> changes and shell options go here. It is re-read every time you open a new terminal.' },
      { term: '$PATH', also: ['PATH'], def: 'The list of folders the shell searches when you type a command name. "command not found" almost always means the program exists but its folder is not in your PATH.', cmd: 'echo $PATH' },
      { term: 'Alias', def: 'A shortcut you define for a longer command. Put it in <code>~/.zshrc</code> and it is there in every new terminal.', cmd: 'alias gs="git status"' },
      { term: 'Home directory', also: ['home folder', '~'], def: 'Your personal folder — <code>/Users/you</code> on a Mac. The <code>~</code> character is shorthand for it, so <code>~/projects</code> means <code>/Users/you/projects</code>.' },
      { term: 'Working directory', also: ['current directory'], def: 'The folder your terminal is currently "standing in". Commands act relative to it. <code>pwd</code> prints it; <code>cd</code> changes it.', cmd: 'pwd' },
      { term: 'Argument', def: 'A word you pass to a command to tell it what to act on. In <code>rm notes.txt</code>, the argument is <code>notes.txt</code>.' },
      { term: 'Flag', also: ['option', 'switch'], def: 'A setting passed to a command, written with dashes — <code>-l</code> short form, <code>--long</code> long form. Single-letter flags usually combine: <code>-la</code> is <code>-l -a</code>.' },
      { term: 'readline', def: 'The tiny line editor built into the shell. It is what makes ⌃A, ⌃E, ⌃W and ⌃R work — and it is in the Python REPL, node and psql too.' },
      { term: 'Kill ring', def: 'The shell\'s own buffer holding text you deleted with ⌃W, ⌃U or ⌃K. <code>⌃Y</code> pastes it back. Completely separate from the ⌘C system clipboard.' },
      { term: 'Tab completion', def: 'Pressing Tab to finish a command, path or branch name. One press completes what it can; two presses list the options when it cannot decide.' },
      { term: 'Glob', also: ['wildcard'], def: 'A filename pattern. <code>*</code> matches anything, <code>?</code> one character, <code>**</code> any depth of folders. The shell expands it to real filenames before the command runs.' },
      { term: 'Flow control', def: 'The old terminal feature behind ⌃S (pause output) and ⌃Q (resume). It is why a terminal can look frozen when nothing is actually wrong.' },
      { term: 'Shell integration', def: 'Markers the shell emits so the terminal knows where each command begins and ends — powers prompt-jumping and smarter selection.' },
      { term: 'Quick terminal', def: 'Ghostty\'s global drop-down terminal, toggled from any app with a <code>global:</code> keybind.' },
      { term: 'stdin', def: 'The input stream a program reads. Piping into a command feeds its stdin — which is what makes tools composable.' },
      { term: 'stdout', def: 'The output stream a program writes. Piping sends it to the next command instead of your screen.' },
      { term: 'Pipe', def: 'The <code>|</code> character. Sends one command\'s output into the next command\'s input.', cmd: 'curl -s https://api.example.com/users | jq \'.[].email\'' },
      { term: 'Pager', def: 'A program that holds long output on screen and lets you page through it — usually <code>less</code>. <code>space</code> pages down, <code>/</code> searches, <code>q</code> quits.' }
    ]
  },
  {
    group: 'Proving your ground',
    items: [
      { term: 'Working directory', also: ['current directory', 'cwd'], def: 'The folder your terminal is standing in. <code>git</code>, <code>npm</code> and <code>vercel</code> all resolve against it silently — and walk <em>up</em> the tree if they find nothing here, which is how a command in the wrong folder still does something.', cmd: 'pwd' },
      { term: '--show-current', def: 'The flag that prints your branch and nothing else. The only trustworthy answer to "what branch am I on" — the prompt is a rendering, the workspace name is metadata.', cmd: 'git branch --show-current' },
      { term: 'No-op', def: 'A command that ran successfully and changed nothing. "Already up to date." and "Everything up-to-date" are the two that most often get read as success.' },
      { term: 'Exit code', also: ['$?'], def: 'The number a command returns: 0 success, anything else failure. After a pipe it belongs to the <em>last</em> stage only, unless pipefail is set.', cmd: 'echo $?' },
      { term: 'pipefail', def: 'A shell option making a pipeline report failure if <em>any</em> stage failed, not just the last. Without it, <code>npm run build | tail</code> reports tail\'s success and hides the broken build.', cmd: 'set -o pipefail' },
      { term: 'Command chain', also: ['&&'], def: '<code>a && b</code> runs b only if a succeeded — so a mid-chain failure silently skips everything after it. <code>||</code> runs on failure; <code>;</code> runs regardless.' },
      { term: 'Merge SHA', def: 'The commit created when a pull request merges. The link between "the PR is merged" and "the deployment built the right code" — if your host deployed a different SHA, nothing else matters.' },
      { term: 'Worktree prune', def: 'Drops git\'s records of worktrees whose folders no longer exist. Needed after a folder is deleted by hand, or purged from <code>/tmp</code> by macOS — until you prune, the branch stays locked.', cmd: 'git worktree prune' },
      { term: 'Stranded commits', also: ['unpushed commits'], def: 'Commits that exist only on your machine. Committing protects you from your editor; only pushing protects you from your laptop.', cmd: 'git log --branches --not --remotes --oneline' },
      { term: 'Module resolution', def: 'How Node finds a package: it looks in <code>node_modules</code> here, then walks up the folder tree. A worktree nested inside its parent repo can silently build against the parent\'s dependencies and false-pass.' }
    ]
  },
  {
    group: 'Apps and tools',
    items: [
      { term: 'Ghostty', def: 'A fast, native terminal emulator for macOS and Linux. GPU-accelerated, sane defaults, one plain-text config file, and no plugin system by design.', url: 'https://ghostty.org' },
      { term: 'iTerm2', def: 'The long-standing macOS terminal emulator. Enormously configurable, with a GUI for every setting rather than a config file.', url: 'https://iterm2.com' },
      { term: 'Starship', def: 'A prompt you drop into any shell. Shows your git branch, dirty state and language versions at a glance.', url: 'https://starship.rs', cmd: 'brew install starship' },
      { term: 'ripgrep', also: ['rg'], def: 'A very fast code search tool that respects <code>.gitignore</code> by default.', url: 'https://github.com/BurntSushi/ripgrep', cmd: 'rg "TODO" --type ts' },
      { term: 'fzf', def: 'A fuzzy finder for the terminal. Its best trick is rebinding ⌃R so history search becomes an interactive, filterable list.', url: 'https://github.com/junegunn/fzf' },
      { term: 'zoxide', def: 'A smarter <code>cd</code>. Learns the folders you visit, so <code>z proj</code> jumps to the one you meant.', url: 'https://github.com/ajeetdsouza/zoxide' },
      { term: 'jq', def: 'A command-line JSON processor. Slices and filters API responses without writing a script.', url: 'https://jqlang.github.io/jq/', cmd: 'curl -s api.example.com/users | jq \'.[].email\'' },
      { term: 'gh', def: 'GitHub on the command line — open pull requests, check out someone else\'s PR, read CI results without opening a browser.', url: 'https://cli.github.com', cmd: 'gh pr create --fill' }
    ]
  },
  {
    group: 'Shipping & money',
    items: [
      { term: 'Deploy', also: ['deployment'], def: 'Building your code and putting the result somewhere the public can reach it.' },
      { term: 'Preview deploy', def: 'An automatic deployment of a branch to its own URL, so you can use the change before merging it.' },
      { term: 'Rollback', def: 'Promoting a previous known-good deployment back to production. Instant, and the correct first move during an incident.' },
      { term: 'Cold start', def: 'The delay when a serverless function has to boot before handling a request, instead of reusing a warm instance.' },
      { term: 'Test mode', def: 'A provider mode using fake credentials that cannot move real money or send real messages. Wire every non-production environment to it.' },
      { term: 'Test card', def: 'A fake card number that triggers a specific outcome in test mode — success, decline, requires authentication.' },
      { term: 'Dunning', def: 'The retry-and-notify process when a subscription payment fails, before the subscription is finally cancelled.' },
      { term: 'Chargeback', def: 'A customer disputing a charge with their bank. Costs you the money plus a fee, whether or not you were right.' },
      { term: 'MVP', def: 'The smallest version that delivers the actual value. Defining it honestly is what separates shipped ideas from abandoned ones.' },
      { term: 'Scope creep', def: 'The steady expansion of what you are building. The most common reason a project never launches.' }
    ]
  }
];

export const CHEATS = [
  {
    group: 'Git — every day',
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
    group: 'Prove your ground — before you press enter',
    items: [
      { term: 'The three-command reflex', def: 'Before anything that pushes, merges, deploys or deletes.', cmd: 'pwd                        which repo\ngit branch --show-current   which branch\ngit log -1 --oneline        which commit' },
      { term: 'Make it one word', def: 'Drop into <code>~/.zshrc</code>, then just type <code>where</code>.', cmd: 'where() {\n  echo "📁 $(pwd)"\n  echo "🌿 $(git branch --show-current 2>/dev/null || echo not-a-repo)"\n  echo "📌 $(git log -1 --oneline 2>/dev/null)"\n}' },
      { term: 'Output that means NOTHING happened', def: 'Both are true statements about the branch you are on — neither mentions the branch you meant.', cmd: '"Already up to date."     merge did nothing\n"Everything up-to-date"   push did nothing\n\n→ confirm with: git log -1 --oneline origin/main' },
      { term: 'Trust the exit code', def: 'Put <code>set -euo pipefail</code> at the top of any script that matters.', cmd: 'set -o pipefail          fail a pipe if ANY stage fails\necho $pipestatus         zsh: every stage\'s code\necho ${PIPESTATUS[@]}    bash: same\ncmd_a && cmd_b && echo "✅ all ran"' },
      { term: 'Count lines safely', def: '<code>wc -l</code> counts newlines, so it undercounts output with no trailing newline.', cmd: 'grep -c \'\' file          counts lines properly\ngit rev-list --count HEAD  beats piping into wc' },
      { term: 'Verify a claim yourself', def: 'Cheap to check, expensive to assume.', cmd: 'git rev-parse HEAD       the exact SHA\ngit status -sb           branch + tracking + dirty\ngit log -1 --oneline origin/main   what the remote has' },
      { term: 'Worktree hygiene', def: 'Keep them beside the repo, never in <code>/tmp</code> — macOS purges it and the branch stays locked.', cmd: 'git worktree list        the map\ngit worktree prune       drop records for deleted folders\ngit worktree remove ../proj-done\ngit log --branches --not --remotes --oneline   what exists nowhere else' },
      { term: 'After every worktree add', def: 'Git brings tracked files. node_modules and .env.local are gitignored and never follow.', cmd: 'git worktree add ../proj-feat feature\ncd ../proj-feat\ncp ../proj/.env.local .      # or vercel env pull\nnpm ci\nls node_modules              # must exist HERE' },
      { term: 'Before calling it shipped', def: 'Four links, each with its own evidence.', cmd: '1  gh pr view 42 --json state,mergeCommit\n2  git fetch && git log -1 --oneline origin/main\n3  deployment built THAT SHA?\n4  open it and use the feature' }
    ]
  },
  {
    group: 'Git — getting out of trouble',
    items: [
      { term: 'Discard file edits', def: 'Destroys uncommitted changes to that file.', cmd: 'git restore src/app.js' },
      { term: 'Throw away everything uncommitted', def: 'Untracked files survive — <code>git clean -fd</code> removes those too.', cmd: 'git restore .' },
      { term: 'Unstage, keep edits', def: '', cmd: 'git restore --staged src/app.js' },
      { term: 'Undo last commit, keep work', def: 'Local only.', cmd: 'git reset --soft HEAD~1' },
      { term: 'Undo a pushed commit', def: 'Safe on shared branches — adds a new commit.', cmd: 'git revert <hash>' },
      { term: 'Find lost commits', def: 'The panic button. Then reset to the hash you want.', cmd: 'git reflog' },
      { term: 'Bail out of a merge or rebase', def: 'Restores the exact pre-operation state.', cmd: 'git merge --abort\ngit rebase --abort' },
      { term: 'Untrack a committed secret', def: 'Then add to .gitignore, commit, and rotate the key.', cmd: 'git rm --cached .env' }
    ]
  },
  {
    group: 'Git — power moves',
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
    group: 'HTTP status codes',
    items: [
      { term: 'The families', def: 'The first digit tells you whose fault it is.', cmd: '2xx  it worked\n3xx  look somewhere else\n4xx  YOUR request was wrong\n5xx  THEIR server broke — retrying may help' },
      { term: 'The ones you will meet', def: '401 vs 403 is the distinction people get wrong most.', cmd: '200 OK             fine\n201 Created        made the thing\n204 No Content     fine, nothing to return\n301/302 Moved      follow the Location header\n400 Bad Request    malformed\n401 Unauthorized   who ARE you? (auth)\n403 Forbidden      I know you. No. (permission)\n404 Not Found      no such thing\n409 Conflict       clashes with current state\n422 Unprocessable  shape ok, values invalid\n429 Too Many       rate limited — back off\n500 Server Error   they broke\n502/503/504        upstream down or timed out' }
    ]
  },
  {
    group: 'curl & jq',
    items: [
      { term: 'GET with headers shown', def: '<code>-i</code> includes status and headers.', cmd: 'curl -i https://api.example.com/v1/users \\\n  -H "Authorization: Bearer $TOKEN"' },
      { term: 'POST some JSON', def: '<code>-d</code> implies POST.', cmd: 'curl -X POST https://api.example.com/v1/users \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"you@example.com"}\'' },
      { term: 'See the whole conversation', def: 'Including TLS and redirects.', cmd: 'curl -v -L https://example.com' },
      { term: 'Pretty-print and filter', def: '<code>-s</code> silences the progress meter so the pipe stays clean.', cmd: 'curl -s https://api.example.com/users | jq\ncurl -s … | jq \'.[] | .email\'\ncurl -s … | jq \'.data | length\'' },
      { term: 'Test a webhook locally', def: 'Prints a signing secret — use that one locally, not the dashboard one.', cmd: 'stripe listen --forward-to localhost:3000/api/webhooks/stripe\nstripe trigger checkout.session.completed' }
    ]
  },
  {
    group: 'Node & packages',
    items: [
      { term: 'Install', def: '<code>ci</code> is for CI — exact lockfile, fails if out of sync.', cmd: 'npm install          pnpm install\nnpm ci               pnpm install --frozen-lockfile\nnpm run dev          pnpm dev\nnpm run build        pnpm build\nnpm test             pnpm test' },
      { term: 'Inspect', def: '', cmd: 'npm ls <pkg>         which version is actually installed\nnpm outdated         what could be upgraded\nnpm audit            known vulnerabilities' },
      { term: 'Semver ranges', def: 'Caret is the default and allows minor upgrades.', cmd: '^15.4.2   any 15.x.x   (features + fixes)\n~15.4.2   any 15.4.x   (fixes only)\n 15.4.2   exactly this' },
      { term: 'Prisma', def: 'Never <code>db push</code> against production — no history, can drop data.', cmd: 'npx prisma migrate dev --name add_subscription\nnpx prisma migrate deploy   # CI / production\nnpx prisma studio           # browse the data' }
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
    group: 'Terminal — move the cursor',
    items: [
      { term: 'Jump', def: 'Works in zsh, bash, psql, node, python — anything using readline.', cmd: '⌃A          start of line\n⌃E          end of line\n⌥← / ⌥→     back / forward one word\n← / →       one character' },
      { term: 'Delete', def: 'Stop holding backspace. ⌃W stops at spaces; ⌥⌫ also stops at / . -', cmd: '⌃W          delete word before cursor\n⌥⌫          delete word, stopping at punctuation\n⌥D          delete word AFTER cursor\n⌃U          delete everything before cursor\n⌃K          delete everything after cursor\n⌃T          swap the two characters at the cursor' },
      { term: 'Undelete', def: 'The kill ring — separate from the ⌘C clipboard.', cmd: '⌃Y          paste back whatever you last killed' },
      { term: 'Recall', def: 'Search beats scrolling once history is more than three deep.', cmd: '↑ / ↓       step through history\n⌃R          reverse search  (⌃R again = further back)\n⌃G          abort the search\n⌥.          insert last argument of previous command\n!!          the whole previous command  (sudo !!)\n!$          its last argument            (cd !$)' }
    ]
  },
  {
    group: 'Terminal — when things go wrong',
    items: [
      { term: 'Stop things', def: '⌃D at an empty prompt closes the window — that is why they vanish.', cmd: '⌃C          interrupt the running program\n⌃D          end of input (exits the shell if line is empty)\n⌃Z          suspend it       → fg to resume, bg for background\njobs        what have I suspended?' },
      { term: 'Terminal looks frozen', def: 'Almost always ⌃S. Try this before closing anything.', cmd: '⌃Q          resume output  ← try this FIRST\n⌃C          interrupt\nstty -ixon  add to ~/.zshrc to disable ⌃S for good' },
      { term: 'Too much output', def: 'Send it somewhere that waits for you.', cmd: 'cmd | less      page through it\ncmd | head      first 10 lines\ncmd | tail -20  last 20\ntail -f app.log follow live (⌃C to stop)\n\nin less:  space page  ·  b back  ·  /find  ·  n next  ·  q quit' },
      { term: 'Clear the screen', def: '⌃L keeps your scrollback; ⌘K actually erases it.', cmd: '⌃L          scroll prompt to top (history kept)\n⌘K          clear screen AND scrollback (Ghostty)' }
    ]
  },
  {
    group: 'Terminal — quoting & patterns',
    items: [
      { term: 'Quoting', def: 'The shell splits on spaces before the command ever runs.', cmd: 'rm "My Notes.txt"    spaces need quotes\nrm My\\ Notes.txt     or a backslash\n"$HOME"              double quotes DO expand variables\n\'$HOME\'              single quotes expand nothing' },
      { term: 'Globs', def: 'Expanded by the shell, not the command. Always <code>ls</code> before you <code>rm</code>.', cmd: '*.log            anything ending .log\nsrc/**/*.ts      any depth of folders\nfile?.txt        exactly one character\ncp cfg.json{,.bak}   brace expansion\nmkdir -p src/{api,web,shared}' },
      { term: 'Tools worth installing', def: 'Start with zoxide and fzf.', cmd: 'brew install starship fzf zoxide eza ripgrep bat jq atuin gh' }
    ]
  },
  {
    group: 'Agents',
    items: [
      { term: 'Claude Code essentials', def: '', cmd: 'Shift+Tab   cycle plan / auto-accept mode\nEsc         interrupt now\nEsc Esc     rewind and edit an earlier message\n@file       reference a file precisely\n!cmd        run a shell command into context\n#note       write to CLAUDE.md memory\n/clear      wipe context between tasks\n/compact    summarise and continue' },
      { term: 'Claude Code ↔ Codex', def: 'Concepts map; confirm exact flags with <code>--help</code> on your version.', cmd: 'interactive     claude              codex\none-shot        claude -p "…"       codex exec "…"\nmemory file     CLAUDE.md           AGENTS.md\nconfig          settings + /cmds    ~/.codex/config.toml\nsafety dial     permission modes    sandbox + approval policy\nresume          claude -c           codex resume' },
      { term: 'Piping into an agent', def: 'Both read stdin, so they compose with everything.', cmd: 'git diff | claude -p "review this diff"\ngit diff main... | codex exec "list concrete bugs only"' },
      { term: 'Parallel agents, safely', def: 'One worktree per agent. Never two in one folder.', cmd: 'git worktree add ../proj-a feature-a\ngit worktree add ../proj-b feature-b\ncd ../proj-a && claude' }
    ]
  }
];
