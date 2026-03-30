import { handleActions } from 'redux-actions';
import { INITIAL_STATE, ICaseStateContext } from './context';
import { CaseActionEnums } from './actions';

export const CaseReducer = handleActions<ICaseStateContext, Partial<ICaseStateContext>>(
  {
    [CaseActionEnums.FETCH_ALL_PENDING]:   (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.FETCH_ALL_SUCCESS]:   (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.FETCH_ALL_ERROR]:     (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.FETCH_BY_ID_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.FETCH_BY_ID_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.FETCH_BY_ID_ERROR]:   (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.CREATE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.CREATE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.CREATE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.UPDATE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.UPDATE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.UPDATE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.DELETE_PENDING]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.DELETE_SUCCESS]:      (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.DELETE_ERROR]:        (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.TRANSITION_PENDING]:  (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.TRANSITION_SUCCESS]:  (state, { payload }) => ({ ...state, ...payload }),
    [CaseActionEnums.TRANSITION_ERROR]:    (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE
);
