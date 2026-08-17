/* ============================================================
   TRACK: Prove Your Ground
   Built from real incidents, May–Aug 2026. Every level here is a
   mistake that actually happened and cost real time.

   The through-line: every one of them is a state-visibility
   failure — acting on where you THINK you are instead of checking
   where you ARE.
   ============================================================ */
import { threeNames, cwdResolves, shipChain, worktreeDiagram } from './svg.js';

const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });

export const ground = {
  id: 'ground',
  name: 'Prove Your Ground',
  emoji: '🧭',
  glow: '#ff5c6e',
  time: '~50 min',
  desc: 'The mistakes that actually cost you time: the prompt that lied, the merge that did nothing, the worktree with no node_modules, the deploy that shipped nothing. One reflex fixes all of them.',
  chapters: [
    {
      title: 'Chapter 1 — Where am I, really?',
      desc: 'Three names, none of which checks the others.',
      nodes: [
        {
          id: 'pg-01', name: 'The prompt lies', ico: '🎭',
          steps: [
            L('Workspace, folder, branch — three separate things', [
              { p: 'A branch called <code>san-antonio</code> got pushed. It had never existed. <code>san-antonio</code> was the <em>workspace</em> name; the actual branch was <code>event-render-bug</code>.' },
              { svg: threeNames },
              { p: 'Nothing keeps these three in sync. Your tool names a workspace whatever you typed. The folder is named whatever it was created as. The branch is whatever git says — and only git knows.' },
              { call: { k: 'warn', t: 'The prompt is decoration:', p: 'That branch name in your prompt is drawn by Starship or your theme. It is a <em>rendering</em> of state, one refresh behind, and in a split or a restored window it can be stale or simply wrong. It is not a source of truth.' } },
              { call: { k: 'tip', t: 'One command, zero ambiguity:', p: '<code>git branch --show-current</code> prints exactly one line: the branch you are on. Nothing else. Run it before anything that pushes.' } }
            ]),
            B('Print the branch you are actually on — nothing else.',
              ['git', 'branch', '--show-current'],
              ['status', '--current', '-a', '--list', 'HEAD'],
              'One line, no decoration, no guessing. <code>git status -sb</code> also shows it plus tracking info if you want more context.',
              'The flag says exactly what it does.'),
            Q('Your prompt shows <code>main</code> and your workspace is called <code>hotfix-login</code>. What branch will <code>git push</code> use?',
              ['<code>main</code> — the prompt is authoritative', '<code>hotfix-login</code> — the workspace defines it',
               'Whatever <code>git branch --show-current</code> says — the other two are labels', 'It will ask you'],
              2,
              'Only git knows. The workspace name is metadata from another tool; the prompt is a rendering that can lag or be misconfigured. Neither is consulted by push.')
          ]
        },
        {
          id: 'pg-02', name: 'Two terminals that look alike', ico: '👯',
          steps: [
            L('Same font, same theme, different repo', [
              { p: 'Commands landing in the wrong window is not carelessness — it is a design problem. Two shells with identical prompts give you no way to tell them apart at a glance, and you are switching between them at speed.' },
              { h: 'Make them visually distinct' },
              { ul: [
                'One tab per project and <strong>rename the tab</strong> — most terminals let you set a title per tab.',
                'Give each project a different theme or a coloured background. Wrong colour, wrong window, caught before you type.',
                'Put the <strong>folder name</strong> in your prompt, not just the branch. Starship does this by default.',
                'Use worktrees so each window is physically a different directory rather than the same one on a different branch.'
              ] },
              { call: { k: 'tip', t: 'The cheap fix:', p: 'Before any command with consequences, one line: <code>pwd && git branch --show-current</code>. It costs a second, it prints your ground truth, and it is in your history so ↑ recalls it forever.' } }
            ]),
            B('Print where you are and what branch you are on, in one line.',
              ['pwd', '&&', 'git', 'branch', '--show-current'],
              ['||', ';', 'ls', 'status', 'echo'],
              '<code>&&</code> runs the second command only if the first succeeded. Two facts, one keystroke of recall. Worth making an alias.',
              'Command, the and-and operator, then the branch command.'),
            Q('You realise you have run three commands in the wrong terminal window. First thing to do?',
              ['Run them again in the right one', 'Find out what the wrong window actually did — <code>git status</code> and <code>git log -1</code> there first',
               'Close the window', 'Nothing, they probably failed'],
              1,
              'You do not yet know whether they failed harmlessly or committed to the wrong repo. Establish what happened before adding more actions on top of it.')
          ]
        },
        {
          id: 'pg-03', name: 'Where you stand decides what happens', ico: '📍',
          steps: [
            L('Every command has an implicit "here"', [
              { p: 'A Vercel environment variable landed on the wrong project. The command was correct. It was run from the wrong folder.' },
              { svg: cwdResolves },
              { ul: [
                '<strong>vercel</strong> reads <code>.vercel/project.json</code> from the current directory to decide which project you mean.',
                '<strong>npm</strong> reads the nearest <code>package.json</code> — walking <em>up</em> the tree if there is not one here.',
                '<strong>git</strong> finds the nearest <code>.git</code>, also by walking up.'
              ] },
              { call: { k: 'warn', t: 'Walking up is the dangerous part:', p: 'None of these fail loudly when you are in the wrong place. They quietly find <em>something</em> one level up and act on it. That is how a command run in <code>~</code> can still do something — just not what you meant.' } },
              { call: { k: 'tip', t: 'Before a consequential command, predict:', p: 'Ask yourself which project this will hit, then check. <code>pwd</code> for git and npm; <code>vercel project ls</code> or the <code>.vercel/project.json</code> file for Vercel.' } }
            ]),
            Q('You paste <code>git merge feature</code> while sitting in <code>~</code>. What happens?',
              ['It merges in your last-used repo', 'It errors — no <code>.git</code> anywhere above <code>~</code>',
               'It merges in whichever repo the branch exists in', 'It silently does nothing'],
              1,
              'Git walks up from the current directory looking for <code>.git</code> and gives up at the filesystem root — "not a git repository". Harmless here. The dangerous version is when there <em>is</em> a repo above you and it finds the wrong one.')
          ]
        },
        {
          id: 'pg-04', name: 'The three-command reflex', ico: '🧭',
          steps: [
            L('pwd · branch · log -1', [
              { p: 'This is the whole track compressed into one habit. Before anything that pushes, merges, deploys or deletes:' },
              { term: '<span class="c">$ pwd</span>\n<span class="o">/Users/you/code/nobc-os</span>              <span class="h">← which repo</span>\n\n<span class="c">$ git branch --show-current</span>\n<span class="o">event-render-bug</span>                     <span class="h">← which branch</span>\n\n<span class="c">$ git log -1 --oneline</span>\n<span class="o">9a4b2c1 Fix event render on mobile</span>     <span class="h">← which commit</span>' },
              { call: { k: 'tip', t: 'Make it one word:', p: 'Put this in <code>~/.zshrc</code> and type <code>where</code> instead:' } },
              { term: 'where() {\n  echo "📁 $(pwd)"\n  echo "🌿 $(git branch --show-current 2>/dev/null || echo \'not a repo\')"\n  echo "📌 $(git log -1 --oneline 2>/dev/null)"\n}' },
              { call: { t: 'Why three and not one:', p: 'Directory tells you which project. Branch tells you what push will target. Last commit tells you whether your work is actually committed — the difference between "my changes are safe" and "they are still only on disk".' } }
            ]),
            Q('Which of the three catches "I thought I committed that"?',
              ['<code>pwd</code>', '<code>git branch --show-current</code>', '<code>git log -1</code> — if your change is not the top commit, it is not committed', 'None of them'],
              2,
              'The last commit is the fastest check that your work actually exists in history. Uncommitted work is the one thing in this whole workflow git cannot recover for you.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 — Output is a claim, not a fact',
      desc: 'Calm messages that mean nothing happened.',
      nodes: [
        {
          id: 'pg-05', name: '"Everything up-to-date"', ico: '😶',
          steps: [
            L('The most expensive reassuring message in git', [
              { p: 'A merge and a push were run — while still standing on the feature branch. Both succeeded. Both did nothing. It looked completely done.' },
              { term: '<span class="c">$ git branch --show-current</span>\n<span class="o">feature/event-render</span>          <span class="h">← still here</span>\n\n<span class="c">$ git merge feature/event-render</span>\n<span class="o">Already up to date.</span>          <span class="h">← merging a branch into itself</span>\n\n<span class="c">$ git push</span>\n<span class="o">Everything up-to-date</span>        <span class="h">← feature was already pushed</span>' },
              { h: 'What these actually mean' },
              { ul: [
                '<strong>"Already up to date."</strong> — the branch you named has no commits that this branch lacks. Merging a branch into <em>itself</em> always says this.',
                '<strong>"Everything up-to-date"</strong> — the remote already has every commit on this branch. It says nothing about <code>main</code>.'
              ] },
              { call: { k: 'warn', t: 'Neither message mentions the branch you meant:', p: 'Both are true statements about the branch you are standing on. Neither is a claim about main, and neither is an error — so nothing stops you.' } }
            ]),
            Q('You want feature merged into main. You are on <code>feature</code> and run <code>git merge feature</code>, then <code>git push</code>. Both succeed. What is on main?',
              ['Your feature work', 'Nothing new — you merged the branch into itself and pushed the branch to itself',
               'A merge commit', 'It depends on branch protection'],
              1,
              'Merge always pulls the named branch <em>into the one you are on</em>. To get feature onto main you must first <code>git switch main</code>. Standing in the wrong place made two commands into two no-ops.'),
            B('Get onto main and pull the latest before merging anything into it.',
              ['git', 'switch', 'main', '&&', 'git', 'pull'],
              ['checkout', 'merge', '||', 'push', 'fetch'],
              'Switch first, pull second, merge third. Chained with <code>&&</code> so a failed switch stops the whole thing instead of pulling into the wrong branch.',
              'Switch, the branch, the and-and, then pull.')
          ]
        },
        {
          id: 'pg-06', name: 'The && chain that stopped early', ico: '⛓️',
          steps: [
            L('One link failed, everything after it never ran', [
              { p: 'A merge failed with <em>"not something we can merge"</em>. The deploy in the same chain still appeared to run. It shipped unchanged main — nothing was deployed, and it looked like a successful deploy.' },
              { term: '<span class="c">$ git merge feture && vercel --prod</span>\n<span class="o">merge: feture - not something we can merge</span>\n<span class="h">← vercel never ran. no error about that. no output about that.</span>' },
              { ul: [
                '<code>a && b</code> — run b <strong>only if</strong> a succeeded. A failure silently skips the rest.',
                '<code>a || b</code> — run b only if a <strong>failed</strong>.',
                '<code>a ; b</code> — run b regardless. Rarely what you want for anything consequential.'
              ] },
              { call: { k: 'warn', t: 'The trap is a chain that half-ran:', p: 'You see output from the first command and assume the rest followed. Count the outputs. Three chained commands should produce three commands\' worth of output.' } },
              { call: { k: 'tip', t: 'Say so out loud:', p: 'End a chain with <code>&& echo "✅ all steps ran"</code>. If you do not see the tick, something upstream stopped and you know it immediately.' } }
            ]),
            Q('<code>npm test && npm run build && vercel --prod</code>. Tests fail. What deployed?',
              ['The last good build', 'Nothing — build and deploy never ran', 'It deployed anyway', 'Only the build ran'],
              1,
              'That is <code>&&</code> working correctly — it is a safety feature. The danger is misreading a short output as "it all ran", when it actually means it stopped at step one.'),
            B('Run the tests, then deploy only if they pass, and print a confirmation only if both did.',
              ['npm', 'test', '&&', 'vercel', '--prod', '&&', 'echo', '"shipped"'],
              ['||', ';', 'build', '-p', 'deploy'],
              'The trailing <code>echo</code> is the receipt. No tick means something above it stopped, even if the output looked calm.',
              'Test, and-and, deploy, and-and, echo.')
          ]
        },
        {
          id: 'pg-07', name: 'Exit codes lie in pipes', ico: '🚰',
          steps: [
            L('$? reports the last command, not the failed one', [
              { p: 'A build failure was masked for a whole session. The build was piped into another command, and <code>$?</code> reported the <em>tail</em> of the pipe — which succeeded.' },
              { term: '<span class="c">$ npm run build | tail -5</span>\n<span class="o">…last five lines…</span>\n<span class="c">$ echo $?</span>\n<span class="o">0</span>                  <span class="h">← that is tail succeeding. the build may have failed.</span>' },
              { h: 'The fix' },
              { term: '<span class="c">$ set -o pipefail</span>          <span class="o"># bash and zsh</span>\n<span class="c">$ npm run build | tail -5</span>\n<span class="c">$ echo $?</span>\n<span class="o">1</span>                  <span class="h">← now the pipeline reports the failure</span>\n\n<span class="o"># see every stage at once</span>\n<span class="c">$ echo ${PIPESTATUS[@]}</span>   <span class="o">// bash</span>\n<span class="c">$ echo $pipestatus</span>       <span class="o">// zsh</span>' },
              { call: { k: 'tip', t: 'Turn it on permanently:', p: 'Add <code>set -o pipefail</code> to <code>~/.zshrc</code>. Every CI script should start with <code>set -euo pipefail</code> — exit on error, error on undefined variable, and fail a pipeline if any stage fails.' } }
            ]),
            Q('<code>npm test | grep -i fail</code> exits 0. Did the tests pass?',
              ['Yes', 'Unknown — 0 is <code>grep</code>\'s result, not the test suite\'s', 'No', 'Only if grep found nothing'],
              1,
              'Without <code>pipefail</code> the exit code belongs to the last stage only. Worse here: grep exits 1 when it finds <em>nothing</em>, so the codes can end up meaning the opposite of what you assume.'),
            B('Make a pipeline report a failure from any stage, not just the last.',
              ['set', '-o', 'pipefail'],
              ['-e', '-u', 'export', 'shopt', '--strict'],
              'Add <code>-e</code> to also exit on any error and <code>-u</code> to error on undefined variables. <code>set -euo pipefail</code> is the standard first line of any script that matters.',
              'Three tokens: the builtin, the option flag, the option name.')
          ]
        },
        {
          id: 'pg-08', name: 'Counting output', ico: '🔢',
          steps: [
            L('wc -l counts newlines, not lines', [
              { p: 'A count came back one short and triggered a false emergency stop. The output had no trailing newline — so its last line was never counted.' },
              { term: '<span class="c">$ printf \'a\\nb\'  | wc -l</span>\n<span class="o">1</span>            <span class="h">← there are two lines. one newline.</span>\n\n<span class="c">$ printf \'a\\nb\'  | grep -c \'\'</span>\n<span class="o">2</span>            <span class="h">← counts lines, trailing newline or not</span>' },
              { call: { k: 'warn', t: 'Where this bites:', p: 'Any script that gates on a count — "if there are more than N stale branches, stop". Off by one at the boundary and you either block on nothing or sail past a real problem.' } },
              { call: { k: 'tip', t: 'Safer counting:', p: 'Prefer a tool\'s own counter where one exists. <code>git rev-list --count HEAD</code> beats piping <code>git log</code> into <code>wc</code>, and it cannot be thrown off by formatting.' } }
            ]),
            Q('A script stops the deploy when a count exceeds a threshold, using <code>| wc -l</code>. What is the failure mode?',
              ['It always overcounts', 'It can undercount by one when the output has no trailing newline — right at the boundary',
               'It cannot fail', 'It only fails on empty input'],
              1,
              'And it fails precisely where it matters: exactly at the threshold. A gate that is wrong only at the boundary is worse than no gate, because you trust it.')
          ]
        },
        {
          id: 'pg-09', name: 'Agent reports are claims', ico: '🤖',
          steps: [
            L('Verify anything consequential yourself', [
              { p: 'An agent reported a HEAD SHA. It was simply wrong. Everything downstream that trusted it was built on a false fact.' },
              { ul: [
                'An agent summarising a command is <em>reporting</em> on output — a step where a detail can drift.',
                'A model can produce a plausible SHA, a plausible file count, a plausible branch name. Plausible is the failure mode; nothing looks wrong.',
                'The cost is asymmetric: verifying takes one command, acting on a wrong SHA can take an afternoon.'
              ] },
              { term: '<span class="o"># cheap, exact, no interpretation</span>\n<span class="c">$ git rev-parse HEAD</span>            <span class="o">the actual SHA</span>\n<span class="c">$ git log -1 --oneline</span>          <span class="o">SHA + subject</span>\n<span class="c">$ git status -sb</span>                <span class="o">branch, tracking, dirty files</span>' },
              { call: { k: 'tip', t: 'The rule:', p: 'If a claim would be expensive to be wrong about — a SHA, a branch, a deploy target, a row count — run the command yourself. Not because agents are unreliable in general, but because this specific class of fact is cheap to check and costly to assume.' } }
            ]),
            B('Print the exact commit SHA you are currently on.',
              ['git', 'rev-parse', 'HEAD'],
              ['log', '--oneline', 'show', '-1', 'sha'],
              'No formatting, no interpretation — the raw 40-character SHA. <code>git rev-parse --short HEAD</code> gives the short form.',
              'Verb is about parsing a revision.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 — Worktrees for real',
      desc: 'One branch, one checkout — and what a fresh worktree does not bring with it.',
      nodes: [
        {
          id: 'pg-10', name: 'A branch lives in exactly one worktree', ico: '🌳',
          steps: [
            L('Why "git checkout main" refuses', [
              { p: '<code>git checkout main</code> failed in the root checkout for weeks. It was not broken. <code>main</code> was checked out in another worktree, and a branch can only be checked out in one place at a time.' },
              { term: '<span class="c">$ git checkout main</span>\n<span class="o">fatal: \'main\' is already checked out at\n  \'/Users/you/code/nobc-os-crm\'</span>' },
              { svg: worktreeDiagram },
              { p: 'This is git protecting you. Two checkouts of one branch could commit to it independently and you would have no idea which was which.' },
              { call: { k: 'tip', t: 'Read the error, it gives you the answer:', p: 'It tells you the exact path. Either go work there, or free the branch by switching that worktree to something else — or remove it if it is finished.' } },
              { call: { t: 'The topology is worth drawing once:', p: 'One <code>.git</code>, many folders, each pinned to a different branch. Confusing errors stop being confusing the moment you can picture that.' } }
            ]),
            B('List every worktree and the branch each one is holding.',
              ['git', 'worktree', 'list'],
              ['branch', 'show', '-a', 'status', 'prune'],
              'One line per worktree: path, HEAD commit, and branch in brackets. The first is your main checkout. This is the map.',
              'Sub-verb, then the plainest possible word.'),
            Q('<code>git switch main</code> fails saying main is checked out elsewhere. You need main <em>here</em>.',
              ['Force it with <code>-f</code>', 'Switch that other worktree off main, or remove it if it is done',
               'Delete and recreate main', 'Clone the repo again'],
              1,
              'The branch has to be freed before another checkout can take it. Often the other worktree is finished and should just be removed — which is also how you avoid collecting dozens of them.')
          ]
        },
        {
          id: 'pg-11', name: 'Stale worktrees and the 96 problem', ico: '🧹',
          steps: [
            L('Records outlive the folders', [
              { p: 'Worktrees created under <code>/private/tmp</code> were purged by macOS. Git still had records of them, and those records blocked new branches from being created. Ninety-six worktrees had accumulated; sixty-six held nothing at all.' },
              { term: '<span class="c">$ git worktree list</span>\n<span class="o">/Users/you/code/proj        9a4b2c1 [main]\n/private/tmp/proj-x         8c2d0b1 [feature-x]   ← folder is gone</span>\n\n<span class="c">$ git worktree prune</span>       <span class="o"># drops records whose folder no longer exists</span>\n<span class="c">$ git worktree remove ../proj-done</span>   <span class="o"># remove one properly</span>' },
              { call: { k: 'warn', t: 'Never put a worktree in /tmp:', p: 'macOS clears it. The folder vanishes, the git record survives, and the branch stays locked to a directory that no longer exists. Keep worktrees beside the repo, or inside it under a gitignored folder.' } },
              { call: { k: 'tip', t: 'Make removal part of finishing:', p: 'Merge the PR, then <code>git worktree remove</code>. If it never becomes a habit you will discover the problem at ninety-six, which is exactly the point where auditing them is miserable.' } }
            ]),
            B('Drop the records for worktrees whose folders no longer exist.',
              ['git', 'worktree', 'prune'],
              ['clean', 'remove', '-f', 'gc', 'list'],
              'Safe: it only removes bookkeeping for directories that are genuinely gone. Run it whenever a worktree operation complains about something you do not recognise.',
              'The gardening word.'),
            Q('A worktree folder was deleted by hand, without <code>git worktree remove</code>. What happens?',
              ['Nothing, git notices', 'The record survives and keeps that branch locked until you <code>prune</code>',
               'The branch is deleted too', 'The repo is corrupted'],
              1,
              'Git tracks worktrees in <code>.git/worktrees/</code>, and deleting a folder does not touch that. <code>prune</code> is the reconciliation step.')
          ]
        },
        {
          id: 'pg-12', name: 'Commits no remote can see', ico: '👻',
          steps: [
            L('33 commits, stranded', [
              { p: 'Fourteen worktrees were holding thirty-three commits that existed on no remote. Not lost — but one disk failure or one careless branch delete away from gone, and invisible to every teammate and every CI run.' },
              { term: '<span class="o"># every commit on any local branch that no remote has</span>\n<span class="c">$ git log --branches --not --remotes --oneline</span>\n\n<span class="o"># which branches, and how far ahead</span>\n<span class="c">$ git for-each-ref --format=\'%(refname:short) %(upstream:track)\' refs/heads</span>' },
              { call: { k: 'warn', t: "Committed is not backed up:", p: 'Committing protects you from your own editor. Only <strong>pushing</strong> protects you from your laptop. A commit that exists in one place is one accident from not existing.' } },
              { call: { k: 'tip', t: 'Worth running monthly:', p: 'That first command answers "what work of mine exists nowhere else?" — a question you otherwise only ask after something has gone wrong.' } }
            ]),
            B('List every local commit that no remote has.',
              ['git', 'log', '--branches', '--not', '--remotes', '--oneline'],
              ['--all', '--stale', '--local', 'diff', '--unpushed'],
              'Read it as "everything on my branches, <em>except</em> anything a remote already has". If it prints nothing, all your work is safe somewhere else.',
              'log, then all branches, then the exclusion, then remotes.'),
            Q('You have committed all your work but pushed none of it. Your laptop dies. What survives?',
              ['Everything — commits are backups', 'Nothing — commits are local until pushed',
               'Only the main branch', 'Whatever the reflog holds'],
              1,
              'Git is distributed, which means your machine holds a complete copy — and until you push, it holds the <em>only</em> copy. Reflog is local too; it dies with the disk.')
          ]
        },
        {
          id: 'pg-13', name: 'A fresh worktree is an empty room', ico: '📦',
          steps: [
            L('Git brings tracked files. Nothing else.', [
              { p: 'A new worktree has no <code>node_modules</code> and no <code>.env.local</code>. Both are gitignored, so git will never put them there — and the app starts with no secrets while the build behaves strangely.' },
              { h: 'What does and does not follow' },
              { term: '<span class="c">✓ tracked files</span>       source, package.json, lockfile\n<span class="c">✓ full git history</span>    same object database\n<span class="h">✗ node_modules</span>        gitignored — never copied\n<span class="h">✗ .env.local</span>          gitignored — never copied\n<span class="h">✗ build output</span>        .next, dist — gitignored\n<span class="h">✗ editor state</span>        whatever your IDE keeps locally' },
              { h: 'Checklist after every worktree add' },
              { term: '<span class="c">$ git worktree add ../proj-feature feature</span>\n<span class="c">$ cd ../proj-feature</span>\n<span class="c">$ cp ../proj/.env.local .</span>      <span class="o"># or: vercel env pull .env.local</span>\n<span class="c">$ npm ci</span>                        <span class="o"># exact lockfile, own node_modules</span>\n<span class="c">$ git status</span>                     <span class="o"># must be clean — see the next level</span>' },
              { call: { k: 'tip', t: 'Make it a script:', p: 'You will do this every single time, and the step you forget is always the one that costs an hour of confusing errors.' } }
            ]),
            Q('A brand-new worktree has no <code>.env.local</code>. Why will git never fix that for you?',
              ['It is a bug', 'It is gitignored, so git does not track it and has nothing to place',
               'It only copies on the second checkout', 'It needs <code>--recurse</code>'],
              1,
              'Gitignored means untracked means invisible to git. The same property that keeps your secrets out of the repo guarantees they never follow it anywhere.')
          ]
        },
        {
          id: 'pg-14', name: 'The build that false-passed', ico: '🕳️',
          steps: [
            L('npm resolves upward', [
              { p: 'A build passed in a fresh worktree that had no <code>node_modules</code>. Node resolves modules by walking <em>up</em> the directory tree — and because the worktree sat inside the parent checkout, it silently used the parent\'s dependencies.' },
              { term: '~/code/proj/                     <span class="o">node_modules/  ← found from here</span>\n └─ .claude/worktrees/feature/  <span class="h">no node_modules — walks up</span>' },
              { call: { k: 'warn', t: 'Why this is worse than failing:', p: 'A build that fails tells you something is wrong. A build that passes against the <em>wrong</em> dependencies tells you nothing is wrong — and it is testing a tree you are not shipping.' } },
              { h: 'How to catch it' },
              { ul: [
                'Run <code>npm ls &lt;package&gt;</code> and read the <em>path</em> it prints, not just the version.',
                'Check <code>ls node_modules</code> actually exists in the worktree.',
                'Put worktrees <em>beside</em> the repo (<code>../proj-feature</code>) rather than inside it, so there is nothing above to walk up into.',
                '<code>git status</code> in the worktree: if the lockfile is modified, an install has changed something and you need to know why.'
              ] },
              { call: { k: 'tip', t: 'Placement is the real fix:', p: 'Siblings rather than children. Then a missing install fails loudly and immediately, which is what you want.' } }
            ]),
            Q('Your worktree lives inside the parent repo and has no <code>node_modules</code>. <code>npm run build</code> succeeds. What did it build against?',
              ['Its own dependencies', "The parent checkout's node_modules, found by walking up",
               'Nothing — it faked it', 'A global install'],
              1,
              'Node module resolution walks up from the current directory until it finds a match. Silent, and it means your build proved something about a different tree than the one you are about to ship.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 4 — Merged is not shipped',
      desc: 'Four links, each needing its own evidence.',
      nodes: [
        {
          id: 'pg-15', name: 'The chain', ico: '🔗',
          steps: [
            L('Merged → SHA → built → live', [
              { p: 'The PR merge button feels like the finish line. It is the first of four links, and each one can break without the previous one noticing.' },
              { svg: shipChain },
              { term: '<span class="o">1. merged?</span>   <span class="c">gh pr view 42 --json state,mergeCommit</span>\n<span class="o">2. which SHA?</span> <span class="c">git fetch && git log -1 --oneline origin/main</span>\n<span class="o">3. built from it?</span>  check the deployment\'s commit in the dashboard\n<span class="o">4. live?</span>     open the thing and use it' },
              { call: { k: 'warn', t: 'Step 4 is the only one that is actually evidence:', p: 'The first three are process. Only the last is the behaviour a user would experience — and it is the one people skip because the first three looked fine.' } },
              { call: { k: 'tip', t: 'Match the SHA:', p: 'The single highest-value check is comparing the SHA your host says it deployed against the SHA at the top of origin/main. If they differ, everything upstream is irrelevant.' } }
            ]),
            Q('The PR is merged, CI is green, the deploy command exited 0. Is the fix live?',
              ['Yes — all three passed', 'Unknown until you check the deployed SHA and use the feature',
               'Yes, if CI ran after merge', 'Only if it was a squash merge'],
              1,
              'Each green light confirms its own step and says nothing about the next. A deploy can succeed while building an older commit, and a build can succeed while the feature is broken.'),
            B('Fetch, then show the newest commit on the remote main branch.',
              ['git', 'fetch', '&&', 'git', 'log', '-1', '--oneline', 'origin/main'],
              ['pull', 'main', '--all', 'HEAD', '-n'],
              '<code>fetch</code> first or <code>origin/main</code> is your cached copy from last time — the exact staleness that makes this check useless. This is the SHA your deployment should match.',
              'Fetch, and-and, log, one commit, one line, the remote branch.')
          ]
        },
        {
          id: 'pg-16', name: 'Branch names have side effects', ico: '🎫',
          steps: [
            L('Your ticket tracker is reading them', [
              { p: 'Linear auto-closed tickets twice, because the branch names carried ticket keys and the merge triggered the automation. Nobody asked it to.' },
              { ul: [
                'Linear closes an issue when a branch containing its key is merged.',
                'GitHub closes an issue when a PR body says <code>Fixes #42</code>.',
                'Both fire on merge, silently, and neither asks.'
              ] },
              { call: { k: 'tip', t: 'Use it deliberately:', p: 'This automation is genuinely good when you mean it. Name the branch with the key when the branch really does complete the ticket. When it is partial work, leave the key out and reference it in the PR description instead.' } },
              { call: { k: 'warn', t: 'The reverse also bites:', p: 'A branch <em>without</em> a key means the ticket stays open after the work ships, and you find out at standup. Neither direction is worse — but both are surprises if you did not know the rule.' } }
            ]),
            Q('You merge <code>NOBC-71-partial-voice-capture</code> — but only half the ticket is done.',
              ['Nothing happens', 'Linear likely closes NOBC-71 on merge, because the key is in the branch name',
               'It closes only if the PR says Fixes', 'It moves it to In Review'],
              1,
              'The key in the branch name is the trigger. For partial work, keep the key out of the branch and mention the ticket in the PR body instead.')
          ]
        },
        {
          id: 'pg-17', name: '"The command exited" is not "it deployed"', ico: '🚀',
          steps: [
            L('Exit 0 means the CLI finished talking', [
              { p: 'A deploy command exiting successfully means your request was accepted. The build happens afterwards, elsewhere, and can fail long after your terminal has moved on.' },
              { ul: [
                'The CLI succeeded → the deployment was <em>queued</em>.',
                'The build runs on their infrastructure and can fail there — missing env var, type error, case-sensitive import path.',
                'The deployment can succeed and still not be <em>promoted</em> to production.'
              ] },
              { term: '<span class="c">$ vercel --prod</span>\n<span class="o">✅  Production: https://app.vercel.app [2s]</span>\n<span class="h">← 2 seconds. that is an upload, not a build.</span>\n\n<span class="c">$ vercel inspect &lt;url&gt; --logs</span>    <span class="o"># what actually happened</span>\n<span class="c">$ vercel ls</span>                       <span class="o"># state of recent deployments</span>' },
              { call: { k: 'warn', t: 'The tell is the duration:', p: 'A real build takes tens of seconds at least. If a "deploy" returns in two, you uploaded — you did not ship.' } }
            ]),
            Q('<code>vercel --prod</code> returns in 2 seconds with a URL. What just happened?',
              ['It built and deployed', 'It queued a deployment — the build runs afterwards and can still fail',
               'It used a cached build', 'It rolled back'],
              1,
              'Your terminal is finished; the deployment is not. Check the deployment state, and check which commit it built from.')
          ]
        },
        {
          id: 'pg-18', name: 'The pre-flight', ico: '✅',
          steps: [
            L('Everything in this track, as one habit', [
              { h: 'Before anything consequential' },
              { term: '<span class="c">$ pwd</span>                          <span class="o">which repo</span>\n<span class="c">$ git branch --show-current</span>   <span class="o">which branch</span>\n<span class="c">$ git log -1 --oneline</span>        <span class="o">which commit</span>' },
              { h: 'Before believing an output' },
              { ul: [
                '"Already up to date" / "Everything up-to-date" mean <strong>nothing happened</strong>. Confirm that was what you wanted.',
                'In a <code>&&</code> chain, count the outputs. Fewer than expected means it stopped early.',
                'Exit codes after a pipe belong to the last stage — <code>set -o pipefail</code>.',
                'Any consequential claim from a tool or an agent: run the command yourself.'
              ] },
              { h: 'After any worktree add' },
              { ul: ['copy <code>.env.local</code>', 'run <code>npm ci</code>', 'confirm <code>node_modules</code> exists <em>here</em>', 'keep worktrees beside the repo, never in <code>/tmp</code>'] },
              { h: 'Before calling it shipped' },
              { ul: ['merged, with a merge SHA', 'the deployment built <em>that</em> SHA', 'the behaviour is live and you used it'] },
              { call: { k: 'tip', t: 'The whole track in one line:', p: '<strong>Prove your ground before the command, and read what the output actually says instead of what you hoped it would.</strong> Every incident behind these levels was one unchecked assumption about where you were standing.' } }
            ]),
            Q('The single reflex that would have prevented the most of these?',
              ['Using worktrees more', 'Checking pwd, branch and last commit before any consequential command',
               'Reading git docs', 'Slowing down generally'],
              1,
              'Wrong branch, wrong directory, wrong window, wrong repo — one three-second check catches all of them. It is not about being careful; it is about replacing a belief with a fact.')
          ]
        }
      ]
    }
  ]
};
