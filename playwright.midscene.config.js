// Midscene AI assertion pass. On demand / nightly only - every assertion is a
// call to a vision model, so it costs money and never runs per commit.
//
// Needs, as environment variables (GitHub Actions secrets in CI, never typed
// into a command): MIDSCENE_MODEL_API_KEY, MIDSCENE_MODEL_NAME,
// MIDSCENE_MODEL_FAMILY, and MIDSCENE_MODEL_BASE_URL if the provider needs one.
// Midscene 1.17 supports gemini, gpt-5 / gpt-6, qwen and glm-v vision families.
// Without a key every test skips.
import base from './playwright.config.js';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...base,
  testDir: 'tests/midscene',
  timeout: 120_000,
  retries: 0,
  reporter: [['list'], ['@midscene/web/playwright-reporter', { type: 'merged' }]],
  projects: base.projects.filter(p => p.name === 'phone'),
});
