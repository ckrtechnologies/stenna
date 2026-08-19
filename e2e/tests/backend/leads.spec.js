const { test, expect } = require('@playwright/test');

test.describe('Backend Leads API', () => {
  const baseURL = 'http://localhost:5010/api/v1';

  test('should create a lead via POST /leads', async ({ request }) => {
    const payload = {
      name: 'Test Lead',
      email: 'lead@example.com',
      phone: '9876543210',
      message: 'Interested in a wallpaper quote',
      wallpaper_id: 'some-wallpaper-id-optional'
    };

    const response = await request.post(`${baseURL}/leads`, {
      data: payload
    });

    // It should either return 201 Created or 200 OK
    expect([200, 201]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.email).toBe('lead@example.com');
  });
});
