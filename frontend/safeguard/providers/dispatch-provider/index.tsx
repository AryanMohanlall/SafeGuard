'use client';
import { useContext, useReducer, useRef } from 'react';
import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { DispatchReducer } from './reducer';
import {
  DispatchActionContext,
  DispatchStateContext,
  ICreateDispatchInput,
  INITIAL_STATE,
  ITransitionDispatchStatusInput,
} from './context';
import {
  createError,
  createPending,
  createSuccess,
  fetchAllError,
  fetchAllPending,
  fetchAllSuccess,
  transitionError,
  transitionPending,
  transitionSuccess,
} from './actions';

const BASE = '/api/services/app/dispatch';

export const DispatchProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(DispatchReducer, INITIAL_STATE);
  const lastFetchParamsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchAll = async (params?: Record<string, unknown>) => {
    lastFetchParamsRef.current = params;
    dispatch(fetchAllPending());
    try {
      const res = await instance.get(`${BASE}/GetAll`, { params });
      const { items, totalCount } = res.data.result;
      dispatch(fetchAllSuccess({ items, totalCount }));
    } catch {
      dispatch(fetchAllError());
    }
  };

  const create = async (input: ICreateDispatchInput) => {
    dispatch(createPending());
    try {
      const res = await instance.post(`${BASE}/Create`, input);
      dispatch(createSuccess(res.data.result));
      await fetchAll(lastFetchParamsRef.current);
      return res.data.result;
    } catch {
      dispatch(createError());
      return null;
    }
  };

  const transitionStatus = async (input: ITransitionDispatchStatusInput) => {
    dispatch(transitionPending());
    try {
      const res = await instance.post(`${BASE}/TransitionStatus`, input);
      dispatch(transitionSuccess(res.data.result));
      await fetchAll(lastFetchParamsRef.current);
      return res.data.result;
    } catch {
      dispatch(transitionError());
      return null;
    }
  };

  const completeMine = async (id: string) => {
    dispatch(transitionPending());
    try {
      const res = await instance.post(`${BASE}/CompleteMyDispatch`, { id });
      dispatch(transitionSuccess(res.data.result));
      await fetchAll(lastFetchParamsRef.current);
      return res.data.result;
    } catch {
      dispatch(transitionError());
      return null;
    }
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:44311';
    const token = instance.defaults.headers.common['Authorization']
      ?.toString()
      .replace(/^Bearer\s+/i, '');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/alertHub`, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('DispatchUpdated', () => {
      if (!lastFetchParamsRef.current) {
        return;
      }

      void fetchAll(lastFetchParamsRef.current);
    });

    const startPromise = connection.start().catch(() => {
      // Ignore startup failures when the backend is offline.
    });

    connectionRef.current = connection;

    return () => {
      void startPromise.finally(() => {
        void connection.stop().catch(() => {
          // Ignore shutdown races during React dev remounts.
        });
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  return (
    <DispatchStateContext.Provider value={state}>
      <DispatchActionContext.Provider value={{ fetchAll, create, transitionStatus, completeMine }}>
        {children}
      </DispatchActionContext.Provider>
    </DispatchStateContext.Provider>
  );
};

export const useDispatchState = () => {
  const context = useContext(DispatchStateContext);
  if (!context) throw new Error('useDispatchState must be used within DispatchProvider');
  return context;
};

export const useDispatchAction = () => {
  const context = useContext(DispatchActionContext);
  if (!context) throw new Error('useDispatchAction must be used within DispatchProvider');
  return context;
};
