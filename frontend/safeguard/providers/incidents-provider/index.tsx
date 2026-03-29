'use client';
import { useContext, useReducer } from 'react';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { IncidentReducer } from './reducer';
import {
  INITIAL_STATE,
  IncidentStateContext,
  IncidentActionContext,
  ICreateIncidentInput,
  IUpdateIncidentInput,
} from './context';
import {
  fetchAllPending, fetchAllSuccess, fetchAllError,
  fetchByIdPending, fetchByIdSuccess, fetchByIdError,
  createPending, createSuccess, createError,
  updatePending, updateSuccess, updateError,
  deletePending, deleteSuccess, deleteError,
} from './actions';

export const IncidentProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(IncidentReducer, INITIAL_STATE);

  const BASE = '/api/services/app/incident';

  const fetchAll = async (params?: Record<string, unknown>) => {
    dispatch(fetchAllPending());
    try {
      const res = await instance.get(`${BASE}/GetAll`, { params });
      const { items, totalCount } = res.data.result;
      dispatch(fetchAllSuccess({ items, totalCount }));
    } catch {
      dispatch(fetchAllError());
    }
  };

  const fetchById = async (id: string) => {
    dispatch(fetchByIdPending());
    try {
      const res = await instance.get(`${BASE}/Get`, { params: { id } });
      dispatch(fetchByIdSuccess(res.data.result));
    } catch {
      dispatch(fetchByIdError());
    }
  };

  const create = async (input: ICreateIncidentInput) => {
    dispatch(createPending());
    try {
      const res = await instance.post(`${BASE}/Create`, input);
      dispatch(createSuccess(res.data.result));
    } catch {
      dispatch(createError());
    }
  };

  const update = async (id: string, input: IUpdateIncidentInput) => {
    dispatch(updatePending());
    try {
      const res = await instance.put(`${BASE}/Update`, { ...input, id });
      dispatch(updateSuccess(res.data.result));
    } catch {
      dispatch(updateError());
    }
  };

  const remove = async (id: string) => {
    dispatch(deletePending());
    try {
      await instance.delete(`${BASE}/Delete`, { params: { id } });
      dispatch(deleteSuccess());
    } catch {
      dispatch(deleteError());
    }
  };

  return (
    <IncidentStateContext.Provider value={state}>
      <IncidentActionContext.Provider value={{ fetchAll, fetchById, create, update, remove }}>
        {children}
      </IncidentActionContext.Provider>
    </IncidentStateContext.Provider>
  );
};

export const useIncidentState = () => {
  const context = useContext(IncidentStateContext);
  if (!context) throw new Error('useIncidentState must be used within IncidentProvider');
  return context;
};

export const useIncidentAction = () => {
  const context = useContext(IncidentActionContext);
  if (!context) throw new Error('useIncidentAction must be used within IncidentProvider');
  return context;
};
