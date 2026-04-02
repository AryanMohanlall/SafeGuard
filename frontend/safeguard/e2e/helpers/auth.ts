import type { Page } from '@playwright/test';

export const mockAuthenticatedSession = async (
  page: Page,
  roleNames: string[] = ['Official'],
) => {
  await page.route('**/api/services/app/Session/GetCurrentLoginInformations**', async (route) => {
    await route.fulfill({
      json: {
        result: {
          application: {
            version: 'test',
            releaseDate: '2026-04-02T00:00:00Z',
            features: {},
          },
          user: {
            id: 1,
            name: 'Test',
            surname: 'User',
            userName: 'test.user',
            emailAddress: 'test@example.com',
            roleNames,
          },
          tenant: {
            id: 1,
            tenancyName: 'Default',
            name: 'Default',
          },
        },
      },
    });
  });
};
