/* ============================================================
   TRACK: Ship It Safely (starter, 6 levels)
   The three mistakes that turn a first real app into a real incident:
   a secret in the browser, a secret in a commit, a table anyone can read.
   Level 1 is free. Levels 2 to 6 need Pro (gating lives in app.js).

   Fact sources are named per level in a comment. Context7 and the docs
   hosts were not reachable from the session that wrote this track, so
   every fact below is labelled NOT VERIFIED against current docs.
   Check each URL before the paid test opens.
   ============================================================ */
const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });
const LEARN = what => ({ call: { k: 'tip', t: "You'll learn", p: what } });

export const safely = {
  id: 'safely',
  name: 'Ship It Safely',
  emoji: '🛡️',
  glow: '#7cff7c',
  time: '~25 min',
  desc: 'Six short levels that keep your first real app from leaking a key or a table. Public vs private settings, GitHub push protection, Supabase row-level security, and a launch checklist.',
  chapters: [
    {
      title: 'Starter - the three leaks',
      desc: 'Level 1 is free. The rest unlock with Pro.',
      nodes: [
        /* Level 1 (free)
           Source: https://nextjs.org/docs/app/guides/environment-variables
                   https://vite.dev/guide/env-and-mode
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-01', name: 'Public or private?', ico: '👀',
          steps: [
            L('Some settings ship to the browser', [
              LEARN('which settings every visitor can read, and which stay on your server.'),
              { p: 'Your app has settings in a file like <code>.env.local</code>. Some of them are copied into the JavaScript that every visitor downloads. Anyone can open the browser tools and read those.' },
              { ul: [
                '<strong>Next.js:</strong> a name that starts with <code>NEXT_PUBLIC_</code> is copied into the browser bundle when you build.',
                '<strong>Vite:</strong> a name that starts with <code>VITE_</code> is exposed to the browser through <code>import.meta.env</code>.',
                'A name <strong>without</strong> the prefix stays on the server. The browser never sees it.'
              ] },
              { term: '<span class="o"># .env.local</span>\nNEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co   <span class="o"># fine, public by design</span>\nSTRIPE_SECRET_KEY=sk_live_...                         <span class="o"># server only, no prefix, ever</span>' },
              { call: { k: 'warn', t: 'The rule:', p: 'If a value would hurt you in a stranger\'s hands, it never gets the public prefix. Renaming <code>STRIPE_SECRET_KEY</code> to <code>NEXT_PUBLIC_STRIPE_SECRET_KEY</code> to "make the error go away" publishes it to the world.' } }
            ]),
            Q('Which of these is safe to name with the public prefix?',
              ['Your Stripe secret key', 'Your database password', 'Your Supabase project URL and anon key, which are built to be used from the browser', 'An admin API token'],
              2,
              'The project URL and anon key are designed for the browser. Row-level security is what protects the data behind them, which is level 3. The other three give a stranger full control.'),
            B('List every public setting in your env file.',
              ['grep', 'NEXT_PUBLIC_', '.env.local'],
              ['cat', '-r', 'env', 'print', '.env.example'],
              'Everything this prints is readable by any visitor. If a secret shows up here, rotate it and drop the prefix.',
              'Search the file for the prefix.'),
            Q('The AI suggests fixing "process.env.STRIPE_SECRET_KEY is undefined" in a browser component by adding the public prefix. What do you do?',
              ['Add the prefix, it fixes the error', 'Move the Stripe call to a server route and keep the key private', 'Hard-code the key instead', 'Disable the error'],
              1,
              'The error is correct: the browser is not supposed to have that key. The fix is to do the Stripe work on the server, where the key belongs.')
          ]
        },

        /* Level 2 (Pro)
           Source: https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-02', name: 'Push protection', ico: '🛑',
          steps: [
            L('GitHub can stop the push', [
              LEARN('what GitHub push protection does and what to do when it blocks you.'),
              { p: '<strong>Push protection</strong> is a GitHub feature that scans what you push for known secret formats, like a Stripe live key or an AWS key, and refuses the push before the secret lands in the repository.' },
              { term: '<span class="c">$ git push</span>\n<span class="h">remote: error: GH013: Repository rule violations found</span>\n<span class="o">remote:   Push cannot contain secrets</span>\n<span class="o">remote:   Stripe Live API Secret Key</span>\n<span class="o">remote:   locations: commit a1b2c3d, .env:3</span>' },
              { ul: [
                'The push is refused. The secret never reached GitHub, so it is not burned yet.',
                'It is on by default for public repositories, and can be turned on for private ones.',
                'You can bypass it with a reason, but that publishes the secret. Then it is burned and must be rotated.'
              ] },
              { call: { k: 'tip', t: 'Blocked is good news.', p: 'Remove the secret from the commit, push again, and nothing was leaked. The bad outcome is clicking "bypass".' } }
            ]),
            Q('Push protection just blocked your push because <code>.env</code> contains a live key. Which is true?',
              ['The key is already public and must be rotated', 'The key has not left your machine, so remove it from the commit and push again', 'GitHub deleted your commit', 'You must make the repo private'],
              1,
              'Blocked means it never arrived. Fix the commit, push clean, and you have avoided an incident.'),
            B('Check the whole history of every branch for a live Stripe key prefix.',
              ['git', 'log', '-S', 'sk_live', '--all'],
              ['grep', '-p', 'HEAD', 'status', '--oneline'],
              '<code>-S</code> finds commits that added or removed that text. If anything comes back, the key is in history and has to be rotated, not just deleted.',
              'Log, search text, every branch.'),
            Q('You click "bypass" to get the push through. What is now true?',
              ['Nothing, bypass is safe', 'The secret is in the repository history and must be treated as leaked', 'GitHub rotates it for you', 'Only collaborators can see it'],
              1,
              'Bypass publishes the secret. Public or private, treat it as leaked and rotate it.')
          ]
        },

        /* Level 3 (Pro)
           Source: https://supabase.com/docs/guides/database/postgres/row-level-security
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-03', name: 'Turn on row-level security', ico: '🔐',
          steps: [
            L('The anon key can reach every table', [
              LEARN('why a Supabase table with no row-level security is readable by anyone with your public key.'),
              { p: 'Supabase gives your browser a public <strong>anon key</strong>. That key can call the data API for any table in your <code>public</code> schema. What stops a stranger reading every row is <strong>row-level security</strong>, RLS for short: a Postgres feature that checks a rule on every row before returning or changing it.' },
              { ul: [
                'RLS is set per table. Turn it on for every table in the <code>public</code> schema.',
                'With RLS on and no policies, the data API returns nothing and changes nothing. That is the safe default.',
                'Then add policies that say exactly who may read or write which rows.'
              ] },
              { term: '<span class="c">alter table profiles enable row level security;</span>' },
              { call: { k: 'warn', t: 'A table created from SQL may not have RLS on.', p: 'Check every table in the dashboard. One forgotten table is the whole leak.' } }
            ]),
            B('Turn on row-level security for the profiles table.',
              ['alter', 'table', 'profiles', 'enable', 'row', 'level', 'security;'],
              ['create', 'policy', 'grant', 'select', 'disable'],
              'From now on nothing comes out of <code>profiles</code> through the public API until a policy allows it.',
              'Alter the table, enable the feature.'),
            Q('You turn on RLS for <code>orders</code> and your app\'s order list goes blank. Why?',
              ['RLS deleted the rows', 'RLS is on but there is no policy yet, so the API returns no rows', 'The anon key expired', 'You need a bigger plan'],
              1,
              'That blank list is the feature working. Add a policy that lets a signed-in user read their own orders, which is the next level.')
          ]
        },

        /* Level 4 (Pro)
           Source: https://supabase.com/docs/guides/database/postgres/row-level-security
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-04', name: 'Policies that check who', ico: '🪪',
          steps: [
            L('A policy is a rule per row', [
              LEARN('how to write a policy so people only see their own rows.'),
              { p: 'A <strong>policy</strong> is a rule attached to a table. For each row, Postgres asks the rule "may this user see this?" and only returns the rows where the answer is yes.' },
              { term: '<span class="c">create policy "read own profile"\n  on profiles for select\n  using ( auth.uid() = user_id );</span>' },
              { ul: [
                '<code>auth.uid()</code> is the id of the signed-in user making the request.',
                '<code>user_id</code> is the column on the row. The rule passes only when they match.',
                '<code>for select</code> covers reading. Writes need their own policy, with <code>with check</code> for inserts and updates.'
              ] },
              { call: { k: 'warn', t: 'The policy the AI loves to write:', p: '<code>using (true)</code>. That means "everyone may see every row". It makes the error go away and turns RLS off in all but name.' } }
            ]),
            Q('Which policy lets a user read only their own rows?',
              ['<code>using (true)</code>', '<code>using (auth.uid() = user_id)</code>', '<code>using (user_id is not null)</code>', '<code>using (auth.role() = \'anon\')</code>'],
              1,
              'Only the second one compares the signed-in user to the row. The others let everyone, or every signed-in user, through.'),
            Q('Your insert policy is <code>with check (true)</code>. What can a signed-in user do?',
              ['Only insert rows for themselves', 'Insert rows with any user_id, including another person\'s', 'Nothing', 'Only read'],
              1,
              '<code>with check</code> decides which new rows are allowed. <code>true</code> allows all of them, so a user can write rows that belong to someone else.')
          ]
        },

        /* Level 5 (Pro)
           Source: https://supabase.com/docs/guides/api/api-keys
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-05', name: 'The key that skips every rule', ico: '🗝️',
          steps: [
            L('Two keys, two jobs', [
              LEARN('which Supabase key may touch the browser and which never may.'),
              { ul: [
                '<strong>anon key:</strong> public. Goes in the browser. Every request is checked by RLS.',
                '<strong>service_role key:</strong> secret. Bypasses RLS completely. Server only, with no public prefix, ever.'
              ] },
              { p: 'An AI assistant fixing a "no rows returned" error will sometimes swap the anon key for the service_role key in the browser code. The error disappears. So does every rule you just wrote.' },
              { term: '<span class="o"># server route only</span>\nSUPABASE_SERVICE_ROLE_KEY=eyJ...\n\n<span class="o"># browser</span>\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...' }
            ]),
            B('Search your front-end folder for any mention of the service role key.',
              ['grep', '-rn', 'SERVICE_ROLE', 'src'],
              ['find', '-i', 'ANON', 'cat', 'app'],
              'Anything this finds outside a server-only file is a leak waiting to happen. Move it, then rotate the key.',
              'Recursive search with line numbers.'),
            Q('A level list comes back empty in the browser. The AI suggests using the service_role key there. Why is that wrong?',
              ['It is slower', 'It bypasses RLS, so every visitor could read and change every row', 'It only works on localhost', 'It is not wrong'],
              1,
              'The empty list means a policy is missing. Write the policy. The service_role key belongs on the server and nowhere else.')
          ]
        },

        /* Level 6 (Pro)
           Sources: the five levels above.
           Status: NOT VERIFIED against current docs in this session. */
        {
          id: 'ss-06', name: 'The launch check', ico: '✅',
          steps: [
            L('Five minutes before you share the link', [
              LEARN('the short checklist that catches the three leaks before anyone else can.'),
              { h: 'Secrets' },
              { ul: [
                'No secret has a public prefix. <code>grep NEXT_PUBLIC_ .env.local</code> shows only public values.',
                '<code>.env</code> and <code>.env.local</code> are in <code>.gitignore</code>, and <code>git log -S sk_live --all</code> finds nothing.',
                'Push protection is on for the repository.'
              ] },
              { h: 'Data' },
              { ul: [
                'Every table in <code>public</code> has RLS on.',
                'No policy says <code>using (true)</code> or <code>with check (true)</code> unless the table is meant to be public.',
                'The service_role key appears only in server code and server settings.'
              ] },
              { h: 'Then' },
              { ul: [
                'Open the app in a private window, signed out. Try to read something you should not see.',
                'Put real values in the host\'s environment settings, never in the repository.'
              ] },
              { call: { k: 'tip', t: 'Ten minutes, every launch.', p: 'Every item on this list is something a bot or a bored stranger will try within a day of your link going public.' } }
            ]),
            B('Add the Stripe secret to the Production environment on Vercel, so it never lives in the repo.',
              ['vercel', 'env', 'add', 'STRIPE_SECRET_KEY', 'production'],
              ['pull', 'set', 'NEXT_PUBLIC_STRIPE_SECRET_KEY', 'git', 'commit'],
              'The CLI asks for the value and stores it on Vercel. The repository never holds it, and the name has no public prefix.',
              'Environment, add, which key, which environment.'),
            Q('A friend opens your app signed out and can see every user\'s orders. Which check did you skip?',
              ['The public prefix check', 'RLS on the orders table, or a policy that lets everyone read', 'Push protection', 'The Vercel env check'],
              1,
              'Reading rows that are not yours means either RLS is off on that table or a policy says everyone may read. Both are a data check, not a secrets check.')
          ]
        }
      ]
    }
  ]
};
