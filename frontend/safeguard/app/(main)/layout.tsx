'use client';

import { Layout } from 'antd';
import { Sidebar } from '@/components/Sidebar';
import { withAuth } from '@/hoc/withAuth';
import { AlertProvider } from '@/providers/alert-provider';
import { CaseProvider } from '@/providers/cases-provider';
import { DispatchProvider } from '@/providers/dispatch-provider';
import { EvidenceProvider } from '@/providers/evidence-provider';
import { IncidentClusteringProvider } from '@/providers/incident-clustering-provider';
import { IncidentProvider } from '@/providers/incidents-provider';
import { AlertModal } from '@/components/AlertModal';

const { Content } = Layout;

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <IncidentClusteringProvider>
        <IncidentProvider>
          <EvidenceProvider>
            <CaseProvider>
              <DispatchProvider>
                <Layout style={{ minHeight: '100vh' }}>
                  <Sidebar />
                  <Layout style={{ background: '#f1f5f9' }}>
                    <Content style={{ overflowY: 'auto' }} className="p-4 sm:p-6 lg:p-8">
                      {children}
                    </Content>
                  </Layout>
                </Layout>
                <AlertModal />
              </DispatchProvider>
            </CaseProvider>
          </EvidenceProvider>
        </IncidentProvider>
      </IncidentClusteringProvider>
    </AlertProvider>
  );
}

export default withAuth(MainLayout);
