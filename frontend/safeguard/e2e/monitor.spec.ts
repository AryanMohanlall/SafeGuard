import { expect, test } from '@playwright/test';

const mockCameras = [
  {
    id: 'mulberry-street',
    name: 'Mulberry Street',
    location: 'Manhattan, New York, USA',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
    streamUrl: '/api/monitor/proxy?target=test-1&referer=test',
    thumbnailUrl: 'https://static.earthcam.com/camshots/512x288/thumb-1.jpg',
  },
  {
    id: 'abbey-road',
    name: 'Abbey Road Crossing',
    location: 'London, England, UK',
    sourceName: 'EarthCam',
    sourceUrl: 'https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk',
    streamUrl: '/api/monitor/proxy?target=test-2&referer=test',
    thumbnailUrl: 'https://static.earthcam.com/camshots/512x288/thumb-2.jpg',
  },
];

test.describe('Monitor page', () => {
  test('renders live feeds from the monitor api and switches expanded camera', async ({ page }) => {
    await page.route('**/api/monitor/streams', route => route.fulfill({ json: { cameras: mockCameras } }));
    await page.route('**/api/monitor/proxy**', route => route.fulfill({ status: 204, body: '' }));

    await page.goto('/monitor');

    await expect(page.getByRole('heading', { name: 'Live Monitor' })).toBeVisible();
    await expect(page.getByText('Mulberry Street', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Abbey Road Crossing', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2 live')).toBeVisible();
    await expect(page.getByText('Open source feed')).toBeVisible();

    await page
      .locator('div')
      .filter({ has: page.getByText('Abbey Road Crossing', { exact: true }).first() })
      .getByRole('button')
      .first()
      .click();

    await expect(page.locator('text=Abbey Road Crossing').first()).toBeVisible();
    await expect(page.locator('text=London, England, UK').first()).toBeVisible();
  });

  test('shows an error banner when the monitor api fails', async ({ page }) => {
    await page.route('**/api/monitor/streams', route =>
      route.fulfill({ status: 503, json: { message: 'No live cameras could be resolved right now.' } }),
    );

    await page.goto('/monitor');

    await expect(page.getByText('Camera feeds could not be loaded.', { exact: true })).toBeVisible();
    await expect(page.getByText('Unable to load camera feeds.', { exact: true })).toBeVisible();
  });
});
