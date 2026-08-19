const { test, expect } = require('@playwright/test');
const { registerAndLoginUser } = require('./utils/auth');

test.describe('Try It On Flow', () => {
  test('should log in, view Try It On history, and navigate to visualizer flow', async ({ page }) => {
    // 1. Create a fresh user and log in to ensure it always succeeds
    await registerAndLoginUser(page);

    // 2. Navigate to Try It On page (Visualizer History)
    await page.goto('/try-it-on');
    
    // 3. Verify it loaded the authenticated history page
    await expect(page.locator('h2', { hasText: 'AI Room Visualizer' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Recent Transformations')).toBeVisible();

    // 4. Click Explore Catalog to find a wallpaper to try on
    await page.click('text=EXPLORE CATALOG');
    await page.waitForURL('**/catalog*');

    // 5. Click the first wallpaper
    const firstWallpaper = page.locator('.zara-product-card').first();
    await expect(firstWallpaper).toBeVisible({ timeout: 10000 });
    await firstWallpaper.click();

    // 6. Wait for Wallpaper Detail page
    await expect(page.locator('button', { hasText: 'SEE IT IN MY ROOM' }).or(page.locator('button', { hasText: 'TRY IT ON' }))).toBeVisible({ timeout: 10000 });
    
    // We don't actually upload a file in the E2E test to avoid spamming the AI API,
    // but we ensure the authenticated user can access the entry point.
  });
});
