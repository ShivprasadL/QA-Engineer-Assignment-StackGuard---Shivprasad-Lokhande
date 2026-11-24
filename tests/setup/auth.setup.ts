import { test as setup, expect } from '@playwright/test';
import { AUTH_FILES } from '../../src/config/auth-files';
import { USERS } from '../../src/data/users';

/**
 * Logs in once per account and saves the browser session (storageState).
 * Authenticated specs reuse the file, so they skip the login form entirely.
 */
const sessions = [
  { label: 'standard_user', user: USERS.standard, file: AUTH_FILES.standard },
  { label: 'problem_user', user: USERS.problem, file: AUTH_FILES.problem },
];

for (const { label, user, file } of sessions) {
  setup(`authenticate as ${label}`, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(user.username);
    await page.getByTestId('password').fill(user.password);
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');

    await page.context().storageState({ path: file });
  });
}
