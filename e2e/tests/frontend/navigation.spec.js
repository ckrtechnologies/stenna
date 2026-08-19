const { test, expect } = require('@playwright/test');

test.describe('Frontend Navigation & Static Pages', () => {
  test('should load the homepage and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Stenna/);
    // Usually there is a hero section, checking if the main element exists
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Contact');
    await expect(page).toHaveURL(/.*\/contact/);
    await expect(page.locator('form.minimal-contact-form')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Try It On page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try It On');
    // Try It On is protected, so unauthenticated users should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
