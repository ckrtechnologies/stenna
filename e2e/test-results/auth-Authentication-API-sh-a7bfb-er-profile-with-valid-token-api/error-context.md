# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend/auth.spec.js >> Authentication API >> should get user profile with valid token
- Location: tests/backend/auth.spec.js:48:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Authentication API', () => {
  4  |   const testUser = {
  5  |     firstName: 'Test',
  6  |     lastName: 'User',
  7  |     email: `testuser_${Date.now()}@example.com`,
  8  |     password: 'password123',
  9  |     phone: '1234567890'
  10 |   };
  11 | 
  12 |   let token;
  13 | 
  14 |   test('should register a new user successfully', async ({ request }) => {
  15 |     const response = await request.post('/api/v1/auth/register', {
  16 |       data: testUser
  17 |     });
  18 |     
  19 |     // Sometimes APIs return 201 Created or 200 OK
  20 |     expect(response.ok()).toBeTruthy();
  21 |     const data = await response.json();
  22 |     expect(data.user).toBeDefined();
  23 |     expect(data.user.email).toBe(testUser.email);
  24 |   });
  25 | 
  26 |   test('should fail to register with duplicate email', async ({ request }) => {
  27 |     const response = await request.post('/api/v1/auth/register', {
  28 |       data: testUser
  29 |     });
  30 |     
  31 |     expect(response.status()).toBe(400); // Or whatever duplicate returns
  32 |   });
  33 | 
  34 |   test('should login successfully and return token', async ({ request }) => {
  35 |     const response = await request.post('/api/v1/auth/login', {
  36 |       data: {
  37 |         email: testUser.email,
  38 |         password: testUser.password
  39 |       }
  40 |     });
  41 |     
  42 |     expect(response.ok()).toBeTruthy();
  43 |     const data = await response.json();
  44 |     expect(data.token).toBeDefined();
  45 |     token = data.token;
  46 |   });
  47 | 
  48 |   test('should get user profile with valid token', async ({ request }) => {
  49 |     const response = await request.get('/api/v1/auth/me', {
  50 |       headers: {
  51 |         Authorization: `Bearer ${token}`
  52 |       }
  53 |     });
  54 |     
> 55 |     expect(response.ok()).toBeTruthy();
     |                           ^ Error: expect(received).toBeTruthy()
  56 |     const data = await response.json();
  57 |     expect(data.email).toBe(testUser.email);
  58 |   });
  59 | });
  60 | 
```