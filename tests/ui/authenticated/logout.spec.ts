import { test, expect } from '../../../src/fixtures/ui';
import { LOGIN_ERRORS } from '../../../src/data/messages';
import { USERS } from '../../../src/data/users';

test.describe('Logout and side menu (logged in via storageState)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  for (const link of ['All Items', 'About', 'Logout', 'Reset App State']) {
    test(`the side menu offers "${link}"`, async ({ inventoryPage }) => {
      await inventoryPage.openMenu();
      await expect(inventoryPage.menuLinks.filter({ hasText: link })).toBeVisible();
    });
  }

  test('the side menu can be closed', async ({ inventoryPage }) => {
    await inventoryPage.openMenu();
    await inventoryPage.closeMenuButton.click();
    await expect(inventoryPage.logoutLink).toBeHidden();
  });

  test('Logout returns to the login page', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.logout();
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.username).toBeEmpty();
  });

  test('after logout the product page is protected again', async ({ inventoryPage, loginPage }) => {
    await inventoryPage.logout();
    await loginPage.goto('/inventory.html');
    await loginPage.expectError(LOGIN_ERRORS.notLoggedIn('/inventory.html'));
    await loginPage.expectOnLoginPage();
  });

  test('a different user can log in right after logging out', async ({
    page,
    inventoryPage,
    loginPage,
  }) => {
    await inventoryPage.logout();
    await loginPage.login(USERS.visual.username, USERS.visual.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectLoaded();
  });
});
