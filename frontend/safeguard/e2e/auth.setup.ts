import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('set auth cookie', async ({ page }) => {
  // Navigate to any page to establish the localhost origin, then inject a
  // fake token cookie.  All API calls in tests are mocked with page.route(),
  // so the token value never reaches a real server.
  await page.goto('/login');

  await page.context().addCookies([{
    name: 'sg_access_token',
    value: 'fake-test-token',
    domain: 'localhost',
    path: '/',
    sameSite: 'Strict',
  }]);

  await page.context().storageState({ path: authFile });
});
