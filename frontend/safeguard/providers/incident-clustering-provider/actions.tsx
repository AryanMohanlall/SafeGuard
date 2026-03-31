import { createAction } from "redux-actions";
import type {
  IIncidentClusteringStateContext,
  IIncidentClusteringTrainingResult,
} from "./context";

export enum IncidentClusteringActionEnums {
  FETCH_GRAPH_PENDING = "INCIDENT_CLUSTERING_FETCH_GRAPH_PENDING",
  FETCH_GRAPH_SUCCESS = "INCIDENT_CLUSTERING_FETCH_GRAPH_SUCCESS",
  FETCH_GRAPH_ERROR = "INCIDENT_CLUSTERING_FETCH_GRAPH_ERROR",
  REGENERATE_PENDING = "INCIDENT_CLUSTERING_REGENERATE_PENDING",
  REGENERATE_SUCCESS = "INCIDENT_CLUSTERING_REGENERATE_SUCCESS",
  REGENERATE_ERROR = "INCIDENT_CLUSTERING_REGENERATE_ERROR",
}

export const fetchGraphPending = createAction<Partial<IIncidentClusteringStateContext>>(
  IncidentClusteringActionEnums.FETCH_GRAPH_PENDING,
  () => ({ isPending: true, isSuccess: false, isError: false }),
);

export const fetchGraphSuccess = createAction<
  Partial<IIncidentClusteringStateContext>,
  { graph: IIncidentClusteringStateContext["graph"] }
>(
  IncidentClusteringActionEnums.FETCH_GRAPH_SUCCESS,
  ({ graph }) => ({ isPending: false, isSuccess: true, isError: false, graph }),
);

export const fetchGraphError = createAction<Partial<IIncidentClusteringStateContext>>(
  IncidentClusteringActionEnums.FETCH_GRAPH_ERROR,
  () => ({ isPending: false, isSuccess: false, isError: true }),
);

export const regeneratePending = createAction<Partial<IIncidentClusteringStateContext>>(
  IncidentClusteringActionEnums.REGENERATE_PENDING,
  () => ({ isRegenerating: true, isError: false }),
);

export const regenerateSuccess = createAction<
  Partial<IIncidentClusteringStateContext>,
  { trainingResult: IIncidentClusteringTrainingResult }
>(
  IncidentClusteringActionEnums.REGENERATE_SUCCESS,
  ({ trainingResult }) => ({ isRegenerating: false, trainingResult }),
);

export const regenerateError = createAction<Partial<IIncidentClusteringStateContext>>(
  IncidentClusteringActionEnums.REGENERATE_ERROR,
  () => ({ isRegenerating: false, isError: true }),
);
