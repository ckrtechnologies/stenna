# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend/leads.spec.js >> Backend Leads API >> should create a lead via POST /leads
- Location: tests/backend/leads.spec.js:6:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 500
Received array: [200, 201]
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Backend Leads API', () => {
  4  |   const baseURL = 'http://localhost:5010/api/v1';
  5  | 
  6  |   test('should create a lead via POST /leads', async ({ request }) => {
  7  |     const payload = {
  8  |       name: 'Test Lead',
  9  |       email: 'lead@example.com',
  10 |       phone: '9876543210',
  11 |       message: 'Interested in a wallpaper quote',
  12 |       wallpaper_id: 'some-wallpaper-id-optional'
  13 |     };
  14 | 
  15 |     const response = await request.post(`${baseURL}/leads`, {
  16 |       data: payload
  17 |     });
  18 | 
  19 |     // It should either return 201 Created or 200 OK
> 20 |     expect([200, 201]).toContain(response.status());
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  21 |     const data = await response.json();
  22 |     expect(data).toHaveProperty('id');
  23 |     expect(data.email).toBe('lead@example.com');
  24 |   });
  25 | });
  26 | 
```