const { test, expect } = require('@playwright/test');

test.describe('Registration Flow', () => {
  test('should successfully register a new user and redirect to catalog', async ({ page }) => {
    // Generate a unique email for each run
    const uniqueId = Date.now();
    const email = `testuser_${uniqueId}@example.com`;
    const password = 'Password123!';

    // Navigate to signup page
    await page.goto('/signup');

    // Wait for the signup form to be visible
    await expect(page.locator('h2', { hasText: 'Create Account' })).toBeVisible();

    // Fill out the registration form (assuming standard Name, Email, Password fields)
    // If there is a Name field, fill it. Let's check for it.
    const nameInput = page.locator('input[type="text"][placeholder*="Name" i]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('E2E Test User');
    }

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Submit the form
    await page.click('button[type="submit"]');

    // It should redirect to login upon successful registration
    await page.waitForURL('**/login*', { timeout: 10000 });
    
    expect(page.url()).toContain('/login');
  });
});
