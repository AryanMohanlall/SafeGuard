import { createAction } from "redux-actions";
import type { IAlertStateContext, IncidentAlert } from "./context";

type AlertStatePatch = Partial<IAlertStateContext>;

export enum AlertStateEnums {
  CONNECT_PENDING = "ALERT_CONNECT_PENDING",
  CONNECT_SUCCESS = "ALERT_CONNECT_SUCCESS",
  CONNECT_ERROR   = "ALERT_CONNECT_ERROR",
  NEW_ALERT       = "ALERT_NEW_ALERT",
  DISMISS         = "ALERT_DISMISS",
}

export const connectPending = createAction<AlertStatePatch>(
  AlertStateEnums.CONNECT_PENDING,
  () => ({ isPending: true, isConnected: false })
);

export const connectSuccess = createAction<AlertStatePatch>(
  AlertStateEnums.CONNECT_SUCCESS,
  () => ({ isPending: false, isConnected: true })
);

export const connectError = createAction<AlertStatePatch>(
  AlertStateEnums.CONNECT_ERROR,
  () => ({ isPending: false, isConnected: false })
);

export const newAlert = createAction<AlertStatePatch, IncidentAlert>(
  AlertStateEnums.NEW_ALERT,
  (alert: IncidentAlert) => ({ isPending: false, pending: alert })
);

export const dismiss = createAction<AlertStatePatch>(
  AlertStateEnums.DISMISS,
  () => ({ pending: null })
);
