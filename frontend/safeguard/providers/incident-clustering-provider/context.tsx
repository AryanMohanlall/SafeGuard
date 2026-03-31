"use client";

import { createContext } from "react";

export interface IIncidentGraphNode {
  id: string;
  label: string;
  subtitle?: string;
  type: "cluster" | "suggestion" | "incident" | "case";
  groupId: string;
  clusterId?: number | null;
  suggestionId?: string | null;
  incidentId?: string | null;
  caseId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  confidenceScore?: number | null;
  status?: string | null;
}

export interface IIncidentGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  weight: number;
  groupId: string;
}

export interface ISuggestedIncidentCase {
  id: string;
  groupId: string;
  clusterId: number;
  suggestedTitle: string;
  dominantCategory: string;
  dominantObject: string;
  confidenceScore: number;
  timeSpanHours: number;
  maxDistanceKm: number;
  incidentIds: string[];
  existingCaseIds: string[];
  reasons: string[];
}

export interface IIncidentSuggestionGraph {
  generatedAt: string;
  incidentCount: number;
  clusterCount: number;
  suggestionCount: number;
  nodes: IIncidentGraphNode[];
  edges: IIncidentGraphEdge[];
  suggestions: ISuggestedIncidentCase[];
}

export interface IIncidentClusteringTrainingResult {
  recordsRead: number;
  clusterCount: number;
  csvPath: string;
  modelPath: string;
}

export interface IGetIncidentSuggestionGraphInput {
  retrainModel?: boolean;
  csvPath?: string | null;
  modelPath?: string | null;
  clusterCount?: number | null;
  maxIncidentCount?: number | null;
}

export interface IRegenerateIncidentClusteringInput {
  csvPath?: string | null;
  modelPath?: string | null;
  clusterCount?: number | null;
}

export interface IIncidentClusteringStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isRegenerating: boolean;
  graph?: IIncidentSuggestionGraph;
  trainingResult?: IIncidentClusteringTrainingResult;
}

export interface IIncidentClusteringActionContext {
  fetchGraph: (params?: IGetIncidentSuggestionGraphInput) => Promise<void>;
  regenerateModel: (input?: IRegenerateIncidentClusteringInput) => Promise<void>;
}

export const INITIAL_STATE: IIncidentClusteringStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  isRegenerating: false,
};

export const IncidentClusteringStateContext = createContext<IIncidentClusteringStateContext>(INITIAL_STATE);
export const IncidentClusteringActionContext = createContext<IIncidentClusteringActionContext>({
  fetchGraph: async () => {},
  regenerateModel: async () => {},
});
