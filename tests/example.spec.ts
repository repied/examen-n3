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
    await expect(page.locator('#totalCards')).not.toHaveText('0');
    await expect(page.locator('#front-text')).toContainText('Introduction');
});

test('dropdown filters important questions', async ({ page }) => {
    await page.goto('/');

    // Start from the full PlongeePlaisir deck for deterministic filtering assertions
    await page.selectOption('#deckSelect', 'all');

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

    await expect(page.locator('#front-text')).toContainText('Introduction');
});

test('topic dropdown is populated and filters cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#totalCards')).not.toHaveText('0');

    await page.selectOption('#deckSelect', 'pierre');
    await expect(page.locator('#totalCards')).not.toHaveText('0');

    const topicOptions = page.locator('#topicSelect option');
    await expect(topicOptions).toContainText(['Introduction', 'Acronymes']);

    await page.selectOption('#topicSelect', { label: 'Acronymes' });

    await expect(page.locator('#totalCards')).not.toHaveText('0');
    await expect(page.locator('#front-text')).toContainText('Acronymes');
});
