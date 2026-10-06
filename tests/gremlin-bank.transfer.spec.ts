import { test, expect, env } from './fixtures';

const usernameName = /^(Username|User ID)$/;
const signInName = /^(Sign in|Log in)$/;
const continueName = /^(Continue|Review transfer)$/;
const payeeName = /^(Beneficiary name|Payee name)$/;
const referenceName = /^(Reference|Payment reference)$/;

async function signIn(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('textbox', { name: usernameName }).fill(env('GREMLIN_USER'));
  await page.getByRole('textbox', { name: 'Password' }).fill(env('GREMLIN_PASSWORD'));
  await page.getByRole('button', { name: signInName }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();
}

async function prepareTransfer(
  page: import('@playwright/test').Page,
  amount: number,
  account = 'Everyday Account',
): Promise<void> {
  await page.goto('/transfer');
  await expect(page.getByRole('heading', { level: 1, name: 'New transfer' })).toBeVisible();
  await page.getByRole('combobox', { name: 'From account' }).selectOption({ label: account });
  await page.getByRole('button', { name: 'Use Kiss Péter' }).click();
  await page.getByRole('button', { name: 'Check IBAN' }).click();
  await page.getByRole('textbox', { name: 'Amount (HUF)' }).fill(String(amount));
  await page.getByRole('textbox', { name: referenceName }).fill('Practice transfer');
}

async function continueToReview(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: continueName }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Review transfer' })).toBeVisible();
}

test.describe('domestic transfer', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('reviews a valid saved-payee transfer without confirming it', async ({ page }) => {
    await prepareTransfer(page, 250_000);
    await continueToReview(page);

    const details = page.getByRole('table', { name: 'Transfer details' });
    await expect(details).toContainText('Everyday Account');
    await expect(details).toContainText('Kiss Péter');
    await expect(details).toContainText('HU72 9990 1017 1618 0339 8874 9892');
    await expect(details).toContainText('250,000 HUF');
    await expect(details).toContainText('750 HUF');
    await expect(details).toContainText('250,750 HUF');
    await expect(page.getByRole('button', { name: 'Confirm transfer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Change details' })).toBeVisible();
  });

  test('validates required transfer fields and an unchecked invalid IBAN', async ({ page }) => {
    await page.goto('/transfer');
    await page.getByRole('button', { name: continueName }).click();

    await expect(page.getByText('Enter a beneficiary name.', { exact: true })).toBeVisible();
    await expect(page.getByText('Check the IBAN first.', { exact: true })).toBeVisible();
    await expect(page.getByText('Enter an amount greater than 0.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'New transfer' })).toBeVisible();

    await page.getByRole('textbox', { name: payeeName }).fill('Practice payee');
    await page.getByRole('textbox', { name: 'IBAN' }).fill('HU12 9999');
    await page.getByRole('button', { name: 'Check IBAN' }).click();
    await page.getByRole('textbox', { name: 'Amount (HUF)' }).fill('10000');
    await page.getByRole('button', { name: continueName }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'New transfer' })).toBeVisible();
    await expect(page.getByText('Check the IBAN first.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Review transfer' })).toHaveCount(0);
  });

  test('calculates fee minimum, percentage, and maximum boundaries', async ({ page }) => {
    const examples = [
      { amount: 10_000, account: 'Everyday Account', fee: '200 HUF', total: '10,200 HUF' },
      { amount: 100_000, account: 'Everyday Account', fee: '300 HUF', total: '100,300 HUF' },
      { amount: 250_000, account: 'Everyday Account', fee: '750 HUF', total: '250,750 HUF' },
      { amount: 2_000_000, account: 'Savings Account', fee: '6,000 HUF', total: '2,006,000 HUF' },
    ];

    for (const example of examples) {
      await prepareTransfer(page, example.amount, example.account);
      await continueToReview(page);
      const details = page.getByRole('table', { name: 'Transfer details' });
      await expect(details).toContainText(`${example.amount.toLocaleString('en-US')} HUF`);
      await expect(details.getByRole('row', { name: /Fee/ })).toContainText(example.fee);
      await expect(details.getByRole('row', { name: /Total/ })).toContainText(example.total);
    }
  });

  test('rejects amounts above daily, single-transfer, and account limits', async ({ page }) => {
    await prepareTransfer(page, 2_000_001, 'Savings Account');
    await page.getByRole('button', { name: continueName }).click();
    await expect(page.getByText('Daily limit of 2,000,000 HUF exceeded.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Review transfer' })).toHaveCount(0);

    await prepareTransfer(page, 10_000_001, 'Savings Account');
    await page.getByRole('button', { name: continueName }).click();
    await expect(page.getByText('The maximum single transfer is 10,000,000 HUF.', { exact: true })).toBeVisible();

    await prepareTransfer(page, 1_250_001);
    await page.getByRole('button', { name: continueName }).click();
    await expect(page.getByText('Insufficient funds.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Review transfer' })).toHaveCount(0);
  });
});
