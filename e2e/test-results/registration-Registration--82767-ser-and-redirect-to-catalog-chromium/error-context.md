# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend/registration.spec.js >> Registration Flow >> should successfully register a new user and redirect to catalog
- Location: tests/frontend/registration.spec.js:4:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/login*" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - main [ref=e4]:
    - generic [ref=e6]:
      - heading "Create Account" [level=2] [ref=e7]
      - generic [ref=e8]: Error sending confirmation email
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Email Address
          - textbox "name@example.com" [ref=e12]: testuser_1787075823803@example.com
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - textbox "••••••••" [ref=e15]: Password123!
        - button "Sign Up" [ref=e16] [cursor=pointer]
      - paragraph [ref=e17]:
        - text: Already have an account?
        - link "Log in" [ref=e18] [cursor=pointer]:
          - /url: /login
  - button "Close menu"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Registration Flow', () => {
  4  |   test('should successfully register a new user and redirect to catalog', async ({ page }) => {
  5  |     // Generate a unique email for each run
  6  |     const uniqueId = Date.now();
  7  |     const email = `testuser_${uniqueId}@example.com`;
  8  |     const password = 'Password123!';
  9  | 
  10 |     // Navigate to signup page
  11 |     await page.goto('/signup');
  12 | 
  13 |     // Wait for the signup form to be visible
  14 |     await expect(page.locator('h2', { hasText: 'Create Account' })).toBeVisible();
  15 | 
  16 |     // Fill out the registration form (assuming standard Name, Email, Password fields)
  17 |     // If there is a Name field, fill it. Let's check for it.
  18 |     const nameInput = page.locator('input[type="text"][placeholder*="Name" i]');
  19 |     if (await nameInput.isVisible()) {
  20 |       await nameInput.fill('E2E Test User');
  21 |     }
  22 | 
  23 |     await page.fill('input[type="email"]', email);
  24 |     await page.fill('input[type="password"]', password);
  25 | 
  26 |     // Submit the form
  27 |     await page.click('button[type="submit"]');
  28 | 
  29 |     // It should redirect to login upon successful registration
> 30 |     await page.waitForURL('**/login*', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  31 |     
  32 |     expect(page.url()).toContain('/login');
  33 |   });
  34 | });
  35 | 
```