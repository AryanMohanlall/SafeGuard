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
    background: linear-gradient(160deg, #0a0f1e 0%, #0d2149 45%, #0a0f1e 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 64px 48px;
    color: #fff;
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
    color: #60a5fa;
    margin-bottom: ${token.marginLG}px;
  `,

  brandTitle: css`
    font-size: 36px;
    font-weight: 700;
    font-family: var(--font-display), sans-serif;
    color: #fff;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  `,

  brandTagline: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    margin-top: ${token.marginSM}px;
    line-height: 1.7;
    max-width: 280px;
  `,

  divider: css`
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 2px;
    margin: 28px 0;
  `,

  featureList: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginMD}px;
    align-self: stretch;
  `,

  featureItem: css`
    display: flex;
    align-items: center;
    gap: ${token.marginSM}px;
    color: rgba(255, 255, 255, 0.75);
    font-size: ${token.fontSize}px;
  `,

  featureIconWrap: css`
    width: 32px;
    height: 32px;
    border-radius: ${token.borderRadiusLG}px;
    background: rgba(59, 130, 246, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #60a5fa;
    font-size: 15px;
  `,

  rightPanel: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    background: ${token.colorBgLayout};
    min-height: 100dvh;

    @media (max-width: 1024px) {
      min-height: 100dvh;
    }

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

    @media (max-width: 480px) {
      max-width: 100%;
    }
  `,

  formHeader: css`
    margin-bottom: ${token.marginXL}px;

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

  signupRow: css`
    text-align: center;
    margin-top: ${token.marginLG}px;
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

  forgotPasswordLink: css`
    font-size: 13px;
  `,
}));
