'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { getAxiosInstance } from '@/utils/axiosInstance';

export interface IncidentAlert {
  id: string;
  creatorUserId?: number | null;
  title: string;
  location: string;
  occurredAt: string;
  anonymous: boolean;
}

interface AlertContextValue {
  alerts: IncidentAlert[];
  pending: IncidentAlert | null;
  dismiss: () => void;
}

const AlertContext = createContext<AlertContextValue>({
  alerts: [],
  pending: null,
  dismiss: () => {},
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<IncidentAlert[]>([]);
  const [pending, setPending] = useState<IncidentAlert | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:44311';
    const token = getAxiosInstance().defaults.headers.common['Authorization']
      ?.toString()
      .replace(/^Bearer\s+/i, '');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/alertHub`, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('NewIncident', (alert: IncidentAlert) => {
      setAlerts(prev => [alert, ...prev]);
      setPending(alert);
    });

    connection.start().catch(() => {
      // Hub unreachable in dev without backend — fail silently
    });

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  const dismiss = () => setPending(null);

  return (
    <AlertContext.Provider value={{ alerts, pending, dismiss }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
