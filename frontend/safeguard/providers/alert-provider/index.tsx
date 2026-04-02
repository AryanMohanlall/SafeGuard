"use client";

import { useContext, useEffect, useReducer, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getAxiosInstance } from "@/utils/axiosInstance";
import { AlertReducer } from "./reducer";
import {
  INITIAL_STATE,
  AlertStateContext,
  AlertActionContext,
  type IncidentAlert,
} from "./context";
import {
  connectPending,
  connectSuccess,
  connectError,
  newAlert,
  dismiss,
} from "./actions";

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(AlertReducer, INITIAL_STATE);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:44311";
    const token = getAxiosInstance().defaults.headers.common["Authorization"]
      ?.toString()
      .replace(/^Bearer\s+/i, "");

    dispatch(connectPending());

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/alertHub`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connection.on("NewIncident", (alert: IncidentAlert) => {
      dispatch(newAlert(alert));
    });

    const startPromise = connection
      .start()
      .then(() => dispatch(connectSuccess()))
      .catch(() => dispatch(connectError()));

    connectionRef.current = connection;

    return () => {
      void startPromise.finally(() => {
        void connection.stop().catch(() => {
          // Ignore shutdown races during React dev remounts.
        });
      });
    };
  }, []);

  const handleDismiss = () => dispatch(dismiss());

  return (
    <AlertStateContext.Provider value={state}>
      <AlertActionContext.Provider value={{ dismiss: handleDismiss }}>
        {children}
      </AlertActionContext.Provider>
    </AlertStateContext.Provider>
  );
};

export const useAlerts = () => {
  const state = useContext(AlertStateContext);
  const actions = useContext(AlertActionContext);
  if (!state) throw new Error("useAlerts must be used within AlertProvider");
  return { ...state, ...actions };
};
