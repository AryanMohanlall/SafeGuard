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
import { useAuthAction } from '@/providers/auth-provider';
import { useStyles } from './styles';

const { Sider } = Layout;

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
        items={navItems}
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
                <span className={styles.logoutHint}>End secure session</span>
              </span>
            )}
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};
