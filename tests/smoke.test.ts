import { test, expect } from '@playwright/test';

const PROD_URL = 'https://cariocacoastalclub.com/';

test('home page renders content after loading screen', async ({ page }) => {
  await page.goto(PROD_URL);

  // Wait for the app to boot and the Alva hero heading to appear
  const heading = page.getByRole('heading', { level: 1, name: 'Alva' });
  await expect(heading).toBeVisible({ timeout: 20000 });

  // The hero WhatsApp CTA should be present
  const whatsappCta = page.getByRole('button', { name: /join us on whatsapp/i }).first();
  await expect(whatsappCta).toBeVisible();
});
