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

    @media (max-width: 991px) {
      padding: 12px 0 16px;
    }
  `,

  logoutButton: css`
    width: 100%;
    height: auto;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 18px 12px 24px !important;
    border-radius: ${token.borderRadiusLG}px;
    border: none;
    background:
      linear-gradient(135deg, rgba(185, 28, 28, 0.18), rgba(239, 68, 68, 0.08)),
      rgba(255, 255, 255, 0.03) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    color: #e41d1d !important;
    transition:
      transform ${token.motionDurationMid},
      border-color ${token.motionDurationMid},
      background ${token.motionDurationMid},
      box-shadow ${token.motionDurationMid};

    .ant-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-inline-end: 0;
      line-height: 1;
    }

    .ant-btn-icon + span {
      display: inline-flex;
      align-items: center;
    }

    @media (max-width: 991px) {
      min-height: 44px;
      gap: 10px;
      padding: 8px 12px 8px 18px !important;
      border-radius: ${token.borderRadius}px;
    }

    &:hover,
    &:focus-visible {
      color: #fff !important;
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

    @media (max-width: 991px) {
      width: 48px;
      min-height: 40px;
      margin: 0 auto;
      padding: 0 !important;
      border-radius: ${token.borderRadius}px;
      background: transparent !important;
      box-shadow: none;

      &:hover,
      &:focus-visible {
        background: rgba(37, 99, 235, 0.18) !important;
        transform: none;
        box-shadow: none;
      }
    }
  `,

  logoutIcon: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 18px;
    line-height: 1;
    color: #fca5a5;
    flex-shrink: 0;
    padding: 0;
    border-radius: ${token.borderRadius}px;
    background: rgba(127, 29, 29, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

    @media (max-width: 991px) {
      width: 14px;
      height: 14px;
      font-size: 16px;
      color: rgba(255, 0, 0, 0.65);
      background: transparent;
      box-shadow: none;
    }
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

    @media (max-width: 991px) {
      font-size: 13px;
      line-height: 1.2;
    }
  `,

  logoutHint: css`
    font-size: 11px;
    color: rgba(252, 165, 165, 0.82);
    white-space: nowrap;

    @media (max-width: 991px) {
      display: none;
    }
  `,
}));
