import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  sider: css`
    background:
      linear-gradient(180deg, rgba(222, 230, 239, 0.88) 0%, rgba(196, 207, 220, 0.92) 100%);
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(100, 116, 139, 0.22);
    box-shadow: 12px 0 30px rgba(15, 23, 42, 0.14);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  `,

  brandWrap: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border-bottom: 1px solid rgba(100, 116, 139, 0.18);
    margin: 0 12px 4px;
    user-select: none;
  `,

  brandWrapCollapsed: css`
    justify-content: center;
    padding: 20px 0;
  `,

  brandIcon: css`
    font-size: 22px;
    color: ${token.colorPrimary};
    flex-shrink: 0;
  `,

  brandText: css`
    font-size: 18px;
    font-weight: 700;
    font-family: var(--font-display), sans-serif;
    color: ${token.colorTextHeading};
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
  `,

  menu: css`
    background: transparent;
    border-right: 0;
    margin: 8px 12px 0;
    flex: 1;

    :global(.ant-menu-item) {
      margin-inline: 0;
      margin-block: 6px;
      width: 100%;
      border-radius: ${token.borderRadiusLG}px;
      min-height: 46px;
      color: #1e293b;
      display: flex;
      align-items: center;
    }

    :global(.ant-menu-item .ant-menu-title-content) {
      font-weight: 600;
      color: inherit;
    }

    :global(.ant-menu-item .ant-menu-item-icon) {
      color: #2563eb !important;
      font-size: 18px;
      width: 30px;
      height: 30px;
      min-width: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.14);
      box-shadow:
        inset 0 1px 0 rgba(147, 197, 253, 0.55),
        0 1px 2px rgba(15, 23, 42, 0.08);
      transition: color ${token.motionDurationMid};
    }

    :global(.ant-menu-item .ant-menu-item-icon .anticon),
    :global(.ant-menu-item .ant-menu-item-icon svg) {
      color: #2563eb !important;
      fill: currentColor;
      stroke: currentColor;
    }

    :global(.ant-menu-item:hover) {
      background: rgba(226, 232, 240, 0.86) !important;
      color: #020617 !important;
    }

    :global(.ant-menu-item:hover .ant-menu-item-icon) {
      color: #1d4ed8 !important;
      background: rgba(191, 219, 254, 0.95);
    }

    :global(.ant-menu-item:hover .ant-menu-item-icon .anticon),
    :global(.ant-menu-item:hover .ant-menu-item-icon svg) {
      color: #1d4ed8 !important;
      fill: currentColor;
      stroke: currentColor;
    }

    :global(.ant-menu-item-selected) {
      background: linear-gradient(135deg, rgba(207, 219, 234, 0.96) 0%, rgba(228, 236, 245, 0.96) 100%) !important;
      color: #020617 !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        0 10px 20px rgba(71, 85, 105, 0.14);
    }

    :global(.ant-menu-item-selected .ant-menu-item-icon) {
      color: #1d4ed8 !important;
      background: rgba(219, 234, 254, 0.96);
    }

    :global(.ant-menu-item-selected .ant-menu-item-icon .anticon),
    :global(.ant-menu-item-selected .ant-menu-item-icon svg) {
      color: #1d4ed8 !important;
      fill: currentColor;
      stroke: currentColor;
    }
  `,

  logoutSection: css`
    padding: 18px 16px 20px;
    border-top: 1px solid rgba(100, 116, 139, 0.18);

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
      linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(255, 255, 255, 0.64)),
      rgba(255, 255, 255, 0.6) !important;
    box-shadow:
      0 8px 18px rgba(148, 163, 184, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    color: #b91c1c !important;
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
      color: #991b1b !important;
      background:
        linear-gradient(135deg, rgba(254, 226, 226, 0.92), rgba(255, 255, 255, 0.95)),
        #ffffff !important;
      transform: translateY(-1px);
      box-shadow:
        0 12px 24px rgba(148, 163, 184, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.85);
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
        background: ${token.colorPrimaryBg} !important;
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
    color: #ef4444;
    flex-shrink: 0;
    padding: 0;
    border-radius: ${token.borderRadius}px;
    background: rgba(254, 226, 226, 0.95);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);

    @media (max-width: 991px) {
      width: 14px;
      height: 14px;
      font-size: 16px;
      color: rgba(220, 38, 38, 0.75);
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
    color: ${token.colorTextHeading};
    white-space: nowrap;

    @media (max-width: 991px) {
      font-size: 13px;
      line-height: 1.2;
    }
  `,

  logoutHint: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    white-space: nowrap;

    @media (max-width: 991px) {
      display: none;
    }
  `,
}));
