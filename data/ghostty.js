/* ============================================================
   TRACK: Terminal & Ghostty
   Verified against Ghostty 1.3.1 defaults (`ghostty +show-config --default`)
   ============================================================ */
const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });

export const ghostty = {
  id: 'ghostty',
  name: 'Terminal & Ghostty',
  emoji: '👻',
  glow: '#a07cff',
  time: '~35 min',
  desc: 'What a terminal emulator actually is, every Ghostty hotkey worth knowing, the config that makes it fly, and how to wire it into a Claude Code + Codex workflow.',
  chapters: [
    {
      title: 'Chapter 1 — What you are actually looking at',
      desc: 'Terminal, shell, prompt — three different things people call "the terminal".',
      nodes: [
        {
          id: 'gh-01', name: 'Terminal vs shell', ico: '🪟',
          steps: [
            L('Three layers, not one', [
              { ul: [
                '<strong>Terminal emulator</strong> — the app window. Ghostty, iTerm2, Terminal.app, Alacritty, WezTerm. It draws text, handles the keyboard, owns tabs and splits. It runs no commands itself.',
                '<strong>Shell</strong> — the program running <em>inside</em> that window. zsh, bash, fish. It reads what you type, expands it, and runs programs.',
                '<strong>Prompt</strong> — the little bit of text before your cursor. Drawn by the shell (or by a tool like Starship). Purely cosmetic + informational.'
              ] },
              { call: { k: 'tip', t: 'Why it matters:', p: 'It tells you where to fix things. Colours, fonts, splits, hotkeys → terminal config. Aliases, <code>$PATH</code>, tab completion, history → shell config (<code>~/.zshrc</code>).' } }
            ]),
            Q('Tab-completion is behaving oddly. Which config do you edit?',
              ['Ghostty config', '<code>~/.zshrc</code> — completion belongs to the shell', 'macOS System Settings', 'Your prompt theme'],
              1,
              'The terminal only ships keystrokes to the shell. Everything about interpreting those keystrokes — completion, history, aliases — is the shell\'s job.')
          ]
        },
        {
          id: 'gh-02', name: 'Why Ghostty', ico: '👻',
          steps: [
            L('What makes it different', [
              { p: 'Ghostty is a GPU-accelerated terminal that ships as a genuinely <em>native</em> app — real macOS windows, tabs, and menus, not a cross-platform toolkit pretending. It is written in Zig, and it is fast in the way you notice rather than the way you benchmark.' },
              { ul: [
                '<strong>Native platform UI</strong> — proper macOS tabs, fullscreen, and window restore.',
                '<strong>Shell integration</strong> — it knows where each command started and ended, which powers prompt-jumping and smarter selection.',
                '<strong>Zero-config sane defaults</strong> — it is good before you touch anything.',
                '<strong>Config is one plain text file</strong> — versionable, diffable, portable.'
              ] },
              { call: { k: 'warn', t: 'The honest bit:', p: 'Ghostty has <em>no plugin system</em>. Nothing to install, nothing to break. Everything people call a "Ghostty plugin" is really a shell-level tool — Starship, fzf, zoxide, atuin, tmux. That is a feature, not a gap.' } }
            ]),
            Q('Where do Ghostty "plugins" actually live?',
              ['A built-in plugin manager', 'There is no plugin system — power comes from shell tools you install separately', 'The App Store', 'A Lua config directory'],
              1,
              'Ghostty deliberately has no plugin API. You get speed and stability; the extensibility lives one layer down in your shell, where it is more portable anyway.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 — Hotkeys worth burning in',
      desc: 'Verified against Ghostty 1.3.1 defaults on macOS. ⌘ = super.',
      nodes: [
        {
          id: 'gh-03', name: 'Splits & tabs', ico: '🪟',
          steps: [
            L('Stop opening new windows', [
              { term: '<span class="h">⌘D</span>          split right\n<span class="h">⌘⇧D</span>         split down\n<span class="h">⌘[ / ⌘]</span>     previous / next split\n<span class="h">⌘⌥←↑↓→</span>      move to the split in that direction\n<span class="h">⌘⌃←↑↓→</span>      resize the split by 10\n<span class="h">⌘⌃=</span>         equalize all splits\n<span class="h">⌘⇧↵</span>         zoom the focused split (toggle)\n<span class="h">⌘W</span>          close the focused split/surface\n\n<span class="h">⌘T</span>          new tab\n<span class="h">⌘1…⌘8</span>      jump to tab N   <span class="o">⌘9 = last tab</span>\n<span class="h">⌘⇧[ / ⌘⇧]</span>   previous / next tab\n<span class="h">⌘N</span>          new window' },
              { call: { k: 'tip', t: 'The one to learn first:', p: '<strong>⌘⇧↵ (zoom split)</strong>. Blow one pane up to fill the window, read the output, hit it again to go back. It turns a cramped four-way split into a workable layout.' } }
            ]),
            Q('You have four splits and need one full-screen for a moment.',
              ['Close the other three', '⌘⇧↵ to zoom, then ⌘⇧↵ again to restore', '⌘N for a new window', 'Drag the divider'],
              1,
              'Zoom is reversible and instant, and your layout survives. Splits are only useful if you can temporarily un-split.')
          ]
        },
        {
          id: 'gh-04', name: 'Scrollback & search', ico: '🔎',
          steps: [
            L('Never re-run a command to see its output again', [
              { term: '<span class="h">⌘F</span>          start search        <span class="h">⌘G</span> next  <span class="h">⌘⇧G</span> previous\n<span class="h">⌘E</span>          search for the current selection\n<span class="h">esc</span>         end search\n\n<span class="h">⌘↑ / ⌘↓</span>     jump to previous / next <span class="o">prompt</span>\n<span class="h">⌘⇧↑ / ⌘⇧↓</span>   same, extending the selection\n<span class="h">⌘home/end</span>   scroll to very top / bottom\n<span class="h">⌘K</span>          clear screen\n<span class="h">⌘⇧J</span>         write the whole screen to a file and paste its path' },
              { call: { k: 'tip', t: 'Prompt jumping is the sleeper feature:', p: '<strong>⌘↑</strong> leaps to the start of the previous command instead of scrolling blindly. It only works because shell integration is on — which is why <code>shell-integration = zsh</code> in your config matters.' } }
            ]),
            Q('<code>⌘↑</code> jumps between prompts. What makes that possible?',
              ['GPU rendering', 'Shell integration — Ghostty knows where each command began', 'A plugin', 'macOS accessibility APIs'],
              1,
              'The shell emits markers around each prompt. Without <code>shell-integration</code>, Ghostty just sees an undifferentiated wall of text.')
          ]
        },
        {
          id: 'gh-05', name: 'Command palette & config', ico: '🎨',
          steps: [
            L('The two you will forget you have', [
              { term: '<span class="h">⌘⇧P</span>         command palette — every action, searchable\n<span class="h">⌘,</span>          open the config file\n<span class="h">⌘⇧,</span>         reload config (no restart needed)\n<span class="h">⌘+ / ⌘-</span>     font size    <span class="h">⌘0</span> reset\n<span class="h">⌘↵</span>          fullscreen\n<span class="h">⌘⌥I</span>         open the inspector (debug rendering/keys)' },
              { call: { k: 'tip', t: 'Live-edit loop:', p: '⌘, to open the config, change a line, ⌘⇧, to reload. Instant feedback, no restart. Do your theme hunting this way with <code>ghostty +list-themes</code> open in a split.' } }
            ]),
            Q('Fastest way to find an action whose hotkey you have forgotten?',
              ['Read the docs', '⌘⇧P command palette', 'Restart Ghostty', 'Check ~/.zshrc'],
              1,
              'The palette lists every bindable action with a fuzzy search. It is also how you discover features you did not know existed.')
          ]
        },
        {
          id: 'gh-06', name: 'The quick terminal', ico: '⚡',
          steps: [
            L('A terminal that slides down over everything', [
              { p: 'The <strong>quick terminal</strong> is a global drop-down: hit a hotkey from <em>any</em> app and a terminal slides in over your screen. Hit it again and it disappears. It is not bound by default — you must add a <code>global:</code> keybind.' },
              { term: '<span class="o"># in ~/.config/ghostty/config</span>\nquick-terminal-position = top\nquick-terminal-animation-duration = 0.15\nquick-terminal-autohide = true\n<span class="h">keybind = global:ctrl+grave_accent=toggle_quick_terminal</span>' },
              { call: { k: 'tip', t: 'Why it changes your day:', p: 'One key from inside Claude Desktop, a browser, anywhere — run a command, read it, dismiss it. No window hunting. This is the single highest-ROI thing in Ghostty and most people never turn it on. You already have it: <strong>Ctrl+`</strong>.' } }
            ]),
            Q('What does the <code>global:</code> prefix on a keybind mean?',
              ['It applies to all splits', 'It works system-wide, even when Ghostty is not focused', 'It is saved globally, not per-project', 'It applies to all Ghostty windows only'],
              1,
              'Without <code>global:</code> the binding only fires while Ghostty has focus — which would defeat the entire purpose of a drop-down terminal.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 — Config that earns its keep',
      desc: 'One plain text file at ~/.config/ghostty/config.',
      nodes: [
        {
          id: 'gh-07', name: 'Config anatomy', ico: '📝',
          steps: [
            L('key = value, that is the whole syntax', [
              { term: '<span class="o"># ~/.config/ghostty/config</span>\ntheme = TokyoNight Storm\nfont-family = "JetBrains Mono"\nfont-size = 14\nbackground-opacity = 0.94\nbackground-blur-radius = 20\nwindow-padding-x = 14\nscrollback-limit = 100000000\nshell-integration = zsh\nshell-integration-features = cursor,sudo,title\nmacos-option-as-alt = true' },
              { ul: [
                '<code>ghostty +list-themes</code> — browse hundreds of built-in themes live.',
                '<code>ghostty +show-config --default --docs</code> — every option with documentation.',
                '<code>ghostty +list-keybinds --default</code> — every default binding.',
                '<code>ghostty +list-fonts</code> — fonts it can actually see.'
              ] },
              { call: { k: 'warn', t: 'On macOS the CLI is inside the app bundle.', p: 'If <code>ghostty</code> is "command not found", it is at <code>/Applications/Ghostty.app/Contents/MacOS/ghostty</code>. Alias it in <code>~/.zshrc</code> and the <code>+</code> commands become usable.' } }
            ]),
            Q('You want to see every option Ghostty supports, documented.',
              ['Read the source', '<code>ghostty +show-config --default --docs</code>', 'Open the app settings', 'There is no such list'],
              1,
              'The binary documents itself. This beats any blog post because it always matches the version you actually have installed.')
          ]
        },
        {
          id: 'gh-08', name: 'macos-option-as-alt', ico: '⌥',
          steps: [
            L('The setting that fixes word-jumping', [
              { p: 'By default macOS treats Option as a "type a special character" key — Option+B gives <code>∫</code>. Terminal programs expect Option to be <strong>Alt</strong>, which is what powers word-by-word cursor movement.' },
              { term: 'macos-option-as-alt = true\n\n<span class="o"># then these work everywhere:</span>\n<span class="h">⌥←  ⌥→</span>    move one word left / right\n<span class="h">⌃A  ⌃E</span>    jump to start / end of line\n<span class="h">⌃W</span>         delete the previous word\n<span class="h">⌃U</span>         clear the whole line\n<span class="h">⌃R</span>         search command history\n<span class="h">⌃L</span>         clear screen' },
              { call: { k: 'tip', t: 'These are readline, not Ghostty:', p: 'Ctrl+A/E/W/U/R work in zsh, bash, psql, node, python — anything using readline. Learning six of them is a permanent speed upgrade everywhere, forever.' } }
            ]),
            Q('<code>⌃R</code> in your shell does what?',
              ['Reloads the config', 'Reverse-searches your command history', 'Redraws the screen', 'Restarts the shell'],
              1,
              'Reverse history search — start typing any fragment of an old command and it finds it. Install <code>atuin</code> and it becomes a searchable, synced history across every machine you own.')
          ]
        },
        {
          id: 'gh-09', name: 'Audit your own config', ico: '🕵️',
          steps: [
            L('Three real problems worth checking', [
              { h: 'Redundant keybinds' },
              { p: 'Ghostty already binds ⌘D, ⌘⇧D, ⌘⌥arrows and ⌘⇧↵ by default. Re-declaring them in your config adds nothing but gives you something to keep in sync. Delete anything that matches the default.' },
              { h: 'Silently invalid actions' },
              { term: '<span class="o">✗ wrong — these actions do not exist</span>\nkeybind = cmd+opt+up=goto_split:<span class="h">top</span>\nkeybind = cmd+opt+down=goto_split:<span class="h">bottom</span>\n\n<span class="o">✓ right — the directions are up/down/left/right</span>\nkeybind = cmd+opt+up=goto_split:<span class="h">up</span>\nkeybind = cmd+opt+down=goto_split:<span class="h">down</span>' },
              { p: 'A bad value can invalidate the line, so the key just does nothing and you assume the feature is broken. Run <code>ghostty +validate-config</code> after every edit.' },
              { h: 'clipboard-paste-protection' },
              { call: { k: 'warn', t: 'Worth reconsidering:', p: 'Setting <code>clipboard-paste-protection = false</code> removes the confirmation when you paste text containing newlines. That prompt exists because a copied line ending in a newline <em>executes immediately</em> — the classic "copy a command from a website, it runs before you can read it" attack. The prompt is mildly annoying; the failure mode is not.' } }
            ]),
            Q('A keybind line has an invalid action value. What happens?',
              ['Ghostty refuses to start', 'The binding silently does nothing and the feature looks broken', 'It falls back to the default', 'You get a popup every launch'],
              1,
              'This is why <code>ghostty +validate-config</code> exists. Silent failure is the worst failure mode — you conclude the feature does not work rather than that you typo\'d.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 4 — The full workflow',
      desc: 'Ghostty + shell tools + Claude Code + Claude Desktop, working as one thing.',
      nodes: [
        {
          id: 'gh-10', name: 'Shell tools that pay for themselves', ico: '🧰',
          steps: [
            L('The stack that goes under Ghostty', [
              { ul: [
                '<strong>starship</strong> — a prompt showing git branch, dirty state, language versions. Answers "where am I, is it clean" at a glance.',
                '<strong>fzf</strong> — fuzzy-find anything. Rebinds ⌃R into a searchable history picker.',
                '<strong>zoxide</strong> — <code>z proj</code> jumps to the folder you actually meant. Replaces years of <code>cd ../../..</code>.',
                '<strong>eza</strong> — <code>ls</code> with git status and tree mode.',
                '<strong>ripgrep</strong> — <code>rg pattern</code>, dramatically faster than grep and respects <code>.gitignore</code>.',
                '<strong>bat</strong> — <code>cat</code> with syntax highlighting.',
                '<strong>atuin</strong> — shell history in a searchable database, synced across machines.',
                '<strong>gh</strong> — GitHub from the terminal: <code>gh pr create</code>, <code>gh pr checkout 42</code>.'
              ] },
              { term: '<span class="c">$ brew install starship fzf zoxide eza ripgrep bat atuin gh</span>' },
              { call: { k: 'tip', t: 'Install order:', p: 'If you only take two: <strong>zoxide</strong> and <strong>fzf</strong>. Navigation and recall are what you do hundreds of times a day.' } }
            ]),
            Q('Which of these is a Ghostty feature rather than a shell tool?',
              ['fzf history search', 'zoxide directory jumping', 'The quick terminal drop-down', 'starship prompt'],
              2,
              'The quick terminal is the terminal emulator\'s job — it owns the window. Everything else runs inside the shell and works in any terminal.')
          ]
        },
        {
          id: 'gh-11', name: 'The layout', ico: '🗺️',
          steps: [
            L('A workspace that does not need managing', [
              { h: 'One tab per project, splits inside it' },
              { term: '<span class="o">⌘T</span>   Tab 1: project-a      <span class="o">⌘T</span>   Tab 2: project-b\n     ├─ Claude Code             ├─ Claude Code\n     └─ ⌘D → dev server / git   └─ ⌘D → tests\n\n<span class="o">Ctrl+`</span>  quick terminal for one-off commands\n     (never disturbs a running agent)' },
              { h: 'Parallel agents = git worktrees, not more tabs' },
              { term: '<span class="c">$ git worktree add ../proj-feature-a feature-a</span>\n<span class="c">$ git worktree add ../proj-feature-b feature-b</span>\n<span class="o"># one Ghostty tab per worktree, one Claude Code each</span>' },
              { call: { k: 'warn', t: 'The mistake to avoid:', p: 'Two agents in the same folder overwrite each other\'s edits <em>and</em> each other\'s assumptions. One worktree per agent makes the isolation physical rather than hopeful.' } }
            ]),
            Q('Cleanest way to run two Claude Code sessions on two features?',
              ['Two tabs in the same folder', 'Two git worktrees, one tab each', 'One session, alternate the requests', 'Two clones of the repo'],
              1,
              'Worktrees give real filesystem isolation while sharing one <code>.git</code>. Two clones also works but re-downloads history and duplicates dependencies.')
          ]
        },
        {
          id: 'gh-12', name: 'Desktop + terminal, together', ico: '🔗',
          steps: [
            L('Which tool for which job', [
              { ul: [
                '<strong>Claude Desktop</strong> — thinking, planning, reading, comparing. No repo, no file writes. Good for "should I do X or Y", drafting, and anything you want to read comfortably.',
                '<strong>Claude Code in Ghostty</strong> — anything that touches the repo. It has your files, your git history, your tests, your CLAUDE.md.',
                '<strong>Codex</strong> — a genuinely independent second opinion on the same code. Different model, different failure modes. Excellent as a reviewer.',
                '<strong>Quick terminal (Ctrl+`)</strong> — the glue. Run one command from anywhere without touching your layout.'
              ] },
              { h: 'A loop that works' },
              { term: '<span class="o">1.</span> Plan in Claude Desktop or Claude Code plan mode\n<span class="o">2.</span> Build in Claude Code, on a branch, in a worktree\n<span class="o">3.</span> <span class="c">git diff | codex exec "review this for bugs"</span>\n<span class="o">4.</span> <span class="c">gh pr create</span>  — CI + human review\n<span class="o">5.</span> Squash merge, <span class="c">git worktree remove</span>' },
              { call: { k: 'tip', t: 'The principle:', p: 'The terminal is the integration layer. Every one of these tools reads stdin and writes stdout, which means they compose. That composability is worth more than any single tool\'s features.' } }
            ]),
            Q('Why pipe a diff to a second, different AI tool for review?',
              ['It is faster', 'Independent models have different blind spots, so one catches what the other missed', 'It is cheaper', 'It is required by GitHub'],
              1,
              'A model reviewing its own output shares its own blind spots. A different model is a genuinely independent check — the same reason humans do code review at all.')
          ]
        }
      ]
    }
  ]
};
