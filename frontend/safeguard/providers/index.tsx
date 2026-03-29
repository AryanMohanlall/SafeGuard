'use client';

import { ConfigProvider } from 'antd';
import { AuthProvider } from './auth-provider';
import { IncidentProvider } from './incidents-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2563eb',
            borderRadius: 8,
            fontFamily: 'inherit',
          },
        }}
      >
        <IncidentProvider>
          {children}
        </IncidentProvider>
      </ConfigProvider>
    </AuthProvider>
  );
};
