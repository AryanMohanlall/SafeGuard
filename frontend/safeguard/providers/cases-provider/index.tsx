'use client';
import { useContext, useReducer } from 'react';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { CaseReducer } from './reducer';
import {
  INITIAL_STATE,
  CaseStateContext,
  CaseActionContext,
  ICreateCaseInput,
  IUpdateCaseInput,
} from './context';
import {
  fetchAllPending, fetchAllSuccess, fetchAllError,
  fetchByIdPending, fetchByIdSuccess, fetchByIdError,
  createPending, createSuccess, createError,
  updatePending, updateSuccess, updateError,
  deletePending, deleteSuccess, deleteError,
  transitionPending, transitionSuccess, transitionError,
} from './actions';

export const CaseProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(CaseReducer, INITIAL_STATE);

  const BASE = '/api/services/app/case';

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

  const create = async (input: ICreateCaseInput) => {
    dispatch(createPending());
    try {
      const res = await instance.post(`${BASE}/Create`, input);
      dispatch(createSuccess(res.data.result));
      await fetchAll();
    } catch {
      dispatch(createError());
    }
  };

  const update = async (id: string, input: IUpdateCaseInput) => {
    dispatch(updatePending());
    try {
      const res = await instance.put(`${BASE}/Update`, { ...input, id });
      dispatch(updateSuccess(res.data.result));
      await fetchAll();
    } catch {
      dispatch(updateError());
    }
  };

  const remove = async (id: string) => {
    dispatch(deletePending());
    try {
      await instance.delete(`${BASE}/Delete`, { params: { id } });
      dispatch(deleteSuccess());
      await fetchAll();
    } catch {
      dispatch(deleteError());
    }
  };

  const transitionStatus = async (id: string, toStatus: string, reason?: string) => {
    dispatch(transitionPending());
    try {
      const res = await instance.post(`${BASE}/TransitionStatus`, { id, toStatus, reason });
      dispatch(transitionSuccess(res.data.result));
      await fetchAll();
    } catch {
      dispatch(transitionError());
    }
  };

  return (
    <CaseStateContext.Provider value={state}>
      <CaseActionContext.Provider value={{ fetchAll, fetchById, create, update, remove, transitionStatus }}>
        {children}
      </CaseActionContext.Provider>
    </CaseStateContext.Provider>
  );
};

export const useCaseState = () => {
  const context = useContext(CaseStateContext);
  if (!context) throw new Error('useCaseState must be used within CaseProvider');
  return context;
};

export const useCaseAction = () => {
  const context = useContext(CaseActionContext);
  if (!context) throw new Error('useCaseAction must be used within CaseProvider');
  return context;
};
