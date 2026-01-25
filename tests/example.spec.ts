import { test, expect } from '@playwright/test';

test('app loads and shows main elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Examen N3');
    await expect(page.locator('#card')).toBeVisible();
    await expect(page.locator('#front-text')).toHaveText(/Chargement.../);
});
