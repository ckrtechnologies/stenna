const { test, expect } = require('@playwright/test');

test.describe('Product Detail & Actions', () => {
  test('should load product page and display details', async ({ page }) => {
    // Navigate to a known product or catalog first
    await page.goto('/catalog');
    
    // Click on the first product link
    const firstProduct = page.locator('.alt-image-box a').first();
    // Use fallback if class is different
    if (await firstProduct.count() === 0) {
      await page.locator('a[href^="/wallpaper/"]').first().click();
    } else {
      await firstProduct.click();
    }
    
    await expect(page).toHaveURL(/.*\/wallpaper\/.+/);
    // Verify title or some text is visible
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    // Verify Enquire button exists
    await expect(page.locator('text=Enquire').or(page.locator('button:has-text("ENQUIRE")')).first()).toBeVisible();
  });

  test.skip('should handle wishlist toggle unauthenticated', async ({ page }) => {
    await page.goto('/catalog');
    // Try to click wishlist button (usually a heart icon)
    const heartBtn = page.locator('button.wishlist-btn, .heart-icon, button:has(svg)').first();
    if (await heartBtn.count() > 0) {
      await heartBtn.click();
      // Should redirect to login or show error
      await expect(page.locator('text=Login').or(page.locator('text=sign in'))).toBeVisible({ timeout: 5000 });
    }
  });
});
