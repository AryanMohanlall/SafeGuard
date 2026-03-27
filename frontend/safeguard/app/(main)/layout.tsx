'use client';

import { Layout } from 'antd';
import { Sidebar } from '@/components/Sidebar';
import { withAuth } from '@/hoc/withAuth';

const { Content } = Layout;

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ background: '#f1f5f9' }}>
        <Content style={{ padding: 32, overflowY: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default withAuth(MainLayout);
