import { handleActions } from 'redux-actions';
import { INITIAL_STATE, IAuthStateContext } from './context';
import { AuthStateEnums } from './actions';

export const AuthReducer = handleActions<IAuthStateContext, IAuthStateContext>(
  {
    [AuthStateEnums.SESSION_PENDING]:  (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.SESSION_SUCCESS]:  (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.SESSION_ERROR]:    (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGIN_PENDING]:    (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGIN_SUCCESS]:    (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGIN_ERROR]:      (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.REGISTER_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.REGISTER_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.REGISTER_ERROR]:   (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGOUT_PENDING]:   (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGOUT_SUCCESS]:   (state, { payload }) => ({ ...state, ...payload }),
    [AuthStateEnums.LOGOUT_ERROR]:     (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE
);
