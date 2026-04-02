import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token, css }) => ({
  container: css`
    min-height: 100dvh;
    display: flex;

    @media (max-width: 1024px) {
      flex-direction: column;
    }
  `,

  leftPanel: css`
    flex: 0 0 45%;
    background:
      radial-gradient(circle at top, rgba(147, 197, 253, 0.22), transparent 26%),
      linear-gradient(160deg, #eaf3fb 0%, #d6e5f3 48%, #eff6ff 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 64px 48px;
    color: ${token.colorTextHeading};
    position: relative;
    overflow: hidden;

    @media (max-width: 1024px) {
      display: none;
    }
  `,

  leftPanelInner: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 340px;
  `,

  brandIcon: css`
    font-size: 56px;
    color: ${token.colorPrimary};
    margin-bottom: ${token.marginLG}px;
  `,

  brandTitle: css`
    font-size: 36px;
    font-weight: 700;
    font-family: var(--font-display), sans-serif;
    color: ${token.colorTextHeading};
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  `,

  brandTagline: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
    text-align: center;
    margin-top: ${token.marginSM}px;
    line-height: 1.7;
    max-width: 280px;
  `,

  divider: css`
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #60a5fa, #cbd5e1);
    border-radius: 2px;
    margin: 28px 0;
  `,

  statGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${token.margin}px;
    align-self: stretch;
    margin-top: ${token.marginXS}px;
  `,

  statCard: css`
    background: rgba(255, 255, 255, 0.76);
    border-radius: ${token.borderRadiusLG}px;
    padding: ${token.padding}px ${token.paddingMD}px;
    border: 1px solid rgba(148, 163, 184, 0.14);
  `,

  statValue: css`
    font-size: 24px;
    font-weight: 700;
    color: ${token.colorPrimary};
    line-height: 1.2;
  `,

  statLabel: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    margin-top: ${token.marginXXS}px;
  `,

  rightPanel: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 248, 252, 0.96));
    min-height: 100dvh;
    overflow-y: auto;

    @media (max-width: 768px) {
      padding: ${token.paddingLG}px ${token.paddingMD}px;
    }

    @media (max-width: 480px) {
      padding: ${token.paddingMD}px ${token.padding}px;
      align-items: flex-start;
    }
  `,

  formWrapper: css`
    width: 100%;
    max-width: 420px;
    padding: ${token.paddingXS}px 0;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG + 4}px;
    box-shadow: ${token.boxShadowSecondary};
    padding: ${token.paddingXL}px;

    @media (max-width: 480px) {
      max-width: 100%;
      padding: ${token.paddingLG}px;
    }
  `,

  formHeader: css`
    margin-bottom: 28px;

    @media (max-width: 480px) {
      margin-bottom: ${token.marginLG}px;
    }
  `,

  formTitle: css`
    font-size: 28px;
    font-weight: 700;
    color: ${token.colorTextHeading};
    margin: 0;

    @media (max-width: 480px) {
      font-size: 24px;
    }
  `,

  formSubtitle: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorTextSecondary};
    margin-top: ${token.marginXS}px;
    margin-bottom: 0;
  `,

  nameGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 ${token.margin}px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `,

  radioGroup: css`
    width: 100%;
  `,

  radioButton: css`
    width: 50%;
    text-align: center;
  `,

  formItemLast: css`
    margin-bottom: 0;
  `,

  submitButton: css`
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 600;

    @media (max-width: 480px) {
      height: 46px;
    }
  `,

  signinRow: css`
    text-align: center;
    margin-top: ${token.marginMD}px;
    font-size: ${token.fontSize}px;
  `,

  mobileBrand: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
    margin-bottom: ${token.marginXL}px;

    @media (min-width: 1025px) {
      display: none;
    }

    @media (max-width: 480px) {
      margin-bottom: ${token.marginLG}px;
    }
  `,

  mobileBrandIcon: css`
    font-size: 28px;
    color: ${token.colorPrimary};
    flex-shrink: 0;
  `,

  mobileBrandTitle: css`
    font-size: 22px;
    font-weight: 700;
    font-family: var(--font-display), sans-serif;
    color: ${token.colorTextHeading};
    letter-spacing: 1.5px;
    text-transform: uppercase;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  `,

  inputPrefixIcon: css`
    color: ${token.colorTextTertiary};
  `,
}));
