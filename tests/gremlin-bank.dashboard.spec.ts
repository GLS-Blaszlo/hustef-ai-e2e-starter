import { test, expect, env } from './fixtures';

const usernameName = /^(Username|User ID)$/;
const signInName = /^(Sign in|Log in)$/;

async function signIn(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: usernameName }).fill(env('GREMLIN_USER'));
  await page.getByRole('textbox', { name: 'Password' }).fill(env('GREMLIN_PASSWORD'));
  await page.getByRole('button', { name: signInName }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();
}

test.describe('dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('shows both accounts with their IBANs and balances', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();
    await expect(page.getByText('Everyday Account')).toBeVisible();
    await expect(page.getByText('HU39 9992 0265 3141 5926 5358 9797')).toBeVisible();
    await expect(page.getByText('1,250,000 HUF')).toBeVisible();
    await expect(page.getByRole('rowheader', { name: 'Savings Account' })).toBeVisible();
    await expect(page.getByText('HU03 9992 0265 2718 2818 2845 9043')).toBeVisible();
    await expect(page.getByText('5,400,000 HUF')).toBeVisible();
  });

  test('shows the five recent transactions with signed HUF amounts', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Recent transactions' });
    const rows = table.getByRole('row');

    await expect(rows).toHaveCount(6);
    await expect(rows.nth(1)).toContainText('2026-09-30');
    await expect(rows.nth(1)).toContainText('Grocery store, Budapest');
    await expect(rows.nth(1)).toContainText('-18,450 HUF');
    await expect(rows.nth(2)).toContainText('Salary, Gremlin Works Ltd.');
    await expect(rows.nth(2)).toContainText('+685,000 HUF');
    await expect(rows.nth(3)).toContainText('-7,990 HUF');
    await expect(rows.nth(4)).toContainText('-12,300 HUF');
    await expect(rows.nth(5)).toContainText('+50,000 HUF');
  });

  test('expands and collapses the 30-day chart data', async ({ page }) => {
    await page.getByRole('button', { name: 'Show chart data' }).click();
    const chart = page.getByRole('table', { name: /Spending in the last 30 days/ });
    const rows = chart.getByRole('row');

    await expect(chart).toBeVisible();
    await expect(rows).toHaveCount(31);
    await expect(chart).toContainText('2026-09-07');
    await expect(chart).toContainText('2026-10-06');
    await expect(chart).toContainText('2026-09-08');
    await expect(chart).toContainText('0 HUF');
    await expect(page.getByRole('button', { name: 'Hide chart data' })).toBeVisible();

    await page.getByRole('button', { name: 'Hide chart data' }).click();
    await expect(chart).toBeHidden();
    await expect(page.getByRole('table', { name: 'Recent transactions' })).toBeVisible();
  });
});
