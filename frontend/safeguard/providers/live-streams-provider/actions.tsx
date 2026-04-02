import { createAction } from 'redux-actions';
import type { ILiveStream, ILiveStreamStateContext } from './context';

type LiveStreamStatePatch = Partial<ILiveStreamStateContext>;

export enum LiveStreamActionEnums {
  FETCH_ALL_PENDING = 'LIVE_STREAM_FETCH_ALL_PENDING',
  FETCH_ALL_SUCCESS = 'LIVE_STREAM_FETCH_ALL_SUCCESS',
  FETCH_ALL_ERROR = 'LIVE_STREAM_FETCH_ALL_ERROR',
  FETCH_BY_ID_PENDING = 'LIVE_STREAM_FETCH_BY_ID_PENDING',
  FETCH_BY_ID_SUCCESS = 'LIVE_STREAM_FETCH_BY_ID_SUCCESS',
  FETCH_BY_ID_ERROR = 'LIVE_STREAM_FETCH_BY_ID_ERROR',
  CREATE_PENDING = 'LIVE_STREAM_CREATE_PENDING',
  CREATE_SUCCESS = 'LIVE_STREAM_CREATE_SUCCESS',
  CREATE_ERROR = 'LIVE_STREAM_CREATE_ERROR',
  UPDATE_PENDING = 'LIVE_STREAM_UPDATE_PENDING',
  UPDATE_SUCCESS = 'LIVE_STREAM_UPDATE_SUCCESS',
  UPDATE_ERROR = 'LIVE_STREAM_UPDATE_ERROR',
  DELETE_PENDING = 'LIVE_STREAM_DELETE_PENDING',
  DELETE_SUCCESS = 'LIVE_STREAM_DELETE_SUCCESS',
  DELETE_ERROR = 'LIVE_STREAM_DELETE_ERROR',
}

export const fetchAllPending = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.FETCH_ALL_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const fetchAllSuccess = createAction<
  LiveStreamStatePatch,
  { items: ILiveStream[]; totalCount: number }
>(
  LiveStreamActionEnums.FETCH_ALL_SUCCESS,
  ({ items, totalCount }) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    items,
    totalCount,
  }),
);

export const fetchAllError = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.FETCH_ALL_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const fetchByIdPending = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.FETCH_BY_ID_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const fetchByIdSuccess = createAction<LiveStreamStatePatch, ILiveStream>(
  LiveStreamActionEnums.FETCH_BY_ID_SUCCESS,
  selected => ({ isPending: false, isSuccess: true, isError: false, selected }),
);

export const fetchByIdError = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.FETCH_BY_ID_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const createPending = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.CREATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const createSuccess = createAction<LiveStreamStatePatch, ILiveStream>(
  LiveStreamActionEnums.CREATE_SUCCESS,
  selected => ({ isPending: false, isSuccess: true, isError: false, selected }),
);

export const createError = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.CREATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const updatePending = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.UPDATE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const updateSuccess = createAction<LiveStreamStatePatch, ILiveStream>(
  LiveStreamActionEnums.UPDATE_SUCCESS,
  selected => ({ isPending: false, isSuccess: true, isError: false, selected }),
);

export const updateError = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.UPDATE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const deletePending = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.DELETE_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const deleteSuccess = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.DELETE_SUCCESS,
  () => ({ isPending: false, isSuccess: true, isError: false, selected: undefined }),
);

export const deleteError = createAction<LiveStreamStatePatch>(
  LiveStreamActionEnums.DELETE_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);
