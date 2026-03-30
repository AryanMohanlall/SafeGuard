"use client";
import { createContext } from "react";

export interface IIncident {
  id: string;
  title: string;
  description: string;
  location: string;
  hasAudio: boolean;
  audioFileName: string | null;
  audioContentType: string | null;
  hasImage: boolean;
  imageFileName: string | null;
  imageContentType: string | null;
  latitude: number | null;
  longitude: number | null;
  caseId: string | null;
  anonymous: boolean;
  occurredAt: string;
  reportedAt: string;
  creationTime: string;
  creatorUserId: number | null;
  detectedObjects: string | null;
}

export interface ICreateIncidentInput {
  title: string;
  description: string;
  location: string;
  audioFile?: string | null;
  audioFileName?: string | null;
  audioContentType?: string | null;
  imageFile?: string | null;
  imageFileName?: string | null;
  imageContentType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  caseId?: string | null;
  anonymous: boolean;
  occurredAt: string;
  reportedAt: string;
}

export interface IUpdateIncidentInput {
  id: string;
  title: string;
  description: string;
  location: string;
  audioFile?: string | null;
  audioFileName?: string | null;
  audioContentType?: string | null;
  imageFile?: string | null;
  imageFileName?: string | null;
  imageContentType?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  caseId?: string | null;
  anonymous: boolean;
  occurredAt: string;
  reportedAt: string;
}

export interface IIncidentStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  items: IIncident[];
  selected?: IIncident;
  totalCount: number;
}

export interface IIncidentActionContext {
  fetchAll: (params?: Record<string, unknown>) => void;
  fetchById: (id: string) => void;
  create: (input: ICreateIncidentInput) => void;
  update: (id: string, input: IUpdateIncidentInput) => void;
  remove: (id: string) => void;
}

export const INITIAL_STATE: IIncidentStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  items: [],
  totalCount: 0,
};

export const IncidentStateContext = createContext<IIncidentStateContext>(INITIAL_STATE);
export const IncidentActionContext = createContext<IIncidentActionContext>({
  fetchAll:  () => {},
  fetchById: () => {},
  create:    () => {},
  update:    () => {},
  remove:    () => {},
});
