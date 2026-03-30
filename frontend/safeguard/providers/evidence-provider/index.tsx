'use client';
import { useContext, useReducer } from 'react';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { EvidenceReducer } from './reducer';
import {
  EvidenceActionContext,
  EvidenceStateContext,
  INITIAL_STATE,
} from './context';
import {
  fetchAllError,
  fetchAllPending,
  fetchAllSuccess,
  fetchByIdError,
  fetchByIdPending,
  fetchByIdSuccess,
} from './actions';

export const EvidenceProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(EvidenceReducer, INITIAL_STATE);
  const BASE = '/api/services/app/evidence';

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

  return (
    <EvidenceStateContext.Provider value={state}>
      <EvidenceActionContext.Provider value={{ fetchAll, fetchById }}>
        {children}
      </EvidenceActionContext.Provider>
    </EvidenceStateContext.Provider>
  );
};

export const useEvidenceState = () => {
  const context = useContext(EvidenceStateContext);
  if (!context) throw new Error('useEvidenceState must be used within EvidenceProvider');
  return context;
};

export const useEvidenceAction = () => {
  const context = useContext(EvidenceActionContext);
  if (!context) throw new Error('useEvidenceAction must be used within EvidenceProvider');
  return context;
};
