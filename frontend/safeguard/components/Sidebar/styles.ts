import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  sider: css`
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 52%, rgba(17, 24, 39, 0.99) 100%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 12px 0 30px rgba(2, 6, 23, 0.42);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  `,

  brandWrap: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    margin: 0 12px 4px;
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
    color: #ffffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(2, 6, 23, 0.35);
  `,

  menu: css`
    background: transparent;
    border-right: 0;
    margin: 8px 12px 0;
    padding: 8px;
    border-radius: ${token.borderRadius}px;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
    background: rgba(15, 23, 42, 0.28);
    flex: 1;
    overflow: hidden;

    && :global(.ant-menu-item) {
      margin-inline: 0;
      margin-block: 6px;
      width: 100%;
      max-width: 100%;
      border-radius: ${token.borderRadiusLG}px;
      min-height: 46px;
      color: #ffffff !important;
      background: rgba(56, 55, 55, 0.93);
      box-shadow:
        inset 0 0 0 1px rgba(148, 163, 184, 0.08),
        0 1px 2px rgba(216, 216, 216, 0.84);
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    && :global(.ant-menu-item .ant-menu-title-content) {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff !important;
      opacity: 1;
      text-shadow:
        0 1px 2px rgba(2, 6, 23, 0.7),
        0 0 10px rgba(255, 255, 255, 0.22);
    }

    && :global(.ant-menu-item .ant-menu-title-content),
    && :global(.ant-menu-item .ant-menu-title-content > span),
    && :global(.ant-menu-item .ant-menu-title-content > a),
    && :global(.ant-menu-item .ant-menu-title-content *) {
      color: #ffffff !important;
      opacity: 1 !important;
      font-weight: 800 !important;
    }

    && :global(.ant-menu-item .ant-menu-item-icon) {
      color: #93c5fd !important;
      font-size: 18px;
      width: 30px;
      height: 30px;
      min-width: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.22);
      box-shadow:
        inset 0 1px 0 rgba(191, 219, 254, 0.22),
        0 1px 2px rgba(2, 6, 23, 0.3);
      transition: color ${token.motionDurationMid};
    }

    && :global(.ant-menu-item .ant-menu-item-icon .anticon),
    && :global(.ant-menu-item .ant-menu-item-icon svg) {
      color: #93c5fd !important;
      fill: currentColor;
      stroke: currentColor;
    }

    && :global(.ant-menu-item:hover) {
      background: rgba(71, 85, 105, 0.88) !important;
      color: #ffffff !important;
      box-shadow:
        inset 0 0 0 1px rgba(191, 219, 254, 0.14),
        0 8px 18px rgba(2, 6, 23, 0.24);
    }

    && :global(.ant-menu-item:hover .ant-menu-title-content) {
      color: #ffffff !important;
      text-shadow:
        0 1px 2px rgba(2, 6, 23, 0.75),
        0 0 12px rgba(255, 255, 255, 0.26);
    }

    && :global(.ant-menu-item:hover .ant-menu-item-icon) {
      color: #bfdbfe !important;
      background: rgba(37, 99, 235, 0.34);
    }

    && :global(.ant-menu-item:hover .ant-menu-item-icon .anticon),
    && :global(.ant-menu-item:hover .ant-menu-item-icon svg) {
      color: #bfdbfe !important;
      fill: currentColor;
      stroke: currentColor;
    }

    && :global(.ant-menu-item-selected) {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.46) 0%, rgba(30, 64, 175, 0.58) 100%) !important;
      color: #f8fafc !important;
      box-shadow:
        inset 0 1px 0 rgba(219, 234, 254, 0.22),
        inset 0 0 0 1px rgba(147, 197, 253, 0.18),
        0 10px 20px rgba(2, 6, 23, 0.34);
    }

    && :global(.ant-menu-item-selected .ant-menu-title-content) {
      color: #ffffff !important;
      text-shadow:
        0 1px 2px rgba(2, 6, 23, 0.75),
        0 0 12px rgba(255, 255, 255, 0.28);
    }

    && :global(.ant-menu-inline-collapsed .ant-menu-item .ant-menu-title-content) {
      color: #ffffff !important;
    }

    && :global(.ant-menu-item-selected .ant-menu-item-icon) {
      color: #dbeafe !important;
      background: rgba(59, 130, 246, 0.36);
    }

    && :global(.ant-menu-item-selected .ant-menu-item-icon .anticon),
    && :global(.ant-menu-item-selected .ant-menu-item-icon svg) {
      color: #dbeafe !important;
      fill: currentColor;
      stroke: currentColor;
    }
  `,

  logoutSection: css`
    padding: 18px 16px 20px;
    border-top: 1px solid rgba(148, 163, 184, 0.16);

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
      linear-gradient(135deg, rgba(153, 27, 27, 0.52), rgba(69, 10, 10, 0.82)),
      rgba(30, 41, 59, 0.84) !important;
    box-shadow:
      0 8px 18px rgba(2, 6, 23, 0.28),
      inset 0 1px 0 rgba(248, 113, 113, 0.14),
      inset 0 0 0 1px rgba(252, 165, 165, 0.12);
    color: #fecaca !important;
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
      color: #fee2e2 !important;
      background:
        linear-gradient(135deg, rgba(153, 27, 27, 0.68), rgba(69, 10, 10, 0.88)),
        rgba(30, 41, 59, 0.9) !important;
      transform: translateY(-1px);
      box-shadow:
        0 12px 24px rgba(2, 6, 23, 0.32),
        inset 0 1px 0 rgba(252, 165, 165, 0.14);
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
    color: #ffffff;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(2, 6, 23, 0.3);

    @media (max-width: 991px) {
      font-size: 13px;
      line-height: 1.2;
    }
  `,

  logoutHint: css`
    font-size: 11px;
    color: rgba(248, 250, 252, 0.58);
    white-space: nowrap;

    @media (max-width: 991px) {
      display: none;
    }
  `,
}));
