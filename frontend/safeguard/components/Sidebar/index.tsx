'use client';

import { useState } from 'react';
import { ConfigProvider, Layout, Menu, Tooltip } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  ApartmentOutlined,
  BellOutlined,
  DashboardOutlined,
  FileAddOutlined,
  FolderOutlined,
  LogoutOutlined,
  SafetyOutlined,
  VideoCameraOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAuthAction } from '@/providers/auth-provider';
import { useStyles } from './styles';

const { Sider } = Layout;

const NAV_BG = '#0a0f1e';
const NAV_ACTIVE = '#2563eb';
const NAV_HOVER = 'rgba(37, 99, 235, 0.18)';

const navItems = [
  { key: '/dashboard',      icon: <DashboardOutlined />,  label: 'Dashboard'      },
  { key: '/incidents',      icon: <WarningOutlined />,    label: 'Incidents'      },
  { key: '/cases',          icon: <FolderOutlined />,     label: 'Cases'          },
  { key: '/incident-graph', icon: <ApartmentOutlined />,  label: 'Incident Graph' },
  { key: '/alerts',         icon: <BellOutlined />,       label: 'Alerts'         },
  { key: '/report',         icon: <FileAddOutlined />,    label: 'Report'         },
  { key: '/monitor',        icon: <VideoCameraOutlined />, label: 'Monitor'       },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthAction();
  const { styles, cx } = useStyles();

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
        className={styles.sider}
      >
        {/* Brand */}
        <div className={cx(styles.brandWrap, collapsed && styles.brandWrapCollapsed)}>
          <SafetyOutlined className={styles.brandIcon} />
          {!collapsed && <span className={styles.brandText}>SafeGuard</span>}
        </div>

        {/* Nav */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => router.push(key)}
          className={styles.menu}
        />

        {/* Logout */}
        <div
          className={cx(styles.logoutWrap, collapsed && styles.logoutWrapCollapsed)}
          onClick={handleLogout}
        >
          <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
            <LogoutOutlined className={styles.logoutIcon} />
          </Tooltip>
          {!collapsed && <span className={styles.logoutText}>Logout</span>}
        </div>
      </Sider>
    </ConfigProvider>
  );
};
