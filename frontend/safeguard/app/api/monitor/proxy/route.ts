import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_VIDEO_HOSTS = new Set([
  'videos-3.earthcam.com',
  'video2archives.earthcam.com',
]);

const ALLOWED_REFERER_HOSTS = new Set([
  'www.earthcam.com',
  'earthcam.com',
]);

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

function resolveUri(line: string, baseUrl: URL) {
  try {
    return new URL(line, baseUrl).toString();
  } catch {
    return line;
  }
}

function isPlaylist(contentType: string, targetUrl: string) {
  return (
    contentType.includes('application/vnd.apple.mpegurl') ||
    contentType.includes('application/x-mpegurl') ||
    targetUrl.toLowerCase().includes('.m3u8')
  );
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target');
  const referer = request.nextUrl.searchParams.get('referer');

  if (!target || !referer) {
    return badRequest('Missing target or referer.');
  }

  let targetUrl: URL;
  let refererUrl: URL;

  try {
    targetUrl = new URL(target);
    refererUrl = new URL(referer);
  } catch {
    return badRequest('Invalid target or referer URL.');
  }

  if (targetUrl.protocol !== 'https:' || refererUrl.protocol !== 'https:') {
    return badRequest('Only https URLs are supported.');
  }

  if (!ALLOWED_VIDEO_HOSTS.has(targetUrl.hostname)) {
    return badRequest('Target host is not allowed.');
  }

  if (!ALLOWED_REFERER_HOSTS.has(refererUrl.hostname)) {
    return badRequest('Referer host is not allowed.');
  }

  const upstream = await fetch(targetUrl.toString(), {
    cache: 'no-store',
    headers: {
      referer: refererUrl.toString(),
      origin: `${refererUrl.protocol}//${refererUrl.hostname}`,
      'user-agent': USER_AGENT,
    },
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';

  if (isPlaylist(contentType, targetUrl.toString())) {
    const text = await upstream.text();
    const rewritten = text
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
          return line;
        }

        const nestedTarget = resolveUri(trimmed, targetUrl);
        return `/api/monitor/proxy?${new URLSearchParams({
          target: nestedTarget,
          referer: refererUrl.toString(),
        }).toString()}`;
      })
      .join('\n');

    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  });
}
