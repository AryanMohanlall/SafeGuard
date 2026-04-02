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
import { useStyles } from './styles/style';

const { Content } = Layout;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { styles } = useStyles();

  return (
    <AlertProvider>
      <IncidentClusteringProvider>
        <IncidentProvider>
          <EvidenceProvider>
            <CaseProvider>
              <DispatchProvider>
                <Layout className={styles.outerLayout}>
                  <Sidebar />
                  <Layout className={styles.innerLayout}>
                    <Content className={styles.content}>
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
};

export default withAuth(MainLayout);
