'use client';

import { createContext } from 'react';

export interface ILiveStream {
  id: string;
  name: string;
  location: string;
  sourceName: string;
  sourceUrl: string;
  camKey: string;
  thumbnailUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  creationTime: string;
  creatorUserId?: number | null;
}

export interface ICreateLiveStreamInput {
  name: string;
  location: string;
  sourceName: string;
  sourceUrl: string;
  camKey: string;
  thumbnailUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface IUpdateLiveStreamInput extends ICreateLiveStreamInput {
  id: string;
}

export interface ILiveStreamStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  items: ILiveStream[];
  selected?: ILiveStream;
  totalCount: number;
}

export interface ILiveStreamActionContext {
  fetchAll: (params?: Record<string, unknown>) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (input: ICreateLiveStreamInput) => Promise<void>;
  update: (id: string, input: IUpdateLiveStreamInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const INITIAL_STATE: ILiveStreamStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  items: [],
  totalCount: 0,
};

export const LiveStreamStateContext = createContext<ILiveStreamStateContext>(INITIAL_STATE);
export const LiveStreamActionContext = createContext<ILiveStreamActionContext>({
  fetchAll: async () => {},
  fetchById: async () => {},
  create: async () => {},
  update: async () => {},
  remove: async () => {},
});
