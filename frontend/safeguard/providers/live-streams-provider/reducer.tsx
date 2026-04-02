import { handleActions } from 'redux-actions';
import { LiveStreamActionEnums } from './actions';
import { INITIAL_STATE, type ILiveStreamStateContext } from './context';

export const LiveStreamReducer = handleActions<ILiveStreamStateContext, Partial<ILiveStreamStateContext>>(
  {
    [LiveStreamActionEnums.FETCH_ALL_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.FETCH_ALL_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.FETCH_ALL_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.FETCH_BY_ID_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.FETCH_BY_ID_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.FETCH_BY_ID_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.CREATE_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.CREATE_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.CREATE_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.UPDATE_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.UPDATE_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.UPDATE_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.DELETE_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.DELETE_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [LiveStreamActionEnums.DELETE_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE,
);
