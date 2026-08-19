const { test, expect } = require('@playwright/test');

test.describe('Backend Visualizer API', () => {
  const baseURL = 'http://localhost:5010/api/v1';

  test('should require authentication to get visualizer history', async ({ request }) => {
    const response = await request.get(`${baseURL}/visualizer/history`);
    
    // Should be unauthorized if no token
    expect(response.status()).toBe(401);
  });
});
