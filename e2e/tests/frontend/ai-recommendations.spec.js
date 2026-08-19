const { test, expect } = require('@playwright/test');
const { registerAndLoginUser } = require('./utils/auth');

test.describe('AI Recommendations Flow', () => {
  test('should log in, take the AI questionnaire, and see recommendations', async ({ page }) => {
    // 1. Create a fresh user and log in to ensure it always succeeds
    await registerAndLoginUser(page);

    // 2. Navigate to AI Recommendations
    await page.goto('/ai-recommendations');
    
    // 3. Wait for the quiz to appear
    await expect(page.locator('h2', { hasText: 'The AI Designer' })).toBeVisible({ timeout: 10000 });

    // 4. Click through the 5 steps
    // The component has 5 questions, so we just click the first option 5 times.
    for (let i = 0; i < 5; i++) {
        const optionBtn = page.locator('.zara-option-btn').first();
        await expect(optionBtn).toBeVisible();
        await optionBtn.click();
        await page.waitForTimeout(500); // Wait for transition
    }

    // 5. Verify the results page loads
    // After 5 steps, it fetches recommendations and shows 'Your Curated Selection'
    await expect(page.locator('h2', { hasText: 'Your Curated Selection' })).toBeVisible({ timeout: 15000 });
    
    // Verify some product cards are rendered
    const productCards = page.locator('.zara-product-card');
    await expect(productCards.first()).toBeVisible();
    
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
