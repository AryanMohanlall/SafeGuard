'use client';

import { useState } from 'react';
import { Button, Layout, Menu, Tooltip } from 'antd';
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
import { useAuthAction, useAuthState } from '@/providers/auth-provider';
import { hasOfficialRole } from '@/hoc/withAuth';
import { useStyles } from './styles';

const { Sider } = Layout;

const navItems = [
  { key: '/dashboard',      icon: <DashboardOutlined />,  label: 'Dashboard'      },
  { key: '/incidents',      icon: <WarningOutlined />,    label: 'Incidents'      },
  { key: '/cases',          icon: <FolderOutlined />,     label: 'Cases', officialOnly: true },
  { key: '/incident-graph', icon: <ApartmentOutlined />,  label: 'Incident Graph', officialOnly: true },
  { key: '/alerts',         icon: <BellOutlined />,       label: 'Alerts', officialOnly: true },
  { key: '/report',         icon: <FileAddOutlined />,    label: 'Report'         },
  { key: '/monitor',        icon: <VideoCameraOutlined />, label: 'Monitor', officialOnly: true },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthAction();
  const { user } = useAuthState();
  const { styles, cx } = useStyles();
  const visibleNavItems = navItems.filter((item) => !item.officialOnly || hasOfficialRole(user?.roleNames));
  const menuItems = visibleNavItems.map(({ officialOnly: _officialOnly, ...item }) => item);

  const selectedKey =
    visibleNavItems.find((item) => pathname.startsWith(item.key))?.key ?? '/dashboard';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      onBreakpoint={(broken) => setCollapsed(broken)}
      width={220}
      className={styles.sider}
    >
      <div className={cx(styles.brandWrap, collapsed && styles.brandWrapCollapsed)}>
        <SafetyOutlined className={styles.brandIcon} />
        {!collapsed && <span className={styles.brandText}>SafeGuard</span>}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        className={styles.menu}
      />

      <div className={styles.logoutSection}>
        <Tooltip title={collapsed ? 'Log out' : ''} placement="right">
          <Button
            type="text"
            icon={<LogoutOutlined className={styles.logoutIcon} />}
            onClick={handleLogout}
            className={cx(styles.logoutButton, collapsed && styles.logoutButtonCollapsed)}
          >
            {!collapsed && (
              <span className={styles.logoutTextWrap}>
                <span className={styles.logoutText}>Log Out</span>
              </span>
            )}
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};
