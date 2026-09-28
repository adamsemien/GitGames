/* ============================================================
   TRACK: Debugging & Reading Errors
   For people building real software with AI who cannot yet read
   what breaks. Every level: an analogy first, one term named and
   explained in a line, real error text, real commands, and checks
   that test recognition ("which line tells you where to look")
   rather than definitions.
   ============================================================ */
const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });

export const debugging = {
  id: 'debugging',
  name: 'Debugging & Reading Errors',
  emoji: '🐞',
  glow: '#ff5c6e',
  time: '~45 min',
  desc: 'The red text is not noise. Read an error in three parts, follow a stack trace, find what changed, shrink the bug, and tell a real fix from one that just hides the symptom.',
  chapters: [
    {
      title: 'Chapter 1 - Read what it says',
      desc: 'An error is a note from the computer. Most of the time it tells you exactly where to look.',
      nodes: [
        {
          id: 'db-01', name: 'What an error actually says', ico: '🧾',
          steps: [
            L('A note on the door', [
              { p: 'A courier leaves a card on your door: <strong>"Parcel not delivered - no one home - left at the depot on Mill Road."</strong> Three parts: what kind of problem, what happened, and where to go next. You would never read just the red "not delivered" and give up.' },
              { p: 'Almost every error message has the same three parts. People panic at the red and skip everything after it - which is where the answer is.' },
              { term: '<span class="h">TypeError</span>: <span class="c">Cannot read properties of undefined (reading \'map\')</span>\n    <span class="o">at ProductList (src/components/ProductList.tsx:14:22)</span>' },
              { ul: [
                '<strong>The type</strong> - <code>TypeError</code>. The category of mistake: here, using a value as the wrong kind of thing.',
                '<strong>The message</strong> - "Cannot read properties of undefined (reading \'map\')". Something was <code>undefined</code>, and the code tried to call <code>.map</code> on it.',
                '<strong>The location</strong> - <code>ProductList.tsx</code>, line 14, column 22. Where it blew up.'
              ] },
              { call: { k: 'tip', t: 'Term - Error type:', p: 'the first word of the error, naming the category. <code>TypeError</code> (wrong kind of value), <code>ReferenceError</code> (a name that does not exist), <code>SyntaxError</code> (the code cannot even be read). It tells you what kind of mistake to look for before you read another word.' } }
            ]),
            L('Where the error text lives', [
              { p: 'A build or dev server prints a lot. The error is usually near the <em>end</em>, and it is often written to a separate stream (stderr) from normal output. Pipe both into <code>tail</code> and you get the part that matters.' },
              { term: '<span class="c">$ npm run build 2>&1 | tail -20</span>\n<span class="o">...</span>\n<span class="h">Type error</span>: Property \'price\' does not exist on type \'Product\'.\n\n  <span class="o">12 |   return items.map(i => i.price)</span>\n<span class="o">Next.js build worker exited with code: 1</span>' }
            ]),
            B('Run the build and show only its last 20 lines, errors included.',
              ['npm', 'run', 'build', '2>&1', '|', 'tail', '-20'],
              ['head', '>', 'dev', '-n', 'grep', '&&'],
              '<code>2>&1</code> sends the error stream into the same pipe as normal output, so <code>tail</code> sees it. Without it, errors can bypass the pipe entirely.',
              'Build, then merge the two output streams, then keep the end.'),
            Q('<code>ReferenceError: stripe is not defined</code> - what kind of mistake is this?',
              ['A value had the wrong type', 'A name was used that does not exist where the code ran - often a missing import', 'The file could not be parsed', 'The network request failed'],
              1,
              'The type does the triage: <code>ReferenceError</code> means the name itself is missing at that point. Check the import first, before touching any logic.'),
            Q('Which part of <code>TypeError: Cannot read properties of undefined (reading \'map\') at ProductList (ProductList.tsx:14:22)</code> tells you where to open the file?',
              ['<code>TypeError</code>', '<code>Cannot read properties of undefined</code>', '<code>(reading \'map\')</code>', '<code>ProductList.tsx:14:22</code>'],
              3,
              'File, line, column. The type tells you what kind of mistake, the message what happened, and the location where to look.')
          ]
        },
        {
          id: 'db-02', name: 'Stack traces', ico: '🥞',
          steps: [
            L('A pile of plates', [
              { p: 'When code calls a function, which calls another, which calls another, each call sits on top of the last like plates in a stack. When something breaks, the computer lists every plate - that list is the stack trace.' },
              { term: '<span class="h">TypeError: Cannot read properties of null (reading \'email\')</span>\n    <span class="c">at formatUser (src/lib/format.ts:8:24)</span>\n    <span class="c">at getProfile (src/lib/profile.ts:21:10)</span>\n    <span class="c">at GET (src/app/api/profile/route.ts:12:18)</span>\n    <span class="o">at node_modules/next/dist/server/route-modules/app-route/module.js:1:1204</span>\n    <span class="o">at process.processTicksAndRejections (node:internal/process/task_queues:95:5)</span>' },
              { call: { k: 'tip', t: 'Term - Stack frame:', p: 'one line of a stack trace - one function call, with the file and line it was on when things broke. The trace is just the frames, in order.' } }
            ]),
            L('Which frame to read first', [
              { p: 'In JavaScript the <strong>top</strong> frame is where it broke and each line below is the caller of the one above. Read it as a story from the bottom up: the framework handled a request, which called your <code>GET</code> route, which called <code>getProfile</code>, which called <code>formatUser</code>, which broke.' },
              { ul: [
                'Skip frames in <code>node_modules</code> and <code>node:internal</code>. That is library and runtime code; the bug is almost never there.',
                'The first frame in <strong>your</strong> code, read from the top, is where it broke. The frames under it show how you got there.',
                'Python prints it the other way up: the last line is where it broke. Same idea, flipped.'
              ] },
              { call: { t: 'Jump straight there:', p: 'Most editors open a file at a line and column. The <code>file:line:column</code> in a frame is made for this.' } }
            ]),
            B('Open the file from the top frame at its exact line and column in VS Code.',
              ['code', '--goto', 'src/lib/format.ts:8:24'],
              ['open', '-g', 'src/lib/profile.ts:21:10', 'cat', '--line'],
              '<code>code --goto file:line:column</code> puts your cursor on the exact character. <code>-g</code> is the short form.',
              'The top frame is where it broke.'),
            Q('A trace lists these frames, top to bottom. Which one is the first in YOUR code - where it broke?',
              ['<code>at process.processTicksAndRejections (node:internal/...)</code>', '<code>at node_modules/next/dist/server/...</code>', '<code>at GET (src/app/api/profile/route.ts:12:18)</code>', '<code>at formatUser (src/lib/format.ts:8:24)</code>'],
              3,
              'The top frame in your own files is where it broke. <code>GET</code> is further down the story - it made the call, but <code>formatUser</code> is where <code>null</code> met <code>.email</code>.'),
            Q('A trace has 30 frames and 27 of them are in <code>node_modules</code>. What does that usually mean?',
              ['The bug is in a library - open an issue', 'Your three frames are the ones to read; the library was just carrying your bad value', 'The trace is useless', 'Reinstall node_modules'],
              1,
              'Libraries fail loudly on bad input you gave them. Find your frames and ask what you passed in.')
          ]
        },
        {
          id: 'db-03', name: '"It worked yesterday"', ico: '📅',
          steps: [
            L('Something changed', [
              { p: 'Your car started fine yesterday and not today. A mechanic\'s first question is not "what is wrong with engines" - it is "what did you do since yesterday?" New fuel? Left the lights on?' },
              { p: 'Code is the same. If it worked and now it does not, <strong>something changed</strong>: your code, a package, an environment variable, the data, or a service you call. Finding the change is usually faster than understanding the bug.' },
              { call: { k: 'tip', t: 'Term - Regression:', p: 'something that used to work and now does not. The word matters because it points you at a change, not at the whole codebase.' } }
            ]),
            L('Git remembers what you forgot', [
              { term: '<span class="c">$ git log --oneline --since=yesterday</span>\n<span class="o">9f2c1ab</span> Let Claude refactor checkout\n<span class="o">41d07e3</span> Bump next to 15.1\n\n<span class="c">$ git diff 41d07e3~1 --stat</span>\n<span class="o"> package-lock.json        | 212 ++++----</span>\n<span class="o"> src/app/checkout/page.tsx |  48 +-</span>' },
              { ul: [
                'Code changes - <code>git log</code> and <code>git diff</code>.',
                'Package changes - a changed <code>package-lock.json</code> means different library versions.',
                'Things Git cannot see - environment variables, database data, a third-party API. Check your hosting dashboard and the service\'s status page.'
              ] }
            ]),
            B('List every commit since yesterday, one line each.',
              ['git', 'log', '--oneline', '--since=yesterday'],
              ['--all', 'diff', '--until=today', 'status', '-1'],
              'Short hashes and messages since yesterday. Two commits is two suspects - much better than a whole codebase.',
              'Log, short form, then a time filter.'),
            Q('The app broke overnight. <code>git log</code> shows no commits since yesterday. Where do you look next?',
              ['Nowhere - it must be a hardware fault', 'What Git cannot see: env vars, the database, a service you call, a dependency that updated on deploy', 'Rewrite the feature', 'Delete node_modules'],
              1,
              'No code change means the change is somewhere else. An expired key, a changed API, or an unpinned dependency all break "untouched" code.')
          ]
        },
        {
          id: 'db-04', name: 'Console, terminal or network tab', ico: '🔭',
          steps: [
            L('Three windows onto one app', [
              { p: 'A web app is a restaurant: the dining room (the browser), the kitchen (the server), and the waiter carrying orders between them (the network). A complaint about cold food could start in any of the three - and each has its own place where problems get written down.' },
              { ul: [
                '<strong>Browser console</strong> - errors in code running on the page. Buttons that do nothing, a blank component, <code>Hydration failed</code>.',
                '<strong>Terminal</strong> (or your host\'s logs) - errors in server code. API routes, database calls, server components. These never appear in the browser.',
                '<strong>Network tab</strong> - every request the page made, its status code, and the response body. Where "the data did not load" gets explained.'
              ] },
              { call: { k: 'tip', t: 'Term - DevTools:', p: 'the developer panel built into every browser (right-click, Inspect). The Console and Network tabs live there.' } }
            ]),
            L('The classic confusion', [
              { p: 'The page shows "Something went wrong". The browser console says only:' },
              { term: '<span class="h">GET https://myapp.com/api/orders 500 (Internal Server Error)</span>' },
              { p: 'That is the waiter reporting that the kitchen failed. The <em>reason</em> is in the kitchen - your terminal or server logs:' },
              { term: '<span class="h">PrismaClientKnownRequestError</span>: Invalid `prisma.order.findMany()` invocation:\nThe column `orders.shipped_at` does not exist in the current database.' },
              { p: 'To test the request on its own, outside the browser, use <code>curl</code>. <code>-i</code> shows the status line and headers along with the body.' }
            ]),
            B('Call the orders API directly and show the status line and headers too.',
              ['curl', '-i', 'https://myapp.com/api/orders'],
              ['-s', 'wget', '-X', 'GET', '-o'],
              'You see <code>HTTP/2 500</code> and the body, without the browser in the way. If curl works and the page does not, the problem is in the browser.',
              'The flag that includes the response headers.'),
            Q('A form submits and nothing happens - no error on the page. Where do you look first?',
              ['The terminal', 'The Network tab - did a request even go out, and what status came back?', 'package.json', 'The git log'],
              1,
              'Network answers "did it send, and what came back" in one look. No request means a browser-side problem; a 4xx or 5xx points you at the server.'),
            Q('The browser console shows <code>500 (Internal Server Error)</code> for <code>/api/orders</code>. Which line tells you WHY?',
              ['The 500 line in the browser console', 'The error printed in your server terminal or host logs at that moment', 'The page title', 'The Network tab\'s request headers'],
              1,
              'A 500 only says the server failed. The server wrote the reason down in its own logs, and the browser never sees it.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 - Find the real bug',
      desc: 'Where it broke is not always where it went wrong.',
      nodes: [
        {
          id: 'db-05', name: 'The error is not where the bug is', ico: '🧵',
          steps: [
            L('The smoke and the fire', [
              { p: 'The smoke alarm is in the hallway. The fire is in the kitchen. Taking the alarm off the ceiling stops the noise and leaves the fire burning.' },
              { p: 'An error fires where a bad value finally gets <em>used</em>. The bug is usually where that value was <em>made</em> - one step back, sometimes more.' },
              { term: '<span class="h">TypeError: Cannot read properties of undefined (reading \'name\')</span>\n    <span class="c">at OrderRow (src/components/OrderRow.tsx:9:31)</span>\n\n<span class="o">// OrderRow.tsx line 9</span>\n<span class="o">&lt;td&gt;{order.customer.name}&lt;/td&gt;</span>' },
              { p: 'Line 9 is fine. The real question is: why is <code>order.customer</code> undefined? Maybe the database query never included the customer. That is the bug, in a different file.' },
              { call: { k: 'tip', t: 'Term - Root cause:', p: 'the first thing that went wrong, as opposed to the place it finally broke. Fixing the root cause stops the error; fixing the symptom moves it somewhere else.' } }
            ]),
            L('Trace it back', [
              { ul: [
                'Name the bad value: <code>order.customer</code> is undefined.',
                'Find where that value comes from: search for where orders are loaded.',
                'Check it at the source: log it right after it is created. If it is already wrong there, go one more step back.'
              ] },
              { term: '<span class="c">$ grep -rn "findMany" src/</span>\n<span class="o">src/lib/orders.ts:6:  return prisma.order.findMany({ where: { userId } })</span>' },
              { p: 'No <code>include: { customer: true }</code>. The query never asked for the customer. Root cause found, one file back.' }
            ]),
            B('Search every file under src/ for where orders are fetched, with line numbers.',
              ['grep', '-rn', '"findMany"', 'src/'],
              ['-i', 'find', '-l', 'node_modules/', '"customer"'],
              '<code>-r</code> searches the folder recursively, <code>-n</code> prints line numbers. Search for where the value is made, not where it crashed.',
              'Recursive, with line numbers, for the query call.'),
            Q('<code>Cannot read properties of undefined (reading \'total\')</code> at <code>Cart.tsx:22</code>, the line <code>cart.summary.total</code>. What is the most useful next question?',
              ['What is wrong with line 22?', 'Where does <code>cart.summary</code> get set - and why is it undefined there?', 'Should I add <code>?.</code> to line 22?', 'Is React broken?'],
              1,
              'Line 22 is where the smoke is. Ask where the value was supposed to come from and follow it back to the source.')
          ]
        },
        {
          id: 'db-06', name: 'Reproduce before you fix', ico: '🧪',
          steps: [
            L('The rattle that stops at the garage', [
              { p: 'You take your car in for a rattle. At the garage it stops rattling. The mechanic cannot fix what they cannot hear - so they drive with you until it happens again, then keep changing one thing until they know exactly when it rattles.' },
              { p: 'A bug you cannot trigger on demand is a bug you cannot prove you fixed. Before you change a line, get it to break <strong>every time</strong>, and then make that case as small as you can.' },
              { call: { k: 'tip', t: 'Term - Minimal reproduction:', p: 'the smallest input and fewest steps that still show the bug. Every extra step you strip away is one less thing that could be the cause.' } }
            ]),
            L('Shrink it', [
              { ul: [
                'Write down the exact steps and the exact error. "Checkout breaks" is not a reproduction; "empty cart, click Pay, <code>TypeError</code> at <code>checkout.ts:31</code>" is.',
                'Remove things until it stops breaking. The last thing you removed is involved.',
                'Turn it into a test. A failing test is a reproduction that runs itself, forever.'
              ] },
              { term: '<span class="c">$ npx vitest run src/lib/cart.test.ts</span>\n<span class="h"> FAIL </span> src/lib/cart.test.ts > total of an empty cart\n<span class="h">TypeError</span>: Reduce of empty array with no initial value' }
            ]),
            B('Run just the one test file that reproduces the bug.',
              ['npx', 'vitest', 'run', 'src/lib/cart.test.ts'],
              ['watch', 'npm', 'test', '--all', 'src/'],
              'One file runs in seconds, so you can try a fix and see the result instantly. <code>run</code> exits after one pass instead of watching.',
              'The test runner, a single pass, one file.'),
            Q('Which of these is a usable bug reproduction?',
              ['"Checkout is flaky"', '"Sometimes the total looks wrong"', '"Empty cart, click Pay: TypeError Reduce of empty array at cart.ts:14, every time"', '"Users are complaining"'],
              2,
              'Exact steps, exact error, and "every time". You can run it, watch it fail, and watch it pass after the fix.')
          ]
        },
        {
          id: 'db-07', name: 'Reading the AI\'s fix', ico: '🩹',
          steps: [
            L('Tape over the warning light', [
              { p: 'The engine warning light is on. One mechanic finds the loose sensor. Another puts tape over the light. Both hand you the keys and say "fixed".' },
              { p: 'An AI asked to "make the error go away" will sometimes do the tape version. The error stops showing up; the thing that caused it is still there.' },
              { term: '<span class="o">// before</span>\nconst total = cart.items.reduce((sum, i) => sum + i.price)\n\n<span class="o">// the "fix"</span>\n<span class="h">try {</span>\n  const total = cart.items.reduce((sum, i) => sum + i.price)\n<span class="h">} catch (e) {}</span>' },
              { call: { k: 'tip', t: 'Term - Swallowed error:', p: 'an error that is caught and then ignored - an empty <code>catch</code>, a <code>?.</code> scattered everywhere, a default of <code>0</code>. Nothing crashes, and nothing tells you it is still wrong.' } }
            ]),
            L('Real fix or tape?', [
              { ul: [
                '<strong>Real:</strong> changes where the bad value is made. Here: <code>reduce((sum, i) => sum + i.price, 0)</code> - an empty cart now correctly totals zero.',
                '<strong>Tape:</strong> an empty <code>catch</code>, <code>// @ts-ignore</code>, <code>as any</code>, a <code>?.</code> added right on the crashing line, a test deleted or skipped.',
                'Ask one question: <em>would the original reproduction now give the right answer, or just no error?</em>'
              ] },
              { call: { k: 'warn', t: 'Read the diff, not the summary.', p: 'The AI\'s message says what it meant to do. The diff says what it did. Search the diff for the tape patterns before you accept.' } }
            ]),
            B('Show the AI\'s changes against main and pick out every line mentioning catch.',
              ['git', 'diff', 'main', '|', 'grep', '-n', 'catch'],
              ['log', '--stat', 'try', '-v', '&&'],
              'A new <code>catch</code> in a bug-fix diff deserves a hard look. Run the same search for <code>ts-ignore</code>, <code>as any</code> and <code>.skip</code>.',
              'The diff, piped into a search.'),
            Q('The AI\'s fix for <code>Cannot read properties of undefined (reading \'map\')</code> is <code>products?.map(...)</code> on the crashing line. What happens now?',
              ['The bug is fixed', 'The crash stops, and the list silently shows nothing - the reason products is undefined is untouched', 'The page will crash harder', 'TypeScript will fail the build'],
              1,
              'Optional chaining turns a loud failure into a quiet empty screen. Sometimes that is the right behaviour, but only after you know why the value was missing.'),
            Q('Which of these diffs is most likely a real fix?',
              ['Wrapping the call in <code>try { } catch {}</code>', 'Adding <code>// @ts-ignore</code> above the error', 'Adding the missing <code>include: { customer: true }</code> to the query that loads orders', 'Marking the failing test <code>.skip</code>'],
              2,
              'It changes where the bad value is made. The other three all make the message disappear and leave the cause in place.')
          ]
        },
        {
          id: 'db-08', name: 'Logging that helps', ico: '🔦',
          steps: [
            L('Breadcrumbs, not confetti', [
              { p: 'Hansel and Gretel dropped breadcrumbs so they could find the way back - one at each turn, not a bag emptied on the doorstep. A good log is one crumb at each decision point, saying what the code saw.' },
              { term: '<span class="o">// confetti</span>\nconsole.log(\'here\')\nconsole.log(\'here 2\')\nconsole.log(data)\n\n<span class="o">// breadcrumbs</span>\nconsole.log(\'[checkout] cart loaded\', { userId, items: cart.items.length })\nconsole.error(\'[checkout] payment failed\', { userId, status: res.status })' },
              { ul: [
                '<strong>Label it</strong> - which part of the app, and what moment.',
                '<strong>Print the values that decide what happens next</strong> - an ID, a count, a status code. Not a whole 5,000-line object.',
                '<strong>Log at the edges</strong> - right before a request goes out and right after the response comes back.',
                '<strong>Never log secrets</strong> - no tokens, passwords, keys or full card numbers.'
              ] },
              { call: { k: 'tip', t: 'Term - Log level:', p: 'how serious a log line is - usually debug, info, warn, error. <code>console.error</code> and <code>console.warn</code> can be filtered out from the noise, and most hosts colour or count them separately.' } }
            ]),
            L('Watch it happen', [
              { p: 'Logs are most useful live, while you click through the reproduction. Follow the file and keep only the serious lines:' },
              { term: '<span class="c">$ tail -f logs/app.log | grep ERROR</span>\n<span class="o">2026-09-28T10:14:03Z</span> ERROR [checkout] payment failed {"userId":"u_81","status":402}' }
            ]),
            B('Follow the app log live and show only lines containing ERROR.',
              ['tail', '-f', 'logs/app.log', '|', 'grep', 'ERROR'],
              ['cat', '-n', 'head', 'WARN', '-v'],
              '<code>tail -f</code> keeps printing new lines as they are written. Add the filter and you only see what matters while you reproduce the bug.',
              'Follow the file, then filter it.'),
            Q('Which log line will help you most at 2am?',
              ['<code>console.log(\'here\')</code>', '<code>console.log(user)</code> with the whole user object and their session token', '<code>console.error(\'[billing] charge failed\', { userId, status: 402 })</code>', '<code>console.log(\'it broke\')</code>'],
              2,
              'Labelled, a level you can filter on, and exactly the values that explain what happened. The second one also leaks a secret into your logs.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 - Breakages and what to do next',
      desc: 'The usual suspects, halving the problem, and when to walk away.',
      nodes: [
        {
          id: 'db-09', name: 'Common vibe-coder breakages', ico: '🧯',
          steps: [
            L('The usual suspects', [
              { p: 'A plumber knows most calls are the same five problems. Most errors in AI-built apps are too. Learn their faces and you can read them in a second.' },
              { ul: [
                '<code>undefined</code> - the value was never set. A missing field, a typo in a property name, data that has not loaded yet.',
                '<code>null</code> - the value was set to "nothing" on purpose. A database row that does not exist, a user who is not logged in.',
                '<strong>Missing env var</strong> - <code>process.env.STRIPE_SECRET_KEY</code> is <code>undefined</code> in production because it was only in your local <code>.env</code>. Works locally, breaks on deploy.',
                '<strong>401 Unauthorized</strong> - "I do not know who you are." Missing or expired login or API key.',
                '<strong>403 Forbidden</strong> - "I know who you are, and you are not allowed." Wrong role, wrong account, wrong scope.'
              ] }
            ]),
            L('CORS', [
              { p: 'A bouncer checks a guest list. Your browser is the bouncer: when your page asks another site for data, the browser only hands the answer to your page if that site says your page is on its list.' },
              { term: '<span class="h">Access to fetch at \'https://api.example.com/data\' from origin \'https://myapp.com\'\nhas been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header is\npresent on the requested resource.</span>' },
              { p: 'The fix is on the <strong>server</strong> you are calling (or call it from your own server instead). Changing your front-end code or installing a "CORS unblock" browser extension does not fix it for your users.' },
              { call: { k: 'tip', t: 'Term - CORS:', p: 'Cross-Origin Resource Sharing - the browser rule that stops a page reading responses from a different domain unless that domain allows it. It only exists in browsers, which is why the same request works in <code>curl</code>.' } },
              { call: { t: 'Checking an env var safely:', p: 'Never <code>echo</code> a secret to see if it is there - it lands in your scrollback and shell history. Test that it is set without printing it.' } }
            ]),
            B('Check that STRIPE_SECRET_KEY is set without printing its value.',
              ['test', '-n', '"$STRIPE_SECRET_KEY"', '&&', 'echo', 'set'],
              ['echo', '"$STRIPE_SECRET_KEY"', '-z', '||', 'printenv'],
              '<code>test -n</code> is true when the variable is not empty, so you see <code>set</code> or nothing - never the key itself.',
              'Test for "not empty", and only print a word if it passes.'),
            Q('Logged-in user, correct token, and the API returns <code>403</code>. What is it telling you?',
              ['You are not logged in', 'It knows who you are, and this account is not allowed to do this', 'The server crashed', 'The URL is wrong'],
              1,
              '401 is "who are you?", 403 is "not you". A 403 with a valid token points at roles, permissions or the wrong account - not at login.'),
            Q('Which line of this error tells you the fix belongs on the other server?',
              ['<code>Access to fetch at \'https://api.example.com/data\'</code>', '<code>from origin \'https://myapp.com\'</code>', '<code>No \'Access-Control-Allow-Origin\' header is present on the requested resource</code>', '<code>has been blocked</code>'],
              2,
              'The missing header is one the other server has to send. Nothing in your page can add it to their response.'),
            Q('Works on your laptop, crashes on Vercel with <code>Cannot read properties of undefined (reading \'split\')</code> on <code>process.env.ALLOWED_ORIGINS.split(\',\')</code>. Most likely cause?',
              ['Vercel is broken', 'The env var was set in your local .env but never added to the Vercel project', 'A typo in split', 'Node is the wrong version'],
              1,
              '"Works locally, breaks on deploy" plus <code>process.env</code> on the crashing line is the missing env var pattern nearly every time.')
          ]
        },
        {
          id: 'db-10', name: 'Binary search on a bug', ico: '✂️',
          steps: [
            L('Guess the number', [
              { p: '"I am thinking of a number between 1 and 1,000." Guess 1, then 2, then 3, and you could be there all day. Guess 500 - "lower" - then 250, then 125, and you have it in about ten tries.' },
              { p: 'Bugs hide in piles too: 40 commits, 300 lines, 12 steps in a form. Instead of checking one at a time, cut the pile in half and ask "is the bug in this half?"' },
              { call: { k: 'tip', t: 'Term - Divide and conquer:', p: 'halving the search space with each check, until only one suspect is left. Ten checks cover a thousand suspects.' } }
            ]),
            L('Halving, three ways', [
              { ul: [
                '<strong>In code:</strong> comment out half of the suspect function. Still broken? The bug is in the half you kept.',
                '<strong>In data:</strong> the import fails on a 10,000-row CSV. Try the first 5,000. Keep halving until one row is left.',
                '<strong>In history:</strong> Git does the halving for you. Mark a good commit and a bad one, and it checks out the middle each time.'
              ] },
              { term: '<span class="c">$ git bisect start</span>\n<span class="c">$ git bisect bad</span>                 <span class="o"># now is broken</span>\n<span class="c">$ git bisect good v1.4.0</span>         <span class="o"># this release worked</span>\n<span class="o">Bisecting: 20 revisions left to test after this (roughly 4 steps)</span>' }
            ]),
            B('Let Git halve the history automatically, running your tests at each step.',
              ['git', 'bisect', 'run', 'npm', 'test'],
              ['start', 'good', 'bad', 'log', 'reset'],
              'Git checks out the midpoint, runs the command, reads pass or fail from the exit code, and repeats until it names the first bad commit. Run <code>git bisect reset</code> afterwards.',
              'Bisect, then the command it should run at every step.'),
            Q('The last good commit was 64 commits ago. About how many checks does halving need to find the bad one?',
              ['64', '32', 'About 6', '1'],
              2,
              '64, 32, 16, 8, 4, 2, 1 - six halvings. Checking one commit at a time could take all 64.'),
            Q('<code>Bisecting: 20 revisions left to test after this (roughly 4 steps)</code> - which part tells you how long this will take?',
              ['<code>Bisecting</code>', '<code>20 revisions left</code>', '<code>roughly 4 steps</code>', '<code>after this</code>'],
              2,
              'The number of checks you still have to do. The 20 is the pile; the 4 is how many halvings it takes.')
          ]
        },
        {
          id: 'db-11', name: 'Revert instead of fix', ico: '⏪',
          steps: [
            L('Back up the car', [
              { p: 'You took a wrong turn and the road keeps getting worse. You can keep driving and hope it comes out somewhere - or reverse to the junction you know, and think there.' },
              { p: 'When something broke right after a change and people are affected, the fastest safe move is usually to <strong>undo the change</strong>, then debug calmly. Fixing forward under pressure is how one bug becomes three.' },
              { call: { k: 'tip', t: 'Term - Last known good:', p: 'the most recent version you know worked. It is where you go back to so the app works while you find the real bug.' } }
            ]),
            L('When to revert', [
              { ul: [
                '<strong>Revert</strong> - users are affected, the breaking change is known, and the fix is not obvious in the next few minutes.',
                '<strong>Fix forward</strong> - the fix is one small, clear line and you can test it right now. Or the change cannot be undone, like a database migration that already dropped a column.',
                'Reverting is not giving up. The change is still in history; you bring it back once it is fixed.'
              ] },
              { term: '<span class="c">$ git revert HEAD</span>\n<span class="o">[main 7c1e0d2] Revert "Let Claude refactor checkout"</span>\n<span class="o"> 1 file changed, 12 insertions(+), 48 deletions(-)</span>' },
              { call: { k: 'warn', t: 'Revert, not reset:', p: '<code>git revert</code> adds a new commit that undoes the old one - safe on a shared branch. <code>git reset --hard</code> rewrites history and should not be used on anything already pushed.' } }
            ]),
            B('Undo the most recent commit by adding a new commit that reverses it.',
              ['git', 'revert', 'HEAD'],
              ['reset', '--hard', 'HEAD~1', 'checkout', 'restore'],
              'History stays intact and the bad change is undone. Push it, and the app is back to last known good while you debug.',
              'The safe undo, pointed at the latest commit.'),
            Q('Checkout is broken in production after this morning\'s deploy. Customers are failing to pay. You have a theory but no fix yet.',
              ['Keep debugging in production', 'Revert the deploy now, then debug on a branch', 'Wait and see if it fixes itself', 'Tell users to try again later'],
              1,
              'Every minute of fixing forward costs real payments. Get back to last known good, then take your time.'),
            Q('When is fixing forward the better call than reverting?',
              ['Whenever you are confident', 'When the change cannot be undone - like a migration that already dropped a column - or the fix is one tested line', 'Never', 'When it is late at night'],
              1,
              'Reverting code does not bring back deleted data. For one-way changes, and for trivial tested fixes, going forward is the safer move.')
          ]
        },
        {
          id: 'db-12', name: 'The bug report for future you', ico: '📝',
          steps: [
            L('A note to the next shift', [
              { p: 'A nurse ending a shift does not say "patient in bed 4 is a bit off." They write what they saw, what they did, what changed, and what to watch for - so the next nurse can pick it up cold.' },
              { p: 'Future you is the next shift. In a week you will not remember which page, which account or which error. An AI agent picking up the bug remembers even less.' },
              { call: { k: 'tip', t: 'Term - Bug report:', p: 'a written record of a bug that someone who was not there can use: the steps to reproduce, what you expected, what actually happened, the exact error, and the versions involved.' } }
            ]),
            L('The template', [
              { term: '<span class="h">Title:</span> Empty cart crashes checkout (TypeError in cart.ts:14)\n\n<span class="h">Steps:</span>    1. Log in as a new user  2. Open /checkout with an empty cart\n<span class="h">Expected:</span> "Your cart is empty" message\n<span class="h">Actual:</span>   500 error page\n<span class="h">Error:</span>    TypeError: Reduce of empty array with no initial value\n          at cartTotal (src/lib/cart.ts:14:28)\n<span class="h">Versions:</span> node v22.11.0, next@15.1.0, commit 9f2c1ab\n<span class="h">Tried:</span>    reverted 9f2c1ab - bug goes away' },
              { p: '<strong>Expected vs actual</strong> is the line people skip and the one that matters most: without it, nobody knows what "fixed" looks like.' }
            ]),
            B('Print your Node version and the installed version of next, for the report.',
              ['node', '--version', '&&', 'npm', 'ls', 'next'],
              ['-v', 'list', 'install', '||', 'npx'],
              'Versions turn "works on my machine" into something you can compare. <code>npm ls</code> shows what is actually installed, not what <code>package.json</code> asks for.',
              'Runtime version first, then the installed package.'),
            Q('Which line of a bug report tells the next person what "fixed" should look like?',
              ['The title', '<strong>Expected:</strong> "Your cart is empty" message', 'The versions', 'The commit hash'],
              1,
              'Expected vs actual is the definition of done. Without it a fix can make the error go away and still be wrong.'),
            Q('You are handing a bug to an AI agent. Which report gets the best fix?',
              ['"Checkout is broken, please fix"', 'Your theory of what is wrong', 'Exact steps, the full error with file and line, expected vs actual, and what you already tried', 'A screenshot of the whole page'],
              2,
              'The agent only knows what you give it. Evidence beats theory, and "what I already tried" stops it repeating your dead ends.')
          ]
        }
      ]
    }
  ]
};
