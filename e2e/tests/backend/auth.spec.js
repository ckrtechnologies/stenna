const { test, expect } = require('@playwright/test');

test.describe('Authentication API', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890'
  };

  let token;

  test('should register a new user successfully', async ({ request }) => {
    const response = await request.post('/api/v1/auth/register', {
      data: testUser
    });
    
    // Sometimes APIs return 201 Created or 200 OK
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  test('should fail to register with duplicate email', async ({ request }) => {
    const response = await request.post('/api/v1/auth/register', {
      data: testUser
    });
    
    expect(response.status()).toBe(400); // Or whatever duplicate returns
  });

  test('should login successfully and return token', async ({ request }) => {
    const response = await request.post('/api/v1/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.token).toBeDefined();
    token = data.token;
  });

  test('should get user profile with valid token', async ({ request }) => {
    const response = await request.get('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.email).toBe(testUser.email);
  });
});
