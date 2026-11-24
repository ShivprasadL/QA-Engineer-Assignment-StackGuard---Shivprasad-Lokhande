import { test, expect } from '../../../src/fixtures/ui';
import { BACKPACK, BIKE_LIGHT, PRODUCTS, SORT_OPTIONS } from '../../../src/data/products';

test.describe('Inventory (logged in via storageState)', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test.describe('catalogue', () => {
    test('lists all six products', async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(PRODUCTS.length);
      expect((await inventoryPage.names()).sort()).toEqual(PRODUCTS.map((p) => p.name).sort());
    });

    for (const product of PRODUCTS) {
      test(`shows the right price for ${product.name}`, async ({ inventoryPage }) => {
        await expect(inventoryPage.item(product.name).getByTestId('inventory-item-price')).toHaveText(
          `$${product.price}`,
        );
      });
    }

    test('every product has its own image', async ({ inventoryPage }) => {
      const sources = await inventoryPage.imageSources();
      expect(sources).toHaveLength(PRODUCTS.length);
      expect(new Set(sources).size).toBe(PRODUCTS.length);
    });
  });

  test.describe('sorting', () => {
    for (const option of SORT_OPTIONS) {
      test(`sorts by ${option.label}`, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option.value);
        const actual = option.by === 'name' ? await inventoryPage.names() : await inventoryPage.prices();
        expect(actual).toEqual(option.expected());
      });
    }
  });

  test.describe('add and remove', () => {
    test('adding a product updates the badge and the button', async ({ inventoryPage }) => {
      await inventoryPage.addToCart(BACKPACK.name);
      await inventoryPage.expectCartCount(1);
      await expect(inventoryPage.actionButton(BACKPACK.name)).toHaveText('Remove');
    });

    test('adding several products counts them all', async ({ inventoryPage }) => {
      await inventoryPage.addProducts(PRODUCTS.slice(0, 3).map((p) => p.name));
      await inventoryPage.expectCartCount(3);
    });

    test('removing a product clears the badge and restores the button', async ({ inventoryPage }) => {
      await inventoryPage.addToCart(BIKE_LIGHT.name);
      await inventoryPage.removeFromCart(BIKE_LIGHT.name);
      await inventoryPage.expectCartCount(0);
      await expect(inventoryPage.actionButton(BIKE_LIGHT.name)).toHaveText('Add to cart');
    });

    test('cart contents survive a page reload', async ({ page, inventoryPage }) => {
      await inventoryPage.addToCart(BACKPACK.name);
      await page.reload();
      await inventoryPage.expectCartCount(1);
      await expect(inventoryPage.actionButton(BACKPACK.name)).toHaveText('Remove');
    });

    test('Reset App State empties the cart badge', async ({ inventoryPage }) => {
      await inventoryPage.addProducts([BACKPACK.name, BIKE_LIGHT.name]);
      await inventoryPage.expectCartCount(2);
      await inventoryPage.resetAppState();
      await inventoryPage.expectCartCount(0);
    });
  });

  test.describe('product detail', () => {
    test('opens the detail page with the right name and price', async ({
      inventoryPage,
      productPage,
    }) => {
      await inventoryPage.openProduct(BACKPACK.name);
      await productPage.expectProduct(BACKPACK.name, BACKPACK.price);
    });

    test('Back to products returns to the list', async ({ page, inventoryPage, productPage }) => {
      await inventoryPage.openProduct(BIKE_LIGHT.name);
      await productPage.backButton.click();
      await expect(page).toHaveURL(/inventory\.html/);
      await inventoryPage.expectLoaded();
    });
  });
});
