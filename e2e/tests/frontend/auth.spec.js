const { test, expect } = require('@playwright/test');

test.describe('Frontend Auth Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Looks for typical error messages or toast notifications
    await expect(page.locator('text=Invalid').or(page.locator('.text-red-500'))).toBeVisible({ timeout: 5000 });
  });
});
