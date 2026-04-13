import { test, expect } from '@playwright/test';

const PROD_URL = 'https://cariocacoastalclub.com/';

test('home page renders content after loading screen', async ({ page }) => {
  await page.goto(PROD_URL);

  // Wait for the React loading screen to finish and the h1 to appear
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible({ timeout: 20000 });

  // A ticket CTA should be present (rendered by RyanFarewellParty)
  const ticketButton = page.getByRole('link', { name: /get your ticket/i }).first();
  await expect(ticketButton).toBeVisible();
});
