import { test, expect } from '../../../src/fixtures/ui';
import { LOGIN_ALLOWED_USERS, USERS } from '../../../src/data/users';
import { LOGIN_ERRORS, PROTECTED_PATHS } from '../../../src/data/messages';

const INVALID_LOGINS = [
  { name: 'wrong password', username: 'standard_user', password: 'wrong_password' },
  { name: 'unknown username', username: 'not_a_user', password: 'secret_sauce' },
  { name: 'username is case-sensitive', username: 'STANDARD_USER', password: 'secret_sauce' },
  { name: 'password is case-sensitive', username: 'standard_user', password: 'SECRET_SAUCE' },
  { name: 'leading space in username', username: ' standard_user', password: 'secret_sauce' },
  { name: 'trailing space in password', username: 'standard_user', password: 'secret_sauce ' },
  { name: 'SQL-injection style input', username: "' OR 1=1 --", password: 'x' },
  { name: 'very long username (300 chars)', username: 'a'.repeat(300), password: 'secret_sauce' },
];

const MISSING_FIELDS = [
  { name: 'both fields empty', username: '', password: '', error: LOGIN_ERRORS.usernameRequired },
  { name: 'password empty', username: 'standard_user', password: '', error: LOGIN_ERRORS.passwordRequired },
  { name: 'username empty', username: '', password: 'secret_sauce', error: LOGIN_ERRORS.usernameRequired },
];

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.describe('positive', () => {
    for (const user of LOGIN_ALLOWED_USERS) {
      test(`${user.username} can log in and lands on the product list`, async ({
        page,
        loginPage,
        inventoryPage,
      }) => {
        await loginPage.login(user.username, user.password);
        // performance_glitch_user is deliberately slow
        await expect(page).toHaveURL(/inventory\.html/, { timeout: 20_000 });
        await inventoryPage.expectLoaded();
        await expect(inventoryPage.items).toHaveCount(6);
      });
    }

    test('pressing Enter in the password field submits the form', async ({
      page,
      loginPage,
    }) => {
      await loginPage.username.fill(USERS.standard.username);
      await loginPage.password.fill(USERS.standard.password);
      await loginPage.password.press('Enter');
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test.describe('negative', () => {
    for (const c of INVALID_LOGINS) {
      test(`rejects invalid credentials: ${c.name}`, async ({ loginPage }) => {
        await loginPage.login(c.username, c.password);
        await loginPage.expectError(LOGIN_ERRORS.mismatch);
        await loginPage.expectOnLoginPage();
      });
    }

    for (const c of MISSING_FIELDS) {
      test(`shows a required-field error: ${c.name}`, async ({ loginPage }) => {
        await loginPage.login(c.username, c.password);
        await loginPage.expectError(c.error);
        await loginPage.expectOnLoginPage();
      });
    }

    test('locked-out user is blocked with a clear message', async ({ loginPage }) => {
      await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
      await loginPage.expectError(LOGIN_ERRORS.lockedOut);
      await loginPage.expectOnLoginPage();
    });
  });

  test.describe('edge cases', () => {
    test('the password field masks what is typed', async ({ loginPage }) => {
      await expect(loginPage.password).toHaveAttribute('type', 'password');
    });

    test('error message can be dismissed', async ({ loginPage }) => {
      await loginPage.login('', '');
      await expect(loginPage.error).toBeVisible();
      await loginPage.errorDismiss.click();
      await expect(loginPage.error).toBeHidden();
    });

    test('a valid login works after a failed attempt', async ({ page, loginPage }) => {
      await loginPage.login(USERS.standard.username, 'wrong');
      await loginPage.expectError(LOGIN_ERRORS.mismatch);
      await loginPage.login(USERS.standard.username, USERS.standard.password);
      await expect(page).toHaveURL(/inventory\.html/);
    });

    for (const path of PROTECTED_PATHS) {
      test(`${path} cannot be opened without logging in`, async ({ loginPage }) => {
        await loginPage.goto(path);
        await loginPage.expectError(LOGIN_ERRORS.notLoggedIn(path));
        await loginPage.expectOnLoginPage();
      });
    }
  });
});
