import { createAction } from 'redux-actions';
import { IAuthStateContext, IUser } from './context';

export enum AuthStateEnums {
  SESSION_PENDING  = 'SESSION_PENDING',
  SESSION_SUCCESS  = 'SESSION_SUCCESS',
  SESSION_ERROR    = 'SESSION_ERROR',
  LOGIN_PENDING    = 'LOGIN_PENDING',
  LOGIN_SUCCESS    = 'LOGIN_SUCCESS',
  LOGIN_ERROR      = 'LOGIN_ERROR',
  REGISTER_PENDING = 'REGISTER_PENDING',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_ERROR   = 'REGISTER_ERROR',
  LOGOUT_PENDING   = 'LOGOUT_PENDING',
  LOGOUT_SUCCESS   = 'LOGOUT_SUCCESS',
  LOGOUT_ERROR     = 'LOGOUT_ERROR',
}

export const sessionPending = createAction<IAuthStateContext>(
  AuthStateEnums.SESSION_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false, isAuthenticated: false, isReady: false })
);

export const sessionSuccess = createAction<IAuthStateContext, IUser>(
  AuthStateEnums.SESSION_SUCCESS,
  (user: IUser) => ({ isPending: false, isSuccess: true, isError: false, isAuthenticated: true, isReady: true, user })
);

export const sessionError = createAction<IAuthStateContext>(
  AuthStateEnums.SESSION_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: false, isAuthenticated: false, isReady: true, user: undefined })
);

export const loginPending = createAction<IAuthStateContext>(
  AuthStateEnums.LOGIN_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false, isAuthenticated: false, isReady: false })
);

export const loginSuccess = createAction<IAuthStateContext, IUser>(
  AuthStateEnums.LOGIN_SUCCESS,
  (user: IUser) => ({ isPending: false, isSuccess: true, isError: false, isAuthenticated: true, isReady: true, user })
);

export const loginError = createAction<IAuthStateContext>(
  AuthStateEnums.LOGIN_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true, isAuthenticated: false, isReady: true })
);

export const registerPending = createAction<IAuthStateContext>(
  AuthStateEnums.REGISTER_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false, isAuthenticated: false, isReady: false })
);

export const registerSuccess = createAction<IAuthStateContext, IUser>(
  AuthStateEnums.REGISTER_SUCCESS,
  (user: IUser) => ({ isPending: false, isSuccess: true, isError: false, isAuthenticated: true, isReady: true, user })
);

export const registerError = createAction<IAuthStateContext>(
  AuthStateEnums.REGISTER_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true, isAuthenticated: false, isReady: true })
);

export const logoutPending = createAction<IAuthStateContext>(
  AuthStateEnums.LOGOUT_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false, isAuthenticated: false, isReady: false })
);

export const logoutSuccess = createAction<IAuthStateContext>(
  AuthStateEnums.LOGOUT_SUCCESS,
  () => ({ isPending: false, isSuccess: false, isError: false, isAuthenticated: false, isReady: true, user: undefined })
);

export const logoutError = createAction<IAuthStateContext>(
  AuthStateEnums.LOGOUT_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true, isAuthenticated: false, isReady: true })
);
