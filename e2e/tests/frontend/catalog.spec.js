const { test, expect } = require('@playwright/test');

test.describe('Frontend Catalog Flow', () => {
  test('should navigate to catalog and see items', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    
    // 2. Click on the Catalog link
    await page.click('text=Catalog');
    
    // 3. Verify URL changes to /catalog
    await expect(page).toHaveURL(/.*\/catalog/);
    
    // 4. Wait for products to load and be visible
    // Wait for the container first
    await expect(page.locator('.zara-product-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('should filter catalog by category', async ({ page }) => {
    await page.goto('/catalog');
    
    // Wait for sidebar categories to load
    const categoryBtn = page.locator('.zara-sidebar-item').nth(1); // the first actual category after 'All'
    await expect(categoryBtn).toBeVisible({ timeout: 10000 });
    
    // Click category
    await categoryBtn.click();
    
    // Wait for catalog to update
    await expect(page.locator('.zara-product-card').first()).toBeVisible({ timeout: 15000 });
  });
});
