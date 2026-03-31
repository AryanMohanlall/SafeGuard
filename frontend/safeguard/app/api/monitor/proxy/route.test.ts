import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const buildRequest = (target: string, referer: string) =>
  new NextRequest(
    `http://localhost:3000/api/monitor/proxy?target=${encodeURIComponent(target)}&referer=${encodeURIComponent(referer)}`,
  );

describe('monitor proxy route', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects non-earthcam hosts', async () => {
    const response = await GET(
      buildRequest('https://example.com/live.m3u8', 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly'),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Target host is not allowed.' });
  });

  it('rewrites playlist entries through the proxy', async () => {
    const playlist = '#EXTM3U\nsegment0.ts\nhttps://videos-3.earthcam.com/fecnetwork/segment1.ts\n';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(playlist, {
        status: 200,
        headers: { 'content-type': 'application/vnd.apple.mpegurl' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const referer = 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly';
    const target = 'https://videos-3.earthcam.com/fecnetwork/27777.flv/playlist.m3u8?t=abc';
    const response = await GET(buildRequest(target, referer));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('#EXTM3U');
    expect(body).toContain('/api/monitor/proxy?target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2F27777.flv%2Fsegment0.ts');
    expect(body).toContain('/api/monitor/proxy?target=https%3A%2F%2Fvideos-3.earthcam.com%2Ffecnetwork%2Fsegment1.ts');
    expect(fetchMock).toHaveBeenCalledWith(
      target,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({
          referer,
          origin: 'https://www.earthcam.com',
        }),
      }),
    );
  });

  it('passes through binary segment responses', async () => {
    const binary = new Uint8Array([1, 2, 3, 4]);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(binary, {
        status: 200,
        headers: { 'content-type': 'video/mp2t' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(
      buildRequest(
        'https://videos-3.earthcam.com/fecnetwork/segment0.ts',
        'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('video/mp2t');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(binary);
  });
});
