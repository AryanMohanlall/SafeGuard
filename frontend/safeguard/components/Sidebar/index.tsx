'use client';

import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Tooltip } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  WarningOutlined,
  FolderOutlined,
  BellOutlined,
  SafetyOutlined,
  LogoutOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useAuthAction } from '@/providers/auth-provider';
import type { CSSProperties } from 'react';

const { Sider } = Layout;

const NAV_BG = '#0a0f1e';
const NAV_ACTIVE = '#2563eb';
const NAV_HOVER = 'rgba(37, 99, 235, 0.18)';

const navItems = [
  { key: '/dashboard',  icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/incidents',  icon: <WarningOutlined />,   label: 'Incidents' },
  { key: '/cases',      icon: <FolderOutlined />,    label: 'Cases'     },
  { key: '/alerts',     icon: <BellOutlined />,      label: 'Alerts'    },
  { key: '/report',   icon: <FileAddOutlined />,   label: 'Report'  },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthAction();

  const selectedKey =
    navItems.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: NAV_BG,
            darkSubMenuItemBg: '#0d1a3a',
            darkItemSelectedBg: NAV_ACTIVE,
            darkItemHoverBg: NAV_HOVER,
          },
          Layout: {
            siderBg: NAV_BG,
            triggerBg: '#0d1a3a',
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        width={220}
        style={{ background: NAV_BG, display: 'flex', flexDirection: 'column' }}
      >
        {/* Brand */}
        <div style={brandWrap(collapsed)}>
          <SafetyOutlined style={{ fontSize: 22, color: '#60a5fa', flexShrink: 0 }} />
          {!collapsed && (
            <span style={brandText}>SafeGuard</span>
          )}
        </div>

        {/* Nav */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => router.push(key)}
          style={{ background: NAV_BG, borderRight: 0, marginTop: 4, flex: 1 }}
        />

        {/* Logout */}
        <div style={logoutWrap(collapsed)} onClick={handleLogout}>
          <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
            <LogoutOutlined style={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
          </Tooltip>
          {!collapsed && <span style={logoutText}>Logout</span>}
        </div>
      </Sider>
    </ConfigProvider>
  );
};

const brandWrap = (collapsed: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: 10,
  padding: collapsed ? '20px 0' : '20px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  marginBottom: 4,
  userSelect: 'none',
});

const brandText: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: '#fff',
  letterSpacing: '-0.3px',
  whiteSpace: 'nowrap',
};

const logoutWrap = (collapsed: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start',
  gap: 10,
  padding: collapsed ? '16px 0' : '16px 24px',
  borderTop: '1px solid rgba(255,255,255,0.07)',
  cursor: 'pointer',
  transition: 'background 0.2s',
});

const logoutText: CSSProperties = {
  fontSize: 14,
  color: '#94a3b8',
  whiteSpace: 'nowrap',
};
