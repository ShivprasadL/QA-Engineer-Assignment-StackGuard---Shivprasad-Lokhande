import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutInfo } from '../data/checkout';

/** Covers the three checkout screens: your information, overview, complete. */
export class CheckoutPage extends BasePage {
  // step one
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  // step two
  readonly overviewItems: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.overviewItems = page.locator('.cart_item');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async gotoStepOne() {
    await this.page.goto('/checkout-step-one.html');
    await expect(this.pageTitle).toHaveText('Checkout: Your Information');
  }

  async fillInfo(info: CheckoutInfo) {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
  }

  async submitInfo(info: CheckoutInfo) {
    await this.fillInfo(info);
    await this.continueButton.click();
  }

  async expectOverview() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Overview');
  }

  async expectTotals(totals: { subtotal: string; tax: string; total: string }) {
    await expect(this.subtotal).toHaveText(`Item total: $${totals.subtotal}`);
    await expect(this.tax).toHaveText(`Tax: $${totals.tax}`);
    await expect(this.total).toHaveText(`Total: $${totals.total}`);
  }

  async expectComplete() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Complete!');
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
