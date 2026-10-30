// Visual snapshots of the screens a first-time player sees. A diff here means
// the screen changed - review the image, then update only if it was intended.
// Baselines come from CI's pinned Playwright image (fonts differ elsewhere):
// take the *-actual.png files from the e2e-report artifact of a CI run.
import { test, expect } from '@playwright/test';
import { TRACKS, nodesOf, openHome, openTrack, openLevel, playStep } from './helpers.js';

// Confetti is random, so it is hidden with a stylesheet. Not a mask: masking a
// full-screen layer paints over the whole page.
const STYLE = new URL('./screenshot.css', import.meta.url).pathname;
// Answers smooth-scroll the feedback into view. Wait for that to finish, then
// pin the page to the top, so the sticky header lands in the same place.
async function settle(page) {
  await expect.poll(async () => {
    const a = await page.evaluate(() => scrollY);
    await page.waitForTimeout(120);
    return a === (await page.evaluate(() => scrollY));
  }).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
const shot = async (page, name) => {
  await settle(page);
  // Soft: a mismatch still fails the test, but every later screenshot in the
  // test is still taken, so one run shows every changed screen.
  await expect.soft(page).toHaveScreenshot(name, { fullPage: true, stylePath: STYLE });
};

test('home', async ({ page }) => {
  await openHome(page);
  await shot(page, 'home.png');
});

test('level map - Git & GitHub', async ({ page }) => {
  await openHome(page);
  await openTrack(page, TRACKS.find(t => t.id === 'github'));
  await shot(page, 'level-map-github.png');
});

test('lesson, quiz feedback and level cleared - first Git level', async ({ page }) => {
  const tr = TRACKS.find(t => t.id === 'github');
  const node = nodesOf(tr)[0];
  await openHome(page);
  await openLevel(page, tr, node);
  await shot(page, 'lesson.png');
  const quizAt = node.steps.findIndex(s => s.t === 'quiz');
  for (const s of node.steps.slice(0, quizAt)) await playStep(page, s);
  await page.locator('#stage .choice').nth(node.steps[quizAt].a).click();
  await expect(page.locator('#stage .feedback.good')).toBeVisible();
  await shot(page, 'quiz-right.png');
  await page.locator('#stage .cta .btn').click();
  for (const s of node.steps.slice(quizAt + 1)) await playStep(page, s);
  await expect(page.locator('#stage .complete')).toBeVisible();
  await shot(page, 'level-cleared.png');
});
