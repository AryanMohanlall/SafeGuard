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
    await page.route('**/api/services/app/LiveStream/GetAll**', route =>
      route.fulfill({
        json: {
          result: {
            items: [
              {
                id: 'stream-1',
                name: 'Mulberry Street',
                location: 'Manhattan, New York, USA',
                sourceName: 'EarthCam',
                sourceUrl: 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
                camKey: 'littleitaly',
                thumbnailUrl: null,
                isActive: true,
                sortOrder: 1,
                creationTime: '2026-04-02T10:00:00Z',
                creatorUserId: 1,
              },
            ],
            totalCount: 1,
          },
        },
      }),
    );
    await page.route('**/api/monitor/streams', route => route.fulfill({ json: { cameras: mockCameras } }));
    await page.route('**/api/monitor/proxy**', route => route.fulfill({ status: 204, body: '' }));

    await page.goto('/monitor');

    await expect(page.getByRole('heading', { name: 'Live Monitor' })).toBeVisible();
    await expect(page.getByText('Mulberry Street', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Abbey Road Crossing', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2 live')).toBeVisible();
    await expect(page.getByText('Open source feed')).toBeVisible();

    await page.locator('button').filter({ has: page.locator('[aria-label="expand-alt"]') }).last().click();

    await expect(page.getByText('Abbey Road Crossing', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('London, England, UK', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Abbey Road Crossing', { exact: true })).toHaveCount(1);
  });

  test('adds and deletes a configured live stream', async ({ page }) => {
    let streams = [
      {
        id: 'stream-1',
        name: 'Temple Bar',
        location: 'Dublin, Ireland',
        sourceName: 'EarthCam',
        sourceUrl: 'https://www.earthcam.com/world/ireland/dublin/?cam=templebar',
        camKey: 'templebar',
        thumbnailUrl: null,
        isActive: true,
        sortOrder: 1,
        creationTime: '2026-04-02T10:00:00Z',
        creatorUserId: 1,
      },
    ];

    await page.route('**/api/services/app/LiveStream/GetAll**', route =>
      route.fulfill({ json: { result: { items: streams, totalCount: streams.length } } }),
    );
    await page.route('**/api/services/app/LiveStream/Create', async route => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      streams = [
        ...streams,
        {
          id: 'stream-2',
          creationTime: '2026-04-02T10:00:00Z',
          creatorUserId: 1,
          ...body,
        } as typeof streams[number],
      ];

      await route.fulfill({ json: { result: streams[1] } });
    });
    await page.route('**/api/services/app/LiveStream/Delete**', async route => {
      const url = new URL(route.request().url());
      const id = url.searchParams.get('id');
      streams = streams.filter(stream => stream.id !== id);
      await route.fulfill({ status: 200, json: { result: null } });
    });
    await page.route('**/api/monitor/streams', route => route.fulfill({ json: { cameras: mockCameras } }));
    await page.route('**/api/monitor/proxy**', route => route.fulfill({ status: 204, body: '' }));

    await page.goto('/monitor');

    await page.getByLabel('Name').fill('Abbey Road Crossing');
    await page.getByLabel('Location').fill('London, England, UK');
    await page.getByLabel('Camera key').fill('abbeyroad_uk');
    await page.getByLabel('Source URL').fill('https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk');
    await page.getByRole('button', { name: 'Add Stream' }).click();

    await expect(page.getByText('Abbey Road Crossing').first()).toBeVisible();

    await page.getByRole('button', { name: '' }).filter({ has: page.locator('.anticon-delete') }).last().click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Temple Bar').first()).toBeVisible();
    await expect(page.getByText('Abbey Road Crossing')).toHaveCount(0);
  });

  test('shows an error banner when the monitor api fails', async ({ page }) => {
    await page.route('**/api/services/app/LiveStream/GetAll**', route =>
      route.fulfill({ json: { result: { items: [], totalCount: 0 } } }),
    );
    await page.route('**/api/monitor/streams', route =>
      route.fulfill({ status: 503, json: { message: 'No live cameras could be resolved right now.' } }),
    );

    await page.goto('/monitor');

    await expect(page.getByText('Camera feeds could not be loaded.', { exact: true })).toBeVisible();
    await expect(page.getByText('No live cameras could be resolved right now.', { exact: true })).toBeVisible();
  });
});
