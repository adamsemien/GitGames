/* ============================================================
   TRACK: APIs & Webhooks
   ============================================================ */
import { httpCycle, webhookFlow } from './svg.js';

const L = (title, body, cta) => ({ t: 'lesson', title, body, cta });
const Q = (q, choices, a, why) => ({ t: 'quiz', q, choices, a, why });
const B = (brief, answer, chips, why, hint) => ({ t: 'build', brief, answer, chips, why, hint });

export const apis = {
  id: 'apis',
  name: 'APIs & Webhooks',
  emoji: '🌐',
  glow: '#39e6ff',
  time: '~40 min',
  desc: 'How software talks to other software. HTTP, status codes, auth, rate limits, idempotency — and webhooks, where the call comes back the other way.',
  chapters: [
    {
      title: 'Chapter 1 — How the conversation works',
      desc: 'Every API you will ever use is this, wearing a different hat.',
      nodes: [
        {
          id: 'ap-01', name: 'What an API is', ico: '🔌',
          steps: [
            L('A menu, not a kitchen', [
              { p: 'An <strong>API</strong> is a published list of things you are allowed to ask another program to do, and the exact shape you have to ask in.' },
              { p: 'You do not get to see inside Stripe. You get a menu: <em>create a customer</em>, <em>start a checkout</em>, <em>refund a payment</em>. You send a request in the format they specified, they send back a result. The kitchen stays private.' },
              { call: { k: 'tip', t: 'Why this matters to you:', p: 'Almost nothing you build is built by you. Auth is Clerk\'s API. Payments are Stripe\'s. The database is an API. Your own frontend talks to your own backend through an API. Learn the shape once and it repeats everywhere.' } }
            ]),
            Q('Why can you not just read Stripe\'s database directly?',
              ['It is too slow', 'The API is the only door they expose — it enforces what you may see and do', 'You need a licence', 'You can, with the right key'],
              1,
              'The API <em>is</em> the boundary. It decides what exists, who may touch it, and in what shape. That constraint is the product — it is what makes it safe to let strangers call your code.')
          ]
        },
        {
          id: 'ap-02', name: 'Request & response', ico: '🔁',
          steps: [
            L('The whole protocol on one page', [
              { svg: httpCycle },
              { p: 'A <strong>request</strong> is four things: a <em>method</em> (what kind of action), a <em>path</em> (which thing), <em>headers</em> (who you are, what format you speak), and sometimes a <em>body</em> (the data).' },
              { p: 'A <strong>response</strong> is three: a <em>status code</em> (how it went), <em>headers</em>, and usually a <em>body</em> of JSON.' },
              { term: '<span class="c">POST /v1/customers HTTP/1.1</span>\n<span class="h">Host:</span> api.stripe.com\n<span class="h">Authorization:</span> Bearer sk_test_51H…\n<span class="h">Content-Type:</span> application/json\n\n{ "email": "you@example.com" }\n\n<span class="o">← 201 Created\n  { "id": "cus_Nx8…", "email": "you@example.com" }</span>' },
              { call: { t: 'Stateless is the key word:', p: 'The server remembers nothing between calls. Every request must carry everything needed to answer it — which is why your API key goes on <em>every single request</em>, not once at the start.' } }
            ]),
            Q('Why does every request need the API key, not just the first one?',
              ['Security theatre', 'HTTP is stateless — the server keeps no memory of you between requests', 'To count usage', 'It does not, only the first'],
              1,
              'Statelessness is what lets any server in a fleet answer any request. Nothing is remembered, so everything must be carried. Sessions and cookies are a layer built on top to fake continuity.')
          ]
        },
        {
          id: 'ap-03', name: 'The verbs', ico: '🔠',
          steps: [
            L('GET, POST, PATCH, PUT, DELETE', [
              { ul: [
                '<code>GET</code> — read something. Must not change anything. Safe to repeat, safe to cache.',
                '<code>POST</code> — create something, or trigger an action. <em>Not</em> safe to repeat.',
                '<code>PATCH</code> — change some fields of an existing thing.',
                '<code>PUT</code> — replace a thing entirely.',
                '<code>DELETE</code> — remove it.'
              ] },
              { call: { k: 'warn', t: 'The rule people break:', p: 'A <code>GET</code> that changes data is a real bug, not a style issue. Browsers, proxies and crawlers all assume GET is safe and will happily fire it again — or prefetch it before the user clicks.' } },
              { p: 'The distinction that actually matters is <strong>idempotent or not</strong>: does running it twice do the same thing as running it once? <code>GET</code>, <code>PUT</code> and <code>DELETE</code> are. <code>POST</code> is not — which is why double-clicking a Pay button can charge twice.' }
            ]),
            Q('Which method should create a new order?',
              ['<code>GET</code>', '<code>POST</code>', '<code>PUT</code>', '<code>DELETE</code>'],
              1,
              'POST creates. And because POST is not idempotent, a retried or double-clicked POST creates two orders — which is exactly the problem idempotency keys exist to solve.')
          ]
        },
        {
          id: 'ap-04', name: 'Status codes', ico: '🚦',
          steps: [
            L('The first digit tells you whose fault it is', [
              { ul: [
                '<strong>2xx — it worked.</strong> <code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code>.',
                '<strong>3xx — look somewhere else.</strong> <code>301</code> moved permanently, <code>302</code> temporarily.',
                '<strong>4xx — you messed up.</strong> Your request was wrong. Fixing it is on you.',
                '<strong>5xx — they messed up.</strong> Their server broke. Retrying may actually help.'
              ] },
              { h: 'The 4xx you will meet' },
              { term: '<span class="h">400</span> Bad Request   <span class="o">malformed — your JSON or params are wrong</span>\n<span class="h">401</span> Unauthorized  <span class="o">we do not know who you are (bad/missing key)</span>\n<span class="h">403</span> Forbidden     <span class="o">we know who you are, you may not do this</span>\n<span class="h">404</span> Not Found     <span class="o">no such thing (or you cannot see it)</span>\n<span class="h">409</span> Conflict      <span class="o">clashes with current state</span>\n<span class="h">422</span> Unprocessable <span class="o">shape is fine, values are invalid</span>\n<span class="h">429</span> Too Many      <span class="o">rate limited — slow down</span>' },
              { call: { k: 'tip', t: 'Remember 401 vs 403 like this:', p: '<strong>401 = who are you?</strong> (authentication). <strong>403 = I know who you are, and no.</strong> (authorization). Mixing these up is the most common API bug there is.' } }
            ]),
            Q('Your logged-in user hits an admin endpoint and gets 403. What is wrong?',
              ['Their session expired', 'They are authenticated but not allowed to do this', 'The endpoint does not exist', 'The server crashed'],
              1,
              '403 means identity is fine, permission is not. If the session had expired you would get 401. That distinction tells you instantly whether to fix login or fix roles.')
          ]
        },
        {
          id: 'ap-05', name: 'curl', ico: '🧪',
          steps: [
            L('The universal debugger', [
              { p: 'Before you write a line of code against an API, call it with <code>curl</code>. It removes your framework, your types, your auth middleware and your assumptions from the picture.' },
              { term: '<span class="c">$ curl -i https://api.example.com/v1/users/42 \\\n    -H "Authorization: Bearer $TOKEN"</span>\n\n<span class="o">HTTP/2 200\ncontent-type: application/json\n\n{"id":42,"name":"Ada"}</span>' },
              { ul: [
                '<code>-i</code> show response headers (you need these more than you think)',
                '<code>-X POST</code> set the method',
                '<code>-H</code> add a header, repeatable',
                '<code>-d \'{"a":1}\'</code> send a body (implies POST)',
                '<code>-v</code> show the whole conversation, including TLS',
                '<code>| jq</code> pretty-print and filter the JSON'
              ] },
              { call: { k: 'tip', t: 'The debugging rule:', p: 'If curl works and your app does not, the bug is in your code. If curl fails too, it is your request, your key, or them. That one test splits the problem in half in ten seconds.' } }
            ]),
            B('Fetch a URL and show the response headers too.',
              ['curl', '-i', 'https://api.example.com/v1/users'], ['-X', '-d', '-H', 'wget', '-o'],
              '<code>-i</code> includes the status line and headers in the output. <code>-I</code> (capital) sends a HEAD request and shows <em>only</em> headers.',
              'One flag, then the URL.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 2 — Getting in, and staying in',
      desc: 'Auth, limits, and not double-charging anyone.',
      nodes: [
        {
          id: 'ap-06', name: 'Auth: the four kinds', ico: '🔑',
          steps: [
            L('API keys, bearer tokens, OAuth, signatures', [
              { ul: [
                '<strong>API key</strong> — one long secret string that <em>is</em> your identity. Simple, powerful, and catastrophic if leaked. Server-side only, always.',
                '<strong>Bearer token</strong> — a short-lived token sent as <code>Authorization: Bearer …</code>. "Bearer" literally means whoever holds it can use it — so treat it like cash.',
                '<strong>OAuth</strong> — the "Sign in with Google" dance. Lets a user grant <em>your</em> app limited access to <em>their</em> account on another service, without ever giving you their password.',
                '<strong>Signing secret</strong> — not for calling out, but for proving an <em>incoming</em> request is genuine. This is how webhooks are secured.'
              ] },
              { call: { k: 'warn', t: 'Test vs live keys:', p: 'Most providers give you two sets. Test keys cannot move real money or send real email. Wire every non-production environment to test keys — it makes a whole category of accident impossible rather than merely unlikely.' } }
            ]),
            Q('What does "bearer" in Bearer token actually mean?',
              ['It bears your username', 'Whoever holds the token can use it — no further proof required', 'It expires when you log out', 'It is bound to your IP'],
              1,
              'No identity check beyond possession. That is why bearer tokens are short-lived and must never appear in a URL, a log, or client-side code.')
          ]
        },
        {
          id: 'ap-07', name: 'Rate limits', ico: '🐢',
          steps: [
            L('429, and what to do about it', [
              { p: 'Every serious API caps how often you may call it. Exceed it and you get <code>429 Too Many Requests</code>, usually with a <code>Retry-After</code> header telling you how long to wait.' },
              { p: 'The correct response is <strong>exponential backoff with jitter</strong>: wait 1s, then 2s, then 4s, then 8s — plus a small random amount so that every client that failed at once does not retry at once.' },
              { term: '<span class="o"># retry schedule</span>\nattempt 1 → wait ~1s\nattempt 2 → wait ~2s\nattempt 3 → wait ~4s\nattempt 4 → wait ~8s   <span class="o">then give up and log it</span>' },
              { call: { k: 'warn', t: 'Never retry in a tight loop.', p: 'Hammering a rate-limited API extends your ban, and if you are paying per call it burns money doing nothing. Retrying without backoff is how a small outage becomes a big one.' } },
              { call: { k: 'tip', t: 'Rate limit yourself, too:', p: 'Your own endpoints need limits — not just for abuse, but for your bill. One person with a script can run up serious cost on an app that calls an AI model per request.' } }
            ]),
            Q('You get a 429. Best response?',
              ['Retry immediately', 'Back off exponentially, with jitter, and give up after a few tries', 'Switch API keys', 'Fail the whole job instantly'],
              1,
              'Backoff gives the service room to recover; jitter stops all your clients synchronising into a thundering herd. Retrying instantly usually makes the ban longer.')
          ]
        },
        {
          id: 'ap-08', name: 'Idempotency', ico: '♻️',
          steps: [
            L('Making "twice" mean "once"', [
              { p: 'The network is unreliable in a specific, nasty way: a request can <em>succeed on the server</em> and the response can be lost on the way back. Your code sees a timeout. Did it work? You genuinely cannot tell.' },
              { p: 'An <strong>idempotency key</strong> fixes this. You generate a unique ID for the operation and send it with the request. The server records it. If it sees the same key again, it returns the original result instead of doing the work twice.' },
              { term: '<span class="c">POST /v1/charges</span>\n<span class="h">Idempotency-Key:</span> order_8f21c-attempt\n\n<span class="o"># retried after a timeout → same key → same charge,\n# not a second one. Safe to retry forever.</span>' },
              { call: { k: 'tip', t: 'Use the natural ID:', p: 'Derive the key from the thing itself — the order ID, the cart ID — not a random value. A random key regenerated on retry defeats the entire mechanism.' } }
            ]),
            Q('A charge request times out. You have no idempotency key. What now?',
              ['Retry — worst case nothing happens', 'You cannot safely retry: it may have already charged them', 'Charge again and refund later', 'Ignore it'],
              1,
              'That ambiguity is the whole problem. Without a key you must go and look up whether it happened. With one, you just retry and let the server sort it out.')
          ]
        },
        {
          id: 'ap-09', name: 'Reading API docs fast', ico: '📗',
          steps: [
            L('The four things to find', [
              { ul: [
                '<strong>Base URL and version.</strong> <code>https://api.x.com/v1</code>. Get the version wrong and every example silently fails.',
                '<strong>How auth works.</strong> Which header, which key, test vs live.',
                '<strong>One complete example</strong> of the exact call you need — request <em>and</em> response. Run it in curl before writing code.',
                '<strong>Errors and limits.</strong> What they return when it goes wrong, and how fast you may call.'
              ] },
              { call: { k: 'tip', t: 'Give the docs to your agent, not your memory of them:', p: 'Models confidently hallucinate API shapes, especially for services that changed recently. Paste the actual endpoint docs into context, or point the agent at the URL. "Use the real signature from these docs" prevents an entire class of wasted hour.' } },
              { call: { t: 'Also worth knowing:', p: 'If a provider publishes an OpenAPI spec, that is the machine-readable truth. Feed it to your agent and it can generate a correct client instead of guessing.' } }
            ]),
            Q('An agent writes API code using a method that does not exist.',
              ['The model is broken', 'It is recalling an older or imagined version — give it the real docs', 'The API is undocumented', 'Try a different model'],
              1,
              'Training data has a cutoff and APIs move. This is the single most common failure when building against third-party services, and pasting the current docs fixes it outright.')
          ]
        }
      ]
    },
    {
      title: 'Chapter 3 — Webhooks',
      desc: 'When the call comes back the other way.',
      nodes: [
        {
          id: 'ap-10', name: 'Inversion of control', ico: '📮',
          steps: [
            L('They call you', [
              { p: 'Normally you call an API and wait. But some things take time and you have no idea when they will finish — a card payment clearing, a video finishing, a user completing signup.' },
              { p: 'Polling ("did it happen yet? did it happen yet?") is wasteful and slow. A <strong>webhook</strong> inverts it: you give them a URL, and they POST to it the moment something happens.' },
              { svg: webhookFlow },
              { call: { k: 'warn', t: 'The consequence people miss:', p: 'Your webhook URL is a public endpoint on the open internet that anyone can POST to. It is not "inside" your app. It needs its own authentication — and that authentication is <em>not</em> your normal login.' } }
            ]),
            Q('Why can a webhook endpoint not use your normal session auth?',
              ['It could, with extra config', 'Stripe is not a logged-in user — there is no session to check', 'Sessions are too slow', 'It can, if you whitelist the IP'],
              1,
              'The caller is another company\'s server. It has no cookie and no account with you. Authenticity has to be proved a different way — with a signature.')
          ]
        },
        {
          id: 'ap-11', name: 'Signature verification', ico: '✍️',
          steps: [
            L('Proving it really was them', [
              { p: 'The provider gives you a <strong>signing secret</strong>. On every webhook they hash the exact request body with that secret and put the result in a header. You do the same computation and compare.' },
              { p: 'Match means: it came from someone who knows the secret, and the body was not altered in transit. No match means: discard it.' },
              { term: '<span class="o">// Next.js App Router</span>\nconst raw = await req.<span class="h">text()</span>;      <span class="o">// NOT req.json()</span>\nconst sig = req.headers.get(\'stripe-signature\');\nconst event = stripe.webhooks.constructEvent(\n  raw, sig, process.env.STRIPE_WEBHOOK_SECRET\n);' },
              { call: { k: 'warn', t: 'The raw body is not optional:', p: 'The signature is computed over the exact bytes sent. Parse the JSON first and you have re-serialised it — different bytes, different hash, verification fails. This wastes more developer hours than almost any other webhook bug.' } },
              { call: { k: 'warn', t: 'An unverified webhook is an open API:', p: 'Skip verification and anyone who guesses your URL can POST <code>{"type":"payment.succeeded"}</code> and grant themselves a subscription. This is not hypothetical — it is a standard thing attackers try.' } }
            ]),
            Q('Signature verification keeps failing but the payload looks perfect.',
              ['The secret is wrong', 'You parsed the body as JSON before verifying — you need the raw bytes', 'Stripe is down', 'Your clock is wrong'],
              1,
              'Re-serialised JSON differs from the original bytes — key order, whitespace, number formatting. The hash is over bytes, not meaning. Always verify against the raw body.')
          ]
        },
        {
          id: 'ap-12', name: 'Handling them properly', ico: '⚙️',
          steps: [
            L('Three rules, all easy to skip', [
              { ul: [
                '<strong>Verify first.</strong> Before you read a single field, before you touch the database.',
                '<strong>Be idempotent.</strong> Providers retry. The same event <em>will</em> arrive twice. Store the event ID and ignore repeats — otherwise you double-credit accounts.',
                '<strong>Return 200 fast.</strong> Acknowledge immediately, then do slow work in the background. Most providers time out in seconds and retry — so a slow handler creates the duplicate storm it is struggling with.'
              ] },
              { term: '<span class="o">// the shape that works</span>\n1. read raw body\n2. verify signature        <span class="o">→ 400 if bad</span>\n3. seen this event id?     <span class="o">→ 200, do nothing</span>\n4. record the event id\n5. return 200\n6. do the actual work' },
              { call: { k: 'tip', t: 'Order matters:', p: 'Record the ID and return 200 <em>before</em> the slow work, not after. Otherwise a retry arrives while the first is still running and you process it twice anyway.' } }
            ]),
            Q('Your handler does the work first and returns 200 after 30 seconds.',
              ['Fine — it still returns 200', 'The provider times out and retries, so the same event processes repeatedly', 'The event is dropped', 'The signature expires'],
              1,
              'Slow acknowledgement causes retries, retries cause duplicates, duplicates cause double charges. Acknowledge fast, work afterwards.')
          ]
        },
        {
          id: 'ap-13', name: 'Testing them locally', ico: '🚇',
          steps: [
            L('Your laptop has no public URL', [
              { p: 'Stripe cannot POST to <code>localhost:3000</code> — it does not exist on the internet. A <strong>tunnel</strong> gives your local server a temporary public address and forwards traffic to it.' },
              { term: '<span class="o"># Stripe\'s own tunnel — no signup, no extra tool</span>\n<span class="c">$ stripe listen --forward-to localhost:3000/api/webhooks/stripe</span>\n<span class="o">Ready! Your webhook signing secret is whsec_… </span>\n\n<span class="o"># fire a real event on demand</span>\n<span class="c">$ stripe trigger checkout.session.completed</span>\n\n<span class="o"># general purpose alternative</span>\n<span class="c">$ ngrok http 3000</span>' },
              { call: { k: 'tip', t: 'The secret changes:', p: '<code>stripe listen</code> prints a <em>different</em> signing secret from the one in your dashboard. Use the printed one locally, the dashboard one in production. Mixing them up is the classic "works locally, fails deployed".' } },
              { call: { t: 'Replay is your friend:', p: 'Both Stripe and GitHub let you re-send a past webhook from the dashboard. Debugging with a real historical payload beats anything you can make up.' } }
            ]),
            B('Forward Stripe webhooks to your local endpoint.',
              ['stripe', 'listen', '--forward-to', 'localhost:3000/api/webhooks/stripe'],
              ['trigger', 'tunnel', '--url', 'ngrok', 'serve'],
              'This registers a temporary endpoint with Stripe and pipes events to your machine. It also prints the signing secret you need in <code>.env.local</code>.',
              'Command, sub-command, then the forwarding flag and target.')
          ]
        }
      ]
    }
  ]
};
