import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    '@media (max-width: 1024px)': {
      flexDirection: 'column' as const,
      minHeight: '100dvh',
    },
  },
  leftPanel: {
    flex: '0 0 45%',
    background: 'linear-gradient(160deg, #0a0f1e 0%, #0d2149 45%, #0a0f1e 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '64px 48px',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden',
    '@media (max-width: 1024px)': {
      display: 'none',
    },
  },
  leftPanelInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  brandIcon: {
    fontSize: 56,
    color: '#60a5fa',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  brandTagline: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 1.7,
    maxWidth: 280,
  },
  divider: {
    width: 40,
    height: 3,
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    borderRadius: 2,
    margin: '28px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    alignSelf: 'stretch',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#cbd5e1',
    fontSize: 14,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#60a5fa',
    fontSize: 15,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    background: '#f8fafc',
    '@media (max-width: 768px)': {
      alignItems: 'flex-start',
      padding: '32px 20px',
    },
    '@media (max-width: 480px)': {
      padding: '20px 14px 28px',
    },
  },
  formWrapper: {
    width: '100%',
    maxWidth: 420,
    '@media (max-width: 480px)': {
      maxWidth: '100%',
    },
  },
  formHeader: {
    marginBottom: 32,
    '@media (max-width: 480px)': {
      marginBottom: 24,
    },
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    '@media (max-width: 480px)': {
      fontSize: 24,
    },
  },
  formSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
  },
  submitButton: {
    width: '100%',
    height: 44,
    fontSize: 15,
    fontWeight: 600,
    '@media (max-width: 480px)': {
      height: 46,
    },
  },
  signupRow: {
    textAlign: 'center' as const,
    marginTop: 24,
    fontSize: 14,
    color: '#64748b',
  },
  mobileBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    '@media (min-width: 1025px)': {
      display: 'none',
    },
    '@media (max-width: 480px)': {
      marginBottom: 24,
    },
  },
  mobileBrandTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    '@media (max-width: 480px)': {
      fontSize: 20,
    },
  },
  passwordLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  mobileBrandIcon: {
    fontSize: 28,
    color: token.colorPrimary,
    flexShrink: 0,
  },
  inputPrefixIcon: {
    color: token.colorTextTertiary,
  },
  forgotPasswordLink: {
    fontSize: 13,
  },
}));
