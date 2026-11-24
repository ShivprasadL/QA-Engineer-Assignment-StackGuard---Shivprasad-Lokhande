import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  readonly name: Locator;
  readonly price: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.backButton = page.getByTestId('back-to-products');
  }

  async expectProduct(name: string, price: number) {
    await expect(this.page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(this.name).toHaveText(name);
    await expect(this.price).toHaveText(`$${price}`);
  }
}
