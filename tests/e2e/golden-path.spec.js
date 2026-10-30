// Golden path: a new player opens the app, plays a level, and the progress sticks.
import { test, expect } from '@playwright/test';
import { TRACKS, nodesOf, watchErrors, openHome, openLevel, playLevel, playStep, clippedText, brokenRenders } from './helpers.js';

const PLAYABLE = new Set(['lesson', 'quiz', 'build', 'sim']);
const firstPlayable = tr => nodesOf(tr).find(n => n.steps.every(s => PLAYABLE.has(s.t)));

test.describe('home', () => {
  test('loads with every track and a clean console', async ({ page }) => {
    const errors = watchErrors(page);
    await openHome(page);
    await expect(page.locator('#stat-xp')).toHaveText('0');
    await expect(page.locator('#stat-done')).toHaveText('0');
    expect(errors).toEqual([]);
  });
});

test.describe('first level of every track, answered correctly', () => {
  for (const tr of TRACKS) {
    const node = firstPlayable(tr);
    test(`${tr.name}: ${node.name}`, async ({ page }) => {
      const errors = watchErrors(page);
      await openHome(page);
      await playLevel(page, tr, node);
      await page.locator('#stage .complete .btn.sec').click();          // Level map
      await expect(page.locator('#lv-track-sub')).toHaveText(new RegExp(`^1 of ${nodesOf(tr).length} levels cleared$`));
      expect(errors).toEqual([]);
    });
  }
});

test('progress survives a reload', async ({ page }) => {
  const tr = TRACKS.find(t => t.id === 'github');
  await openHome(page);
  await playLevel(page, tr, nodesOf(tr)[0]);
  await page.reload();
  await expect(page.locator('#stat-done')).toHaveText('1');
  expect(Number(await page.locator('#stat-xp').textContent())).toBeGreaterThan(0);
});

test('a wrong answer lands on the Review pile', async ({ page }) => {
  const tr = TRACKS.find(t => t.id === 'github');
  const node = nodesOf(tr)[0];
  const quizAt = node.steps.findIndex(s => s.t === 'quiz');
  await openHome(page);
  await openLevel(page, tr, node);
  for (const s of node.steps.slice(0, quizAt)) await playStep(page, s);
  const q = node.steps[quizAt];
  await page.locator('#stage .choice').nth((q.a + 1) % q.choices.length).click();
  await expect(page.locator('#stage .feedback.bad')).toContainText('Not quite');
  await page.locator('#play [data-back="levels"]').click();
  await page.locator('#levels [data-back="home"]').click();
  await expect(page.locator('#review-badge')).toBeVisible();
  await expect(page.locator('#review-sub')).toHaveText('1 question due');
});

test('build accepts tapped tokens as well as typing', async ({ page }) => {
  const tr = TRACKS.find(t => t.id === 'ground');
  const node = nodesOf(tr)[0];
  const at = node.steps.findIndex(s => s.t === 'build');
  await openHome(page);
  await openLevel(page, tr, node);
  for (const s of node.steps.slice(0, at)) await playStep(page, s);
  for (const tok of node.steps[at].answer)
    await page.locator('#stage .chip:not(.used)', { hasText: new RegExp(`^${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click();
  await page.locator('#stage .cta .btn').click();
  await expect(page.locator('#stage .feedback.good')).toBeVisible();
});

test('the hidden toast does not show or swallow taps', async ({ page }) => {
  await openHome(page);
  const r = await page.evaluate(() => {
    const t = document.getElementById('toast').getBoundingClientRect();
    const hit = document.elementFromPoint(innerWidth / 2, innerHeight - 4);
    return { visiblePx: Math.max(0, Math.round(innerHeight - t.top)), blocksTaps: hit && hit.id === 'toast' };
  });
  expect(r).toEqual({ visiblePx: 0, blocksTaps: false });
});

test.describe('nothing is cut off, spills sideways, or renders a JS leak', () => {
  test('home, every level map, the first screen of every first level, and the readers', async ({ page }) => {
    const found = [];
    const check = async label => {
      found.push(...(await clippedText(page)).map(x => `${label}: ` + x));
      found.push(...(await brokenRenders(page)).map(x => `${label}: ` + x));
    };
    await openHome(page);
    await check('home');
    for (const tr of TRACKS) {
      const node = firstPlayable(tr);
      await openLevel(page, tr, node);
      await check(`${tr.id} ${node.id}`);
      await page.locator('#play [data-back="levels"]').click();
      await check(`${tr.id} level map`);
      await page.locator('#levels [data-back="home"]').click();
    }
    for (const btn of ['#btn-glossary', '#btn-cheats', '#btn-sync']) {
      await page.locator(btn).click();
      await check(btn);
      await page.locator('#reader [data-back="home"]').click();
    }
    expect([...new Set(found)]).toEqual([]);
  });
});

// Canaries: the sweep detectors must fire on planted problems, or a clean
// sweep above proves nothing.
test('canary: the sweep detectors catch planted problems', async ({ page }) => {
  await openHome(page);
  await page.evaluate(() => {
    const home = document.querySelector('#home');
    home.insertAdjacentHTML('beforeend',
      '<p id="c1">You have undefined XP</p>' +
      '<p id="c2">Say "undefined is not a function" and <code>undefined</code></p>' +
      '<button id="c3" style="width:60px;overflow:hidden;white-space:nowrap">A label far too long to fit</button>' +
      '<p id="c4" style="width:3000px">wide</p>');
  });
  const leaks = await brokenRenders(page);
  expect(leaks.some(x => x.includes('You have undefined XP'))).toBe(true);
  expect(leaks.some(x => x.includes('is not a function'))).toBe(false);   // quoted and code: allowed
  const clipped = await clippedText(page);
  expect(clipped.some(x => x.includes('A label far too long'))).toBe(true);
  // The app sets overflow-x: hidden, so a too-wide element never makes the page
  // scroll - it gets cut off at the edge instead. The per-element check catches it.
  expect(clipped.some(x => x.includes('"wide" runs off screen'))).toBe(true);
});
