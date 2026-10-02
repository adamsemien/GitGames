/* ============================================================
   TRACK REGISTRY
   To add a track: create ./my-track.js exporting a track object,
   import it here, add it to the array. Nothing else changes.

   Track shape:
   { id, name, emoji, glow, time, desc,
     chapters: [ { title, desc, nodes: [ { id, name, ico, steps: [...] } ] } ] }

   Step shapes:
   { t:'lesson', title, body:[ {p}|{h}|{ul}|{term}|{svg}|{call:{k,t,p}} ], cta? }
   { t:'quiz',   q, choices:[...], a:<index>, why }
   { t:'build',  brief, answer:[tokens], chips:[decoys], why, hint?, hint2? }
   { t:'keys',   goal, line, cursor?, target:{line,cursor?}, par, keys:[labels], reveal, why, hint? }
   { t:'sim',    title, brief, turns, init(), actions, step(), view(), score(), over()?,
                 debrief:{bad,mid,good}, recognise:{q,choices,odd,right,wrong} }  - see data/systems.js

   Node ids must be unique across ALL tracks — they key saved progress.
   ============================================================ */
import { systems } from './systems.js';
import { terminal } from './terminal.js';
import { ground } from './ground.js';
import { github } from './github.js';
import { claudeCode } from './claude-code.js';
import { ghostty } from './ghostty.js';
import { codex } from './codex.js';
import { vibe } from './vibe.js';
import { apis } from './apis.js';
import { tooling } from './tooling.js';
import { harness } from './harness.js';
import { debugging } from './debugging.js';
import { safely } from './safely.js';

export const TRACKS = [systems, terminal, github, ground, apis, tooling, harness, claudeCode, codex, ghostty, vibe, debugging, safely];
