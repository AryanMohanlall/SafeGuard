import { test, expect } from '@playwright/test';

// Login tests run without any stored auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    // Block any accidental API calls so tests never need a real backend
    await page.route('**/api/**', route => route.abort());
    await page.goto('/login');
  });

  test('renders email, password fields and sign-in button', async ({ page }) => {
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Please enter your email.')).toBeVisible();
    await expect(page.getByText('Please enter your password.')).toBeVisible();
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByLabel('Password').fill('anypassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Please enter a valid email.')).toBeVisible();
  });

  test('shows error message on failed login', async ({ page }) => {
    // Allow the auth call and return a 401
    await page.unroute('**/api/**');
    await page.route('**/api/TokenAuth/Authenticate', route =>
      route.fulfill({ status: 401, json: { error: { message: 'Invalid credentials' } } })
    );

    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials. Please try again.')).toBeVisible();
  });

  test('navigates to register page via link', async ({ page }) => {
    await page.unroute('**/api/**');
    const link = page.getByRole('link', { name: 'Create an account' });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/register/);
  });
});
