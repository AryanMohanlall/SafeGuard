import { handleActions } from 'redux-actions';
import { INITIAL_STATE, IDispatchStateContext } from './context';
import { DispatchActionEnums } from './actions';

export const DispatchReducer = handleActions<IDispatchStateContext, Partial<IDispatchStateContext>>(
  {
    [DispatchActionEnums.FETCH_ALL_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.FETCH_ALL_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.FETCH_ALL_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.CREATE_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.CREATE_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.CREATE_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.TRANSITION_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.TRANSITION_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [DispatchActionEnums.TRANSITION_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE,
);
