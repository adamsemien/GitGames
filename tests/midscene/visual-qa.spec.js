// Plain-English visual QA over the screens a first-time player sees.
// The deterministic sweep in tests/e2e catches clipped text and leaked values
// it can measure. This pass asks a vision model about what a person would
// notice and a measurement would not: overlap, unreadable contrast, copy that
// reads like nonsense.
import { test as base, expect } from '@playwright/test';
import { PlaywrightAiFixture } from '@midscene/web/playwright';
import { TRACKS, nodesOf, openHome, openTrack, openLevel, playStep } from '../e2e/helpers.js';

const test = base.extend(PlaywrightAiFixture({ waitForNetworkIdleTimeout: 2000 }));

test.skip(!process.env.MIDSCENE_MODEL_API_KEY, 'Midscene needs MIDSCENE_MODEL_API_KEY (see playwright.midscene.config.js)');

const CHECKS = [
  'Every piece of text on the screen is fully visible: nothing is cut off, truncated with an ellipsis, or hidden behind another element.',
  'No two elements overlap in a way that hides text, an icon or a button.',
  'There is no placeholder or broken text, such as "lorem ipsum", "undefined", "NaN", "TODO", "[object Object]" or template code like ${...}.',
  'All button labels are readable against their background.',
];

async function assertScreen(aiAssert, page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  for (const c of CHECKS) await aiAssert(c);
}

test('home', async ({ page, aiAssert }) => {
  await openHome(page);
  await assertScreen(aiAssert, page);
});

test('level map and first lesson - Git & GitHub', async ({ page, aiAssert }) => {
  const tr = TRACKS.find(t => t.id === 'github');
  await openHome(page);
  await openTrack(page, tr);
  await assertScreen(aiAssert, page);
  await page.locator('#chapter-list .node').first().click();
  await assertScreen(aiAssert, page);
});

test('quiz feedback and level cleared', async ({ page, aiAssert }) => {
  const tr = TRACKS.find(t => t.id === 'github');
  const node = nodesOf(tr)[0];
  await openHome(page);
  await openLevel(page, tr, node);
  const quizAt = node.steps.findIndex(s => s.t === 'quiz');
  for (const s of node.steps.slice(0, quizAt)) await playStep(page, s);
  await page.locator('#stage .choice').nth(node.steps[quizAt].a).click();
  await expect(page.locator('#stage .feedback.good')).toBeVisible();
  await assertScreen(aiAssert, page);
  await page.locator('#stage .cta .btn').click();
  for (const s of node.steps.slice(quizAt + 1)) await playStep(page, s);
  await assertScreen(aiAssert, page);
});

test('a Simulate game mid-play', async ({ page, aiAssert }) => {
  const tr = TRACKS.find(t => t.id === 'systems');
  const node = nodesOf(tr)[0];
  await openHome(page);
  await openLevel(page, tr, node);
  for (const s of node.steps.filter(s => s.t === 'lesson')) await playStep(page, s);
  await page.locator('#stage .sim-act').first().click();
  await assertScreen(aiAssert, page);
});
