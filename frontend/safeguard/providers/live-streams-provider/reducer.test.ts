import { describe, expect, it } from 'vitest';
import { createSuccess, fetchAllSuccess } from './actions';
import { INITIAL_STATE } from './context';
import { LiveStreamReducer } from './reducer';

describe('LiveStreamReducer', () => {
  it('stores fetched streams in state', () => {
    const next = LiveStreamReducer(
      INITIAL_STATE,
      fetchAllSuccess({
        items: [
          {
            id: 'stream-1',
            name: 'Temple Bar',
            location: 'Dublin, Ireland',
            sourceName: 'EarthCam',
            sourceUrl: 'https://example.com',
            camKey: 'templebar',
            thumbnailUrl: null,
            isActive: true,
            sortOrder: 1,
            creationTime: '2026-04-02T10:00:00Z',
            creatorUserId: 1,
          },
        ],
        totalCount: 1,
      }),
    );

    expect(next.items).toHaveLength(1);
    expect(next.totalCount).toBe(1);
  });

  it('tracks the selected stream after create', () => {
    const next = LiveStreamReducer(
      INITIAL_STATE,
      createSuccess({
        id: 'stream-2',
        name: 'Abbey Road Crossing',
        location: 'London, England, UK',
        sourceName: 'EarthCam',
        sourceUrl: 'https://example.com',
        camKey: 'abbeyroad_uk',
        thumbnailUrl: null,
        isActive: true,
        sortOrder: 2,
        creationTime: '2026-04-02T10:00:00Z',
        creatorUserId: 1,
      }),
    );

    expect(next.selected?.id).toBe('stream-2');
    expect(next.isSuccess).toBe(true);
  });
});
