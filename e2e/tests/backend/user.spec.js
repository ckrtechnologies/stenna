const { test, expect } = require('@playwright/test');

test.describe('Backend User API', () => {
  const baseURL = 'http://localhost:5010/api/v1';

  test('should require authentication to get profile', async ({ request }) => {
    const response = await request.get(`${baseURL}/users/profile`);
    
    // Should be unauthorized if no token
    expect(response.status()).toBe(401);
  });
});
