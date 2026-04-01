import { NextRequest, NextResponse } from 'next/server';

interface CachedRoadblockResponse {
  expiresAt: number;
  payload: {
    roadblocks: OverpassRoadblock[];
    source: 'overpass' | 'fallback';
  };
}

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

interface OverpassRoadblock {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  source: 'overpass';
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CACHE_TTL_MS = 5 * 60 * 1000;
const QUERY_TIMEOUT_SECONDS = 25;
const cache = new Map<string, CachedRoadblockResponse>();

function parseCoordinate(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildCacheKey(south: number, west: number, north: number, east: number) {
  return [south, west, north, east].map((value) => value.toFixed(3)).join(':');
}

function inferLabel(tags: Record<string, string> | undefined) {
  if (!tags) return 'Road constraint';
  if (tags.name) return tags.name;
  if (tags.checkpoint) return `Checkpoint - ${tags.checkpoint}`;
  if (tags.barrier) return `Barrier - ${tags.barrier}`;
  if (tags.amenity === 'police') return 'Police presence';
  if (tags.highway) return `Traffic control - ${tags.highway}`;
  return 'Road constraint';
}

function normalizeRoadblocks(elements: OverpassElement[]) {
  const roadblocks = elements
    .map<OverpassRoadblock | null>((element) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;

      if (latitude == null || longitude == null) {
        return null;
      }

      return {
        id: `overpass-${element.type}-${element.id}`,
        label: inferLabel(element.tags),
        latitude,
        longitude,
        source: 'overpass',
      };
    })
    .filter((item): item is OverpassRoadblock => item !== null);

  const deduped = new Map<string, OverpassRoadblock>();
  for (const roadblock of roadblocks) {
    deduped.set(roadblock.id, roadblock);
  }

  return [...deduped.values()].slice(0, 20);
}

function buildOverpassQuery(south: number, west: number, north: number, east: number) {
  return `
[out:json][timeout:${QUERY_TIMEOUT_SECONDS}];
(
  node["barrier"](${south},${west},${north},${east});
  way["barrier"](${south},${west},${north},${east});
  node["checkpoint"](${south},${west},${north},${east});
  way["checkpoint"](${south},${west},${north},${east});
  node["amenity"="police"](${south},${west},${north},${east});
  way["amenity"="police"](${south},${west},${north},${east});
  node["highway"="traffic_signals"](${south},${west},${north},${east});
);
out center tags;
`;
}

export async function GET(request: NextRequest) {
  const south = clamp(parseCoordinate(request.nextUrl.searchParams.get('south'), -26.35), -90, 90);
  const west = clamp(parseCoordinate(request.nextUrl.searchParams.get('west'), 27.85), -180, 180);
  const north = clamp(parseCoordinate(request.nextUrl.searchParams.get('north'), -25.95), -90, 90);
  const east = clamp(parseCoordinate(request.nextUrl.searchParams.get('east'), 28.25), -180, 180);

  if (south >= north || west >= east) {
    return NextResponse.json({ message: 'Invalid bounding box.' }, { status: 400 });
  }

  const cacheKey = buildCacheKey(south, west, north, east);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, {
      headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=240' },
    });
  }

  const query = buildOverpassQuery(south, west, north, east);

  try {
    const response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 SafeGuard/1.0',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ message: `Overpass returned ${response.status}.` }, { status: 502 });
    }

    const data = (await response.json()) as OverpassResponse;
    const payload = {
      roadblocks: normalizeRoadblocks(data.elements ?? []),
      source: 'overpass' as const,
    };

    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload, {
      headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=240' },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to reach Overpass right now.' }, { status: 503 });
  }
}
