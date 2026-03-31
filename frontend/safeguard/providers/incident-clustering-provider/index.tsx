'use client';

import { useContext, useReducer } from 'react';
import { getAxiosInstance } from '@/utils/axiosInstance';
import { IncidentClusteringReducer } from './reducer';
import {
  INITIAL_STATE,
  IncidentClusteringStateContext,
  IncidentClusteringActionContext,
  IGetIncidentSuggestionGraphInput,
  IRegenerateIncidentClusteringInput,
} from './context';
import {
  fetchGraphPending,
  fetchGraphSuccess,
  fetchGraphError,
  regeneratePending,
  regenerateSuccess,
  regenerateError,
} from './actions';

export const IncidentClusteringProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = getAxiosInstance();
  const [state, dispatch] = useReducer(IncidentClusteringReducer, INITIAL_STATE);
  const BASE = '/api/services/app/incidentClustering';

  const fetchGraph = async (params?: IGetIncidentSuggestionGraphInput) => {
    dispatch(fetchGraphPending());
    try {
      const res = await instance.get(`${BASE}/GetSuggestedCaseGraph`, { params });
      dispatch(fetchGraphSuccess({ graph: res.data.result }));
    } catch {
      dispatch(fetchGraphError());
    }
  };

  const regenerateModel = async (input?: IRegenerateIncidentClusteringInput) => {
    dispatch(regeneratePending());
    try {
      const res = await instance.post(`${BASE}/RegenerateModel`, input ?? {});
      dispatch(regenerateSuccess({ trainingResult: res.data.result }));
    } catch {
      dispatch(regenerateError());
      throw new Error('Failed to regenerate incident clustering model.');
    }
  };

  return (
    <IncidentClusteringStateContext.Provider value={state}>
      <IncidentClusteringActionContext.Provider value={{ fetchGraph, regenerateModel }}>
        {children}
      </IncidentClusteringActionContext.Provider>
    </IncidentClusteringStateContext.Provider>
  );
};

export const useIncidentClusteringState = () => {
  const context = useContext(IncidentClusteringStateContext);
  if (!context) throw new Error('useIncidentClusteringState must be used within IncidentClusteringProvider');
  return context;
};

export const useIncidentClusteringAction = () => {
  const context = useContext(IncidentClusteringActionContext);
  if (!context) throw new Error('useIncidentClusteringAction must be used within IncidentClusteringProvider');
  return context;
};
