const { test, expect } = require('@playwright/test');

test.describe('Catalog API', () => {
  test('should fetch all categories', async ({ request }) => {
    const response = await request.get('/api/v1/categories');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should fetch paginated wallpapers', async ({ request }) => {
    const response = await request.get('/api/v1/wallpapers');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.wallpapers).toBeDefined();
    expect(Array.isArray(data.wallpapers)).toBeTruthy();
    expect(data.pagination).toBeDefined();
  });

  test('should fetch all books', async ({ request }) => {
    const response = await request.get('/api/v1/books');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});
