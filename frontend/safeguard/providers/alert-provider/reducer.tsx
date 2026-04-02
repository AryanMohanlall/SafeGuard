import { handleActions } from "redux-actions";
import { INITIAL_STATE, type IAlertStateContext, type IncidentAlert } from "./context";
import { AlertStateEnums } from "./actions";

export const AlertReducer = handleActions<IAlertStateContext, IAlertStateContext>(
  {
    [AlertStateEnums.CONNECT_PENDING]: (state, { payload }) => ({ ...state, ...payload }),
    [AlertStateEnums.CONNECT_SUCCESS]: (state, { payload }) => ({ ...state, ...payload }),
    [AlertStateEnums.CONNECT_ERROR]:   (state, { payload }) => ({ ...state, ...payload }),
    [AlertStateEnums.NEW_ALERT]: (state, { payload }) => ({
      ...state,
      ...payload,
      alerts: [payload.pending as IncidentAlert, ...state.alerts],
    }),
    [AlertStateEnums.DISMISS]: (state, { payload }) => ({ ...state, ...payload }),
  },
  INITIAL_STATE
);
