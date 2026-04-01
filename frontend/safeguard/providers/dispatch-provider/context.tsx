"use client";
import { createContext } from "react";

export interface IDispatch {
  id: string;
  incidentId: string;
  incidentTitle?: string;
  caseId?: string | null;
  caseNumber?: string;
  officialUserId?: number | null;
  officialFullName?: string;
  status: string;
  responderExternalId: string;
  responderRank: string;
  responderName: string;
  responderSector?: string;
  responderLatitude?: number | null;
  responderLongitude?: number | null;
  incidentLatitudeSnapshot?: number | null;
  incidentLongitudeSnapshot?: number | null;
  estimatedDistanceKm?: number | null;
  assignedAt: string;
  enRouteAt?: string | null;
  onSceneAt?: string | null;
  clearedAt?: string | null;
  assignmentSource?: string;
  notes?: string;
  creationTime: string;
  creatorUserId?: number | null;
}

export interface ICreateDispatchInput {
  incidentId: string;
  caseId?: string | null;
  officialUserId: number;
  status: string;
  responderExternalId: string;
  responderRank: string;
  responderName: string;
  responderSector?: string;
  responderLatitude?: number | null;
  responderLongitude?: number | null;
  incidentLatitudeSnapshot?: number | null;
  incidentLongitudeSnapshot?: number | null;
  estimatedDistanceKm?: number | null;
  assignedAt: string;
  enRouteAt?: string | null;
  onSceneAt?: string | null;
  clearedAt?: string | null;
  assignmentSource?: string;
  notes?: string;
}

export interface ITransitionDispatchStatusInput {
  id: string;
  toStatus: string;
  notes?: string;
}

export interface IDispatchStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  items: IDispatch[];
  totalCount: number;
}

export interface IDispatchActionContext {
  fetchAll: (params?: Record<string, unknown>) => Promise<void>;
  create: (input: ICreateDispatchInput) => Promise<IDispatch | null>;
  transitionStatus: (input: ITransitionDispatchStatusInput) => Promise<IDispatch | null>;
}

export const INITIAL_STATE: IDispatchStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  items: [],
  totalCount: 0,
};

export const DispatchStateContext = createContext<IDispatchStateContext>(INITIAL_STATE);
export const DispatchActionContext = createContext<IDispatchActionContext>({
  fetchAll: async () => {},
  create: async () => null,
  transitionStatus: async () => null,
});
