"use client";
import { createContext } from "react";

export interface IncidentAlert {
  id: string;
  creatorUserId?: number | null;
  title: string;
  location: string;
  occurredAt: string;
  anonymous: boolean;
}

export interface IAlertStateContext {
  isPending: boolean;
  isConnected: boolean;
  alerts: IncidentAlert[];
  pending: IncidentAlert | null;
}

export interface IAlertActionContext {
  dismiss: () => void;
}

export const INITIAL_STATE: IAlertStateContext = {
  isPending: false,
  isConnected: false,
  alerts: [],
  pending: null,
};

export const AlertStateContext = createContext<IAlertStateContext>(INITIAL_STATE);
export const AlertActionContext = createContext<IAlertActionContext>({
  dismiss: () => {},
});
