import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

test('dashboard layout and user interactions', async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:4200');
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator('app-campaign-card');
    await cards.first().waitFor();
    assert.equal(await cards.count(), 6);
    assert.match(await page.locator('.kpi-row').innerText(), /8,450/);
    assert.equal(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
    await page.getByRole('searchbox').fill('coffee');
    assert.equal(await cards.count(), 1);
    await page.getByRole('searchbox').fill('no-such-campaign');
    await page.getByRole('heading', { name: 'No campaigns found' }).waitFor();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.getByLabel('Status', { exact: true }).selectOption('Paused');
    assert.equal(await cards.count(), 2);
    await page.getByLabel('Status', { exact: true }).selectOption('All');
    await page.getByLabel('Sort campaigns').selectOption('name');
    assert.match(await cards.first().innerText(), /BUY COFFEE/);
    await page.getByRole('button', { name: 'List view', exact: true }).click();
    assert.equal(await page.locator('.list-view').count(), 1);
    await page.locator('tbody .campaign-link').first().click();
    assert.equal(await page.locator('dialog[open]').count(), 1);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Light theme', exact: true }).click();
    await page.reload();
    await page.locator('.dashboard.light').waitFor();
    await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
    await page.getByRole('button', { name: 'Grid view', exact: true }).click();
    await page.getByRole('button', { name: '+ New Campaign', exact: true }).click();
    await page.getByLabel('Campaign name', { exact: true }).fill('Test local draft');
    await page.getByRole('button', { name: 'Create campaign', exact: true }).click();
    await expect(cards).toHaveCount(7);
    await page.reload();
    await page.getByRole('heading', { name: 'Test local draft', exact: true }).waitFor();
    assert.equal(await cards.count(), 7);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await cards.first().waitFor();
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}px`);
      if (width === 390) await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
    }
    assert.deepEqual(errors, []);
  } catch (error) {
    console.error('Browser errors:', errors);
    console.error('Open dialog:', await page.locator('dialog[open]').allInnerTexts());
    throw error;
  } finally { await browser.close(); }
});

test('Figma campaign table, shared header and responsive scrolling', async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  try {
    await page.goto('http://127.0.0.1:4200/?view=list');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);
    await expect(page.locator('app-header')).toHaveCount(1);
    await expect(page.locator('thead th')).toHaveCount(11);
    await expect(page.locator('.kpi').nth(1)).toHaveText('TOTAL AD SETS18');
    await expect(page.locator('.kpi').nth(2)).toHaveText('TOTAL ADS42');
    await expect(page.locator('app-campaign-card')).toHaveCount(6);
    const gridBounds = await page.locator('#campaign-grid').boundingBox();
    const tableBounds = await page.locator('#campaign-table').boundingBox();
    assert.ok(tableBounds.y >= gridBounds.y + gridBounds.height, 'Table follows the dashboard grid');
    await expect(rows.first()).toContainText('1.92%');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: 'test-results/campaign-table-desktop.png', fullPage: true });
    await page.getByRole('searchbox').fill('coffee');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Buy Coffee Not Mega Corps.');
    await page.getByRole('searchbox').fill('');
    await page.getByLabel('Status', { exact: true }).selectOption('Draft');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('DRAFT');
    await page.getByLabel('Status', { exact: true }).selectOption('All');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '+ New Campaign', exact: true }).click();
    await page.getByLabel('Campaign name', { exact: true }).fill('Zero metrics draft');
    await page.getByRole('button', { name: 'Create campaign', exact: true }).click();
    await expect(rows).toHaveCount(7);
    await expect(rows.first()).toContainText('0.00%');
    await expect(rows.first()).toContainText('Today');
    await page.reload();
    await expect(rows).toHaveCount(7);
    await page.getByRole('button', { name: 'Grid view', exact: true }).click();
    await expect(page.locator('app-campaign-card')).toHaveCount(7);
    await expect(page.locator('app-header')).toHaveCount(1);
    await page.getByRole('button', { name: 'List view', exact: true }).click();
    for (const width of [1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Table page overflow at ${width}px`);
      assert.equal(await page.locator('.table-scroll').evaluate(element => element.scrollWidth > element.clientWidth), true);
      await page.evaluate(() => window.scrollTo({ top: 650, behavior: 'instant' }));
      await expect(page.getByRole('searchbox')).toBeInViewport();
      await expect(page.getByRole('button', { name: '+ New Campaign', exact: true })).toBeInViewport();
      const header = await page.locator('app-header').boundingBox();
      const toolbar = await page.locator('.filter-bar').boundingBox();
      assert.ok(header.y >= 0 && header.y < 30, `Header stays at the top at ${width}px`);
      assert.ok(toolbar.y >= header.y + header.height, `Toolbar does not overlap header at ${width}px`);
      if (width === 390) await page.screenshot({ path: 'test-results/campaign-table-mobile.png', fullPage: true });
    }
    await page.getByRole('searchbox').fill('no matching campaign');
    await expect(page.getByRole('button', { name: 'Clear filters', exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(rows).toHaveCount(7);
  } finally { await browser.close(); }
});
