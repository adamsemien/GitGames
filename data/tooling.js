/* ============================================================
   TRACK: Tooling
   A — the dev toolchain (what all this stuff in my project is)
   B — the agent's tools (what an agent can actually do to you)
   ============================================================ */
const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });

export const tooling = {
  id: 'tooling',
  name: 'Tooling',
  emoji: '🔧',
  glow: '#7cff7c',
  time: '~40 min',
  desc: 'What all that stuff in your project actually is — package managers, lockfiles, semver, linters, builds — and what tools an agent really has when it works on your code.',
  chapters: [
    {
      title: 'Chapter 1 — Your project, decoded',
      desc: 'Every file and folder you did not create yourself.',
      nodes: [
        {
          id: 'tl-01', name: 'Runtime vs manager vs bundler', ico: '🧩',
          steps: [
            L('Three different jobs people constantly confuse', [
              { ul: [
                '<strong>Runtime</strong> — the thing that actually executes your code. Node, Bun, Deno, the browser. <code>node -v</code> tells you which and what version.',
                '<strong>Package manager</strong> — downloads and organises other people\'s code. npm, pnpm, yarn, bun.',
                '<strong>Bundler / compiler</strong> — turns your source into something a browser or server can run. Turbopack, webpack, Vite, esbuild, tsc.'
              ] },
              { p: 'They are separate because they change independently. You can swap npm for pnpm without touching your code. You can change bundler without changing runtime. Knowing which layer an error came from is half of fixing it.' },
              { call: { k: 'tip', t: 'Diagnosing by layer:', p: '"Cannot find module" → package manager. "Unexpected token" in your own code → bundler/compiler. "undefined is not a function" at runtime → your logic. Three very different searches.' } }
            ]),
            Q('<code>npm install</code> succeeded but the app crashes with "Cannot find module".',
              ['Reinstall Node', 'Something imports a package that is not in package.json — or the install went to a different folder', 'The bundler is broken', 'Delete the lockfile'],
              1,
              'A successful install means everything <em>declared</em> was fetched. A missing module means something undeclared is being imported — often a transitive dependency someone relied on by accident.')
          ]
        },
        {
          id: 'tl-02', name: 'package.json', ico: '📦',
          steps: [
            L('The manifest for your project', [
              { term: '{\n  "name": "my-app",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "test": "vitest"\n  },\n  "dependencies":    { "next": "^15.0.0" },\n  "devDependencies": { "vitest": "^2.0.0" }\n}' },
              { ul: [
                '<strong>scripts</strong> — named commands. <code>npm run dev</code> runs whatever <code>dev</code> maps to. This is where a new project tells you how to start it.',
                '<strong>dependencies</strong> — needed to <em>run</em> the app in production.',
                '<strong>devDependencies</strong> — only needed to build or test. Not shipped.'
              ] },
              { call: { k: 'tip', t: 'First thing to read in any repo:', p: 'The <code>scripts</code> block. It tells you how to run, build and test the project in about four seconds — faster than any README.' } }
            ]),
            Q('Putting your test runner in <code>dependencies</code> instead of <code>devDependencies</code> means…',
              ['Nothing at all', 'It gets installed in production — bigger, slower builds and more attack surface', 'Tests will not run', 'It breaks the lockfile'],
              1,
              'Everything you ship is something that can have a vulnerability. Production installs should carry only what production actually runs.')
          ]
        },
        {
          id: 'tl-03', name: 'Lockfiles', ico: '🔒',
          steps: [
            L('Why that huge file is committed', [
              { p: '<code>package.json</code> says <code>"next": "^15.0.0"</code> — a <em>range</em>. The <strong>lockfile</strong> (<code>package-lock.json</code>, <code>pnpm-lock.yaml</code>) records the exact version of every package and every sub-dependency that was actually installed.' },
              { p: 'Without it, you and CI and your teammate all resolve that range on different days and get different code. "Works on my machine" is very often a lockfile problem.' },
              { term: '<span class="c">$ npm install</span>   <span class="o"># may update the lockfile</span>\n<span class="c">$ npm ci</span>        <span class="o"># installs EXACTLY the lockfile, fails if out of sync</span>' },
              { call: { k: 'warn', t: 'Always commit the lockfile.', p: 'It is not clutter, it is the reproducibility of your build. Deleting it to "fix" an install is a last resort, and it should be a deliberate, reviewed commit.' } },
              { call: { k: 'tip', t: 'Use <code>npm ci</code> in CI:', p: 'That is literally what it is for. It is faster, and it fails loudly when the lockfile and package.json disagree instead of quietly papering over it.' } }
            ]),
            B('Install exactly what the lockfile specifies, for CI.',
              ['npm', 'ci'], ['install', 'i', '--frozen', 'update', '--exact'],
              '<code>npm ci</code> wipes <code>node_modules</code> and installs strictly from the lockfile. The pnpm equivalent is <code>pnpm install --frozen-lockfile</code>.',
              'Two letters — it stands for "clean install".')
          ]
        },
        {
          id: 'tl-04', name: 'Semver and the caret', ico: '🔢',
          steps: [
            L('MAJOR . MINOR . PATCH', [
              { term: '<span class="h">15</span> . <span class="h">4</span> . <span class="h">2</span>\n<span class="o">│    │   └─ PATCH  bug fixes, nothing breaks</span>\n<span class="o">│    └───── MINOR  new features, still backwards compatible</span>\n<span class="o">└────────── MAJOR  breaking changes, read the migration guide</span>' },
              { ul: [
                '<code>^15.4.2</code> — allow any 15.x.x. Features and fixes, no breaking changes. The default.',
                '<code>~15.4.2</code> — allow 15.4.x only. Patches only.',
                '<code>15.4.2</code> — exactly this. Nothing moves.'
              ] },
              { call: { k: 'warn', t: 'The caret trap:', p: '<code>^</code> means a fresh install months later can pull a newer minor version than you ever tested against. Usually fine. Occasionally it is a mystery bug that appears only in CI, on a clean install, with no code change. This is the lockfile\'s whole reason to exist.' } },
              { call: { t: 'Semver is a promise, not a guarantee:', p: 'Maintainers are human. A "patch" release can still break you. Which is, again, why you pin with a lockfile and upgrade deliberately.' } }
            ]),
            Q('<code>"react": "^18.2.0"</code> — which versions may install?',
              ['Only 18.2.0', 'Any 18.x.x at or above 18.2.0', 'Any version at or above 18.2.0 including 19', 'Only 18.2.x'],
              1,
              'Caret allows minor and patch, never major. 19.0.0 would be a breaking change, so it is excluded — which is exactly what you want.')
          ]
        },
        {
          id: 'tl-05', name: 'Linters, formatters, typecheckers', ico: '✅',
          steps: [
            L('Three tools, three different questions', [
              { ul: [
                '<strong>Formatter</strong> (Prettier, Biome) — "is it laid out consistently?" Purely cosmetic, fully automatic, never argue about it.',
                '<strong>Linter</strong> (ESLint, Biome) — "is this a bad idea?" Unused variables, missing await, forbidden patterns. Catches real bugs.',
                '<strong>Typechecker</strong> (<code>tsc</code>) — "do these values actually fit together?" Catches whole categories of runtime error before you run anything.'
              ] },
              { call: { k: 'tip', t: 'This is the highest-leverage thing you can set up for AI-assisted work:', p: 'Each of these is a fast, deterministic, machine-readable check. An agent can run them and fix its own mistakes in a loop, with no round trip through you. A project with strict types and a linter gets dramatically better agent output than one without — same model, same prompt.' } },
              { call: { t: 'Wire the formatter to a hook:', p: 'A PostToolUse hook running your formatter after every edit means you never see whitespace noise in a diff again.' } }
            ]),
            Q('Why does a strict TypeScript setup improve agent output so much?',
              ['Models are trained more on TypeScript', 'It creates a fast automatic feedback loop the agent can use to catch and fix its own errors', 'It reduces token usage', 'It makes the code shorter'],
              1,
              'The win is the loop, not the language. Any fast, deterministic check — types, tests, lint — lets an agent verify itself instead of handing you a guess.')
          ]
        },
        {
          id: 'tl-06', name: 'Tests as a contract', ico: '🧪',
          steps: [
            L('The instruction that cannot be misread', [
              { p: 'A test is an executable specification. "Make this pass" is unambiguous in a way that no English sentence is — and both you and an agent can check it instantly.' },
              { term: '<span class="c">$ npm test</span>              <span class="o"># run everything</span>\n<span class="c">$ npm test -- --watch</span>    <span class="o"># rerun on save</span>\n<span class="c">$ npm test cart</span>         <span class="o"># just matching files</span>' },
              { ul: [
                '<strong>Unit</strong> — one function in isolation. Fast, precise, run constantly.',
                '<strong>Integration</strong> — several pieces together, often with a real database.',
                '<strong>End-to-end</strong> — drives the real app in a browser. Slow, brittle, but the only thing that proves it actually works.'
              ] },
              { call: { k: 'tip', t: 'The bug-fixing pattern worth adopting:', p: 'Write a failing test that reproduces the bug <em>first</em>. Then "make it pass". You get a guaranteed-correct fix and permanent protection against the bug returning — and the agent has an objective target instead of your description.' } }
            ]),
            Q('Best way to hand an agent a bug so it fixes the right thing?',
              ['Describe it carefully', 'A failing test that reproduces it', 'Point at the file you suspect', 'Paste the whole codebase'],
              1,
              'A failing test is unambiguous, verifiable, and survives after the fix. Descriptions get interpreted; tests get satisfied.')
          ]
        },
        {
          id: 'tl-07', name: 'What "build" does', ico: '🏗️',
          steps: [
            L('Source in, deployable out', [
              { p: 'Your source is written for humans and for your toolchain — TypeScript, JSX, imports, environment switches. None of that runs directly. A <strong>build</strong> converts it into something a runtime can execute.' },
              { ul: [
                '<strong>Transpile</strong> — TypeScript and JSX become plain JavaScript.',
                '<strong>Bundle</strong> — hundreds of files become a few, so the browser makes fewer requests.',
                '<strong>Tree-shake and minify</strong> — drop unused code, strip whitespace and long names.',
                '<strong>Inline build-time values</strong> — certain env vars get baked into the output permanently.'
              ] },
              { call: { k: 'warn', t: 'This is where "works locally, fails on deploy" is born:', p: 'Dev mode is forgiving; the build is not. Type errors that dev skipped, case-sensitive import paths that only fail on Linux, and missing env vars all surface here. Run <code>npm run build</code> locally before you push and you will catch nearly all of it.' } }
            ]),
            Q('It runs fine with <code>npm run dev</code> but the Vercel build fails.',
              ['Vercel is broken', 'The build enforces things dev skips — types, case-sensitive paths, missing env vars', 'You need a bigger plan', 'A dependency is missing'],
              1,
              'Dev mode optimises for speed and iteration; the build optimises for correctness and output size. Running the real build locally is the fastest way to reproduce it.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 — The agent\'s tools',
      desc: 'What an agent can actually do — and what each one can break.',
      nodes: [
        {
          id: 'tl-08', name: 'The toolbox', ico: '🧰',
          steps: [
            L('What an agent actually has', [
              { p: 'A model on its own can only produce text. Everything else is a <strong>tool</strong> the harness offers it. The list is short, and each entry has a different worst case.' },
              { ul: [
                '<strong>Read</strong> — open a file. Worst case: reads a secret into context.',
                '<strong>Search / Grep / Glob</strong> — find things. Cheap and safe; the main cost is flooding context.',
                '<strong>Write / Edit</strong> — change files. Worst case: overwrites work you had not committed.',
                '<strong>Bash</strong> — run anything. Worst case: <em>anything</em>. This is the one that matters.',
                '<strong>Fetch / WebSearch</strong> — pull in outside content. Worst case: brings in prompt injection.',
                '<strong>MCP tools</strong> — your other services. Worst case: acts on a real system — sends, posts, deletes.'
              ] },
              { call: { k: 'tip', t: 'Ranked by blast radius:', p: 'Bash and MCP are in a different category from the rest. A bad Read wastes tokens. A bad Bash deletes a database. Approval settings should reflect that asymmetry rather than treating all tools alike.' } }
            ]),
            Q('Which tool deserves the most caution?',
              ['Read — it might see secrets', 'Bash — it can run literally anything on your machine', 'Search — it uses a lot of context', 'Write — it changes files'],
              1,
              'Every other tool has a bounded worst case. Bash is unbounded: package installs, network calls, deletions, credential access. It is the tool the sandbox exists for.')
          ]
        },
        {
          id: 'tl-09', name: 'Permission modes', ico: '🚧',
          steps: [
            L('The dial between speed and safety', [
              { ul: [
                '<strong>Ask every time</strong> — maximum control, exhausting. Right for unfamiliar or destructive work.',
                '<strong>Plan mode</strong> — read and research freely, no changes until you approve a plan. The best default for anything non-trivial.',
                '<strong>Auto-accept edits</strong> — file changes flow, commands still ask. A good working middle for a repo under version control.',
                '<strong>Full auto</strong> — nothing asks. Only appropriate when the environment is disposable.'
              ] },
              { call: { k: 'tip', t: 'Allowlist the boring stuff:', p: 'Approving <code>npm test</code> for the hundredth time trains you to click Yes without reading — which is exactly when the dangerous one slips through. Allowlist safe commands so the prompts you <em>do</em> get are meaningful.' } },
              { call: { k: 'warn', t: 'Approval fatigue is a real security failure mode.', p: 'A prompt you no longer read is not protection. Fewer, better prompts beat more prompts.' } }
            ]),
            Q('Why is allowlisting safe commands a security improvement, not a compromise?',
              ['It is faster', 'Constant trivial prompts train you to approve without reading — so the dangerous one gets waved through too', 'It uses fewer tokens', 'It is not, it is a compromise'],
              1,
              'Attention is the scarce resource. Every meaningless prompt spends some. Removing noise is what makes the remaining signal work.')
          ]
        },
        {
          id: 'tl-10', name: 'Git is the real seatbelt', ico: '🪢',
          steps: [
            L('What actually protects you', [
              { p: 'Permission prompts help, but they are a judgement call made in a hurry. The thing that reliably protects you is that <strong>every change is recoverable</strong>.' },
              { ul: [
                'Commit before you let an agent loose. That is the restore point.',
                'Work on a branch, never directly on main.',
                '<code>git diff</code> before every commit — read what actually changed, not what you were told changed.',
                '<code>git restore .</code> undoes an agent\'s uncommitted mess in one command.',
                'A worktree per agent means two agents can never collide.'
              ] },
              { call: { k: 'tip', t: 'The mindset shift:', p: 'You are not trying to prevent every mistake — that is impossible and it makes you slow. You are making mistakes cheap. An uncommitted afternoon is the only genuinely unrecoverable thing in this entire workflow.' } }
            ]),
            B('Throw away every uncommitted change an agent made.',
              ['git', 'restore', '.'], ['reset', '--hard', 'clean', '-fd', 'revert'],
              '<code>git restore .</code> reverts tracked files to the last commit. Brand-new untracked files survive — <code>git clean -fd</code> removes those too, so check <code>git status</code> first.',
              'Verb, then the dot for "everything here".')
          ]
        },
        {
          id: 'tl-11', name: 'Context is a resource', ico: '🧠',
          steps: [
            L('Why your session gets worse over time', [
              { p: 'Everything the agent reads stays in the conversation: file contents, command output, search results, dead ends. It all competes for attention with your actual question.' },
              { ul: [
                '<code>/clear</code> between unrelated tasks. Far more often than feels natural.',
                'Delegate wide searches to a subagent — it reads 400 files and hands you six lines.',
                'Point with <code>@file</code> instead of describing. Skips the whole hunting phase.',
                'Trim MCP servers you do not use — each one costs context in every session.'
              ] },
              { call: { k: 'tip', t: 'The counter-intuitive one:', p: 'When a long session starts producing worse answers, starting fresh with a clear spec usually beats pushing on. An hour of corrections and abandoned approaches is an hour of noise the model is still weighing.' } }
            ]),
            Q('An agent needs to check 300 files for a pattern. Cheapest approach?',
              ['Read them all in the main conversation', 'Send a subagent, which returns only the conclusion', 'Ask it to guess', 'Split across many sessions'],
              1,
              'The subagent burns its own context on the raw material and returns a summary. Your conversation stays clean, which keeps every answer after it sharper.')
          ]
        },
        {
          id: 'tl-12', name: 'Your CLI toolbelt', ico: '⚒️',
          steps: [
            L('Worth installing today', [
              { term: '<span class="c">$ brew install ripgrep fzf zoxide jq bat eza gh</span>' },
              { ul: [
                '<strong>ripgrep</strong> (<code>rg</code>) — search code fast, respects <code>.gitignore</code> by default.',
                '<strong>fzf</strong> — fuzzy-pick anything; upgrades <code>⌃R</code> history search enormously.',
                '<strong>zoxide</strong> — <code>z proj</code> jumps to the folder you meant. Retires <code>cd ../../..</code>.',
                '<strong>jq</strong> — slice JSON on the command line. Pairs with <code>curl</code> constantly.',
                '<strong>bat</strong> — <code>cat</code> with syntax highlighting.',
                '<strong>gh</strong> — GitHub from the terminal: <code>gh pr create</code>, <code>gh pr checkout 42</code>.'
              ] },
              { term: '<span class="o"># the combination you will use most</span>\n<span class="c">$ curl -s https://api.example.com/users | jq \'.[] | .email\'</span>' },
              { call: { k: 'tip', t: 'Why this matters for agents too:', p: 'These are the tools an agent reaches for in Bash. A machine with <code>rg</code> and <code>jq</code> installed gets faster, cleaner tool calls than one without — you are upgrading the agent\'s hands, not just yours.' } }
            ]),
            B('Pull just the email field out of a JSON array from an API.',
              ['curl', '-s', 'https://api.example.com/users', '|', 'jq', "'.[] | .email'"],
              ['-i', 'grep', 'cat', '-X', 'awk'],
              '<code>-s</code> silences the progress meter so the pipe stays clean. <code>jq \'.[]\'</code> iterates the array; <code>.email</code> picks one field from each item.',
              'Fetch quietly, pipe into the JSON tool, then the filter.')
          ]
        }
      ]
    }
  ]
};
