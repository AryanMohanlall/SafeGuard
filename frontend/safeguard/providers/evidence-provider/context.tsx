'use client';
import { createContext } from 'react';

export interface IEvidence {
  id: string;
  caseId: string;
  incidentId?: string | null;
  type: string;
  status: string;
  fileName: string;
  contentType?: string | null;
  fileSizeBytes: number;
  storageUrl?: string | null;
  fileHash?: string | null;
  ipfsCid?: string | null;
  blockchainTx?: string | null;
  detectedObjects?: string | null;
  aiCaption?: string | null;
  aiSuggestedSeverity?: string | null;
  manipulationScore?: number | null;
  isFlagged?: boolean | null;
  manipulationStatus?: string | null;
  collectedAt: string;
  uploadedAt: string;
  verifiedAt?: string | null;
  notes?: string | null;
  creationTime: string;
  creatorUserId?: number | null;
}

export interface IEvidenceStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  items: IEvidence[];
  selected?: IEvidence;
  totalCount: number;
}

export interface IEvidenceActionContext {
  fetchAll: (params?: Record<string, unknown>) => void;
  fetchById: (id: string) => void;
}

export const INITIAL_STATE: IEvidenceStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  items: [],
  totalCount: 0,
};

export const EvidenceStateContext = createContext<IEvidenceStateContext>(INITIAL_STATE);
export const EvidenceActionContext = createContext<IEvidenceActionContext>({
  fetchAll: () => {},
  fetchById: () => {},
});
