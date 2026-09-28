/* ============================================================
   TRACK: Debugging & Reading Errors
   For people building real software with AI who cannot yet read
   what breaks. Plain English, no extended analogies. Every level:
     1. "You'll learn" - the one skill, stated up front
     2. the idea explained simply, with real error text
     3. how to do it (steps and the command)
     4. a Build with a real command, then quizzes that test
        recognition ("which line tells you where to look")
   ============================================================ */
const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });
const LEARN = (p) => ({ call: { k: 'tip', t: 'You\'ll learn:', p } });

export const debugging = {
  id: 'debugging',
  name: 'Debugging & Reading Errors',
  emoji: '🐞',
  glow: '#ff5c6e',
  time: '~40 min',
  desc: 'How to read an error message, find where the bug really is, tell a real AI fix from a fake one, and write it up so you can fix it later. One clear skill per level.',
  chapters: [
    {
      title: 'Chapter 1 - Read the error',
      desc: 'An error message usually tells you what went wrong and where. Learn to read it.',
      nodes: [
        {
          id: 'db-01', name: 'What an error actually says', ico: '🧾',
          steps: [
            L('The three parts of an error', [
              LEARN('how to read any error message by splitting it into three parts.'),
              { p: 'Most error messages have the same three parts:' },
              { term: '<span class="h">TypeError</span>: <span class="c">Cannot read properties of undefined (reading \'map\')</span>\n    <span class="o">at ProductList (src/components/ProductList.tsx:14:22)</span>' },
              { ul: [
                '<strong>Type</strong> - <code>TypeError</code>. What kind of mistake it is.',
                '<strong>Message</strong> - "Cannot read properties of undefined (reading \'map\')". What happened: something was <code>undefined</code> and the code tried to use <code>.map</code> on it.',
                '<strong>Location</strong> - <code>ProductList.tsx:14:22</code>. The file, line 14, character 22.'
              ] },
              { p: 'The common error types: <code>TypeError</code> - a value is the wrong kind of thing (often <code>undefined</code>). <code>ReferenceError</code> - a name doesn\'t exist (often a missing import). <code>SyntaxError</code> - the code is written wrong and can\'t run at all.' }
            ]),
            L('Where to find it', [
              { p: 'When a build fails, the error is usually near the <strong>end</strong> of the output. This command runs the build and shows just the last 20 lines:' },
              { term: '<span class="c">$ npm run build 2>&1 | tail -20</span>' },
              { p: '<code>2>&1</code> makes sure error text is included. <code>| tail -20</code> keeps only the last 20 lines.' }
            ]),
            B('Run the build and show only the last 20 lines, including errors.',
              ['npm', 'run', 'build', '2>&1', '|', 'tail', '-20'],
              ['head', '>', 'dev', '-n', 'grep', '&&'],
              '<code>2>&1</code> includes the error output, and <code>tail -20</code> shows the last 20 lines - where the error usually is.',
              'Build, include errors, keep the end.'),
            Q('<code>ReferenceError: stripe is not defined</code> - what\'s the most likely problem?',
              ['A value is the wrong type', 'The name <code>stripe</code> doesn\'t exist there - probably a missing import', 'The code has a typo that stops it running', 'The internet is down'],
              1,
              '<code>ReferenceError</code> means the name doesn\'t exist at that point. Check the import first.'),
            Q('Which part of this error tells you which file and line to open? <code>TypeError: Cannot read properties of undefined (reading \'map\') at ProductList (ProductList.tsx:14:22)</code>',
              ['<code>TypeError</code>', '<code>Cannot read properties of undefined</code>', '<code>(reading \'map\')</code>', '<code>ProductList.tsx:14:22</code>'],
              3,
              'The location: file <code>ProductList.tsx</code>, line 14, character 22.')
          ]
        },
        {
          id: 'db-02', name: 'Stack traces', ico: '🥞',
          steps: [
            L('What a stack trace is', [
              LEARN('which line of a stack trace to read first.'),
              { p: 'A stack trace is the list of function calls that led to an error. Each line is one call, called a <strong>stack frame</strong>, with its file and line number.' },
              { term: '<span class="h">TypeError: Cannot read properties of null (reading \'email\')</span>\n    <span class="c">at formatUser (src/lib/format.ts:8:24)</span>\n    <span class="c">at getProfile (src/lib/profile.ts:21:10)</span>\n    <span class="c">at GET (src/app/api/profile/route.ts:12:18)</span>\n    <span class="o">at node_modules/next/dist/server/.../module.js:1:1204</span>\n    <span class="o">at process.processTicksAndRejections (node:internal/...)</span>' }
            ]),
            L('How to read it', [
              { ul: [
                '<strong>The top line</strong> is where it broke. Here: <code>formatUser</code> in <code>format.ts</code>, line 8.',
                '<strong>Each line below</strong> is what called the line above it. <code>GET</code> called <code>getProfile</code>, which called <code>formatUser</code>.',
                '<strong>Skip</strong> lines in <code>node_modules</code> or <code>node:internal</code>. That\'s library code - the bug is almost always in your own files.'
              ] },
              { p: 'So: find the first line that points at <strong>your</strong> code, and open that file at that line. (Python traces are the other way up - the last line is where it broke.)' },
              { term: '<span class="c">$ code --goto src/lib/format.ts:8:24</span>   <span class="o"># opens VS Code at that exact spot</span>' }
            ]),
            B('Open the file from the top line of the trace, at its exact line and character, in VS Code.',
              ['code', '--goto', 'src/lib/format.ts:8:24'],
              ['open', '-g', 'src/lib/profile.ts:21:10', 'cat', '--line'],
              '<code>code --goto file:line:character</code> opens the file with your cursor right on the problem.',
              'Use the top line of the trace.'),
            Q('These are the lines from the trace in this level. Which one shows where it broke in YOUR code?',
              ['<code>at process.processTicksAndRejections (node:internal/...)</code>', '<code>at node_modules/next/dist/server/...</code>', '<code>at GET (src/app/api/profile/route.ts:12:18)</code>', '<code>at formatUser (src/lib/format.ts:8:24)</code>'],
              3,
              'It\'s the top line that points at your own files. <code>GET</code> is further down - it started the chain, but <code>formatUser</code> is where it broke.'),
            Q('A trace has 30 lines and 27 are in <code>node_modules</code>. What should you do?',
              ['Report a bug to the library', 'Read the 3 lines in your own code - the library just received a bad value from you', 'Ignore the trace', 'Reinstall node_modules'],
              1,
              'Libraries usually break because of what you passed them. Your own lines show what that was.')
          ]
        },
        {
          id: 'db-03', name: '"It worked yesterday"', ico: '📅',
          steps: [
            L('Find what changed', [
              LEARN('how to find what changed when something that used to work breaks.'),
              { p: 'When something that used to work stops working, it\'s called a <strong>regression</strong>. Something changed. Finding that change is usually faster than debugging from scratch.' },
              { p: 'Things that can change:' },
              { ul: [
                'Your code - check with Git.',
                'Your packages - a changed <code>package-lock.json</code> means new library versions.',
                'Things Git doesn\'t track - environment variables, the database, or an outside service (check its status page).'
              ] }
            ]),
            L('Use Git to see recent changes', [
              { term: '<span class="c">$ git log --oneline --since=yesterday</span>\n<span class="o">9f2c1ab</span> Let Claude refactor checkout\n<span class="o">41d07e3</span> Bump next to 15.1' },
              { p: 'Two commits since yesterday - those are your two suspects. Look at what each one changed with <code>git show</code> or <code>git diff</code>.' }
            ]),
            B('List every commit since yesterday, one line each.',
              ['git', 'log', '--oneline', '--since=yesterday'],
              ['--all', 'diff', '--until=today', 'status', '-1'],
              'This lists recent commits in short form - your list of suspects.',
              'Log, short form, since yesterday.'),
            Q('The app broke overnight, but <code>git log</code> shows no new commits. Where do you look next?',
              ['It must be a hardware problem', 'Things Git doesn\'t track: environment variables, the database, an outside service, or a package that updated on deploy', 'Rewrite the feature', 'Delete node_modules'],
              1,
              'If the code didn\'t change, something else did. An expired API key or a changed outside service can break code nobody touched.')
          ]
        },
        {
          id: 'db-04', name: 'Console, terminal or network tab', ico: '🔭',
          steps: [
            L('Three places errors show up', [
              LEARN('which of three places to look in, depending on what broke.'),
              { p: 'A web app has code running in the browser, code running on the server, and requests going between them. Each one reports errors in a different place:' },
              { ul: [
                '<strong>Browser console</strong> - errors from code running on the page. Example: a button does nothing, or part of the page is blank.',
                '<strong>Terminal</strong> (or your host\'s logs) - errors from server code: API routes, database calls. These never show up in the browser.',
                '<strong>Network tab</strong> - every request the page made, its status code, and the response. Use it when data doesn\'t load.'
              ] },
              { p: 'The console and network tab are in <strong>DevTools</strong>: right-click the page and choose Inspect.' }
            ]),
            L('A common example', [
              { p: 'The browser console shows:' },
              { term: '<span class="h">GET https://myapp.com/api/orders 500 (Internal Server Error)</span>' },
              { p: 'That only says the server failed. The actual reason is in your <strong>terminal</strong>:' },
              { term: '<span class="h">PrismaClientKnownRequestError</span>: The column `orders.shipped_at` does not exist in the current database.' },
              { p: 'To test an API without the browser, use <code>curl -i</code>. It shows the status code and the response.' }
            ]),
            B('Call the orders API directly and include the status code and headers.',
              ['curl', '-i', 'https://myapp.com/api/orders'],
              ['-s', 'wget', '-X', 'GET', '-o'],
              '<code>-i</code> includes the status line (like <code>HTTP/2 500</code>) and headers. If curl works but the page doesn\'t, the problem is in the browser.',
              'The flag that includes headers.'),
            Q('You submit a form and nothing happens - no error on the page. Where do you look first?',
              ['The terminal', 'The Network tab - did a request go out, and what status came back?', 'package.json', 'Git log'],
              1,
              'The Network tab shows if the request was sent and what came back. No request means a browser problem; an error status points to the server.'),
            Q('The browser console shows <code>500 (Internal Server Error)</code>. Where is the real reason?',
              ['The same 500 line in the browser console', 'The error printed in your server terminal or host logs', 'The page title', 'The request headers'],
              1,
              'A 500 just means the server failed. The server writes the actual reason in its own logs.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 - Find the real bug',
      desc: 'Where the error shows up isn\'t always where the bug is.',
      nodes: [
        {
          id: 'db-05', name: 'The error is not where the bug is', ico: '🧵',
          steps: [
            L('Where it broke vs where it went wrong', [
              LEARN('how to trace an error back to its real cause.'),
              { p: 'An error appears where a bad value is <em>used</em>. But the bug is usually where that value was <em>created</em> - often in a different file.' },
              { term: '<span class="h">TypeError: Cannot read properties of undefined (reading \'name\')</span>\n    <span class="c">at OrderRow (src/components/OrderRow.tsx:9:31)</span>\n\n<span class="o">// line 9</span>\n<span class="o">&lt;td&gt;{order.customer.name}&lt;/td&gt;</span>' },
              { p: 'Line 9 is fine. The real question is: why is <code>order.customer</code> undefined? That first thing that went wrong is the <strong>root cause</strong>.' }
            ]),
            L('How to trace it back', [
              { ul: [
                '1. Name the bad value: <code>order.customer</code> is undefined.',
                '2. Find where that value comes from - search for where orders are loaded.',
                '3. Check it there. If it\'s already wrong, go back one more step.'
              ] },
              { term: '<span class="c">$ grep -rn "findMany" src/</span>\n<span class="o">src/lib/orders.ts:6:  return prisma.order.findMany({ where: { userId } })</span>' },
              { p: 'The query never asks for the customer (it\'s missing <code>include: { customer: true }</code>). That\'s the root cause - one file back.' }
            ]),
            B('Search all files in src/ for where orders are loaded, with line numbers.',
              ['grep', '-rn', '"findMany"', 'src/'],
              ['-i', 'find', '-l', 'node_modules/', '"customer"'],
              '<code>-r</code> searches every file in the folder, <code>-n</code> shows line numbers. Search for where the value is created, not where it crashed.',
              'Search every file, with line numbers.'),
            Q('<code>Cannot read properties of undefined (reading \'total\')</code> on the line <code>cart.summary.total</code>. What\'s the best next question?',
              ['What\'s wrong with this line?', 'Where is <code>cart.summary</code> set - and why is it undefined there?', 'Should I add <code>?.</code> to this line?', 'Is React broken?'],
              1,
              'The crash line just uses the value. Find where the value was supposed to be set.')
          ]
        },
        {
          id: 'db-06', name: 'Reproduce before you fix', ico: '🧪',
          steps: [
            L('Make it break on purpose', [
              LEARN('how to make a bug happen every time, so you can prove it\'s fixed.'),
              { p: 'Before you fix a bug, find the exact steps that make it happen every time. Then cut out every step you don\'t need. The smallest set of steps that still shows the bug is a <strong>minimal reproduction</strong>.' },
              { p: 'If you can\'t make it happen on demand, you can\'t prove you fixed it.' }
            ]),
            L('How to do it', [
              { ul: [
                'Write down the exact steps and the exact error. "Checkout breaks" isn\'t enough. "Empty cart, click Pay, TypeError at <code>checkout.ts:31</code>" is.',
                'Remove steps one at a time until it stops breaking. The last thing you removed matters.',
                'Turn it into a test, so it checks itself every time.'
              ] },
              { term: '<span class="c">$ npx vitest run src/lib/cart.test.ts</span>\n<span class="h"> FAIL </span> total of an empty cart\n<span class="h">TypeError</span>: Reduce of empty array with no initial value' }
            ]),
            B('Run only the one test file that shows the bug.',
              ['npx', 'vitest', 'run', 'src/lib/cart.test.ts'],
              ['watch', 'npm', 'test', '--all', 'src/'],
              'Running one file takes seconds, so you can try a fix and check it instantly.',
              'The test runner, run once, one file.'),
            Q('Which of these is a useful bug reproduction?',
              ['"Checkout is flaky"', '"Sometimes the total looks wrong"', '"Empty cart, click Pay: TypeError at cart.ts:14, every time"', '"Users are complaining"'],
              2,
              'Exact steps, exact error, happens every time. You can watch it fail, then watch it pass after the fix.')
          ]
        },
        {
          id: 'db-07', name: 'Reading the AI\'s fix', ico: '🩹',
          steps: [
            L('Real fix or hidden error?', [
              LEARN('how to tell if an AI actually fixed a bug or just hid the error.'),
              { p: 'If you ask an AI to "make the error go away", it sometimes hides the error instead of fixing it. The app stops crashing, but the bug is still there.' },
              { term: '<span class="o">// before</span>\nconst total = cart.items.reduce((sum, i) => sum + i.price)\n\n<span class="o">// the "fix" - hides the error</span>\n<span class="h">try {</span>\n  const total = cart.items.reduce((sum, i) => sum + i.price)\n<span class="h">} catch (e) {}</span>' },
              { p: 'An error that\'s caught and ignored like this is a <strong>swallowed error</strong>.' }
            ]),
            L('What to look for in the diff', [
              { ul: [
                '<strong>Real fix:</strong> changes the thing that caused the bug. Here: <code>reduce((sum, i) => sum + i.price, 0)</code> - an empty cart now totals 0.',
                '<strong>Hidden error:</strong> an empty <code>catch</code>, <code>// @ts-ignore</code>, <code>as any</code>, <code>?.</code> added on the crashing line, or a test deleted or skipped.'
              ] },
              { p: 'Ask: does the original bug now give the <em>right answer</em>, or just <em>no error</em>? Always read the diff, not just the AI\'s summary.' }
            ]),
            B('Show the AI\'s changes compared to main, and list every line that mentions catch.',
              ['git', 'diff', 'main', '|', 'grep', '-n', 'catch'],
              ['log', '--stat', 'try', '-v', '&&'],
              'A new <code>catch</code> in a bug fix is worth checking. Search for <code>ts-ignore</code>, <code>as any</code> and <code>.skip</code> the same way.',
              'The diff, then search it.'),
            Q('The AI "fixes" <code>Cannot read properties of undefined (reading \'map\')</code> by changing the line to <code>products?.map(...)</code>. What happens now?',
              ['The bug is fixed', 'It stops crashing, but the list just shows nothing - and the reason products is undefined is still there', 'It crashes worse', 'The build fails'],
              1,
              '<code>?.</code> turns a crash into a silent empty screen. First find out why the value is missing.'),
            Q('Which change is most likely a real fix?',
              ['Wrapping the code in <code>try { } catch {}</code>', 'Adding <code>// @ts-ignore</code>', 'Adding the missing <code>include: { customer: true }</code> to the query that loads orders', 'Marking the failing test <code>.skip</code>'],
              2,
              'It fixes where the bad value came from. The other three just hide the error.')
          ]
        },
        {
          id: 'db-08', name: 'Logging that helps', ico: '🔦',
          steps: [
            L('What to log', [
              LEARN('how to write log lines that actually help you find a bug.'),
              { p: 'A useful log line says <strong>where</strong> in the app it is and shows the <strong>values that matter</strong>.' },
              { term: '<span class="o">// not useful</span>\nconsole.log(\'here\')\nconsole.log(data)\n\n<span class="o">// useful</span>\nconsole.log(\'[checkout] cart loaded\', { userId, items: cart.items.length })\nconsole.error(\'[checkout] payment failed\', { userId, status: res.status })' },
              { ul: [
                'Add a label, like <code>[checkout]</code>, so you know where it came from.',
                'Log the values that decide what happens next: an ID, a count, a status code.',
                'Log right before a request and right after the response.',
                'Never log passwords, API keys or tokens.'
              ] },
              { p: 'Use the right <strong>log level</strong> - <code>console.error</code> for errors, <code>console.warn</code> for warnings, <code>console.log</code> for normal info - so you can filter for the serious ones.' }
            ]),
            L('Watch logs live', [
              { p: 'This command follows a log file as new lines are added, and only shows errors:' },
              { term: '<span class="c">$ tail -f logs/app.log | grep ERROR</span>' }
            ]),
            B('Follow the app log live and show only lines with ERROR.',
              ['tail', '-f', 'logs/app.log', '|', 'grep', 'ERROR'],
              ['cat', '-n', 'head', 'WARN', '-v'],
              '<code>tail -f</code> keeps showing new lines as they\'re written, and <code>grep ERROR</code> filters them.',
              'Follow the file, then filter.'),
            Q('Which log line is most useful when something breaks?',
              ['<code>console.log(\'here\')</code>', '<code>console.log(user)</code> - the whole user object, including their session token', '<code>console.error(\'[billing] charge failed\', { userId, status: 402 })</code>', '<code>console.log(\'it broke\')</code>'],
              2,
              'It says where, uses the error level, and shows the key values. The second one also leaks a secret into your logs.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 - Common errors and what to do next',
      desc: 'The errors you\'ll see most, and how to narrow down, undo and write up a bug.',
      nodes: [
        {
          id: 'db-09', name: 'Common vibe-coder breakages', ico: '🧯',
          steps: [
            L('The errors you\'ll see most', [
              LEARN('what the five most common errors in AI-built apps mean.'),
              { ul: [
                '<code>undefined</code> - the value was never set. A typo in a name, a missing field, or data that hasn\'t loaded yet.',
                '<code>null</code> - the value was set to "nothing" on purpose. For example, no database row was found, or no one is logged in.',
                '<strong>Missing env var</strong> - <code>process.env.STRIPE_SECRET_KEY</code> is undefined in production because it was only in your local <code>.env</code> file. Works locally, breaks when deployed.',
                '<strong>401 Unauthorized</strong> - the server doesn\'t know who you are. Missing or expired login or API key.',
                '<strong>403 Forbidden</strong> - the server knows who you are, but you\'re not allowed to do this.'
              ] }
            ]),
            L('CORS errors', [
              { term: '<span class="h">Access to fetch at \'https://api.example.com/data\' from origin \'https://myapp.com\'\nhas been blocked by CORS policy: No \'Access-Control-Allow-Origin\' header is\npresent on the requested resource.</span>' },
              { p: '<strong>CORS</strong> is a browser rule: your page can only read data from another website if that website allows it. The fix is on the <strong>other server</strong> (or call it from your own server instead). It only happens in browsers, so the same request works in <code>curl</code>.' },
              { p: 'To check an env var is set, don\'t print it - secrets end up in your terminal history. Check it\'s not empty instead:' },
              { term: '<span class="c">$ test -n "$STRIPE_SECRET_KEY" && echo set</span>' }
            ]),
            B('Check that STRIPE_SECRET_KEY is set, without printing its value.',
              ['test', '-n', '"$STRIPE_SECRET_KEY"', '&&', 'echo', 'set'],
              ['echo', '"$STRIPE_SECRET_KEY"', '-z', '||', 'printenv'],
              '<code>test -n</code> checks the value isn\'t empty. You see <code>set</code> or nothing - never the secret itself.',
              'Test for not-empty, then print a word.'),
            Q('You\'re logged in with a valid token, and the API returns <code>403</code>. What does it mean?',
              ['You\'re not logged in', 'The server knows who you are, but this account isn\'t allowed to do this', 'The server crashed', 'Wrong URL'],
              1,
              '401 means "who are you?". 403 means "I know who you are, and no". Check roles and permissions.'),
            Q('Which part of this CORS error shows the fix is on the other server?',
              ['<code>Access to fetch at \'https://api.example.com/data\'</code>', '<code>from origin \'https://myapp.com\'</code>', '<code>No \'Access-Control-Allow-Origin\' header is present on the requested resource</code>', '<code>has been blocked</code>'],
              2,
              'That header has to come from the other server. Your page can\'t add it.'),
            Q('It works on your laptop but crashes on Vercel: <code>Cannot read properties of undefined (reading \'split\')</code> on <code>process.env.ALLOWED_ORIGINS.split(\',\')</code>. Most likely cause?',
              ['Vercel is broken', 'The env var is in your local .env but was never added to Vercel', 'A typo in split', 'Wrong Node version'],
              1,
              '"Works locally, breaks when deployed" plus <code>process.env</code> on the crashing line almost always means a missing env var.')
          ]
        },
        {
          id: 'db-10', name: 'Binary search on a bug', ico: '✂️',
          steps: [
            L('Cut the problem in half', [
              LEARN('how to find a bug fast by cutting the search in half each time.'),
              { p: 'Instead of checking things one at a time, split them in half and check which half has the bug. Then split that half again. Keep going until only one thing is left. This is called <strong>divide and conquer</strong>.' },
              { p: 'With 1,000 things to check, one at a time could take 1,000 checks. Halving takes about 10.' }
            ]),
            L('Three ways to use it', [
              { ul: [
                '<strong>Code:</strong> comment out half of a function. Still broken? The bug is in the half you kept.',
                '<strong>Data:</strong> an import fails on 10,000 rows. Try the first 5,000. Keep halving until you find the bad row.',
                '<strong>Commits:</strong> Git can do it for you with <code>git bisect</code>. Tell it one good commit and one bad one, and it checks the middle each time.'
              ] },
              { term: '<span class="c">$ git bisect start</span>\n<span class="c">$ git bisect bad</span>                 <span class="o"># now is broken</span>\n<span class="c">$ git bisect good v1.4.0</span>         <span class="o"># this version worked</span>\n<span class="o">Bisecting: 20 revisions left to test after this (roughly 4 steps)</span>' }
            ]),
            B('Have Git find the bad commit automatically by running your tests at each step.',
              ['git', 'bisect', 'run', 'npm', 'test'],
              ['start', 'good', 'bad', 'log', 'reset'],
              'Git checks out the middle commit, runs the tests, and repeats until it finds the first bad commit. Run <code>git bisect reset</code> when you\'re done.',
              'Bisect, then the command to run each time.'),
            Q('The last working commit was 64 commits ago. About how many checks does halving take?',
              ['64', '32', 'About 6', '1'],
              2,
              '64, 32, 16, 8, 4, 2, 1 - six halvings.'),
            Q('<code>Bisecting: 20 revisions left to test after this (roughly 4 steps)</code> - which part tells you how many more checks you\'ll do?',
              ['<code>Bisecting</code>', '<code>20 revisions left</code>', '<code>roughly 4 steps</code>', '<code>after this</code>'],
              2,
              '20 commits are left, but halving means only about 4 more checks.')
          ]
        },
        {
          id: 'db-11', name: 'Revert instead of fix', ico: '⏪',
          steps: [
            L('Undo first, fix later', [
              LEARN('when to undo a change instead of trying to fix it right away.'),
              { p: 'If something broke right after a change and users are affected, the fastest safe move is often to <strong>undo the change</strong>. That takes the app back to its <strong>last known good</strong> version - the latest one you know worked. Then fix the bug calmly.' },
              { p: 'Rushing a fix under pressure often creates new bugs.' }
            ]),
            L('Revert or fix?', [
              { ul: [
                '<strong>Revert</strong> when users are affected, you know which change broke it, and the fix isn\'t obvious.',
                '<strong>Fix forward</strong> when the fix is one small line you can test right now - or when the change can\'t be undone, like a database change that already deleted data.'
              ] },
              { term: '<span class="c">$ git revert HEAD</span>\n<span class="o">[main 7c1e0d2] Revert "Let Claude refactor checkout"</span>' },
              { p: '<code>git revert</code> adds a new commit that undoes the old one, so it\'s safe on shared branches. Don\'t use <code>git reset --hard</code> on anything you\'ve already pushed.' }
            ]),
            B('Undo the most recent commit by adding a new commit that reverses it.',
              ['git', 'revert', 'HEAD'],
              ['reset', '--hard', 'HEAD~1', 'checkout', 'restore'],
              'The bad change is undone and history is kept. Push it and the app is back to working while you debug.',
              'The safe undo, on the latest commit.'),
            Q('Checkout broke after this morning\'s deploy and customers can\'t pay. You don\'t have a fix yet. What do you do?',
              ['Keep debugging in production', 'Revert the deploy now, then debug', 'Wait and see', 'Tell users to try later'],
              1,
              'Every minute costs real payments. Get back to the last known good version first.'),
            Q('When is fixing forward better than reverting?',
              ['Whenever you feel confident', 'When the change can\'t be undone (like deleted data), or the fix is one small tested line', 'Never', 'Late at night'],
              1,
              'Reverting code doesn\'t bring back deleted data. For those, and for tiny tested fixes, go forward.')
          ]
        },
        {
          id: 'db-12', name: 'The bug report for future you', ico: '📝',
          steps: [
            L('Write it down properly', [
              LEARN('what to put in a bug report so you (or an AI) can fix it later.'),
              { p: 'A week from now you won\'t remember the details. A good <strong>bug report</strong> has everything needed to fix the bug without you being there:' },
              { ul: [
                '<strong>Steps</strong> to make it happen',
                '<strong>Expected</strong> - what should happen',
                '<strong>Actual</strong> - what happens instead',
                '<strong>The exact error</strong>, with file and line',
                '<strong>Versions</strong> - Node, key packages, commit',
                '<strong>What you already tried</strong>'
              ] }
            ]),
            L('Example', [
              { term: '<span class="h">Title:</span> Empty cart crashes checkout\n<span class="h">Steps:</span>    1. Log in  2. Go to /checkout with an empty cart\n<span class="h">Expected:</span> "Your cart is empty" message\n<span class="h">Actual:</span>   500 error page\n<span class="h">Error:</span>    TypeError: Reduce of empty array with no initial value\n          at cartTotal (src/lib/cart.ts:14:28)\n<span class="h">Versions:</span> node v22.11.0, next@15.1.0, commit 9f2c1ab\n<span class="h">Tried:</span>    reverting 9f2c1ab makes it go away' },
              { p: 'The <strong>Expected</strong> line matters most: it tells whoever fixes it what "fixed" looks like.' }
            ]),
            B('Print your Node version and the installed version of next.',
              ['node', '--version', '&&', 'npm', 'ls', 'next'],
              ['-v', 'list', 'install', '||', 'npx'],
              '<code>npm ls</code> shows the version actually installed, not just what <code>package.json</code> asks for.',
              'Node version first, then the package.'),
            Q('Which line of a bug report tells someone what "fixed" should look like?',
              ['The title', '<strong>Expected:</strong> "Your cart is empty" message', 'The versions', 'The commit hash'],
              1,
              'Expected vs actual defines done. Without it, a fix might remove the error and still be wrong.'),
            Q('You\'re giving a bug to an AI agent. Which report gets the best fix?',
              ['"Checkout is broken, please fix"', 'Your guess about what\'s wrong', 'Exact steps, the full error with file and line, expected vs actual, and what you already tried', 'A screenshot of the page'],
              2,
              'The AI only knows what you give it. Facts beat guesses, and "what I tried" stops it repeating your dead ends.')
          ]
        }
      ]
    }
  ]
};
