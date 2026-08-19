# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend/try-it-on.spec.js >> Try It On Flow >> should log in, view Try It On history, and navigate to visualizer flow
- Location: tests/frontend/try-it-on.spec.js:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
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
          - textbox "name@example.com" [ref=e12]: testuser_1787075824288@example.com
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
  1  | const { expect } = require('@playwright/test');
  2  | 
  3  | async function loginUser(page, email = 'test@example.com', password = 'password123') {
  4  |   await page.goto('/login');
  5  |   await page.fill('input[type="email"]', email);
  6  |   await page.fill('input[type="password"]', password);
  7  |   await page.click('button[type="submit"]');
  8  |   await page.waitForURL('**/catalog*', { timeout: 10000 });
  9  | }
  10 | 
  11 | async function registerAndLoginUser(page) {
  12 |   const email = `testuser_${Date.now()}@example.com`;
  13 |   const password = 'Password123!';
  14 |   
  15 |   // Accept the 'Check your email' alert
  16 |   page.on('dialog', dialog => dialog.accept());
  17 |   
  18 |   await page.goto('/signup');
  19 |   await page.fill('input[type="email"]', email);
  20 |   await page.fill('input[type="password"]', password);
  21 |   await page.click('button[type="submit"]');
  22 |   
  23 |   // Wait for redirect to login
> 24 |   await page.waitForURL('**/login*');
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  25 |   
  26 |   // Now login with those fresh credentials
  27 |   await page.fill('input[type="email"]', email);
  28 |   await page.fill('input[type="password"]', password);
  29 |   await page.click('button[type="submit"]');
  30 |   
  31 |   await page.waitForURL('**/catalog*', { timeout: 10000 });
  32 | }
  33 | 
  34 | module.exports = { loginUser, registerAndLoginUser };
  35 | 
```