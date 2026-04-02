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
      radial-gradient(circle at top, rgba(96, 165, 250, 0.16), transparent 20%),
      radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.42), transparent 34%),
      linear-gradient(165deg, #64748b 0%, #334155 46%, #94a3b8 100%);
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
    color: #ffffff;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  `,

  brandTagline: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.82);
    text-align: center;
    margin-top: ${token.marginSM}px;
    line-height: 1.7;
    max-width: 280px;
  `,

  divider: css`
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #475569);
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
    background: rgba(255, 255, 255, 0.88);
    border-radius: ${token.borderRadiusLG}px;
    padding: ${token.padding}px ${token.paddingMD}px;
    border: 1px solid rgba(100, 116, 139, 0.18);
  `,

  statValue: css`
    font-size: 24px;
    font-weight: 700;
    color: ${token.colorPrimary};
    line-height: 1.2;
  `,

  statLabel: css`
    font-size: ${token.fontSizeSM}px;
    color: rgba(20, 19, 19, 0.8);
    margin-top: ${token.marginXXS}px;
  `,

  rightPanel: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    background:
      radial-gradient(circle at top right, rgba(71, 85, 105, 0.18), transparent 24%),
      linear-gradient(180deg, rgba(174, 186, 199, 0.98), rgba(148, 163, 184, 0.98));
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
    background: rgba(248, 250, 252, 0.97);
    border: 1px solid rgba(71, 85, 105, 0.26);
    border-radius: ${token.borderRadiusLG + 4}px;
    box-shadow:
      0 22px 50px rgba(15, 23, 42, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
    color: #475569;
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
    color: #475569;
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
