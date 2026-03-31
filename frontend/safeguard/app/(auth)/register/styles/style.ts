import { createStyles } from 'antd-style';

export const useStyles = createStyles(() => ({
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
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    alignSelf: 'stretch',
    marginTop: 8,
  },
  statCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#60a5fa',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
    background: '#f8fafc',
    overflowY: 'auto' as const,
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
    padding: '8px 0',
    '@media (max-width: 480px)': {
      maxWidth: '100%',
      padding: 0,
    },
  },
  formHeader: {
    marginBottom: 28,
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
  signinRow: {
    textAlign: 'center' as const,
    marginTop: 20,
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
  nameGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 16px',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
}));
