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
   ============================================================ */
import { github } from './github.js';
import { claudeCode } from './claude-code.js';
import { ghostty } from './ghostty.js';
import { codex } from './codex.js';
import { vibe } from './vibe.js';

export const TRACKS = [github, claudeCode, ghostty, codex, vibe];
