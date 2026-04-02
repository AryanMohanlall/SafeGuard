import { describe, expect, it } from 'vitest';
import {
  LiveStreamActionEnums,
  createPending,
  createSuccess,
  deleteSuccess,
  fetchAllSuccess,
} from './actions';

describe('live stream action creators', () => {
  it('fetchAllSuccess stores items and total count', () => {
    const action = fetchAllSuccess({
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
    });

    expect(action.type).toBe(LiveStreamActionEnums.FETCH_ALL_SUCCESS);
    expect(action.payload?.totalCount).toBe(1);
  });

  it('createSuccess marks the selected stream', () => {
    const action = createSuccess({
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
    });

    expect(action.type).toBe(LiveStreamActionEnums.CREATE_SUCCESS);
    expect(action.payload?.selected?.name).toBe('Abbey Road Crossing');
  });

  it('pending and delete success actions set lifecycle state', () => {
    expect(createPending().payload).toEqual({ isPending: true, isSuccess: false, isError: false });
    expect(deleteSuccess().payload).toEqual({ isPending: false, isSuccess: true, isError: false, selected: undefined });
  });
});
