import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.addInitScript(() => {
        window.localStorage.setItem('unlocked_n3_v2', 'true');
    });
});

test('app loads and shows main elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Examen N3');
    await expect(page.locator('#card')).toBeVisible();
    // Initially shows the help card
    await expect(page.locator('#front-text')).toContainText('Aide');
});

test('dropdown filters important questions', async ({ page }) => {
    await page.goto('/');

    // Start from the full PlongeePlaisir deck for deterministic filtering assertions
    await page.selectOption('#deckSelect', 'all');

    // Get initial count (parsed cards + 1 help card)
    const totalElement = page.locator('#totalCards');
    await expect(totalElement).not.toHaveText('0');
    // Help card is always there on 'all'
    const initialText = await totalElement.innerText();
    const initialCount = parseInt(initialText);

    // Select important (help card is NOT important, so it should be filtered out)
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

    // We start at card 1 (the help card)
    await expect(page.locator('#front-text')).toContainText('Aide');
});
