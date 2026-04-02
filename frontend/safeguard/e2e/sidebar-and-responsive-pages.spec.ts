import { expect, test } from '@playwright/test';

const mockCases = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    caseNumber: 'CAS-2026-00001',
    title: 'Downtown robbery pattern',
    summary: 'Two linked robberies under review.',
    status: 'Open',
    severity: 'High',
    category: 'Theft',
    incidentIds: ['20000000-0000-0000-0000-000000000001'],
    incidentCount: 1,
    openedAt: '2026-04-01T08:00:00Z',
    closedAt: null,
    lastActivityAt: '2026-04-02T08:30:00Z',
    isCourtReady: false,
    courtReadyAt: null,
    closureReason: null,
    aiSummary: null,
    creationTime: '2026-04-01T08:00:00Z',
    creatorUserId: 1,
  },
];

const mockIncidents = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    title: 'Robbery outside station',
    description: 'Victim reported two suspects.',
    location: 'Central Station',
    hasAudio: false,
    audioFileName: null,
    audioContentType: null,
    hasImage: true,
    imageFileName: 'still.jpg',
    imageContentType: 'image/jpeg',
    latitude: -26.2041,
    longitude: 28.0473,
    caseId: '10000000-0000-0000-0000-000000000001',
    anonymous: false,
    occurredAt: '2026-04-01T06:30:00Z',
    reportedAt: '2026-04-01T07:00:00Z',
    creationTime: '2026-04-01T07:00:00Z',
    creatorUserId: 1,
    detectedObjects: '["person"]',
  },
];

const mockGraph = {
  result: {
    generatedAt: '2026-04-02T10:00:00Z',
    incidentCount: 2,
    clusterCount: 1,
    suggestionCount: 1,
    nodes: [
      {
        id: 'cluster-node-1',
        label: 'Cluster 1',
        subtitle: '2 incidents - city centre pattern',
        type: 'cluster',
        groupId: 'cluster-1',
        clusterId: 1,
        confidenceScore: 0.81,
        status: 'clustered',
      },
      {
        id: 'suggestion-node-1',
        label: 'Possible linked robbery case',
        subtitle: 'Confidence 81%',
        type: 'suggestion',
        groupId: 'cluster-1',
        clusterId: 1,
        suggestionId: 'suggestion-1',
        confidenceScore: 0.81,
        status: 'review',
      },
    ],
    edges: [
      {
        id: 'edge-cluster-suggestion',
        source: 'cluster-node-1',
        target: 'suggestion-node-1',
        type: 'cluster-suggestion',
        label: 'suggested grouping',
        weight: 0.81,
        groupId: 'cluster-1',
      },
    ],
    suggestions: [
      {
        id: 'suggestion-1',
        clusterId: 1,
        groupId: 'cluster-1',
        suggestedTitle: 'Possible linked robbery case',
        confidenceScore: 0.81,
        dominantCategory: 'Robbery',
        dominantObject: 'person',
        maxDistanceKm: 1.8,
        timeSpanHours: 6.5,
        incidentIds: [
          '20000000-0000-0000-0000-000000000001',
          '20000000-0000-0000-0000-000000000002',
        ],
        existingCaseIds: [],
        reasons: ['Shared robbery indicators', 'Tight geographic radius'],
      },
    ],
  },
};

const routeProtectedAppApis = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/api/services/app/case/GetAll')) {
      await route.fulfill({ json: { result: { items: mockCases, totalCount: mockCases.length } } });
      return;
    }

    if (url.includes('/api/services/app/incident/GetAll')) {
      await route.fulfill({ json: { result: { items: mockIncidents, totalCount: mockIncidents.length } } });
      return;
    }

    if (url.includes('/api/services/app/evidence/GetAll')) {
      await route.fulfill({ json: { result: { items: [], totalCount: 0 } } });
      return;
    }

    if (url.includes('/api/services/app/incidentClustering/GetSuggestedCaseGraph')) {
      await route.fulfill({ json: mockGraph });
      return;
    }

    await route.fulfill({ json: { result: { items: [], totalCount: 0 } } });
  });
};

test.describe('Protected responsive pages', () => {
  test('keeps the mobile logout control aligned with the collapsed sidebar icons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await routeProtectedAppApis(page);
    await page.goto('/cases');

    const selectedMenuItem = page.locator('.ant-menu-item-selected').first();
    const logoutButton = page.locator('.ant-layout-sider-children .ant-btn').last();

    await expect(selectedMenuItem).toBeVisible();
    await expect(logoutButton).toBeVisible();

    const selectedBox = await selectedMenuItem.boundingBox();
    const logoutBox = await logoutButton.boundingBox();

    expect(selectedBox).not.toBeNull();
    expect(logoutBox).not.toBeNull();

    const selectedCenterX = selectedBox!.x + selectedBox!.width / 2;
    const logoutCenterX = logoutBox!.x + logoutBox!.width / 2;

    expect(Math.abs(selectedCenterX - logoutCenterX)).toBeLessThanOrEqual(2);
  });

  test('renders the cases page on mobile with the main actions still available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await routeProtectedAppApis(page);
    await page.goto('/cases');

    await expect(page.getByRole('heading', { name: 'Case Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Case' })).toBeVisible();
    await expect(page.getByText('Draft', { exact: true })).toBeVisible();
    await expect(page.getByText('Open', { exact: true })).toBeVisible();
  });

  test('renders the incident graph page with graph and suggestion content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await routeProtectedAppApis(page);
    await page.goto('/incident-graph');

    await expect(page.getByRole('heading', { name: 'Incident Link Graph' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh graph' })).toBeVisible();
    await expect(page.getByRole('table').getByText('Possible linked robbery case')).toBeVisible();
    await expect(page.getByText('Suggested Cases', { exact: true })).toBeVisible();
  });
});
