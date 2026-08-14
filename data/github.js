/* ============================================================
   TRACK: Git & GitHub — zero to genuinely advanced
   Node shape: { id, name, ico, steps:[ ...lesson|quiz|build ] }
   ============================================================ */
import { threeAreas, commitChain, branchDiverge, mergeVsRebase, remoteSync, worktreeDiagram, prFlow, detachedHead } from './svg.js';

const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });

export const github = {
  id: 'github',
  name: 'Git & GitHub',
  emoji: '🐙',
  glow: '#39e6ff',
  time: '~90 min',
  desc: 'Repos, commits, branches, merges, rebases, remotes, pull requests, worktrees — the full rundown, from "what even is this" to power user.',
  chapters: [

    /* ================= CH 1 ================= */
    {
      title: 'Chapter 1 — First principles',
      desc: 'What Git actually is, and the three places your code lives.',
      nodes: [
        {
          id: 'g-01', name: 'Git vs GitHub', ico: '🧠',
          steps: [
            L('Git is not GitHub', [
              { p: '<strong>Git</strong> is a program on your computer. It records snapshots of your files over time. It works with no internet, no account, no company involved.' },
              { p: '<strong>GitHub</strong> is a website that stores copies of Git projects and adds people-features on top: pull requests, reviews, issues, permissions, CI.' },
              { call: { k: 'tip', t: 'The one-liner:', p: 'Git is the engine. GitHub is the garage where everyone parks and talks about the cars.' } },
              { p: 'GitLab, Bitbucket, Codeberg do the same job. Git works with all of them. You are learning a skill, not a product.' }
            ]),
            Q('Your internet dies. What can you still do?',
              ['Nothing — Git needs GitHub', 'Commit, branch, merge, view all history — everything except sync with others', 'Only view files, no commits', 'Only work if you cloned in the last 24 hours'],
              1,
              'Every commit, branch and the entire project history live in the <code>.git</code> folder on your own disk. Git is <em>distributed</em> — that is the whole design. You only need the network to <code>push</code> or <code>fetch</code>.')
          ]
        },
        {
          id: 'g-02', name: 'Repository', ico: '📦',
          steps: [
            L('The repo', [
              { p: 'A <strong>repository</strong> ("repo") is a project folder that Git is watching. It is a normal folder plus one hidden subfolder: <code>.git</code>.' },
              { p: 'That <code>.git</code> folder is the entire database — every version of every file, every commit message, every branch, forever. Delete it and you have plain files with no history. Copy it and you have copied the whole project history.' },
              { term: '<span class="c">$ git init</span>\n<span class="o">Initialized empty Git repository in /Users/you/proj/.git/</span>\n\n<span class="c">$ ls -a</span>\n<span class="o">.   ..   <span class="h">.git</span>   README.md</span>' },
              { call: { t: 'Mental model:', p: 'A repo is a folder with a memory. Everything else in Git is about writing to and reading from that memory.' } }
            ]),
            B('Turn the folder you are standing in into a Git repository.',
              ['git', 'init'], ['clone', 'start', 'new', 'add', 'repo'],
              '<code>git init</code> creates the <code>.git</code> folder. It is safe, local, and instant — it never touches the network and never uploads anything.',
              'Two words. Git subcommands are almost always plain English verbs.'),
            Q('You copy your project folder to a USB stick but exclude hidden files. What did you lose?',
              ['Nothing', 'The entire history — every commit and branch', 'Only the most recent commit', 'Only the branch names'],
              1,
              '<code>.git</code> is hidden. Excluding hidden files drops the database and keeps only the current working files. This is genuinely how people lose years of history.')
          ]
        },
        {
          id: 'g-03', name: 'The three areas', ico: '🗂️',
          steps: [
            L('Working tree → staging → repo', [
              { p: 'This is the single most important diagram in Git. Almost every confusing error makes sense once you know which of these three places you are talking about.' },
              { svg: threeAreas },
              { ul: [
                '<strong>Working tree</strong> — the actual files on disk. Edit freely. Git notices but does nothing.',
                '<strong>Staging area</strong> (a.k.a. the "index") — a shopping basket. You choose exactly what goes into the next snapshot.',
                '<strong>Repository</strong> — where committed snapshots live permanently.'
              ] },
              { call: { k: 'tip', t: 'Why staging exists:', p: 'You fixed a bug <em>and</em> renamed a variable. Stage only the bug fix, commit it, then commit the rename separately. Two clean commits instead of one muddy one.' } }
            ]),
            B('Stage every changed file in the current folder.',
              ['git', 'add', '.'], ['commit', 'stage', '-m', 'all', 'push'],
              '<code>git add .</code> stages everything under the current directory. <code>git add -p</code> is the pro move — it walks you through each chunk and asks "stage this?"',
              'The dot means "everything here and below".'),
            Q('You run <code>git add file.js</code>, then edit <code>file.js</code> again. What gets committed?',
              ['Both versions', 'The version as it was when you ran <code>git add</code>', 'The newest version on disk', 'Git refuses to commit'],
              1,
              'Staging takes a snapshot at the moment you run <code>add</code>. Later edits sit in the working tree, unstaged. This is why <code>git status</code> can list the same file as both staged <em>and</em> modified.')
          ]
        },
        {
          id: 'g-04', name: 'The commit', ico: '💾',
          steps: [
            L('A commit is a save point', [
              { p: 'A <strong>commit</strong> is a permanent, named snapshot of the whole project, plus who made it, when, why, and which commit came before it.' },
              { svg: commitChain },
              { p: 'That last part matters: each commit points back to its parent. Chain them and you get history. Git is really just a linked list of snapshots with good tooling around it.' },
              { p: 'Each commit gets a <strong>hash</strong> — <code>e3f1a9c...</code> — a fingerprint of its contents. Change anything and the hash changes. That is what makes history tamper-evident.' },
              { call: { k: 'tip', t: 'Message style that scales:', p: 'Present tense, imperative, under ~60 chars: <code>Add password reset flow</code>. Read it as "this commit will…". Future you will thank present you.' } }
            ]),
            B('Commit the staged changes with the message "Add login".',
              ['git', 'commit', '-m', '"Add login"'], ['git add', 'push', '-a', '--message', '"login"'],
              '<code>-m</code> supplies the message inline. Without it, Git opens an editor. <code>git commit -am "msg"</code> stages all <em>already-tracked</em> modified files and commits in one shot — but it skips brand-new files.',
              'Flag first, then the quoted message.'),
            Q('What is a commit hash actually derived from?',
              ['A random number', 'The timestamp only', 'The content, the author, the message and the parent commit', 'Your username'],
              2,
              'It is a SHA hash of all of it. Two commits with identical content but different parents get different hashes — which is exactly why rebasing "rewrites" commits and gives them new IDs.')
          ]
        },
        {
          id: 'g-05', name: '.gitignore', ico: '🙈',
          steps: [
            L('Keeping junk out', [
              { p: 'Some files should never be committed: dependency folders, build output, editor settings, and above all <strong>secrets</strong>.' },
              { term: '<span class="o"># .gitignore</span>\nnode_modules/\n.env\n.env.local\ndist/\n.DS_Store\n*.log' },
              { call: { k: 'warn', t: 'Committed a secret? Rotate it.', p: 'Deleting the file in a later commit does not remove it from history — anyone can read it in an old commit. Assume it is burned and issue a new key. Then clean history if you must.' } },
              { p: '<code>.gitignore</code> only affects files Git is not already tracking. If a file is already committed, add it to the ignore list <em>and</em> run <code>git rm --cached &lt;file&gt;</code>.' }
            ]),
            Q('<code>.env</code> is already committed. You add it to <code>.gitignore</code>. What happens?',
              ['It disappears from history', 'Git stops tracking it going forward', 'Nothing — Git keeps tracking it because it is already tracked', 'Git errors out'],
              2,
              '<code>.gitignore</code> is only consulted for <em>untracked</em> files. Run <code>git rm --cached .env</code> to untrack it (keeping your local copy), commit that, and rotate the secret.')
          ]
        }
      ]
    },

    /* ================= CH 2 ================= */
    {
      title: 'Chapter 2 — Reading and undoing history',
      desc: 'See what happened, and get out of trouble.',
      nodes: [
        {
          id: 'g-06', name: 'status & log', ico: '🔍',
          steps: [
            L('Your two most-used commands', [
              { p: '<code>git status</code> answers "where am I and what is going on?" Run it constantly. It is free and it tells you the branch, staged files, unstaged files, and untracked files.' },
              { p: '<code>git log</code> shows history, newest first. The version worth memorising:' },
              { term: '<span class="c">$ git log --oneline --graph --all</span>\n<span class="h">* e3f1a9c</span> <span class="o">(HEAD -> main)</span> Add login\n<span class="h">* 8c2d0b1</span> Fix header spacing\n<span class="h">* a91f3e4</span> Initial commit' },
              { call: { k: 'tip', t: 'Alias it:', p: '<code>git config --global alias.lg "log --oneline --graph --all --decorate"</code> — then just type <code>git lg</code> forever.' } }
            ]),
            B('Show a compact, graphed log of every branch.',
              ['git', 'log', '--oneline', '--graph', '--all'], ['--short', '--tree', 'history', '-p'],
              'Three flags worth burning into muscle memory: <code>--oneline</code> compresses, <code>--graph</code> draws branch structure, <code>--all</code> stops hiding branches you are not currently on.',
              'Command, then three flags in that order.')
          ]
        },
        {
          id: 'g-07', name: 'HEAD', ico: '📍',
          steps: [
            L('HEAD = "you are here"', [
              { p: '<strong>HEAD</strong> is a pointer to whatever commit you currently have checked out. Normally it points at a branch name, and that branch points at a commit.' },
              { p: 'Relative references are how you talk about the past without copying hashes:' },
              { ul: [
                '<code>HEAD</code> — current commit',
                '<code>HEAD~1</code> — one commit back (also <code>HEAD^</code>)',
                '<code>HEAD~3</code> — three commits back',
                '<code>main@{yesterday}</code> — where main pointed yesterday'
              ] },
              { svg: detachedHead },
              { p: 'If you check out a raw commit hash instead of a branch, HEAD points straight at a commit with no branch attached — <strong>detached HEAD</strong>. You can look around safely; just make a branch before committing.' }
            ]),
            Q('You are in detached HEAD, make 3 commits, then <code>git switch main</code>. What happens to those commits?',
              ['They move to main', 'They are unreachable by any branch name — findable via reflog, but easy to lose', 'They are deleted immediately', 'Git blocks the switch'],
              1,
              'They still exist in the object database and <code>git reflog</code> can find them. But nothing points at them, so garbage collection will eventually reap them. The fix at the time: <code>git switch -c my-branch</code> before you switch away.')
          ]
        },
        {
          id: 'g-08', name: 'Undo: the big three', ico: '↩️',
          steps: [
            L('restore, reset, revert', [
              { p: 'Three different undos for three different situations. Pick by asking "has this been pushed?"' },
              { ul: [
                '<code>git restore &lt;file&gt;</code> — throw away uncommitted edits to a file. <em>Destructive to your unsaved work.</em>',
                '<code>git restore --staged &lt;file&gt;</code> — unstage, keep the edits.',
                '<code>git reset --soft HEAD~1</code> — undo the last commit, keep changes staged.',
                '<code>git reset --hard HEAD~1</code> — undo the commit <em>and</em> obliterate the changes.',
                '<code>git revert &lt;hash&gt;</code> — make a <em>new</em> commit that undoes an old one. History is preserved.'
              ] },
              { call: { k: 'warn', t: 'The rule that saves teams:', p: 'Already pushed and someone else may have pulled? Use <code>revert</code>. Only local? <code>reset</code> is fine.' } }
            ]),
            B('Undo your last commit but keep the changes staged so you can redo it.',
              ['git', 'reset', '--soft', 'HEAD~1'], ['--hard', '--mixed', 'revert', 'HEAD^^', 'restore'],
              '<code>--soft</code> moves the branch pointer back and leaves everything staged. <code>--mixed</code> (the default) unstages them. <code>--hard</code> deletes them.',
              'Which flag <em>keeps</em> your work?'),
            Q('A bad commit is on <code>main</code> and three people have pulled it. Best move?',
              ['<code>git reset --hard</code> then force push', 'Delete the branch', '<code>git revert &lt;hash&gt;</code> and push normally', 'Ask everyone to re-clone'],
              2,
              'Reset + force push rewrites shared history and breaks everyone else\'s clone. <code>revert</code> adds a new commit that cancels the old one — safe, honest, and reviewable.')
          ]
        },
        {
          id: 'g-09', name: 'reflog: the time machine', ico: '🕰️',
          steps: [
            L('You almost never truly lose work', [
              { p: '<code>git reflog</code> is a private, local log of everywhere HEAD has been — every commit, checkout, reset, rebase, merge. Even "deleted" commits show up here.' },
              { term: '<span class="c">$ git reflog</span>\n<span class="h">e3f1a9c</span> HEAD@{0}: reset: moving to HEAD~1\n<span class="h">9a4b2c1</span> HEAD@{1}: commit: Add payment flow  <span class="o">← the one you nuked</span>\n<span class="h">8c2d0b1</span> HEAD@{2}: commit: Fix header\n\n<span class="c">$ git reset --hard 9a4b2c1</span>   <span class="o"># it is back</span>' },
              { call: { k: 'tip', t: 'When to reach for it:', p: 'Any time you say "oh no". Bad reset, bad rebase, deleted branch, lost detached commits. Reflog first, panic never.' } }
            ]),
            Q('You <code>git reset --hard</code> and lost a commit. Reflog entries typically last…',
              ['Until you close the terminal', 'About 90 days by default', 'Forever, guaranteed', 'They are not kept at all'],
              1,
              'Reachable entries expire around 90 days, unreachable ones around 30 (<code>gc.reflogExpire</code>). Plenty of time — but reflog is local-only, so it does not help if you lose the machine.')
          ]
        },
        {
          id: 'g-10', name: 'diff & blame', ico: '🔬',
          steps: [
            L('What changed, and who did it', [
              { ul: [
                '<code>git diff</code> — working tree vs staging (unstaged changes)',
                '<code>git diff --staged</code> — staging vs last commit (what you are about to commit)',
                '<code>git diff main..feature</code> — everything that differs between two branches',
                '<code>git blame file.js</code> — line-by-line, which commit and author last touched it',
                '<code>git show &lt;hash&gt;</code> — the full contents of one commit'
              ] },
              { call: { k: 'tip', t: 'Review your own work:', p: 'Run <code>git diff --staged</code> before every commit. It catches stray <code>console.log</code>s, debug flags and accidental deletions faster than any linter.' } }
            ]),
            B('Show exactly what you are about to commit.',
              ['git', 'diff', '--staged'], ['--unstaged', '--cached-only', 'status', 'show', '--all'],
              '<code>--staged</code> (alias <code>--cached</code>) compares the staging area to the last commit — literally a preview of your next commit.',
              'Plain <code>git diff</code> shows the opposite side.')
          ]
        }
      ]
    },

    /* ================= CH 3 ================= */
    {
      title: 'Chapter 3 — Branching',
      desc: 'Parallel universes for your code. This is where Git gets good.',
      nodes: [
        {
          id: 'g-11', name: 'What a branch is', ico: '🌿',
          steps: [
            L('A branch is a sticky note', [
              { p: 'People imagine a branch as a copy of the project. It is not. A <strong>branch is a movable pointer to one commit</strong>. That is the entire implementation — a file containing a hash.' },
              { svg: branchDiverge },
              { p: 'When you commit, the branch you are on slides forward to the new commit. That is why branching in Git is instant and free, even on a huge repo. Creating a branch writes about 40 bytes.' },
              { call: { k: 'tip', t: 'Practical consequence:', p: 'Make branches constantly. They cost nothing. One branch per idea, per bug, per experiment.' } }
            ]),
            Q('Why is creating a branch in Git instant even on a 5GB repo?',
              ['Git compresses the copy', 'It only writes a small file containing one commit hash', 'It uses your GPU', 'It is not instant, it takes minutes'],
              1,
              'A branch is a 41-byte file in <code>.git/refs/heads/</code>. No files are copied. Older tools like SVN literally copied directories — which is why people were scared of branching.')
          ]
        },
        {
          id: 'g-12', name: 'Create & switch', ico: '🔀',
          steps: [
            L('Modern branch commands', [
              { term: '<span class="c">$ git switch -c feature/login</span>   <span class="o"># create + switch (modern)</span>\n<span class="c">$ git switch main</span>              <span class="o"># switch back</span>\n<span class="c">$ git branch</span>                    <span class="o"># list local branches</span>\n<span class="c">$ git branch -d old-thing</span>       <span class="o"># delete (safely)</span>' },
              { p: 'You will see <code>git checkout -b</code> in older tutorials. It does the same thing. <code>checkout</code> was overloaded to do far too many jobs, so Git split it into <code>switch</code> (branches) and <code>restore</code> (files). Use the new ones.' },
              { call: { t: 'Naming that reads well:', p: '<code>feature/checkout-flow</code>, <code>fix/null-user-crash</code>, <code>chore/bump-deps</code>. The prefix sorts your branch list into something meaningful.' } }
            ]),
            B('Create a branch called fix/navbar and switch to it in one command.',
              ['git', 'switch', '-c', 'fix/navbar'], ['checkout', '-b', 'branch', 'new', '-n'],
              '<code>-c</code> means create. The equivalent legacy form is <code>git checkout -b fix/navbar</code> — both are correct, <code>switch</code> is clearer.',
              'Modern verb, then the create flag, then the name.')
          ]
        },
        {
          id: 'g-13', name: 'Merging', ico: '🔗',
          steps: [
            L('Bringing work back together', [
              { p: 'To merge, stand on the branch that should <em>receive</em> the work, then merge the other one in.' },
              { term: '<span class="c">$ git switch main</span>\n<span class="c">$ git merge feature/login</span>\n<span class="o">Updating 8c2d0b1..e3f1a9c\nFast-forward\n src/login.js | 42 ++++++++++</span>' },
              { p: '<strong>Fast-forward</strong>: main had no new commits of its own, so Git just slides the pointer forward. No merge commit, perfectly linear history.' },
              { p: '<strong>Three-way merge</strong>: both branches moved. Git creates a new <em>merge commit</em> with two parents, tying the histories together.' },
              { call: { k: 'tip', t: 'Force the record:', p: '<code>git merge --no-ff</code> always creates a merge commit, so the branch is visible in history forever. Many teams require this.' } }
            ]),
            Q('You are on <code>feature</code> and run <code>git merge main</code>. What happened?',
              ['feature was merged into main', 'main was merged into feature — feature now has main\'s commits', 'Both branches merged into each other', 'Nothing, it is a no-op'],
              1,
              'Merge always pulls the named branch <em>into</em> the branch you are standing on. Doing this deliberately is common — it updates your feature branch with the latest main before you open a PR.')
          ]
        },
        {
          id: 'g-14', name: 'Conflicts', ico: '💥',
          steps: [
            L('Conflicts are not errors', [
              { p: 'A conflict means two branches changed the <em>same lines</em> of the same file. Git will not guess. It hands you both versions and asks you to decide.' },
              { term: '<span class="h">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>\nconst title = "Dashboard";\n<span class="h">=======</span>\nconst title = "Home";\n<span class="h">&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/rename</span>' },
              { ul: [
                'Top block = what is on <strong>your current branch</strong>',
                'Bottom block = what is on <strong>the branch coming in</strong>',
                'Edit the file to the final version you want. Delete all three marker lines.',
                'Then <code>git add &lt;file&gt;</code> and <code>git commit</code> (or <code>git merge --continue</code>).'
              ] },
              { call: { t: 'Escape hatch:', p: '<code>git merge --abort</code> puts everything back exactly as it was. Nothing is lost. You can always bail and try again.' } }
            ]),
            B('You are mid-merge, it is going badly. Back out completely.',
              ['git', 'merge', '--abort'], ['--cancel', 'reset', '--hard', 'undo', 'revert'],
              '<code>--abort</code> restores the pre-merge state. The rebase equivalent is <code>git rebase --abort</code>, and cherry-pick has <code>--abort</code> too. It is a consistent escape hatch.',
              'Same verb you started with, plus a bail-out flag.'),
            Q('After hand-editing a conflicted file, how do you tell Git it is resolved?',
              ['Save the file', 'Run <code>git resolve</code>', '<code>git add</code> the file', 'Restart the merge'],
              2,
              'Staging the file <em>is</em> the signal that it is resolved. There is no <code>git resolve</code>. Then <code>git commit</code> finishes the merge.')
          ]
        },
        {
          id: 'g-15', name: 'Branch hygiene', ico: '🧹',
          steps: [
            L('Keeping the list short', [
              { term: '<span class="c">$ git branch --merged</span>          <span class="o"># already folded into this branch</span>\n<span class="c">$ git branch -d feature/login</span>   <span class="o"># safe delete, refuses if unmerged</span>\n<span class="c">$ git branch -D wild-idea</span>       <span class="o"># force delete, no questions</span>\n<span class="c">$ git fetch --prune</span>             <span class="o"># drop remote branches that no longer exist</span>' },
              { call: { k: 'tip', t: 'Weekly ritual:', p: '<code>git switch main && git pull && git branch --merged | grep -v main | xargs git branch -d</code> — clears out everything already merged.' } }
            ]),
            Q('What is the difference between <code>-d</code> and <code>-D</code>?',
              ['None', '<code>-d</code> refuses if the branch has unmerged commits; <code>-D</code> deletes regardless', '<code>-D</code> deletes on the remote too', '<code>-d</code> is deprecated'],
              1,
              'Lowercase <code>-d</code> is the seatbelt. Uppercase <code>-D</code> is "I know, do it anyway". And even then, reflog can usually recover it.')
          ]
        }
      ]
    },

    /* ================= CH 4 ================= */
    {
      title: 'Chapter 4 — Remotes & GitHub',
      desc: 'Getting your work off your laptop and onto the internet.',
      nodes: [
        {
          id: 'g-16', name: 'Remotes & origin', ico: '🌐',
          steps: [
            L('origin is just a nickname', [
              { p: 'A <strong>remote</strong> is a named URL pointing at another copy of the repo. <code>origin</code> is the conventional name for "the one I cloned from" — it has no special powers, it is just a default.' },
              { svg: remoteSync },
              { term: '<span class="c">$ git remote -v</span>\n<span class="o">origin  git@github.com:you/proj.git (fetch)\norigin  git@github.com:you/proj.git (push)</span>\n\n<span class="c">$ git remote add upstream git@github.com:original/proj.git</span>' },
              { call: { t: 'Key insight:', p: 'Your local repo and GitHub\'s copy are peers. Neither is "the truth" technically — your team just agrees to treat one as canonical.' } }
            ]),
            Q('Why does <code>origin/main</code> sometimes lag behind the real GitHub <code>main</code>?',
              ['GitHub is slow', '<code>origin/main</code> is a cached snapshot from your last fetch, not a live view', 'It is a bug', 'Someone force pushed'],
              1,
              '<code>origin/main</code> is a <em>remote-tracking branch</em> — Git\'s local memory of where main was the last time you talked to the server. <code>git fetch</code> refreshes it.')
          ]
        },
        {
          id: 'g-17', name: 'Clone', ico: '⬇️',
          steps: [
            L('Copying a repo down', [
              { term: '<span class="c">$ git clone git@github.com:you/proj.git</span>\n<span class="o">Cloning into \'proj\'...</span>' },
              { p: 'Clone does four things at once: downloads the full history, creates the folder, sets up <code>origin</code>, and checks out the default branch.' },
              { p: 'You get <em>every</em> commit, not just the latest. That is why a fresh clone of a big repo can be slow — and why <code>--depth 1</code> (a "shallow clone") exists for CI.' },
              { call: { k: 'tip', t: 'SSH vs HTTPS:', p: 'SSH (<code>git@github.com:...</code>) needs a key once and then never asks again. HTTPS asks for a token. Set up SSH — it takes five minutes and saves you forever.' } }
            ]),
            B('Clone the repo at git@github.com:you/proj.git',
              ['git', 'clone', 'git@github.com:you/proj.git'], ['init', 'copy', 'download', 'pull', 'fetch'],
              'Clone is the only command that creates a repo from a remote. <code>git init</code> + <code>git remote add</code> + <code>git pull</code> is the manual equivalent.',
              'One verb, then the URL.')
          ]
        },
        {
          id: 'g-18', name: 'Push', ico: '⬆️',
          steps: [
            L('Sending commits up', [
              { term: '<span class="c">$ git push</span>                              <span class="o"># if upstream is set</span>\n<span class="c">$ git push -u origin feature/login</span>     <span class="o"># first push of a new branch</span>' },
              { p: '<code>-u</code> (<code>--set-upstream</code>) links your local branch to the remote one, so afterwards plain <code>git push</code> and <code>git pull</code> know where to go.' },
              { call: { k: 'warn', t: 'On force pushing:', p: '<code>git push --force</code> can erase a teammate\'s commits. Use <code>--force-with-lease</code> instead — it refuses if someone pushed since your last fetch. Never force push a shared branch like main.' } }
            ]),
            B('Push a new branch and set it to track origin.',
              ['git', 'push', '-u', 'origin', 'feature/login'], ['--track', '--set', 'upstream', 'main', '--force'],
              'After this one command, <code>git push</code> and <code>git pull</code> both work bare on this branch forever.',
              'Verb, tracking flag, remote name, branch name.'),
            Q('Which force-push flag is safe(r) on a branch others might touch?',
              ['<code>--force</code>', '<code>-f</code>', '<code>--force-with-lease</code>', 'They are identical'],
              2,
              '<code>--force-with-lease</code> checks that the remote is still where you last saw it. If someone else pushed, it aborts instead of steamrolling their work.')
          ]
        },
        {
          id: 'g-19', name: 'fetch vs pull', ico: '📡',
          steps: [
            L('The distinction that trips everyone', [
              { ul: [
                '<code>git fetch</code> — download new commits, <strong>change nothing</strong> in your working tree. Purely informational.',
                '<code>git pull</code> — <code>fetch</code> + <code>merge</code> in one step. It changes your files.'
              ] },
              { p: '<code>git pull</code> is where surprise merge commits come from. Many people set <code>git config --global pull.rebase true</code> so pull replays their local commits on top instead of knotting the history.' },
              { call: { k: 'tip', t: 'Safe habit:', p: '<code>git fetch</code> then <code>git log HEAD..origin/main --oneline</code> to see exactly what is incoming <em>before</em> you let it touch your files.' } }
            ]),
            Q('You want to see what changed on the server without touching your working files.',
              ['<code>git pull</code>', '<code>git fetch</code>', '<code>git merge origin/main</code>', '<code>git reset --hard origin/main</code>'],
              1,
              '<code>fetch</code> only updates remote-tracking branches like <code>origin/main</code>. Your files stay exactly as they are until you explicitly merge or rebase.')
          ]
        },
        {
          id: 'g-20', name: 'Forks & upstream', ico: '🍴',
          steps: [
            L('Contributing to code you cannot push to', [
              { p: 'A <strong>fork</strong> is a GitHub-level copy of someone else\'s repo into your own account. You have write access to your fork; you do not to theirs.' },
              { term: '<span class="o"># conventional setup after forking</span>\n<span class="c">$ git clone git@github.com:you/proj.git</span>\n<span class="c">$ git remote add upstream git@github.com:original/proj.git</span>\n\n<span class="o"># stay in sync with the original</span>\n<span class="c">$ git fetch upstream</span>\n<span class="c">$ git rebase upstream/main</span>' },
              { p: 'The open-source loop: fork → branch → commit → push to <em>your</em> fork → open a PR against the <em>original</em>. Maintainers review and merge.' }
            ]),
            B('Add the original project as a second remote called upstream.',
              ['git', 'remote', 'add', 'upstream', 'git@github.com:original/proj.git'], ['origin', 'set-url', 'fork', 'new'],
              'Now you have two remotes: <code>origin</code> (your fork, you can push) and <code>upstream</code> (the original, you fetch from it to stay current).',
              'remote, then the sub-verb, then name, then URL.')
          ]
        }
      ]
    },

    /* ================= CH 5 ================= */
    {
      title: 'Chapter 5 — Working with people',
      desc: 'Pull requests, review, and the GitHub layer on top of Git.',
      nodes: [
        {
          id: 'g-21', name: 'Pull requests', ico: '📬',
          steps: [
            L('The PR is a conversation, not a command', [
              { p: 'A <strong>pull request</strong> is a GitHub feature — not a Git command. It says: "here is a branch, please look at it and consider merging it."' },
              { svg: prFlow },
              { p: 'It bundles the diff, a description, line-by-line comments, approvals, and automated checks into one page. It is where code review and CI actually happen.' },
              { call: { k: 'tip', t: 'PR descriptions that get merged fast:', p: 'What changed, why, how you tested it, and a screenshot if it is visual. Three sentences beats three paragraphs. Small PRs get reviewed; 2000-line PRs get "LGTM" without a real read.' } }
            ]),
            Q('Is "pull request" part of Git itself?',
              ['Yes — <code>git pull-request</code>', 'No — it is a hosting-platform feature layered on top of branches', 'Yes, but only since Git 2.0', 'Only on GitHub Enterprise'],
              1,
              'Git has no concept of a PR. GitHub, GitLab (which calls them Merge Requests) and others built it on top. Underneath, it is just two branches and a diff.')
          ]
        },
        {
          id: 'g-22', name: 'Merge strategies', ico: '🎛️',
          steps: [
            L('Three buttons, three histories', [
              { ul: [
                '<strong>Merge commit</strong> — keeps every commit plus a merge commit. Full fidelity, messier graph.',
                '<strong>Squash and merge</strong> — flattens the whole PR into one commit on main. Clean, linear, loses intermediate steps. The most popular default.',
                '<strong>Rebase and merge</strong> — replays each commit onto main individually, no merge commit. Linear <em>and</em> keeps granularity, but rewrites hashes.'
              ] },
              { svg: mergeVsRebase },
              { call: { t: 'How teams actually choose:', p: 'Squash if your branches are messy ("wip", "fix typo", "fix fix"). Rebase if you curate commits carefully. Merge commits if you want an auditable record of when things landed.' } }
            ]),
            Q('Your PR has 14 commits including "wip", "asdf" and "fix typo". Best merge button?',
              ['Merge commit', 'Squash and merge', 'Rebase and merge', 'Force push over main'],
              1,
              'Squash collapses the noise into one meaningful commit on main. Nobody needs "asdf" in the permanent record.')
          ]
        },
        {
          id: 'g-23', name: 'Code review', ico: '👀',
          steps: [
            L('Reviewing well', [
              { ul: [
                '<strong>Comment</strong> — feedback, no verdict.',
                '<strong>Approve</strong> — good to merge.',
                '<strong>Request changes</strong> — blocks merging until resolved.'
              ] },
              { p: 'Use <em>suggested changes</em> (the ± button on a comment) to propose exact replacement lines. The author merges your suggestion with one click.' },
              { call: { k: 'tip', t: 'Say what kind of comment it is:', p: 'Prefix with <code>nit:</code> (cosmetic, ignore if you like), <code>question:</code>, or <code>blocking:</code>. It removes 90% of review friction because the author knows what actually matters.' } }
            ]),
            Q('You spot a real bug but the author is a senior engineer. Right action?',
              ['Approve to be polite', 'Request changes with the specific failing case', 'Say nothing and fix it later yourself', 'DM them instead so it is not public'],
              1,
              'Review is about the code, not the person. A concrete failing case ("this throws when user is null on line 42") is a gift, not an insult — and the PR is exactly the right place for it.')
          ]
        },
        {
          id: 'g-24', name: 'Issues & linking', ico: '🎫',
          steps: [
            L('Tracking the work', [
              { p: 'Issues are GitHub\'s to-do items: bugs, features, questions. They get numbers (<code>#42</code>), labels, assignees and milestones.' },
              { p: 'Magic words in a PR description auto-close the issue when the PR merges:' },
              { term: '<span class="o">Fixes #42\nCloses #17\nResolves #103</span>' },
              { call: { k: 'tip', t: 'Cross-repo works too:', p: '<code>Fixes owner/other-repo#42</code>. And typing <code>#</code> in any GitHub text box autocompletes issue titles.' } }
            ]),
            Q('Your PR body says "Fixes #42". What happens when it merges?',
              ['Nothing special', 'Issue #42 closes automatically and links to the PR', 'The issue is deleted', 'A new issue is created'],
              1,
              'GitHub parses the keyword, closes the issue, and cross-links both directions. Six months later you can see exactly which code fixed which bug.')
          ]
        },
        {
          id: 'g-25', name: 'Actions & CI', ico: '⚙️',
          steps: [
            L('Robots that check your work', [
              { p: '<strong>GitHub Actions</strong> runs workflows on events — a push, a PR, a schedule. Tests, linting, builds, deploys.' },
              { term: '<span class="o"># .github/workflows/ci.yml</span>\nname: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test' },
              { p: 'Results appear as checks on every PR. Combine with <strong>branch protection</strong> on main — require passing checks and one approval — and it becomes impossible to merge broken code by accident.' }
            ]),
            Q('Where do workflow files have to live?',
              ['Anywhere in the repo', '<code>.github/workflows/</code>', '<code>/ci/</code>', 'Configured in GitHub settings only'],
              1,
              'GitHub only looks in <code>.github/workflows/</code> for YAML workflow files. They are versioned with your code, so CI changes go through review like everything else.')
          ]
        }
      ]
    },

    /* ================= CH 6 ================= */
    {
      title: 'Chapter 6 — Power tools',
      desc: 'Rebase, cherry-pick, stash, bisect. This is the stuff that makes people say "how did you do that".',
      nodes: [
        {
          id: 'g-26', name: 'Rebase', ico: '🪄',
          steps: [
            L('Replaying history somewhere else', [
              { p: 'Merge <em>joins</em> two histories. Rebase <em>moves</em> yours — it takes your commits, sets them aside, fast-forwards to the target, then replays your commits on top one at a time.' },
              { svg: mergeVsRebase },
              { term: '<span class="c">$ git switch feature</span>\n<span class="c">$ git rebase main</span>\n<span class="o">Successfully rebased and updated refs/heads/feature.</span>' },
              { p: 'The result is a perfectly straight line, as if you had started your work from the latest main all along.' },
              { call: { k: 'warn', t: 'The golden rule of rebase:', p: 'Never rebase commits that others have pulled. Rebasing creates <em>new commits with new hashes</em> — the old ones vanish, and anyone who had them gets a broken, duplicated history.' } }
            ]),
            B('Replay your current feature branch on top of the latest main.',
              ['git', 'rebase', 'main'], ['merge', 'onto', '--continue', 'origin/main', 'switch'],
              'Run this while standing on your feature branch. If conflicts appear, fix them, <code>git add</code>, then <code>git rebase --continue</code>. Or <code>--abort</code> to bail.',
              'One verb, one target branch.'),
            Q('Why does rebasing shared branches break things?',
              ['It deletes files', 'It rewrites commits into new hashes, so everyone else\'s copy no longer matches', 'It is slower', 'It does not — that is a myth'],
              1,
              'Same content, new parents, new hashes. Everyone who pulled the old commits now has orphans, and their next pull produces a horrifying duplicated history.')
          ]
        },
        {
          id: 'g-27', name: 'Interactive rebase', ico: '✂️',
          steps: [
            L('Editing your own history', [
              { p: '<code>git rebase -i HEAD~5</code> opens an editor listing your last 5 commits. Change the verb on each line and Git does exactly that.' },
              { term: 'pick   a1b2c3  Add login form\n<span class="h">squash</span> d4e5f6  fix typo\n<span class="h">squash</span> 7g8h9i  fix typo again\n<span class="h">reword</span> j0k1l2  Add validaton\n<span class="h">drop</span>   m3n4o5  debug console.log' },
              { ul: [
                '<code>pick</code> — keep as is',
                '<code>reword</code> — keep the change, edit the message',
                '<code>squash</code> — fold into the commit above, combine messages',
                '<code>fixup</code> — fold into the commit above, discard the message',
                '<code>drop</code> — delete the commit entirely',
                '<code>edit</code> — pause here so you can amend the contents'
              ] },
              { call: { k: 'tip', t: 'The real use case:', p: 'Right before opening a PR. Turn 11 messy commits into 3 clean, reviewable ones. Reviewers will notice and like you.' } }
            ]),
            B('Interactively rewrite the last 4 commits.',
              ['git', 'rebase', '-i', 'HEAD~4'], ['--interactive', 'HEAD^4', '-n', 'squash', 'edit'],
              '<code>-i</code> is <code>--interactive</code>. <code>HEAD~4</code> means "start from four commits back", so the four commits after it become editable.',
              'Verb, interactive flag, then a relative reference.')
          ]
        },
        {
          id: 'g-28', name: 'Cherry-pick', ico: '🍒',
          steps: [
            L('Stealing one commit', [
              { p: '<code>git cherry-pick &lt;hash&gt;</code> copies a single commit from anywhere onto your current branch.' },
              { term: '<span class="c">$ git switch hotfix</span>\n<span class="c">$ git cherry-pick 9a4b2c1</span>\n<span class="o">[hotfix 3f8e2d1] Fix null crash on checkout</span>' },
              { p: 'The classic use: a critical fix is buried in a big unfinished feature branch, and you need <em>only that fix</em> on production today.' },
              { call: { t: 'Ranges work too:', p: '<code>git cherry-pick a1b2c3..d4e5f6</code> picks a whole span. <code>-n</code> stages the changes without committing, so you can adjust first.' } }
            ]),
            Q('What does cherry-pick create on your branch?',
              ['A pointer to the original commit', 'A brand-new commit with the same changes but a different hash', 'A merge commit', 'Nothing until you push'],
              1,
              'It re-applies the diff as a new commit with a new parent, so a new hash. The same content now exists in two places in history — normal and expected.')
          ]
        },
        {
          id: 'g-29', name: 'Stash', ico: '🧺',
          steps: [
            L('Park it, deal with it later', [
              { p: 'You are mid-change and urgently need a clean tree. <code>git stash</code> pockets your uncommitted work and gives you a pristine branch.' },
              { term: '<span class="c">$ git stash push -m "half-done navbar"</span>\n<span class="c">$ git switch main</span>       <span class="o"># clean, do the urgent thing</span>\n<span class="c">$ git switch feature</span>\n<span class="c">$ git stash pop</span>          <span class="o"># changes are back</span>\n\n<span class="c">$ git stash list</span>\n<span class="o">stash@{0}: On feature: half-done navbar</span>' },
              { call: { k: 'warn', t: 'Stash gotchas:', p: 'Untracked files are NOT stashed unless you pass <code>-u</code>. And a deep stash stack is where work goes to be forgotten — <code>pop</code> beats <code>apply</code> because it clears as it restores.' } }
            ]),
            B('Stash your work including brand-new untracked files.',
              ['git', 'stash', 'push', '-u'], ['pop', 'save', '-a', 'apply', '--all'],
              '<code>-u</code> (<code>--include-untracked</code>) grabs new files too. <code>-a</code> goes further and includes ignored files, which is rarely what you want.',
              'The flag is a single letter for "untracked".')
          ]
        },
        {
          id: 'g-30', name: 'Bisect', ico: '🎯',
          steps: [
            L('Binary search through history', [
              { p: 'Something broke somewhere in the last 400 commits. <code>git bisect</code> finds the exact culprit in about 9 steps instead of 400.' },
              { term: '<span class="c">$ git bisect start</span>\n<span class="c">$ git bisect bad</span>              <span class="o"># current state is broken</span>\n<span class="c">$ git bisect good v1.4.0</span>     <span class="o"># this tag was fine</span>\n<span class="o">Bisecting: 203 revisions left...</span>\n\n<span class="o"># test, then say good or bad. Repeat ~9 times.</span>\n<span class="c">$ git bisect bad</span>\n<span class="o">9a4b2c1 is the first bad commit</span>\n\n<span class="c">$ git bisect reset</span>          <span class="o"># back to where you started</span>' },
              { call: { k: 'tip', t: 'Automate it:', p: '<code>git bisect run npm test</code> — Git runs your test at each step and finds the bad commit with zero human input. It feels like cheating.' } }
            ]),
            Q('Roughly how many steps does bisect need across 1000 commits?',
              ['About 1000', 'About 100', 'About 10', 'About 500'],
              2,
              'Binary search: log₂(1000) ≈ 10. Each answer halves the search space. This is the single highest-leverage Git command almost nobody uses.')
          ]
        }
      ]
    },

    /* ================= CH 7 ================= */
    {
      title: 'Chapter 7 — Pro moves',
      desc: 'Worktrees, tags, submodules, and the habits of people who never lose work.',
      nodes: [
        {
          id: 'g-31', name: 'Worktrees', ico: '🌳',
          steps: [
            L('Several branches checked out at once', [
              { p: 'Normally one repo = one folder = one branch checked out. Switching branches rewrites the files in place, which means stashing, rebuilding, restarting dev servers.' },
              { p: 'A <strong>worktree</strong> gives you an <em>additional folder</em> checked out to a different branch, sharing the same <code>.git</code> database.' },
              { svg: worktreeDiagram },
              { term: '<span class="c">$ git worktree add ../proj-hotfix hotfix</span>\n<span class="o">Preparing worktree (checking out \'hotfix\')</span>\n\n<span class="c">$ git worktree list</span>\n<span class="o">/Users/you/proj          e3f1a9c [main]\n/Users/you/proj-hotfix   8c2d0b1 [hotfix]</span>\n\n<span class="c">$ git worktree remove ../proj-hotfix</span>' },
              { call: { k: 'tip', t: 'Why this is a superpower:', p: 'Review a PR in one window while your feature branch keeps running in another. No stashing, no reinstalling dependencies, no losing your dev server. It is also perfect for running two AI coding agents on two branches at once.' } },
              { call: { k: 'warn', t: 'One rule:', p: 'The same branch cannot be checked out in two worktrees at the same time. Git will refuse — which is protecting you.' } }
            ]),
            B('Create a worktree at ../proj-hotfix on the hotfix branch.',
              ['git', 'worktree', 'add', '../proj-hotfix', 'hotfix'], ['new', 'create', 'list', 'remove', '-b'],
              'Order is: path first, then which branch to check out there. Use <code>-b newbranch</code> to create the branch at the same time.',
              'Sub-verb, then destination path, then branch name.'),
            Q('How much disk does a second worktree of a 2GB repo use?',
              ['Another full 2GB — it clones again', 'Only the checked-out files; the object database is shared', 'Nothing, it is a symlink', 'Double, plus indexes'],
              1,
              'One <code>.git</code> object store, many working directories. That is the entire point — it is dramatically lighter than a second clone.')
          ]
        },
        {
          id: 'g-32', name: 'Tags & releases', ico: '🏷️',
          steps: [
            L('Naming a moment in history', [
              { p: 'A <strong>tag</strong> is a permanent label on one commit. Unlike branches, tags never move. They mark releases.' },
              { term: '<span class="c">$ git tag -a v1.2.0 -m "Payments release"</span>\n<span class="c">$ git push origin v1.2.0</span>\n<span class="c">$ git tag -l</span>\n<span class="o">v1.0.0  v1.1.0  v1.2.0</span>' },
              { p: '<code>-a</code> makes an <em>annotated</em> tag — it stores the author, date and message as a real object. Lightweight tags (just <code>git tag v1.2.0</code>) are only a name. Use annotated for anything you publish.' },
              { call: { t: 'GitHub Releases:', p: 'Push a tag and GitHub can turn it into a Release page with notes and downloadable archives. Most CI deploy pipelines trigger on tags.' } }
            ]),
            Q('You push commits to main. What happens to the <code>v1.2.0</code> tag?',
              ['It follows main forward', 'It stays pinned to the exact commit it was created on', 'It is deleted', 'It becomes a branch'],
              1,
              'Tags never move. That is the difference between a tag and a branch — one is a bookmark, the other is a cursor.')
          ]
        },
        {
          id: 'g-33', name: 'Submodules & big repos', ico: '🧩',
          steps: [
            L('Repos inside repos, and repos that are too big', [
              { p: 'A <strong>submodule</strong> embeds another repo at a fixed commit inside yours. Your repo stores a pointer, not the files.' },
              { term: '<span class="c">$ git submodule add git@github.com:org/shared-ui.git vendor/ui</span>\n<span class="c">$ git clone --recurse-submodules git@github.com:you/proj.git</span>\n<span class="c">$ git submodule update --remote</span>' },
              { call: { k: 'warn', t: 'Submodules bite:', p: 'Forgetting <code>--recurse-submodules</code> on clone gives everyone empty folders. Most teams now prefer a package registry or a monorepo instead.' } },
              { p: 'For genuinely huge repos: <code>git clone --depth 1</code> (shallow — only recent history), <code>git sparse-checkout</code> (only the folders you need), and Git LFS for large binary assets.' }
            ]),
            Q('You clone a repo with submodules but forget <code>--recurse-submodules</code>. Result?',
              ['Clone fails', 'Submodule directories exist but are empty', 'Submodules are downloaded anyway', 'The repo is corrupted'],
              1,
              'Empty folders and a confusing build failure. Fix: <code>git submodule update --init --recursive</code>.')
          ]
        },
        {
          id: 'g-34', name: 'Habits of people who never lose work', ico: '👑',
          steps: [
            L('The whole thing, compressed', [
              { h: 'Daily loop' },
              { term: '<span class="c">git switch main && git pull</span>\n<span class="c">git switch -c fix/thing</span>\n<span class="o">…work…</span>\n<span class="c">git add -p && git commit -m "Fix thing"</span>\n<span class="c">git push -u origin fix/thing</span>\n<span class="o">…open PR, get review, squash merge…</span>\n<span class="c">git switch main && git pull && git branch -d fix/thing</span>' },
              { h: 'Rules worth internalising' },
              { ul: [
                'Commit small and often. A commit is cheap; a lost afternoon is not.',
                'Never commit secrets. If you do, rotate the key — do not just delete the file.',
                'Pushed code gets <code>revert</code>. Local code gets <code>reset</code>.',
                'Never rebase or force push a branch other people are using.',
                'When something goes wrong, <code>git reflog</code> before you panic.',
                'Branch names and commit messages are messages to your future self.',
                'Use worktrees instead of stashing when you need to be in two places.'
              ] },
              { call: { k: 'tip', t: 'The confidence unlock:', p: 'Almost nothing in Git is truly destructive once committed. Commits stay in the object database for weeks even when nothing points at them. Commit early — then experiment fearlessly.' } }
            ]),
            Q('Single most important habit for never losing work?',
              ['Push to GitHub once a week', 'Commit small and often, so there is always a recoverable point', 'Keep a zip backup', 'Never use branches'],
              1,
              'Committed work is recoverable through reflog even after resets and bad rebases. Uncommitted work is the only thing Git genuinely cannot save. Commit first, experiment second.')
          ]
        }
      ]
    }
  ]
};
