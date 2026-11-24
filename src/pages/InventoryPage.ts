import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemImages = this.items.locator('img');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }) });
  }

  /** The single Add to cart / Remove button of a product (the image and title links also have role=button). */
  actionButton(name: string): Locator {
    return this.item(name).locator('button');
  }

  async addToCart(name: string) {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async addProducts(names: string[]) {
    for (const name of names) {
      await this.addToCart(name);
    }
  }

  async removeFromCart(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(value: string) {
    await this.sortSelect.selectOption(value);
  }

  async openProduct(name: string) {
    await this.itemNames.filter({ hasText: name }).click();
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async prices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async imageSources(): Promise<(string | null)[]> {
    const count = await this.itemImages.count();
    const sources: (string | null)[] = [];
    for (let i = 0; i < count; i++) {
      sources.push(await this.itemImages.nth(i).getAttribute('src'));
    }
    return sources;
  }
}
