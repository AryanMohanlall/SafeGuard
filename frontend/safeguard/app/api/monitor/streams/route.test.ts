import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const earthCamHtml = (camKey: string, overrides?: Partial<{
  name: string;
  location: string;
  stream: string;
  thumbnail_512: string;
}>) => `<!doctype html>
<script>
var json_base = {"cam":{"${camKey}":{
  "name":"${overrides?.name ?? ''}",
  "location":"${overrides?.location ?? ''}",
  "stream":"${overrides?.stream ?? 'https:\\/\\/videos-3.earthcam.com\\/fecnetwork\\/27777.flv\\/playlist.m3u8?t=abc&td=202603310217'}",
  "thumbnail_512":"${overrides?.thumbnail_512 ?? 'https:\\/\\/static.earthcam.com\\/camshots\\/512x288\\/thumb.jpg'}"
}}};
</script>`;

describe('monitor streams route', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns resolved cameras with proxied stream urls', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(earthCamHtml('littleitaly'), { status: 200 }))
      .mockResolvedValueOnce(new Response(earthCamHtml('bourbonstreet', { name: 'Bourbon Street Cam' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(earthCamHtml('abbeyroad_uk', { name: '', location: '' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(earthCamHtml('templebar', { name: 'Temple Bar Live' }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.cameras).toHaveLength(4);
    expect(payload.cameras[0]).toMatchObject({
      id: 'mulberry-street',
      name: 'Mulberry Street',
      location: 'Manhattan, New York, USA',
      sourceName: 'EarthCam',
      sourceUrl: 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
      thumbnailUrl: 'https://static.earthcam.com/camshots/512x288/thumb.jpg',
    });
    expect(payload.cameras[0].streamUrl).toContain('/api/monitor/proxy?');
    expect(payload.cameras[0].streamUrl).toContain('target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2F27777.flv%2Fplaylist.m3u8');
    expect(payload.cameras[2].name).toBe('Abbey Road Crossing');
    expect(payload.cameras[2].location).toBe('London, England, UK');
  });

  it('returns 503 when no cameras can be resolved', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual({ message: 'No live cameras could be resolved right now.' });
  });
});
