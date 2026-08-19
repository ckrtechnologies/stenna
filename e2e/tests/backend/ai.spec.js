const { test, expect } = require('@playwright/test');

test.describe('Backend AI API', () => {
  const baseURL = 'http://localhost:5010/api/v1';

  test('should require authentication for AI recommendations', async ({ request }) => {
    // GET /ai/recommendations or POST
    const response = await request.post(`${baseURL}/ai/recommendations`, {
        data: { preferences: ['modern'] }
    });
    
    // Should be unauthorized if no token
    expect(response.status()).toBe(401);
  });
});
