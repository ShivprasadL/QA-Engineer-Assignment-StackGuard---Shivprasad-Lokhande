import { test, expect } from '../../../src/fixtures/ui';
import { BACKPACK, BIKE_LIGHT, PRODUCTS } from '../../../src/data/products';

test.describe('Cart (logged in via storageState)', () => {
  test('shows the products that were added, with name, price and quantity 1', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addProducts([BACKPACK.name, BIKE_LIGHT.name]);
    await inventoryPage.openCart();

    await expect(cartPage.pageTitle).toHaveText('Your Cart');
    await cartPage.expectItems([BACKPACK.name, BIKE_LIGHT.name]);
    await expect(cartPage.item(BACKPACK.name).getByTestId('inventory-item-price')).toHaveText(`$${BACKPACK.price}`);
    await expect(cartPage.item(BIKE_LIGHT.name).getByTestId('inventory-item-price')).toHaveText(`$${BIKE_LIGHT.price}`);
    await expect(cartPage.item(BACKPACK.name).getByTestId('item-quantity')).toHaveText('1');
  });

  test('removing one item leaves the others and updates the badge', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addProducts([BACKPACK.name, BIKE_LIGHT.name]);
    await inventoryPage.openCart();

    await cartPage.remove(BACKPACK.name);
    await cartPage.expectItems([BIKE_LIGHT.name]);
    await cartPage.expectCartCount(1);
  });

  test('removing the last item gives an empty cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();

    await cartPage.remove(BACKPACK.name);
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.expectCartCount(0);
  });

  test('a fresh session starts with an empty cart', async ({ cartPage }) => {
    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.expectCartCount(0);
  });

  test('Continue Shopping returns to the list and keeps the cart', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();

    await cartPage.continueShoppingButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.expectCartCount(1);
  });

  test('cart keeps its items after a reload', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProducts(PRODUCTS.slice(0, 3).map((p) => p.name));
    await inventoryPage.openCart();

    await page.reload();
    await cartPage.expectItems(PRODUCTS.slice(0, 3).map((p) => p.name));
  });

  test('Checkout button opens the information step when the cart has items', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();

    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  // BUG-001: Sauce Demo lets you start checkout with an empty cart.
  // Marked test.fail(): it documents the bug and turns red once the bug is fixed.
  test('an empty cart cannot proceed to checkout [BUG-001]', async ({ page, cartPage }) => {
    test.fail(true, 'BUG-001: empty cart can still go to checkout');
    await cartPage.goto();
    await cartPage.checkout();
    await expect(page).not.toHaveURL(/checkout-step-one\.html/);
  });
});
