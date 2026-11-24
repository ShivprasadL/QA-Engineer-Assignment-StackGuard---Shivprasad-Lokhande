import { test, expect } from '../../../src/fixtures/ui';
import { AUTH_FILES } from '../../../src/config/auth-files';
import { PRODUCTS } from '../../../src/data/products';
import { VALID_INFO } from '../../../src/data/checkout';

/**
 * Bugs found on the problem_user account (see docs/BUG_REPORTS.md).
 * Each test asserts the CORRECT behaviour and is marked test.fail(), so:
 *   - the suite stays green while the bug exists,
 *   - the test turns red the day the bug is fixed (remove test.fail() then).
 */
test.use({ storageState: AUTH_FILES.problem });

test.describe('Known bugs: problem_user', () => {
  test('BUG-002: every product shows its own image', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-002: all product images are the same');
    await inventoryPage.goto();
    const sources = await inventoryPage.imageSources();
    expect(new Set(sources).size).toBe(PRODUCTS.length);
  });

  test('BUG-003: checkout form keeps what the user typed', async ({ page, checkoutPage }) => {
    test.fail(true, 'BUG-003: last name typing overwrites first name');
    await checkoutPage.gotoStepOne();
    await checkoutPage.fillInfo(VALID_INFO);
    await expect(checkoutPage.firstName).toHaveValue(VALID_INFO.firstName);
    await expect(checkoutPage.lastName).toHaveValue(VALID_INFO.lastName);
    await expect(checkoutPage.postalCode).toHaveValue(VALID_INFO.postalCode);
    await checkoutPage.continueButton.click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('BUG-004: sorting Z to A reverses the list', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-004: sort dropdown does not sort for problem_user');
    await inventoryPage.goto();
    await inventoryPage.sortBy('za');
    const expected = PRODUCTS.map((p) => p.name).sort((a, b) => b.localeCompare(a));
    expect(await inventoryPage.names()).toEqual(expected);
  });
});
