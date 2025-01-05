import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to your application
  await page.goto('http://localhost:3000/');

  // Expect the page to have a title
  await expect(page).toHaveTitle(/AddnTravel/);
});
