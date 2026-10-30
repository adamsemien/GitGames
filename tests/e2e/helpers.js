// Shared helpers for the GitGames golden-path tests.
// Content comes from the same data files the app imports, so a test plays a
// level the way a player who knows the answers would - no hardcoded copy.
import { expect } from '@playwright/test';
import { TRACKS } from '../../data/tracks.js';

export { TRACKS };

export const nodesOf = tr => tr.chapters.flatMap(c => c.nodes);

/** Fail the test on any uncaught page error or console error. */
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  return errors;
}

export async function openHome(page) {
  await page.goto('/');
  await expect(page.locator('#track-list .track-card')).toHaveCount(TRACKS.length);
}

export async function openTrack(page, tr) {
  await page.locator('#track-list .track-card')
    .filter({ has: page.locator('.tc-name', { hasText: new RegExp(`^${tr.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) })
    .click();
  await expect(page.locator('#lv-track-name')).toHaveText(tr.name);
}

export async function openLevel(page, tr, node) {
  await openTrack(page, tr);
  await page.locator('#chapter-list .node', { hasText: node.name }).first().click();
  await expect(page.locator('#play-title')).toHaveText(node.name);
}

const next = page => page.locator('#stage .cta .btn').first();

/** Answer one step correctly. */
export async function playStep(page, s) {
  const stage = page.locator('#stage');
  if (s.t === 'lesson') {
    await next(page).click();
    return;
  }
  if (s.t === 'quiz') {
    await stage.locator('.choice').nth(s.a).click();
    await expect(stage.locator('.feedback.good')).toBeVisible();
    await next(page).click();
    return;
  }
  if (s.t === 'build') {
    const input = stage.locator('.cmdinput');
    await input.fill(s.answer.join(' '));
    await input.press('Enter');
    await expect(stage.locator('.feedback.good')).toBeVisible();
    await next(page).click();
    return;
  }
  if (s.t === 'sim') {
    // Play the first action every turn; the score band does not matter here,
    // only that the game runs to the end and hands over to the recognise check.
    for (let t = 0; t < s.turns && !(await stage.locator('.sim-after').count()); t++) {
      await stage.locator('.sim-act').first().click();
    }
    await expect(stage.locator('.sim-after').first()).toBeVisible();
    await stage.locator('.sim-after .choice').nth(s.recognise.odd).click();
    await expect(stage.locator('.feedback.good')).toBeVisible();
    await next(page).click();
    return;
  }
  throw new Error('playStep: no driver for step type ' + s.t);
}

export async function playLevel(page, tr, node) {
  await openLevel(page, tr, node);
  for (const s of node.steps) await playStep(page, s);
  await expect(page.locator('#stage .complete h2')).toHaveText(/Level cleared|Track complete!/);
}

/** Text that is cut off, spills past its box, or forces sideways scrolling. */
export async function clippedText(page) {
  return page.evaluate(() => {
    const out = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1)
      out.push(`page scrolls sideways: ${document.documentElement.scrollWidth}px content in ${vw}px`);
    const sel = 'button, h1, h2, h3, p, li, .pill, .stat b, .stat span, .tc-name, .n-lbl, .kicker, .callout';
    for (const el of document.querySelectorAll('.screen.active ' + sel.split(', ').join(', .screen.active '))) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      const label = (el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase()) +
        ' "' + el.textContent.trim().replace(/\s+/g, ' ').slice(0, 50) + '"';
      if (r.right > vw + 1 || r.left < -1) out.push(`${label} runs off screen (${Math.round(r.left)}-${Math.round(r.right)} of ${vw})`);
      else if (cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis') {
        if (el.scrollWidth > el.clientWidth + 1) out.push(`${label} is cut off (${el.scrollWidth}px in ${el.clientWidth}px)`);
      }
    }
    return [...new Set(out)];
  });
}

/** Values that leaked from a JS bug into visible copy. Code blocks are allowed to say "undefined". */
export async function brokenRenders(page) {
  return page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.querySelector('.screen.active') || document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      if (n.parentElement.closest('code, pre, kbd, .termbox, .gl-cmd, .diagram, script, style')) continue;
      const LEAK = /\bundefined\b|\bNaN\b|\[object Object\]|\$\{[^}]*\}/;
      const m = n.nodeValue.match(LEAK);
      if (!m) continue;
      // Lessons quote real error messages ("undefined is not a function"). A quote
      // can open in a neighbouring text node, so judge the whole paragraph.
      const block = n.parentElement.closest('p, li, h1, h2, h3, button, .callout, .feedback') || n.parentElement;
      const t = [...block.childNodes].map(function prose(c) {
        if (c.nodeType === 3) return c.nodeValue;
        if (c.nodeType !== 1 || c.matches('code, pre, kbd, .termbox, .gl-cmd')) return ' ';
        return [...c.childNodes].map(prose).join('');
      }).join('');
      const quoted = i => (t.slice(0, i).match(/["\u201c\u201d]/g) || []).length % 2 === 1;
      if ([...t.matchAll(new RegExp(LEAK.source, 'g'))].every(x => quoted(x.index))) continue;
      out.push(`"${m[0]}" in: ${n.nodeValue.trim().slice(0, 80)}`);
    }
    return out;
  });
}
