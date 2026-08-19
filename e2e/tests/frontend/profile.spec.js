const { test, expect } = require('@playwright/test');

test.describe('Profile & Authenticated Flows', () => {
  // Assuming the app has a way to bypass login or we test the unauthenticated state
  test('should redirect unauthenticated users from profile', async ({ page }) => {
    await page.goto('/profile');
    // Expect redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('should redirect unauthenticated users from my-queries', async ({ page }) => {
    await page.goto('/my-queries');
    // Expect redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
