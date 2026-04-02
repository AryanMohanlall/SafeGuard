'use client';

import { useContext, useReducer } from 'react';
import { getAxiosInstance } from '@/utils/axiosInstance';
import {
  createError,
  createPending,
  createSuccess,
  deleteError,
  deletePending,
  deleteSuccess,
  fetchAllError,
  fetchAllPending,
  fetchAllSuccess,
  fetchByIdError,
  fetchByIdPending,
  fetchByIdSuccess,
  updateError,
  updatePending,
  updateSuccess,
} from './actions';
import {
  INITIAL_STATE,
  ICreateLiveStreamInput,
  ILiveStreamActionContext,
  ILiveStreamStateContext,
  IUpdateLiveStreamInput,
  LiveStreamActionContext,
  LiveStreamStateContext,
} from './context';
import { LiveStreamReducer } from './reducer';

export const LiveStreamProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(LiveStreamReducer, INITIAL_STATE);
  const BASE = '/api/services/app/LiveStream';

  const fetchAll: ILiveStreamActionContext['fetchAll'] = async params => {
    dispatch(fetchAllPending());
    try {
      const res = await instance.get(`${BASE}/GetAll`, { params });
      const { items, totalCount } = res.data.result;
      dispatch(fetchAllSuccess({ items, totalCount }));
    } catch {
      dispatch(fetchAllError());
      throw new Error('Unable to fetch live streams.');
    }
  };

  const fetchById: ILiveStreamActionContext['fetchById'] = async id => {
    dispatch(fetchByIdPending());
    try {
      const res = await instance.get(`${BASE}/Get`, { params: { id } });
      dispatch(fetchByIdSuccess(res.data.result));
    } catch {
      dispatch(fetchByIdError());
      throw new Error('Unable to load the live stream.');
    }
  };

  const create: ILiveStreamActionContext['create'] = async (input: ICreateLiveStreamInput) => {
    dispatch(createPending());
    try {
      const res = await instance.post(`${BASE}/Create`, input);
      dispatch(createSuccess(res.data.result));
    } catch {
      dispatch(createError());
      throw new Error('Unable to create the live stream.');
    }
  };

  const update: ILiveStreamActionContext['update'] = async (id: string, input: IUpdateLiveStreamInput) => {
    dispatch(updatePending());
    try {
      const res = await instance.put(`${BASE}/Update`, { ...input, id });
      dispatch(updateSuccess(res.data.result));
    } catch {
      dispatch(updateError());
      throw new Error('Unable to update the live stream.');
    }
  };

  const remove: ILiveStreamActionContext['remove'] = async id => {
    dispatch(deletePending());
    try {
      await instance.delete(`${BASE}/Delete`, { params: { id } });
      dispatch(deleteSuccess());
    } catch {
      dispatch(deleteError());
      throw new Error('Unable to delete the live stream.');
    }
  };

  return (
    <LiveStreamStateContext.Provider value={state as ILiveStreamStateContext}>
      <LiveStreamActionContext.Provider value={{ fetchAll, fetchById, create, update, remove }}>
        {children}
      </LiveStreamActionContext.Provider>
    </LiveStreamStateContext.Provider>
  );
};

export const useLiveStreamState = () => {
  const context = useContext(LiveStreamStateContext);
  if (!context) {
    throw new Error('useLiveStreamState must be used within LiveStreamProvider');
  }

  return context;
};

export const useLiveStreamAction = () => {
  const context = useContext(LiveStreamActionContext);
  if (!context) {
    throw new Error('useLiveStreamAction must be used within LiveStreamProvider');
  }

  return context;
};
