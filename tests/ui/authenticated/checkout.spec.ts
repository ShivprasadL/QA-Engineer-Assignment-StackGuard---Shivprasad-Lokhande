import { test, expect } from '../../../src/fixtures/ui';
import { BACKPACK, BIKE_LIGHT, PRODUCTS, calcTotals } from '../../../src/data/products';
import { CART_SIZES, EDGE_INPUT_CASES, MISSING_FIELD_CASES, VALID_INFO } from '../../../src/data/checkout';

test.describe('Checkout (logged in via storageState)', () => {
  test.describe('step one: your information', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(BACKPACK.name);
      await inventoryPage.openCart();
      await cartPage.checkout();
    });

    test('valid details move on to the overview', async ({ checkoutPage }) => {
      await checkoutPage.submitInfo(VALID_INFO);
      await checkoutPage.expectOverview();
    });

    for (const c of MISSING_FIELD_CASES) {
      test(`blocks progress: ${c.name}`, async ({ page, checkoutPage }) => {
        await checkoutPage.submitInfo(c.info);
        await expect(checkoutPage.error).toHaveText(c.error);
        await expect(page).toHaveURL(/checkout-step-one\.html/);
      });
    }

    for (const c of EDGE_INPUT_CASES) {
      test(`accepts legitimate edge input: ${c.name}`, async ({ checkoutPage }) => {
        await checkoutPage.submitInfo(c.info);
        await checkoutPage.expectOverview();
      });
    }

    test('Cancel goes back to the cart and keeps the item', async ({ page, cartPage, checkoutPage }) => {
      await checkoutPage.fillInfo(VALID_INFO);
      await checkoutPage.cancelButton.click();
      await expect(page).toHaveURL(/cart\.html/);
      await cartPage.expectItems([BACKPACK.name]);
    });
  });

  test.describe('step two: overview and totals', () => {
    for (const size of CART_SIZES) {
      const chosen = PRODUCTS.slice(0, size);
      test(`item total, 8% tax and total are correct for ${size} item(s)`, async ({
        inventoryPage,
        cartPage,
        checkoutPage,
      }) => {
        await inventoryPage.goto();
        await inventoryPage.addProducts(chosen.map((p) => p.name));
        await inventoryPage.openCart();
        await cartPage.checkout();
        await checkoutPage.submitInfo(VALID_INFO);

        await checkoutPage.expectOverview();
        await expect(checkoutPage.overviewItems).toHaveCount(size);
        await checkoutPage.expectTotals(calcTotals(chosen));
      });
    }

    test('an item removed from the cart is not in the overview', async ({
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await inventoryPage.goto();
      await inventoryPage.addProducts([BACKPACK.name, BIKE_LIGHT.name]);
      await inventoryPage.openCart();
      await cartPage.remove(BACKPACK.name);
      await cartPage.checkout();
      await checkoutPage.submitInfo(VALID_INFO);

      await expect(checkoutPage.overviewItems).toHaveCount(1);
      await expect(checkoutPage.overviewItems.first()).toContainText(BIKE_LIGHT.name);
      await checkoutPage.expectTotals(calcTotals([BIKE_LIGHT]));
    });

    test('Cancel on the overview returns to the product list', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(BACKPACK.name);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutPage.submitInfo(VALID_INFO);

      await checkoutPage.cancelButton.click();
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test.describe('step three: complete', () => {
    test('full purchase shows the confirmation and empties the cart', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await inventoryPage.goto();
      await inventoryPage.addProducts([BACKPACK.name, BIKE_LIGHT.name]);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutPage.submitInfo(VALID_INFO);
      await checkoutPage.expectOverview();
      await checkoutPage.finishButton.click();

      await checkoutPage.expectComplete();
      await expect(checkoutPage.completeText).toContainText('dispatched');
      await checkoutPage.expectCartCount(0);

      await checkoutPage.backHomeButton.click();
      await expect(page).toHaveURL(/inventory\.html/);
      await inventoryPage.expectCartCount(0);
    });
  });
});
