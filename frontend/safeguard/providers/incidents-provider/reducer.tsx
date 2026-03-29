import { handleActions } from 'redux-actions';
import { INITIAL_STATE, IIncidentStateContext } from './context';
import { IncidentActionEnums } from './actions';

export const IncidentReducer = handleActions<IIncidentStateContext, Partial<IIncidentStateContext>>(
  {
    [IncidentActionEnums.FETCH_ALL_PENDING]:   (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.FETCH_ALL_SUCCESS]:   (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.FETCH_ALL_ERROR]:     (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.FETCH_BY_ID_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.FETCH_BY_ID_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.FETCH_BY_ID_ERROR]:   (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.CREATE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.CREATE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.CREATE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.UPDATE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.UPDATE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.UPDATE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.DELETE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.DELETE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [IncidentActionEnums.DELETE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE
);
