import { defineConfig, devices } from '@playwright/test';
import { API_BASE_URL, UI_BASE_URL } from './src/config/env';
import { AUTH_FILES } from './src/config/auth-files';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Both sites are public and shared, so stay polite on CI.
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['list'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    // Sauce Demo uses data-test attributes, so getByTestId() maps to them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      // Logs in once per user and saves the session (storageState).
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },
    {
      // Tests that must start logged out (login form, route protection).
      name: 'ui-anonymous',
      testMatch: /ui[\\/]anonymous[\\/].*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },
    {
      // Tests that start already logged in as standard_user via storageState.
      name: 'ui-authenticated',
      testMatch: /ui[\\/]authenticated[\\/].*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        storageState: AUTH_FILES.standard,
      },
    },
    {
      name: 'api',
      testMatch: /api[\\/].*\.spec\.ts/,
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
