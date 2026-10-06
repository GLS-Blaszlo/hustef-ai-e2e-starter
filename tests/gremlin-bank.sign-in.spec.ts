import { test, expect, env } from './fixtures';

const usernameName = /^(Username|User ID)$/;
const signInName = /^(Sign in|Log in)$/;

test.describe('sign in and sign out', () => {
  test('signs in with the workshop demo credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: usernameName }).fill(env('GREMLIN_USER'));
    await page.getByRole('textbox', { name: 'Password' }).fill(env('GREMLIN_PASSWORD'));
    await page.getByRole('button', { name: signInName }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();
    await expect(page.getByRole('banner')).toContainText(env('GREMLIN_USER'));
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test('rejects unknown usernames and incorrect passwords', async ({ page }) => {
    await page.goto('/login');
    const username = page.getByRole('textbox', { name: usernameName });
    const password = page.getByRole('textbox', { name: 'Password' });
    const submit = page.getByRole('button', { name: signInName });

    await username.fill(`${env('GREMLIN_USER')}-unknown`);
    await password.fill(env('GREMLIN_PASSWORD'));
    await submit.click();
    await expect(page.getByText('Wrong username or password.', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    await username.fill(env('GREMLIN_USER'));
    await password.fill(`${env('GREMLIN_PASSWORD')}-wrong`);
    await submit.click();
    await expect(page.getByText('Wrong username or password.', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toHaveCount(0);
  });

  test('requires both sign-in fields', async ({ page }) => {
    await page.goto('/login');
    const username = page.getByRole('textbox', { name: usernameName });
    const password = page.getByRole('textbox', { name: 'Password' });
    const submit = page.getByRole('button', { name: signInName });

    await expect(username).toHaveAttribute('required', '');
    await expect(password).toHaveAttribute('required', '');
    await submit.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(username).toHaveJSProperty('validity.valueMissing', true);
    await expect(password).toHaveJSProperty('validity.valueMissing', true);

    await username.fill(env('GREMLIN_USER'));
    await submit.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(password).toHaveJSProperty('validity.valueMissing', true);
  });

  test('signs out and blocks access to the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: usernameName }).fill(env('GREMLIN_USER'));
    await page.getByRole('textbox', { name: 'Password' }).fill(env('GREMLIN_PASSWORD'));
    await page.getByRole('button', { name: signInName }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Accounts' })).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: usernameName })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});
