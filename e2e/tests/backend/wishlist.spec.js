const { test, expect } = require('@playwright/test');

test.describe('Backend Wishlist API', () => {
  const baseURL = 'http://localhost:5010/api/v1';

  test('should require auth for GET /wishlist', async ({ request }) => {
    // Unauthenticated request should fail
    const response = await request.get(`${baseURL}/wishlist`);
    expect(response.status()).toBe(401);
  });
});
