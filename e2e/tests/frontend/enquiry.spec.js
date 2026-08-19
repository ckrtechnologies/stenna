const { test, expect } = require('@playwright/test');

test.describe('Enquiry Flow', () => {
  test('should open enquiry modal and submit', async ({ page }) => {
    await page.goto('/catalog');
    
    // Click on a product to go to detail page
    const firstProduct = page.locator('a[href^="/wallpaper/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/.*\/wallpaper\/.+/);
    
    // Open Enquiry Modal
    const enquireBtn = page.locator('text=Enquire').or(page.locator('button:has-text("ENQUIRE")')).first();
    await enquireBtn.click();
    
    // Wait for modal to appear
    const modal = page.locator('.modal-overlay').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Fill out form
    const nameInput = modal.locator('input[name="name"], input[placeholder*="Name"]');
    if (await nameInput.count() > 0) await nameInput.fill('Test User');
    
    const emailInput = modal.locator('input[name="email"], input[type="email"]');
    if (await emailInput.count() > 0) await emailInput.fill('test@example.com');
    
    const phoneInput = modal.locator('input[name="phone"], input[type="tel"]');
    if (await phoneInput.count() > 0) await phoneInput.fill('1234567890');
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    }
  });
});
