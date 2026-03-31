import { handleActions } from "redux-actions";
import { INITIAL_STATE, type IIncidentClusteringStateContext } from "./context";
import { IncidentClusteringActionEnums } from "./actions";

export const IncidentClusteringReducer = handleActions<
  IIncidentClusteringStateContext,
  Partial<IIncidentClusteringStateContext>
>(
  {
    [IncidentClusteringActionEnums.FETCH_GRAPH_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentClusteringActionEnums.FETCH_GRAPH_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentClusteringActionEnums.FETCH_GRAPH_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentClusteringActionEnums.REGENERATE_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentClusteringActionEnums.REGENERATE_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [IncidentClusteringActionEnums.REGENERATE_ERROR]: (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE,
);
