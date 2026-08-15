/* ============================================================
   TRACK: Terminal 101
   The prerequisite for everything else. Keys steps drive a real
   line-editor simulation — press the chords on a desktop, tap them
   on a phone, scored against par.
   ============================================================ */
import { terminalLayers, lineAnatomy } from './svg.js';

const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });
const K = (goal, line, cursor, target, par, keys, reveal, why, hint) =>
  ({ t: 'keys', goal, line, cursor, target, par, keys, reveal, why, hint });
/* history-backed variant — ↑ ↓ ⌃R and ⌥. need something to recall */
const KH = (history, goal, line, cursor, target, par, keys, reveal, why) =>
  ({ t: 'keys', history, goal, line, cursor, target, par, keys, reveal, why });

const HIST = ['git status', 'npm run build', 'npm test'];
const HIST_DEEP = ['git status', 'npm run build', 'git push origin main', 'cd ~/projects/app', 'npm test'];

export const terminal = {
  id: 'terminal',
  name: 'Terminal 101',
  emoji: '⌨️',
  glow: '#ffc44d',
  time: '~45 min',
  desc: 'Stop fighting the command line. Cursor control, deleting without backspace, history recall, frozen terminals, highlighting, quoting — practised as keystroke golf, not memorised.',
  chapters: [
    {
      title: 'Chapter 1 — The line is not the screen',
      desc: 'Why some keys act on the window and some act on what you are typing.',
      nodes: [
        {
          id: 'tm-01', name: 'Two things called "the terminal"', ico: '🪟',
          steps: [
            L('The window, the shell, the program', [
              { p: 'When people say "the terminal" they mean two or three different things stacked on top of each other. Almost every moment of confusion at the command line comes from not knowing which layer you are talking to.' },
              { svg: terminalLayers },
              { ul: [
                'The <strong>terminal emulator</strong> is the app — Ghostty, iTerm2, Terminal.app. It draws characters and owns the window: fonts, colours, tabs, splits, and <em>copy and paste</em>. It never runs your commands.',
                'The <strong>shell</strong> runs inside it — zsh, bash, fish. It reads the line you type, expands it, and launches programs. History, tab completion and aliases are all its job.',
                'The <strong>program</strong> is what the shell launched — git, npm, curl. While it runs, it takes over the keyboard.'
              ] },
              { call: { k: 'tip', t: 'The tell:', p: 'Anything with <strong>⌘</strong> is the window (⌘C copy, ⌘T new tab, ⌘K clear). Anything with <strong>⌃ Control</strong> goes down to the shell or the running program. That is why ⌘C copies but ⌃C kills — different keys, different layers.' } },
              { call: { t: 'Where to fix things:', p: 'Colours, fonts, splits, hotkeys → terminal config. Aliases, <code>$PATH</code>, tab completion, history → shell config, which for zsh means <code>~/.zshrc</code>.' } }
            ]),
            Q('You press <b>⌃C</b> while a long <code>npm install</code> is running. Who receives it?',
              ['The terminal emulator — it clears the window', 'The shell — it clears your typed line', 'The running program — it gets an interrupt signal and stops', 'macOS — it force-quits the app'],
              2,
              'While a program is running it owns the keyboard, so ⌃C goes straight to it as an interrupt. At an empty prompt with nothing running, the shell handles it instead and just abandons the line.')
          ]
        },
        {
          id: 'tm-02', name: 'Where is the cursor', ico: '📍',
          steps: [
            L('Stop holding down the arrow key', [
              { p: 'The line you are typing is not a text box. It is <strong>readline</strong>, a tiny editor built into the shell — and it has been in every Unix shell for forty years. Learn six chords and you never crawl along a line again.' },
              { svg: lineAnatomy },
              { ul: [
                '<code>⌃A</code> — jump to the <strong>start</strong> of the line',
                '<code>⌃E</code> — jump to the <strong>end</strong>',
                '<code>⌥←</code> / <code>⌥→</code> — move one <strong>word</strong> at a time',
                '<code>←</code> / <code>→</code> — one character, the slow way'
              ] },
              { call: { k: 'warn', t: 'If ⌥← does nothing:', p: 'macOS treats Option as "type a special character" by default, so Option+B gives <code>∫</code> instead of moving. In Ghostty set <code>macos-option-as-alt = true</code>. In Terminal.app it is <em>Use Option as Meta key</em>. Nothing below works until you do.' } },
              { call: { k: 'tip', t: 'These are everywhere:', p: 'The same chords work in bash, zsh, fish, the Python REPL, node, psql, and most text inputs on macOS. You are not learning a terminal trick — you are learning a system-wide one.' } }
            ]),
            K('Jump to the start of the line.',
              'git commit -m "add the login form"', null,
              { line: 'git commit -m "add the login form"', cursor: 0 },
              1, ['⌃A', '⌃E', '←', '→', '⌥←', '⌥→'], '<code>⌃A</code> — A for the start of the alphabet.',
              'The line does not change — only the cursor moves. <code>⌃A</code> is one keystroke no matter how long the line is.'),
            K('Now jump to the end.',
              'git commit -m "add the login form"', 0,
              { line: 'git commit -m "add the login form"', cursor: 34 },
              1, ['⌃A', '⌃E', '←', '→', '⌥←', '⌥→'], '<code>⌃E</code> — E for End.',
              '<code>⌃A</code> and <code>⌃E</code> are the two you will use most. Together they replace every long press of an arrow key you have ever done.'),
            K('Move the cursor back two words, to the start of <code>build</code>.',
              'npm run build --verbose', null,
              { line: 'npm run build --verbose', cursor: 8 },
              2, ['⌥←', '⌥→', '⌃A', '⌃E', '←', '→'], 'Press <code>⌥←</code> twice.',
              '<code>⌥←</code> steps back one word per press. It skips punctuation, which is why one press lands on <code>verbose</code> and the second reaches <code>build</code>.')
          ]
        },
        {
          id: 'tm-03', name: 'Delete without backspace', ico: '✂️',
          steps: [
            L('Four ways to delete, none of them ⌫', [
              { p: 'Holding backspace to clear a long command is the single most common waste of time at a terminal. There are four chords that do it instantly.' },
              { term: '<span class="h">⌃W</span>   delete the word before the cursor   <span class="o">(back to the last space)</span>\n<span class="h">⌥⌫</span>   delete the word before the cursor   <span class="o">(stops at / . - too)</span>\n<span class="h">⌥D</span>   delete the word <span class="o">after</span> the cursor\n<span class="h">⌃U</span>   delete everything before the cursor\n<span class="h">⌃K</span>   delete everything after the cursor' },
              { call: { k: 'tip', t: '⌃W vs ⌥⌫ — the difference matters on paths:', p: 'On <code>/usr/local/bin</code>, <code>⌃W</code> deletes the whole path in one go because there is no space in it. <code>⌥⌫</code> stops at each slash, so it deletes just <code>bin</code>. Pick by whether you want the word or the whole argument.' } },
              { call: { k: 'warn', t: 'One footnote on ⌃U:', p: 'In bash it deletes to the start of the line; zsh binds it to kill the <em>whole</em> line. When your cursor is at the end — which is nearly always — both do the same thing: clear it.' } }
            ]),
            K('Delete the last word so you can retype it.',
              'git commit -m "fix teh bugg"', null,
              { line: 'git commit -m "fix teh ' },
              1, ['⌃W', '⌃U', '⌃K', '⌫', '⌥⌫'], '<code>⌃W</code> — W for Word.',
              '<code>⌃W</code> deletes back to the previous space and leaves that space behind, so you can type the replacement straight away.'),
            K('Clear this line completely. Do not hold backspace.',
              'sudo rm -rf /tmp/build-cache-old', null,
              { line: '' },
              1, ['⌃U', '⌃W', '⌃K', '⌫', '⌃A'], '<code>⌃U</code> from the end of the line.',
              'One keystroke instead of thirty. This is the chord to reach for the moment you decide a command is wrong.'),
            K('The cursor sits after <code>dev</code>. Delete everything to the right of it.',
              'npm run dev --port 3000', 11,
              { line: 'npm run dev' },
              1, ['⌃K', '⌃U', '⌃W', '⌫', '⌃E'], '<code>⌃K</code> — K for Kill to the end.',
              '<code>⌃U</code> and <code>⌃K</code> are mirrors: everything before the cursor, everything after it. Together they cut a line at any point.'),
            K('Delete only <code>bin</code> — keep the rest of the path.',
              'cd /usr/local/bin', null,
              { line: 'cd /usr/local/' },
              1, ['⌥⌫', '⌃W', '⌫', '⌃U'], '<code>⌥⌫</code> — it stops at the slash. <code>⌃W</code> would take the whole path.',
              'This is the one case where the two word-delete chords disagree, and knowing which is which saves retyping a long path.')
          ]
        },
        {
          id: 'tm-04', name: 'The kill ring', ico: '🪃',
          steps: [
            L('Everything you delete is recoverable', [
              { p: 'Those deletes are not destructive. Readline calls them <em>kills</em>, and the text goes into a buffer called the <strong>kill ring</strong>. <code>⌃Y</code> — <em>yank</em> — pastes it straight back.' },
              { term: '<span class="c">$ git commit -m "add login"</span>\n<span class="h">⌃U</span>  <span class="o">→ line cleared, text is in the kill ring</span>\n<span class="h">⌃Y</span>  <span class="o">→ it is back, exactly as it was</span>' },
              { call: { k: 'tip', t: 'The move that feels like cheating:', p: 'Half-way through a long command you realise you need to run something else first. <code>⌃U</code> to pocket it, run the other thing, then <code>⌃Y</code> to get your line back. No retyping, no scrolling through history.' } },
              { call: { t: 'It is not the system clipboard:', p: 'The kill ring belongs to the shell, so ⌘V will not paste it and it will not paste into your editor. It is a separate, faster loop that lives entirely on the command line.' } }
            ]),
            K('You meant to delete one word but cleared the whole line. Get it back, then delete just the last word.',
              'git commit -m "add login"', null,
              { line: 'git commit -m "add ' },
              3, ['⌃U', '⌃Y', '⌃W', '⌃E', '⌫'], '<code>⌃U</code> then <code>⌃Y</code> then <code>⌃W</code>.',
              '<code>⌃Y</code> restores the killed text and leaves the cursor at the end of it, so you can carry straight on editing.'),
            Q('Does <code>⌃Y</code> paste what you copied with <b>⌘C</b>?',
              ['Yes, they share one clipboard', 'No — the kill ring is the shell\'s own buffer, separate from the system clipboard', 'Only in Ghostty', 'Only if copy-on-select is enabled'],
              1,
              'Two independent buffers. ⌘C/⌘V is the terminal emulator talking to macOS; the kill ring is readline inside the shell. Knowing they are separate stops a lot of confused pasting.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 — Never type it twice',
      desc: 'The shell remembers everything. Most people retype anyway.',
      nodes: [
        {
          id: 'tm-05', name: 'History', ico: '🕰️',
          steps: [
            L('Two ways back', [
              { ul: [
                '<code>↑</code> / <code>↓</code> — step through previous commands one at a time. Fine for the last two or three.',
                '<code>⌃R</code> — <strong>reverse search</strong>. Type any fragment and it finds the most recent command containing it. Press <code>⌃R</code> again to keep going further back.',
                '<code>⌃G</code> — abort the search and get your line back.',
                '<code>history</code> — print the lot, with numbers.'
              ] },
              { term: '<span class="c">$ </span><span class="h">⌃R</span>\n<span class="o">(reverse-i-search)`\': </span>\n<span class="o">(reverse-i-search)`test\': npm test -- --watch</span>\n<span class="o">           ↑ you typed four letters, it found the whole command</span>' },
              { call: { k: 'tip', t: 'Search beats scrolling:', p: 'Pressing ↑ eleven times means reading eleven lines to check each one. <code>⌃R</code> plus three characters is faster and does not depend on remembering how far back it was.' } },
              { call: { k: 'warn', t: 'History is written on exit:', p: 'Two terminal windows can lose each other\'s history because the last one to close wins. Add <code>setopt INC_APPEND_HISTORY SHARE_HISTORY</code> to <code>~/.zshrc</code> and every window shares one live history.' } }
            ]),
            KH(HIST, 'Get back to <code>npm test</code> using the arrow keys.',
              '', 0,
              { line: 'npm test' },
              3, ['↑', '↓'], 'Press <code>↑</code> three times.',
              'Three presses, and you had to read each one on the way past. Now do the same thing with search.'),
            KH(HIST_DEEP, 'Same command, five deep this time. Find it with reverse search: press ⌃R, then type enough of it to match.',
              '', 0,
              { line: 'npm test' },
              3, ['⌃R', 't', 'e', 's', '↑', '⌃G'], '<code>⌃R</code>, then type <code>te</code> — on a phone, tap the letter keys.',
              'Two characters found it five commands back. The longer your history gets, the more search wins — and unlike ↑, it never gets slower.')
          ]
        },
        {
          id: 'tm-06', name: 'Bang tricks', ico: '💥',
          steps: [
            L('Reuse the last command without touching it', [
              { term: '<span class="h">!!</span>      the entire previous command\n<span class="h">!$</span>      the last argument of it\n<span class="h">!*</span>      all of its arguments\n<span class="h">!npm</span>    the most recent command starting with "npm"' },
              { p: 'The famous one: you run a command, it fails with <em>permission denied</em>, and you need it again with <code>sudo</code>.' },
              { term: '<span class="c">$ apt install ripgrep</span>\n<span class="o">E: Could not open lock file — are you root?</span>\n<span class="c">$ sudo !!</span>\n<span class="o">→ runs: sudo apt install ripgrep</span>' },
              { call: { k: 'tip', t: '<code>!$</code> is the daily one:', p: '<code>mkdir -p ~/projects/thing</code> then <code>cd !$</code> — no retyping the path, and no chance of a typo in it.' } }
            ]),
            B('You just ran a command that failed for lack of permissions. Re-run it as root, without retyping it.',
              ['sudo', '!!'], ['!$', '!*', 'again', '-r', 'repeat'],
              '<code>!!</code> expands to the whole previous command before the shell runs it, so this becomes <code>sudo</code> plus whatever you just tried.',
              'Two tokens. The second is punctuation.'),
            Q('You run <code>mkdir -p ~/work/api</code>. What does <code>cd !$</code> do?',
              ['Repeats the mkdir', 'Changes into <code>~/work/api</code> — the last argument of the previous command', 'Goes to your home directory', 'Nothing, <code>!$</code> only works with sudo'],
              1,
              '<code>!$</code> is the last argument of the last command. Making a directory and immediately entering it is the classic pairing.')
          ]
        },
        {
          id: 'tm-07', name: 'The last argument', ico: '🎯',
          steps: [
            L('⌥. — insert, do not guess', [
              { p: '<code>!$</code> works but you cannot see what it will become until you press Enter. <code>⌥.</code> is better: it <strong>types the last argument straight into your line</strong>, visibly, where you can still edit it.' },
              { term: '<span class="c">$ mkdir -p ~/projects/newapp</span>\n<span class="c">$ cd </span><span class="h">⌥.</span>\n<span class="c">$ cd ~/projects/newapp</span>   <span class="o">← inserted, still editable</span>' },
              { call: { k: 'tip', t: 'Press it again:', p: 'Each further <code>⌥.</code> walks back through the last argument of older commands. It is a tiny history of just the things you care about — paths and filenames.' } }
            ]),
            KH(['mkdir -p ~/projects/newapp'],
              'You just ran <code>mkdir -p ~/projects/newapp</code>. Complete this line with that path — without typing it.',
              'cd ', 3,
              { line: 'cd ~/projects/newapp' },
              1, ['⌥.', '↑', '⌃E', '⌃Y'], '<code>⌥.</code> — Option and the full stop.',
              'It inserts the text so you can still edit it before hitting Enter — the advantage over <code>!$</code>, which you only see after it runs.'),
            Q('How is <code>⌥.</code> different from <code>!$</code>?',
              ['They are identical', '<code>⌥.</code> inserts visible, editable text; <code>!$</code> expands only when you press Enter', '<code>!$</code> is faster', '<code>⌥.</code> only works in zsh'],
              1,
              'Seeing it before you run it matters most with <code>rm</code> and <code>sudo</code>, where being wrong about the last argument is expensive.')
          ]
        },
        {
          id: 'tm-08', name: 'Tab completion', ico: '⇥',
          steps: [
            L('Never type a filename in full', [
              { ul: [
                '<strong>Tab once</strong> — completes as far as it unambiguously can.',
                '<strong>Tab twice</strong> — lists every candidate when it cannot decide.',
                'It completes commands, paths, branch names, npm scripts, flags — anything the shell has a completion for.'
              ] },
              { term: '<span class="c">$ cd ~/pro</span><span class="h">⇥</span>\n<span class="c">$ cd ~/projects/</span>\n\n<span class="c">$ git ch</span><span class="h">⇥⇥</span>\n<span class="o">check-attr  check-ignore  checkout  cherry  cherry-pick</span>' },
              { call: { k: 'tip', t: 'Use it as a spellchecker:', p: 'If Tab refuses to complete, the thing you are typing does not exist. That is a typo or a wrong directory found <em>before</em> you press Enter, not after.' } }
            ]),
            B('Show every file in the current folder, including the hidden ones.',
              ['ls', '-la'], ['-l', '-a', '--all', 'dir', '-h'],
              '<code>-l</code> is the long listing, <code>-a</code> includes dotfiles like <code>.git</code> and <code>.env</code>. Combined as <code>-la</code> — most single-letter flags can be merged.',
              'One command, one combined flag.'),
            Q('You type <code>git ch</code> and press Tab once. Nothing happens. Why?',
              ['Completion is broken', 'Several commands start with "ch", so it cannot choose — press Tab again to list them', 'You need to install completions', '<code>git</code> does not support Tab'],
              1,
              'A single Tab only completes what is unambiguous. Silence means "several matches"; a second Tab shows you what they are.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 — Control the process',
      desc: 'What to do when something is running, stuck, or has swallowed your terminal.',
      nodes: [
        {
          id: 'tm-09', name: '⌃C vs ⌃D vs ⌃Z', ico: '🛑',
          steps: [
            L('Three ways to stop, and they are not the same', [
              { ul: [
                '<code>⌃C</code> — <strong>interrupt</strong>. "Stop what you are doing." The program can clean up first. This is the one you want almost always.',
                '<code>⌃D</code> — <strong>end of input</strong>. Not a stop signal at all; it means "no more typing". At an empty prompt that logs you out and closes the window.',
                '<code>⌃Z</code> — <strong>suspend</strong>. Freezes the program and hands you back the prompt. It is still there, paused.'
              ] },
              { term: '<span class="c">$ npm run dev</span>\n<span class="h">⌃Z</span>\n<span class="o">[1]  + suspended  npm run dev</span>\n<span class="c">$ git pull</span>          <span class="o"># do the thing you needed</span>\n<span class="c">$ fg</span>                <span class="o"># bring it back, still running</span>\n\n<span class="c">$ jobs</span>              <span class="o"># what have I suspended?</span>\n<span class="c">$ bg</span>                <span class="o"># resume it in the background</span>' },
              { call: { k: 'warn', t: 'Why your window keeps closing:', p: 'Pressing <code>⌃D</code> at an empty prompt means "end of input" to the shell itself, so the shell exits. If terminals seem to vanish on you, that is why.' } },
              { call: { k: 'tip', t: 'Suspended jobs are easy to forget:', p: '<code>⌃Z</code> and walk away and that dev server is still holding its port. <code>jobs</code> lists them; <code>fg</code> brings the last one back.' } }
            ]),
            Q('A dev server is running and you need the prompt for one quick command, then the server back.',
              ['⌃C, run it, start the server again', '⌃Z, run it, then <code>fg</code>', '⌃D, run it, then <code>bg</code>', 'Open a new window'],
              1,
              '⌃C would kill it and you would wait through a full restart. ⌃Z pauses it in place and <code>fg</code> resumes the same process, with its state intact.')
          ]
        },
        {
          id: 'tm-10', name: '"My terminal is frozen"', ico: '🧊',
          steps: [
            L('It is almost never frozen', [
              { p: 'You are typing and nothing appears. The window is not crashed and the machine is fine — you have almost certainly pressed <code>⌃S</code>.' },
              { term: '<span class="h">⌃S</span>   pause output   <span class="o">(everything keeps running, you just stop seeing it)</span>\n<span class="h">⌃Q</span>   resume output  <span class="o">(the fix)</span>' },
              { p: 'This is <strong>flow control</strong>, a holdover from physical terminals that could not print as fast as the computer sent. It is still on by default in most shells, and <code>⌃S</code> sits right next to the keys people reach for constantly.' },
              { call: { k: 'tip', t: 'Try this order when a terminal seems dead:', p: '<strong>⌃Q</strong> first — costs nothing and fixes this. Then <strong>⌃C</strong> to interrupt whatever is running. Then check whether a program is simply waiting for input. Only then reach for the close button.' } },
              { call: { t: 'Turn it off for good:', p: 'Add <code>stty -ixon</code> to <code>~/.zshrc</code> and ⌃S stops freezing anything. It also frees ⌃S up to be used as forward-search alongside ⌃R.' } }
            ]),
            Q('Your terminal stopped responding to typing. Cheapest first thing to try?',
              ['Close the window and reopen', '⌃Q — you probably hit ⌃S and paused the output', 'Restart your Mac', '⌃C to kill everything'],
              1,
              '⌃Q is instant, safe, and costs nothing if it was not the problem. Closing the window kills whatever was running and loses your scrollback.')
          ]
        },
        {
          id: 'tm-11', name: 'Clear vs scroll', ico: '🧹',
          steps: [
            L('Three "clears" that erase different things', [
              { ul: [
                '<code>⌃L</code> — scrolls the screen so the prompt is at the top. Your scrollback is <strong>still there</strong>; scroll up and you will find it.',
                '<code>clear</code> — the same idea, run as a command.',
                '<code>⌘K</code> in Ghostty — clears the screen <em>and</em> the scrollback. Genuinely gone.'
              ] },
              { call: { k: 'tip', t: 'Which to use:', p: '<code>⌃L</code> to tidy up before a command whose output you want to read cleanly — you keep everything. <code>⌘K</code> before sharing your screen or a screenshot, when you actually want the history gone.' } },
              { call: { t: 'Related:', p: 'In Ghostty <code>⌘↑</code> and <code>⌘↓</code> jump between previous prompts, so you can find the start of a command\'s output without scrolling. That only works because shell integration is enabled.' } }
            ]),
            Q('You run <code>⌃L</code>, then scroll up. What do you see?',
              ['Nothing — it is deleted', 'Everything from before; ⌃L only moved the view', 'Only the last command', 'An error'],
              1,
              '⌃L is a scroll, not a delete. That is exactly why it is safe to use constantly — and why it is the wrong tool if you actually want the history gone.')
          ]
        },
        {
          id: 'tm-12', name: 'When output floods past', ico: '📜',
          steps: [
            L('Pipe it into something that stops', [
              { p: 'A command dumps five thousand lines and the useful part scrolled past. Do not scroll — send it somewhere that waits for you.' },
              { term: '<span class="c">$ git log | less</span>       <span class="o"># page through it</span>\n<span class="c">$ ls -la | head</span>        <span class="o"># first 10 lines</span>\n<span class="c">$ ls -la | tail -20</span>     <span class="o"># last 20</span>\n<span class="c">$ tail -f server.log</span>    <span class="o"># follow live, ⌃C to stop</span>\n<span class="c">$ npm test | grep -i fail</span><span class="o"># only the lines that matter</span>' },
              { h: 'Inside less' },
              { term: '<span class="h">space</span> page down     <span class="h">b</span> page up\n<span class="h">/word</span> search       <span class="h">n</span> next match  <span class="h">N</span> previous\n<span class="h">g</span> top             <span class="h">G</span> bottom\n<span class="h">q</span> quit' },
              { call: { k: 'warn', t: 'If <code>q</code> does not work, you may be in <code>more</code> or a man page — <code>q</code> still quits both. If the screen is genuinely stuck, remember ⌃Q from two levels ago.' } }
            ]),
            B('Page through the git log instead of letting it scroll past.',
              ['git', 'log', '|', 'less'], ['>', 'more', 'head', 'tail', '&'],
              'The pipe <code>|</code> sends one command\'s output into another\'s input. <code>less</code> holds it and waits — <code>space</code> to page, <code>/</code> to search, <code>q</code> to quit.',
              'Command, subcommand, the pipe character, then the pager.'),
            Q('You want to watch a log file update live as your app writes to it.',
              ['<code>cat server.log</code>', '<code>tail -f server.log</code>', '<code>less server.log</code>', '<code>head server.log</code>'],
              1,
              '<code>-f</code> means follow: it prints the end of the file and then keeps printing new lines as they arrive. ⌃C stops it.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 4 — Text, selection and quoting',
      desc: 'Copying things out, and getting things in without breaking them.',
      nodes: [
        {
          id: 'tm-13', name: 'Highlighting and copying', ico: '🖍️',
          steps: [
            L('Selection belongs to the window, not the shell', [
              { p: 'This is the confusion worth clearing up. <strong>You cannot select text with the keyboard on the line you are typing.</strong> Shift+arrows do not highlight it — readline has no concept of a selection. Editing the line and selecting text on screen are two different systems.' },
              { ul: [
                '<strong>Selecting</strong> is the terminal emulator\'s job: drag with the mouse, double-click a word, triple-click a line.',
                '<strong>Editing your line</strong> is the shell\'s job: <code>⌃A</code>, <code>⌃W</code>, <code>⌃U</code> and the rest of Chapter 1.'
              ] },
              { h: 'In Ghostty' },
              { term: '<span class="h">drag</span>          select    <span class="o">(with copy-on-select, that is also the copy)</span>\n<span class="h">⌘C / ⌘V</span>       copy / paste\n<span class="h">⇧← ⇧→ ⇧↑ ⇧↓</span>  adjust an existing selection\n<span class="h">⌘F</span>            search the scrollback   <span class="h">⌘E</span> search for the selection\n<span class="h">⌘⇧J</span>           dump the whole screen to a file' },
              { call: { k: 'tip', t: 'Copy-on-select:', p: 'With <code>copy-on-select = clipboard</code> in your Ghostty config, highlighting text copies it — no ⌘C needed. It is the single best quality-of-life setting in the app.' } },
              { call: { k: 'warn', t: 'Paste protection is worth keeping on:', p: 'Terminals warn before pasting text containing a newline, because a trailing newline <em>executes immediately</em>. That is the "copy a command off a website and it runs before you can read it" problem. The prompt is mildly annoying; the failure is not.' } }
            ]),
            Q('You want to select the middle of the command you are currently typing, using only the keyboard.',
              ['Shift+arrows will highlight it', 'You cannot — the shell has no selection; use ⌃A/⌃W/⌃K to edit instead', '⌘A selects the line', '⌃S starts a selection'],
              1,
              'Shift+arrows adjust a selection in the terminal *window*, not on your input line. Once you stop looking for a selection and reach for the kill chords, the line stops feeling awkward.')
          ]
        },
        {
          id: 'tm-14', name: 'Quoting and spaces', ico: '❝',
          steps: [
            L('The shell splits on spaces before anything runs', [
              { p: 'The shell chops your line at every space and hands the pieces to the program as separate arguments. So a filename with a space in it arrives as two files — and the command fails, or worse, half-succeeds.' },
              { term: '<span class="c">$ rm My Notes.txt</span>\n<span class="o">rm: My: No such file or directory\nrm: Notes.txt: No such file or directory</span>\n\n<span class="c">$ rm "My Notes.txt"</span>   <span class="o">✓ one argument</span>\n<span class="c">$ rm My\\ Notes.txt</span>    <span class="o">✓ the backslash escapes the space</span>' },
              { h: 'Single vs double quotes' },
              { ul: [
                '<code>"double"</code> — the shell still expands <code>$VARIABLES</code> inside.',
                "<code>'single'</code> — completely literal. Nothing is expanded.",
                'So <code>echo "$HOME"</code> prints your path; <code>echo \'$HOME\'</code> prints <code>$HOME</code>.'
              ] },
              { call: { k: 'tip', t: 'Rule of thumb:', p: 'Anything containing a space, a quote or a <code>$</code> goes in quotes. Tab completion escapes spaces for you automatically — another reason to let it type your filenames.' } }
            ]),
            B('Print the literal text <code>$HOME</code> rather than the path it stands for.',
              ['echo', "'$HOME'"], ['"$HOME"', '$HOME', 'print', '\\$HOME'],
              'Single quotes are fully literal, so the shell never expands what is inside. Double quotes would print <code>/Users/you</code> instead.',
              'The quotes that expand nothing.'),
            Q('<code>echo "Total: $COUNT items"</code> — what does the shell do with <code>$COUNT</code>?',
              ['Prints it literally', 'Replaces it with the variable\'s value before echo ever runs', 'Errors if unset', 'Nothing — echo handles it'],
              1,
              'Expansion happens in the shell, before the command runs. <code>echo</code> only ever sees the finished text — which is why an unset variable silently becomes an empty string.')
          ]
        },
        {
          id: 'tm-15', name: 'Globs and braces', ico: '✳️',
          steps: [
            L('Let the shell write the list for you', [
              { ul: [
                '<code>*</code> — any characters, within one folder. <code>*.log</code>',
                '<code>**</code> — any depth of folders. <code>src/**/*.ts</code>',
                '<code>?</code> — exactly one character. <code>file?.txt</code>',
                '<code>{a,b}</code> — brace expansion, which is not a match at all: it just writes out both versions.'
              ] },
              { term: '<span class="c">$ cp config.json config.json.bak</span>\n<span class="c">$ cp config.json{,.bak}</span>      <span class="o">← identical, half the typing</span>\n\n<span class="c">$ mkdir -p src/{api,web,shared}</span>\n<span class="o">→ makes all three folders</span>' },
              { call: { k: 'warn', t: 'Look before you delete:', p: 'Run <code>ls</code> with the same glob before <code>rm</code>. <code>ls *.log</code> shows exactly what <code>rm *.log</code> would remove — and it costs you one second.' } },
              { call: { t: 'The shell expands, not the program:', p: '<code>rm *.log</code> never reaches <code>rm</code> as <code>*.log</code>. The shell replaces it with the actual filenames first. That is why a glob matching nothing produces a confusing error — the program received the literal <code>*</code>.' } }
            ]),
            B('Check what would be deleted before running an <code>rm</code> on every log file.',
              ['ls', '*.log'], ['rm', '-rf', '*', '.log', 'find'],
              'Same glob, harmless command. The shell expands it identically for both, so what <code>ls</code> prints is exactly what <code>rm</code> would have taken.',
              'Two tokens — the safe command, then the pattern.'),
            Q('<code>rm *.log</code> — who turns <code>*.log</code> into a list of filenames?',
              ['<code>rm</code> does', 'The shell does, before <code>rm</code> ever runs', 'The terminal emulator', 'The filesystem'],
              1,
              'The shell expands globs first, so <code>rm</code> receives a list of real names. It never sees the asterisk — which is why an unmatched glob behaves so oddly.')
          ]
        },
        {
          id: 'tm-16', name: 'Speed run', ico: '🏁',
          steps: [
            L('Five holes, no hints', [
              { p: 'Everything from Chapter 1, mixed and scored. Par on every hole — one keystroke each, except where stated.' },
              { call: { k: 'tip', t: 'If you have to think, that is fine.', p: 'The point is not to score. It is that in about a week these stop being chords you recall and start being things your hands do while you think about something else.' } }
            ]),
            K('Clear the line.',
              'sudo docker compose -f docker-compose.prod.yml up -d --build', null,
              { line: '' }, 1, ['⌃U', '⌃W', '⌃K', '⌫'], '<code>⌃U</code>',
              'Sixty characters, one keystroke.'),
            K('Get to the start of the line.',
              'npm run build --verbose --no-cache', null,
              { line: 'npm run build --verbose --no-cache', cursor: 0 },
              1, ['⌃A', '⌃E', '⌥←', '←'], '<code>⌃A</code>', 'Instant, whatever the length.'),
            K('Delete the last word.',
              'git checkout -b feature/paymnts', null,
              { line: 'git checkout -b ' }, 1, ['⌃W', '⌥⌫', '⌃U', '⌫'], '<code>⌃W</code>',
              'Retype the word rather than backspacing thirty characters to reach it.'),
            K('The cursor is after <code>dev</code>. Cut everything to its right.',
              'npm run dev --port 3000 --host 0.0.0.0', 11,
              { line: 'npm run dev' }, 1, ['⌃K', '⌃U', '⌃W', '⌫'], '<code>⌃K</code>',
              'And <code>⌃Y</code> would paste it straight back if you cut too much.'),
            K('Two letters are the wrong way round. Fix it without deleting anything.',
              'git sattus', 6,
              { line: 'git status' }, 1, ['⌃T', '⌫', '⌃W', '←', '→'], '<code>⌃T</code> — transpose the two characters around the cursor.',
              '<code>⌃T</code> swaps the character before the cursor with the one at it. Made for exactly this typo.')
          ]
        }
      ]
    }
  ]
};
