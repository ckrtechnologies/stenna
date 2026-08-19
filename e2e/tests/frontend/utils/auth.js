const { expect } = require('@playwright/test');

async function loginUser(page, email = 'test@example.com', password = 'password123') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/catalog*', { timeout: 10000 });
}

async function registerAndLoginUser(page) {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  // Accept the 'Check your email' alert
  page.on('dialog', dialog => dialog.accept());
  
  await page.goto('/signup');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to login
  await page.waitForURL('**/login*');
  
  // Now login with those fresh credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/catalog*', { timeout: 10000 });
}

module.exports = { loginUser, registerAndLoginUser };
