import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.addInitScript(() => {
        window.localStorage.setItem('unlocked_n3', 'true');
    });
});

test('app loads and shows main elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Examen N3');
    await expect(page.locator('#card')).toBeVisible();
    await expect(page.locator('#front-text')).toHaveText(/Chargement.../);
});

test('dropdown filters important questions', async ({ page }) => {
    await page.goto('/');

    // Get initial count
    const totalElement = page.locator('#totalCards');
    await expect(totalElement).not.toHaveText('0');
    const initialText = await totalElement.innerText();
    const initialCount = parseInt(initialText);

    // Select important
    await page.selectOption('#deckSelect', 'important');

    // Check count decreased
    await expect(totalElement).not.toHaveText(initialText);
    const importantText = await totalElement.innerText();
    const importantCount = parseInt(importantText);
    expect(importantCount).toBeLessThan(initialCount);

    // Select all again
    await page.selectOption('#deckSelect', 'all');

    // Check count restored
    await expect(totalElement).toHaveText(initialText);
});

test('can switch to Pierre questions', async ({ page }) => {
    await page.goto('/');

    // Select Pierre's deck
    await page.selectOption('#deckSelect', 'pierre');

    // Check if the content matches Pierre's questions
    // Wait for update
    await expect(page.locator('#front-text')).toContainText('Quelle est la meilleur plongée du monde?');
    await expect(page.locator('#back-text')).toContainText('La fosse de Villeneuve');
});
