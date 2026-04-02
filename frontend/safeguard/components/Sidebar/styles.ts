import { createStyles } from 'antd-style';

const NAV_BG = '#0a0f1e';

export const useStyles = createStyles(({ token, css }) => ({
  sider: css`
    background: ${NAV_BG};
    display: flex;
    flex-direction: column;
  `,

  brandWrap: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    margin-bottom: 4px;
    user-select: none;
  `,

  brandWrapCollapsed: css`
    justify-content: center;
    padding: 20px 0;
  `,

  brandIcon: css`
    font-size: 22px;
    color: #60a5fa;
    flex-shrink: 0;
  `,

  brandText: css`
    font-size: 18px;
    font-weight: 700;
    font-family: var(--font-display), sans-serif;
    color: #fff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
  `,

  menu: css`
    background: ${NAV_BG};
    border-right: 0;
    margin-top: 4px;
    flex: 1;
  `,

  logoutWrap: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    cursor: pointer;
    transition: background ${token.motionDurationSlow};
  `,

  logoutWrapCollapsed: css`
    justify-content: center;
    padding: 16px 0;
  `,

  logoutIcon: css`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.55);
    flex-shrink: 0;
  `,

  logoutText: css`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    white-space: nowrap;
  `,
}));
