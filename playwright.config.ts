import { defineConfig, devices } from '@playwright/test';

/**
 * Root-level E2E config — separate `e2e/` folder testing the full Docker stack.
 *   frontend: http://localhost:8080 (nginx, docker-compose:31)
 *   backend:  http://localhost:3001 (express, docker-compose:21)
 *
 * Local dev alternative (without Docker): frontend Vite on 5173 — override via
 *   PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // No webServer by default — E2E targets the Docker stack.
  // For local non-Docker runs, uncomment and adjust:
  // webServer: {
  //   command: 'npm run dev --prefix frontend',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 60_000,
  // },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
