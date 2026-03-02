import { test, expect } from '@playwright/test';

const PROD_URL = 'https://cariocacoastalclub.com/';

test('home page renders content after loading screen', async ({ page }) => {
  await page.goto(PROD_URL);

  // Wait for the React loading screen to finish and the h1 to appear
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible({ timeout: 20000 });

  // A WhatsApp join button should be present (rendered by CommunityHome)
  const whatsappButton = page.getByRole('link', { name: /join the whatsapp group/i }).first();
  await expect(whatsappButton).toBeVisible();
});
