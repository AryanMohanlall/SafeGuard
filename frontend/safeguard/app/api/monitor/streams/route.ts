import { NextResponse } from 'next/server';

interface CameraSeed {
  id: string;
  pageUrl: string;
  camKey: string;
  fallbackName: string;
  fallbackLocation: string;
}

const CAMERA_SEEDS: CameraSeed[] = [
  {
    id: 'mulberry-street',
    pageUrl: 'https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly',
    camKey: 'littleitaly',
    fallbackName: 'Mulberry Street',
    fallbackLocation: 'Manhattan, New York, USA',
  },
  {
    id: 'bourbon-street',
    pageUrl: 'https://www.earthcam.com/usa/louisiana/neworleans/bourbonstreet/?cam=bourbonstreet',
    camKey: 'bourbonstreet',
    fallbackName: 'Bourbon Street',
    fallbackLocation: 'New Orleans, Louisiana, USA',
  },
  {
    id: 'abbey-road',
    pageUrl: 'https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk',
    camKey: 'abbeyroad_uk',
    fallbackName: 'Abbey Road Crossing',
    fallbackLocation: 'London, England, UK',
  },
  {
    id: 'temple-bar',
    pageUrl: 'https://www.earthcam.com/world/ireland/dublin/?cam=templebar',
    camKey: 'templebar',
    fallbackName: 'Temple Bar',
    fallbackLocation: 'Dublin, Ireland',
  },
];

const JSON_BASE_PATTERN = /var json_base\s*=\s*(\{[\s\S]*?\});/;

const decode = (value: string | undefined) => value?.replaceAll('\\/', '/') ?? '';
const fallbackIfBlank = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};
const buildProxyUrl = (targetUrl: string, referer: string) => {
  const params = new URLSearchParams({
    target: targetUrl,
    referer,
  });

  return `/api/monitor/proxy?${params.toString()}`;
};

async function resolveCamera(seed: CameraSeed) {
  const response = await fetch(seed.pageUrl, {
    cache: 'no-store',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`EarthCam returned ${response.status} for ${seed.fallbackName}.`);
  }

  const html = await response.text();
  const match = html.match(JSON_BASE_PATTERN);

  if (!match) {
    throw new Error(`Unable to read stream metadata for ${seed.fallbackName}.`);
  }

  const payload = JSON.parse(match[1]) as {
    cam?: Record<
      string,
      {
        name?: string;
        location?: string;
        stream?: string;
        thumbnail_512?: string;
      }
    >;
  };

  const camera = payload.cam?.[seed.camKey];

  if (!camera?.stream) {
    throw new Error(`No live stream available for ${seed.fallbackName}.`);
  }

  return {
    id: seed.id,
    name: fallbackIfBlank(camera.name, seed.fallbackName),
    location: fallbackIfBlank(camera.location, seed.fallbackLocation),
    sourceName: 'EarthCam',
    sourceUrl: seed.pageUrl,
    streamUrl: buildProxyUrl(decode(camera.stream), seed.pageUrl),
    thumbnailUrl: decode(camera.thumbnail_512),
  };
}

export async function GET() {
  const results = await Promise.allSettled(CAMERA_SEEDS.map(resolveCamera));
  const cameras = results
    .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof resolveCamera>>> => {
      return result.status === 'fulfilled';
    })
    .map((result) => result.value);

  if (cameras.length === 0) {
    return NextResponse.json(
      { message: 'No live cameras could be resolved right now.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ cameras });
}
