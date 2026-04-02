import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

const mockIncidents = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Robbery on Main St',
    description: 'Suspect fled on foot heading north.',
    location: '123 Main Street',
    hasAudio: false,
    audioFileName: null,
    audioContentType: null,
    hasImage: true,
    imageFileName: 'scene.jpg',
    imageContentType: 'image/jpeg',
    latitude: -26.2041,
    longitude: 28.0473,
    anonymous: false,
    occurredAt: '2024-06-01T08:00:00Z',
    reportedAt: '2024-06-01T08:30:00Z',
    creationTime: '2024-06-01T08:30:00Z',
    creatorUserId: 1,
    detectedObjects: JSON.stringify([
      { name: 'person', confidence: 0.95, source: 'object' },
      { name: 'car', confidence: 0.72, source: 'tag' },
    ]),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Vandalism at Park',
    description: 'Graffiti found on the east wall.',
    location: 'Central Park',
    hasAudio: false,
    audioFileName: null,
    audioContentType: null,
    hasImage: false,
    imageFileName: null,
    imageContentType: null,
    latitude: null,
    longitude: null,
    anonymous: true,
    occurredAt: '2024-06-02T14:00:00Z',
    reportedAt: '2024-06-02T15:00:00Z',
    creationTime: '2024-06-02T15:00:00Z',
    creatorUserId: null,
    detectedObjects: null,
  },
];

const mockGetAll = {
  result: { items: mockIncidents, totalCount: mockIncidents.length },
};

const mockEmpty = {
  result: { items: [], totalCount: 0 },
};

test.describe('Incidents page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.route('**/incident/GetAll**', route =>
      route.fulfill({ json: mockGetAll })
    );
    await page.goto('/incidents');
  });

  test('renders the incidents table with data', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Robbery on Main St')).toBeVisible();
    await expect(page.getByText('Vandalism at Park')).toBeVisible();
  });

  test('shows New Incident button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Incident' })).toBeVisible();
  });

  test('opens create drawer when New Incident is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'New Incident' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Location')).toBeVisible();
  });

  test('shows validation errors when create form submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: 'New Incident' }).click();

    // "Create" is the submit button inside the drawer footer
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Please provide a title.')).toBeVisible();
    await expect(page.getByText('Please describe the incident.')).toBeVisible();
    await expect(page.getByText('Please provide a location.')).toBeVisible();
  });

  test('closes drawer when Cancel is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'New Incident' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows AI analysed tooltip for incidents with detected objects', async ({ page }) => {
    // The RobotOutlined icon has aria-label="robot" — hover it to reveal the tooltip
    const robotIcon = page.locator('[aria-label="robot"]').first();
    await expect(robotIcon).toBeVisible();
    await robotIcon.hover();
    await expect(page.getByText('AI analysed')).toBeVisible();
  });

  test('shows empty state when no incidents exist', async ({ page }) => {
    await page.route('**/incident/GetAll**', route =>
      route.fulfill({ json: mockEmpty })
    );
    await page.reload();

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Robbery on Main St')).not.toBeVisible();
  });

  test('can switch to map view', async ({ page }) => {
    await page.route('**/incident/GetAll**', route =>
      route.fulfill({ json: mockGetAll })
    );

    // Segmented control renders each option with its label text
    await page.getByText('Map').click();

    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });
  });
});
