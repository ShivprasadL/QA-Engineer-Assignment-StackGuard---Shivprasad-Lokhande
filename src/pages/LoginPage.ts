import { Locator, Page, expect } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  readonly errorDismiss: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.errorDismiss = page.getByTestId('error-button');
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string) {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  async expectOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).not.toHaveURL(/inventory\.html/);
  }
}
