import { handleActions } from 'redux-actions';
import { EvidenceActionEnums } from './actions';
import { IEvidenceStateContext, INITIAL_STATE } from './context';

export const EvidenceReducer = handleActions<IEvidenceStateContext, Partial<IEvidenceStateContext>>(
  {
    [EvidenceActionEnums.FETCH_ALL_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [EvidenceActionEnums.FETCH_ALL_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [EvidenceActionEnums.FETCH_ALL_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [EvidenceActionEnums.FETCH_BY_ID_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [EvidenceActionEnums.FETCH_BY_ID_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [EvidenceActionEnums.FETCH_BY_ID_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE
);
