import { test, expect } from '@playwright/test'

test('loads home page', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.getByText(/Subjects|المواد/)).toBeVisible()
})
