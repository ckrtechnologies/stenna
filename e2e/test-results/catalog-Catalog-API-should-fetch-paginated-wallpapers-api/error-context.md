# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend/catalog.spec.js >> Catalog API >> should fetch paginated wallpapers
- Location: tests/backend/catalog.spec.js:11:3

# Error details

```
Error: expect(received).toBeDefined()

Received: undefined
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Catalog API', () => {
  4  |   test('should fetch all categories', async ({ request }) => {
  5  |     const response = await request.get('/api/v1/categories');
  6  |     expect(response.ok()).toBeTruthy();
  7  |     const data = await response.json();
  8  |     expect(Array.isArray(data)).toBeTruthy();
  9  |   });
  10 | 
  11 |   test('should fetch paginated wallpapers', async ({ request }) => {
  12 |     const response = await request.get('/api/v1/wallpapers');
  13 |     expect(response.ok()).toBeTruthy();
  14 |     const data = await response.json();
> 15 |     expect(data.wallpapers).toBeDefined();
     |                             ^ Error: expect(received).toBeDefined()
  16 |     expect(Array.isArray(data.wallpapers)).toBeTruthy();
  17 |     expect(data.pagination).toBeDefined();
  18 |   });
  19 | 
  20 |   test('should fetch all books', async ({ request }) => {
  21 |     const response = await request.get('/api/v1/books');
  22 |     expect(response.ok()).toBeTruthy();
  23 |     const data = await response.json();
  24 |     expect(Array.isArray(data)).toBeTruthy();
  25 |   });
  26 | });
  27 | 
```