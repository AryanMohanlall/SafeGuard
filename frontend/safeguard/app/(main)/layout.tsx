'use client';

import { Layout } from 'antd';
import { Sidebar } from '@/components/Sidebar';
import { withAuth } from '@/hoc/withAuth';
import { AlertModal } from '@/components/AlertModal';
import { useStyles } from './styles/style';

const { Content } = Layout;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { styles } = useStyles();

  return (
    <>
      <Layout className={styles.outerLayout}>
        <Sidebar />
        <Layout className={styles.innerLayout}>
          <Content className={styles.content}>
            {children}
          </Content>
        </Layout>
      </Layout>
      <AlertModal />
    </>
  );
};

export default withAuth(MainLayout);
