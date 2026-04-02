'use client';

import { useContext, useEffect, useReducer } from 'react';
import { getAxiosInstance, setAuthToken, removeAuthToken } from '@/utils/axiosInstance';
import { AuthReducer } from './reducer';
import { INITIAL_STATE, AuthStateContext, AuthActionContext, IRegisterInput, IUser } from './context';
import {
  sessionPending, sessionSuccess, sessionError,
  loginPending, loginSuccess, loginError,
  registerPending, registerError,
  logoutPending, logoutSuccess, logoutError,
} from './actions';
import { useRouter } from 'next/dist/client/components/navigation';

const TOKEN_COOKIE = 'sg_access_token';

const getAuthCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const router = useRouter();

  const getCurrentSessionUser = async (accessToken?: string, expireInSeconds = 0): Promise<IUser> => {
    const res = await instance.get('/api/services/app/Session/GetCurrentLoginInformations');
    const sessionUser = res.data?.result?.user;

    if (!sessionUser) {
      throw new Error('No authenticated session user found.');
    }

    return {
      userId: sessionUser.id,
      accessToken: accessToken ?? getAuthCookie() ?? '',
      expireInSeconds,
      roleNames: Array.isArray(sessionUser.roleNames) ? sessionUser.roleNames : [],
    };
  };

  useEffect(() => {
    const initializeSession = async () => {
      const authCookie = getAuthCookie();
      if (!authCookie) {
        dispatch(sessionError());
        return;
      }

      dispatch(sessionPending());

      try {
        const user = await getCurrentSessionUser(authCookie);
        dispatch(sessionSuccess(user));
      } catch {
        removeAuthToken();
        dispatch(sessionError());
      }
    };

    void initializeSession();
  }, []);

  const login = async (userNameOrEmailAddress: string, password: string) => {
    dispatch(loginPending());
    try {
      const res = await instance.post('/api/TokenAuth/Authenticate', {
        userNameOrEmailAddress,
        password,
        rememberClient: true,
      });
      const { accessToken, expireInSeconds, userId } = res.data.result;
      setAuthToken(accessToken);
      const sessionUser = await getCurrentSessionUser(accessToken, expireInSeconds);
      dispatch(loginSuccess({ ...sessionUser, userId }));
      router.push('/dashboard');
    } catch {
      dispatch(loginError());
    }
  };

  const register = async (input: IRegisterInput) => {
    dispatch(registerPending());
    try {
      await instance.post('/api/services/app/Account/Register', input);
      await login(input.userName, input.password);
    } catch {
      dispatch(registerError());
    }
  };

  const logout = async () => {
    dispatch(logoutPending());
    try {
      removeAuthToken();
      dispatch(logoutSuccess());
    } catch {
      dispatch(logoutError());
    }
  };

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionContext.Provider value={{ login, register, logout }}>
        {children}
      </AuthActionContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuthState must be used within AuthProvider');
  return context;
};

export const useAuthAction = () => {
  const context = useContext(AuthActionContext);
  if (!context) throw new Error('useAuthAction must be used within AuthProvider');
  return context;
};
