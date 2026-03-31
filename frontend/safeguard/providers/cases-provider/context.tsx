'use client';
import { createContext } from 'react';

export interface ICase {
  id: string;
  caseNumber: string;
  title: string;
  summary: string | null;
  status: string;        // Draft | Open | UnderReview | PendingTrial | Closed | Void
  severity: string;      // Low | Medium | High | Critical
  category: string | null;
  incidentIds: string[];
  incidentCount: number;
  openedAt: string;
  closedAt: string | null;
  lastActivityAt: string | null;
  isCourtReady: boolean;
  courtReadyAt: string | null;
  closureReason: string | null;
  aiSummary: string | null;
  creationTime: string;
  creatorUserId: number | null;
}

export interface ICreateCaseInput {
  title: string;
  summary?: string | null;
  status: string;
  severity: string;
  category?: string | null;
  incidentIds?: string[];
  openedAt: string;
}

export interface IUpdateCaseInput {
  id: string;
  title: string;
  summary?: string | null;
  status: string;
  severity: string;
  category?: string | null;
  incidentIds?: string[];
  isCourtReady: boolean;
  closedAt?: string | null;
  closureReason?: string | null;
}

export interface ICaseStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  items: ICase[];
  selected?: ICase;
  totalCount: number;
}

export interface ICaseActionContext {
  fetchAll: (params?: Record<string, unknown>) => void;
  fetchById: (id: string) => void;
  create: (input: ICreateCaseInput) => void;
  update: (id: string, input: IUpdateCaseInput) => void;
  remove: (id: string) => void;
  transitionStatus: (id: string, toStatus: string, reason?: string) => void;
}

export const INITIAL_STATE: ICaseStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  items: [],
  totalCount: 0,
};

export const CaseStateContext = createContext<ICaseStateContext>(INITIAL_STATE);
export const CaseActionContext = createContext<ICaseActionContext>({
  fetchAll: () => {},
  fetchById: () => {},
  create: () => {},
  update: () => {},
  remove: () => {},
  transitionStatus: () => {},
});
