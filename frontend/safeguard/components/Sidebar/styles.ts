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

  logoutSection: css`
    padding: 18px 16px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  `,

  logoutButton: css`
    width: 100%;
    height: auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 14px !important;
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid rgba(248, 113, 113, 0.22);
    background:
      linear-gradient(135deg, rgba(185, 28, 28, 0.18), rgba(239, 68, 68, 0.08)),
      rgba(255, 255, 255, 0.03) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    color: #fff !important;
    transition:
      transform ${token.motionDurationMid},
      border-color ${token.motionDurationMid},
      background ${token.motionDurationMid},
      box-shadow ${token.motionDurationMid};

    &:hover,
    &:focus-visible {
      color: #fff !important;
      border-color: rgba(248, 113, 113, 0.45);
      background:
        linear-gradient(135deg, rgba(185, 28, 28, 0.28), rgba(239, 68, 68, 0.16)),
        rgba(255, 255, 255, 0.05) !important;
      transform: translateY(-1px);
      box-shadow:
        0 10px 24px rgba(15, 23, 42, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
  `,

  logoutButtonCollapsed: css`
    justify-content: center;
    padding-inline: 0 !important;
  `,

  logoutIcon: css`
    font-size: 18px;
    color: #fca5a5;
    flex-shrink: 0;
    padding: 10px;
    border-radius: ${token.borderRadius}px;
    background: rgba(127, 29, 29, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  `,

  logoutTextWrap: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  `,

  logoutText: css`
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
  `,

  logoutHint: css`
    font-size: 11px;
    color: rgba(252, 165, 165, 0.82);
    white-space: nowrap;
  `,
}));
