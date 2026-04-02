import { createAction } from "redux-actions";
import type { IAlertStateContext, IncidentAlert } from "./context";

export enum AlertStateEnums {
  CONNECT_PENDING = "ALERT_CONNECT_PENDING",
  CONNECT_SUCCESS = "ALERT_CONNECT_SUCCESS",
  CONNECT_ERROR   = "ALERT_CONNECT_ERROR",
  NEW_ALERT       = "ALERT_NEW_ALERT",
  DISMISS         = "ALERT_DISMISS",
}

export const connectPending = createAction<IAlertStateContext>(
  AlertStateEnums.CONNECT_PENDING,
  () => ({ isPending: true, isConnected: false })
);

export const connectSuccess = createAction<IAlertStateContext>(
  AlertStateEnums.CONNECT_SUCCESS,
  () => ({ isPending: false, isConnected: true })
);

export const connectError = createAction<IAlertStateContext>(
  AlertStateEnums.CONNECT_ERROR,
  () => ({ isPending: false, isConnected: false })
);

export const newAlert = createAction<IAlertStateContext, IncidentAlert>(
  AlertStateEnums.NEW_ALERT,
  (alert: IncidentAlert) => ({ isPending: false, pending: alert })
);

export const dismiss = createAction<IAlertStateContext>(
  AlertStateEnums.DISMISS,
  () => ({ pending: null })
);
