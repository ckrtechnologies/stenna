const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/backend',
      use: {
        baseURL: 'http://localhost:5010',
      },
    },
    {
      name: 'chromium',
      testDir: './tests/frontend',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        slowMo: 750,
      },
    },
  ],
});
